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

function nextPreventa() {
    let n= 101;
    console.log("Prev.Cont25 siguiente preventa, : ", n);
    return n
}

//grabara la cabeza de la preventa del storage en la BDD
const grabarCabezaPreventaEnBDD = async (numero, nota, cliente) => {
    console.log('PrvControler31. grabando cabeza en la bdd numero, cliente:', numero, nota, cliente);
    
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            // Insertar en la tabla preventaCabeza
            tx.executeSql(
                'INSERT INTO preventaCabeza (id, cliente, observacion) VALUES (?, ?, ?)',
                [numero, cliente.id, nota],
                (_, cabezaResult) => {
                    console.log('Cabeza insertada con ID:', cabezaResult.insertId);
                    resolve(cabezaResult.insertId);
                },
                (_, error) => {
                    console.error('Error al insertar cabeza:', error);
                    reject(error);
                }
            );
        });
    });
};

// Grabalos items de la preventa del storage en la BDD
const grabarItemsPreventaEnBDD = async (numero, items) => {
    console.log('PrvControler51. grabando items en la bdd para la cabeza ID:', numero);
    
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            // Insertar en la tabla preventaItem
            items.forEach((item) => {
                tx.executeSql(
                    'INSERT INTO preventaItem (numero, cantidad, descripcion, precio) VALUES (?, ?, ?, ?)',
                    [numero, item.cantidad, item.descripcion, item.precio],
                    (_, itemResult) => {
                        console.log('Item insertado con ID:', itemResult.insertId);
                    },
                    (_, error) => {
                        console.error('Error al insertar item:', error);
                        reject(error);
                    }
                );
            });
            resolve();
        });
    });
};

const grabarPreventaEnBDD = async (numero, nota, cliente, items) => {
    if (items.length < 1) {
        console.error("no tenes item cargado");
        return
    }
    try {
        await grabarCabezaPreventaEnBDD(numero, nota, cliente);
        // await grabarItemsPreventaEnBDD(numero, items);
        console.log('PrvControler81. grabado en la bdd CABEZA numero, nota, cliente, primer item:', numero, nota, cliente, items[0]);
    } catch (error) {
        console.error('Error al grabar preventa en la base de datos:', error);
        throw error;
    }
};
    

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

export {newPreventa, getPreventas, syncPreventas, deletePreventas, nextPreventa, grabarPreventaEnBDD}