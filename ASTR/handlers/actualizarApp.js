import axios from 'axios';
import { initDatabase} from '../database/database';
import { insertArticulosFromAPI } from '../database/controllers/Articulos.Controller';
import { insertUsuariosFromAPI } from '../database/controllers/Usuarios.controler';
import { insertClientesFromAPI } from '../database/controllers/Clientes.Controller';

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

// const actualizarArticulos = async () => {
//     console.log("Trayendo Articulos...");
    
//     try {
//         const response = await axios.get('http://192.168.1.123:3000/articulos');
//         console.log("response",response.data);
//         const data = response.data;
//         // Inserta los clientes desde la API a la base de datos
//         await insertArticulosFromAPI(data);
//     } catch (error) {
//         console.error('Error al obtener o insertar articulos: ', error);
//     }
    
// };

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

const actualizarAPP = async () =>{
    console.log("VENDEDORES ->");
    initDatabase();
    actualizarVendedores();
    console.log("CLIENTES ->");
    actualizarClientes();
    console.log("ARTICULOS ->");
    actualizarArticulos();
}
export { actualizarAPP, actualizarVendedores, actualizarClientes, actualizarArticulos, initDatabase};