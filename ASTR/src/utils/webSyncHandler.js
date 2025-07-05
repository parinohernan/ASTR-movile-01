import { getConfiguracionDelStorage } from './storageConfigData';
import axios from 'axios';
import indexedDBHandler from './indexedDBHandler';
import { configuracionEndPoint } from './storageConfigData';

// Función específica para sincronización web
export const sincronizarDatosWeb = async (tipo, logs = [], setLogs = null) => {
  try {
    const handleLog = (mensaje) => {
      console.log(mensaje);
      if (setLogs) {
        setLogs(prev => [...prev, mensaje]);
      }
    };
    
    handleLog(`🌐 Iniciando sincronización web de ${tipo}...`);
    
    // Obtener configuración
    const config = await getConfiguracionDelStorage();
    const endpoint = config.endPoint || config.endpoint;
    
    if (!endpoint) {
      throw new Error('Endpoint no configurado. Configure el servidor primero.');
    }
    
    let url = '';
    switch (tipo) {
      case 'vendedores':
        url = `${endpoint}vendedores`;
        break;
      case 'clientes':
        url = `${endpoint}clientes`;
        break;
      case 'articulos':
        url = `${endpoint}articulos`;
        break;
      default:
        throw new Error('Tipo de datos no válido');
    }
    
    handleLog(`📡 Conectando a: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const datos = Array.isArray(data) ? data : (data.items || data.data || []);
    
    handleLog(`📦 Datos recibidos: ${datos.length} elementos`);
    
    // Guardar en localStorage
    let claveLocalStorage = '';
    switch (tipo) {
      case 'vendedores':
        claveLocalStorage = 'usuarios';
        break;
      case 'clientes':
        claveLocalStorage = 'clientes';
        break;
      case 'articulos':
        claveLocalStorage = 'articulos';
        break;
      default:
        claveLocalStorage = tipo;
    }
    
    localStorage.setItem(claveLocalStorage, JSON.stringify(datos));
    handleLog(`💾 Datos guardados en localStorage: ${claveLocalStorage}`);
    
    handleLog(`🎉 Sincronización web completada: ${datos.length} ${tipo} cargados`);
    return datos.length;
    
  } catch (error) {
    console.error(`Error en sincronización web de ${tipo}:`, error);
    const mensajeError = error.message || 'Error desconocido';
    if (setLogs) {
      setLogs(prev => [...prev, `❌ Error: ${mensajeError}`]);
    }
    throw error;
  }
};

// Función para sincronizar solo vendedores
export const sincronizarVendedoresWeb = async (logs = [], setLogs = null) => {
  return await sincronizarDatosWeb('vendedores', logs, setLogs);
};

// Función para sincronizar solo clientes
export const sincronizarClientesWeb = async (logs = [], setLogs = null) => {
  return await sincronizarDatosWeb('clientes', logs, setLogs);
};

// Función para sincronizar solo artículos
export const sincronizarArticulosWeb = async (logs = [], setLogs = null) => {
  return await sincronizarDatosWeb('articulos', logs, setLogs);
};

// Función para sincronización completa web
export const sincronizacionCompletaWeb = async (logs = [], setLogs = null) => {
  try {
    const handleLog = (mensaje) => {
      console.log(mensaje);
      if (setLogs) {
        setLogs(prev => [...prev, mensaje]);
      }
    };
    
    handleLog('🚀 Iniciando sincronización completa web...');
    
    // Sincronizar vendedores
    await sincronizarVendedoresWeb(logs, setLogs);
    
    // Sincronizar clientes
    await sincronizarClientesWeb(logs, setLogs);
    
    // Sincronizar artículos
    await sincronizarArticulosWeb(logs, setLogs);
    
    handleLog('✅ Sincronización completa web finalizada');
    
  } catch (error) {
    console.error('Error en sincronización completa web:', error);
    throw error;
  }
};

// Obtener el último número de documento desde el servidor
const obtenerUltimoNumeroDocumentoServidor = async () => {
  try {
    const endpoint = await configuracionEndPoint();
    const response = await axios.get(`${endpoint}preventas/ultimo-numero`, {
      timeout: 10000
    });
    
    if (response.status === 200 && response.data.numero) {
      console.log(`📊 Último número de documento en servidor: ${response.data.numero}`);
      return response.data.numero;
    }
    
    return 0;
  } catch (error) {
    console.log('⚠️ No se pudo obtener último número del servidor, usando 0 como inicio');
    return 0;
  }
};

// Inicializar número de documento desde el servidor
const inicializarNumeroDocumento = async () => {
  try {
    const ultimoNumeroLocal = parseInt(localStorage.getItem('ultimoNumeroDocumento') || '0');
    
    if (ultimoNumeroLocal === 0) {
      // Solo inicializar si no hay número local
      const ultimoNumeroServidor = await obtenerUltimoNumeroDocumentoServidor();
      localStorage.setItem('ultimoNumeroDocumento', ultimoNumeroServidor.toString());
      console.log(`📝 Número de documento inicializado desde servidor: ${ultimoNumeroServidor}`);
    } else {
      console.log(`📝 Usando número de documento local: ${ultimoNumeroLocal}`);
    }
  } catch (error) {
    console.error('❌ Error al inicializar número de documento:', error);
  }
};

// Verificar si una preventa ya existe en el servidor
const verificarPreventaExistente = async (numeroPreventa) => {
  try {
    const endpoint = await configuracionEndPoint();
    const response = await axios.get(`${endpoint}preventas/${numeroPreventa}`, {
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500; // Resuelve solo si el status es menor a 500
      }
    });
    
    // Si la respuesta es 200, la preventa existe
    // Si es 404, no existe
    return response.status === 200;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false; // La preventa no existe
    }
    console.error('Error al verificar preventa existente:', error);
    return false; // En caso de error, asumimos que no existe
  }
};

// Validar los datos de la preventa antes de enviar
const validarPreventaParaEnvio = (preventa) => {
  const errores = [];
  
  // Validar estructura básica
  if (!preventa) {
    errores.push("La preventa es null o undefined");
    return errores;
  }
  
  if (!preventa.items || preventa.items.length === 0) {
    errores.push("La preventa no tiene items");
    return errores;
  }
  
  // Validar campos obligatorios de la preventa
  if (!preventa.numero) {
    errores.push("Falta número de documento");
  }
  
  if (!preventa.cliente || !preventa.cliente.id) {
    errores.push("Falta código de cliente");
  }
  
  if (preventa.total === null || preventa.total === undefined || preventa.total < 0) {
    errores.push("Importe total inválido");
  }
  
  // Validar cada item
  preventa.items.forEach((item, index) => {
    if (!item.id || item.id === "000NaN" || item.id.trim() === "") {
      errores.push(`Item ${index + 1}: Código de artículo inválido`);
    }
    
    if (item.cantidad === null || item.cantidad === undefined || item.cantidad <= 0) {
      errores.push(`Item ${index + 1}: Cantidad debe ser mayor a 0`);
    }
    
    if (item.precio === null || item.precio === undefined || item.precio < 0) {
      errores.push(`Item ${index + 1}: Precio unitario no puede ser negativo`);
    }
    
    if (item.descuento === null || item.descuento === undefined || 
        item.descuento < 0 || item.descuento > 100) {
      errores.push(`Item ${index + 1}: Porcentaje de descuento debe estar entre 0 y 100`);
    }
    
    // Validar que si el descuento es 100%, el precio sea 0
    if (item.descuento === 100 && item.precio !== 0) {
      errores.push(`Item ${index + 1}: Si el descuento es 100%, el precio debe ser 0`);
    }
  });
  
  return errores;
};

// Obtener el siguiente número de documento
const obtenerSiguienteNumeroDocumento = async () => {
  try {
    // Obtener el último número usado desde localStorage
    const ultimoNumero = parseInt(localStorage.getItem('ultimoNumeroDocumento') || '0');
    const siguienteNumero = ultimoNumero + 1;
    
    // Guardar el nuevo número
    localStorage.setItem('ultimoNumeroDocumento', siguienteNumero.toString());
    
    console.log(`📝 Asignando número de documento: ${siguienteNumero}`);
    return siguienteNumero;
  } catch (error) {
    console.error('❌ Error al obtener número de documento:', error);
    // En caso de error, usar timestamp como fallback
    return Math.floor(Date.now() / 1000);
  }
};

// Convertir preventa de IndexedDB al formato esperado por el servidor
const convertirPreventaParaServidor = async (preventa) => {
  // Obtener configuración desde IndexedDB
  const configuracion = await indexedDBHandler.obtenerConfiguracion();
  console.log("📋 Configuración obtenida para preventa:", configuracion);
  
  // Obtener el vendedor seleccionado desde la configuración
  const vendedorSeleccionado = configuracion?.vendedorSeleccionado;
  console.log("👤 Vendedor seleccionado:", vendedorSeleccionado);
  
  // Obtener el siguiente número de documento
  const numeroDocumento = await obtenerSiguienteNumeroDocumento();
  
  // Calcular importe bonificado total
  const importeBonificado = preventa.items.reduce((total, item) => {
    const descuento = item.descuento || 0;
    const subtotal = (item.cantidad * item.precio) || 0;
    return total + (subtotal * descuento / 100);
  }, 0);
  
  // Obtener lista de precio del cliente
  const listaNumero = parseInt(preventa.cliente?.listaPrecio || '1');
  
  // Fecha actual para envío
  const fechaActual = new Date().toISOString();
  
  return {
    DocumentoTipo: 'PRV', // Cambiado de 'PREV' a 'PRV'
    DocumentoSucursal: (vendedorSeleccionado || '0001').padStart(4, '0'), // Usar vendedor seleccionado como sucursal, agregar 0 a la izquierda hasta 4 dígitos
    DocumentoNumero: numeroDocumento.toString(), // Convertido a string
    Fecha: preventa.fecha || fechaActual,
    FechaHoraEnvio: fechaActual, // Nuevo campo requerido
    ClienteCodigo: preventa.cliente.id,
    ClienteDescripcion: preventa.cliente.descripcion || '', // Nuevo campo requerido
    VendedorCodigo: vendedorSeleccionado || '0001', // Usar vendedor seleccionado
    ImporteTotal: preventa.total || 0,
    Cant_items: preventa.items?.length || 0,
    Observacion: preventa.nota || '',
    ListaNumero: listaNumero,
    ImporteBonificado: importeBonificado,
    PagoTipo: 'CC', // Nuevo campo requerido
    items: preventa.items.map(item => ({
      CodigoArticulo: item.id,
      Cantidad: item.cantidad || 0,
      PrecioUnitario: item.precio || 0,
      PrecioLista: item.precioLista || item.precio || 0, // Nuevo campo requerido
      PorcentajeBonificacion: item.descuento || 0,
      iva: item.iva || 21 // Cambiado a 21 por defecto
    }))
  };
};

// Enviar preventa al servidor
const enviarPreventaAlServidor = async (preventaConvertida) => {
  console.log("📤 Enviando preventa al servidor:", JSON.stringify(preventaConvertida, null, 2));
  
  try {
    const endpoint = await configuracionEndPoint();
    const response = await axios.post(endpoint + 'preventas', preventaConvertida, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("✅ Respuesta del servidor:", response.status, response.data);
    
    return {
      exitoso: true,
      tipo: 'nuevo',
      codigoServidor: response.status,
      respuestaServidor: response.data,
      mensaje: 'Preventa enviada correctamente'
    };
    
  } catch (error) {
    console.error('❌ Error al enviar preventa:', error);
    
    // Preparar información del resultado
    let resultadoEnvio = {
      exitoso: false,
      tipo: 'error',
      codigoServidor: error.response?.status || 'N/A',
      respuestaServidor: error.response?.data || 'N/A',
      mensaje: 'Error al enviar preventa'
    };
    
    // Manejar específicamente el error de PRIMARY KEY duplicado
    if (error.response && error.response.status === 500) {
      const errorData = error.response.data;
      
      // Verificar si es específicamente un error de clave primaria duplicada
      const isPrimaryKeyError = 
        (errorData && errorData.details && 
         (errorData.details.includes("PRIMARY must be unique") || 
          (Array.isArray(errorData.details) && errorData.details.some(detail => detail.includes("PRIMARY must be unique"))))) ||
        (errorData && errorData.error === "Validation error" && 
         errorData.details && Array.isArray(errorData.details) && 
         errorData.details.some(detail => detail.includes("PRIMARY must be unique")));
      
      if (isPrimaryKeyError) {
        console.log("✅ Preventa ya existe en el servidor, marcando como exitosa");
        
        resultadoEnvio = {
          exitoso: true,
          tipo: 'duplicada',
          codigoServidor: error.response.status,
          respuestaServidor: error.response.data,
          mensaje: 'Preventa ya existía en el servidor'
        };
        
        return resultadoEnvio;
      }
    }
    
    return resultadoEnvio;
  }
};

// Función principal de sincronización para web
const sincronizarPreventaWeb = async (preventaNumero) => {
  try {
    console.log("🔄 Iniciando sincronización web de preventa:", preventaNumero);
    
    // Verificar si la preventa ya existe en el servidor
    const yaExiste = await verificarPreventaExistente(preventaNumero);
    if (yaExiste) {
      console.log("✅ Preventa ya existe en el servidor, marcando como exitosa");
      
      // Obtener la preventa de IndexedDB
      const preventa = await indexedDBHandler.obtenerPreventa(preventaNumero);
      
      if (preventa) {
        // Actualizar estado a enviada
        const preventaActualizada = {
          ...preventa,
          estado: 'enviada'
        };
        
        await indexedDBHandler.guardarPreventa(preventaActualizada);
        console.log("✅ Estado de preventa actualizado a enviada");
      }
      
      return {
        exitoso: true,
        mensaje: 'Preventa ya existía en el servidor'
      };
    }
    
    // Obtener la preventa de IndexedDB
    const preventa = await indexedDBHandler.obtenerPreventa(preventaNumero);
    
    if (!preventa) {
      console.error("❌ No se encontró la preventa en IndexedDB:", preventaNumero);
      return {
        exitoso: false,
        mensaje: 'No se encontró la preventa'
      };
    }
    
    console.log("📋 Preventa encontrada en IndexedDB:", {
      numero: preventa.numero,
      cliente: preventa.cliente?.descripcion,
      items: preventa.items?.length || 0,
      total: preventa.total
    });
    
    // Validar la preventa antes de enviar
    const errores = validarPreventaParaEnvio(preventa);
    
    if (errores.length > 0) {
      console.error("❌ Errores de validación:", errores);
      return {
        exitoso: false,
        mensaje: `Errores de validación: ${errores.join(', ')}`
      };
    }
    
    // Convertir preventa al formato del servidor
    const preventaConvertida = await convertirPreventaParaServidor(preventa);
    
    // Enviar al servidor
    const resultado = await enviarPreventaAlServidor(preventaConvertida);
    
    if (resultado.exitoso) {
      console.log("✅ Preventa enviada exitosamente al servidor");
      
      // Actualizar estado en IndexedDB
      const preventaActualizada = {
        ...preventa,
        estado: 'enviada',
        resultadoEnvio: resultado
      };
      
      await indexedDBHandler.guardarPreventa(preventaActualizada);
      
      // Opcional: Eliminar de IndexedDB después de envío exitoso
      // await indexedDBHandler.eliminarPreventa(preventaNumero);
      
      return {
        exitoso: true,
        mensaje: resultado.mensaje
      };
    } else {
      console.log("❌ Error al enviar preventa al servidor");
      
      // Guardar información del error en IndexedDB
      const preventaConError = {
        ...preventa,
        estado: 'error',
        resultadoEnvio: resultado
      };
      
      await indexedDBHandler.guardarPreventa(preventaConError);
      
      return {
        exitoso: false,
        mensaje: resultado.mensaje
      };
    }
    
  } catch (error) {
    console.error('❌ Error en sincronizarPreventaWeb:', error);
    return {
      exitoso: false,
      mensaje: 'Error interno de sincronización'
    };
  }
};

// Sincronizar todas las preventas pendientes
const sincronizarTodasPreventasWeb = async () => {
  try {
    console.log("🔄 Iniciando sincronización de todas las preventas...");
    
    const preventas = await indexedDBHandler.obtenerTodasPreventas();
    const preventasPendientes = preventas.filter(p => p.estado === 'borrador');
    
    console.log(`📊 Encontradas ${preventasPendientes.length} preventas pendientes de sincronización`);
    
    const resultados = [];
    
    for (const preventa of preventasPendientes) {
      console.log(`🔄 Sincronizando preventa ${preventa.numero}...`);
      
      const resultado = await sincronizarPreventaWeb(preventa.numero);
      resultados.push({
        numero: preventa.numero,
        resultado: resultado
      });
      
      // Pequeña pausa entre envíos para no sobrecargar el servidor
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const exitosas = resultados.filter(r => r.resultado.exitoso).length;
    const fallidas = resultados.filter(r => !r.resultado.exitoso).length;
    
    console.log(`✅ Sincronización completada: ${exitosas} exitosas, ${fallidas} fallidas`);
    
    return {
      total: preventasPendientes.length,
      exitosas: exitosas,
      fallidas: fallidas,
      resultados: resultados
    };
    
  } catch (error) {
    console.error('❌ Error en sincronizarTodasPreventasWeb:', error);
    return {
      total: 0,
      exitosas: 0,
      fallidas: 0,
      error: error.message
    };
  }
};

export {
  sincronizarPreventaWeb,
  sincronizarTodasPreventasWeb,
  verificarPreventaExistente,
  validarPreventaParaEnvio,
  convertirPreventaParaServidor,
  enviarPreventaAlServidor,
  inicializarNumeroDocumento,
  obtenerSiguienteNumeroDocumento
}; 