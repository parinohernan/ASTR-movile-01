
import axios from 'axios';
import { configuracionEndPoint } from './storageConfigData';

const checkServerHandler = async () => {
    try {
      let endpoint = await configuracionEndPoint()
      const response = await axios.get(endpoint);
      // Si la solicitud se completa con éxito, significa que hay acceso al servidor
      return true;
    } catch (error) {
      // Si ocurre un error, no hay acceso al servidor
      return false;
    }
  };

export default checkServerHandler