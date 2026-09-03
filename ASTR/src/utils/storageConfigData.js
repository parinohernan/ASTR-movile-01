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
        const configuracionStr = await AsyncStorage.getItem(STORAGE_KEY);
        // console.log("STRCONF 26 obteniendo configuracion de Storage", configuracionStr);
        // if (configuracionStr.length > 1) {  
            if (configuracionStr == null) {
                return JSON.parse('{"endPoint":"https://192.168.1.123:3003/","siguientePreventa":"15","vendedor":"0001","usaGeolocalizacion":true,"cantidadMaximaArticulos":"18"}');
            }
            else {
              return JSON.parse(configuracionStr)
            }
    } catch (error) {
        console.error('Error al obtener la configuracion desde AsyncStorage:', error);
        throw error;
    }
};

const codigoVendedorDesdeSucursal = (sucursal) => {
  const str = String(sucursal ?? '').trim();
  if (!str) {
    return '';
  }
  const numero = parseInt(str, 10);
  if (Number.isFinite(numero)) {
    return String(numero);
  }
  const sinCeros = str.replace(/^0+/, '');
  return sinCeros || str;
};

async function configuracionVendedor() {
  const conf = await getConfiguracionDelStorage();
  const codigo = String(conf.vendedor ?? '').trim();
  if (codigo) {
    return codigo;
  }
  return codigoVendedorDesdeSucursal(conf.sucursal);
}

async function configuracionSucursal() {
  let conf= await getConfiguracionDelStorage();
  return conf.sucursal
}

async function configuracionEndPoint() {
  let conf= await getConfiguracionDelStorage();
  return conf.endPoint
}

async function configuracionCantidadMaximaArticulos() {
  let conf= await getConfiguracionDelStorage();
  return conf.cantidadMaximaArticulos
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

export { 
  getConfiguracionDelStorage, 
  guardarConfiguracionEnStorage, 
  nextPreventa,
  obtenerNextPreventa, 
  mas1NexPreventa, 
  configuracionEndPoint, 
  configuracionVendedor,
  codigoVendedorDesdeSucursal,
  configuracionSucursal, 
  configuracionCantidadMaximaArticulos,
  limpiarConfiguracionDelStorage,
  establecerConfiguracionPrueba,
  obtenerEndpointActual,
  generarNuevoNumeroPreventa 
};
