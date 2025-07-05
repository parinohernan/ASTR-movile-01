import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@MyApp:ConfigData';

// Guardar una configuracion en AsyncStorage
const guardarConfiguracionEnStorage = async (configuracion) => {
    // console.log("grabando conf",configuracion);
    // console.log("     srtingfi",JSON.stringify(configuracion));
    try {
      if (configuracion !== null && configuracion !== undefined ) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(configuracion));
        console.log('configuracion guardada con éxito en Storage');
      } else {
        console.error('Error: El valor de la configuracion es null o undefined');
      }
    } catch (error) {
      console.error('Error al guardar la configuracion en AsyncStorage:', error);
      throw error;
    }
  };
  
// Obtener la configuracion almacenada en AsyncStorage
const getConfiguracionDelStorage = async () => {
    try {
        // En entorno web, usar IndexedDB
        if (typeof window !== 'undefined' && window.indexedDB) {
            const indexedDBHandler = require('./indexedDBHandler').default;
            const configuracion = await indexedDBHandler.obtenerConfiguracion();
            if (configuracion) {
                console.log("🌐 Configuración obtenida desde IndexedDB:", configuracion);
                return configuracion;
            }
        }
        
        // Fallback a AsyncStorage (para React Native)
        const configuracionStr = await AsyncStorage.getItem(STORAGE_KEY);
        if (configuracionStr == null) {
            return JSON.parse('{"endPoint":"https://192.168.1.123:3003/","siguientePreventa":"15","vendedor":"0001","usaGeolocalizacion":true,"cantidadMaximaArticulos":"18"}');
        } else {
            return JSON.parse(configuracionStr);
        }
    } catch (error) {
        console.error('Error al obtener la configuracion:', error);
        throw error;
    }
};

async function configuracionVendedor() {
  let conf= await getConfiguracionDelStorage();
  return conf.vendedor
}

async function configuracionSucursal() {
  let conf= await getConfiguracionDelStorage();
  return conf.sucursal
}

async function configuracionEndPoint() {
  let conf= await getConfiguracionDelStorage();
  // Manejar tanto 'endPoint' como 'endpoint' para compatibilidad
  return conf.endPoint || conf.endpoint || 'http://localhost:3003/';
}

async function configuracionCantidadMaximaArticulos() {
  try {
    let conf = await getConfiguracionDelStorage();
    const cantidad = conf.cantidadMaximaArticulos;
    
    // Convertir a número y validar
    const cantidadNum = parseInt(cantidad);
    
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      console.warn('⚠️ Cantidad máxima de artículos inválida:', cantidad, 'usando valor por defecto: 50');
      return 50;
    }
    
    console.log('✅ Cantidad máxima de artículos configurada:', cantidadNum);
    return cantidadNum;
  } catch (error) {
    console.error('❌ Error al obtener cantidad máxima de artículos:', error);
    return 50; // Valor por defecto
  }
}


async function nextPreventa() {
    let conf= await getConfiguracionDelStorage();
    return conf.siguientePreventa
  }

async function obtenerNextPreventa() {
    let conf= await getConfiguracionDelStorage();
    return conf.siguientePreventa
  }

async function mas1NexPreventa() {
    let conf = await getConfiguracionDelStorage();
    let numero = +conf.siguientePreventa + 1;
    console.log("sumo 1 a preventa", numero);
    guardarConfiguracionEnStorage({...conf, siguientePreventa: String(numero)})
  }

// no creo que use esta funcion - Limpiar los datos de configuracion almacenados en AsyncStorage
const limpiarConfiguracionDelStorage = async () => {
    console.log("STR44 limpiando CONFIGURACION Storage");
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar los datos de CONFIGURACION en AsyncStorage:', error);
    throw error;
  }
};

// Función para establecer configuración de prueba
const establecerConfiguracionPrueba = async () => {
  const configuracionPrueba = {
    endPoint: "http://localhost:3003/", // Endpoint local para pruebas
    siguientePreventa: "15",
    vendedor: "0001",
    sucursal: "0001",
    usaGeolocalizacion: true,
    cantidadMaximaArticulos: "18"
  };
  
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(configuracionPrueba));
    console.log('Configuración de prueba establecida');
    return configuracionPrueba;
  } catch (error) {
    console.error('Error al establecer configuración de prueba:', error);
    throw error;
  }
};

// Función para obtener el endpoint actual
const obtenerEndpointActual = async () => {
  try {
    const config = await getConfiguracionDelStorage();
    return config.endPoint;
  } catch (error) {
    console.error('Error al obtener endpoint actual:', error);
    return null;
  }
};

// Generar un nuevo número de preventa único
const generarNuevoNumeroPreventa = async () => {
  try {
    const numeroActual = await obtenerNextPreventa();
    const timestamp = Date.now();
    const numeroUnico = `${numeroActual}_${timestamp}`;
    console.log("Nuevo número de preventa generado:", numeroUnico);
    return numeroUnico;
  } catch (error) {
    console.error('Error al generar nuevo número de preventa:', error);
    // Fallback: usar timestamp como número
    return Date.now().toString();
  }
};

// Configuraciones para manejo de grandes volúmenes de datos
const CONFIG_PAGINACION = {
  TAMANO_PAGINA_CLIENTES: 100,
  TAMANO_PAGINA_ARTICULOS: 500,
  MAX_ARTICULOS_EN_CACHE: 5000,
  MAX_CLIENTES_EN_CACHE: 1000,
  TIEMPO_CACHE_MINUTOS: 30
};

