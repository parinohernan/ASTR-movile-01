// Simular el entorno del navegador para IndexedDB
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:3000'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.indexedDB = dom.window.indexedDB;

// Importar el handler
import('./src/utils/indexedDBHandler.js').then(module => {
  const indexedDBHandler = module.default;
  testSincronizacionUsuarios(indexedDBHandler);
}).catch(error => {
  console.error('Error al importar indexedDBHandler:', error);
});

async function testSincronizacionUsuarios(indexedDBHandler) {
  console.log('🧪 === PRUEBA DE SINCRONIZACIÓN Y AUTENTICACIÓN ===\n');
  
  try {
    // 1. Inicializar IndexedDB
    console.log('1️⃣ Inicializando IndexedDB...');
    await indexedDBHandler.init();
    console.log('✅ IndexedDB inicializado\n');
    
    // 2. Simular datos de vendedores del servidor
    console.log('2️⃣ Simulando datos de vendedores del servidor...');
    const vendedoresServidor = [
      {
        codigo: '1',
        descripcion: 'Jano Janus314'
      },
      {
        codigo: '2', 
        descripcion: 'María González'
      },
      {
        codigo: '3',
        descripcion: 'Carlos López'
      }
    ];
    console.log('📦 Datos simulados:', vendedoresServidor);
    
    // 3. Guardar vendedores en IndexedDB
    console.log('\n3️⃣ Guardando vendedores en IndexedDB...');
    await indexedDBHandler.guardarVendedores(vendedoresServidor);
    console.log('✅ Vendedores guardados\n');
    
    // 4. Obtener vendedores guardados
    console.log('4️⃣ Obteniendo vendedores guardados...');
    const vendedoresGuardados = await indexedDBHandler.obtenerVendedores();
    console.log('📋 Vendedores en IndexedDB:', vendedoresGuardados);
    
    // 5. Probar autenticación
    console.log('\n5️⃣ Probando autenticación...');
    
    // Probar con usuario correcto y contraseña correcta
    console.log('\n🔐 Probando autenticación correcta...');
    const auth1 = await indexedDBHandler.autenticarVendedor('1', '789');
    console.log('Usuario 1, contraseña 789:', auth1 ? '✅ ÉXITO' : '❌ FALLO');
    
    // Probar con usuario correcto y contraseña incorrecta
    console.log('\n🔐 Probando contraseña incorrecta...');
    const auth2 = await indexedDBHandler.autenticarVendedor('1', '123');
    console.log('Usuario 1, contraseña 123:', auth2 ? '✅ ÉXITO' : '❌ FALLO (esperado)');
    
    // Probar con usuario inexistente
    console.log('\n🔐 Probando usuario inexistente...');
    const auth3 = await indexedDBHandler.autenticarVendedor('999', '789');
    console.log('Usuario 999, contraseña 789:', auth3 ? '✅ ÉXITO' : '❌ FALLO (esperado)');
    
    // 6. Mostrar resumen
    console.log('\n📊 === RESUMEN ===');
    console.log(`Total vendedores sincronizados: ${vendedoresGuardados.length}`);
    console.log('Contraseñas esperadas para usuarios sincronizados: 789');
    console.log('Usuarios disponibles para login:');
    vendedoresGuardados.forEach(v => {
      console.log(`  - ${v.codigo}: ${v.descripcion} (clave: ${v.clave})`);
    });
    
    console.log('\n🎉 Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// La prueba se ejecuta automáticamente al importar el módulo 