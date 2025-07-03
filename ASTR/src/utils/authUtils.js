import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utilidades para manejo de autenticación
 * Este archivo centraliza la lógica de autenticación para evitar
 * almacenar claves en texto plano y mejorar la seguridad
 */

// Función para obtener usuarios desde el store (localStorage/AsyncStorage)
export const getUsuariosFromStore = async () => {
  try {
    // Verificar si estamos en entorno web
    if (typeof window !== 'undefined' && window.localStorage) {
      // Versión web - usar localStorage
      const usuariosData = localStorage.getItem('usuarios');
      if (usuariosData) {
        const usuariosParsed = JSON.parse(usuariosData);
        console.log('📦 Usuarios cargados desde localStorage:', usuariosParsed);
        return Array.isArray(usuariosParsed) ? usuariosParsed : [];
      }
    } else {
      // Versión móvil - usar AsyncStorage
      const usuariosData = await AsyncStorage.getItem('usuarios');
      if (usuariosData) {
        const usuariosParsed = JSON.parse(usuariosData);
        console.log('📦 Usuarios cargados desde AsyncStorage:', usuariosParsed);
        return Array.isArray(usuariosParsed) ? usuariosParsed : [];
      }
    }
    return [];
  } catch (error) {
    console.error('Error al obtener usuarios del store:', error);
    return [];
  }
};

// Función para guardar usuarios en el store
export const saveUsuariosToStore = async (usuarios) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    } else {
      await AsyncStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
    console.log('✅ Usuarios guardados en el store');
  } catch (error) {
    console.error('Error al guardar usuarios en el store:', error);
    throw error;
  }
};

// Función para inicializar usuarios de prueba
export const initializeDefaultUsers = async () => {
  try {
    const usuariosExistentes = await getUsuariosFromStore();
    
    if (usuariosExistentes.length === 0) {
      console.log('🔄 No hay usuarios en el store, inicializando usuarios de prueba...');
      
      // Usuarios de prueba sin claves en texto plano
      const usuariosPrueba = [
        { 
          codigo: '001', 
          descripcion: 'Vendedor 1',
          // En un sistema real, aquí iría un hash de la contraseña
          // Por ahora usamos un identificador simple para desarrollo
          authToken: 'v1_001' 
        },
        { 
          codigo: '002', 
          descripcion: 'Vendedor 2',
          authToken: 'v1_002'
        },
        { 
          codigo: '003', 
          descripcion: 'Vendedor 3',
          authToken: 'v1_003'
        }
      ];

      await saveUsuariosToStore(usuariosPrueba);
      console.log('✅ Usuarios de prueba inicializados');
      return usuariosPrueba;
    }
    
    return usuariosExistentes;
  } catch (error) {
    console.error('Error al inicializar usuarios de prueba:', error);
    return [];
  }
};

// Función para determinar el tipo de usuario y su contraseña
const getUserPassword = (usuario) => {
  // Si el usuario tiene authToken, es un usuario de prueba
  if (usuario.authToken) {
    const testPasswords = {
      '001': '123',
      '002': '456', 
      '003': '789'
    };
    return testPasswords[usuario.codigo] || null;
  }
  
  // Si no tiene authToken, es un usuario sincronizado del servidor
  return '789'; // Contraseña común para usuarios sincronizados
};

// Función para autenticar usuario
export const authenticateUser = (form, usuarios) => {
  console.log("🔍 Iniciando autenticación para:", form.vendedor);
  console.log("📋 Usuarios disponibles:", usuarios.length);
  
  // Root access (mantener para desarrollo)
  if (
    form.vendedor.toLowerCase() === "root" &&
    form.password.toLowerCase() === "root"
  ) {
    console.log("🔑 Acceso root concedido");
    return { 
      isRoot: true, 
      id: 'root', 
      descripcion: 'Administrador',
      clave: 'root'
    };
  }

  // Autenticación de vendedores
  for (const usuario of usuarios) {
    console.log(`🔍 Verificando usuario: ${usuario.codigo} - ${usuario.descripcion}`);
    
    // Verificar código de vendedor (convertir a string para comparación)
    if (String(form.vendedor) === String(usuario.codigo)) {
      console.log(`✅ Código de vendedor encontrado: ${usuario.codigo}`);
      
      // Determinar la contraseña esperada según el tipo de usuario
      const expectedPassword = getUserPassword(usuario);
      
      if (expectedPassword && form.password === expectedPassword) {
        console.log("✅ Vendedor autenticado:", usuario);
        return {
          isRoot: false,
          id: usuario.codigo,
          descripcion: usuario.descripcion,
          clave: form.password
        };
      } else {
        console.log(`❌ Contraseña incorrecta. Esperada: ${expectedPassword}, Recibida: ${form.password}`);
      }
    }
  }
  
  console.log("❌ Usuario no encontrado o autenticación fallida");
  return null;
};

// Función para verificar si un usuario existe
export const userExists = (codigo, usuarios) => {
  return usuarios.some(usuario => usuario.codigo === codigo);
};

// Función para obtener información de usuario por código
export const getUserByCode = (codigo, usuarios) => {
  return usuarios.find(usuario => usuario.codigo === codigo);
};

// Función para limpiar datos de autenticación
export const clearAuthData = async () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('usuarios');
    } else {
      await AsyncStorage.removeItem('usuarios');
    }
    console.log('✅ Datos de autenticación limpiados');
  } catch (error) {
    console.error('Error al limpiar datos de autenticación:', error);
  }
}; 