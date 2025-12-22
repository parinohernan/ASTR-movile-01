// database.js
// Adaptador de compatibilidad para expo-sqlite v16
// La nueva API usa openDatabaseSync pero el código existente usa la API antigua con callbacks
import { openDatabaseSync } from "expo-sqlite";

// Función de compatibilidad que mantiene la API antigua
function openDatabaseCompat(databaseName) {
  const db = openDatabaseSync(databaseName);
  
  // Crear un objeto compatible con la API antigua
  return {
    transaction: (callback, errorCallback, successCallback) => {
      try {
        // Usar withTransactionSync para mantener compatibilidad con callbacks
        db.withTransactionSync(() => {
          // Crear un objeto transaction compatible con la API antigua
          const tx = {
            executeSql: (sql, params = [], success, error) => {
              try {
                // Determinar si es una consulta SELECT u otro tipo
                const sqlUpper = sql.trim().toUpperCase();
                const isSelect = sqlUpper.startsWith('SELECT') || sqlUpper.startsWith('PRAGMA');
                
                if (isSelect) {
                  // Para SELECT/PRAGMA, usar getAllSync o getFirstSync
                  // Intentar detectar si necesitamos solo el primero o todos
                  const needsFirst = sqlUpper.includes('LIMIT 1') || sqlUpper.includes('PRAGMA');
                  
                  let rows;
                  if (needsFirst) {
                    const first = db.getFirstSync(sql, params);
                    rows = first ? [first] : [];
                  } else {
                    rows = db.getAllSync(sql, params);
                  }
                  
                  // Convertir el resultado al formato esperado por el código antiguo
                  const compatResult = {
                    insertId: null,
                    rowsAffected: 0,
                    rows: {
                      length: rows.length,
                      item: (index) => rows[index] || null,
                      _array: rows,
                      raw: () => rows
                    }
                  };
                  
                  if (success) {
                    success(null, compatResult);
                  }
                  return compatResult;
                } else {
                  // Para INSERT/UPDATE/DELETE, usar runSync
                  const result = db.runSync(sql, params);
                  
                  // Convertir el resultado al formato esperado
                  const compatResult = {
                    insertId: result.lastInsertRowId,
                    rowsAffected: result.changes,
                    rows: {
                      length: 0,
                      item: (index) => null,
                      _array: [],
                      raw: () => []
                    }
                  };
                  
                  if (success) {
                    success(null, compatResult);
                  }
                  return compatResult;
                }
              } catch (err) {
                if (error) {
                  error(null, err);
                } else {
                  throw err;
                }
                return null;
              }
            }
          };
          
          callback(tx);
        });
        
        if (successCallback) {
          successCallback();
        }
      } catch (err) {
        if (errorCallback) {
          errorCallback(err);
        } else {
          throw err;
        }
      }
    }
  };
}

