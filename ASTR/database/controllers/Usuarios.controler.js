import { db } from '../database';

const handleLogs = (logs, mensaje, setLogs) => {
  console.log("L M ",mensaje);
  setLogs( [...logs, mensaje]);
  return [...logs, mensaje];
};

const insertUsuariosFromAPI = (data, setLogs) => {
  let logs=[];  
  logs = handleLogs(logs,("vendedores..."),setLogs);
  return new Promise((resolve, reject) => {
      db.transaction(tx => {
        data.forEach(item => {
          tx.executeSql(
            'INSERT OR REPLACE INTO usuarios (id, descripcion, clave) VALUES (?, ?, ?)',
            [item.codigo, item.descripcion, item.clave],
            (_, result) => {
              console.log('Usuario insertado con ID: ', result.insertId);
            },
            (_, error) => {
              console.log('Error al insertar usuario: ', error, item.codigo, item.descripcion, item.clave);
              logs = handleLogs(logs,('Error al insertar usuario: '+ error + item.descripcion ),setLogs);
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