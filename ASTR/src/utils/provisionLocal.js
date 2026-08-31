import { insertUsuariosFromAPI } from '../../database/controllers/Usuarios.controler';
import { guardarConfiguracionEnStorage, getConfiguracionDelStorage } from './storageConfigData';
import { actualizarSoloVendedores } from '../../handlers/actualizarApp';
import checkServerHandler from './checkServerHandler';
import { calcularSiguientePreventaSeguro } from './preventaNumeracion';

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

export const buildConfigFromPaquete = async (configData, currentConfig = null, options = {}) => {
  const base = currentConfig || (await getConfiguracionDelStorage()) || {};
  const propuestoSheet =
    configData.configuracion?.siguientePreventa ?? base.siguientePreventa ?? 100;

  const siguientePreventa =
    options.preservarPreventas !== false
      ? await calcularSiguientePreventaSeguro(propuestoSheet)
      : String(propuestoSheet);

  return {
    ...base,
    endPoint: configData.configuracion.endpoint,
    sucursal: configData.configuracion.sucursal,
    vendedor: String(configData.vendedor.id),
    cantidadMaximaArticulos: String(
      configData.configuracion.cantidadMaximaArticulos || base.cantidadMaximaArticulos || '18'
    ),
    filtrarClientesPorVendedor:
      configData.configuracion.filtrarClientesPorVendedor !== false,
    usaGeolocalizacion: configData.configuracion.usaGeolocalizacion !== false,
    siguientePreventa,
    empresaCodigo: configData.empresa?.codigo || base.empresaCodigo || '',
    empresaNombre: configData.empresa?.nombre || base.empresaNombre || '',
    ultimaSincronizacionAcceso: new Date().toISOString(),
  };
};

/**
 * Guarda usuario + config en el dispositivo (offline-first).
 * @param {object} configData - paquete de provisión
 * @param {{ syncVendedores?: boolean, preservarPreventas?: boolean }} options
 */
export const aplicarProvisionLocal = async (configData, options = {}) => {
  if (!validarPaqueteProvision(configData)) {
    throw new Error('Paquete de provisión inválido');
  }

  const vendedor = {
    codigo: String(configData.vendedor.id),
    descripcion: configData.vendedor.nombre,
    clave: configData.vendedor.clave,
  };

  const logs = [];
  await insertUsuariosFromAPI([vendedor], logs, () => {});

  const nuevaConfig = await buildConfigFromPaquete(configData, null, {
    preservarPreventas: options.preservarPreventas !== false,
  });
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
