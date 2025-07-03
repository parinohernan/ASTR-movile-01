import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { guardarPreventaEnStorage, obtenerPreventaDeStorage, eliminarItemEnPreventaEnStorage, limpiarPreventaDeStorage } from "../utils/storageUtils";
import { configuracionCantidadMaximaArticulos } from "../utils/storageConfigData";
import { useNavigation } from '@react-navigation/native';
// import { Keyboard } from 'react-native-keyboard-aware-scroll-view';

const cantidadYDescuentoCargados= async (codigo) => {  
  const preventaActual = await obtenerPreventaDeStorage();
  let cantidadTotal = 0;
  let descuentos = [];
  
  for (let i = 0; i < preventaActual?.length; i++) {
    if (preventaActual[i].id === codigo) {
      console.log("encontre ",preventaActual[i]);
      // Sumar cantidad
      cantidadTotal += parseFloat(preventaActual[i].cantidad || 0);
      
      // Recolectar descuentos
      const descuento = preventaActual[i].descuento;
      if (descuento !== null && descuento !== undefined) {
        descuentos.push(parseFloat(descuento));
      }
    }
  }
  
  // Calcular descuento promedio
  let descuentoPromedio = 0;
  if (descuentos.length > 0) {
    descuentoPromedio = descuentos.reduce((sum, desc) => sum + desc, 0) / descuentos.length;
    descuentoPromedio = Math.round(descuentoPromedio * 100) / 100; // Redondear a 2 decimales
  }
  
  return {
    cantidad: cantidadTotal,
    descuento: descuentoPromedio
  };
}
const cantidadCargado= async (codigo) =>{  //articulo.id
  // console.log("la cantidad en la preventa ::", codigo);
  const preventaActual = await obtenerPreventaDeStorage();
  // console.log("preventa actual",preventaActual);
  let cantidadTotal = 0;
  
  for (let i = 0; i < preventaActual?.length; i++) {
    if (preventaActual[i].id == codigo) {
      // Sumar todas las cantidades del mismo artículo
      cantidadTotal += parseFloat(preventaActual[i].cantidad || 0);
    }
  }
  
  // console.log("cantidad total para codigo ",codigo, " cantidad: ",cantidadTotal);
  return cantidadTotal;
}

const descuentoCargado= async (codigo) => {  
  // console.log("la cantidad en la preventa ::", codigo);
  const preventaActual = await obtenerPreventaDeStorage();
  // console.log("preventa actual",preventaActual);
  let descuentos = [];
  
  for (let i = 0; i < preventaActual?.length; i++) {
    if (preventaActual[i].id == codigo) {
      // Asegurar que el descuento sea un número válido
      const descuento = preventaActual[i].descuento;
      if (descuento !== null && descuento !== undefined) {
        descuentos.push(parseFloat(descuento));
      }
    }
  }
  
  // Si hay múltiples líneas, calcular el descuento promedio
  if (descuentos.length > 0) {
    const descuentoPromedio = descuentos.reduce((sum, desc) => sum + desc, 0) / descuentos.length;
    return Math.round(descuentoPromedio * 100) / 100; // Redondear a 2 decimales
  }
  
  return 0;
}

