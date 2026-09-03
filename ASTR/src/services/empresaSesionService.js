import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../database/database';
import {
  eliminarUsuariosVendedores,
  ROL_AUDITOR,
} from '../../database/controllers/Usuarios.controler';
import {
  getConfiguracionDelStorage,
} from '../utils/storageConfigData';
import {
  limpiarPreventaDeStorage,
  limpiarPreventasEnviadas,
  limpiarTodosArticulosFrecuentes,
} from '../utils/storageUtils';
import { aplicarProvisionLocal } from '../utils/provisionLocal';

const SESION_KEY = '@MyApp:SesionActiva';

const normalizarEmpresa = (codigo) =>
  String(codigo || '').trim().toUpperCase();

export const esCodigoAuditor = (codigo) =>
  String(codigo || '').trim().toUpperCase() === 'AUDITOR';

export const esRolAuditor = (rol) =>
  String(rol || '').trim().toLowerCase() === ROL_AUDITOR;

export const resolverRolDesdeUsuario = (usuario, codigo = usuario?.id) => {
  if (esRolAuditor(usuario?.rol)) {
    return ROL_AUDITOR;
  }
  if (esCodigoAuditor(codigo)) {
    return ROL_AUDITOR;
  }
  if (normalizarEmpresa(usuario?.empresa_codigo) === 'AUDIT') {
    return ROL_AUDITOR;
  }
  return usuario?.rol || 'vendedor';
};

export const resolverRolDesdePaquete = (paquete) => {
  if (esRolAuditor(paquete?.vendedor?.rol)) {
    return ROL_AUDITOR;
  }
  if (esCodigoAuditor(paquete?.vendedor?.id)) {
    return ROL_AUDITOR;
  }
  if (normalizarEmpresa(paquete?.empresa?.codigo) === 'AUDIT') {
    return ROL_AUDITOR;
  }
  return paquete?.vendedor?.rol || 'vendedor';
};

export const contarPreventasPendientes = () => {
  try {
    const row = db.getAllSync('SELECT COUNT(*) as total FROM preventaCabeza');
    return row[0]?.total || 0;
  } catch (error) {
    console.warn('No se pudieron contar preventas pendientes:', error);
    return 0;
  }
};

export const limpiarDatosEmpresa = async () => {
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM clientes');
    db.runSync('DELETE FROM articulos');
    db.runSync('DELETE FROM preventaCabeza');
    db.runSync('DELETE FROM preventaItem');
  });

  await limpiarPreventaDeStorage();
  await limpiarPreventasEnviadas();
  await limpiarTodosArticulosFrecuentes();
};

export const evaluarCambioEmpresa = async ({ empresaNueva, rol }) => {
  const config = await getConfiguracionDelStorage();
  const empresaActual = normalizarEmpresa(config?.empresaCodigo);
  const empresaDestino = normalizarEmpresa(empresaNueva);

  if (esRolAuditor(rol)) {
    return { accion: 'auditor' };
  }

  if (!empresaActual || empresaActual === empresaDestino) {
    return { accion: 'misma_empresa', config };
  }

  const pendientes = contarPreventasPendientes();
  if (pendientes > 0) {
    return {
      accion: 'bloquear',
      mensaje: `Hay ${pendientes} preventa(s) sin enviar de la empresa ${empresaActual}. Enviá las preventas o pedí acceso de auditoría antes de cambiar de empresa.`,
      empresaActual,
      pendientes,
    };
  }

  return { accion: 'cambio_empresa', config, empresaActual, empresaDestino };
};

export const guardarSesionActiva = async ({ usuarioId, rol, empresaCodigo }) => {
  await AsyncStorage.setItem(
    SESION_KEY,
    JSON.stringify({
      usuarioId: String(usuarioId),
      rol: esRolAuditor(rol) ? ROL_AUDITOR : 'vendedor',
      empresaCodigo: normalizarEmpresa(empresaCodigo),
      timestamp: new Date().toISOString(),
    })
  );
};

export const obtenerSesionActiva = async () => {
  try {
    const raw = await AsyncStorage.getItem(SESION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const limpiarSesionActiva = async () => {
  await AsyncStorage.removeItem(SESION_KEY);
};

export const aplicarLoginConReglas = async (paquete, options = {}) => {
  const rol = resolverRolDesdePaquete(paquete);
  const paqueteConRol = {
    ...paquete,
    vendedor: {
      ...paquete.vendedor,
      rol,
    },
  };
  const empresaNueva = paquete?.empresa?.codigo;
  const evaluacion = await evaluarCambioEmpresa({ empresaNueva, rol });

  if (evaluacion.accion === 'bloquear') {
    throw new Error(evaluacion.mensaje);
  }

  let provisionOptions = {
    syncVendedores: false,
    preservarPreventas: true,
    ...options,
  };

  if (evaluacion.accion === 'auditor') {
    provisionOptions = {
      ...provisionOptions,
      modoAuditor: true,
      preservarPreventas: true,
    };
  } else if (evaluacion.accion === 'misma_empresa') {
    provisionOptions = {
      ...provisionOptions,
      mismaEmpresa: true,
      preservarPreventas: true,
    };
  } else if (evaluacion.accion === 'cambio_empresa') {
    await limpiarDatosEmpresa();
    await eliminarUsuariosVendedores();
    provisionOptions = {
      ...provisionOptions,
      preservarPreventas: true,
      reemplazarUsuariosVendedores: true,
    };
  }

  const config = await aplicarProvisionLocal(paqueteConRol, provisionOptions);

  await guardarSesionActiva({
    usuarioId: paquete.vendedor.id,
    rol,
    empresaCodigo: esRolAuditor(rol)
      ? evaluacion.config?.empresaCodigo || empresaNueva
      : empresaNueva,
  });

  return { config, evaluacion };
};

export const aplicarLoginOfflineConReglas = async (usuario) => {
  const rol = resolverRolDesdeUsuario(usuario);
  const empresaNueva = usuario.empresa_codigo;
  const evaluacion = await evaluarCambioEmpresa({ empresaNueva, rol });

  if (evaluacion.accion === 'bloquear') {
    throw new Error(evaluacion.mensaje);
  }

  if (evaluacion.accion === 'cambio_empresa') {
    throw new Error(
      'Para cambiar de empresa necesitás conexión a internet e iniciar sesión online.'
    );
  }

  if (evaluacion.accion === 'auditor') {
    await guardarSesionActiva({
      usuarioId: usuario.id,
      rol,
      empresaCodigo: evaluacion.config?.empresaCodigo || empresaNueva,
    });
    return { evaluacion, config: evaluacion.config };
  }

  await guardarSesionActiva({
    usuarioId: usuario.id,
    rol,
    empresaCodigo: empresaNueva || evaluacion.config?.empresaCodigo,
  });

  const config = await getConfiguracionDelStorage();
  return { evaluacion, config };
};
