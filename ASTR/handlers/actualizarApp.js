import axios from 'axios';
import { initDatabase} from '../database/database';
import { borrarArticulosDeSqlite, insertArticulosFromAPI, insertArticulosFrecuentesToSqlite } from '../database/controllers/Articulos.Controller';
import { insertUsuariosFromAPI } from '../database/controllers/Usuarios.controler';
import { insertClientesFromAPI } from '../database/controllers/Clientes.Controller';
import { preventasBDDToArray } from '../database/controllers/Preventa.Controller';
import { borrarContenidoPreventasEnBDD } from '../database/controllers/Preventa.Controller';
import { configuracionEndPoint } from '../src/utils/storageConfigData';

const handleLogs = (logs, mensaje, setLogs) => {
  console.log("handleLogs actualizaAPP ",mensaje);
  setLogs( [...logs, mensaje]);
  return [...logs, mensaje];
};

const actualizarVendedores = async (logs, setLogs) => {
    console.log("Trayendo Vendedores...");
    try {
        const endpoint = await configuracionEndPoint();
        logs = handleLogs(logs, `Conectando a: ${endpoint}vendedores`, setLogs);
        
        const response = await axios.get(endpoint + 'vendedores', {
            timeout: 30000, // 30 segundos de timeout
            validateStatus: function (status) {
                return status < 500; // Resuelve solo si el status es menor a 500
            }
        });
        
        logs = handleLogs(logs, "Conexión exitosa al servidor de vendedores", setLogs);
        const data = response.data;
        logs = handleLogs(logs, `Se obtuvieron ${data.length} vendedores del servidor`, setLogs);
        
        // Inserta los usuarios desde la API a la base de datos
        await insertUsuariosFromAPI(data, logs, setLogs);
        logs = handleLogs(logs, "Sincronización de vendedores completada", setLogs);
        
    } catch (error) {
        console.error('Error en actualizarVendedores:', error);
        
        let mensajeError = 'Error desconocido';
        
        if (error.code === 'ECONNREFUSED') {
            mensajeError = 'El servidor no está disponible. Verifique la dirección IP y puerto.';
        } else if (error.code === 'ENOTFOUND') {
            mensajeError = 'No se puede resolver la dirección del servidor. Verifique la configuración.';
        } else if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
            mensajeError = 'Problema con el certificado SSL del servidor.';
        } else if (error.code === 'ECONNABORTED') {
            mensajeError = 'Tiempo de espera agotado. El servidor no responde.';
        } else if (error.response) {
            mensajeError = `Error del servidor: ${error.response.status} - ${error.response.statusText}`;
        } else if (error.request) {
            mensajeError = 'No se recibió respuesta del servidor.';
        } else {
            mensajeError = error.message || 'Error de conexión';
        }
        
        logs = handleLogs(logs, `Error al sincronizar vendedores: ${mensajeError}`, setLogs);
    }
};

const actualizarClientes = async (logs, setLogs) => {
    console.log("Trayendo Clientes...");
    try {
        const endpoint = await configuracionEndPoint();
        logs = handleLogs(logs, `Conectando a: ${endpoint}clientes`, setLogs);
        
        const response = await axios.get(endpoint + 'clientes', {
            timeout: 30000, // 30 segundos de timeout
            validateStatus: function (status) {
                return status < 500; // Resuelve solo si el status es menor a 500
            }
        });
        
        logs = handleLogs(logs, "Conexión exitosa al servidor", setLogs);
        const data = response.data;
        logs = handleLogs(logs, `Se obtuvieron ${data.length} clientes del servidor`, setLogs);
        
        // Inserta los clientes desde la API a la base de datos
        const resultado = await insertClientesFromAPI(data);
        logs = handleLogs(logs, `Sincronización de clientes completada: ${resultado.clientesInsertados} procesados, ${resultado.clientesEliminados} eliminados`, setLogs);
        
    } catch (error) {
        console.error('Error en actualizarClientes:', error);
        
        let mensajeError = 'Error desconocido';
        
        if (error.code === 'ECONNREFUSED') {
            mensajeError = 'El servidor no está disponible. Verifique la dirección IP y puerto.';
        } else if (error.code === 'ENOTFOUND') {
            mensajeError = 'No se puede resolver la dirección del servidor. Verifique la configuración.';
        } else if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
            mensajeError = 'Problema con el certificado SSL del servidor.';
        } else if (error.code === 'ECONNABORTED') {
            mensajeError = 'Tiempo de espera agotado. El servidor no responde.';
        } else if (error.response) {
            mensajeError = `Error del servidor: ${error.response.status} - ${error.response.statusText}`;
        } else if (error.request) {
            mensajeError = 'No se recibió respuesta del servidor.';
        } else {
            mensajeError = error.message || 'Error de conexión';
        }
        
        logs = handleLogs(logs, `Error al sincronizar clientes: ${mensajeError}`, setLogs);
    }
};

