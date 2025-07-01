// Sistema de almacenamiento web usando localStorage
export class WebStorage {
  static async getUsuarios() {
    try {
      const data = localStorage.getItem('usuarios');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener usuarios de localStorage:', error);
      return [];
    }
  }

  static async insertUsuarios(usuarios) {
    try {
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      console.log('Usuarios guardados en localStorage:', usuarios);
    } catch (error) {
      console.error('Error al guardar usuarios en localStorage:', error);
      throw error;
    }
  }

  static async getPreventas() {
    try {
      const data = localStorage.getItem('preventas');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener preventas de localStorage:', error);
      return [];
    }
  }

  static async insertPreventa(preventa) {
    try {
      const preventas = await this.getPreventas();
      preventas.push(preventa);
      localStorage.setItem('preventas', JSON.stringify(preventas));
      console.log('Preventa guardada en localStorage:', preventa);
    } catch (error) {
      console.error('Error al guardar preventa en localStorage:', error);
      throw error;
    }
  }

  static async getPreventaById(id) {
    try {
      const preventas = await this.getPreventas();
      return preventas.find(p => p.id === id);
    } catch (error) {
      console.error('Error al obtener preventa por ID:', error);
      return null;
    }
  }

  static async updatePreventa(preventa) {
    try {
      const preventas = await this.getPreventas();
      const index = preventas.findIndex(p => p.id === preventa.id);
      if (index !== -1) {
        preventas[index] = preventa;
        localStorage.setItem('preventas', JSON.stringify(preventas));
        console.log('Preventa actualizada en localStorage:', preventa);
      }
    } catch (error) {
      console.error('Error al actualizar preventa en localStorage:', error);
      throw error;
    }
  }

  static async deletePreventa(id) {
    try {
      const preventas = await this.getPreventas();
      const filteredPreventas = preventas.filter(p => p.id !== id);
      localStorage.setItem('preventas', JSON.stringify(filteredPreventas));
      console.log('Preventa eliminada de localStorage:', id);
    } catch (error) {
      console.error('Error al eliminar preventa de localStorage:', error);
      throw error;
    }
  }

  static async getClientes() {
    try {
      const data = localStorage.getItem('clientes');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener clientes de localStorage:', error);
      return [];
    }
  }

  static async insertClientes(clientes) {
    try {
      localStorage.setItem('clientes', JSON.stringify(clientes));
      console.log('Clientes guardados en localStorage:', clientes);
    } catch (error) {
      console.error('Error al guardar clientes en localStorage:', error);
      throw error;
    }
  }

  static async getArticulos() {
    try {
      const data = localStorage.getItem('articulos');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener artículos de localStorage:', error);
      return [];
    }
  }

  static async insertArticulos(articulos) {
    try {
      localStorage.setItem('articulos', JSON.stringify(articulos));
      console.log('Artículos guardados en localStorage:', articulos);
    } catch (error) {
      console.error('Error al guardar artículos en localStorage:', error);
      throw error;
    }
  }

  // Método para limpiar todos los datos (útil para testing)
  static async clearAll() {
    try {
      localStorage.removeItem('usuarios');
      localStorage.removeItem('preventas');
      localStorage.removeItem('clientes');
      localStorage.removeItem('articulos');
      console.log('Todos los datos de localStorage han sido limpiados');
    } catch (error) {
      console.error('Error al limpiar localStorage:', error);
      throw error;
    }
  }

  // Método para obtener estadísticas de almacenamiento
  static getStorageStats() {
    try {
      const stats = {
        usuarios: localStorage.getItem('usuarios') ? JSON.parse(localStorage.getItem('usuarios')).length : 0,
        preventas: localStorage.getItem('preventas') ? JSON.parse(localStorage.getItem('preventas')).length : 0,
        clientes: localStorage.getItem('clientes') ? JSON.parse(localStorage.getItem('clientes')).length : 0,
        articulos: localStorage.getItem('articulos') ? JSON.parse(localStorage.getItem('articulos')).length : 0,
        totalSize: new Blob([JSON.stringify(localStorage)]).size
      };
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas de localStorage:', error);
      return null;
    }
  }
} 