// Archivo de prueba para verificar las funciones de artículos frecuentes por cliente
import { 
  agregarArticuloFrecuente, 
  obtenerArticulosFrecuentesCombinados,
  obtenerArticulosFrecuentesClienteOrdenados,
  obtenerArticulosFrecuentesGlobalesOrdenados,
  limpiarArticulosFrecuentesCliente,
  limpiarArticulosFrecuentesGlobales,
  obtenerClientesConFrecuentes
} from './src/utils/storageUtils';

// Función de prueba
const testArticulosFrecuentesPorCliente = async () => {
  console.log('=== PRUEBA DE ARTÍCULOS FRECUENTES POR CLIENTE ===');
  
  try {
    // Limpiar datos existentes
    console.log('1. Limpiando datos existentes...');
    await limpiarArticulosFrecuentesGlobales();
    await limpiarArticulosFrecuentesCliente('CLI001');
    await limpiarArticulosFrecuentesCliente('CLI002');
    
    // Agregar algunos artículos de prueba para diferentes clientes
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
    
    const articulo3 = {
      id: 'ART003',
      descripcion: 'Artículo de prueba 3',
      precioCosto: 150,
      existencia: 25
    };
    
    // Agregar artículos para cliente 1
    console.log('3. Agregando artículos para cliente CLI001...');
    await agregarArticuloFrecuente('CLI001', articulo1);
    await agregarArticuloFrecuente('CLI001', articulo2);
    await agregarArticuloFrecuente('CLI001', articulo1); // Duplicado para aumentar frecuencia
    
    // Agregar artículos para cliente 2
    console.log('4. Agregando artículos para cliente CLI002...');
    await agregarArticuloFrecuente('CLI002', articulo2);
    await agregarArticuloFrecuente('CLI002', articulo3);
    await agregarArticuloFrecuente('CLI002', articulo2); // Duplicado para aumentar frecuencia
    
    // Obtener frecuentes del cliente 1
    console.log('5. Obteniendo frecuentes del cliente CLI001...');
    const frecuentesCliente1 = await obtenerArticulosFrecuentesClienteOrdenados('CLI001');
    console.log('Frecuentes cliente CLI001:', frecuentesCliente1);
    
    // Obtener frecuentes del cliente 2
    console.log('6. Obteniendo frecuentes del cliente CLI002...');
    const frecuentesCliente2 = await obtenerArticulosFrecuentesClienteOrdenados('CLI002');
    console.log('Frecuentes cliente CLI002:', frecuentesCliente2);
    
    // Obtener frecuentes globales
    console.log('7. Obteniendo frecuentes globales...');
    const frecuentesGlobales = await obtenerArticulosFrecuentesGlobalesOrdenados();
    console.log('Frecuentes globales:', frecuentesGlobales);
    
    // Obtener frecuentes combinados para cliente 1
    console.log('8. Obteniendo frecuentes combinados para CLI001...');
    const frecuentesCombinados1 = await obtenerArticulosFrecuentesCombinados('CLI001');
    console.log('Frecuentes combinados CLI001:', frecuentesCombinados1);
    
    // Obtener lista de clientes con frecuentes
    console.log('9. Obteniendo lista de clientes con frecuentes...');
    const clientesConFrecuentes = await obtenerClientesConFrecuentes();
    console.log('Clientes con frecuentes:', clientesConFrecuentes);
    
    console.log('=== PRUEBA COMPLETADA ===');
    
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
};

export default testArticulosFrecuentesPorCliente; 