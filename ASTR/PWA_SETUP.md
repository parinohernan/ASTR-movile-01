# 🚀 Configuración PWA para ASTR

## ¿Qué es una PWA?

Una **Progressive Web App (PWA)** es una aplicación web que puede funcionar como una aplicación nativa en dispositivos móviles. Permite:
- ✅ Instalarse en la pantalla de inicio
- ✅ Funcionar offline
- ✅ Recibir notificaciones push
- ✅ Acceso rápido como una app nativa

## 📋 Archivos de PWA Configurados

### 1. **manifest.json** (`public/manifest.json`)
- Define la apariencia y comportamiento de la app
- Configura iconos, colores, nombre, etc.
- Permite que se instale en dispositivos

### 2. **Service Worker** (`public/sw.js`)
- Maneja el caché offline
- Intercepta peticiones de red
- Permite funcionar sin conexión

### 3. **HTML Principal** (`public/index.html`)
- Meta tags para PWA
- Registro del Service Worker
- Detección de instalación

### 4. **Webpack Config** (`webpack.config.js`)
- Genera Service Worker automáticamente
- Optimiza para PWA

## 🛠️ Instalación y Configuración

### Paso 1: Instalar dependencias
```bash
npm install
```

### Paso 2: Construir la aplicación web
```bash
npm run build:web
```

### Paso 3: Servir la PWA localmente
```bash
npm run serve:pwa
```

## 📱 Testing en Dispositivos Móviles

### Opción 1: Testing Local (Recomendado)

1. **Asegúrate de que tu teléfono esté en la misma red WiFi que tu computadora**

2. **Ejecuta el servidor de testing:**
   ```bash
   npm run test:pwa
   ```

3. **El script mostrará las IPs disponibles:**
   ```
   🌐 IPs disponibles para testing móvil:
      wlan0: http://192.168.1.100:3000
      eth0: http://192.168.1.101:3000
   ```

4. **En tu teléfono:**
   - Abre el navegador (Chrome, Safari, Firefox)
   - Ve a la URL mostrada (ej: `http://192.168.1.100:3000`)
   - La app debería cargar normalmente

### Opción 2: Testing con Expo

1. **Instala Expo Go en tu teléfono**
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Ejecuta:**
   ```bash
   npm start
   ```

3. **Escanea el código QR** que aparece en la terminal

### Opción 3: Testing con ngrok (Para testing remoto)

1. **Instala ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Ejecuta tu servidor:**
   ```bash
   npm run serve:pwa
   ```

3. **En otra terminal, ejecuta ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Usa la URL de ngrok** en tu teléfono (ej: `https://abc123.ngrok.io`)

## 🔧 Instalación como PWA

### En Android (Chrome):
1. Abre la app en Chrome
2. Toca el menú (⋮) → "Instalar aplicación"
3. Confirma la instalación
4. La app aparecerá en tu pantalla de inicio

### En iOS (Safari):
1. Abre la app en Safari
2. Toca el botón compartir (□↑)
3. Selecciona "Añadir a pantalla de inicio"
4. Confirma la instalación

### En Desktop (Chrome):
1. Abre la app en Chrome
2. Busca el icono de instalación en la barra de direcciones
3. Haz clic en "Instalar ASTR"

## 🧪 Verificar que la PWA funciona

### Herramientas de Desarrollo:

1. **Chrome DevTools:**
   - Abre DevTools (F12)
   - Ve a la pestaña "Application"
   - Verifica:
     - ✅ Manifest está cargado
     - ✅ Service Worker está registrado
     - ✅ Los iconos se cargan correctamente

2. **Lighthouse:**
   - En DevTools → Lighthouse
   - Ejecuta auditoría de PWA
   - Debería mostrar puntuación alta

### Verificaciones Manuales:

1. **Funcionamiento Offline:**
   - Instala la PWA
   - Desconecta internet
   - La app debería seguir funcionando

2. **Instalación:**
   - Debería aparecer el prompt de instalación
   - La app debería instalarse correctamente

3. **Iconos:**
   - El icono debería aparecer en la pantalla de inicio
   - Debería verse bien en diferentes tamaños

## 🐛 Solución de Problemas

### Problema: "No se puede instalar la PWA"
**Solución:**
- Verifica que el manifest.json esté en `/manifest.json`
- Asegúrate de que el Service Worker esté registrado
- Comprueba que tengas iconos de 192x192 y 512x512

### Problema: "La app no funciona offline"
**Solución:**
- Verifica que el Service Worker esté cacheando correctamente
- Revisa la consola para errores del Service Worker
- Asegúrate de que los recursos estén incluidos en el caché

### Problema: "No puedo acceder desde mi teléfono"
**Solución:**
- Verifica que ambos dispositivos estén en la misma red
- Comprueba que el firewall no esté bloqueando el puerto
- Intenta usar ngrok para testing remoto

### Problema: "Los iconos no se ven"
**Solución:**
- Verifica que las rutas de los iconos sean correctas
- Asegúrate de que los archivos de iconos existan
- Comprueba que los tamaños estén especificados correctamente

### Problema: "No puedo hacer login después de sincronizar"
**Solución:**
- **Usuarios sincronizados del servidor**: Usan contraseña `789`
- **Usuarios de prueba**: 
  - 001 → contraseña: `123`
  - 002 → contraseña: `456` 
  - 003 → contraseña: `789`
- **Acceso root**: usuario `root`, contraseña `root`

### Problema: "Los vendedores no aparecen en el listado"
**Solución:**
1. Verifica que la sincronización se completó exitosamente
2. Revisa la consola del navegador para errores
3. Ejecuta la sincronización nuevamente
4. Verifica que el endpoint esté configurado correctamente

## 📊 Métricas de PWA

Para verificar que tu PWA cumple con los estándares:

1. **Lighthouse Score:** Debería ser > 90
2. **Tiempo de carga:** < 3 segundos
3. **Funcionamiento offline:** Sí
4. **Instalable:** Sí
5. **Responsive:** Sí

## 🔄 Actualizaciones

Para actualizar la PWA:

1. **Cambia la versión en el manifest.json**
2. **Actualiza el Service Worker** (cambia CACHE_NAME)
3. **Reconstruye la app:**
   ```bash
   npm run build:web
   ```
4. **Los usuarios recibirán la actualización automáticamente**

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador
2. Verifica los logs del Service Worker
3. Usa las herramientas de desarrollo de Chrome
4. Consulta la documentación de PWA de Google

---

¡Tu PWA está lista para ser testeada! 🎉 