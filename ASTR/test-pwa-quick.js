const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración PWA...\n');

// Verificar archivos necesarios
const requiredFiles = [
  'public/manifest.json',
  'public/sw.js',
  'public/index.html',
  'webpack.config.js'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Existe`);
  } else {
    console.log(`❌ ${file} - No existe`);
    allFilesExist = false;
  }
});

// Verificar manifest.json
if (fs.existsSync('public/manifest.json')) {
  try {
    const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
    console.log('\n📋 Manifest.json verificado:');
    console.log(`   Nombre: ${manifest.name}`);
    console.log(`   Short name: ${manifest.short_name}`);
    console.log(`   Display: ${manifest.display}`);
    console.log(`   Iconos: ${manifest.icons.length} configurados`);
    
    // Verificar iconos
    const iconSizes = manifest.icons.map(icon => icon.sizes).join(', ');
    console.log(`   Tamaños de iconos: ${iconSizes}`);
    
    if (manifest.icons.some(icon => icon.sizes === '192x192') && 
        manifest.icons.some(icon => icon.sizes === '512x512')) {
      console.log('   ✅ Iconos requeridos (192x192, 512x512) presentes');
    } else {
      console.log('   ⚠️  Faltan iconos requeridos (192x192, 512x512)');
    }
  } catch (error) {
    console.log('❌ Error al parsear manifest.json:', error.message);
  }
}

// Verificar package.json scripts
if (fs.existsSync('package.json')) {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('\n📦 Scripts disponibles:');
    
    const pwaScripts = ['build:web', 'serve:pwa', 'test:pwa'];
    pwaScripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        console.log(`   ✅ npm run ${script}`);
      } else {
        console.log(`   ❌ npm run ${script} - No disponible`);
      }
    });
  } catch (error) {
    console.log('❌ Error al leer package.json:', error.message);
  }
}

// Verificar dependencias
console.log('\n📚 Dependencias PWA:');
const pwaDeps = ['express', 'cors', 'workbox-webpack-plugin'];
pwaDeps.forEach(dep => {
  try {
    require.resolve(dep);
    console.log(`   ✅ ${dep} - Instalada`);
  } catch (error) {
    console.log(`   ❌ ${dep} - No instalada`);
  }
});

console.log('\n🚀 Próximos pasos:');
console.log('1. Ejecuta: npm run build:web');
console.log('2. Ejecuta: npm run serve:pwa');
console.log('3. Abre http://localhost:3000 en tu navegador');
console.log('4. Para testing móvil, usa la IP mostrada por el servidor');

console.log('\n🔧 Para probar la sincronización:');
console.log('1. Ve a Configuración y establece el endpoint');
console.log('2. Ve a Sincronizar y ejecuta la sincronización');
console.log('3. Los usuarios sincronizados usan contraseña: 789');
console.log('4. Los usuarios de prueba usan: 001/123, 002/456, 003/789');

if (allFilesExist) {
  console.log('\n🎉 ¡Configuración PWA completa!');
} else {
  console.log('\n⚠️  Algunos archivos faltan. Revisa la configuración.');
} 