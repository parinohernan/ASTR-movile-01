import axios from 'axios';
import { insertUsuariosFromAPI, initDatabase} from '../database/database';

const actualizarAPP = async () => {
      
    // initDatabase();
    try {
      const response = await axios.get('http://192.168.1.111:3000/vendedores');
      console.log("response");
      const data = response.data;
      await initDatabase();
      // Inserta los usuarios desde la API a la base de datos
      await insertUsuariosFromAPI(data);
    } catch (error) {
      console.error('Error al obtener o insertar usuarios: ', error);
    }
  };

  export { actualizarAPP};