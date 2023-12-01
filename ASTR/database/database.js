// database.js
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('database.db');

const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT, descripcion TEXT, clave TEXT)',
      [],
      () => console.log('Tabla usuarios creada exitosamente'),
      (_, error) => console.log('Error al crear la tabla usuarios', error)
    );
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



const eliminarTodasLasTablas = () => {
  db.transaction(tx => {
    // Ejecuta instrucciones SQL para eliminar cada tabla
    tx.executeSql('DROP TABLE IF EXISTS usuarios', [], () => console.log('Tabla usuarios eliminada')),
    (_, error) => console.log('Error al eliminar la tabla usuarios', error);
    // Añade instrucciones DROP para otras tablas si es necesario
  });
};

//actualiza los usuarios de la APP
const insertUsuariosFromAPI = (data) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      data.forEach(item => {
        tx.executeSql(
          'INSERT INTO usuarios (codigo, descripcion, clave) VALUES (?, ?, ?)',
          [item.codigo, item.descripcion, item.clave],
          (_, result) => {
            console.log('Usuario insertado con ID: ', result.insertId);
          },
          (_, error) => {
            console.log('Error al insertar usuario: ', error);
          }
        );
      });
    }, undefined, resolve, reject);
  });
};

export { db, initDatabase, getUsuarios, insertUsuariosFromAPI, eliminarTodasLasTablas };
