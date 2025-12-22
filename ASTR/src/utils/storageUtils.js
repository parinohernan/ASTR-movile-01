import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../database/database';

const STORAGE_KEY = '@MyApp:PreventaData';
const PREVENTAS_ENVIADAS_KEY = '@MyApp:PreventasEnviadas';
const ARTICULOS_FRECUENTES_KEY = '@MyApp:ArticulosFrecuentes';
const ARTICULOS_FRECUENTES_GLOBALES_KEY = '@MyApp:ArticulosFrecuentesGlobales';
const MAX_PREVENTAS_ENVIADAS = 50;
const MAX_ARTICULOS_FRECUENTES = 100;
const MAX_ARTICULOS_FRECUENTES_POR_CLIENTE = 50;

// Guardar una preventa en AsyncStorage
const guardarPreventaEnStorage = async (preventa) => {
    // console.log("grabando guardarPreventaEnStorage ",preventa);
    try {
      if (preventa !== null && preventa !== undefined ) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preventa));
        // console.log('Preventa guardada con éxito en Storage');
      } else {
        console.error('Error: El valor de la preventa es null o undefined');
      }
    } catch (error) {
      console.error('Error al guardar la preventa en AsyncStorage:', error);
      throw error;
    }
  };
  
//trae una preventa de la BDD al localstorege
const guardarPreventaEditando = async (preventa) => {
  console.log("Guardando preventa editando:", preventa.length, "items");
  
  // Procesar cada item para asegurar que tenga todos los campos necesarios
  const preventaMapeada = preventa.map(item => ({
    ...item,
    // Asegurar que descuento y precioLista estén presentes
    descuento: item.descuento || 0,
    precioLista: item.precioLista || 0,
    // Asegurar que uniqueId esté presente
    uniqueId: item.uniqueId || `${item.id}_${Date.now()}_${Math.random()}`
  }));
  
  console.log("Preventa mapeada:", preventaMapeada);
  guardarPreventaEnStorage(preventaMapeada);
};

// Obtener la preventa almacenada en AsyncStorage
const obtenerPreventaDeStorage = async () => {
    try {
        const preventaString = await AsyncStorage.getItem(STORAGE_KEY);
        // Verificar si preventaString es null o undefined antes de intentar el parseo JSON
        if (preventaString !== null && preventaString !== undefined) {
            // console.log("JSON.parse(preventaString)",JSON.parse(preventaString));
            return JSON.parse(preventaString);
        } else {
            // crea una preventa limpia
            console.log("era una limpia");
            guardarPreventaEnStorage([])
            return [];
        }
    } catch (error) {
        console.error('Error al obtener la preventa desde AsyncStorage:', error);
        throw error;
    }
};

const preventaDesdeBDD = async (numeroPreventa) => {/*busca la prevenda en BDD sqlite y la carga */
  /* con el numero de preventa la traigo de la BDD local sqlyte y la coloco en locasStorege   */
  console.log("STORAGE83 numero preven", numeroPreventa);
  try {
    const rows = db.getAllSync(
      'SELECT preventaItem.articulo AS id, articulos.descripcion AS descripcion, articulos.iva AS iva, articulos.lista1 AS lista1, articulos.lista2 AS lista2, articulos.lista3 AS lista3, articulos.lista4 AS lista4, articulos.lista5 AS lista5, articulos.precioCosto AS precioCosto, articulos.existencia AS existencia, preventaItem.cantidad AS cantidad, preventaItem.idPreventa AS preventaNumero, preventaItem.importe AS precioTotal, preventaItem.porcentajeBonificacion AS descuento, preventaItem.precioLista AS precioLista FROM preventaItem INNER JOIN articulos ON preventaItem.articulo = articulos.id WHERE preventaItem.idPreventa = ?',
      [numeroPreventa]
    );
    
    const preventaItemsBDD = rows.map((item) => {
      // Agregar uniqueId para mantener consistencia
      item.uniqueId = `${item.id}_${Date.now()}_${Math.random()}`;
      return item;
    });
    
    console.log('Items de preventa cargados desde la base de datos:', preventaItemsBDD);
    guardarPreventaEditando(preventaItemsBDD);
    return preventaItemsBDD;
  } catch (error) {
    console.error('Error en preventaDesdeBDD:', error);
    throw error;
  }
};
  
 // Calcula el total
