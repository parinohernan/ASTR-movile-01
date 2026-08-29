import * as Location from 'expo-location';
import { getConfiguracionDelStorage } from './storageConfigData';

export const obtenerUbicacionPedido = async () => {
  try {
    const config = await getConfiguracionDelStorage();
    if (config?.usaGeolocalizacion === false) {
      return { latitud: null, longitud: null };
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permiso de ubicación denegado al guardar pedido');
      return { latitud: null, longitud: null };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitud: position.coords.latitude,
      longitud: position.coords.longitude,
    };
  } catch (error) {
    console.warn('No se pudo obtener ubicación del pedido:', error);
    return { latitud: null, longitud: null };
  }
};
