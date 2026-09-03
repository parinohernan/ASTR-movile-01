// database.js
// Usando la nueva API de expo-sqlite v16
import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync("database.db");

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

  try {
    handleLogs(logs, "Transacción iniciada", setLogs);
    console.log("Transacción iniciada");
    
    db.withTransactionSync(() => {
      // Crea la tabla usuarios si no existe
      try {
        db.execSync("CREATE TABLE IF NOT EXISTS usuarios (id TEXT PRIMARY KEY, descripcion TEXT, clave TEXT)");
        logs = handleLogs(logs, "Tabla usuarios creada exitosamente", setLogs);
        console.log("Tabla usuarios creada/verificada exitosamente");
      } catch (error) {
        handleLogs(logs, "Error al crear la tabla usuarios: " + error, setLogs);
        console.error("Error al crear tabla usuarios:", error);
        throw error;
      }

      // Crea la tabla clientes si no existe
      try {
        db.execSync(`CREATE TABLE IF NOT EXISTS clientes (
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
        )`);
        logs = handleLogs(logs, "Tabla clientes creada exitosamente", setLogs);
        console.log("Tabla clientes creada/verificada exitosamente");
      } catch (error) {
        handleLogs(logs, "Error al crear la tabla clientes: " + error, setLogs);
        console.error("Error al crear tabla clientes:", error);
        throw error;
      }

      // Crea la tabla articulos si no existe
      try {
        db.execSync(`CREATE TABLE IF NOT EXISTS articulos (
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
        )`);
        logs = handleLogs(logs, "Tabla articulos creada exitosamente", setLogs);
        console.log("Tabla articulos creada/verificada exitosamente");
      } catch (error) {
        handleLogs(logs, "Error al crear la tabla articulos: " + error, setLogs);
        console.error("Error al crear tabla articulos:", error);
        throw error;
      }

      // Crea la tabla preventaCabeza si no existe
      try {
        db.execSync(`CREATE TABLE IF NOT EXISTS preventaCabeza (
          id TEXT PRIMARY KEY, 
          cliente TEXT, 
          vendedor TEXT, 
          observacion TEXT, 
          fecha TEXT, 
          cantidadItems INTEGER, 
          importeTotal REAL,
          latitud REAL,
          longitud REAL
        )`);
        logs = handleLogs(logs, "Tabla preventaCabeza creada exitosamente", setLogs);
        console.log("Tabla preventaCabeza creada/verificada exitosamente");
      } catch (error) {
        handleLogs(logs, "Error al crear la tabla preventaCabeza: " + error, setLogs);
        console.error("Error al crear tabla preventaCabeza:", error);
        throw error;
      }

      // Crea la tabla preventaItem si no existe
      try {
        db.execSync(`CREATE TABLE IF NOT EXISTS preventaItem (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          idPreventa TEXT, 
          articulo TEXT, 
          cantidad INTEGER, 
          importe REAL,
          porcentajeBonificacion REAL,
          precioLista REAL,
          iva REAL
        )`);
        logs = handleLogs(logs, "Tabla preventaItem creada exitosamente", setLogs);
        console.log("Tabla preventaItem creada/verificada exitosamente");
      } catch (error) {
        handleLogs(logs, "Error al crear la tabla preventaItem: " + error, setLogs);
        console.error("Error al crear tabla preventaItem:", error);
        throw error;
      }
    });

    console.log("Inicialización de base de datos completada");
    
    // Ejecutar migración después de la inicialización
    await migrateDatabase();
    console.log("Migración de base de datos completada");
    
    return Promise.resolve();
  } catch (error) {
    console.error("Error en transacción de inicialización:", error);
    return Promise.reject(error);
  }
};

// En tu controlador de base de datos
export const getTables = async () => {
  await initDatabase();
  try {
    const rows = db.getAllSync('SELECT name FROM sqlite_master WHERE type="table";');
    return rows.map((row) => row.name);
  } catch (error) {
    console.error("Error al obtener la lista de tablas:", error);
    throw error;
  }
};

