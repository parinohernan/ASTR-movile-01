/**
 * OSVI - acceso_osvi
 * Pegar en: Extensiones > Apps Script de la Google Sheet
 * Desplegar: Implementar > Nueva implementación > Aplicación web
 *   - Ejecutar como: Yo
 *   - Acceso: Cualquier persona
 * Copiar la URL del Web App en src/constantes/constantes.js (accesoOsviSheetUrl)
 */

const SHEET_USUARIOS = 'usuarios';
const SHEET_EMPRESAS = 'empresas';
const TOKEN = 'OSVI-2026-CAMBIA-ESTE-TOKEN';
const SPREADSHEET_ID_PROP = 'OSVI_SPREADSHEET_ID';
// Opcional: pegar ID manualmente. Si queda vacío, usar vincularHojaAlScript().
const SPREADSHEET_ID = '';

const DEFAULT_EMPRESA_TEST = {
  empresa_codigo: 'TEST',
  nombre: 'Empresa Test',
  endpoint_default: 'https://noconfig.janus314.com.ar/',
  sucursal_default: '0003',
  cantidad_maxima_articulos: 18,
  filtrar_clientes_por_vendedor: true,
  usa_geolocalizacion: true,
  siguiente_preventa: 100,
};

const EMPRESAS_HEADERS = [
  'empresa_codigo',
  'nombre',
  'endpoint_default',
  'sucursal_default',
  'cantidad_maxima_articulos',
  'filtrar_clientes_por_vendedor',
  'usa_geolocalizacion',
  'siguiente_preventa',
];

const USUARIOS_HEADERS = [
  'codigo_vendedor',
  'clave',
  'nombre',
  'empresa_codigo',
  'endpoint',
  'sucursal',
  'cantidad_maxima_articulos',
  'filtrar_clientes_por_vendedor',
  'usa_geolocalizacion',
  'siguiente_preventa',
  'activo',
  'created_at',
];

/**
 * Ejecutar UNA VEZ desde el editor de Apps Script (con la hoja abierta).
 * Guarda el ID de la hoja para que el Web App pueda leerla.
 */
function vincularHojaAlScript() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error(
      'Abrí la Google Sheet acceso_osvi y ejecutá esta función desde Extensiones > Apps Script.'
    );
  }

  const id = ss.getId();
  const nombre = ss.getName();
  PropertiesService.getScriptProperties().setProperty(SPREADSHEET_ID_PROP, id);

  const plantillas = inicializarPlantillas(ss);

  Logger.log('Hoja vinculada: ' + nombre + ' (' + id + ')');
  return { ok: true, spreadsheetId: id, nombre: nombre, plantillas: plantillas };
}

/**
 * Crea pestañas y fila TEST si faltan. Ejecutar desde vincularHojaAlScript o sola.
 */
function inicializarPlantillas(spreadsheet) {
  const ss = spreadsheet || getSpreadsheet();
  const result = { empresas: false, usuarios: false, testCreado: false };

  let empresasSheet = ss.getSheetByName(SHEET_EMPRESAS);
  if (!empresasSheet) {
    empresasSheet = ss.insertSheet(SHEET_EMPRESAS);
    empresasSheet.getRange(1, 1, 1, EMPRESAS_HEADERS.length).setValues([EMPRESAS_HEADERS]);
    result.empresas = true;
  }

  const empresasHeaders = getHeaders(empresasSheet);
  if (!empresasHeaders.empresa_codigo && empresasSheet.getLastRow() === 0) {
    empresasSheet.getRange(1, 1, 1, EMPRESAS_HEADERS.length).setValues([EMPRESAS_HEADERS]);
    result.empresas = true;
  }

  if (!tieneEmpresa(ss, 'TEST')) {
    empresasSheet.appendRow([
      DEFAULT_EMPRESA_TEST.empresa_codigo,
      DEFAULT_EMPRESA_TEST.nombre,
      DEFAULT_EMPRESA_TEST.endpoint_default,
      DEFAULT_EMPRESA_TEST.sucursal_default,
      DEFAULT_EMPRESA_TEST.cantidad_maxima_articulos,
      DEFAULT_EMPRESA_TEST.filtrar_clientes_por_vendedor,
      DEFAULT_EMPRESA_TEST.usa_geolocalizacion,
      DEFAULT_EMPRESA_TEST.siguiente_preventa,
    ]);
    result.testCreado = true;
  }

  let usuariosSheet = ss.getSheetByName(SHEET_USUARIOS);
  if (!usuariosSheet) {
    usuariosSheet = ss.insertSheet(SHEET_USUARIOS);
    usuariosSheet.getRange(1, 1, 1, USUARIOS_HEADERS.length).setValues([USUARIOS_HEADERS]);
    result.usuarios = true;
  } else if (usuariosSheet.getLastRow() === 0) {
    usuariosSheet.getRange(1, 1, 1, USUARIOS_HEADERS.length).setValues([USUARIOS_HEADERS]);
    result.usuarios = true;
  }

  return result;
}

