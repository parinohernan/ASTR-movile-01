import { db } from '../database';

const borrarArticulosDeSqlite = async () => {
  db.transaction(tx => {
    // Paso 1: Borrar los artículos existentes en la base de datos local
    tx.executeSql(
      'DELETE FROM articulos WHERE 1=1',
      [], // No necesitas pasar ningún parámetro para esta consulta
      (_, result) => {
        console.log("Todos los artículos existentes han sido eliminados.");
      },
      (_, error) => {
        console.log('Error al eliminar artículos existentes:', error);
      }
    );
  }); // Asegúrate de cerrar correctamente la función de transacción
}; // Asegúrate de cerrar correctamente la función borrarArticulosDeSqlite

const insertArticulosFrecuentesToSqlite = async (data) =>{
  console.log("ART ctr 20",data);
// tengo que borrar los que tenga y agregar los del nuevo cliente

  // db.transaction(tx => {
  //   //PASO 0  Crea la tabla articulosFrecuentes si no existe
  //   tx.executeSql(
  //     'CREATE TABLE IF NOT EXISTS articulosFrecuentes (id TEXT PRIMARY KEY, descripcion TEXT, existencia INTEGER, precio REAL, unidadVenta TEXT)',
  //     [],
  //     () => console.log(logs,('Tabla articulosFrecuentes creada exitosamente'), setLogs),
  //     (_, error) =>console.log(logs,('Error al crear la tabla articulosFrecuentes'), setLogs)
  //   );
  //   // Paso 1: Borrar los artículosFrecuentes existentes en la base de datos local
  //   tx.executeSql(
  //     'DELETE FROM articulosFrecuentes WHERE 1=1',
  //     [], // No necesitas pasar ningún parámetro para esta consulta
  //     (_, result) => {
  //       console.log("Todos los artículosFrecuentes existentes han sido eliminados.");
  //     },
  //     (_, error) => {
  //       console.log('Error al eliminar artículosFrecuentes existentes:', error);
  //     }
  //   );

  // }); 
  
  // let articulos = await getArticulos();
  // const filteredArticulosBDD = await getArticulosFiltrados("fan");
  // console.log("art.crtl 34: arti", filteredArticulosBDD.length);
}

const insertArticulosFromAPI = (data) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      let totalInsertados = 0;

      data.forEach(item => {
        tx.executeSql(
          'INSERT OR REPLACE INTO articulos (id, descripcion, existencia, precioCosto, unidadVenta, iva, lista1, lista2, lista3, lista4, lista5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            item.codigo,
            item.descripcion,
            item.existencia,
            //item.precioCostoMasImp * (1 + item.lista1 / 100)
            item.precioCosto,
            item.unidadVenta,
            iva = item.porcentajeIVA1,
            item.lista1, 
            item.lista2, 
            item.lista3, 
            item.lista4, 
            item.lista5
          ],
          (_, result) => {
            totalInsertados++;
            console.log(totalInsertados, " ", item.codigo, ". ");
          },
          (_, error) => {
            console.log('Error al insertar artículo:', error);
          }
        );
      });

      // Después de insertar todos los artículos, imprime el mensaje
      tx.executeSql('SELECT COUNT(*) FROM articulos', [], (_, { rows }) => {
        console.log(`${totalInsertados} artículos insertados exitosamente. Total de artículos en la base de datos: ${rows.item(0)['COUNT(*)']}`);
      });
    }, undefined, resolve, reject);
  });
};

/** La idea es buscar el articulo teniendo el ID **/
const getArticuloPorCodigo = (codigo) => {
  return new Promise((resolve, reject) => {
    console.log("Obteniendo artículos por codigo de la base de datos local...");
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM articulos WHERE id = ?', 
        [codigo], 
        (_, { rows }) => {
          // console.log("rows._array 96 art controler", rows._array);
          resolve(rows._array);
        }, 
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};


/** La idea es filtrar y paginar todo en esta funcion */
const getArticulosFiltrados = (searchWord) => {
  return new Promise((resolve, reject) => {
    console.log("Obteniendo artículos filtrados de la base de datos local...");
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM articulos WHERE descripcion LIKE ?', [`%${searchWord}%`], (_, { rows }) => {
        // console.log("rows._array 91 art controler",rows._array);
        resolve(rows._array);
      }, (_, error) => {
        reject(error);
      });
    });
  });
};

  const getArticulos = () => {
    return new Promise((resolve, reject) => {
      console.log("traigo los articulos de la base de datos local");
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM articulos', [], (_, { rows }) => {
          resolve(rows._array);
        }, (_, error) => {
          reject(error);
        });
      });
    });
  };

  export {insertArticulosFromAPI, getArticulosFiltrados, borrarArticulosDeSqlite, insertArticulosFrecuentesToSqlite, getArticuloPorCodigo}