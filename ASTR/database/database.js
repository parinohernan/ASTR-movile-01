// database.js
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('database.db');

const handleLogs = (logs, mensaje, setLogs) => {
  console.log("L M ",mensaje);
  setLogs( [...logs, mensaje]);
  return [...logs, mensaje];
};
// inicializa todos los campos de la vase de datos
const initDatabase = async (setLogs) => {
  let logs=[];

  db.transaction(tx => {
    // Crea la tabla usuarios si no existe
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS usuarios (id TEXT PRIMARY KEY, descripcion TEXT, clave TEXT)',
      [],
      () => logs = handleLogs(logs,('Tabla usuarios creada exitosamente'), setLogs),
      (_, error) => handleLogs(logs,('Error al crear la tabla usuarios'+ error), setLogs)
    );

    // Crea la tabla clientes si no existe
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS clientes (id TEXT PRIMARY KEY, descripcion TEXT, cuit TEXT, calle TEXT, numero TEXT, piso TEXT, departamento TEXT, codigoPostal TEXT, localidad TEXT, telefono TEXT, mail TEXT, contactoComercial TEXT, categoriaIva TEXT, listaPrecio TEXT, importeDeuda INTEGER, codigoVendedor TEXT, actualizado BOOLEAN, saldoNTCNoAplicado INTEGER, limiteCredito INTEGER)',
      [],
      () => logs = handleLogs(logs,('Tabla clientes creada exitosamente'), setLogs),
      (_, error) => logs = handleLogs(logs,('Error al crear la tabla clientes'), setLogs)
    );
    // Crea la tabla articulos si no existe
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS articulos (id TEXT PRIMARY KEY, descripcion TEXT, existencia INTEGER, precioCosto REAL, lista1 REAL, lista2 REAL, lista3 REAL, lista4 REAL, lista5 REAL, iva INTEGER, unidadVenta TEXT)',
      [],
      () => logs = handleLogs(logs,('Tabla articulos creada exitosamente'), setLogs),
      (_, error) =>logs =  handleLogs(logs,('Error al crear la tabla articulos'), setLogs)
    );
    // Crea la tabla preventaCabeza si no existe
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS preventaCabeza (id INTEGER PRIMARY KEY, cliente TEXT, vendedor TEXT, fecha DATETIME, importeTotal INTEGER, cantidadItems INTEGER, observacion TEXT)',
      [],
      () => logs = handleLogs(logs,('Tabla preventaCabeza creada exitosamente'), setLogs),
      (_, error) => logs = handleLogs(logs,('Error al crear la tabla preventaCabeza'), setLogs)
    );
    // Crea la tabla preventaItem si no existe
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS preventaItem (id INTEGER PRIMARY KEY AUTOINCREMENT, idPreventa INTEGER, articulo TEXT, cantidad TEXT, importe INTEGER, precioLista INTEGER, porcentajeBonificacion INTEGER, FOREIGN KEY (id) REFERENCES preventaCabeza(id))',
      [],
      () => logs = handleLogs(logs,('Tabla preventaItem creada exitosamente'), setLogs),
      (_, error) => logs = handleLogs(logs,('Error al crear la tabla preventaItem'), setLogs)
    );
  });
};

// En tu controlador de base de datos
export const getTables = async () => {
  initDatabase();
  try {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('SELECT name FROM sqlite_master WHERE type="table";', [], (_, result) => {
          // const tables = result.rows._array.map(row => row.name);
          const tables = result.rows.raw().map(row => row.name);
          resolve(tables);
        }, (_, error) => {
          console.error('Error al ejecutar la consulta:', error);
          reject(error);
        });
      });
    });
  } catch (error) {
    console.error('Error al obtener la lista de tablas:', error);
    throw error;
  }
};

export { db, initDatabase /*,, getClientes, insertArticulosFromAPI, getArticulos, getUsuarios, insertUsuariosFromAPI*/ };