// Usar la función de compatibilidad
const SQLite = {
  openDatabase: openDatabaseCompat
};

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

        // Crea la tabla clientes si no existe
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS clientes (
            id TEXT PRIMARY KEY, 
            descripcion TEXT, 
            cuit TEXT, 
            calle TEXT, 
            numero TEXT, 
            piso TEXT, 
            departamento TEXT, 
            codigoPostal TEXT, 
            localidad TEXT, 
            telefono TEXT, 
            mail TEXT, 
            contactoComercial TEXT, 
            categoriaIva TEXT, 
            listaPrecio TEXT, 
            importeDeuda REAL, 
            codigoVendedor TEXT, 
            actualizado TEXT, 
            saldoNTCNoAplicado REAL, 
            limiteCredito REAL
          )`,
          [],
          () => {
            logs = handleLogs(
              logs,
              "Tabla clientes creada exitosamente",
              setLogs
            );
            console.log("Tabla clientes creada/verificada exitosamente");
          },
          (_, error) => {
            handleLogs(
              logs,
              "Error al crear la tabla clientes" + error,
              setLogs
            );
            console.error("Error al crear tabla clientes:", error);
            reject(error);
          }
        );

        // Crea la tabla articulos si no existe
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS articulos (
            id TEXT PRIMARY KEY, 
            descripcion TEXT, 
            existencia INTEGER, 
            precioCosto REAL, 
            unidadVenta TEXT, 
            iva REAL, 
            lista1 REAL, 
            lista2 REAL, 
            lista3 REAL, 
            lista4 REAL, 
            lista5 REAL
          )`,
          [],
          () => {
            logs = handleLogs(
              logs,
              "Tabla articulos creada exitosamente",
              setLogs
            );
            console.log("Tabla articulos creada/verificada exitosamente");
          },
          (_, error) => {
            handleLogs(
              logs,
              "Error al crear la tabla articulos" + error,
              setLogs
            );
            console.error("Error al crear tabla articulos:", error);
            reject(error);
          }
        );

        // Crea la tabla preventaCabeza si no existe
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS preventaCabeza (
            id TEXT PRIMARY KEY, 
            cliente TEXT, 
            vendedor TEXT, 
            observacion TEXT, 
            fecha TEXT, 
            cantidadItems INTEGER, 
            importeTotal REAL
          )`,
          [],
          () => {
            logs = handleLogs(
              logs,
              "Tabla preventaCabeza creada exitosamente",
              setLogs
            );
            console.log("Tabla preventaCabeza creada/verificada exitosamente");
          },
          (_, error) => {
            handleLogs(
              logs,
              "Error al crear la tabla preventaCabeza" + error,
              setLogs
            );
            console.error("Error al crear tabla preventaCabeza:", error);
            reject(error);
          }
        );

        // Crea la tabla preventaItem si no existe
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS preventaItem (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            idPreventa TEXT, 
            articulo TEXT, 
            cantidad INTEGER, 
            importe REAL,
            porcentajeBonificacion REAL,
            precioLista REAL,
            iva REAL
          )`,
          [],
          () => {
            logs = handleLogs(
              logs,
              "Tabla preventaItem creada exitosamente",
              setLogs
            );
            console.log("Tabla preventaItem creada/verificada exitosamente");
          },
          (_, error) => {
            handleLogs(
              logs,
              "Error al crear la tabla preventaItem" + error,
              setLogs
            );
            console.error("Error al crear tabla preventaItem:", error);
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
        // Ejecutar migración después de la inicialización
        migrateDatabase()
          .then(() => {
            console.log("Migración de base de datos completada");
        resolve();
          })
          .catch((error) => {
            console.error("Error en migración:", error);
            resolve(); // Resolver de todas formas para no bloquear la app
          });
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

// Función para migrar la base de datos y agregar nuevas columnas
const migrateDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // Agregar columna porcentajeBonificacion si no existe
      tx.executeSql(
        "PRAGMA table_info(preventaItem)",
        [],
        (_, result) => {
          const columns = [];
          for (let i = 0; i < result.rows.length; i++) {
            columns.push(result.rows.item(i).name);
          }
          
          if (!columns.includes('porcentajeBonificacion')) {
            tx.executeSql(
              "ALTER TABLE preventaItem ADD COLUMN porcentajeBonificacion REAL",
              [],
              () => console.log("Columna porcentajeBonificacion agregada"),
              (_, error) => console.error("Error agregando porcentajeBonificacion:", error)
            );
          }
          
          if (!columns.includes('precioLista')) {
            tx.executeSql(
              "ALTER TABLE preventaItem ADD COLUMN precioLista REAL",
              [],
              () => console.log("Columna precioLista agregada"),
              (_, error) => console.error("Error agregando precioLista:", error)
            );
          }
          
          if (!columns.includes('iva')) {
            tx.executeSql(
              "ALTER TABLE preventaItem ADD COLUMN iva REAL",
              [],
              () => console.log("Columna iva agregada"),
              (_, error) => console.error("Error agregando iva:", error)
            );
          }
        },
        (_, error) => {
          console.error("Error verificando estructura de tabla:", error);
          reject(error);
        }
      );
    }, reject, resolve);
  });
};

export {
  db,
  initDatabase,
  limpiarDatos /*,, getClientes, insertArticulosFromAPI, getArticulos, getUsuarios, insertUsuariosFromAPI*/,
};
