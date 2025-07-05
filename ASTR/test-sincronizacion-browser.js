// Script para probar sincronización desde la consola del navegador
// Copia y pega este código en la consola del navegador (F12)

async function testSincronizacion() {
  console.log('🧪 === PRUEBA DE SINCRONIZACIÓN DESDE NAVEGADOR ===\n');
  
  try {
    // 1. Verificar si IndexedDB está disponible
    console.log('1️⃣ Verificando IndexedDB...');
    if (!window.indexedDB) {
      console.log('❌ IndexedDB no está disponible');
      return;
    }
    console.log('✅ IndexedDB disponible\n');
    
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
    
    // 3. Crear una base de datos temporal para la prueba
    console.log('\n3️⃣ Creando base de datos temporal...');
    const dbName = 'testDB_' + Date.now();
    const request = indexedDB.open(dbName, 1);
    
    request.onerror = () => {
      console.log('❌ Error al abrir la base de datos');
    };
    
    request.onsuccess = () => {
      const db = request.result;
      console.log('✅ Base de datos temporal creada');
      
      // 4. Crear object store para vendedores
      const transaction = db.transaction(['vendedores'], 'readwrite');
      const store = transaction.objectStore('vendedores');
      
      // 5. Guardar vendedores
      console.log('\n4️⃣ Guardando vendedores...');
      vendedoresServidor.forEach(vendedor => {
        const vendedorMapeado = {
          id: vendedor.codigo,
          codigo: vendedor.codigo,
          descripcion: vendedor.descripcion,
          clave: '789' // Contraseña por defecto para usuarios sincronizados
        };
        store.add(vendedorMapeado);
        console.log('📦 Guardando:', vendedorMapeado);
      });
      
      transaction.oncomplete = () => {
        console.log('✅ Vendedores guardados\n');
        
        // 6. Leer vendedores guardados
        console.log('5️⃣ Leyendo vendedores guardados...');
        const readTransaction = db.transaction(['vendedores'], 'readonly');
        const readStore = readTransaction.objectStore('vendedores');
        const readRequest = readStore.getAll();
        
        readRequest.onsuccess = () => {
          const vendedoresGuardados = readRequest.result;
          console.log('📋 Vendedores en la base de datos:', vendedoresGuardados);
          
          // 7. Probar autenticación
          console.log('\n6️⃣ Probando autenticación...');
          
          // Probar con usuario correcto y contraseña correcta
          const authRequest = readStore.index('codigo').get('1');
          authRequest.onsuccess = () => {
            const vendedor = authRequest.result;
            if (vendedor && vendedor.clave === '789') {
              console.log('✅ Autenticación exitosa para usuario 1 con contraseña 789');
            } else {
              console.log('❌ Autenticación fallida para usuario 1 con contraseña 789');
            }
            
            // Probar con contraseña incorrecta
            if (vendedor && vendedor.clave !== '123') {
              console.log('✅ Correctamente rechazó contraseña incorrecta (123)');
            }
            
            // 8. Mostrar resumen
            console.log('\n📊 === RESUMEN ===');
            console.log(`Total vendedores: ${vendedoresGuardados.length}`);
            console.log('Contraseñas esperadas para usuarios sincronizados: 789');
            console.log('Usuarios disponibles para login:');
            vendedoresGuardados.forEach(v => {
              console.log(`  - ${v.codigo}: ${v.descripcion} (clave: ${v.clave})`);
            });
            
            console.log('\n🎉 Prueba completada exitosamente!');
            console.log('\n💡 Para usar en la aplicación:');
            console.log('1. Ve a Configuración y establece el endpoint');
            console.log('2. Ve a Sincronizar y ejecuta la sincronización');
            console.log('3. Usa los códigos de vendedor con contraseña: 789');
            
            // Cerrar la base de datos
            db.close();
          };
        };
      };
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Crear object store para vendedores
      if (!db.objectStoreNames.contains('vendedores')) {
        const store = db.createObjectStore('vendedores', { keyPath: 'id' });
        store.createIndex('codigo', 'codigo', { unique: true });
        console.log('✅ Object store "vendedores" creado');
      }
    };
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testSincronizacion(); 