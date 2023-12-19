import { db } from '../database';
import { limpiarPreventa } from '../../src/utils/storageUtils';

const syncPreventas = () => {
    //sube las preventas a la BDD del servidor
    console.log("Subiento preventas al servidor");
  };

const deletePreventas = () => {
    //elimina todas las preventas de la BDD local
    //elimina dejaria el numero de preventa en 100
    console.log("Eliminando todas las preventas");
    tx.executeSql('DELETE FROM preventaItem', [], () => console.log('Datos prev item eliminados'), (_, error) => console.log('Error al eliminar los item', error));
    tx.executeSql('DELETE FROM preventaCabeza', [], () => console.log('Datos prev cabeza eliminados'), (_, error) => console.log('Error al eliminar los cabeza', error));
    }; 

function nextPreventa() {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            // Obtener el último número de preventa de la tabla preventaCabeza
            tx.executeSql(
                'SELECT id FROM preventaCabeza ORDER BY id DESC LIMIT 1',
                [],
                (_, result) => {
                    if (result.rows.length > 0) {
                        const ultimoNumero = result.rows.item(0).id;
                        const siguienteNumero = ultimoNumero + 1;
                        console.log("Prev.Cont25 siguiente preventa:", siguienteNumero);
                        resolve(siguienteNumero);
                    } else {
                        // Si no hay registros en la tabla, retornar 100
                        const primerNumero = 100;
                        console.log("No hay preventas existentes. Retornando:", primerNumero);
                        resolve(primerNumero);
                    }
                },
                (_, error) => {
                    console.error('Error al obtener el último número de preventa:', error);
                    reject(error);
                }
            );
        });
    });
}

const grabarCabezaPreventaEnBDD = async (numero, nota, cliente, cantItems, importeTotal) => {
    const fecha = new Date().toISOString();  // Formato ISO 8601
    const vendedor = "local";
    
    console.log('PrvControler49. grabando cabeza en la bdd numero, cliente:', numero, cliente, vendedor, nota, fecha, cantItems, importeTotal);
    
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            // Insertar en la tabla preventaCabeza
            tx.executeSql(
                'INSERT INTO preventaCabeza (id, cliente, vendedor, observacion, fecha, cantidadItems, importeTotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [numero, cliente, vendedor, nota, fecha, cantItems, importeTotal ],
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
    //console.log('PrvControler74. grabando items en la bdd para la cabeza ID:', numero);
    
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            // Insertar en la tabla preventaItem
            items.forEach((item) => {
                // console.log("80grabo item ",numero, item.codigo, item.cantidad, item.precio);
                tx.executeSql(
                    'INSERT INTO preventaItem (idPreventa, articulo, cantidad, importe) VALUES (?, ?, ?, ?)',
                    [numero, item.codigo, item.cantidad, item.precio],
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
    let importeTotal = 0;
    items.map((e) => {
        importeTotal = importeTotal + e.precio;
    });
    
    if (items.length < 1) {
        console.error("no tenes item cargado");
        return
    }
    console.log('PrvControler108. grabado en la bdd CABEZA numero, nota, cliente, primer item:', numero, nota, cliente, items[0]);
    try {
        await grabarCabezaPreventaEnBDD(numero, nota, cliente, items.length, importeTotal );
        await grabarItemsPreventaEnBDD(numero, items);
        limpiarPreventa();
    } catch (error) {
        console.error('Error al grabar preventa en la base de datos:', error);
        throw error;
    }
};

const mostrarPreventas = async () => {
 return "todas"
};

export { syncPreventas, deletePreventas, nextPreventa, grabarPreventaEnBDD}