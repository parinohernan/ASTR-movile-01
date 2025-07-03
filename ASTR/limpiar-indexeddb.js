// Script para limpiar IndexedDB y forzar la recreación
console.log('=== LIMPIANDO INDEXEDDB PARA ACTUALIZACIÓN ===');

const limpiarIndexedDB = () => {
  return new Promise((resolve, reject) => {
    console.log('🔄 Eliminando base de datos existente...');
    
    const request = indexedDB.deleteDatabase('ASTRDatabase');
    
    request.onsuccess = () => {
      console.log('✅ Base de datos eliminada exitosamente');
      console.log('🔄 La próxima vez que se abra, se creará con la nueva versión');
      resolve();
    };
    
    request.onerror = () => {
      console.error('❌ Error al eliminar la base de datos:', request.error);
      reject(request.error);
    };
    
    request.onblocked = () => {
      console.log('⚠️ Base de datos bloqueada, intentando eliminar...');
    };
  });
};

const verificarNuevaVersion = () => {
  return new Promise((resolve, reject) => {
    console.log('🔄 Verificando nueva versión de IndexedDB...');
    
    const request = indexedDB.open('ASTRDatabase', 2);
    
    request.onerror = () => {
      console.error('❌ Error al abrir nueva versión:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      const db = request.result;
      console.log('✅ Nueva versión de IndexedDB creada correctamente');
      console.log('  - Nombre:', db.name);
      console.log('  - Versión:', db.version);
      console.log('  - Object stores:', Array.from(db.objectStoreNames));
      
      db.close();
      resolve();
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      console.log('🔄 Actualizando IndexedDB a versión 2...');
      
      // Crear object stores
      if (!db.objectStoreNames.contains('vendedores')) {
        const vendedoresStore = db.createObjectStore('vendedores', { keyPath: 'id' });
        vendedoresStore.createIndex('codigo', 'codigo', { unique: true });
        console.log('📦 Object store "vendedores" creado');
      }

      if (!db.objectStoreNames.contains('clientes')) {
        const clientesStore = db.createObjectStore('clientes', { keyPath: 'id' });
        clientesStore.createIndex('codigo', 'id', { unique: true });
        clientesStore.createIndex('vendedor', 'codigoVendedor', { unique: false });
        console.log('📦 Object store "clientes" creado');
      }

      if (!db.objectStoreNames.contains('articulos')) {
        const articulosStore = db.createObjectStore('articulos', { keyPath: 'id' });
        articulosStore.createIndex('codigo', 'id', { unique: true });
        console.log('📦 Object store "articulos" creado');
      }

      if (!db.objectStoreNames.contains('configuracion')) {
        const configStore = db.createObjectStore('configuracion', { keyPath: 'id' });
        console.log('📦 Object store "configuracion" creado');
      }

      if (!db.objectStoreNames.contains('preventas')) {
        const preventasStore = db.createObjectStore('preventas', { keyPath: 'id' });
        preventasStore.createIndex('numero', 'numero', { unique: false });
        preventasStore.createIndex('cliente', 'clienteId', { unique: false });
        preventasStore.createIndex('fecha', 'fecha', { unique: false });
        console.log('📦 Object store "preventas" creado');
      }

      console.log('🔄 IndexedDB actualizada a versión 2');
    };
  });
};

const ejecutarLimpieza = async () => {
  try {
    console.log('=== INICIANDO PROCESO DE LIMPIEZA ===');
    
    // Verificar si IndexedDB está disponible
    if (!window.indexedDB) {
      console.error('❌ IndexedDB no está disponible en este navegador');
      return;
    }
    
    // Limpiar base de datos existente
    await limpiarIndexedDB();
    
    // Verificar nueva versión
    await verificarNuevaVersion();
    
    console.log('');
    console.log('=== PROCESO COMPLETADO ===');
    console.log('✅ IndexedDB limpiada y actualizada correctamente');
    console.log('✅ Object store "preventas" disponible');
    console.log('✅ Puedes usar la funcionalidad de guardar preventas');
    console.log('');
    console.log('=== PRÓXIMOS PASOS ===');
    console.log('1. Recarga la aplicación');
    console.log('2. Intenta guardar una preventa');
    console.log('3. Verifica que funcione correctamente');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
};

// Ejecutar si estamos en un entorno de navegador
if (typeof window !== 'undefined' && window.indexedDB) {
  ejecutarLimpieza();
} else {
  console.log('⚠️ Este script debe ejecutarse en un navegador web');
  console.log('⚠️ IndexedDB no está disponible en Node.js');
} 