import { db } from '../database';

const insertArticulosFromAPI = (data) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      let totalInsertados = 0;

      data.forEach(item => {
        tx.executeSql(
          'INSERT OR REPLACE INTO articulos (id, descripcion, existencia, precio, unidadVenta) VALUES (?, ?, ?, ?, ?)',
          [
            item.codigo,
            item.descripcion,
            item.existencia,
            //item.precioCostoMasImp * (1 + item.lista1 / 100)
            precio = item.precioCostoMasImp * (1 + item.lista1 / 100),
            item.unidadVenta,
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

  
  /** La idea es filtrar y paginar todo en esta funcion */
  const getArticulosFiltrados = (searchWord) => {
    return new Promise((resolve, reject) => {
      console.log("Obteniendo artículos filtrados de la base de datos local...");
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM articulos WHERE descripcion LIKE ?', [`%${searchWord}%`], (_, { rows }) => {
          resolve(rows._array);
        }, (_, error) => {
          reject(error);
        });
      });
    });
  };

  export {insertArticulosFromAPI, getArticulosFiltrados}