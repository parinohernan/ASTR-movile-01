import axios from 'axios';
import { initDatabase} from '../database/database';
import { borrarArticulosDeSqlite, insertArticulosFromAPI, insertArticulosFrecuentesToSqlite } from '../database/controllers/Articulos.Controller';
import { insertUsuariosFromAPI } from '../database/controllers/Usuarios.controler';
import { insertClientesFromAPI } from '../database/controllers/Clientes.Controller';
import { preventasBDDToArray } from '../database/controllers/Preventa.Controller';
import { borrarContenidoPreventasEnBDD } from '../database/controllers/Preventa.Controller';
import { configuracionEndPoint } from '../src/utils/storageConfigData';

const handleLogs = (logs, mensaje, setLogs) => {
  console.log("L M ",mensaje);
  setLogs( [...logs, mensaje]);
  return [...logs, mensaje];
};

const actualizarVendedores = async (setLogs) => {
    console.log("Trayendo Vendedores...");
    let logs=[];
    let endPoint = await configuracionEndPoint() + 'vendedores'
    
    try {
      const response = await axios.get(endPoint);
      logs = handleLogs(logs,("actualizando vendedores..."),setLogs);
      const data = response.data;
      //console.log("data",data);
      // Inserta los usuarios desde la API a la base de datos
      await insertUsuariosFromAPI(data, setLogs);
    } catch (error) {
      console.log(error);
      logs = handleLogs(logs,('Error al obtener o insertar vendedores: '),setLogs);
    }
  };

const actualizarClientes = async (setLogs) => {
    console.log("Trayendo Clientes...");
    let logs=[];
    try {
    const response = await axios.get(await configuracionEndPoint() + 'clientes');
    logs = handleLogs(logs,("actualizando clientes..."),setLogs);
    const data = response.data;
    // await initDatabase();
    // Inserta los clientes desde la API a la base de datos
    await insertClientesFromAPI(data);
} catch (error) {
  logs = handleLogs(logs,('Error al obtener o insertar clientes: '),setLogs);
}
};

const actualizarArticulos = async (setLogs) => {
    console.log("Trayendo Articulos...");
    let logs=[];
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
  console.log("!!actiaApp 78 :",await configuracionEndPoint() + 'preventas', preventasJSON);  
  try {
        const response = await axios.post(await configuracionEndPoint() + 'preventas', preventasJSON);
    } catch (error) {
        mensajes.hayErrores = true;
        mensajes.mensaje = ('Error al enviar preventas:' + error);
        console.error('Error al enviar preventas:', error);
    }
}

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

  const actualizarAPP = async (esCompleta, logs, setLogs) => {
    // let logs= [];
    esCompleta 
    ? (
      console.log("Sincronizando todos los datos."),
      logs = handleLogs(logs, "Sincronizando todos los datos...", setLogs),
      await initDatabase(setLogs),
      await actualizarVendedores(setLogs),
      await actualizarClientes(setLogs),
      await borrarArticulosDeSqlite(),
      await actualizarArticulos(setLogs),
      await enviarPreventas(setLogs),
      logs = handleLogs(logs, "Sincronizacion completa.", setLogs)
      )
      : ( await enviarPreventas(setLogs)
      
      );
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
// const getArticulosFrecuentesDesdeAPI = async (cliente) => {
//   const fechaActual = //fecha de hoy
//   const fechaAnoAtras = //fecha un año atras
//   console.log("Trayendo Articulos frecuentes...");
 
//   try {
//       const response = await axios.get(await configuracionEndPoint()+"articulosfrecuentes?clienteCodigo="+cliente+"&fechaDesde=2024-02-01&fechaHasta=2024-04-06");
//       const data = response.data;
//       console.log(data);
//       return (data);
//   } catch (error) {
//       console.log('Error al obtener articulos frecuentes ', error);
//   }
// };

export { actualizarAPP, actualizarVendedores, actualizarClientes, initDatabase, enviarPreventas, getArticulosFrecuentesDesdeAPI};