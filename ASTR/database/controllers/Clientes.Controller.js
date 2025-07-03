// ARCHIVO COMENTADO - SQLite no disponible en versión web
// import { db } from '../database';

// Funciones mock para evitar errores en versión web
const insertClientesFromAPI = (data) => {
  console.log("Función mock: insertClientesFromAPI - SQLite no disponible en web");
  return Promise.resolve([]);
};

const getClientes = () => {
  console.log("Función mock: getClientes - SQLite no disponible en web");
  return Promise.resolve([]);
};

export {
  insertClientesFromAPI,
  getClientes
};