const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Configurar CORS para permitir acceso desde dispositivos móviles
app.use(cors({
  origin: true,
  credentials: true
}));

// Servir archivos estáticos desde web-build (aplicación construida)
app.use(express.static(path.join(__dirname, '../web-build')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Ruta principal - servir desde web-build
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../web-build/index.html'));
});

// Fallback para el manifest (usar el de web-build si existe, sino el de public)
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const webBuildManifest = path.join(__dirname, '../web-build/manifest.json');
  const publicManifest = path.join(__dirname, '../public/manifest.json');
  
  if (fs.existsSync(webBuildManifest)) {
    res.sendFile(webBuildManifest);
  } else {
    res.sendFile(publicManifest);
  }
});

// Fallback para el service worker
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  const webBuildSW = path.join(__dirname, '../web-build/sw.js');
  const publicSW = path.join(__dirname, '../public/sw.js');
  
  if (fs.existsSync(webBuildSW)) {
    res.sendFile(webBuildSW);
  } else {
    res.sendFile(publicSW);
  }
});

// Middleware para headers de PWA
app.use((req, res, next) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// Iniciar servidor HTTP
app.listen(PORT, () => {
  console.log(`🚀 Servidor HTTP iniciado en http://localhost:${PORT}`);
  console.log(`📱 Para testing en móvil, usa la IP de tu computadora:`);
  console.log(`   Ejemplo: http://192.168.1.100:${PORT}`);
});

// Función para obtener la IP local
function getLocalIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  
  return results;
}

// Mostrar IPs disponibles
setTimeout(() => {
  const ips = getLocalIP();
  console.log('\n🌐 IPs disponibles para testing móvil:');
  Object.keys(ips).forEach(interface => {
    ips[interface].forEach(ip => {
      console.log(`   ${interface}: http://${ip}:${PORT}`);
    });
  });
  console.log('\n📋 Instrucciones para testing:');
  console.log('1. Asegúrate de que tu teléfono esté en la misma red WiFi');
  console.log('2. Abre el navegador en tu teléfono');
  console.log('3. Ve a una de las URLs mostradas arriba');
  console.log('4. Para instalar como PWA, busca el botón "Instalar" o "Añadir a pantalla de inicio"');
}, 1000);

// Manejo de errores
process.on('uncaughtException', (err) => {
  console.error('❌ Error no capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
}); 