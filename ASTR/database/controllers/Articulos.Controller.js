// ARCHIVO COMENTADO - SQLite no disponible en versión web
// import { db } from '../database';

// Funciones mock para evitar errores en versión web
const borrarArticulosDeSqlite = async () => {
  console.log("Función mock: borrarArticulosDeSqlite - SQLite no disponible en web");
  return Promise.resolve();
};

const insertArticulosFrecuentesToSqlite = async (data) => {
  console.log("Función mock: insertArticulosFrecuentesToSqlite - SQLite no disponible en web");
  return Promise.resolve();
};

const insertArticulosFromAPI = (data) => {
  console.log("Función mock: insertArticulosFromAPI - SQLite no disponible en web");
  return Promise.resolve([]);
};

const getArticuloPorCodigo = (codigo) => {
  console.log("Función mock: getArticuloPorCodigo - SQLite no disponible en web");
  return Promise.resolve([]);
};

const getArticulosFiltrados = (searchWord) => {
  console.log("Función mock: getArticulosFiltrados - SQLite no disponible en web");
  return Promise.resolve([]);
};

const getArticulosFiltradosXCodigo = (searchWord) => {
  console.log("Función mock: getArticulosFiltradosXCodigo - SQLite no disponible en web");
  return Promise.resolve([]);
};

const getArticulosFrecuentes = (arrayDeCodigos) => {
  console.log("Función mock: getArticulosFrecuentes - SQLite no disponible en web");
  return Promise.resolve([]);
};

const getArticulos = () => {
  console.log("Función mock: getArticulos - SQLite no disponible en web");
  return Promise.resolve([]);
};

export {
  insertArticulosFromAPI, 
  getArticulosFiltrados, 
  borrarArticulosDeSqlite, 
  insertArticulosFrecuentesToSqlite, 
  getArticuloPorCodigo, 
  getArticulosFiltradosXCodigo, 
  getArticulosFrecuentes,
  getArticulos
};