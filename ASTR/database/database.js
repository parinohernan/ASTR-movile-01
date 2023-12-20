// database.js
import * as SQLite from 'expo-sqlite';
// import {insertClientesFromAPI, getClientes } from './controllers/Clientes.Controler';
// import { insertUsuariosFromAPI, getUsuarios } from './controllers/Usuarios.controler';
// import {insertArticulosFromAPI, getArticulos} from './controllers/Articulos.Controler';

const db = SQLite.openDatabase('database.db');

// inicializa todos los campos de la vase de datos
const initDatabase = () => {
  db.transaction(tx => {
    // Crea la tabla usuarios si no existe
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS usuarios (id TEXT PRIMARY KEY, descripcion TEXT, clave TEXT)',
      [],
      () => console.log('Tabla usuarios creada exitosamente'),
      (_, error) => console.log('Error al crear la tabla usuarios', error)
    );

    // Crea la tabla clientes si no existe
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS clientes (id TEXT PRIMARY KEY, descripcion TEXT, cuit TEXT, calle TEXT, numero TEXT, piso TEXT, departamento TEXT, codigoPostal TEXT, localidad TEXT, telefono TEXT, mail TEXT, contactoComercial TEXT, categoriaIva TEXT, listaPrecio TEXT, importeDeuda INTEGER, codigoVendedor TEXT, actualizado BOOLEAN, saldoNTCNoAplicado INTEGER, limiteCredito INTEGER)',
      [],
      () => console.log('Tabla clientes creada exitosamente'),
      (_, error) => console.log('Error al crear la tabla clientes', error)
    );
    // Crea la tabla articulos si no existe
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS articulos (id TEXT PRIMARY KEY, descripcion TEXT, existencia INTEGER, precio REAL, unidadVenta TEXT)',
      [],
      () => console.log('Tabla articulos creada exitosamente'),
      (_, error) => console.log('Error al crear la tabla articulos', error)
    );
    // Crea la tabla preventaCabeza si no existe
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS preventaCabeza (id INTEGER PRIMARY KEY, cliente TEXT, vendedor TEXT, fecha DATETIME, importeTotal INTEGER, cantidadItems INTEGER, observacion TEXT)',
      [],
      () => console.log('Tabla preventaCabeza creada exitosamente'),
      (_, error) => console.log('Error al crear la tabla preventaCabeza', error)
    );
    // Crea la tabla preventaItem si no existe
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS preventaItem (id INTEGER PRIMARY KEY AUTOINCREMENT, idPreventa INTEGER, articulo TEXT, cantidad TEXT, importe INTEGER, FOREIGN KEY (id) REFERENCES preventaCabeza(id))',
      [],
      () => console.log('Tabla preventaItem creada exitosamente'),
      (_, error) => console.log('Error al crear la tabla preventaItem', error)
    );
  });
};

//en verdad solo borra el contenido de las tablas
const eliminarTodasLasTablas = async () => {
  // await db.transaction(tx => {
  //   // Ejecuta instrucciones SQL para eliminar cada tabla
  //   tx.executeSql('DELETE FROM usuarios', [], () => console.log('Datos usuarios eliminados'), (_, error) => console.log('Error al eliminar datos usuarios', error));
  //   // Añade instrucciones DROP para otras tablas si es necesario
  //   tx.executeSql('DELETE FROM clientes', [], () => console.log('Datos clientes eliminados'), (_, error) => console.log('Error al eliminar datos clientes', error));
  //   tx.executeSql('DELETE FROM articulos', [], () => console.log('Datos articulos eliminados'), (_, error) => console.log('Error al eliminar datos articulos', error));
  // });
  await eliminarBaseDeDatos()
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

const eliminarBaseDeDatos = async () => {
  
  try {
    console.log("Eliminando todas las tablas...");
    await db.transaction(async (tx) => {
      // Verifica y elimina la tabla usuarios
      await tx.executeSql('DROP TABLE IF EXISTS usuarios', [], (_, result) => console.log('Tabla usuarios eliminada', result), (_, error) => console.log('Error al eliminar tabla usuarios', error));

      // Verifica y elimina la tabla clientes
      await tx.executeSql('DROP TABLE IF EXISTS clientes', [], (_, result) => console.log('Tabla clientes eliminada', result), (_, error) => console.log('Error al eliminar tabla clientes', error));

      // Verifica y elimina la tabla articulos
      await tx.executeSql('DROP TABLE IF EXISTS articulos', [], (_, result) => console.log('Tabla articulos eliminada', result), (_, error) => console.log('Error al eliminar tabla articulos', error));

      // Verifica y elimina la tabla preventaCabeza
      await tx.executeSql('DROP TABLE IF EXISTS preventaCabeza', [], (_, result) => console.log('Tabla preventaCabeza eliminada', result), (_, error) => console.log('Error al eliminar tabla preventaCabeza', error));

      // Verifica y elimina la tabla preventaItem
      await tx.executeSql('DROP TABLE IF EXISTS preventaItem', [], (_, result) => console.log('Tabla preventaItem eliminada', result), (_, error) => console.log('Error al eliminar tabla preventaItem', error));
    });

    console.log("Todas las tablas eliminadas correctamente.");
  } catch (error) {
    console.error('Error al eliminar todas las tablas:', error);
    throw error;
  }
  
  
};

export { db, initDatabase, eliminarTodasLasTablas/*,, getClientes, insertArticulosFromAPI, getArticulos, getUsuarios, insertUsuariosFromAPI*/ };
