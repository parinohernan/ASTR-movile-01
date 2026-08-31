import { db } from '../../database/database';
import { getConfiguracionDelStorage } from './storageConfigData';

export const parseNumeroPreventa = (id) => {
  if (id == null || id === '') {
    return 0;
  }
  const str = String(id).split('_')[0];
  const n = parseInt(str, 10);
  return Number.isFinite(n) ? n : 0;
};

export const obtenerMaxNumeroPreventaLocal = () => {
  try {
    const rows = db.getAllSync('SELECT id FROM preventaCabeza');
    return rows.reduce(
      (max, row) => Math.max(max, parseNumeroPreventa(row.id)),
      0
    );
  } catch (error) {
    console.warn('No se pudo leer preventas locales:', error);
    return 0;
  }
};

/**
 * Calcula el siguiente número de preventa sin pisar numeración local existente.
 */
export const calcularSiguientePreventaSeguro = async (propuestoDesdeSheet) => {
  const config = await getConfiguracionDelStorage();
  const configNum = parseNumeroPreventa(config?.siguientePreventa);
  const maxLocal = obtenerMaxNumeroPreventaLocal();
  const sheetNum = parseNumeroPreventa(propuestoDesdeSheet);

  if (maxLocal > 0) {
    return String(Math.max(maxLocal + 1, configNum));
  }

  if (sheetNum > 0) {
    return String(Math.max(sheetNum, configNum));
  }

  return String(configNum || 100);
};

export const calcularSiguienteTrasEnvio = (preventas, configActual) => {
  const configNum = parseNumeroPreventa(configActual?.siguientePreventa);
  const maxEnviado = (preventas || []).reduce(
    (max, preventa) => Math.max(max, parseNumeroPreventa(preventa.DocumentoNumero)),
    0
  );

  if (maxEnviado > 0) {
    return String(Math.max(maxEnviado + 1, configNum));
  }

  return String(configNum || 100);
};
