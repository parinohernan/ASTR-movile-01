// Archivo de prueba para verificar las funciones de artículos frecuentes
import { 
  agregarArticuloFrecuente, 
  obtenerArticulosFrecuentesOrdenados, 
  limpiarArticulosFrecuentes,
  esArticuloFrecuente 
} from './src/utils/storageUtils';

// Función de prueba
const testArticulosFrecuentes = async () => {
  console.log('=== PRUEBA DE ARTÍCULOS FRECUENTES ===');
  
  try {
    // Limpiar datos existentes
    console.log('1. Limpiando datos existentes...');
    await limpiarArticulosFrecuentes();
    
    // Agregar algunos artículos de prueba
    console.log('2. Agregando artículos de prueba...');
    const articulo1 = {
      id: 'ART001',
      descripcion: 'Artículo de prueba 1',
      precioCosto: 100,
      existencia: 50
    };
    
    const articulo2 = {
      id: 'ART002',
      descripcion: 'Artículo de prueba 2',
      precioCosto: 200,
      existencia: 30
    };
    
    await agregarArticuloFrecuente(articulo1);
    await agregarArticuloFrecuente(articulo2);
    await agregarArticuloFrecuente(articulo1); // Agregar el mismo artículo para aumentar frecuencia
    
    // Obtener artículos frecuentes
    console.log('3. Obteniendo artículos frecuentes...');
    const frecuentes = await obtenerArticulosFrecuentesOrdenados();
    console.log('Artículos frecuentes:', frecuentes);
    
    // Verificar si un artículo es frecuente
    console.log('4. Verificando si ART001 es frecuente...');
    const esFrecuente = await esArticuloFrecuente('ART001');
    console.log('¿ART001 es frecuente?', esFrecuente);
    
    console.log('=== PRUEBA COMPLETADA ===');
    
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
};

export default testArticulosFrecuentes; 