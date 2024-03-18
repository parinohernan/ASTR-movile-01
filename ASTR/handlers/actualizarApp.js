import axios from 'axios';
import { initDatabase} from '../database/database';
import { insertArticulosFromAPI } from '../database/controllers/Articulos.Controller';
import { insertUsuariosFromAPI } from '../database/controllers/Usuarios.controler';
import { insertClientesFromAPI } from '../database/controllers/Clientes.Controller';
import { preventasBDDToArray } from '../database/controllers/Preventa.Controller';
import { borrarContenidoPreventasEnBDD } from '../database/controllers/Preventa.Controller';

const actualizarVendedores = async () => {
    console.log("Trayendo Vendedores...");
    try {
      const response = await axios.get('http://192.168.1.123:3000/vendedores');
      console.log("actu vende response",response.data);
      const data = response.data;
      //await initDatabase();
      // Inserta los usuarios desde la API a la base de datos
      await insertUsuariosFromAPI(data);
    } catch (error) {
      console.error('Error al obtener o insertar usuarios: ', error);
    }
  };

const actualizarClientes = async () => {
    console.log("Trayendo Clientes...");
    try {
    const response = await axios.get('http://192.168.1.123:3000/clientes');
    console.log("response");
    const data = response.data;
    // await initDatabase();
    // Inserta los clientes desde la API a la base de datos
    await insertClientesFromAPI(data);
} catch (error) {
    console.error('Error al obtener o insertar clientes: ', error);
}
};

const actualizarArticulos = async () => {
    console.log("Trayendo Articulos...");
    
    try {
        const response = await axios.get('http://192.168.1.123:3000/articulos');
        console.log("response", response.data);
        const data = response.data;

        // Define el tamaño del lote
        const batchSize = 500; // Por ejemplo, 100 artículos por lote

        // Divide los datos en lotes de tamaño fijo
        const batches = [];
        for (let i = 0; i < data.length; i += batchSize) {
            batches.push(data.slice(i, i + batchSize));
        }

        // Inserta cada lote en la base de datos
        for (const batch of batches) {
            await insertArticulosFromAPI(batch);
            console.log(`Lote de ${batch.length} artículos insertado correctamente.`);
        }

    } catch (error) {
        console.error('Error al obtener o insertar artículos: ', error);
    }
};

const actualizarPreventas = async (preventasJSON, mensajes) => {
    console.log("ACTUALIZAR BDD REMOTA");
    try {
        const response = await axios.post('http://192.168.1.123:3000/preventas', preventasJSON);
        console.log("response", response.data);
        // setLogs([...setLogs, response.data]);
    } catch (error) {
        mensajes.hayErrores = true;
        mensajes.mensaje = ('Error al enviar preventas:' + error);
        console.error('Error al enviar preventas:', error);
        // setLogs([...setLogs, 'Tuvimos un error al enviar preventas']);
    }
}

const handleLogs = (logs, mensaje) => {
    return [...logs, mensaje];
  };

const enviarPreventas = async (setLogs) => {
    let preventas = [];
    let logs = [];
    let mensajes = {hayErrores: false,
                    mensaje: "No hay errores."};    
    try {
      // Buscar en BDD local y transformarla en un ARRAY de JSON
      preventas = await preventasBDDToArray();
      // Enviarlas por post
      for (let i = 0; i < preventas.length; i++) {
        try {
          await actualizarPreventas(preventas[i], mensajes);
          logs = handleLogs(logs, `enviando preventa ${i + 1}.`);
        } catch (error) {
          logs = handleLogs(logs, `Error al enviar la preventa ${i + 1}: ${error}`);
          console.error('Error al enviar la preventa', i + 1);
        }
      }
      logs = handleLogs(logs, mensajes.mensaje);
  
      // Borrarlas de la aplicación solo si no tuvimos errores
      if (!mensajes.hayErrores) {
          await borrarContenidoPreventasEnBDD();
          logs = handleLogs(logs, "Preventas borradas correctamente");
        
      }else{
          logs = handleLogs(logs, "no se borraron las preventas, pueden Haber errores");
          console.error('no se borraron las preventas porque hay errores ')
      }
    } catch (error) {
      logs = handleLogs(logs, `Error al enviar o borrar preventas: ${error}`);
      console.error('Error al enviar o borrar preventas: ', error);
    }
  
    setLogs(logs);
  };

const actualizarAPP = async () =>{
    console.log("VENDEDORES ->");
    initDatabase();
    actualizarVendedores();
    console.log("CLIENTES ->");
    actualizarClientes();
    console.log("ARTICULOS ->");
    actualizarArticulos();
}

export { actualizarAPP, actualizarVendedores, actualizarClientes, actualizarArticulos, initDatabase, enviarPreventas};