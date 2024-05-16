import { db } from '../database';

// const insertClientesFromAPI = (data) => {
//     let clientesInsertados = 0;
  
//     return new Promise((resolve, reject) => {
//       db.transaction(tx => {
//         data.forEach(item => {
//           const {
//             codigo,
//             descripcion,
//             cuit,
//             calle,
//             numero,
//             piso,
//             departamento,
//             codigoPostal,
//             localidad,
//             telefono,
//             mail,
//             contactoComercial,
//             categoriaIva,
//             listaPrecio,
//             importeDeuda,
//             codigoVendedor,
//             actualizado,
//             saldoNTCNoAplicado,
//             limiteCredito
//           } = item;
  
//           tx.executeSql(
//             'INSERT OR REPLACE INTO clientes (id, descripcion, cuit, calle, numero, piso, departamento, codigoPostal, localidad, telefono, mail, contactoComercial, categoriaIva, listaPrecio, importeDeuda, codigoVendedor, actualizado, saldoNTCNoAplicado, limiteCredito) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
//             [
//               codigo,
//               descripcion,
//               cuit,
//               calle,
//               numero,
//               piso,
//               departamento,
//               codigoPostal,
//               localidad,
//               telefono,
//               mail,
//               contactoComercial,
//               categoriaIva,
//               listaPrecio,
//               importeDeuda,
//               codigoVendedor,
//               actualizado,
//               saldoNTCNoAplicado,
//               limiteCredito
//             ],
//             (_, result) => {
//               clientesInsertados++;
//               console.log( item.codigo,", ");
//             },
//             (_, error) => {
//               console.log('Error al insertar cliente:', error);
//             }
//           );
//         });
//       }, undefined, () => resolve(clientesInsertados), reject);
//     });
//   };
const insertClientesFromAPI = (data) => {
  let clientesInsertados = 0;
  let clientesEliminados = 0;

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Paso 1: Obtener los códigos de cliente actuales en la base de datos
      const codigosClientesDB = new Set();
      tx.executeSql('SELECT id FROM clientes', [], (_, result) => {
        const rows = result.rows;
        for (let i = 0; i < rows.length; i++) {
          codigosClientesDB.add(rows.item(i).id);
        }

        // Paso 2: Iterar sobre los datos recibidos de la API
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

          // Paso 3: Verificar si el cliente ya existe en la base de datos
          if (codigosClientesDB.has(codigo)) {
            // El cliente ya existe, actualiza sus datos
            tx.executeSql(
              'UPDATE clientes SET descripcion=?, cuit=?, calle=?, numero=?, piso=?, departamento=?, codigoPostal=?, localidad=?, telefono=?, mail=?, contactoComercial=?, categoriaIva=?, listaPrecio=?, importeDeuda=?, codigoVendedor=?, actualizado=?, saldoNTCNoAplicado=?, limiteCredito=? WHERE id=?',
              [
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
                limiteCredito,
                codigo
              ],
              (_, result) => {
                clientesInsertados++;
                console.log("Cliente actualizado:", codigo);
              },
              (_, error) => {
                console.log('Error al actualizar cliente:', error);
              }
            );
          } else {
            // El cliente no existe en la base de datos, inserta el nuevo cliente
            tx.executeSql(
              'INSERT INTO clientes (id, descripcion, cuit, calle, numero, piso, departamento, codigoPostal, localidad, telefono, mail, contactoComercial, categoriaIva, listaPrecio, importeDeuda, codigoVendedor, actualizado, saldoNTCNoAplicado, limiteCredito) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
                console.log("Nuevo cliente insertado:", codigo);
              },
              (_, error) => {
                console.log('Error al insertar cliente:', error);
              }
            );
          }

          // Paso 4: Eliminar los clientes que ya no están en los datos recibidos de la API
          codigosClientesDB.delete(codigo);
        });

        // Paso 5: Eliminar clientes que no están presentes en los datos recibidos de la API
        codigosClientesDB.forEach(codigoCliente => {
          tx.executeSql(
            'DELETE FROM clientes WHERE id=?',
            [codigoCliente],
            (_, result) => {
              clientesEliminados++;
              console.log("Cliente eliminado:", codigoCliente);
            },
            (_, error) => {
              console.log('Error al eliminar cliente:', error);
            }
          );
        });
      });
    }, undefined, () => resolve({ clientesInsertados, clientesEliminados }), reject);
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