// Limpia todas las tablas de la base de datos
const limpiarDatos = async (logs, setLogs) => {
  console.log("limpiar datos");
  try {
    db.withTransactionSync(() => {
      // Elimina la tabla usuarios si existe
      try {
        db.execSync("DROP TABLE IF EXISTS usuarios");
        logs = handleLogs(logs, "Tabla usuarios eliminada exitosamente", setLogs);
      } catch (error) {
        handleLogs(logs, "Error al eliminar la tabla usuarios: " + error, setLogs);
      }

      // Elimina la tabla clientes si existe
      try {
        db.execSync("DROP TABLE IF EXISTS clientes");
        logs = handleLogs(logs, "Tabla clientes eliminada exitosamente", setLogs);
      } catch (error) {
        logs = handleLogs(logs, "Error al eliminar la tabla clientes: " + error, setLogs);
      }

      // Elimina la tabla articulos si existe
      try {
        db.execSync("DROP TABLE IF EXISTS articulos");
        logs = handleLogs(logs, "Tabla articulos eliminada exitosamente", setLogs);
      } catch (error) {
        logs = handleLogs(logs, "Error al eliminar la tabla articulos: " + error, setLogs);
      }

      // Elimina la tabla preventaCabeza si existe
      try {
        db.execSync("DROP TABLE IF EXISTS preventaCabeza");
        logs = handleLogs(logs, "Tabla preventaCabeza eliminada exitosamente", setLogs);
      } catch (error) {
        logs = handleLogs(logs, "Error al eliminar la tabla preventaCabeza: " + error, setLogs);
      }

      // Elimina la tabla preventaItem si existe
      try {
        db.execSync("DROP TABLE IF EXISTS preventaItem");
        logs = handleLogs(logs, "Tabla preventaItem eliminada exitosamente", setLogs);
      } catch (error) {
        logs = handleLogs(logs, "Error al eliminar la tabla preventaItem: " + error, setLogs);
      }
    });
  } catch (error) {
    console.error("Error al limpiar datos:", error);
  }
};

// Función para migrar la base de datos y agregar nuevas columnas
const migrateDatabase = async () => {
  try {
    db.withTransactionSync(() => {
      // Obtener información de las columnas de preventaItem
      const columnsInfo = db.getAllSync("PRAGMA table_info(preventaItem)");
      const columns = columnsInfo.map(col => col.name);
      
      if (!columns.includes('porcentajeBonificacion')) {
        try {
          db.execSync("ALTER TABLE preventaItem ADD COLUMN porcentajeBonificacion REAL");
          console.log("Columna porcentajeBonificacion agregada");
        } catch (error) {
          console.error("Error agregando porcentajeBonificacion:", error);
        }
      }
      
      if (!columns.includes('precioLista')) {
        try {
          db.execSync("ALTER TABLE preventaItem ADD COLUMN precioLista REAL");
          console.log("Columna precioLista agregada");
        } catch (error) {
          console.error("Error agregando precioLista:", error);
        }
      }
      
      if (!columns.includes('iva')) {
        try {
          db.execSync("ALTER TABLE preventaItem ADD COLUMN iva REAL");
          console.log("Columna iva agregada");
        } catch (error) {
          console.error("Error agregando iva:", error);
        }
      }

      const cabezaInfo = db.getAllSync("PRAGMA table_info(preventaCabeza)");
      const cabezaColumns = cabezaInfo.map((col) => col.name);

      if (!cabezaColumns.includes('latitud')) {
        try {
          db.execSync("ALTER TABLE preventaCabeza ADD COLUMN latitud REAL");
          console.log("Columna latitud agregada a preventaCabeza");
        } catch (error) {
          console.error("Error agregando latitud:", error);
        }
      }

      if (!cabezaColumns.includes('longitud')) {
        try {
          db.execSync("ALTER TABLE preventaCabeza ADD COLUMN longitud REAL");
          console.log("Columna longitud agregada a preventaCabeza");
        } catch (error) {
          console.error("Error agregando longitud:", error);
        }
      }

      const usuariosInfo = db.getAllSync("PRAGMA table_info(usuarios)");
      const usuariosColumns = usuariosInfo.map((col) => col.name);

      if (!usuariosColumns.includes('empresa_codigo')) {
        try {
          db.execSync("ALTER TABLE usuarios ADD COLUMN empresa_codigo TEXT");
          console.log("Columna empresa_codigo agregada a usuarios");
        } catch (error) {
          console.error("Error agregando empresa_codigo:", error);
        }
      }

      if (!usuariosColumns.includes('rol')) {
        try {
          db.execSync("ALTER TABLE usuarios ADD COLUMN rol TEXT DEFAULT 'vendedor'");
          console.log("Columna rol agregada a usuarios");
        } catch (error) {
          console.error("Error agregando rol:", error);
        }
      }
    });
  } catch (error) {
    console.error("Error en migración:", error);
    throw error;
  }
};

export {
  db,
  initDatabase,
  limpiarDatos /*,, getClientes, insertArticulosFromAPI, getArticulos, getUsuarios, insertUsuariosFromAPI*/,
};
