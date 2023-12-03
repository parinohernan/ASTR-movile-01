import { db } from '../database';

const insertArticulosFromAPI = (data) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        let totalInsertados = 0;
  
        data.forEach(item => {
          tx.executeSql(
            'INSERT INTO articulos (id, descripcion, existencia, existenciaMinima, existenciaMaxima, precioCostoMasImp, porcentajeIVA1, porcentajeIVA2, precioCosto, unidadVenta, lista1, lista2, lista3, lista4, lista5, proveedorCodigo, rubroCodigo, peso, siempreSeDescarga, iva2SobreNeto, porcentajeVendedor, descuentoXCantidad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              item.codigo,
              item.descripcion,
              item.existencia,
              item.existenciaMinima,
              item.existenciaMaxima,
              item.precioCostoMasImp,
              item.porcentajeIVA1,
              item.porcentajeIVA2,
              item.precioCosto,
              item.unidadVenta,
              item.lista1,
              item.lista2,
              item.lista3,
              item.lista4,
              item.lista5,
              item.proveedorCodigo,
              item.rubroCodigo,
              item.peso,
              item.siempreSeDescarga,
              item.iva2SobreNeto,
              item.porcentajeVendedor,
              item.descuentoXCantidad
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
      console.log("traigo los articulos de la api");
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