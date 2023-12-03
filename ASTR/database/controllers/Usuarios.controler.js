import { db } from '../database';
const insertUsuariosFromAPI = (data) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        data.forEach(item => {
          tx.executeSql(
            'INSERT INTO usuarios (id, descripcion, clave) VALUES (?, ?, ?)',
            [item.codigo, item.descripcion, item.clave],
            (_, result) => {
              console.log('Usuario insertado con ID: ', result.insertId);
            },
            (_, error) => {
              console.log('Error al insertar usuario: ', error, item.codigo, item.descripcion, item.clave,);
            }
          );
        });
      }, undefined, resolve, reject);
    });
  };

  const getUsuarios = () => {
    return new Promise((resolve, reject) => {
      console.log("traigo los usuarios de la api");
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM usuarios', [], (_, { rows }) => {
          resolve(rows._array);
        }, (_, error) => {
          reject(error);
        });
      });
    });
  };

  export {insertUsuariosFromAPI, getUsuarios}