import { db } from '../database';

const insertClientesFromAPI = (data) => {
  let clientesInsertados = 0;
  let clientesEliminados = 0;

  try {
    db.withTransactionSync(() => {
      // Paso 1: Obtener los códigos de cliente actuales en la base de datos
      const codigosClientesDB = new Set();
      const rows = db.getAllSync('SELECT id FROM clientes');
      rows.forEach((row) => {
        codigosClientesDB.add(row.id);
      });

      // Paso 2: Iterar sobre los datos recibidos de la API
      data.forEach((item) => {
        const {
          codigo,
          descripcion,
          cuit,
          calle,
          numero,
          piso,
          departamento,
          codigoPostal,
          localidad,
          telefono,
          mail,
          contactoComercial,
          categoriaIva,
          listaPrecio,
          importeDeuda,
          codigoVendedor,
          actualizado,
          saldoNTCNoAplicado,
          limiteCredito
        } = item;

        // Paso 3: Verificar si el cliente ya existe en la base de datos
        if (codigosClientesDB.has(codigo)) {
          // El cliente ya existe, actualiza sus datos
          try {
            db.runSync(
              'UPDATE clientes SET descripcion=?, cuit=?, calle=?, numero=?, piso=?, departamento=?, codigoPostal=?, localidad=?, telefono=?, mail=?, contactoComercial=?, categoriaIva=?, listaPrecio=?, importeDeuda=?, codigoVendedor=?, actualizado=?, saldoNTCNoAplicado=?, limiteCredito=? WHERE id=?',
              [
                descripcion,
                cuit,
                calle,
                numero,
                piso,
                departamento,
                codigoPostal,
                localidad,
                telefono,
                mail,
                contactoComercial,
                categoriaIva,
                listaPrecio,
                importeDeuda,
                codigoVendedor,
                actualizado,
                saldoNTCNoAplicado,
                limiteCredito,
                codigo
              ]
            );
            clientesInsertados++;
            console.log("Cliente actualizado:", codigo);
          } catch (error) {
            console.log('Error al actualizar cliente:', error);
          }
        } else {
          // El cliente no existe en la base de datos, inserta el nuevo cliente
          try {
            db.runSync(
              'INSERT INTO clientes (id, descripcion, cuit, calle, numero, piso, departamento, codigoPostal, localidad, telefono, mail, contactoComercial, categoriaIva, listaPrecio, importeDeuda, codigoVendedor, actualizado, saldoNTCNoAplicado, limiteCredito) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [
                codigo,
                descripcion,
                cuit,
                calle,
                numero,
                piso,
                departamento,
                codigoPostal,
                localidad,
                telefono,
                mail,
                contactoComercial,
                categoriaIva,
                listaPrecio,
                importeDeuda,
                codigoVendedor,
                actualizado,
                saldoNTCNoAplicado,
                limiteCredito
              ]
            );
            clientesInsertados++;
            console.log("Nuevo cliente insertado:", codigo);
          } catch (error) {
            console.log('Error al insertar cliente:', error);
          }
        }

        // Paso 4: Eliminar los clientes que ya no están en los datos recibidos de la API
        codigosClientesDB.delete(codigo);
      });

      // Paso 5: Eliminar clientes que no están presentes en los datos recibidos de la API
      codigosClientesDB.forEach((codigoCliente) => {
        try {
          db.runSync('DELETE FROM clientes WHERE id=?', [codigoCliente]);
          clientesEliminados++;
          console.log("Cliente eliminado:", codigoCliente);
        } catch (error) {
          console.log('Error al eliminar cliente:', error);
        }
      });
    });

    console.log(`Sincronización completada: ${clientesInsertados} clientes procesados, ${clientesEliminados} eliminados`);
    return { clientesInsertados, clientesEliminados };
  } catch (error) {
    console.error('Error en sincronización de clientes:', error);
    throw error;
  }
};

const getClientes = () => {
  try {
    console.log("Obteniendo clientes de la base de datos local");
    const clientes = db.getAllSync('SELECT * FROM clientes');
    return Promise.resolve(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    if (error.message && error.message.includes('no such table')) {
      console.log('La tabla clientes no existe. Se debe inicializar la base de datos primero.');
      return Promise.resolve([]); // Retornar array vacío en lugar de rechazar
    } else {
      return Promise.reject(error);
    }
  }
};

export { insertClientesFromAPI, getClientes };
