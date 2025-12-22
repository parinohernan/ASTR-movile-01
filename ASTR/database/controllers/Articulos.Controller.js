import { db } from '../database';

const borrarArticulosDeSqlite = async () => {
  try {
    db.withTransactionSync(() => {
      const result = db.runSync('DELETE FROM articulos WHERE 1=1');
      console.log("Todos los artículos existentes han sido eliminados. Filas afectadas:", result.changes);
    });
  } catch (error) {
    console.log('Error al eliminar artículos existentes:', error);
    throw error;
  }
};

const insertArticulosFrecuentesToSqlite = async (data) => {
  console.log("ART ctr 20", data);
  // tengo que borrar los que tenga y agregar los del nuevo cliente
};

const insertArticulosFromAPI = (data) => {
  try {
    db.withTransactionSync(() => {
      let totalInsertados = 0;

      data.forEach((item) => {
        db.runSync(
          'INSERT OR REPLACE INTO articulos (id, descripcion, existencia, precioCosto, unidadVenta, iva, lista1, lista2, lista3, lista4, lista5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            item.codigo,
            item.descripcion,
            item.existencia,
            item.precioCosto,
            item.unidadVenta,
            item.porcentajeIVA1,
            item.lista1,
            item.lista2,
            item.lista3,
            item.lista4,
            item.lista5
          ]
        );
        totalInsertados++;
        console.log(totalInsertados, " ", item.codigo, ". ");
      });

      // Después de insertar todos los artículos, obtener el total
      const countResult = db.getFirstSync('SELECT COUNT(*) as count FROM articulos');
      console.log(`${totalInsertados} artículos insertados exitosamente. Total de artículos en la base de datos: ${countResult?.count || 0}`);
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error al insertar artículos:', error);
    return Promise.reject(error);
  }
};

/** La idea es buscar el articulo teniendo el ID **/
const getArticuloPorCodigo = (codigo) => {
  try {
    console.log("Obteniendo artículos por codigo de la base de datos local...");
    const articulos = db.getAllSync('SELECT * FROM articulos WHERE id = ?', [codigo]);
    return Promise.resolve(articulos);
  } catch (error) {
    console.error('Error al obtener artículo por código:', error);
    return Promise.reject(error);
  }
};

/** La idea es filtrar y paginar todo en esta funcion */
const getArticulosFiltrados = (searchWord) => {
  try {
    console.log("Obteniendo artículos filtrados de la base de datos local...");
    const articulos = db.getAllSync('SELECT * FROM articulos WHERE descripcion LIKE ?', [`%${searchWord}%`]);
    return Promise.resolve(articulos);
  } catch (error) {
    console.error('Error al obtener artículos filtrados:', error);
    return Promise.reject(error);
  }
};

const getArticulosFiltradosXCodigo = (searchWord) => {
  try {
    console.log("Obteniendo artículos por codigo filtrados de la base de datos local...");
    const articulos = db.getAllSync('SELECT * FROM articulos WHERE id LIKE ?', [`%${searchWord}%`]);
    return Promise.resolve(articulos);
  } catch (error) {
    console.error('Error al obtener artículos filtrados por código:', error);
    return Promise.reject(error);
  }
};

const getArticulosFrecuentes = (arrayDeCodigos) => {
  try {
    console.log("Obteniendo artículos frecuentes de la base de datos local...");

    // Convierte el array de códigos en una lista separada por comas
    const placeholders = arrayDeCodigos.map(() => '?').join(',');
    const articulos = db.getAllSync(`SELECT * FROM articulos WHERE id IN (${placeholders})`, arrayDeCodigos);
    
    return Promise.resolve(articulos);
  } catch (error) {
    console.error('Error al obtener artículos frecuentes:', error);
    return Promise.reject(error);
  }
};

function getArticulos() {
  try {
    console.log("traigo los articulos de la base de datos local");
    const articulos = db.getAllSync('SELECT * FROM articulos');
    return Promise.resolve(articulos);
  } catch (error) {
    console.error('Error al obtener artículos:', error);
    return Promise.reject(error);
  }
}

export { insertArticulosFromAPI, getArticulosFiltrados, borrarArticulosDeSqlite, insertArticulosFrecuentesToSqlite, getArticuloPorCodigo, getArticulosFiltradosXCodigo, getArticulosFrecuentes, getArticulos };
