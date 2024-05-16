import { db } from '../database';
import { limpiarPreventaDeStorage } from '../../src/utils/storageUtils';
import { mas1NexPreventa } from '../../src/utils/storageConfigData';
// import { log } from 'react-native-sqlite-storage/lib/sqlite.core';
import { configuracionVendedor, configuracionSucursal } from '../../src/utils/storageConfigData';
const syncPreventas = () => {
    //sube las preventas a la BDD del servidor
    console.log("Subiento preventas al servidor");
  };

const grabarCabezaPreventaEnBDD = async (numero, nota, cliente, cantItems, importeTotal, vendedor, sucursal) => {
    const fecha = new Date().toISOString();  // Formato ISO 8601
    // const vendedor = "0001";
    
    console.log('PrvControler51. grabando cabeza en la bdd numero, cliente:', numero, cliente, vendedor, nota, fecha, cantItems, importeTotal, "suc", sucursal);
    
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            // Insertar o reemplazar en la tabla preventaCabeza
            tx.executeSql(
                'INSERT OR REPLACE INTO preventaCabeza (id, cliente, vendedor, observacion, fecha, cantidadItems, importeTotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [numero, cliente, vendedor, nota, fecha, cantItems, importeTotal],
                (_, cabezaResult) => {
                    console.log('Cabeza insertada o actualizada con ID:', cabezaResult.insertId);
                    resolve(cabezaResult.insertId);
                },
                (_, error) => {
                    console.error('Error al insertar o actualizar cabeza:', error);
                    reject(error);
                }
            );
        });
    });
};

// Grabalos items de la preventa del storage en la BDD sqlite
const grabarItemsPreventaEnBDD = async (numero, items) => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            // Insertar en la tabla preventaItem
            items.forEach((item) => {
                console.log("80grabo BDD item ",numero, item);
                tx.executeSql(
                    'INSERT INTO preventaItem (idPreventa, articulo, cantidad, importe, porcentajeBonificacion, precioLista ) VALUES (?, ?, ?, ?, ?, ?)',
                    [numero, item.id, item.cantidad, item.precio, item.descuento, item.precioLista],
                    (_, itemResult) => {
                        // console.log('Item insertado en la base de datos:', item);
                        console.log('ID del nuevo item:', itemResult.insertId, item);
                        // console.log('Valor de descuento:', item.descuento); // Agregar esta línea para mostrar el descuento
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

// grabo pasando la preventa del localstore a sqlite
const grabarPreventaEnBDD = async (numero, nota, cliente, items) => {
    // console.log('PrvControler109. grabado en la ITEMS', items);
    let vendedor = await configuracionVendedor();
    let sucursal = await configuracionSucursal();

    let importeTotal = 0;
    items.map((e) => {
        importeTotal = importeTotal + e.precio;
    });
    
    if (items.length < 1) {
        console.error("no tenes items cargados");
        return
    }
    // console.log('PrvControler108. grabado en la bdd CABEZA numero, nota', numero, nota, "cliente ", cliente, "items: ",items.length);
    try {
        await grabarCabezaPreventaEnBDD(numero, nota, cliente, items.length, importeTotal, vendedor, sucursal );
        await grabarItemsPreventaEnBDD(numero, items);
        limpiarPreventaDeStorage();
        mas1NexPreventa();
    } catch (error) {
        console.error('Error al grabar preventa en la base de datos:', error);
        throw error;
    }
};

// busco ITEMS desde sqlite y preparo el json para mandar a la api
const buscarItemsPreventaEnBDD = async (numeroPreventa) => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM preventaItem WHERE idPreventa = ?',
                [numeroPreventa],
                (_, result) => {
                    const items = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        const row = result.rows.item(i);
                        console.log("mirando el contenido de ROW:",row);
                        //adapto la respuesta al JSON de la API
                        let itemObjet={
                            CodigoArticulo : row.articulo,
                            Cantidad: row.cantidad,
                            PrecioUnitario: (row.importe/ row.cantidad),// calcular bien
                            PrecioLista: row.precioLista,// ver el correcto
                            PorcentajeBonificacion: row.porcentajeBonificacion,// tengo que ver el correcto
                            iva: row.iva,    
                        }
                        items.push(itemObjet);
                        console.log("mirando el item creado:",itemObjet);
                    }
                    console.log("items busc: . ",items);
                    resolve(items);
                },
                (_, error) => {
                    console.error('Error al buscar items de preventa en la BDD:', error);
                    reject(error);
                }
            );
        });
    });
};

