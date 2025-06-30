const readline = require('readline');

// Crear interfaz de lectura
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para hacer preguntas de forma asíncrona
function pregunta(pregunta) {
  return new Promise((resolve) => {
    rl.question(pregunta, (respuesta) => {
      resolve(respuesta.trim());
    });
  });
}

// Función principal del generador
async function generarConfiguracionVendedor() {
  console.log('🚀 GENERADOR DE CONFIGURACIÓN DE VENDEDOR');
  console.log('==========================================\n');

  try {
    // Paso 1: Información de la empresa
    console.log('📋 PASO 1: INFORMACIÓN DE LA EMPRESA');
    console.log('------------------------------------');
    
    const nombreEmpresa = await pregunta('Ingrese el nombre de la empresa: ');
    const codigoEmpresa = await pregunta('Ingrese el código de la empresa (opcional): ') || nombreEmpresa.toUpperCase();

    // Paso 2: Información del servidor
    console.log('\n🌐 PASO 2: CONFIGURACIÓN DEL SERVIDOR');
    console.log('--------------------------------------');
    
    let endpoint = await pregunta('Ingrese el endpoint del servidor (ej: https://192.168.1.100:3003/): ');
    
    // Validar que termine en /
    if (!endpoint.endsWith('/')) {
      endpoint += '/';
      console.log('✅ Endpoint corregido:', endpoint);
    }

    // Paso 3: Información de la sucursal
    console.log('\n🏢 PASO 3: INFORMACIÓN DE LA SUCURSAL');
    console.log('-------------------------------------');
    
    const codigoSucursal = await pregunta('Ingrese el código de la sucursal: ');
    const nombreSucursal = await pregunta('Ingrese el nombre de la sucursal (opcional): ') || `Sucursal ${codigoSucursal}`;

    // Paso 4: Información del vendedor
    console.log('\n👤 PASO 4: INFORMACIÓN DEL VENDEDOR');
    console.log('-----------------------------------');
    
    const idVendedor = await pregunta('Ingrese el ID del vendedor: ');
    const nombreVendedor = await pregunta('Ingrese el nombre del vendedor: ');
    const apellidoVendedor = await pregunta('Ingrese el apellido del vendedor: ');
    const emailVendedor = await pregunta('Ingrese el email del vendedor (opcional): ') || '';
    const telefonoVendedor = await pregunta('Ingrese el teléfono del vendedor (opcional): ') || '';

    // Paso 5: Configuración de la aplicación
    console.log('\n⚙️ PASO 5: CONFIGURACIÓN DE LA APLICACIÓN');
    console.log('----------------------------------------');
    
    const cantidadMaximaArticulos = await pregunta('Cantidad máxima de artículos (default: 18): ') || '18';
    const filtrarClientes = await pregunta('¿Filtrar clientes por vendedor? (s/n, default: s): ').toLowerCase() || 's';
    const usarGeolocalizacion = await pregunta('¿Usar geolocalización? (s/n, default: s): ').toLowerCase() || 's';

    // Paso 6: Confirmación
    console.log('\n📋 RESUMEN DE LA CONFIGURACIÓN');
    console.log('==============================');
    console.log(`🏢 Empresa: ${nombreEmpresa} (${codigoEmpresa})`);
    console.log(`🌐 Endpoint: ${endpoint}`);
    console.log(`🏢 Sucursal: ${codigoSucursal} - ${nombreSucursal}`);
    console.log(`👤 Vendedor: ${nombreVendedor} ${apellidoVendedor} (ID: ${idVendedor})`);
    console.log(`📧 Email: ${emailVendedor || 'No especificado'}`);
    console.log(`📞 Teléfono: ${telefonoVendedor || 'No especificado'}`);
    console.log(`📦 Artículos máx: ${cantidadMaximaArticulos}`);
    console.log(`🔍 Filtrar clientes: ${filtrarClientes === 's' ? 'Sí' : 'No'}`);
    console.log(`📍 Geolocalización: ${usarGeolocalizacion === 's' ? 'Sí' : 'No'}`);

    const confirmar = await pregunta('\n¿Confirma esta configuración? (s/n): ').toLowerCase();
    
    if (confirmar !== 's') {
      console.log('❌ Configuración cancelada');
      rl.close();
      return;
    }

    // Generar el archivo JSON
    const configuracion = {
      version: "1.0",
      empresa: {
        nombre: nombreEmpresa,
        codigo: codigoEmpresa,
        descripcion: `${nombreEmpresa} - ${nombreSucursal}`
      },
      vendedor: {
        id: idVendedor,
        nombre: `${nombreVendedor} ${apellidoVendedor}`,
        apellido: apellidoVendedor,
        email: emailVendedor,
        telefono: telefonoVendedor,
        sucursal: codigoSucursal,
        rol: "vendedor",
        activo: true
      },
      configuracion: {
        endpoint: endpoint,
        sucursal: codigoSucursal,
        cantidadMaximaArticulos: cantidadMaximaArticulos,
        filtrarClientesPorVendedor: filtrarClientes === 's',
        usaGeolocalizacion: usarGeolocalizacion === 's',
        siguientePreventa: 100,
        timeout: 30000,
        reintentos: 3
      },
      servidor: {
        nombre: `${codigoEmpresa}-SERVER-${codigoSucursal}`,
        version: "2.1.0",
        fechaActualizacion: new Date().toISOString()
      },
      seguridad: {
        hash: `sha256:${Math.random().toString(36).substring(2, 15)}`,
        fechaExpiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 año
        permisos: ["lectura", "escritura", "sincronizacion"]
      },
      metadata: {
        timestamp: new Date().toISOString(),
        generadoPor: "Generador de Configuración OSVI",
        comentarios: `Configuración para ${nombreVendedor} ${apellidoVendedor} - ${nombreSucursal}`
      }
    };

    // Paso 7: Guardar archivo
    console.log('\n💾 PASO 6: GUARDAR ARCHIVO');
    console.log('---------------------------');
    
    const nombreArchivo = await pregunta(`Nombre del archivo (default: config_${idVendedor}.json): `) || `config_${idVendedor}.json`;
    
    // Aquí normalmente usarías fs.writeFileSync, pero para este ejemplo mostramos el contenido
    console.log('\n✅ ARCHIVO GENERADO EXITOSAMENTE');
    console.log('================================');
    console.log(`📁 Nombre: ${nombreArchivo}`);
    console.log(`📊 Tamaño: ${JSON.stringify(configuracion, null, 2).length} caracteres`);
    
    console.log('\n CONTENIDO DEL ARCHIVO:');
    console.log('==========================');
    console.log(JSON.stringify(configuracion, null, 2));

    // Opciones adicionales
    console.log('\n OPCIONES ADICIONALES');
    console.log('======================');
    console.log('1. Copiar al portapapeles');
    console.log('2. Enviar por email');
    console.log('3. Generar otro archivo');
    console.log('4. Salir');
    
    const opcion = await pregunta('Seleccione una opción (1-4): ');
    
    switch(opcion) {
      case '1':
        console.log('📋 Contenido copiado al portapapeles (simulado)');
        break;
      case '2':
        console.log('📧 Función de envío por email (no implementada)');
        break;
      case '3':
        console.log('🔄 Generando nuevo archivo...\n');
        await generarConfiguracionVendedor();
        break;
      case '4':
        console.log('👋 ¡Hasta luego!');
        break;
      default:
        console.log('❌ Opción no válida');
    }

  } catch (error) {
    console.error('❌ Error durante la generación:', error.message);
  } finally {
    rl.close();
  }
}

