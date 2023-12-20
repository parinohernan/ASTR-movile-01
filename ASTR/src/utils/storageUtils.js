
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../database/database';

const STORAGE_KEY = '@MyApp:PreventaData';

// Guardar una preventa en AsyncStorage
const guardarPreventa = async (preventa) => {
    console.log("grabando ",preventa);
    try {
      if (preventa !== null && preventa !== undefined) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preventa));
        // console.log('Preventa guardada con éxito');
      } else {
        console.error('Error: El valor de la preventa es null o undefined');
      }
    } catch (error) {
      console.error('Error al guardar la preventa en AsyncStorage:', error);
      throw error;
    }
  };
  
  const guardarPreventaEditando = async (preventa) => {
    console.log("transformar ",preventa);
    const preventaMapeada = preventa;
    guardarPreventa(preventaMapeada);
  };

// Obtener la preventa almacenada en AsyncStorage
const obtenerPreventa = async () => {
    try {
        const preventaString = await AsyncStorage.getItem(STORAGE_KEY);
        console.log("STR26 obteniendo preventa");

        // Verificar si preventaString es null o undefined antes de intentar el parseo JSON
        if (preventaString !== null && preventaString !== undefined) {
            return JSON.parse(preventaString);
        } else {
            console.log("str32");
            guardarPreventa([])
            return null;
        }
    } catch (error) {
        console.error('Error al obtener la preventa desde AsyncStorage:', error);
        throw error;
    }
};

// Busca la prevenata en la BDD y la almacena en AsyncStorage
const preventaDesdeBDD = async (numeroPreventa) => {
  console.log("STORAGE45 numero preven", numeroPreventa);
  try {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM preventaItem WHERE idPreventa = ?',
          [numeroPreventa],
          (_, result) => {
            const preventaItemsBDD = [];
            for (let i = 0; i < result.rows.length; i++) {
              preventaItemsBDD.push(result.rows.item(i));
            }
            console.log('Items de preventa cargados desde la base de datos:', preventaItemsBDD);
            guardarPreventaEditando(preventaItemsBDD);
            resolve(preventaItemsBDD);
          },
          (_, error) => {
            console.error('Error al cargar items de preventa desde la base de datos:', error);
            reject(error);
          }
        );
      });
    });
  } catch (error) {
    console.error('Error en preventaDesdeBDD:', error);
    throw error;
  }
};



// Cuenta los items de preventa almacenada en AsyncStorage
const contarItems = async () => {
    try {
      const preventa = await obtenerPreventa();
      
      // Verifica si la preventa es un array antes de contar los elementos
      if (Array.isArray(preventa)) {
        const cantidadItems = preventa.length;
        console.log('Cantidad de items en la preventa:', cantidadItems);
        return cantidadItems;
      } else {
        console.log('La preventa no es un array válido.');
        return 0; // Puedes devolver 0 o manejarlo de acuerdo a tus necesidades.
      }
    } catch (error) {
      console.error('Error al contar los items de la preventa:', error);
      throw error;
    }
  };
  
 // Ccalcula el total
const calcularTotal = async () => {
    // console.log("calculo total preventa ")
    let total = 0;
    try {
      const preventa = await obtenerPreventa();
    //   console.log("calculo precioFinal preventa ",preventa);
      // Verifica si la preventa es un array antes de contar los elementos
     for (let i = 0; i < preventa.length; i++) {
         const e = preventa[i]; 
         console.log("item ", e.precioFinal);
        total= total + e.precioFinal;
     }
    return total;
      
    } catch (error) {
      console.error('Error al calcular total de la preventa:', error);
      throw error;
    }
  }; 

// Limpiar los datos de preventa almacenados en AsyncStorage
const limpiarPreventa = async () => {
    console.log("STR44 limiando preventa");
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar los datos de preventa en AsyncStorage:', error);
    throw error;
  }
};

export { guardarPreventa, preventaDesdeBDD, obtenerPreventa, limpiarPreventa, contarItems, calcularTotal };
