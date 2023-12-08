import { db } from '../database';

const insertArticulosFromAPI = (data) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        let totalInsertados = 0;
  
        data.forEach(item => {
          tx.executeSql(
            'INSERT INTO articulos (id, descripcion, existencia, precioCostoMasImp, precioCosto, unidadVenta, lista1, lista2, lista3, lista4, lista5, rubroCodigo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              item.codigo,
              item.descripcion,
              item.existencia,
              item.precioCostoMasImp,
              item.precioCosto,
              item.unidadVenta,
              item.lista1,
              item.lista2,
              item.lista3,
              item.lista4,
              item.lista5,
              item.rubroCodigo,
            ],
            (_, result) => {
                totalInsertados++;
                console.log(totalInsertados," ",item.codigo,". ");
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

  export {insertArticulosFromAPI, getArticulos}