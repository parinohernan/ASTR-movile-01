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
        console.log("STR34 obteniendo configuracion de Storage", configuracionStr);
        return JSON.parse(configuracionStr);
    } catch (error) {
        console.error('Error al obtener la preventa desde AsyncStorage:', error);
        throw error;
    }
};

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

export { getConfiguracionDelStorage, guardarConfiguracionEnStorage, nextPreventa, mas1NexPreventa };
