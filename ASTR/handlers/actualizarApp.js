import axios from 'axios';
import { initDatabase} from '../database/database';
import { insertArticulosFromAPI } from '../database/controllers/Articulos.Controler';
import { insertUsuariosFromAPI } from '../database/controllers/Usuarios.controler';
import { insertClientesFromAPI } from '../database/controllers/Clientes.Controler';

const actualizarVendedores = async () => {
    console.log("conectando...");
    try {
      const response = await axios.get('http://192.168.1.111:3000/vendedores');
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
try {
    const response = await axios.get('http://192.168.1.111:3000/clientes');
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
    try {
        const response = await axios.get('http://192.168.1.111:3000/articulos');
        console.log("response");
        const data = response.data;
        // await initDatabase();
        // Inserta los clientes desde la API a la base de datos
        await insertArticulosFromAPI(data);
    } catch (error) {
        console.error('Error al obtener o insertar articulos: ', error);
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
export { actualizarAPP};