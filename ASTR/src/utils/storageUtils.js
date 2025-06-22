import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../database/database';

const STORAGE_KEY = '@MyApp:PreventaData';

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
  // console.log("transformar ",preventa);
  // const preventaMapeada = [{"cantidad": 52, "descripcion": "PRESTOBARBA UlTRA GRIP",
  // "descuento": 0, 
  // "existencia": 1464, "frecuente": false, "id": "1127", "iva": 21, "lista1": 25, "lista2": 30, "lista3": 35, "lista4": 45, "lista5": 0, "precio": 889.35, "precioCosto": 588, "precioTotal": 46246.200000000004, "seleccionados": 0, "unidadVenta": "u"}, {"cantidad": 10, "descripcion": "BARRITA CHOC LECHE FELFORT 30 X 16", "descuento": 0, "existencia": 0, "frecuente": false, "id": "1495", "iva": 21, "lista1": 25, "lista2": 30, "lista3": 35, "lista4": 45, "lista5": 0, "precio": 9506.01956338601, "precioCosto": 6284.97161215604, "precioTotal": 95060.20000000001, 
  // "seleccionados": 0, "unidadVenta": "u"}];
  const preventaMapeada = preventa;
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
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          // 'SELECT preventaItem.articulo AS id, articulos.descripcion AS descripcion, articulos.iva AS iva, articulos.precio AS precio, preventaItem.cantidad, preventaItem.idPreventa AS preventaNumero, preventaItem.importe AS precioFinal FROM preventaItem INNER JOIN articulos ON preventaItem.articulo = articulos.id WHERE preventaItem.idPreventa = ?',
          'SELECT preventaItem.articulo AS id, articulos.descripcion AS descripcion, articulos.iva AS iva, articulos.lista1 AS lista1, articulos.lista2 AS lista2, articulos.lista3 AS lista3, articulos.lista4 AS lista4, articulos.lista5 AS lista5, articulos.precioCosto AS precioCosto,  articulos.existencia AS existencia, preventaItem.cantidad AS cantidad, preventaItem.idPreventa AS preventaNumero, preventaItem.importe AS precioTotal FROM preventaItem INNER JOIN articulos ON preventaItem.articulo = articulos.id WHERE preventaItem.idPreventa = ?', 
          [numeroPreventa],
          (_, result) => {
            const preventaItemsBDD = [];
            for (let i = 0; i < result.rows.length; i++) {
              preventaItemsBDD.push(result.rows.item(i));
            }
            // console.log('Items de preventa cargados desde la base de datos:', preventaItemsBDD);
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

export { guardarPreventaEnStorage, preventaDesdeBDD, obtenerPreventaDeStorage, limpiarPreventaDeStorage, calcularTotal, eliminarItemEnPreventaEnStorage };
