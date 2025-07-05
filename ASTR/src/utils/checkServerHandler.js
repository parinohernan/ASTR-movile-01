import axios from 'axios';
import { configuracionEndPoint } from './storageConfigData';
import indexedDBHandler from './indexedDBHandler';

// Función para verificar conexión a internet en web
const checkInternetConnection = async () => {
  try {
    // En web, intentar hacer una petición a un servicio confiable
    // Usar un timeout para evitar que se quede colgado
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
    
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-cache',
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('✅ Conexión a internet verificada');
      return true;
    } else {
      console.log('❌ Respuesta no exitosa:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error verificando conexión a internet:', error.message);
    return false;
  }
};

const checkServerHandler = async () => {
    try {
    let endpoint;
    
    // Detectar si estamos en entorno web
    const isWeb = typeof window !== 'undefined' && window.localStorage;
    
    if (isWeb) {
      // En web, usar IndexedDB
      const config = await indexedDBHandler.obtenerConfiguracion();
      endpoint = config?.endpoint;
      console.log('🌐 Usando configuración de IndexedDB:', endpoint);
    } else {
      // En móvil, usar AsyncStorage
      endpoint = await configuracionEndPoint();
      console.log('📱 Usando configuración de AsyncStorage:', endpoint);
    }
    
    if (!endpoint) {
      console.error('❌ No hay endpoint configurado');
      return false;
    }
    
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

export { checkInternetConnection };
export default checkServerHandler;