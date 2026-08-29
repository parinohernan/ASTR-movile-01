const CLAVE_MIN_LENGTH = 8;
const CLAVE_SIMBOLO_REGEX = /[^A-Za-z0-9]/;

export const validarClaveRegistro = (clave) => {
  const value = String(clave || '');

  if (value.length < CLAVE_MIN_LENGTH) {
    return {
      ok: false,
      error: `La clave debe tener al menos ${CLAVE_MIN_LENGTH} caracteres`,
    };
  }

  if (!CLAVE_SIMBOLO_REGEX.test(value)) {
    return {
      ok: false,
      error: 'La clave debe incluir al menos un símbolo (ej: ! @ # $ % & *)',
    };
  }

  return { ok: true };
};

export const REQUISITOS_CLAVE_TEXTO =
  'Mínimo 8 caracteres e incluir al menos un símbolo.';
