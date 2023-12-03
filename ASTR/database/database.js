// database.js
import * as SQLite from 'expo-sqlite';
// import {insertClientesFromAPI, getClientes } from './controllers/Clientes.Controler';
// import { insertUsuariosFromAPI, getUsuarios } from './controllers/Usuarios.controler';
// import {insertArticulosFromAPI, getArticulos} from './controllers/Articulos.Controler';

const db = SQLite.openDatabase('database.db');

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
      'CREATE TABLE IF NOT EXISTS articulos (id TEXT PRIMARY KEY, descripcion TEXT, existencia INTEGER, existenciaMinima INTEGER, existenciaMaxima INTEGER, precioCostoMasImp REAL, porcentajeIVA1 INTEGER, porcentajeIVA2 INTEGER, precioCosto REAL, unidadVenta TEXT, lista1 REAL, lista2 REAL, lista3 REAL, lista4 REAL, lista5 REAL, proveedorCodigo TEXT, rubroCodigo TEXT, peso REAL, siempreSeDescarga BOOLEAN, iva2SobreNeto BOOLEAN, porcentajeVendedor REAL, descuentoXCantidad TEXT)',
      [],
      () => console.log('Tabla articulos creada exitosamente'),
      (_, error) => console.log('Error al crear la tabla articulos', error)
    );
  });
};

//en verdad solo borra el contenido de las tablas
const eliminarTodasLasTablas = async () => {
  await db.transaction(tx => {
    // Ejecuta instrucciones SQL para eliminar cada tabla
    tx.executeSql('DELETE FROM usuarios', [], () => console.log('Datos usuarios eliminados'), (_, error) => console.log('Error al eliminar datos usuarios', error));
    // Añade instrucciones DROP para otras tablas si es necesario
    tx.executeSql('DELETE FROM clientes', [], () => console.log('Datos clientes eliminados'), (_, error) => console.log('Error al eliminar datos clientes', error));
    tx.executeSql('DELETE FROM articulos', [], () => console.log('Datos articulos eliminados'), (_, error) => console.log('Error al eliminar datos articulos', error));
  });
};


export { db, initDatabase, eliminarTodasLasTablas/*, insertClientesFromAPI, getClientes, insertArticulosFromAPI, getArticulos, getUsuarios, insertUsuariosFromAPI*/ };
