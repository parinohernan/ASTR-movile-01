import { db } from '../database';

const insertClientesFromAPI = (data) => {
    let clientesInsertados = 0;
  
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        data.forEach(item => {
          const {
            codigo,
            descripcion,
            cuit,
            calle,
            numero,
            piso,
            departamento,
            codigoPostal,
            localidad,
            telefono,
            mail,
            contactoComercial,
            categoriaIva,
            listaPrecio,
            importeDeuda,
            codigoVendedor,
            actualizado,
            saldoNTCNoAplicado,
            limiteCredito
          } = item;
  
          tx.executeSql(
            'INSERT OR REPLACE INTO clientes (id, descripcion, cuit, calle, numero, piso, departamento, codigoPostal, localidad, telefono, mail, contactoComercial, categoriaIva, listaPrecio, importeDeuda, codigoVendedor, actualizado, saldoNTCNoAplicado, limiteCredito) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              codigo,
              descripcion,
              cuit,
              calle,
              numero,
              piso,
              departamento,
              codigoPostal,
              localidad,
              telefono,
              mail,
              contactoComercial,
              categoriaIva,
              listaPrecio,
              importeDeuda,
              codigoVendedor,
              actualizado,
              saldoNTCNoAplicado,
              limiteCredito
            ],
            (_, result) => {
              clientesInsertados++;
              console.log( item.codigo,", ");
            },
            (_, error) => {
              console.log('Error al insertar cliente:', error);
            }
          );
        });
      }, undefined, () => resolve(clientesInsertados), reject);
    });
  };

  const getClientes = () => {
    return new Promise((resolve, reject) => {
      console.log("traigo los clientes de la api");
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM clientes', [], (_, { rows }) => {
          resolve(rows._array);
        }, (_, error) => {
          reject(error);
        });
      });
    });
  };
  
  export {insertClientesFromAPI, getClientes};