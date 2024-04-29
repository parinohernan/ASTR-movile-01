import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@MyApp:ConfigData';

// Guardar una configuracion en AsyncStorage
const guardarConfiguracionEnStorage = async (configuracion) => {
    console.log("grabando conf",configuracion);
    console.log("     srtingfi",JSON.stringify(configuracion));
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
        console.log("STRCONF 26 obteniendo configuracion de Storage", configuracionStr);
        // if (configuracionStr.length > 1) {  
            if (configuracionStr == null) {
                return JSON.parse('{"endPoint":"http://192.168.1.123:3000/","siguientePreventa":"15","vendedor":"0001","usaGeolocalizacion":true,"cantidadMaximaArticulos":"18"}');
            }
            else {
              return JSON.parse(configuracionStr)
            }
    } catch (error) {
        console.error('Error al obtener la configuracion desde AsyncStorage:', error);
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

export { getConfiguracionDelStorage, guardarConfiguracionEnStorage, nextPreventa,
  configuracionCantidadMaximaArticulos, mas1NexPreventa, configuracionVendedor, configuracionSucursal, configuracionEndPoint };
