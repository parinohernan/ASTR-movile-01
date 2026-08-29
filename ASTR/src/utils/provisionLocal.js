import { insertUsuariosFromAPI } from '../../database/controllers/Usuarios.controler';
import { guardarConfiguracionEnStorage, getConfiguracionDelStorage } from './storageConfigData';
import { actualizarSoloVendedores } from '../../handlers/actualizarApp';
import checkServerHandler from './checkServerHandler';

export const validarPaqueteProvision = (configData) => {
  if (!configData?.vendedor?.id || !configData?.vendedor?.nombre) {
    return false;
  }
  if (!configData?.configuracion?.endpoint || !configData?.configuracion?.sucursal) {
    return false;
  }
  if (!configData?.vendedor?.clave) {
    return false;
  }
  return true;
};

export const buildConfigFromPaquete = async (configData, currentConfig = null) => {
  const base = currentConfig || (await getConfiguracionDelStorage()) || {};
  return {
    ...base,
    endPoint: configData.configuracion.endpoint,
    sucursal: configData.configuracion.sucursal,
    vendedor: configData.vendedor.id,
    cantidadMaximaArticulos: String(
      configData.configuracion.cantidadMaximaArticulos || base.cantidadMaximaArticulos || '18'
    ),
    filtrarClientesPorVendedor:
      configData.configuracion.filtrarClientesPorVendedor !== false,
    usaGeolocalizacion: configData.configuracion.usaGeolocalizacion !== false,
    siguientePreventa: String(
      configData.configuracion.siguientePreventa || base.siguientePreventa || 100
    ),
    empresaCodigo: configData.empresa?.codigo || base.empresaCodigo || '',
    empresaNombre: configData.empresa?.nombre || base.empresaNombre || '',
    ultimaSincronizacionAcceso: new Date().toISOString(),
  };
};

/**
 * Guarda usuario + config en el dispositivo (offline-first).
 * @param {object} configData - paquete de provisión
 * @param {{ syncVendedores?: boolean }} options
 */
export const aplicarProvisionLocal = async (configData, options = {}) => {
  if (!validarPaqueteProvision(configData)) {
    throw new Error('Paquete de provisión inválido');
  }

  const vendedor = {
    codigo: configData.vendedor.id,
    descripcion: configData.vendedor.nombre,
    clave: configData.vendedor.clave,
  };

  const logs = [];
  await insertUsuariosFromAPI([vendedor], logs, () => {});

  const nuevaConfig = await buildConfigFromPaquete(configData);
  await guardarConfiguracionEnStorage(nuevaConfig);

  if (options.syncVendedores) {
    try {
      if (await checkServerHandler()) {
        await actualizarSoloVendedores(logs, () => {});
      }
    } catch (error) {
      console.warn('No se pudieron sincronizar vendedores del endpoint:', error);
    }
  }

  return nuevaConfig;
};
