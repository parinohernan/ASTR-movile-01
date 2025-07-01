import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { WebStorage } from './webStorage';

class DatabaseManager {
  constructor() {
    this.isWeb = Platform.OS === 'web';
    this.storage = this.isWeb ? new WebStorage() : SQLite.openDatabase('osvi.db');
    console.log(`🔧 DatabaseManager inicializado para: ${this.isWeb ? 'WEB' : 'MOBILE'}`);
  }

  // Métodos para usuarios
  async getUsuarios() {
    if (this.isWeb) {
      return await WebStorage.getUsuarios();
    } else {
      return new Promise((resolve, reject) => {
        this.storage.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM usuarios',
            [],
            (_, { rows }) => {
              console.log('Usuarios obtenidos de SQLite:', rows._array);
              resolve(rows._array || []);
            },
            (_, error) => {
              console.error('Error al obtener usuarios de SQLite:', error);
              reject(error);
            }
          );
        });
      });
    }
  }

  async insertUsuarios(usuarios) {
    if (this.isWeb) {
      return await WebStorage.insertUsuarios(usuarios);
    } else {
      return new Promise((resolve, reject) => {
        this.storage.transaction(tx => {
          usuarios.forEach(usuario => {
            tx.executeSql(
              'INSERT OR REPLACE INTO usuarios (id, descripcion, clave) VALUES (?, ?, ?)',
              [usuario.codigo, usuario.descripcion, usuario.clave],
              (_, result) => {
                console.log('Usuario insertado en SQLite:', result.insertId);
              },
              (_, error) => {
                console.error('Error al insertar usuario en SQLite:', error);
                reject(error);
              }
            );
          });
        }, reject, resolve);
      });
    }
  }

  // Métodos para preventas
  async getPreventas() {
    if (this.isWeb) {
      return await WebStorage.getPreventas();
    } else {
      return new Promise((resolve, reject) => {
        this.storage.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM preventaCabeza ORDER BY id DESC',
            [],
            (_, { rows }) => {
              console.log('Preventas obtenidas de SQLite:', rows._array);
              resolve(rows._array || []);
            },
            (_, error) => {
              console.error('Error al obtener preventas de SQLite:', error);
              reject(error);
            }
          );
        });
      });
    }
  }

  async insertPreventa(preventa) {
    if (this.isWeb) {
      return await WebStorage.insertPreventa(preventa);
    } else {
      return new Promise((resolve, reject) => {
        this.storage.transaction(tx => {
          tx.executeSql(
            'INSERT INTO preventaCabeza (cliente, importetotal, observacion, fecha, cantidadItems) VALUES (?, ?, ?, ?, ?)',
            [preventa.cliente, preventa.importetotal, preventa.observacion, preventa.fecha, preventa.cantidadItems],
            (_, result) => {
              console.log('Preventa insertada en SQLite:', result.insertId);
              resolve(result.insertId);
            },
            (_, error) => {
              console.error('Error al insertar preventa en SQLite:', error);
              reject(error);
            }
          );
        });
      });
    }
  }

  async updatePreventa(preventa) {
    if (this.isWeb) {
      return await WebStorage.updatePreventa(preventa);
    } else {
      return new Promise((resolve, reject) => {
        this.storage.transaction(tx => {
          tx.executeSql(
            'UPDATE preventaCabeza SET cliente = ?, importetotal = ?, observacion = ?, fecha = ?, cantidadItems = ? WHERE id = ?',
            [preventa.cliente, preventa.importetotal, preventa.observacion, preventa.fecha, preventa.cantidadItems, preventa.id],
            (_, result) => {
              console.log('Preventa actualizada en SQLite:', result.rowsAffected);
              resolve(result.rowsAffected);
            },
            (_, error) => {
              console.error('Error al actualizar preventa en SQLite:', error);
              reject(error);
            }
          );
        });
      });
    }
  }

  async deletePreventa(id) {
    if (this.isWeb) {
      return await WebStorage.deletePreventa(id);
    } else {
      return new Promise((resolve, reject) => {
        this.storage.transaction(tx => {
          tx.executeSql(
            'DELETE FROM preventaCabeza WHERE id = ?',
            [id],
            (_, result) => {
              console.log('Preventa eliminada de SQLite:', result.rowsAffected);
              resolve(result.rowsAffected);
            },
            (_, error) => {
              console.error('Error al eliminar preventa de SQLite:', error);
              reject(error);
            }
          );
        });
      });
    }
  }

  // Métodos para clientes
  async getClientes() {
    if (this.isWeb) {
      return await WebStorage.getClientes();
    } else {
      return new Promise((resolve, reject) => {
        this.storage.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM clientes',
            [],
            (_, { rows }) => {
              console.log('Clientes obtenidos de SQLite:', rows._array);
              resolve(rows._array || []);
            },
            (_, error) => {
              console.error('Error al obtener clientes de SQLite:', error);
              reject(error);
            }
          );
        });
      });
    }
  }

  async insertClientes(clientes) {
    if (this.isWeb) {
      return await WebStorage.insertClientes(clientes);
    } else {
      return new Promise((resolve, reject) => {
        this.storage.transaction(tx => {
          clientes.forEach(cliente => {
            tx.executeSql(
              'INSERT OR REPLACE INTO clientes (id, descripcion, codigoVendedor) VALUES (?, ?, ?)',
              [cliente.id, cliente.descripcion, cliente.codigoVendedor],
              (_, result) => {
                console.log('Cliente insertado en SQLite:', result.insertId);
              },
              (_, error) => {
                console.error('Error al insertar cliente en SQLite:', error);
                reject(error);
              }
            );
          });
        }, reject, resolve);
      });
    }
  }

  // Métodos para artículos
  async getArticulos() {
    if (this.isWeb) {
      return await WebStorage.getArticulos();
    } else {
      return new Promise((resolve, reject) => {
        this.storage.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM articulos',
            [],
            (_, { rows }) => {
              console.log('Artículos obtenidos de SQLite:', rows._array);
              resolve(rows._array || []);
            },
            (_, error) => {
              console.error('Error al obtener artículos de SQLite:', error);
              reject(error);
            }
          );
        });
      });
    }
  }

  async insertArticulos(articulos) {
    if (this.isWeb) {
      return await WebStorage.insertArticulos(articulos);
    } else {
      return new Promise((resolve, reject) => {
        this.storage.transaction(tx => {
          articulos.forEach(articulo => {
            tx.executeSql(
              'INSERT OR REPLACE INTO articulos (id, descripcion, precio) VALUES (?, ?, ?)',
              [articulo.id, articulo.descripcion, articulo.precio],
              (_, result) => {
                console.log('Artículo insertado en SQLite:', result.insertId);
              },
              (_, error) => {
                console.error('Error al insertar artículo en SQLite:', error);
                reject(error);
              }
            );
          });
        }, reject, resolve);
      });
    }
  }

  // Método para obtener estadísticas
  async getStats() {
    if (this.isWeb) {
      return WebStorage.getStorageStats();
    } else {
      // Para SQLite, podríamos implementar consultas de estadísticas
      return {
        platform: 'mobile',
        database: 'sqlite'
      };
    }
  }

  // Método para limpiar datos (útil para testing)
  async clearAll() {
    if (this.isWeb) {
      return await WebStorage.clearAll();
    } else {
      return new Promise((resolve, reject) => {
        this.storage.transaction(tx => {
          tx.executeSql('DELETE FROM usuarios', [], () => {});
          tx.executeSql('DELETE FROM preventaCabeza', [], () => {});
          tx.executeSql('DELETE FROM clientes', [], () => {});
          tx.executeSql('DELETE FROM articulos', [], () => {});
        }, reject, resolve);
      });
    }
  }
}

// Instancia global del gestor de base de datos
export const dbManager = new DatabaseManager();

// Exportar para compatibilidad con código existente
export const db = dbManager; 