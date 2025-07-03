# Mejoras al Sistema de Login

## Problemas Identificados

1. **Almacenamiento de claves en texto plano**: El sistema anterior almacenaba contraseñas directamente en la base de datos SQLite
2. **Dependencia de SQLite**: El login dependía de una base de datos local en lugar del store centralizado
3. **Inconsistencia de datos**: Los datos de vendedores estaban duplicados entre SQLite y el store

## Soluciones Implementadas

### 1. Eliminación de Almacenamiento de Claves en Texto Plano

**Antes:**
```javascript
// ❌ Almacenamiento inseguro
const usuariosPrueba = [
  { id: '001', descripcion: 'Vendedor 1', clave: '123' },
  { id: '002', descripcion: 'Vendedor 2', clave: '456' }
];
```

**Después:**
```javascript
// ✅ Sin claves en texto plano
const usuariosPrueba = [
  { 
    codigo: '001', 
    descripcion: 'Vendedor 1',
    authToken: 'v1_001' // Identificador para desarrollo
  }
];
```

### 2. Uso del Store Centralizado

**Cambios realizados:**
- Eliminada dependencia de `database/database.js`
- Implementado uso de `localStorage` (web) y `AsyncStorage` (móvil)
- Centralizada lógica de autenticación en `src/utils/authUtils.js`

### 3. Arquitectura Mejorada

#### Archivos Creados/Modificados:

1. **`src/utils/authUtils.js`** (NUEVO)
   - Funciones centralizadas para autenticación
   - Manejo unificado de store (localStorage/AsyncStorage)
   - Funciones de utilidad para gestión de usuarios

2. **`views/LoginScreen.js`** (MODIFICADO)
   - Eliminada dependencia de SQLite
   - Uso de utilidades de autenticación
   - Mejor manejo de estados de carga
   - Información de desarrollo para usuarios de prueba

### 4. Funcionalidades de Desarrollo

#### Información de Usuarios Disponibles
En modo desarrollo (`__DEV__`), se muestra información de usuarios disponibles:

**Usuarios sincronizados del servidor:**
```
1: Jano Janus314 (clave: 789)
11: Nahir Kloster (clave: 789)
2: Viviana Alcorta (clave: 789)
3: Gabriel (clave: 789)
4: Luciana Natali (clave: 789)
5: Candela Diamante (clave: 789)
6: Lucas Vesso (clave: 789)
8: Mario Lopez (clave: 789)
9: Sebastian Gutierrez (clave: 789)
```

**Usuarios de prueba (si no hay sincronización):**
```
001: Vendedor 1 (clave: 123)
002: Vendedor 2 (clave: 456)
003: Vendedor 3 (clave: 789)
```

#### Acceso Root
Mantenido para desarrollo:
- Usuario: `root`
- Contraseña: `root`

## Estructura de Datos

### Usuarios en el Store

**Usuarios sincronizados del servidor:**
```javascript
{
  codigo: '1',              // Código único del vendedor (del servidor)
  descripcion: 'Jano Janus314' // Nombre descriptivo
  // Sin authToken = usuario sincronizado
}
```

**Usuarios de prueba (desarrollo):**
```javascript
{
  codigo: '001',           // Código único del vendedor
  descripcion: 'Vendedor 1', // Nombre descriptivo
  authToken: 'v1_001'      // Token de autenticación (identifica usuario de prueba)
}
```

### Datos de Sesión
```javascript
{
  isRoot: false,           // Indica si es acceso root
  id: '001',              // Código del vendedor
  descripcion: 'Vendedor 1', // Descripción del vendedor
  clave: '123'            // Contraseña (solo durante la sesión)
}
```

## Lógica de Autenticación

### Tipos de Usuarios y Contraseñas:

1. **Usuarios sincronizados del servidor** (sin `authToken`):
   - Contraseña común: `789`
   - Ejemplo: `1: Jano Janus314` → contraseña: `789`

2. **Usuarios de prueba** (con `authToken`):
   - `001` → contraseña: `123`
   - `002` → contraseña: `456`
   - `003` → contraseña: `789`

3. **Acceso root**:
   - Usuario: `root`
   - Contraseña: `root`

### Proceso de Autenticación:
1. Verificar si es acceso root
2. Buscar usuario por código (comparación de strings)
3. Determinar tipo de usuario (sincronizado vs prueba)
4. Validar contraseña según el tipo
5. Retornar datos de sesión

## Seguridad

### Mejoras Implementadas:
1. **No almacenamiento de claves**: Las contraseñas no se guardan en el store
2. **Autenticación centralizada**: Lógica unificada en utilidades
3. **Validación mejorada**: Mejor manejo de errores y intentos fallidos
4. **Detección automática de tipo**: Distingue entre usuarios sincronizados y de prueba

### Recomendaciones para Producción:
1. **Implementar hashing**: Usar bcrypt o similar para contraseñas
2. **Tokens JWT**: Implementar autenticación basada en tokens
3. **Validación del servidor**: Verificar credenciales contra API
4. **Encriptación**: Encriptar datos sensibles en el store

## Compatibilidad

### Web (localStorage)
- Almacenamiento persistente en el navegador
- Sincronización con datos del servidor
- Compatible con `LoginWeb.js`

### Móvil (AsyncStorage)
- Almacenamiento nativo en React Native
- Persistencia entre sesiones
- Compatible con sincronización móvil

## Migración

### Para Usuarios Existentes:
1. Los datos existentes en SQLite se migran automáticamente al store
2. Se mantiene compatibilidad con datos sincronizados del servidor
3. No se pierden configuraciones existentes

### Para Desarrolladores:
1. Usar `authUtils.js` para nuevas funcionalidades de autenticación
2. Evitar almacenar claves en texto plano
3. Implementar validación del servidor para producción

## Próximos Pasos

1. **Implementar hashing de contraseñas**
2. **Agregar validación del servidor**
3. **Implementar tokens de sesión**
4. **Agregar logout automático**
5. **Implementar recuperación de contraseñas** 