// database.js
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("database.db");

const handleLogs = (logs, mensaje, setLogs) => {
  console.log("handlelogs: ", mensaje);
  setLogs([...logs, mensaje]);
  return [...logs, mensaje];
};

// inicializa todos los campos de la vase de datos
const initDatabase = async (logs, setLogs) => {
  handleLogs(logs, "iniciando DB", setLogs);
  if (!db) {
    handleLogs(logs, "Error: La base de datos no está inicializada", setLogs);
    console.log("Error: La base de datos no está inicializada");
    return Promise.reject("La base de datos no está inicializada");
  }

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        handleLogs(logs, "Transacción iniciada", setLogs);
        console.log("Transacción iniciada");
        // Crea la tabla usuarios si no existe
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS usuarios (id TEXT PRIMARY KEY, descripcion TEXT, clave TEXT)",
          [],
          () => {
            logs = handleLogs(
              logs,
              "Tabla usuarios creada exitosamente",
              setLogs
            );
            console.log("Tabla usuarios creada/verificada exitosamente");
          },
          (_, error) => {
            handleLogs(
              logs,
              "Error al crear la tabla usuarios" + error,
              setLogs
            );
            console.error("Error al crear tabla usuarios:", error);
            reject(error);
          }
        );
      },
      (error) => {
        console.error("Error en transacción de inicialización:", error);
        reject(error);
      },
      () => {
        console.log("Inicialización de base de datos completada");
        resolve();
      }
    );
  });
};

// En tu controlador de base de datos
export const getTables = async () => {
  initDatabase();
  try {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT name FROM sqlite_master WHERE type="table";',
          [],
          (_, result) => {
            // const tables = result.rows._array.map(row => row.name);
            const tables = result.rows.raw().map((row) => row.name);
            resolve(tables);
          },
          (_, error) => {
            console.error("Error al ejecutar la consulta:", error);
            reject(error);
          }
        );
      });
    });
  } catch (error) {
    console.error("Error al obtener la lista de tablas:", error);
    throw error;
  }
};
// Limpia todas las tablas de la base de datos
const limpiarDatos = async (logs, setLogs) => {
  console.log("limpiar datos");
  db.transaction((tx) => {
    // Elimina la tabla usuarios si existe
    tx.executeSql(
      "DROP TABLE IF EXISTS usuarios",
      [],
      () =>
        (logs = handleLogs(
          logs,
          "Tabla usuarios eliminada exitosamente",
          setLogs
        )),
      (_, error) =>
        handleLogs(
          logs,
          "Error al eliminar la tabla usuarios: " + error,
          setLogs
        )
    );

    // Elimina la tabla clientes si existe
    tx.executeSql(
      "DROP TABLE IF EXISTS clientes",
      [],
      () =>
        (logs = handleLogs(
          logs,
          "Tabla clientes eliminada exitosamente",
          setLogs
        )),
      (_, error) =>
        (logs = handleLogs(
          logs,
          "Error al eliminar la tabla clientes: " + error,
          setLogs
        ))
    );

    // Elimina la tabla articulos si existe
    tx.executeSql(
      "DROP TABLE IF EXISTS articulos",
      [],
      () =>
        (logs = handleLogs(
          logs,
          "Tabla articulos eliminada exitosamente",
          setLogs
        )),
      (_, error) =>
        (logs = handleLogs(
          logs,
          "Error al eliminar la tabla articulos: " + error,
          setLogs
        ))
    );

    // Elimina la tabla preventaCabeza si existe
    tx.executeSql(
      "DROP TABLE IF EXISTS preventaCabeza",
      [],
      () =>
        (logs = handleLogs(
          logs,
          "Tabla preventaCabeza eliminada exitosamente",
          setLogs
        )),
      (_, error) =>
        (logs = handleLogs(
          logs,
          "Error al eliminar la tabla preventaCabeza: " + error,
          setLogs
        ))
    );

    // Elimina la tabla preventaItem si existe
    tx.executeSql(
      "DROP TABLE IF EXISTS preventaItem",
      [],
      () =>
        (logs = handleLogs(
          logs,
          "Tabla preventaItem eliminada exitosamente",
          setLogs
        )),
      (_, error) =>
        (logs = handleLogs(
          logs,
          "Error al eliminar la tabla preventaItem: " + error,
          setLogs
        ))
    );
  });
};

export {
  db,
  initDatabase,
  limpiarDatos /*,, getClientes, insertArticulosFromAPI, getArticulos, getUsuarios, insertUsuariosFromAPI*/,
};
