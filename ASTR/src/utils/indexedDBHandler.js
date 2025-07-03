// Manejador de IndexedDB para almacenamiento local en web
class IndexedDBHandler {
  constructor() {
    this.dbName = 'ASTRDatabase';
    this.dbVersion = 2;
    this.db = null;
  }

  // Inicializar la base de datos
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('❌ Error al abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB inicializada correctamente');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

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

        console.log('🔄 IndexedDB actualizada a versión', this.dbVersion);
      };
    });
  }

  // Métodos para vendedores
  async guardarVendedores(vendedores) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['vendedores'], 'readwrite');
      const store = transaction.objectStore('vendedores');
      
      // Limpiar store existente
      store.clear();
      
      // Mapear y agregar nuevos vendedores
      vendedores.forEach(vendedor => {
        // Mapear campos del servidor a la estructura esperada
        const vendedorMapeado = {
          id: vendedor.id || vendedor.codigo || vendedor.vendedor_id || `v_${Date.now()}_${Math.random()}`,
          codigo: vendedor.codigo || vendedor.id || vendedor.vendedor_id,
          descripcion: vendedor.descripcion || vendedor.nombre || vendedor.vendedor_nombre || 'Sin nombre',
          clave: vendedor.clave || vendedor.password || vendedor.vendedor_clave || '123',
          // Agregar campos adicionales si existen
          ...(vendedor.email && { email: vendedor.email }),
          ...(vendedor.telefono && { telefono: vendedor.telefono }),
          ...(vendedor.activo !== undefined && { activo: vendedor.activo })
        };
        
        console.log('📦 Mapeando vendedor:', vendedorMapeado);
        store.add(vendedorMapeado);
      });

      transaction.oncomplete = () => {
        console.log(`✅ ${vendedores.length} vendedores guardados en IndexedDB`);
        resolve(vendedores.length);
      };

      transaction.onerror = () => {
        console.error('❌ Error al guardar vendedores:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  async obtenerVendedores() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['vendedores'], 'readonly');
      const store = transaction.objectStore('vendedores');
      const request = store.getAll();

      request.onsuccess = () => {
        console.log(`📋 ${request.result.length} vendedores obtenidos de IndexedDB`);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Error al obtener vendedores:', request.error);
        reject(request.error);
      };
    });
  }

  async autenticarVendedor(codigo, clave) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['vendedores'], 'readonly');
      const store = transaction.objectStore('vendedores');
      const index = store.index('codigo');
      const request = index.get(codigo);

      request.onsuccess = () => {
        const vendedor = request.result;
        if (vendedor && vendedor.clave === clave) {
          console.log('✅ Vendedor autenticado:', vendedor);
          resolve(vendedor);
        } else {
          console.log('❌ Autenticación fallida para código:', codigo);
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('❌ Error en autenticación:', request.error);
        reject(request.error);
      };
    });
  }

  // Métodos para clientes
  async guardarClientes(clientes) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['clientes'], 'readwrite');
      const store = transaction.objectStore('clientes');
      
      // Limpiar store existente
      store.clear();
      
      // Mapear y agregar nuevos clientes
      clientes.forEach(cliente => {
        // Mapear campos del servidor a la estructura esperada
        const clienteMapeado = {
          id: cliente.id || cliente.codigo || cliente.cliente_id || `c_${Date.now()}_${Math.random()}`,
          descripcion: cliente.descripcion || cliente.nombre || cliente.cliente_nombre || 'Sin nombre',
          codigoVendedor: cliente.codigoVendedor || cliente.vendedor_id || cliente.vendedor || '001',
          listaPrecio: cliente.listaPrecio || cliente.lista_precio || cliente.precio_lista || '1',
          // Agregar campos adicionales si existen
          ...(cliente.direccion && { direccion: cliente.direccion }),
          ...(cliente.telefono && { telefono: cliente.telefono }),
          ...(cliente.email && { email: cliente.email }),
          ...(cliente.cuit && { cuit: cliente.cuit }),
          ...(cliente.condicionIva && { condicionIva: cliente.condicionIva }),
          ...(cliente.activo !== undefined && { activo: cliente.activo })
        };
        
        console.log('📦 Mapeando cliente:', clienteMapeado);
        store.add(clienteMapeado);
      });

      transaction.oncomplete = () => {
        console.log(`✅ ${clientes.length} clientes guardados en IndexedDB`);
        resolve(clientes.length);
      };

      transaction.onerror = () => {
        console.error('❌ Error al guardar clientes:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  async obtenerClientes() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['clientes'], 'readonly');
      const store = transaction.objectStore('clientes');
      const request = store.getAll();

      request.onsuccess = () => {
        console.log(`📋 ${request.result.length} clientes obtenidos de IndexedDB`);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Error al obtener clientes:', request.error);
        reject(request.error);
      };
    });
  }

  async obtenerClientesPorVendedor(codigoVendedor) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['clientes'], 'readonly');
      const store = transaction.objectStore('clientes');
      const index = store.index('vendedor');
      const request = index.getAll(codigoVendedor);

      request.onsuccess = () => {
        console.log(`📋 ${request.result.length} clientes obtenidos para vendedor ${codigoVendedor}`);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Error al obtener clientes por vendedor:', request.error);
        reject(request.error);
      };
    });
  }

  // Métodos para artículos
  async guardarArticulos(articulos) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['articulos'], 'readwrite');
      const store = transaction.objectStore('articulos');
      
      // Limpiar store existente
      store.clear();
      
      // Agregar artículos con solo el campo id agregado
      articulos.forEach(articulo => {
        // Solo agregar el campo id necesario para IndexedDB
        const articuloConId = {
          id: articulo.codigo, // Usar el código como id
          ...articulo // Mantener todos los campos originales
        };
        
        console.log('📦 Guardando artículo:', articuloConId.id);
        store.add(articuloConId);
      });

      transaction.oncomplete = () => {
        console.log(`✅ ${articulos.length} artículos guardados en IndexedDB`);
        resolve(articulos.length);
      };

      transaction.onerror = () => {
        console.error('❌ Error al guardar artículos:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  async obtenerArticulos() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['articulos'], 'readonly');
      const store = transaction.objectStore('articulos');
      const request = store.getAll();

      request.onsuccess = () => {
        console.log(`📋 ${request.result.length} artículos obtenidos de IndexedDB`);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Error al obtener artículos:', request.error);
        reject(request.error);
      };
    });
  }

  // Métodos para configuración
  async guardarConfiguracion(config) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['configuracion'], 'readwrite');
      const store = transaction.objectStore('configuracion');
      
      const configData = {
        id: 'config',
        ...config,
        fechaActualizacion: new Date().toISOString()
      };

      const request = store.put(configData);

      request.onsuccess = () => {
        console.log('✅ Configuración guardada en IndexedDB');
        resolve(configData);
      };

      request.onerror = () => {
        console.error('❌ Error al guardar configuración:', request.error);
        reject(request.error);
      };
    });
  }

  async obtenerConfiguracion() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['configuracion'], 'readonly');
      const store = transaction.objectStore('configuracion');
      const request = store.get('config');

      request.onsuccess = () => {
        console.log('📋 Configuración obtenida de IndexedDB');
        resolve(request.result || {});
      };

      request.onerror = () => {
        console.error('❌ Error al obtener configuración:', request.error);
        reject(request.error);
      };
    });
  }

  // Método para limpiar toda la base de datos
  async limpiarBaseDatos() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const stores = ['vendedores', 'clientes', 'articulos', 'configuracion', 'preventas'];
      const transaction = this.db.transaction(stores, 'readwrite');
      
      let completed = 0;
      const total = stores.length;

      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          completed++;
          if (completed === total) {
            console.log('🗑️ Base de datos limpiada completamente');
            resolve();
          }
        };

        request.onerror = () => {
          console.error(`❌ Error al limpiar ${storeName}:`, request.error);
          reject(request.error);
        };
      });
    });
  }

  // Método para obtener estadísticas de la base de datos
  async obtenerEstadisticas() {
    if (!this.db) await this.init();
    
    const stats = {};
    const stores = ['vendedores', 'clientes', 'articulos', 'preventas'];

    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      stats[storeName] = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    return stats;
  }

  // Métodos para preventas
  async guardarPreventa(preventa) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['preventas'], 'readwrite');
      const store = transaction.objectStore('preventas');
      
      // Crear objeto preventa con estructura completa
      const preventaData = {
        id: preventa.numero || `prev_${Date.now()}_${Math.random()}`,
        numero: preventa.numero || `PREV${Date.now()}`,
        clienteId: preventa.cliente?.id || preventa.clienteId,
        cliente: preventa.cliente,
        items: preventa.items || preventa.carrito || [],
        nota: preventa.nota || '',
        total: preventa.total || 0,
        fecha: preventa.fecha || new Date().toISOString(),
        estado: preventa.estado || 'borrador',
        vendedorId: preventa.vendedorId || null
      };

      const request = store.put(preventaData);

      request.onsuccess = () => {
        console.log('✅ Preventa guardada en IndexedDB:', preventaData.numero);
        resolve(preventaData);
      };

      request.onerror = () => {
        console.error('❌ Error al guardar preventa:', request.error);
        reject(request.error);
      };
    });
  }

  async obtenerPreventa(numero) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['preventas'], 'readonly');
      const store = transaction.objectStore('preventas');
      const index = store.index('numero');
      const request = index.get(numero);

      request.onsuccess = () => {
        console.log('📋 Preventa obtenida de IndexedDB:', numero);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Error al obtener preventa:', request.error);
        reject(request.error);
      };
    });
  }

  async obtenerPreventasPorCliente(clienteId) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['preventas'], 'readonly');
      const store = transaction.objectStore('preventas');
      const index = store.index('cliente');
      const request = index.getAll(clienteId);

      request.onsuccess = () => {
        console.log(`📋 ${request.result.length} preventas obtenidas para cliente ${clienteId}`);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Error al obtener preventas por cliente:', request.error);
        reject(request.error);
      };
    });
  }

  async obtenerTodasPreventas() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['preventas'], 'readonly');
      const store = transaction.objectStore('preventas');
      const request = store.getAll();

      request.onsuccess = () => {
        console.log(`📋 ${request.result.length} preventas obtenidas de IndexedDB`);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Error al obtener preventas:', request.error);
        reject(request.error);
      };
    });
  }

  async eliminarPreventa(numero) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['preventas'], 'readwrite');
      const store = transaction.objectStore('preventas');
      const index = store.index('numero');
      const request = index.getKey(numero);

      request.onsuccess = () => {
        if (request.result) {
          const deleteRequest = store.delete(request.result);
          deleteRequest.onsuccess = () => {
            console.log('🗑️ Preventa eliminada de IndexedDB:', numero);
            resolve(true);
          };
          deleteRequest.onerror = () => {
            console.error('❌ Error al eliminar preventa:', deleteRequest.error);
            reject(deleteRequest.error);
          };
        } else {
          console.log('⚠️ Preventa no encontrada para eliminar:', numero);
          resolve(false);
        }
      };

      request.onerror = () => {
        console.error('❌ Error al buscar preventa para eliminar:', request.error);
        reject(request.error);
      };
    });
  }

  async limpiarPreventas() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['preventas'], 'readwrite');
      const store = transaction.objectStore('preventas');
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🗑️ Todas las preventas eliminadas de IndexedDB');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Error al limpiar preventas:', request.error);
        reject(request.error);
      };
    });
  }
}

// Crear instancia singleton
const indexedDBHandler = new IndexedDBHandler();

export default indexedDBHandler; 