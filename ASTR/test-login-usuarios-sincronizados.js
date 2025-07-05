const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Configurar entorno DOM
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
    <title>Test Login</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>
`, {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
    resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.localStorage = dom.window.localStorage;
global.sessionStorage = dom.window.sessionStorage;

// Mock de IndexedDB
const mockIndexedDB = {
    open: jest.fn(() => ({
        result: {
            createObjectStore: jest.fn(),
            transaction: jest.fn(() => ({
                objectStore: jest.fn(() => ({
                    get: jest.fn(),
                    put: jest.fn(),
                    getAll: jest.fn(),
                    clear: jest.fn()
                }))
            }))
        },
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null
    }))
};

global.indexedDB = mockIndexedDB;

// Mock de React Navigation
const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn()
};

// Mock de Alert
global.Alert = {
    alert: jest.fn()
};

// Mock de console
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
};

// Importar el handler de IndexedDB
const indexedDBHandler = require('./src/utils/indexedDBHandler');

// Datos de prueba
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

async function testLoginUsuariosSincronizados() {
    console.log('🧪 === PRUEBA DE LOGIN CON USUARIOS SINCRONIZADOS ===');
    
    try {
        // 1. Inicializar IndexedDB
        console.log('1️⃣ Inicializando IndexedDB...');
        await indexedDBHandler.init();
        console.log('✅ IndexedDB inicializado');
        
        // 2. Guardar usuarios sincronizados
        console.log('2️⃣ Guardando usuarios sincronizados...');
        await indexedDBHandler.guardarVendedores(usuariosSincronizados);
        console.log(`✅ ${usuariosSincronizados.length} usuarios guardados`);
        
        // 3. Obtener usuarios para verificar
        console.log('3️⃣ Obteniendo usuarios guardados...');
        const usuariosGuardados = await indexedDBHandler.obtenerVendedores();
        console.log(`📋 Usuarios en IndexedDB: ${usuariosGuardados.length}`);
        
        // 4. Probar autenticación con varios usuarios
        console.log('4️⃣ Probando autenticación...');
        
        const casosPrueba = [
            { codigo: '1', clave: '1234', esperado: true },
            { codigo: '2', clave: '5678', esperado: true },
            { codigo: '3', clave: '9012', esperado: true },
            { codigo: '1', clave: 'incorrecta', esperado: false },
            { codigo: '999', clave: '1234', esperado: false },
            { codigo: 'root', clave: 'root', esperado: false } // root no está en IndexedDB
        ];
        
        for (const caso of casosPrueba) {
            console.log(`\n🔍 Probando: ${caso.codigo} / ${caso.clave}`);
            const resultado = await indexedDBHandler.autenticarVendedor(caso.codigo, caso.clave);
            
            if (caso.esperado && resultado) {
                console.log(`✅ ÉXITO: Usuario autenticado correctamente`);
                console.log(`   📝 Datos: ${JSON.stringify(resultado)}`);
            } else if (!caso.esperado && !resultado) {
                console.log(`✅ ÉXITO: Usuario rechazado correctamente`);
            } else {
                console.log(`❌ ERROR: Resultado inesperado`);
                console.log(`   Esperado: ${caso.esperado}, Obtenido: ${!!resultado}`);
            }
        }
        
        // 5. Probar casos especiales
        console.log('\n5️⃣ Probando casos especiales...');
        
        // Usuario con clave por defecto '789'
        const usuarioConClaveDefault = await indexedDBHandler.autenticarVendedor('1', '789');
        if (usuarioConClaveDefault) {
            console.log('✅ Usuario con clave por defecto autenticado');
        } else {
            console.log('❌ Usuario con clave por defecto no autenticado');
        }
        
        // 6. Verificar que no hay usuarios de prueba
        console.log('\n6️⃣ Verificando que no hay usuarios de prueba...');
        const usuariosPrueba = usuariosGuardados.filter(u => ['001', '002', '003'].includes(u.codigo));
        if (usuariosPrueba.length === 0) {
            console.log('✅ No hay usuarios de prueba en IndexedDB');
        } else {
            console.log(`❌ Encontrados ${usuariosPrueba.length} usuarios de prueba`);
        }
        
        console.log('\n🎉 === PRUEBA COMPLETADA ===');
        console.log('📱 Ahora puedes probar en el navegador:');
        console.log('   - Ir a http://localhost:3000');
        console.log('   - Usar cualquier usuario sincronizado (1-9) con su clave');
        console.log('   - O usar root/root para acceso administrativo');
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    }
}

// Función para limpiar datos de prueba
async function limpiarDatosPrueba() {
    console.log('🧹 Limpiando datos de prueba...');
    try {
        await indexedDBHandler.init();
        await indexedDBHandler.limpiarVendedores();
        console.log('✅ Datos de prueba limpiados');
    } catch (error) {
        console.error('❌ Error al limpiar:', error);
    }
}

// Ejecutar prueba
if (require.main === module) {
    const comando = process.argv[2];
    
    if (comando === 'limpiar') {
        limpiarDatosPrueba();
    } else {
        testLoginUsuariosSincronizados();
    }
}

module.exports = {
    testLoginUsuariosSincronizados,
    limpiarDatosPrueba
}; 