const actualizarArticulos = async (logs, setLogs) => {
    console.log("Trayendo Articulos...");
    // let logs=[];
    try {
        const response = await axios.get(await configuracionEndPoint() + 'articulos');
        logs = handleLogs(logs,("actualizando articulos..."),setLogs);
        const data = response.data;

        // Define el tamaño del lote
        const batchSize = 500; // Por ejemplo, 500 artículos por lote

        // Divide los datos en lotes de tamaño fijo
        const batches = [];
        for (let i = 0; i < data.length; i += batchSize) {
            batches.push(data.slice(i, i + batchSize));
        }

        // Inserta cada lote en la base de datos
        for (const batch of batches) {
            console.log();
            await insertArticulosFromAPI(batch);
            handleLogs(logs,(`Lote de ${batch.length} artículos actualizado correctamente.`),setLogs);
        }

    } catch (error) {
      logs = handleLogs(logs,('Error al obtener o insertar articulos: '),setLogs);
    }
};

const actualizarPreventas = async (preventasJSON, mensajes) => {
  console.log("Enviando preventa al servidor:", JSON.stringify(preventasJSON, null, 2));
  try {
        const response = await axios.post(await configuracionEndPoint() + 'preventas', preventasJSON);
        console.log("Respuesta del servidor:", response.status, response.data);
        return response;
    } catch (error) {
        mensajes.hayErrores = true;
        mensajes.mensaje = ('Error al enviar preventas:' + error);
        console.error('Error al enviar preventas:', error);
        
        if (error.response) {
            console.error('Error del servidor:', error.response.status, error.response.data);
            mensajes.mensaje = `Error del servidor: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
        } else if (error.request) {
            console.error('Error de red:', error.request);
            mensajes.mensaje = 'Error de conexión al servidor';
        } else {
            console.error('Error:', error.message);
            mensajes.mensaje = `Error: ${error.message}`;
        }
        
        throw error;
    }
}

//envia solo una preventa
const sincronizarPreventa = async (preventaNumero, cliente) => {
  // console.log("sincronizando preventa",preventaNumero, cliente);
  let preventas = await preventasBDDToArray();
  let preventaJSON= preventas.filter(e => e.DocumentoNumero == preventaNumero); 
  
  if (preventaJSON.length === 0) {
    console.error("No se encontró la preventa", preventaNumero);
    return false;
  }
  
  const preventa = preventaJSON[0];
  console.log("enviando preventa", preventa);
  
  // Validar la preventa antes de enviar
  const { validarPreventaParaEnvio } = await import('../database/controllers/Preventa.Controller.js');
  const errores = validarPreventaParaEnvio(preventa);
  
  if (errores.length > 0) {
    console.error("Errores de validación:", errores);
    return false;
  }
  
  let mensajes = {hayErrores: false,
    mensaje: "No hay errores."};    
    await actualizarPreventas(preventa, mensajes);
  console.log("errores",mensajes);
  return !mensajes.hayErrores
};

const enviarPreventas = async (logs, setLogs) => {
    let preventas = [];
    // let logs = [];
    let mensajes = {hayErrores: false,
                    mensaje: "No hay errores."};    
    try {
      // Buscar en BDD local y transformarla en un ARRAY de JSON
      preventas = await preventasBDDToArray();
      console.log("enviando preventas ",preventas);
      // Enviarlas por post
      for (let i = 0; i < preventas.length; i++) {
        try {
          await actualizarPreventas(preventas[i], mensajes);
          console.log(`enviando preventa ${i + 1}.`,preventas[i]);
          logs = handleLogs(logs,(`enviando preventa ${i + 1}.`) , setLogs);
        } catch (error) {
          logs = handleLogs(logs, (`Error al enviar la preventa ${i + 1}: ${error}`),setLogs);
          console.error('Error al enviar la preventa', i + 1);
        }
      }
       
      // Borrarlas de la aplicación solo si no tuvimos errores
      if (!mensajes.hayErrores) {
          await borrarContenidoPreventasEnBDD();
          logs = handleLogs(logs, ("Preventas borradas correctamente"),setLogs);
        
      }else{
          logs = handleLogs(logs, ("no se borraron las preventas, pueden Haber errores"),setLogs);
          console.error('no se borraron las preventas porque hay errores ')
      }
    } catch (error) {
      logs = handleLogs(logs, (`Error al enviar o borrar preventas: ${error}`),setLogs);
      console.error('Error al enviar o borrar preventas: ', error);
    }
  
  };

  const errorSincronizando = (logs, setLogs) =>{
    logs = handleLogs(logs, "ERROR CONECTANDO AL SERVIDOR...", setLogs)
  }

  const actualizarAPP = async (esCompleta, logs, setLogs) => {
    console.log(logs);
    if (esCompleta) {
      logs = handleLogs(logs, "Sincronizando todos los datos...", setLogs);
      await initDatabase(logs, setLogs);
      await actualizarVendedores(logs, setLogs);
      await actualizarClientes(logs, setLogs);
      await borrarArticulosDeSqlite(); 
      await actualizarArticulos(logs, setLogs);
      // await enviarPreventas(logs, setLogs);
      logs = handleLogs(logs, "Sincronización completa.", setLogs);
    } else {
      logs = handleLogs(logs, "SOLO SE ENVIAN LAS PREVENTAS SIN ACTUALIZAR DATOS", setLogs);
      await enviarPreventas(logs, setLogs);
    }
  }
  

  const getArticulosFrecuentesDesdeAPI = async (cliente) => {
    // Obtener la fecha actual
    const today = new Date();
    const year = today.getFullYear();
    // JavaScript cuenta los meses desde 0 (enero es 0, diciembre es 11)
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    // Formatear la fecha actual en el formato AAAA-MM-DD
    const formattedToday = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
    // Obtener la fecha de un año atrás
    const oneYearAgo = new Date(year -1, month , day); // Restar 1 al año actual
  
    // Formatear la fecha de un año atrás en el formato AAAA-MM-DD
    const formattedOneYearAgo = `${oneYearAgo.getFullYear()}-${(oneYearAgo.getMonth() + 1).toString().padStart(2, '0')}-${oneYearAgo.getDate().toString().padStart(2, '0')}`;
    
    console.log("Trayendo Articulos frecuentes...");
   
    try {
      const response = await axios.get(await configuracionEndPoint() + "articulosfrecuentes?clienteCodigo=" + cliente + "&fechaDesde=" + formattedOneYearAgo + "&fechaHasta=" + formattedToday);
      const data = response.data;
      console.log(data);
      return data;
    } catch (error) {
      console.log('Error al obtener artículos frecuentes ', error);
    }
  };  

  const getInformeOnline = async (cliente) => {
    console.log("cargando documentos de ",cliente);
   
    try {
      const response = await axios.get(await configuracionEndPoint() + "clientesdeuda?clienteCodigo=" + cliente );
      const data = response.data;
      // console.log(data);
      return data;
    } catch (error) {
      console.log('Error al obtener artículos frecuentes ', error);
    }
  };  

export { actualizarAPP, actualizarVendedores, actualizarClientes, initDatabase, enviarPreventas, getArticulosFrecuentesDesdeAPI, getInformeOnline, sincronizarPreventa, errorSincronizando};