const asyncPreventasBDDToArray = async() => {
    let sucursal = await configuracionSucursal();
    let vendedorCodigo = await configuracionVendedor();
    console.log("Prev Ctrl 120 ");
    return new Promise((resolve, reject) => {
        let preventasArray = [];
        db.transaction((tx) => {
            try {
                tx.executeSql(
                    'SELECT preventaCabeza.cantidadItems, preventaCabeza.vendedor, preventaCabeza.fecha, preventaCabeza.id as DocumentoNumero, clientes.id as ClienteCodigo, preventaCabeza.importetotal as ImporteTotal FROM preventaCabeza JOIN clientes ON preventaCabeza.cliente = clientes.id ORDER BY preventaCabeza.id DESC',
                    [],
                    (_, result) => {
                        preventasArray = [];
                        for (let i = 0; i < result.rows.length; i++) {
                            //adapto la respuesta al JSON de la API
                            let preventa = {
                              DocumentoTipo: "PRV",
                              DocumentoSucursal: sucursal.substring(0, 4),
                              DocumentoNumero: result.rows.item(i).DocumentoNumero,
                              Fecha: result.rows.item(i).fecha,
                              FechaHoraEnvio : result.rows.item(i).fecha,
                              ClienteCodigo:result.rows.item(i).ClienteCodigo,
                              VendedorCodigo: vendedorCodigo,
                              ImporteTotal: result.rows.item(i).ImporteTotal,
                              Cant_items: result.rows.item(i).cantidadItems,
                              Observacion: result.rows.item(i).nota,
                              ListaNumero : 1,
                              ImporteBonificado : 0,
                              PagoTipo : "CC",
                              items: []
                            }
                            preventasArray.push(preventa);
                        }
                        // console.log("preventasArray dentro de la función de callback:", preventasArray);
                        // console.log("preventasArray dentro de la función de callback:", result.rows);
                        resolve(preventasArray); // Resuelve la promesa con el array de preventas
                    },
                    (_, error) => {
                        console.error('Error al leer preventas:', error);
                        reject(error); // Rechaza la promesa en caso de error
                    }
                );
            } catch (error) {
                console.error('Excepción al ejecutar la transacción:', error);
                reject(error); // Rechaza la promesa en caso de error
            }
        });
        
    });
}

const preventasBDDToArray = async () => {
    try {
        let preventasArray = await asyncPreventasBDDToArray();
        // //le tengo que agregar los items
        // console.log(buscarItemsPreventaEnBDD(100));
        for (let i = 0; i < preventasArray.length; i++) {
            let preventa = preventasArray[i];
            // console.log(i," preventa ", preventa);
            preventa.items = await buscarItemsPreventaEnBDD(preventa.DocumentoNumero)
        }
        // console.log("preventasArray listo:", preventasArray[0]);
        return preventasArray;
        // let Item
    } catch (error) {
        console.error('Error al obtener preventas:', error);
        return []; // En caso de error, devuelve un array vacío
    }
}


const borrarContenidoPreventasEnBDD = async () => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            // Borrar todos los registros de la tabla preventaItem
            tx.executeSql(
                'DELETE FROM preventaItem',
                [],
                (_, result) => {
                    console.log('Registros eliminados de preventaItem:', result.rowsAffected);
                    // Borrar todos los registros de la tabla preventaCabeza
                    tx.executeSql(
                        'DELETE FROM preventaCabeza',
                        [],
                        (_, result) => {
                            console.log('Registros eliminados de preventaCabeza:', result.rowsAffected);
                            resolve();
                        },
                        (_, error) => {
                            console.error('Error al eliminar registros de preventaCabeza:', error);
                            reject(error);
                        }
                    );
                },
                (_, error) => {
                    console.error('Error al eliminar registros de preventaItem:', error);
                    reject(error);
                }
            );
        });
    });
};

const borrarPreventaYSusItems = async (numeroPreventa) => {
    return new Promise((resolve, reject) => {
        db.transaction((tx) => {
            // Borrar los items de la preventa
            tx.executeSql(
                'DELETE FROM preventaItem WHERE idPreventa = ?',
                [numeroPreventa],
                (_, result) => {
                    console.log(`Eliminados ${result.rowsAffected} items de la preventa ${numeroPreventa}`);

                    // Borrar la cabeza de la preventa
                    tx.executeSql(
                        'DELETE FROM preventaCabeza WHERE id = ?',
                        [numeroPreventa],
                        (_, result) => {
                            console.log(`Eliminada la preventa ${numeroPreventa}`);
                            resolve();
                        },
                        (_, error) => {
                            console.error('Error al eliminar la preventa cabeza:', error);
                            reject(error);
                        }
                    );
                },
                (_, error) => {
                    console.error('Error al eliminar los items de la preventa:', error);
                    reject(error);
                }
            );
        });
    });
};

export { syncPreventas, grabarPreventaEnBDD, preventasBDDToArray, borrarContenidoPreventasEnBDD, borrarPreventaYSusItems}