const calcularTotal = async () => {
    // console.log("calculo total preventa ")
    let total = 0;
    try {
      const preventa = await obtenerPreventaDeStorage();
    //   console.log("calculo precioFinal preventa ",preventa);
      // Verifica si la preventa es un array antes de contar los elementos
     for (let i = 0; i < preventa.length; i++) {
         const e = preventa[i]; 
         console.log("item ", e.precioTotal);
        total= total + e.precioTotal;
     }
    return total;
      
    } catch (error) {
      console.error('Error al calcular total de la preventa:', error);
      throw error;
    }
  }; 

// Limpiar los datos de preventa almacenados en AsyncStorage
const limpiarPreventaDeStorage = async () => {
    // console.log("STR44 limpiando preventa Storage");
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar los datos de preventa en AsyncStorage:', error);
    throw error;
  }
};

// solo para eliminar un item
const eliminarItemEnPreventaEnStorage = async (uniqueId) => {
  const preventa = await obtenerPreventaDeStorage();
  // console.log("PREVENTA cant items",preventa.length);
  if (preventa.length > 1){
    console.log("ELIMINAR de la preventa actual", uniqueId, preventa);
    guardarPreventaEnStorage(preventa.filter(item => item.uniqueId !== uniqueId));
  } else {
    // Eliminar todo el valor del storage
    await limpiarPreventaDeStorage();
    // await AsyncStorage.removeItem(STORAGE_KEY);
    await guardarPreventaEnStorage([]);
    console.log("resultado tiene que ser vacio ",await AsyncStorage.getItem(STORAGE_KEY));
  }
}

// Guardar preventa enviada como respaldo
const guardarPreventaEnviada = async (preventa, resultadoEnvio = null) => {
  try {
    const preventasEnviadas = await obtenerPreventasEnviadas();
    
    // Determinar el estado basado en el resultado
    let estado = 'enviada';
    let detallesEnvio = {
      exitoso: true,
      tipo: 'nuevo',
      mensaje: 'Preventa enviada correctamente',
      timestamp: new Date().toISOString()
    };
    
    // Si hay resultado del envío, usar esa información
    if (resultadoEnvio) {
      if (resultadoEnvio.tipo === 'duplicada') {
        estado = 'duplicada';
        detallesEnvio = {
          exitoso: true,
          tipo: 'duplicada',
          mensaje: 'Preventa ya existía en el servidor',
          timestamp: new Date().toISOString(),
          codigoServidor: resultadoEnvio.codigoServidor || 'N/A',
          respuestaServidor: resultadoEnvio.respuestaServidor || 'N/A'
        };
      } else if (resultadoEnvio.tipo === 'error') {
        estado = 'error';
        detallesEnvio = {
          exitoso: false,
          tipo: 'error',
          mensaje: resultadoEnvio.mensaje || 'Error al enviar preventa',
          timestamp: new Date().toISOString(),
          codigoServidor: resultadoEnvio.codigoServidor || 'N/A',
          respuestaServidor: resultadoEnvio.respuestaServidor || 'N/A'
        };
      } else {
        // Envío exitoso
        detallesEnvio = {
          exitoso: true,
          tipo: 'nuevo',
          mensaje: 'Preventa enviada correctamente',
          timestamp: new Date().toISOString(),
          codigoServidor: resultadoEnvio.codigoServidor || 'N/A',
          respuestaServidor: resultadoEnvio.respuestaServidor || 'N/A'
        };
      }
    }
    
    // Agregar timestamp y estado de envío
    const preventaConMetadata = {
      ...preventa,
      timestamp: new Date().toISOString(),
      estado: estado,
      id: Date.now().toString(),
      resultadoEnvio: detallesEnvio
    };
    
    // Agregar al inicio del array
    preventasEnviadas.unshift(preventaConMetadata);
    
    // Mantener solo los últimos MAX_PREVENTAS_ENVIADAS
    if (preventasEnviadas.length > MAX_PREVENTAS_ENVIADAS) {
      preventasEnviadas.splice(MAX_PREVENTAS_ENVIADAS);
    }
    
    await AsyncStorage.setItem(PREVENTAS_ENVIADAS_KEY, JSON.stringify(preventasEnviadas));
    console.log(`Preventa guardada como respaldo (${estado})`);
  } catch (error) {
    console.error('Error al guardar preventa enviada:', error);
  }
};