// Función para verificar espacio disponible
const verificarEspacioDisponible = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const data = await AsyncStorage.multiGet(keys);
    let totalSize = 0;
    
    data.forEach(([key, value]) => {
      totalSize += (key.length + (value ? value.length : 0)) * 2; // UTF-16
    });
    
    const espacioDisponible = 5 * 1024 * 1024 - totalSize; // 5MB - usado
    console.log(`Espacio usado: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Espacio disponible: ${(espacioDisponible / 1024 / 1024).toFixed(2)}MB`);
    
    return {
      usado: totalSize,
      disponible: espacioDisponible,
      porcentajeUsado: (totalSize / (5 * 1024 * 1024)) * 100
    };
  } catch (error) {
    console.error('Error al verificar espacio:', error);
    return { usado: 0, disponible: 5 * 1024 * 1024, porcentajeUsado: 0 };
  }
};

// Función para limpiar datos antiguos
const limpiarDatosAntiguos = async () => {
  try {
    const espacio = await verificarEspacioDisponible();
    
    if (espacio.porcentajeUsado > 80) {
      console.log('⚠️ Espacio crítico detectado, limpiando datos antiguos...');
      
      // Limpiar logs antiguos
      const logs = await AsyncStorage.getItem('@MyApp:Logs');
      if (logs) {
        const logsArray = JSON.parse(logs);
        if (logsArray.length > 100) {
          await AsyncStorage.setItem('@MyApp:Logs', JSON.stringify(logsArray.slice(-100)));
        }
      }
      
      // Limpiar preventas enviadas antiguas
      const preventasEnviadas = await AsyncStorage.getItem('@MyApp:PreventasEnviadas');
      if (preventasEnviadas) {
        const preventasArray = JSON.parse(preventasEnviadas);
        if (preventasArray.length > 50) {
          await AsyncStorage.setItem('@MyApp:PreventasEnviadas', JSON.stringify(preventasArray.slice(-50)));
        }
      }
      
      console.log('✅ Limpieza de datos completada');
    }
  } catch (error) {
    console.error('Error al limpiar datos antiguos:', error);
  }
};

// Función para cargar datos con paginación
const cargarDatosPaginados = async (tipo, pagina = 1, tamanoPagina = 100) => {
  try {
    const config = await getConfiguracionDelStorage();
    const endpoint = config.endPoint || config.endpoint;
    
    let url = '';
    switch (tipo) {
      case 'clientes':
        url = `${endpoint}clientes?page=${pagina}&limit=${tamanoPagina}`;
        break;
      case 'articulos':
        url = `${endpoint}articulos?page=${pagina}&limit=${tamanoPagina}`;
        break;
      case 'vendedores':
        url = `${endpoint}vendedores?page=${pagina}&limit=${tamanoPagina}`;
        break;
      default:
        throw new Error('Tipo de datos no válido');
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    return {
      datos: data.items || data,
      pagina: pagina,
      totalPaginas: data.totalPages || 1,
      totalElementos: data.total || data.length,
      tieneMas: data.hasMore || (pagina < (data.totalPages || 1))
    };
  } catch (error) {
    console.error(`Error al cargar ${tipo} paginados:`, error);
    throw error;
  }
};

// Función para sincronizar datos de forma inteligente
const sincronizarDatosInteligente = async (tipo, logs = [], setLogs = null) => {
  try {
    const handleLog = (mensaje) => {
      console.log(mensaje);
      if (setLogs) {
        setLogs(prev => [...prev, mensaje]);
      }
    };
    
    handleLog(`🔄 Iniciando sincronización inteligente de ${tipo}...`);
    
    // Verificar espacio disponible
    const espacio = await verificarEspacioDisponible();
    handleLog(`📊 Espacio disponible: ${(espacio.disponible / 1024 / 1024).toFixed(2)}MB`);
    
    if (espacio.porcentajeUsado > 90) {
      handleLog('⚠️ Espacio crítico, limpiando datos antiguos...');
      await limpiarDatosAntiguos();
    }
    
    let pagina = 1;
    let totalCargados = 0;
    let continuar = true;
    
    while (continuar) {
      handleLog(`📄 Cargando página ${pagina} de ${tipo}...`);
      
      const resultado = await cargarDatosPaginados(tipo, pagina, CONFIG_PAGINACION[`TAMANO_PAGINA_${tipo.toUpperCase()}`]);
      
      // Guardar datos en AsyncStorage
      const clave = `@MyApp:${tipo.charAt(0).toUpperCase() + tipo.slice(1)}_Pagina_${pagina}`;
      await AsyncStorage.setItem(clave, JSON.stringify(resultado.datos));
      
      totalCargados += resultado.datos.length;
      handleLog(`✅ Página ${pagina} cargada: ${resultado.datos.length} elementos`);
      
      // Verificar si hay más páginas
      continuar = resultado.tieneMas && pagina < 10; // Límite de seguridad
      pagina++;
      
      // Pausa para no sobrecargar el servidor
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    handleLog(`🎉 Sincronización completada: ${totalCargados} ${tipo} cargados`);
    return totalCargados;
    
  } catch (error) {
    console.error(`Error en sincronización inteligente de ${tipo}:`, error);
    throw error;
  }
};

// Función específica para sincronización web
const sincronizarDatosWeb = async (tipo, logs = [], setLogs = null) => {
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

export { 
  getConfiguracionDelStorage, 
  guardarConfiguracionEnStorage, 
  nextPreventa,
  obtenerNextPreventa, 
  mas1NexPreventa, 
  configuracionEndPoint, 
  configuracionVendedor, 
  configuracionSucursal, 
  configuracionCantidadMaximaArticulos,
  limpiarConfiguracionDelStorage,
  establecerConfiguracionPrueba,
  obtenerEndpointActual,
  generarNuevoNumeroPreventa,
  CONFIG_PAGINACION,
  verificarEspacioDisponible,
  limpiarDatosAntiguos,
  cargarDatosPaginados,
  sincronizarDatosInteligente
};