function tieneEmpresa(spreadsheet, codigoEmpresa) {
  try {
    return buscarFilaEmpresa(codigoEmpresa, spreadsheet) !== null;
  } catch (err) {
    return false;
  }
}

function getSpreadsheetId() {
  if (SPREADSHEET_ID) {
    return SPREADSHEET_ID;
  }

  const storedId = PropertiesService.getScriptProperties().getProperty(SPREADSHEET_ID_PROP);
  if (storedId) {
    return storedId;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) {
    return ss.getId();
  }

  return null;
}

function doGet() {
  try {
    const spreadsheetId = getSpreadsheetId();
    if (!spreadsheetId) {
      return jsonResponse({
        ok: false,
        error:
          'Hoja no vinculada. En Apps Script ejecutá la función vincularHojaAlScript() ' +
          'con la Sheet abierta, o configure SPREADSHEET_ID.',
      });
    }

    const ss = SpreadsheetApp.openById(spreadsheetId);
    let testOk = false;
    try {
      testOk = buscarFilaEmpresa('TEST', ss) !== null;
    } catch (err) {
      testOk = false;
    }

    return jsonResponse({
      ok: true,
      servicio: 'acceso_osvi',
      spreadsheetId: spreadsheetId,
      nombreHoja: ss.getName(),
      pestañas: [SHEET_USUARIOS, SHEET_EMPRESAS],
      empresaTestConfigurada: testOk,
      ayuda: testOk
        ? null
        : 'Ejecutá inicializarPlantillas() o vincularHojaAlScript() en Apps Script',
    });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.token !== TOKEN) {
      return jsonResponse({ error: 'No autorizado' });
    }

    const action = data.action;
    if (action === 'login' || action === 'refresh') {
      const paquete = buscarUsuario(data.codigo_vendedor, data.clave);
      if (!paquete) {
        return jsonResponse({ error: 'Usuario o clave incorrectos' });
      }
      return jsonResponse(paquete);
    }

    if (action === 'registro') {
      const paquete = registrarUsuario(data.codigo_vendedor, data.clave, data.nombre);
      return jsonResponse(paquete);
    }

    return jsonResponse({ error: 'Acción inválida' });
  } catch (err) {
    return jsonResponse({ error: String(err.message || err) });
  }
}

function jsonResponse(obj) {
  const output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function getSpreadsheet() {
  const spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) {
    throw new Error(
      'Hoja no vinculada al script. Ejecutá vincularHojaAlScript() desde el editor ' +
        '(con la Sheet abierta) o configure SPREADSHEET_ID en AppsScript.gs.'
    );
  }
  return SpreadsheetApp.openById(spreadsheetId);
}

function getSheet(name, spreadsheet) {
  const ss = spreadsheet || getSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) {
    throw new Error('Falta la pestaña: ' + name);
  }
  return sheet;
}

function getHeaders(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = {};
  headers.forEach(function (h, i) {
    map[String(h).trim()] = i;
  });
  return map;
}

function rowToObject(row, headers) {
  const obj = {};
  Object.keys(headers).forEach(function (key) {
    obj[key] = row[headers[key]];
  });
  return obj;
}

function getEmpresaCodigoKey(headers) {
  if (headers.empresa_codigo !== undefined) return 'empresa_codigo';
  if (headers.codigo !== undefined) return 'codigo';
  if (headers.empresa !== undefined) return 'empresa';
  return null;
}

function getEmpresaDefaults(codigoEmpresa, spreadsheet) {
  const codigo = String(codigoEmpresa).trim().toUpperCase();

  if (codigo === 'TEST') {
    try {
      const row = buscarFilaEmpresa(codigo, spreadsheet);
      if (row) return row;
    } catch (err) {
      // Si falta pestaña o columnas, usar defaults embebidos
    }
    return Object.assign({}, DEFAULT_EMPRESA_TEST);
  }

  const row = buscarFilaEmpresa(codigo, spreadsheet);
  if (!row) {
    throw new Error(
      'Empresa no configurada: ' + codigoEmpresa +
        '. Agregá una fila en la pestaña empresas con empresa_codigo=' + codigoEmpresa
    );
  }
  return row;
}

