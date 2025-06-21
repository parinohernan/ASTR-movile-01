import { db } from "../database";

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
const insertUsuariosFromAPI = (data, logs, setLogs) => {
  logs = handleLogs(
    logs,
    "Verificando y creando tabla usuarios si no existe...",
    setLogs
  );

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Verificar y crear la tabla vendedores si no existe
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS usuarios (id TEXT PRIMARY KEY, nombre TEXT)",
          [],
          (_, result) => {
            logs = handleLogs(
              logs,
              "Tabla usuarios verificada/creada exitosamente",
              setLogs
            );
          },
          (_, error) => {
            logs = handleLogs(
              logs,
              "Error al crear la tabla usuarios: " + error.message,
              setLogs
            );
            reject(error);
          }
        );

        // Insertar datos en la tabla usuarios
        data.forEach((item) => {
          tx.executeSql(
            "INSERT OR REPLACE INTO usuarios (id, descripcion, clave) VALUES (?, ?, ?)",
            [item.codigo, item.descripcion, item.clave],
            (_, result) => {
              console.log("Usuario insertado con ID: ", result.insertId);
            },
            (_, error) => {
              console.log(
                "Error al insertar usuario: ",
                error,
                item.codigo,
                item.descripcion,
                item.clave
              );
              logs = handleLogs(
                logs,
                "Error al insertar usuario: " +
                  error.message +
                  " " +
                  item.descripcion,
                setLogs
              );
            }
          );
        });
      },
      (error) => {
        handleLogs(logs, "Error en la transacción: " + error.message, setLogs);
        reject(error);
      },
      () => {
        handleLogs(logs, "Transacción completada exitosamente", setLogs);
        resolve();
      }
    );
  });
};

const getUsuarios = () => {
  return new Promise((resolve, reject) => {
    console.log("traigo los usuarios de la api");
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM usuarios",
        [],
        (_, { rows }) => {
          console.log("Usuarios obtenidos:", rows._array);
          resolve(rows._array || []);
        },
        (_, error) => {
          console.log("Error al obtener usuarios:", error);
          // Si hay error, retornar array vacío en lugar de rechazar
          resolve([]);
        }
      );
    });
  });
};

const insertUsuariosPrueba = () => {
  return new Promise((resolve, reject) => {
    console.log("Insertando usuarios de prueba");
    db.transaction(
      (tx) => {
        // Insertar algunos usuarios de prueba
        const usuariosPrueba = [
          { id: "1", descripcion: "Hernan Parino", clave: "1234" },
          { id: "2", descripcion: "Usuario Test", clave: "5678" },
          { id: "3", descripcion: "Admin Demo", clave: "9999" },
        ];

        usuariosPrueba.forEach((usuario) => {
          tx.executeSql(
            "INSERT OR REPLACE INTO usuarios (id, descripcion, clave) VALUES (?, ?, ?)",
            [usuario.id, usuario.descripcion, usuario.clave],
            (_, result) => {
              console.log("Usuario de prueba insertado: ", usuario.descripcion);
            },
            (_, error) => {
              console.log("Error al insertar usuario de prueba: ", error);
            }
          );
        });
      },
      (error) => {
        console.error("Error en transacción de usuarios de prueba:", error);
        reject(error);
      },
      () => {
        console.log("Usuarios de prueba insertados exitosamente");
        resolve();
      }
    );
  });
};

export { insertUsuariosFromAPI, getUsuarios, insertUsuariosPrueba };
