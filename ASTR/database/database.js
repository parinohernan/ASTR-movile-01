// database.js - Solo para web
import { WebStorage } from './webStorage.js';

let webStorage = null;

const handleLogs = (logs, mensaje, setLogs) => {
  console.log("handlelogs: ", mensaje);
  if (setLogs) {
    setLogs([...logs, mensaje]);
  }
  return [...logs, mensaje];
};

// inicializa todos los campos de la base de datos
const initDatabase = async (logs = [], setLogs = null) => {
  handleLogs(logs, "iniciando DB web", setLogs);
  
  try {
    console.log('🌐 Inicializando almacenamiento web...');
    webStorage = new WebStorage();
    await webStorage.init();
    console.log('✅ Almacenamiento web inicializado');
    return webStorage;
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
    throw error;
  }
};

// Función helper para ejecutar consultas
export const executeQuery = async (query, params = []) => {
  try {
    if (!webStorage) {
      throw new Error('Base de datos no inicializada');
    }
    return await webStorage.executeQuery(query, params);
  } catch (error) {
    console.error('❌ Error en executeQuery:', error);
    throw error;
  }
};

// Función helper para obtener datos
export const getData = async (query, params = []) => {
  try {
    if (!webStorage) {
      throw new Error('Base de datos no inicializada');
    }
    return await webStorage.getData(query, params);
  } catch (error) {
    console.error('❌ Error en getData:', error);
    throw error;
  }
};

// Función helper para insertar datos
export const insertData = async (query, params = []) => {
  try {
    if (!webStorage) {
      throw new Error('Base de datos no inicializada');
    }
    return await webStorage.insertData(query, params);
  } catch (error) {
    console.error('❌ Error en insertData:', error);
    throw error;
  }
};

// Función helper para actualizar datos
export const updateData = async (query, params = []) => {
  try {
    if (!webStorage) {
      throw new Error('Base de datos no inicializada');
    }
    return await webStorage.updateData(query, params);
  } catch (error) {
    console.error('❌ Error en updateData:', error);
    throw error;
  }
};

// Función helper para eliminar datos
export const deleteData = async (query, params = []) => {
  try {
    if (!webStorage) {
      throw new Error('Base de datos no inicializada');
    }
    return await webStorage.deleteData(query, params);
  } catch (error) {
    console.error('❌ Error en deleteData:', error);
    throw error;
  }
};

// Limpia todas las tablas de la base de datos
const limpiarDatos = async (logs, setLogs) => {
  console.log("limpiar datos web");
  try {
    if (!webStorage) {
      throw new Error('Base de datos no inicializada');
    }
    
    // Limpiar localStorage
    localStorage.clear();
    await webStorage.init(); // Reinicializar con datos vacíos
    
    handleLogs(logs, "Datos web limpiados exitosamente", setLogs);
  } catch (error) {
    handleLogs(logs, "Error al limpiar datos web: " + error, setLogs);
    throw error;
  }
};

export {
  webStorage,
  initDatabase,
  limpiarDatos,
};
