# Plan de Migración Expo SDK 49 → 54

**Versión estable más reciente**: Expo SDK 54.0.30

## Estado Actual

### Versión Actual
- **Expo SDK**: 49.0.15
- **React**: 18.2.0
- **React Native**: 0.72.10

### Dependencias de Expo Críticas Identificadas
1. `expo-sqlite`: ~11.3.3 (crítico - usado en `database/database.js`)
2. `expo-file-system`: ~15.4.5 (usado en `GestionFrecuentes.js`, `Configurar.js`)
3. `expo-document-picker`: ~11.5.4 (usado en `GestionFrecuentes.js`, `Configurar.js`)
4. `expo-clipboard`: ~4.3.1 (usado en `Configurar.js`)
5. `@expo/vector-icons`: ^14.1.0 (usado en múltiples componentes)
6. `@expo/webpack-config`: ^19.0.0 (usado para build web)

### Dependencias React Native Críticas
1. `react-native-gesture-handler`: ~2.12.0
2. `react-native-reanimated`: ~3.3.0 (tiene plugin de Babel)
3. `react-native-safe-area-context`: 4.6.3
4. `react-native-screens`: ~3.22.0
5. `@react-navigation/native`: ^6.1.9
6. `@react-navigation/stack`: ^6.3.20

## Plan de Migración Gradual

### Paso 1: Migración SDK 49 → 50

#### Cambios Esperados:
- React Native: 0.72.10 → 0.73.2
- Posibles cambios en expo-sqlite API
- Cambios en webpack config

#### Problemas Potenciales:
1. **Iconos en web**: Pueden no mostrarse correctamente
2. **baseUrl en tsconfig.json**: Puede causar errores de importación
3. **expo-sqlite**: Verificar si hay cambios en la API (es crítico para la app)

#### Acciones:
1. Actualizar `expo` a `~50.0.0`
2. Ejecutar `npx expo install --fix` para actualizar dependencias compatibles
3. Verificar que `expo-sqlite` siga funcionando correctamente
4. Probar funcionalidades críticas:
   - Base de datos SQLite
   - Navegación
   - File system operations
   - Document picker
   - Clipboard

---

### Paso 2: Migración SDK 50 → 51

#### Cambios Esperados:
- React Native: 0.73.2 → 0.74.0
- Posibles cambios en Flipper integration

#### Problemas Potenciales:
1. **Flipper**: Errores inesperados aunque no se use
2. **Resolución de dependencias**: Posibles conflictos con npm
3. **react-native-reanimated**: Verificar compatibilidad

#### Acciones:
1. Actualizar `expo` a `~51.0.0`
2. Limpiar caché: `npm cache clean --force`
3. Reinstalar dependencias: `rm -rf node_modules package-lock.json && npm install`
4. Verificar todas las funcionalidades

---

### Paso 3: Migración SDK 51 → 52

#### Cambios Esperados:
- React Native: 0.74.0 → 0.75.0
- Cambios en gradle.properties (Android)
- Cambios en expo-splash-screen

#### Problemas Potenciales:
1. **Gradle/Android**: Cambios en configuración de Java
2. **expo-splash-screen**: Configuración requerida en app.json
3. **Breaking changes**: Revisar changelog completo

#### Acciones:
1. Actualizar `expo` a `~52.0.0`
2. Actualizar `app.json` con configuración de splash screen si es necesario
3. Revisar gradle.properties para Android
4. Pruebas exhaustivas en todas las plataformas

---

## Checklist de Pruebas por Paso

Después de cada migración, verificar:

### Funcionalidades Críticas:
- [ ] Inicio de sesión
- [ ] Navegación entre pantallas
- [ ] Base de datos SQLite (leer/escribir)
- [ ] Sincronización con servidor
- [ ] Gestión de preventas
- [ ] Gestión de clientes
- [ ] Gestión de artículos
- [ ] File system operations (exportar/importar)
- [ ] Document picker
- [ ] Clipboard

### Plataformas:
- [ ] Web (PWA)
- [ ] Android
- [ ] iOS (si aplica)

---

## Archivos a Revisar Específicamente

1. `database/database.js` - Uso de expo-sqlite
2. `views/Configurar.js` - FileSystem, DocumentPicker, Clipboard
3. `views/GestionFrecuentes.js` - FileSystem, DocumentPicker
4. `babel.config.js` - Plugin de reanimated
5. `app.json` - Configuración de Expo
6. `package.json` - Todas las dependencias

---

## Notas Importantes

- Hacer commit después de cada paso exitoso
- Si algo falla, revertir al paso anterior
- Probar en un dispositivo real, no solo en simulador
- Verificar logs de consola para warnings/errores
- Revisar changelog oficial de Expo para cada versión