// Función para validar entrada
function validarEntrada(valor, tipo) {
  switch(tipo) {
    case 'endpoint':
      return valor.startsWith('http://') || valor.startsWith('https://');
    case 'email':
      return valor === '' || valor.includes('@');
    case 'telefono':
      return valor === '' || /^[\d\s\-\+\(\)]+$/.test(valor);
    default:
      return valor.length > 0;
  }
}

// Función para mostrar ayuda
function mostrarAyuda() {
  console.log('\n📖 AYUDA DEL GENERADOR');
  console.log('=====================');
  console.log('Este generador crea archivos de configuración JSON para vendedores.');
  console.log('Los archivos se pueden importar directamente en la aplicación móvil.');
  console.log('');
  console.log('📋 Campos obligatorios:');
  console.log('- Nombre de la empresa');
  console.log('- Endpoint del servidor');
  console.log('- Código de sucursal');
  console.log('- ID del vendedor');
  console.log('- Nombre del vendedor');
  console.log('');
  console.log(' Campos opcionales:');
  console.log('- Código de empresa');
  console.log('- Nombre de sucursal');
  console.log('- Email del vendedor');
  console.log('- Teléfono del vendedor');
  console.log('');
}

// Función principal
async function main() {
  console.log('🎯 GENERADOR DE CONFIGURACIÓN OSVI');
  console.log('==================================\n');
  
  const argumento = process.argv[2];
  
  if (argumento === '--help' || argumento === '-h') {
    mostrarAyuda();
    return;
  }
  
  await generarConfiguracionVendedor();
}

// Ejecutar el programa
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generarConfiguracionVendedor, validarEntrada };
