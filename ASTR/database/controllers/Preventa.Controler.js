import { db } from '../database';

const syncPreventas = () => {
    //sube las preventas a la BDD del servidor
    console.log("Subiento preventas al servidor");
  };

const newPreventa = () => {
//crea una preventa en la BDD local
//buscar el numero de la ultima preventa y sumar uno
let id=nextPreventa;
console.log("creando nueva preventa id:",id);
};  

const deletePreventas = () => {
    //elimina todas las preventas de la BDD local
    //elimina 
    console.log("Eliminando todas las preventas");
    tx.executeSql('DELETE FROM preventaItem', [], () => console.log('Datos prev item eliminados'), (_, error) => console.log('Error al eliminar los item', error));
    tx.executeSql('DELETE FROM preventaCabeza', [], () => console.log('Datos prev cabeza eliminados'), (_, error) => console.log('Error al eliminar los cabeza', error));
    }; 

    async function nextPreventa() {
        // return new Promise((resolve, reject) => {
        //   db.transaction((tx) => {
        //     tx.executeSql('SELECT MAX(id) AS maxNumero FROM preventas', [], (_, result) => {
        //       const maxNumero = result.rows.item(0).maxNumero;
        //       const siguienteNumero = maxNumero !== null ? maxNumero + 1 : 1;
        //       resolve(siguienteNumero);
        //     }, (_, error) => {
        //       console.error('Error al obtener el siguiente número de preventa:', error);
        //       reject(error);
        //     });
        //   });
        // });
        console.log("Prev.Cont36 next preventa, : 100");
        return 100
      }
      

const getPreventas = async () => {
return new Promise((resolve, reject) => {
    console.log("traigo los articulos de la base de datos local");
    db.transaction(tx => {
    tx.executeSql('SELECT * FROM preventas', [], (_, { rows }) => {
        resolve(rows._array);
    }, (_, error) => {
        reject(error);
    });
    });
});
};

export {newPreventa, getPreventas, syncPreventas, deletePreventas, nextPreventa}