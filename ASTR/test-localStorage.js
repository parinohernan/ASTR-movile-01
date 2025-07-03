// Script de prueba para verificar localStorage
console.log('🧪 === PRUEBA DE LOCALSTORAGE ===');

// Verificar si estamos en un entorno web
if (typeof window !== 'undefined' && window.localStorage) {
  console.log('✅ localStorage disponible');
  
  // Verificar datos de usuarios
  const usuarios = localStorage.getItem('usuarios');
  console.log('📦 Datos de usuarios:', usuarios);
  
  if (usuarios) {
    try {
      const usuariosParsed = JSON.parse(usuarios);
      console.log('📋 Usuarios parseados:', usuariosParsed);
      console.log(`📊 Cantidad de usuarios: ${usuariosParsed.length}`);
      
      if (usuariosParsed.length > 0) {
        console.log('👤 Primer usuario:', usuariosParsed[0]);
      }
    } catch (error) {
      console.error('❌ Error al parsear usuarios:', error);
    }
  } else {
    console.log('⚠️ No hay datos de usuarios en localStorage');
  }
  
  // Verificar configuración
  const config = localStorage.getItem('configuracion');
  console.log('⚙️ Configuración:', config);
  
  // Verificar otros datos
  const clientes = localStorage.getItem('clientes');
  console.log('👥 Clientes:', clientes ? 'Disponible' : 'No disponible');
  
  const articulos = localStorage.getItem('articulos');
  console.log('📦 Artículos:', articulos ? 'Disponible' : 'No disponible');
  
} else {
  console.log('❌ localStorage no disponible (no es entorno web)');
}

console.log('🏁 === FIN DE PRUEBA ==='); 