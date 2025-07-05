const indexedDBHandler = require('./src/utils/indexedDBHandler').default || require('./src/utils/indexedDBHandler');

// Datos de prueba - usuarios sincronizados
const usuariosSincronizados = [
    { id: '1', codigo: '1', descripcion: 'Vendedor 1', clave: '1234' },
    { id: '2', codigo: '2', descripcion: 'Vendedor 2', clave: '5678' },
    { id: '3', codigo: '3', descripcion: 'Vendedor 3', clave: '9012' },
    { id: '4', codigo: '4', descripcion: 'Vendedor 4', clave: '3456' },
    { id: '5', codigo: '5', descripcion: 'Vendedor 5', clave: '7890' },
    { id: '6', codigo: '6', descripcion: 'Vendedor 6', clave: '2345' },
    { id: '7', codigo: '7', descripcion: 'Vendedor 7', clave: '6789' },
    { id: '8', codigo: '8', descripcion: 'Vendedor 8', clave: '0123' },
    { id: '9', codigo: '9', descripcion: 'Vendedor 9', clave: '4567' }
];

async function testLoginSimple() {
    console.log('🧪 === PRUEBA SIMPLE DE LOGIN ===');
    
    try {
        // 1. Inicializar IndexedDB
        console.log('1️⃣ Inicializando IndexedDB...');
        await indexedDBHandler.init();
        
        // 2. Guardar usuarios sincronizados
        console.log('2️⃣ Guardando usuarios sincronizados...');
        await indexedDBHandler.guardarVendedores(usuariosSincronizados);
        
        // 3. Obtener usuarios para verificar
        const usuariosGuardados = await indexedDBHandler.obtenerVendedores();
        console.log(`✅ ${usuariosGuardados.length} usuarios guardados en IndexedDB`);
        
        // 4. Probar autenticación
        console.log('\n4️⃣ Probando autenticación...');
        
        // Probar usuario 1 con clave correcta
        const resultado1 = await indexedDBHandler.autenticarVendedor('1', '1234');
        if (resultado1) {
            console.log('✅ Usuario 1 autenticado correctamente');
            console.log(`   📝 Datos: ${JSON.stringify(resultado1)}`);
        } else {
            console.log('❌ Usuario 1 no autenticado');
        }
        
        // Probar usuario 2 con clave correcta
        const resultado2 = await indexedDBHandler.autenticarVendedor('2', '5678');
        if (resultado2) {
            console.log('✅ Usuario 2 autenticado correctamente');
            console.log(`   📝 Datos: ${JSON.stringify(resultado2)}`);
        } else {
            console.log('❌ Usuario 2 no autenticado');
        }
        
        // Probar usuario con clave incorrecta
        const resultadoIncorrecto = await indexedDBHandler.autenticarVendedor('1', 'incorrecta');
        if (!resultadoIncorrecto) {
            console.log('✅ Usuario con clave incorrecta rechazado correctamente');
        } else {
            console.log('❌ Usuario con clave incorrecta fue aceptado');
        }
        
        // Probar usuario inexistente
        const resultadoInexistente = await indexedDBHandler.autenticarVendedor('999', '1234');
        if (!resultadoInexistente) {
            console.log('✅ Usuario inexistente rechazado correctamente');
        } else {
            console.log('❌ Usuario inexistente fue aceptado');
        }
        
        console.log('\n🎉 === PRUEBA COMPLETADA ===');
        console.log('📱 Ahora puedes probar en el navegador:');
        console.log('   - Ir a http://localhost:3000');
        console.log('   - Usar cualquier usuario (1-9) con su clave correspondiente');
        console.log('   - O usar root/root para acceso administrativo');
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    }
}

// Ejecutar prueba
testLoginSimple(); 