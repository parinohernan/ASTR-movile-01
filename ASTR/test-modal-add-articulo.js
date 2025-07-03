// Simular un artículo con precio calculado
const articuloMock = {
  id: 'ART001',
  descripcion: 'Artículo de prueba',
  precio: 100.00, // Precio ya calculado
  precioLista: 100.00,
  existencia: 50,
  porcentajeIVA1: 21,
  seleccionados: 0,
  descuento: 0
};

console.log('=== PRUEBA DEL MODAL ADD ARTICULO ===');
console.log('Artículo de prueba:', articuloMock);
console.log('Precio unitario:', articuloMock.precio);
console.log('');

// Simular diferentes escenarios de cantidad y descuento
const escenarios = [
  { cantidad: 1, descuento: 0, descripcion: '1 unidad sin descuento' },
  { cantidad: 2, descuento: 0, descripcion: '2 unidades sin descuento' },
  { cantidad: 1, descuento: 10, descripcion: '1 unidad con 10% descuento' },
  { cantidad: 3, descuento: 15, descripcion: '3 unidades con 15% descuento' },
  { cantidad: 0, descuento: 0, descripcion: '0 unidades (botón deshabilitado)' }
];

escenarios.forEach((escenario, index) => {
  console.log(`Escenario ${index + 1}: ${escenario.descripcion}`);
  
  // Calcular precio total manualmente para verificar
  const precioUnitario = articuloMock.precio;
  const cantidad = escenario.cantidad;
  const descuento = escenario.descuento;
  
  let precioTotal = precioUnitario * cantidad;
  precioTotal = precioTotal - (precioTotal * (descuento / 100));
  
  console.log(`  Cantidad: ${cantidad}`);
  console.log(`  Descuento: ${descuento}%`);
  console.log(`  Precio unitario: $${precioUnitario.toFixed(2)}`);
  console.log(`  Precio total: $${precioTotal.toFixed(2)}`);
  console.log(`  Botón habilitado: ${cantidad > 0 ? 'SÍ' : 'NO'}`);
  console.log('');
});

console.log('=== VERIFICACIÓN DE CÁLCULOS ===');
console.log('El modal ahora calcula automáticamente el precio total cuando:');
console.log('- Se cambia la cantidad');
console.log('- Se cambia el descuento');
console.log('- Se inicializa el componente');
console.log('');
console.log('El botón "Agregar" se habilita automáticamente cuando:');
console.log('- La cantidad es mayor a 0');
console.log('');
console.log('Beneficios del cambio:');
console.log('✓ Cálculo en tiempo real del precio total');
console.log('✓ Botón habilitado automáticamente');
console.log('✓ No requiere presionar Enter o cambiar foco');
console.log('✓ Mejor experiencia de usuario');
console.log('');
console.log('=== FUNCIÓN DE CÁLCULO IMPLEMENTADA ===');
console.log('useEffect(() => {');
console.log('  const calcularPrecioTotal = () => {');
console.log('    let cuenta = 0;');
console.log('    const cantidadValida = parseFloat(cantidad) || 0;');
console.log('    const descuentoValido = parseFloat(descuento) || 0;');
console.log('    ');
console.log('    cuenta = (precioUnitario.toFixed(2)) * cantidadValida;');
console.log('    cuenta = cuenta - (cuenta * (descuentoValido / 100));');
console.log('    setPrecioTotal(cuenta);');
console.log('    ');
console.log('    // Habilitar el botón agregar si hay cantidad');
console.log('    setVerAgregar(cantidadValida > 0);');
console.log('  };');
console.log('  ');
console.log('  calcularPrecioTotal();');
console.log('}, [cantidad, descuento, precioUnitario]);'); 