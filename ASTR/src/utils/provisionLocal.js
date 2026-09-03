import {
  insertUsuariosFromAPI,
  eliminarUsuariosVendedores,
  ROL_AUDITOR,
} from '../../database/controllers/Usuarios.controler';
import {
  guardarConfiguracionEnStorage,
  getConfiguracionDelStorage,
  codigoVendedorDesdeSucursal,
} from './storageConfigData';
import { actualizarSoloVendedores } from '../../handlers/actualizarApp';
import checkServerHandler from './checkServerHandler';
import { calcularSiguientePreventaSeguro } from './preventaNumeracion';

const esRolAuditor = (rol) =>
  String(rol || '').trim().toLowerCase() === 'auditor';

export const validarPaqueteProvision = (configData) => {
  if (!configData?.vendedor?.id || !configData?.vendedor?.nombre) {
    return false;
  }
  if (!configData?.vendedor?.clave) {
    return false;
  }
  if (esRolAuditor(configData?.vendedor?.rol)) {
    return true;
  }
  if (!configData?.configuracion?.endpoint || !configData?.configuracion?.sucursal) {
    return false;
  }
  return true;
};

export const buildConfigFromPaquete = async (configData, currentConfig = null, options = {}) => {
  const base = currentConfig || (await getConfiguracionDelStorage()) || {};
  const modoAuditor = options.modoAuditor === true;
  const mismaEmpresa = options.mismaEmpresa === true;
  const tieneConfigBase = Boolean(base.endPoint && base.empresaCodigo);

  const propuestoSheet =
    configData.configuracion?.siguientePreventa ?? base.siguientePreventa ?? 100;

  const siguientePreventa =
    options.preservarPreventas !== false
      ? await calcularSiguientePreventaSeguro(propuestoSheet)
      : String(propuestoSheet);

  if (modoAuditor && tieneConfigBase) {
    return {
      ...base,
      ultimaSincronizacionAcceso: new Date().toISOString(),
    };
  }

  const configOperativa = {
    cantidadMaximaArticulos: String(
      configData.configuracion?.cantidadMaximaArticulos || base.cantidadMaximaArticulos || '18'
    ),
    filtrarClientesPorVendedor:
      configData.configuracion?.filtrarClientesPorVendedor !== false,
    usaGeolocalizacion: configData.configuracion?.usaGeolocalizacion !== false,
    siguientePreventa,
  };

  if (mismaEmpresa && tieneConfigBase) {
    const loginId = String(configData.vendedor.id ?? '').trim();
    const vendedorActual = String(base.vendedor ?? '').trim();
    const vendedorOperativo =
      vendedorActual && vendedorActual.toUpperCase() !== loginId.toUpperCase()
        ? vendedorActual
        : codigoVendedorDesdeSucursal(
            configData.configuracion?.sucursal || base.sucursal
          );

    return {
      ...base,
      ...configOperativa,
      vendedor: vendedorOperativo,
      ultimaSincronizacionAcceso: new Date().toISOString(),
    };
  }

  const sucursal = configData.configuracion.sucursal;
  return {
    ...base,
    ...configOperativa,
    endPoint: configData.configuracion.endpoint,
    sucursal,
    vendedor: codigoVendedorDesdeSucursal(sucursal),
    empresaCodigo: configData.empresa?.codigo || base.empresaCodigo || '',
    empresaNombre: configData.empresa?.nombre || base.empresaNombre || '',
    ultimaSincronizacionAcceso: new Date().toISOString(),
  };
};

/**
 * Guarda usuario + config en el dispositivo (offline-first).
 * @param {object} configData - paquete de provisión
 * @param {{ syncVendedores?: boolean, preservarPreventas?: boolean, modoAuditor?: boolean, mismaEmpresa?: boolean, reemplazarUsuariosVendedores?: boolean }} options
 */
export const aplicarProvisionLocal = async (configData, options = {}) => {
  if (!validarPaqueteProvision(configData)) {
    throw new Error('Paquete de provisión inválido');
  }

  const rol = configData.vendedor?.rol || 'vendedor';
  const empresaCodigo = configData.empresa?.codigo || null;

  const vendedor = {
    codigo: String(configData.vendedor.id),
    descripcion: configData.vendedor.nombre,
    clave: configData.vendedor.clave,
    empresa_codigo: empresaCodigo,
    rol,
  };

  const logs = [];

  if (options.reemplazarUsuariosVendedores) {
    await eliminarUsuariosVendedores();
  }

  await insertUsuariosFromAPI([vendedor], logs, () => {});

  const currentConfig = await getConfiguracionDelStorage();
  const nuevaConfig = await buildConfigFromPaquete(configData, currentConfig, {
    preservarPreventas: options.preservarPreventas !== false,
    modoAuditor: options.modoAuditor === true,
    mismaEmpresa: options.mismaEmpresa === true,
  });
  await guardarConfiguracionEnStorage(nuevaConfig);

  if (options.syncVendedores && !esRolAuditor(rol)) {
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

export { ROL_AUDITOR };
