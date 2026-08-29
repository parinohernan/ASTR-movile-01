import { accesoOsviSheetUrl, accesoOsviToken } from '../constantes/constantes';
import { aplicarProvisionLocal } from '../utils/provisionLocal';

const parseResponseBody = async (response) => {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    if (response.status === 403) {
      throw new Error(
        'Acceso denegado (403). En Google Apps Script: Implementar > Administrar implementaciones > ' +
          'acceso "Cualquier persona" y volver a implementar una versión nueva.'
      );
    }

    if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
      throw new Error(
        'El servidor respondió HTML en lugar de JSON. Verifique la URL del Web App (/exec) y que esté desplegado.'
      );
    }

    throw new Error(`Respuesta inválida del servidor (${response.status})`);
  }
};

const callSheet = async (payload) => {
  if (!accesoOsviSheetUrl || accesoOsviSheetUrl.includes('XXXX')) {
    throw new Error(
      'Configure accesoOsviSheetUrl en src/constantes/constantes.js con la URL del Web App de Google'
    );
  }

  const body = JSON.stringify({ token: accesoOsviToken, ...payload });

  let response;
  try {
    // text/plain evita preflight CORS que Apps Script rechaza con 403 desde móvil
    response = await fetch(accesoOsviSheetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body,
      redirect: 'follow',
    });
  } catch (error) {
    throw new Error(`Sin conexión al servidor de acceso: ${error.message}`);
  }

  const data = await parseResponseBody(response);

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!response.ok) {
    throw new Error(`Error del servidor (${response.status})`);
  }

  return data;
};

export const loginEnSheet = async (codigo_vendedor, clave) => {
  return callSheet({ action: 'login', codigo_vendedor, clave });
};

export const registrarEnSheet = async (codigo_vendedor, clave, nombre) => {
  return callSheet({ action: 'registro', codigo_vendedor, clave, nombre });
};

export const refreshEnSheet = async (codigo_vendedor, clave) => {
  return callSheet({ action: 'refresh', codigo_vendedor, clave });
};

export const activarAccesoOnline = async (codigo_vendedor, clave, options = {}) => {
  const paquete = await loginEnSheet(codigo_vendedor, clave);
  const config = await aplicarProvisionLocal(paquete, options);
  return { paquete, config };
};

export const registrarYActivar = async (codigo_vendedor, clave, nombre, options = {}) => {
  const paquete = await registrarEnSheet(codigo_vendedor, clave, nombre);
  const config = await aplicarProvisionLocal(paquete, options);
  return { paquete, config };
};
