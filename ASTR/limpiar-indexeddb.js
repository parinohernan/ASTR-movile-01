// Script para limpiar datos antiguos y asegurar sincronización correcta
// Ejecutar en la consola del navegador (F12)

async function limpiarDatosAntiguos() {
  console.log('🧹 === LIMPIANDO DATOS ANTIGUOS ===\n');
  
  try {
    // 1. Limpiar localStorage
    console.log('1️⃣ Limpiando localStorage...');
    localStorage.removeItem('usuarios');
    localStorage.removeItem('clientes');
    localStorage.removeItem('articulos');
    console.log('✅ localStorage limpiado\n');
    
    // 2. Limpiar IndexedDB
    console.log('2️⃣ Limpiando IndexedDB...');
    if (window.indexedDB) {
      // Eliminar la base de datos existente
      const deleteRequest = indexedDB.deleteDatabase('ASTRDatabase');
      
      deleteRequest.onsuccess = () => {
        console.log('✅ IndexedDB eliminado exitosamente');
        
        // 3. Reinicializar IndexedDB
        console.log('\n3️⃣ Reinicializando IndexedDB...');
        const initRequest = indexedDB.open('ASTRDatabase', 1);
        
        initRequest.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          // Crear object stores
          if (!db.objectStoreNames.contains('vendedores')) {
            const vendedoresStore = db.createObjectStore('vendedores', { keyPath: 'id' });
            vendedoresStore.createIndex('codigo', 'codigo', { unique: true });
            console.log('✅ Object store "vendedores" creado');
          }
          
          if (!db.objectStoreNames.contains('clientes')) {
            const clientesStore = db.createObjectStore('clientes', { keyPath: 'id' });
            clientesStore.createIndex('vendedor', 'codigoVendedor', { unique: false });
            console.log('✅ Object store "clientes" creado');
          }
          
          if (!db.objectStoreNames.contains('articulos')) {
            const articulosStore = db.createObjectStore('articulos', { keyPath: 'id' });
            console.log('✅ Object store "articulos" creado');
          }
          
          if (!db.objectStoreNames.contains('configuracion')) {
            const configStore = db.createObjectStore('configuracion', { keyPath: 'id' });
            console.log('✅ Object store "configuracion" creado');
          }
          
          if (!db.objectStoreNames.contains('preventas')) {
            const preventasStore = db.createObjectStore('preventas', { keyPath: 'numero' });
            console.log('✅ Object store "preventas" creado');
          }
        };
        
        initRequest.onsuccess = () => {
          console.log('✅ IndexedDB reinicializado correctamente');
          console.log('\n🎉 Limpieza completada exitosamente!');
          console.log('\n📋 Próximos pasos:');
          console.log('1. Ve a Configuración y establece el endpoint');
          console.log('2. Ve a Sincronizar y ejecuta la sincronización');
          console.log('3. Los usuarios sincronizados aparecerán en el panel de administración');
        };
        
        initRequest.onerror = () => {
          console.error('❌ Error al reinicializar IndexedDB:', initRequest.error);
        };
      };
      
      deleteRequest.onerror = () => {
        console.error('❌ Error al eliminar IndexedDB:', deleteRequest.error);
      };
    } else {
      console.log('⚠️ IndexedDB no está disponible');
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
}

// Ejecutar la limpieza
limpiarDatosAntiguos(); 