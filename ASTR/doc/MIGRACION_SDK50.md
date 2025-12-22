# Migración Expo SDK 49 → 50

## Fecha: $(date)

## Cambios Realizados

### Dependencias Actualizadas

#### Expo Core
- `expo`: ~49.0.15 → ~50.0.0
- `react-native`: 0.72.10 → 0.73.6

#### Expo Packages
- `expo-sqlite`: ~11.3.3 → ~13.4.0 ⚠️ **MAJOR UPDATE - Verificar cambios de API**
- `expo-status-bar`: ~1.6.0 → ~1.11.1
- `expo-file-system`: ~15.4.5 → ~16.0.9 ⚠️ **MAJOR UPDATE**
- `expo-document-picker`: ~11.5.4 → ~11.10.1
- `expo-clipboard`: ~4.3.1 → ~5.0.1 ⚠️ **MAJOR UPDATE**

#### React Native Packages
- `@react-native-async-storage/async-storage`: 1.18.2 → 1.21.0
- `@react-native-community/netinfo`: 9.3.10 → 11.1.0 ⚠️ **MAJOR UPDATE**
- `react-native-gesture-handler`: ~2.12.0 → ~2.14.0
- `react-native-reanimated`: ~3.3.0 → ~3.6.2
- `react-native-safe-area-context`: 4.6.3 → 4.8.2
- `react-native-screens`: ~3.22.0 → ~3.29.0

#### Build Tools
- `@expo/webpack-config`: ^19.0.0 → ~19.0.1

## ⚠️ Áreas Críticas a Verificar

### 1. expo-sqlite (v11 → v13)
**Archivos afectados:**
- `database/database.js` - Uso de `SQLite.openDatabase()`
- `database/controllers/*.js` - Todas las operaciones de base de datos

**Verificar:**
- ✅ La API de `SQLite.openDatabase()` sigue siendo la misma
- ✅ Las transacciones (`db.transaction()`) funcionan correctamente
- ✅ `tx.executeSql()` mantiene la misma firma
- ✅ `result.rows.raw()` sigue funcionando

### 2. expo-clipboard (v4 → v5)
**Archivos afectados:**
- `views/Configurar.js` - Línea 460: `Clipboard.setStringAsync()`

**Verificar:**
- ✅ `Clipboard.setStringAsync()` sigue funcionando igual
- ✅ No hay cambios en la API

### 3. expo-file-system (v15 → v16)
**Archivos afectados:**
- `views/GestionFrecuentes.js`
- `views/Configurar.js`

**Verificar:**
- ✅ Todas las operaciones de FileSystem funcionan correctamente
- ✅ `FileSystem.documentDirectory` sigue disponible
- ✅ Lectura/escritura de archivos funciona

### 4. @react-native-community/netinfo (v9 → v11)
**Archivos afectados:**
- Cualquier archivo que use NetInfo

**Verificar:**
- ✅ La API de NetInfo sigue siendo compatible

## Checklist de Pruebas

### Funcionalidades Críticas
- [ ] Inicio de sesión
- [ ] Navegación entre pantallas
- [ ] Base de datos SQLite (crear, leer, actualizar, eliminar)
- [ ] Sincronización con servidor
- [ ] Gestión de preventas (crear, editar, enviar)
- [ ] Gestión de clientes
- [ ] Gestión de artículos
- [ ] Exportar/importar configuración (FileSystem)
- [ ] Seleccionar documentos (DocumentPicker)
- [ ] Copiar al portapapeles (Clipboard)

### Plataformas
- [ ] Web (PWA)
- [ ] Android
- [ ] iOS (si aplica)

## Problemas Conocidos de SDK 50

Según la documentación y issues reportados:

1. **Iconos en Web**: Algunos usuarios reportan que las fuentes de iconos no se cargan correctamente en web después de actualizar a SDK 50. Si esto ocurre, verificar la configuración de fuentes.

2. **baseUrl en tsconfig.json**: Si usas `compilerOptions.baseUrl`, puede causar problemas con ciertas librerías.

## Siguiente Paso

Una vez verificadas todas las funcionalidades en SDK 50, proceder a migrar a SDK 51.

