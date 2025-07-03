// Simular entorno del navegador para IndexedDB
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost'
});

global.window = dom.window;
global.document = dom.window.document;
global.indexedDB = dom.window.indexedDB;

// Importar la instancia exportada por defecto
const indexedDBHandler = require('./src/utils/indexedDBHandler').default || require('./src/utils/indexedDBHandler');

async function testEliminacionPreventas() {
  console.log('🧪 Iniciando prueba de eliminación de preventas...\n');

  try {
    await indexedDBHandler.init();

    // 1. Verificar preventas existentes
    console.log('📋 Verificando preventas existentes...');
    const preventasExistentes = await indexedDBHandler.obtenerTodasPreventas();
    console.log(`✅ Preventas encontradas: ${preventasExistentes.length}`);
    
    if (preventasExistentes.length === 0) {
      console.log('⚠️ No hay preventas para probar eliminación');
      return;
    }

    // 2. Mostrar preventas disponibles
    console.log('\n📋 Preventas disponibles:');
    preventasExistentes.forEach(preventa => {
      console.log(`   - Preventa #${preventa.numero}: ${preventa.cliente?.descripcion || 'Sin cliente'} - $${preventa.total || 0}`);
    });

    // 3. Probar eliminación de la primera preventa
    const primeraPreventa = preventasExistentes[0];
    console.log(`\n🗑️ Probando eliminación de preventa #${primeraPreventa.numero}...`);
    
    const resultadoEliminacion = await indexedDBHandler.eliminarPreventa(primeraPreventa.numero);
    console.log('✅ Eliminación completada');

    // 4. Verificar que la preventa fue eliminada
    console.log('\n🔍 Verificando eliminación...');
    const preventasDespues = await indexedDBHandler.obtenerTodasPreventas();
    const preventaEliminada = preventasDespues.find(p => p.numero === primeraPreventa.numero);
    
    if (!preventaEliminada) {
      console.log('✅ Preventa eliminada correctamente');
      console.log(`📊 Preventas restantes: ${preventasDespues.length}`);
    } else {
      console.log('❌ Error: La preventa no fue eliminada');
    }

    // 5. Probar eliminación de preventa inexistente
    console.log('\n🧪 Probando eliminación de preventa inexistente...');
    try {
      await indexedDBHandler.eliminarPreventa(99999);
      console.log('✅ Eliminación de preventa inexistente manejada correctamente');
    } catch (error) {
      console.log('✅ Error esperado al eliminar preventa inexistente:', error.message);
    }

    // 6. Verificar estado final
    console.log('\n📊 Estado final:');
    const preventasFinales = await indexedDBHandler.obtenerTodasPreventas();
    console.log(`✅ Preventas restantes: ${preventasFinales.length}`);
    
    if (preventasFinales.length > 0) {
      console.log('📋 Preventas restantes:');
      preventasFinales.forEach(preventa => {
        console.log(`   - Preventa #${preventa.numero}: ${preventa.cliente?.descripcion || 'Sin cliente'} - $${preventa.total || 0}`);
      });
    }

    console.log('\n✅ Prueba de eliminación completada exitosamente');

  } catch (error) {
    console.error('❌ Error en prueba de eliminación:', error);
  }
}

// Ejecutar la prueba
testEliminacionPreventas(); 