// Obtener preventas enviadas
const obtenerPreventasEnviadas = async () => {
  try {
    const preventasString = await AsyncStorage.getItem(PREVENTAS_ENVIADAS_KEY);
    if (preventasString !== null && preventasString !== undefined) {
      return JSON.parse(preventasString);
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error al obtener preventas enviadas:', error);
    return [];
  }
};

// Limpiar preventas enviadas
const limpiarPreventasEnviadas = async () => {
  try {
    await AsyncStorage.removeItem(PREVENTAS_ENVIADAS_KEY);
    console.log('Preventas enviadas eliminadas');
  } catch (error) {
    console.error('Error al limpiar preventas enviadas:', error);
  }
};

// Exportar preventa como texto
const exportarPreventaComoTexto = (preventa) => {
  return JSON.stringify(preventa, null, 2);
};

// ===== FUNCIONES PARA ARTÍCULOS FRECUENTES =====

// Obtener clave para artículos frecuentes de un cliente específico
const obtenerClaveFrecuentesCliente = (clienteId) => {
  return `${ARTICULOS_FRECUENTES_KEY}_${clienteId}`;
};

// Guardar artículos frecuentes de un cliente en AsyncStorage
const guardarArticulosFrecuentesCliente = async (clienteId, articulosFrecuentes) => {
  try {
    const clave = obtenerClaveFrecuentesCliente(clienteId);
    await AsyncStorage.setItem(clave, JSON.stringify(articulosFrecuentes));
    console.log(`Artículos frecuentes del cliente ${clienteId} guardados exitosamente`);
  } catch (error) {
    console.error('Error al guardar artículos frecuentes del cliente:', error);
  }
};

// Obtener artículos frecuentes de un cliente desde AsyncStorage
const obtenerArticulosFrecuentesCliente = async (clienteId) => {
  try {
    const clave = obtenerClaveFrecuentesCliente(clienteId);
    const articulosString = await AsyncStorage.getItem(clave);
    if (articulosString !== null && articulosString !== undefined) {
      return JSON.parse(articulosString);
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error al obtener artículos frecuentes del cliente:', error);
    return [];
  }
};

// Guardar artículos frecuentes globales en AsyncStorage
const guardarArticulosFrecuentesGlobales = async (articulosFrecuentes) => {
  try {
    await AsyncStorage.setItem(ARTICULOS_FRECUENTES_GLOBALES_KEY, JSON.stringify(articulosFrecuentes));
    console.log('Artículos frecuentes globales guardados exitosamente');
  } catch (error) {
    console.error('Error al guardar artículos frecuentes globales:', error);
  }
};

// Obtener artículos frecuentes globales desde AsyncStorage
const obtenerArticulosFrecuentesGlobales = async () => {
  try {
    const articulosString = await AsyncStorage.getItem(ARTICULOS_FRECUENTES_GLOBALES_KEY);
    if (articulosString !== null && articulosString !== undefined) {
      return JSON.parse(articulosString);
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error al obtener artículos frecuentes globales:', error);
    return [];
  }
};

// Agregar un artículo a la lista de frecuentes de un cliente
const agregarArticuloFrecuenteCliente = async (clienteId, articulo) => {
  try {
    const articulosFrecuentes = await obtenerArticulosFrecuentesCliente(clienteId);
    
    // Verificar si el artículo ya existe
    const existe = articulosFrecuentes.find(item => item.id === articulo.id);
    if (existe) {
      // Si existe, actualizar la frecuencia y último uso
      existe.frecuencia = (existe.frecuencia || 0) + 1;
      existe.ultimoUso = new Date().toISOString();
    } else {
      // Si no existe, agregarlo
      const nuevoArticulo = {
        ...articulo,
        frecuencia: 1,
        fechaAgregado: new Date().toISOString(),
        ultimoUso: new Date().toISOString()
      };
      articulosFrecuentes.push(nuevoArticulo);
    }
    
    // Ordenar por frecuencia (más frecuentes primero) y luego por último uso
    articulosFrecuentes.sort((a, b) => {
      if (b.frecuencia !== a.frecuencia) {
        return b.frecuencia - a.frecuencia;
      }
      return new Date(b.ultimoUso) - new Date(a.ultimoUso);
    });
    
    // Mantener solo los últimos MAX_ARTICULOS_FRECUENTES_POR_CLIENTE
    if (articulosFrecuentes.length > MAX_ARTICULOS_FRECUENTES_POR_CLIENTE) {
      articulosFrecuentes.splice(MAX_ARTICULOS_FRECUENTES_POR_CLIENTE);
    }
    
    await guardarArticulosFrecuentesCliente(clienteId, articulosFrecuentes);
    console.log(`Artículo frecuente agregado/actualizado para cliente ${clienteId}`);
  } catch (error) {
    console.error('Error al agregar artículo frecuente del cliente:', error);
  }
};

// Agregar un artículo a la lista de frecuentes globales
const agregarArticuloFrecuenteGlobal = async (articulo) => {
  try {
    const articulosFrecuentes = await obtenerArticulosFrecuentesGlobales();
    
    // Verificar si el artículo ya existe
    const existe = articulosFrecuentes.find(item => item.id === articulo.id);
    if (existe) {
      // Si existe, actualizar la frecuencia y último uso
      existe.frecuencia = (existe.frecuencia || 0) + 1;
      existe.ultimoUso = new Date().toISOString();
    } else {
      // Si no existe, agregarlo
      const nuevoArticulo = {
        ...articulo,
        frecuencia: 1,
        fechaAgregado: new Date().toISOString(),
        ultimoUso: new Date().toISOString()
      };
      articulosFrecuentes.push(nuevoArticulo);
    }
    
    // Ordenar por frecuencia (más frecuentes primero) y luego por último uso
    articulosFrecuentes.sort((a, b) => {
      if (b.frecuencia !== a.frecuencia) {
        return b.frecuencia - a.frecuencia;
      }
      return new Date(b.ultimoUso) - new Date(a.ultimoUso);
    });
    
    // Mantener solo los últimos MAX_ARTICULOS_FRECUENTES
    if (articulosFrecuentes.length > MAX_ARTICULOS_FRECUENTES) {
      articulosFrecuentes.splice(MAX_ARTICULOS_FRECUENTES);
    }
    
    await guardarArticulosFrecuentesGlobales(articulosFrecuentes);
    console.log('Artículo frecuente global agregado/actualizado');
  } catch (error) {
    console.error('Error al agregar artículo frecuente global:', error);
  }
};

// Función combinada que agrega tanto a frecuentes del cliente como globales
const agregarArticuloFrecuente = async (clienteId, articulo) => {
  if (clienteId) {
    await agregarArticuloFrecuenteCliente(clienteId, articulo);
  }
  await agregarArticuloFrecuenteGlobal(articulo);
};

// Obtener artículos frecuentes de un cliente ordenados por frecuencia
const obtenerArticulosFrecuentesClienteOrdenados = async (clienteId) => {
  try {
    const articulosFrecuentes = await obtenerArticulosFrecuentesCliente(clienteId);
    return articulosFrecuentes.sort((a, b) => {
      if (b.frecuencia !== a.frecuencia) {
        return b.frecuencia - a.frecuencia;
      }
      return new Date(b.ultimoUso) - new Date(a.ultimoUso);
    });
  } catch (error) {
    console.error('Error al obtener artículos frecuentes del cliente ordenados:', error);
    return [];
  }
};

// Obtener artículos frecuentes globales ordenados por frecuencia
const obtenerArticulosFrecuentesGlobalesOrdenados = async () => {
  try {
    const articulosFrecuentes = await obtenerArticulosFrecuentesGlobales();
    return articulosFrecuentes.sort((a, b) => {
      if (b.frecuencia !== a.frecuencia) {
        return b.frecuencia - a.frecuencia;
      }
      return new Date(b.ultimoUso) - new Date(a.ultimoUso);
    });
  } catch (error) {
    console.error('Error al obtener artículos frecuentes globales ordenados:', error);
    return [];
  }
};

// Obtener artículos frecuentes combinados (cliente + globales)
const obtenerArticulosFrecuentesCombinados = async (clienteId) => {
  try {
    const [frecuentesCliente, frecuentesGlobales] = await Promise.all([
      obtenerArticulosFrecuentesClienteOrdenados(clienteId),
      obtenerArticulosFrecuentesGlobalesOrdenados()
    ]);

    // Combinar y eliminar duplicados, priorizando los del cliente
    const combinados = [...frecuentesCliente];
    const codigosCliente = frecuentesCliente.map(art => art.id);
    
    frecuentesGlobales.forEach(global => {
      if (!codigosCliente.includes(global.id)) {
        combinados.push({
          ...global,
          esGlobal: true // Marcar como global para diferenciar
        });
      }
    });

    // Ordenar por frecuencia
    return combinados.sort((a, b) => {
      if (b.frecuencia !== a.frecuencia) {
        return b.frecuencia - a.frecuencia;
      }
      return new Date(b.ultimoUso) - new Date(a.ultimoUso);
    });
  } catch (error) {
    console.error('Error al obtener artículos frecuentes combinados:', error);
    return [];
  }
};

// Limpiar artículos frecuentes de un cliente específico
const limpiarArticulosFrecuentesCliente = async (clienteId) => {
  try {
    const clave = obtenerClaveFrecuentesCliente(clienteId);
    await AsyncStorage.removeItem(clave);
    console.log(`Artículos frecuentes del cliente ${clienteId} eliminados`);
  } catch (error) {
    console.error('Error al limpiar artículos frecuentes del cliente:', error);
  }
};

// Limpiar artículos frecuentes globales
const limpiarArticulosFrecuentesGlobales = async () => {
  try {
    await AsyncStorage.removeItem(ARTICULOS_FRECUENTES_GLOBALES_KEY);
    console.log('Artículos frecuentes globales eliminados');
  } catch (error) {
    console.error('Error al limpiar artículos frecuentes globales:', error);
  }
};

// Limpiar todos los artículos frecuentes (clientes + globales)
const limpiarTodosArticulosFrecuentes = async () => {
  try {
    // Obtener todas las claves de AsyncStorage
    const keys = await AsyncStorage.getAllKeys();
    const clavesFrecuentes = keys.filter(key => 
      key.startsWith(ARTICULOS_FRECUENTES_KEY) || 
      key === ARTICULOS_FRECUENTES_GLOBALES_KEY
    );
    
    await AsyncStorage.multiRemove(clavesFrecuentes);
    console.log('Todos los artículos frecuentes eliminados');
  } catch (error) {
    console.error('Error al limpiar todos los artículos frecuentes:', error);
  }
};

// Verificar si un artículo es frecuente para un cliente específico
const esArticuloFrecuenteCliente = async (clienteId, codigoArticulo) => {
  try {
    const articulosFrecuentes = await obtenerArticulosFrecuentesCliente(clienteId);
    return articulosFrecuentes.some(articulo => articulo.id === codigoArticulo);
  } catch (error) {
    console.error('Error al verificar si es artículo frecuente del cliente:', error);
    return false;
  }
};

// Verificar si un artículo es frecuente global
const esArticuloFrecuenteGlobal = async (codigoArticulo) => {
  try {
    const articulosFrecuentes = await obtenerArticulosFrecuentesGlobales();
    return articulosFrecuentes.some(articulo => articulo.id === codigoArticulo);
  } catch (error) {
    console.error('Error al verificar si es artículo frecuente global:', error);
    return false;
  }
};

// Obtener lista de todos los clientes que tienen artículos frecuentes
const obtenerClientesConFrecuentes = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const clavesFrecuentes = keys.filter(key => 
      key.startsWith(ARTICULOS_FRECUENTES_KEY) && 
      key !== ARTICULOS_FRECUENTES_GLOBALES_KEY
    );
    
    const clientes = [];
    for (const clave of clavesFrecuentes) {
      const clienteId = clave.replace(ARTICULOS_FRECUENTES_KEY + '_', '');
      const frecuentes = await obtenerArticulosFrecuentesCliente(clienteId);
      if (frecuentes.length > 0) {
        clientes.push({
          id: clienteId,
          cantidadFrecuentes: frecuentes.length
        });
      }
    }
    
    return clientes;
  } catch (error) {
    console.error('Error al obtener clientes con frecuentes:', error);
    return [];
  }
};

// Exportar todos los artículos frecuentes como texto plano
const exportarFrecuentesComoTexto = async () => {
  try {
    // Obtener frecuentes globales
    const frecuentesGlobales = await obtenerArticulosFrecuentesGlobales();
    
    // Obtener todos los clientes con frecuentes
    const clientesConFrecuentes = await obtenerClientesConFrecuentes();
    
    // Obtener frecuentes de cada cliente
    const frecuentesPorCliente = await Promise.all(
      clientesConFrecuentes.map(async (cliente) => {
        const frecuentes = await obtenerArticulosFrecuentesCliente(cliente.id);
        return {
          clienteId: cliente.id,
          frecuentes: frecuentes
        };
      })
    );
    
    // Crear objeto de exportación
    const datosExportacion = {
      fechaExportacion: new Date().toISOString(),
      version: '1.0',
      frecuentesGlobales: frecuentesGlobales,
      frecuentesPorCliente: frecuentesPorCliente,
      resumen: {
        totalGlobales: frecuentesGlobales.length,
        totalClientes: clientesConFrecuentes.length,
        totalArticulos: frecuentesGlobales.length + 
          frecuentesPorCliente.reduce((total, cliente) => total + cliente.frecuentes.length, 0)
      }
    };
    
    return JSON.stringify(datosExportacion, null, 2);
  } catch (error) {
    console.error('Error al exportar frecuentes:', error);
    throw error;
  }
};

// Restaurar artículos frecuentes desde texto plano
const restaurarFrecuentesDesdeTexto = async (textoJson) => {
  try {
    const datos = JSON.parse(textoJson);
    
    // Validar estructura básica
    if (!datos.frecuentesGlobales || !datos.frecuentesPorCliente) {
      throw new Error('Formato de datos inválido');
    }
    
    // Restaurar frecuentes globales
    if (datos.frecuentesGlobales.length > 0) {
      await guardarArticulosFrecuentesGlobales(datos.frecuentesGlobales);
    }
    
    // Restaurar frecuentes por cliente
    for (const clienteData of datos.frecuentesPorCliente) {
      if (clienteData.frecuentes && clienteData.frecuentes.length > 0) {
        await guardarArticulosFrecuentesCliente(clienteData.clienteId, clienteData.frecuentes);
      }
    }
    
    console.log('Frecuentes restaurados exitosamente');
    return {
      exitoso: true,
      mensaje: 'Frecuentes restaurados correctamente',
      resumen: datos.resumen
    };
  } catch (error) {
    console.error('Error al restaurar frecuentes:', error);
    throw error;
  }
};

// Obtener resumen de estadísticas de frecuentes
const obtenerResumenFrecuentes = async () => {
  try {
    const frecuentesGlobales = await obtenerArticulosFrecuentesGlobales();
    const clientesConFrecuentes = await obtenerClientesConFrecuentes();
    
    // Calcular total de artículos por cliente
    let totalArticulosClientes = 0;
    for (const cliente of clientesConFrecuentes) {
      totalArticulosClientes += cliente.cantidadFrecuentes;
    }
    
    return {
      globales: {
        cantidad: frecuentesGlobales.length,
        topArticulos: frecuentesGlobales.slice(0, 5).map(art => ({
          id: art.id,
          descripcion: art.descripcion || 'Sin descripción',
          frecuencia: art.frecuencia
        }))
      },
      clientes: {
        cantidad: clientesConFrecuentes.length,
        totalArticulos: totalArticulosClientes,
        topClientes: clientesConFrecuentes
          .sort((a, b) => b.cantidadFrecuentes - a.cantidadFrecuentes)
          .slice(0, 5)
      },
      total: {
        articulos: frecuentesGlobales.length + totalArticulosClientes,
        clientes: clientesConFrecuentes.length
      }
    };
  } catch (error) {
    console.error('Error al obtener resumen de frecuentes:', error);
    return {
      globales: { cantidad: 0, topArticulos: [] },
      clientes: { cantidad: 0, totalArticulos: 0, topClientes: [] },
      total: { articulos: 0, clientes: 0 }
    };
  }
};

export { 
  guardarPreventaEnStorage, 
  preventaDesdeBDD, 
  obtenerPreventaDeStorage, 
  limpiarPreventaDeStorage, 
  calcularTotal, 
  eliminarItemEnPreventaEnStorage, 
  guardarPreventaEnviada, 
  obtenerPreventasEnviadas, 
  limpiarPreventasEnviadas, 
  exportarPreventaComoTexto,
  // Funciones para artículos frecuentes por cliente
  guardarArticulosFrecuentesCliente,
  obtenerArticulosFrecuentesCliente,
  agregarArticuloFrecuenteCliente,
  obtenerArticulosFrecuentesClienteOrdenados,
  limpiarArticulosFrecuentesCliente,
  esArticuloFrecuenteCliente,
  // Funciones para artículos frecuentes globales
  guardarArticulosFrecuentesGlobales,
  obtenerArticulosFrecuentesGlobales,
  agregarArticuloFrecuenteGlobal,
  obtenerArticulosFrecuentesGlobalesOrdenados,
  limpiarArticulosFrecuentesGlobales,
  esArticuloFrecuenteGlobal,
  // Funciones combinadas
  agregarArticuloFrecuente,
  obtenerArticulosFrecuentesCombinados,
  limpiarTodosArticulosFrecuentes,
  obtenerClientesConFrecuentes,
  // Funciones de exportación e importación
  exportarFrecuentesComoTexto,
  restaurarFrecuentesDesdeTexto,
  obtenerResumenFrecuentes
};
