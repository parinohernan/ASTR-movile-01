// webDatabase.js - Base de datos para web usando localStorage
class WebDatabase {
  constructor() {
    this.initialized = false;
  }

  async init() {
    try {
      console.log('🌐 Inicializando base de datos web...');
      
      // Inicializar datos por defecto si no existen
      if (!localStorage.getItem('usuarios')) {
        const usuariosDefault = [
          { id: '001', descripcion: 'Vendedor 1', clave: '123' },
          { id: '002', descripcion: 'Vendedor 2', clave: '456' },
          { id: '003', descripcion: 'Vendedor 3', clave: '789' }
        ];
        localStorage.setItem('usuarios', JSON.stringify(usuariosDefault));
      }
      
      if (!localStorage.getItem('preventas')) {
        localStorage.setItem('preventas', JSON.stringify([]));
      }
      
      if (!localStorage.getItem('clientes')) {
        localStorage.setItem('clientes', JSON.stringify([]));
      }
      
      if (!localStorage.getItem('articulos')) {
        localStorage.setItem('articulos', JSON.stringify([]));
      }
      
      if (!localStorage.getItem('configuracion')) {
        const configDefault = {
          endpoint: '',
          vendedorSeleccionado: '',
          cantidadMaximaArticulos: '50',
          mostrarPrecios: true,
          mostrarStock: true,
        };
        localStorage.setItem('configuracion', JSON.stringify(configDefault));
      }
      
      this.initialized = true;
      console.log('✅ Base de datos web inicializada');
      return true;
    } catch (error) {
      console.error('❌ Error al inicializar base de datos web:', error);
      throw error;
    }
  }

  // Métodos para usuarios
  async getUsuarios() {
    try {
      const data = localStorage.getItem('usuarios');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }

  async insertUsuario(usuario) {
    try {
      const usuarios = await this.getUsuarios();
      usuarios.push(usuario);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      return { success: true, id: usuario.id };
    } catch (error) {
      console.error('Error al insertar usuario:', error);
      throw error;
    }
  }

  async updateUsuario(usuario) {
    try {
      const usuarios = await this.getUsuarios();
      const index = usuarios.findIndex(u => u.id === usuario.id);
      if (index !== -1) {
        usuarios[index] = usuario;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        return { success: true };
      }
      throw new Error('Usuario no encontrado');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  async deleteUsuario(id) {
    try {
      const usuarios = await this.getUsuarios();
      const filtered = usuarios.filter(u => u.id !== id);
      localStorage.setItem('usuarios', JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  // Métodos para preventas
  async getPreventas() {
    try {
      const data = localStorage.getItem('preventas');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener preventas:', error);
      return [];
    }
  }

  async insertPreventa(preventa) {
    try {
      const preventas = await this.getPreventas();
      preventas.push(preventa);
      localStorage.setItem('preventas', JSON.stringify(preventas));
      return { success: true, id: preventa.id };
    } catch (error) {
      console.error('Error al insertar preventa:', error);
      throw error;
    }
  }

  async updatePreventa(preventa) {
    try {
      const preventas = await this.getPreventas();
      const index = preventas.findIndex(p => p.id === preventa.id);
      if (index !== -1) {
        preventas[index] = preventa;
        localStorage.setItem('preventas', JSON.stringify(preventas));
        return { success: true };
      }
      throw new Error('Preventa no encontrada');
    } catch (error) {
      console.error('Error al actualizar preventa:', error);
      throw error;
    }
  }

  async deletePreventa(id) {
    try {
      const preventas = await this.getPreventas();
      const filtered = preventas.filter(p => p.id !== id);
      localStorage.setItem('preventas', JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar preventa:', error);
      throw error;
    }
  }

  // Métodos para clientes
  async getClientes() {
    try {
      const data = localStorage.getItem('clientes');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      return [];
    }
  }

  async insertClientes(clientes) {
    try {
      localStorage.setItem('clientes', JSON.stringify(clientes));
      return { success: true };
    } catch (error) {
      console.error('Error al insertar clientes:', error);
      throw error;
    }
  }

  // Métodos para artículos
  async getArticulos() {
    try {
      const data = localStorage.getItem('articulos');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener artículos:', error);
      return [];
    }
  }

  async insertArticulos(articulos) {
    try {
      localStorage.setItem('articulos', JSON.stringify(articulos));
      return { success: true };
    } catch (error) {
      console.error('Error al insertar artículos:', error);
      throw error;
    }
  }

  // Métodos para configuración
  async getConfiguracion() {
    try {
      const data = localStorage.getItem('configuracion');
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      return {};
    }
  }

  async saveConfiguracion(config) {
    try {
      localStorage.setItem('configuracion', JSON.stringify(config));
      return { success: true };
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      throw error;
    }
  }

  // Métodos de limpieza
  async clearAll() {
    try {
      localStorage.clear();
      await this.init();
      return { success: true };
    } catch (error) {
      console.error('Error al limpiar base de datos:', error);
      throw error;
    }
  }

  // Métodos de estadísticas
  getStats() {
    try {
      return {
        usuarios: JSON.parse(localStorage.getItem('usuarios') || '[]').length,
        preventas: JSON.parse(localStorage.getItem('preventas') || '[]').length,
        clientes: JSON.parse(localStorage.getItem('clientes') || '[]').length,
        articulos: JSON.parse(localStorage.getItem('articulos') || '[]').length,
        configuracion: localStorage.getItem('configuracion') ? true : false,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {};
    }
  }
}

// Crear instancia singleton
const webDatabase = new WebDatabase();

export default webDatabase; 