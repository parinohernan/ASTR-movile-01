// ARCHIVO COMENTADO - SQLite no disponible en versión web
// import { db } from '../database';

const handleLogs = (logs, mensaje, setLogs) => {
  console.log("haldlerLogs UsersControler", mensaje);
  setLogs([...logs, mensaje]);
  return [...logs, mensaje];
};

// const insertUsuariosFromAPI = (data, logs, setLogs) => {

//   logs = handleLogs(logs,("vendedores..."),setLogs);

//   if (!db) {
//     handleLogs(logs, "Error: La base de datos no está inicializada", setLogs);
//     return;
//   }

//   return new Promise((resolve, reject) => {
//       db.transaction(tx => {
//         data.forEach(item => {
//           tx.executeSql(
//             'INSERT OR REPLACE INTO usuarios (id, descripcion, clave) VALUES (?, ?, ?)',
//             [item.codigo, item.descripcion, item.clave],
//             (_, result) => {
//               console.log('Usuario insertado con ID: ', result.insertId);
//             },
//             (_, error) => {
//               console.log('Error al insertar usuario: ', error, item.codigo, item.descripcion, item.clave);
//               logs = handleLogs(logs,('Error al insertar usuario: '+ error + item.descripcion ),setLogs);
//             }
//           );
//         });
//       }, undefined, resolve, reject);
//     });
//   };
const insertUsuariosFromAPI = (data) => {
  console.log("Función mock: insertUsuariosFromAPI - SQLite no disponible en web");
  return Promise.resolve([]);
};

const getUsuarios = () => {
  console.log("Función mock: getUsuarios - SQLite no disponible en web");
  return Promise.resolve([]);
};

const insertUsuariosPrueba = () => {
  console.log("Función mock: insertUsuariosPrueba - SQLite no disponible en web");
  return Promise.resolve([]);
};

export {
  insertUsuariosFromAPI,
  getUsuarios,
  insertUsuariosPrueba
};
