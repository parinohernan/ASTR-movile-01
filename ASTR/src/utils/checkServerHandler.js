import axios from 'axios';
import { configuracionEndPoint } from './storageConfigData';

const checkServerHandler = async () => {
  try {
    const endpoint = await configuracionEndPoint();
    console.log('Verificando conectividad con:', endpoint);
    
    const response = await axios.get(endpoint, {
      timeout: 10000, // 10 segundos de timeout
      validateStatus: function (status) {
        return status < 500; // Resuelve solo si el status es menor a 500
      }
    });
    
    console.log('✅ Servidor accesible - Status:', response.status);
    return true;
    
  } catch (error) {
    console.error('❌ Error de conectividad:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('El servidor no está disponible en esa dirección IP/puerto');
    } else if (error.code === 'ENOTFOUND') {
      console.error('No se puede resolver la dirección del servidor');
    } else if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      console.error('Problema con el certificado SSL del servidor');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Tiempo de espera agotado - el servidor no responde');
    } else if (error.response) {
      console.error(`Error del servidor: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
    }
    
    return false;
  }
};

export default checkServerHandler;