const AddArticulo = ({route, navigationOverride}) => {
  const {params} = route;
  const {articulo, preventaNumero, cliente, cantItems} = params;
  console.log("paarametros",params);
  const [cantidad, setCantidad] = useState(articulo.seleccionados? articulo.seleccionados : 0 );
  const [descuento, setDescuento] = useState(articulo.descuento !== null && articulo.descuento !== undefined ? articulo.descuento : 0);
  const calcularTotal = ()=>{
    let porcentage = descuento==0? 1 : (1+(100/descuento));
    console.log("calculando Todtal: ", articulo.precio, porcentage, cantidad);
    return (articulo.precio * porcentage * cantidad)
  };
  const [precioTotal, setPrecioTotal] = useState( 0 );
  // Preservar el precioLista original si existe
  const [precioUnitario, setPrecioUnitario] = useState (articulo.precioLista || articulo.precio);
  const [verAgregar, setVerAgregar] = useState (false);
  const [articuloYaCargado, setArticuloYaCargado] = useState(false);
  const [modificarLinea, setModificarLinea] = useState(true); // Por defecto modificar
  const [esEdicion, setEsEdicion] = useState(articulo.editandoItem || false);
  const [uniqueIdOriginal, setUniqueIdOriginal] = useState(articulo.uniqueIdOriginal || null);
  const navigation = useNavigation();
  const cantidadInputRef = useRef(null);

  // Calcular precio total automáticamente cuando cambien cantidad o descuento
  useEffect(() => {
    const calcularPrecioTotal = () => {
      let cuenta = 0;
      const cantidadValida = parseFloat(cantidad) || 0;
      const descuentoValido = parseFloat(descuento) || 0;
      
      cuenta = (precioUnitario.toFixed(2)) * cantidadValida; 
      cuenta = cuenta - (cuenta * (descuentoValido / 100));
      setPrecioTotal(cuenta);
      
      // Habilitar el botón agregar si hay cantidad
      setVerAgregar(cantidadValida > 0);
    };
    
    calcularPrecioTotal();
  }, [cantidad, descuento, precioUnitario]);

  useEffect(() => {
    const validarLimite = async () => {
      const cantidadMaxima = await configuracionCantidadMaximaArticulos();
      const carrito = await obtenerPreventaDeStorage();
      if (carrito.length >= cantidadMaxima) {
        Alert.alert(
          "Límite alcanzado",
          `Se ha superado la cantidad máxima de ${cantidadMaxima} artículos permitidos.`,
          [
            {
              text: "Aceptar",
              onPress: () => {
                if (navigationOverride) {
                  navigationOverride();
                } else {
                  navigation.goBack();
                }
              },
              style: "cancel"
            }
          ]
        );
      }
    };
    validarLimite();
  }, []);

  useEffect(() => {
    const verificarSiEstaCargado = async () => {
      const estaCargadoResult = await estaCargado(articulo.id);
      setArticuloYaCargado(estaCargadoResult);
    };
    verificarSiEstaCargado();
  }, [articulo.id]);

  const articuloConDetalles = {
    ...articulo,
    cantidad: parseFloat(cantidad),
    descuento: parseInt(descuento || 0),
    precioTotal: parseFloat(precioTotal),
    // Preservar el precioLista original si existe
    precioLista: articulo.precioLista || precioUnitario,
    uniqueId: Date.now().toString() + Math.random().toString(36).substr(2, 9), // ID único para permitir productos repetidos
  };

  const estaCargado= async (codigo) =>{  //articulo.id
    const preventaActual = await obtenerPreventaDeStorage();
    for (let i = 0; i < preventaActual.length; i++) {
      const e = preventaActual[i];
      if (e.id == codigo) {
        console.log("ya estaba cargado el codigo ",codigo);
        return true;
      }
    }
    console.log("NO estaba cargado el codigo ",codigo);
    return false;
  }

  const agregarItemPreventaStorage = async() => {
    console.log("agregarItemPreventaStorage", articuloConDetalles);
    const preventa = await obtenerPreventaDeStorage();
    preventa.push(articuloConDetalles);
    guardarPreventaEnStorage(preventa);
    if (navigationOverride) {
      navigationOverride(articuloConDetalles);
    } else {
    navigation.goBack();
    }
  }
  
  const eliminar1PreventaStorage = async () =>{
     console.log("elimina solo uno",articuloConDetalles);
    await eliminarItemEnPreventaEnStorage(articuloConDetalles.uniqueId);
    if (navigationOverride) {
      navigationOverride();
    } else {
      navigation.navigate('Preventa',{preventaNumero: preventaNumero, cliente: cliente});
    }
     return
  }

  const handleSave = async () => {
    await handleEnd();
    
    if ((cantidad == 0) && (cantItems == 1)) {
      await vaciarPreventaStorage();
      return;
    } 
    if (cantidad == 0) {
      if (navigationOverride) {
        navigationOverride();
      } else {
      navigation.goBack();
      }
      return;
    }

    // Si el artículo ya está cargado y el usuario quiere modificar la línea existente
    if (articuloYaCargado && modificarLinea) {
      await modificarItemPreventaStorage();
    } else {
      // Si no está cargado o el usuario quiere agregar nueva línea
    await agregarItemPreventaStorage();
    }
    return;
  };

  // const handleCantidad = (text) => {
  //   // setCantidad(text.replace(/[^0-9]/g, ''))
  //   setCantidad(text);
  //   console.log("cantidad .. ",cantidad, text);
  // }
  const handleCantidad = (text) => {
    // Permite solo números y un solo punto decimal
    const newText = text.replace(/[^0-9.]/g, '');

    // Asegura que solo haya un punto decimal
    if (newText.split('.').length > 2) {
      setCantidad(newText.slice(0, -1)); // Elimina el último carácter si hay más de un punto
    } else {
      setCantidad(newText);
    }
  };

  const formatCantidad = (text) => {
    if (text === '') return '';
    
    // Agrega .00 si el número es un entero
    if (!text.includes('.')) {
      return `${text}.00`;
    }
    
    // Asegura dos dígitos después del punto decimal
    const parts = text.split('.');
    if (parts[1].length === 1) {
      return `${parts[0]}.${parts[1]}0`;
    }

    return text;
  };

  const handleFocusCant = (text) => {
    setCantidad("");
    setVerAgregar(false);
  }
  const handleFocusDescuento = (text) => {
    setDescuento("");
    setVerAgregar(false);
  }

  const handleDescuento = (text) => {
    // Limpiar el texto y permitir solo números
    const cleanText = text.replace(/[^0-9]/g, '');
    
    // Si el texto está vacío, establecer 0
    if (cleanText === '') {
      setDescuento(0);
    } else {
      setDescuento(cleanText);
    }
  };
  
  const handleEnd = async() => {
    // El cálculo del precio total ahora se hace automáticamente en el useEffect
    // Solo necesitamos asegurar que la cantidad sea válida
    if (cantidad == 0) {
      setCantidad(0)
    }
  };

  const handleCancel = () => {
    // Si es una edición, simplemente regresar sin hacer cambios
    // El item original se mantiene intacto
    console.log("Cancelando edición - item original se mantiene");
    
    if (navigationOverride) {
      navigationOverride();
    } else {
      navigation.goBack();
    }
  };
//   const eliminar1PreventaStorage = async () =>{
//     // eliminar item de la preventa de sorage actual
//      console.log("elimina solo uno",articuloConDetalles.id);
//      await eliminarItemEnPreventaEnStorage(articuloConDetalles.id);
//      navigation.navigate('Preventa',{preventaNumero: preventaNumero, cliente : cliente});
//      return
//  }

  const modificarItemPreventaStorage = async () => {
    console.log("modificarItemPreventaStorage");
    
    // Si es una edición (viene de EditPreventa), eliminar el item original
    if (esEdicion && uniqueIdOriginal) {
      await eliminarItemEnPreventaEnStorage(uniqueIdOriginal);
    } else {
      // Buscar el artículo existente en la preventa y eliminarlo
      const preventa = await obtenerPreventaDeStorage();
      const articuloExistente = preventa.find(item => item.id === articulo.id);
      
      if (articuloExistente) {
        // Eliminar el artículo existente usando su uniqueId
        await eliminarItemEnPreventaEnStorage(articuloExistente.uniqueId);
      }
    }
    
    // Agregar el artículo modificado
    await agregarItemPreventaStorage();
  }

  const vaciarPreventaStorage = async () => {
    console.log("vaciarPreventaStorage");
    await limpiarPreventaDeStorage();
    navigation.navigate('Preventa',{preventaNumero: preventaNumero, cliente: cliente});
    return;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.articuloInfo}>Codigo {articulo ? articulo.id : ''}</Text>
      <Text style={styles.articuloInfo}>{articulo ? articulo.descripcion : ''}</Text>
      <Text style={styles.articuloInfo}> $ {articulo ? precioUnitario.toFixed(2) : ''}</Text>
      
      {/* Switch para elegir entre modificar o agregar nueva línea */}
      {articuloYaCargado && (
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Modificar línea existente</Text>
          <Switch
            value={modificarLinea}
            onValueChange={setModificarLinea}
            trackColor={{ false: '#767577', true: '#AA21E6' }}
            thumbColor={modificarLinea ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
      )}

      <Text style={styles.label}>Cantidad:</Text>
      
      <TextInput
        ref={cantidadInputRef}
        style={styles.input}
        onFocus={handleFocusCant}
        onChangeText={handleCantidad}
        onEndEditing={handleEnd}
        onBlur={() => setCantidad(formatCantidad(cantidad))}
        value={String(cantidad)}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Descuento:</Text>
      <TextInput
        style={styles.input}
        editable={true}
        onFocus={handleFocusDescuento}
        onChangeText={handleDescuento}
        onEndEditing={handleEnd}
        value={String(descuento || 0)}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Precio total:</Text>
      <TextInput
        style={styles.input}
        editable={false}
        value={"$ " +String(precioTotal.toFixed(2))}
      />

      <TouchableOpacity
        style={[styles.saveButton, !verAgregar && styles.disabledButton]}
        onPress={handleSave}
        disabled={!verAgregar}>
          <Text style={styles.saveButtonText}>
            {esEdicion ? 'Actualizar' : (articuloYaCargado && modificarLinea ? 'Modificar' : 'Agregar')}
          </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>

    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    padding: 20,
    backgroundColor: '#06181e',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a2a2e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  switchLabel: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#AA21E6',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
  },
  disabledButton: {
    opacity: 0.5,
  },
  articuloInfo: {
    color: 'white',
    fontSize: 18,
    marginBottom: 0,
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    backgroundColor: 'white',
    padding: 6,
    borderRadius: 5,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#FF4500',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export {cantidadYDescuentoCargados, descuentoCargado, cantidadCargado, AddArticulo};