function buscarFilaEmpresa(codigoEmpresa, spreadsheet) {
  const sheet = getSheet(SHEET_EMPRESAS, spreadsheet);
  const headers = getHeaders(sheet);
  const codigoKey = getEmpresaCodigoKey(headers);

  if (!codigoKey) {
    throw new Error(
      'La pestaña empresas no tiene columna empresa_codigo. ' +
        'Ejecutá inicializarPlantillas() en Apps Script.'
    );
  }

  const data = sheet.getDataRange().getValues();
  const codigo = String(codigoEmpresa).trim().toUpperCase();

  for (let i = 1; i < data.length; i++) {
    const row = rowToObject(data[i], headers);
    const valor = String(row[codigoKey] || '').trim().toUpperCase();
    if (valor && valor === codigo) {
      return row;
    }
  }

  return null;
}

function buildPaquete(row) {
  return {
    version: '1.0',
    vendedor: {
      id: String(row.codigo_vendedor),
      nombre: String(row.nombre),
      clave: String(row.clave),
    },
    empresa: {
      codigo: String(row.empresa_codigo),
      nombre: String(row.empresa_codigo),
    },
    configuracion: {
      endpoint: String(row.endpoint),
      sucursal: String(row.sucursal),
      vendedor: String(row.codigo_vendedor),
      cantidadMaximaArticulos: String(row.cantidad_maxima_articulos || 18),
      filtrarClientesPorVendedor: row.filtrar_clientes_por_vendedor !== false && row.filtrar_clientes_por_vendedor !== 'FALSE',
      usaGeolocalizacion: row.usa_geolocalizacion !== false && row.usa_geolocalizacion !== 'FALSE',
      siguientePreventa: Number(row.siguiente_preventa || 100),
    },
  };
}

function buscarUsuario(codigo, clave) {
  const sheet = getSheet(SHEET_USUARIOS);
  const headers = getHeaders(sheet);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = rowToObject(data[i], headers);
    if (String(row.activo).toUpperCase() === 'FALSE') continue;
    if (String(row.codigo_vendedor) === String(codigo) && String(row.clave) === String(clave)) {
      return buildPaquete(row);
    }
  }
  return null;
}

function validarClaveRegistro(clave) {
  const value = String(clave || '');
  if (value.length < 8) {
    throw new Error('La clave debe tener al menos 8 caracteres');
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    throw new Error('La clave debe incluir al menos un símbolo (ej: ! @ # $ % & *)');
  }
}

function registrarUsuario(codigo, clave, nombre) {
  validarClaveRegistro(clave);

  const sheet = getSheet(SHEET_USUARIOS);
  const headers = getHeaders(sheet);
  const data = sheet.getDataRange().getValues();
  const empresaTest = 'TEST';

  for (let i = 1; i < data.length; i++) {
    const row = rowToObject(data[i], headers);
    if (String(row.codigo_vendedor) === String(codigo) && String(row.empresa_codigo).toUpperCase() === empresaTest) {
      throw new Error('El código de vendedor ya existe en TEST');
    }
  }

  const defaults = getEmpresaDefaults(empresaTest);
  const endpointDefault =
    defaults.endpoint_default || defaults.endpoint || DEFAULT_EMPRESA_TEST.endpoint_default;
  const sucursalDefault =
    defaults.sucursal_default || defaults.sucursal || DEFAULT_EMPRESA_TEST.sucursal_default;
  const newRow = [];
  const headerList = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  headerList.forEach(function (header) {
    const key = String(header).trim();
    switch (key) {
      case 'codigo_vendedor': newRow.push(String(codigo)); break;
      case 'clave': newRow.push(String(clave)); break;
      case 'nombre': newRow.push(String(nombre)); break;
      case 'empresa_codigo': newRow.push(empresaTest); break;
      case 'endpoint': newRow.push(endpointDefault); break;
      case 'sucursal': newRow.push(sucursalDefault); break;
      case 'cantidad_maxima_articulos': newRow.push(defaults.cantidad_maxima_articulos || 18); break;
      case 'filtrar_clientes_por_vendedor': newRow.push(defaults.filtrar_clientes_por_vendedor !== false); break;
      case 'usa_geolocalizacion': newRow.push(defaults.usa_geolocalizacion !== false); break;
      case 'siguiente_preventa': newRow.push(defaults.siguiente_preventa || 100); break;
      case 'activo': newRow.push(true); break;
      case 'created_at': newRow.push(new Date().toISOString()); break;
      default: newRow.push(''); break;
    }
  });

  sheet.appendRow(newRow);
  return buildPaquete(rowToObject(newRow, headers));
}
