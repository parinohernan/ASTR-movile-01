import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import { guardarPreventaEnStorage, obtenerPreventaDeStorage, eliminarItemEnPreventaEnStorage, limpiarPreventaDeStorage} from "../utils/storageUtils";
import { useNavigation } from '@react-navigation/native';
// import { Keyboard } from 'react-native-keyboard-aware-scroll-view';

const cantidadYDescuentoCargados= async (codigo) => {  
  const preventaActual = await obtenerPreventaDeStorage();
  for (let i = 0; i < preventaActual?.length; i++) {
    if (preventaActual[i].id === codigo) {
      console.log("encontre ",preventaActual[i]);
      return {cantidad: preventaActual[i].seleccionados,
              descuento: preventaActual[i].descuento
      }
    }
  }
  return 0;
}
const cantidadCargado= async (codigo) =>{  //articulo.id
  // console.log("la cantidad en la preventa ::", codigo);
  const preventaActual = await obtenerPreventaDeStorage();
  // console.log("preventa actual",preventaActual);
  for (let i = 0; i < preventaActual?.length; i++) {
    if (preventaActual[i].id == codigo) {
      // console.log("EEEEEEEEste ya esta ",codigo, " cantidad: ",preventaActual[i].cantidad);
      return preventaActual[i].cantidad;
    }
    
  }
  // console.log("NO estaba cargado el codigo ",codigo, " cantidad: ",0);
  return 0;
}

const descuentoCargado= async (codigo) => {  
  // console.log("la cantidad en la preventa ::", codigo);
  const preventaActual = await obtenerPreventaDeStorage();
  // console.log("preventa actual",preventaActual);
  for (let i = 0; i < preventaActual?.length; i++) {
    if (preventaActual[i].id == codigo) {
      
      return preventaActual[i].descuento;
    }
    
  }
  return 0;
}

const AddArticulo = ({route}) => {
  const {params} = route;
  const {articulo, preventaNumero, cliente, cantItems} = params;
  console.log("paarametros",params);
  const [cantidad, setCantidad] = useState(articulo.seleccionados? articulo.seleccionados : 0 );
  const [descuento, setDescuento] = useState(articulo.descuento? articulo.descuento : 0);
  const calcularTotal = ()=>{
    let porcentage = descuento==0? 1 : (1+(100/descuento));
    console.log("calculando Todtal: ", articulo.precio, porcentage, cantidad);
    return (articulo.precio * porcentage * cantidad)
  };
  const [precioTotal, setPrecioTotal] = useState( 0 );
  const [precioUnitario, setPrecioUnitario] = useState (articulo.precio);
  const [verAgregar, setVerAgregar] = useState (false);
  const navigation = useNavigation();
  const cantidadInputRef = useRef(null);

  const articuloConDetalles = {
    ...articulo,
    cantidad: parseInt(cantidad),
    descuento: parseInt(descuento),
    precioTotal: parseFloat(precioTotal),
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
    // console.log("agregarItemPreventaStorage", articuloConDetalles);
    const preventa = await obtenerPreventaDeStorage();
    preventa.push(articuloConDetalles);
    guardarPreventaEnStorage(preventa);
    navigation.goBack();
  }
  
  const eliminar1PreventaStorage = async () =>{
    // eliminar item de la preventa de sorage actual
     console.log("elimina solo uno",articuloConDetalles);
     await eliminarItemEnPreventaEnStorage(articuloConDetalles.id);
     navigation.navigate('Preventa',{preventaNumero: preventaNumero, cliente : cliente});
     return
  }

  const handleSave = async () => {
    await handleEnd();
    const yaEsta = await estaCargado(articulo.id);
    if ((cantidad == 0) && (cantItems == 1)) {
      await vaciarPreventaStorage();
      return;
    } 
    if (yaEsta && (cantidad == 0)) {
      await eliminar1PreventaStorage();
      return;
    } 
    if (yaEsta && cantidad > 0) {
      console.log("toi aca");
      await modificarItemPreventaStorage();
      return;
    } 
    if (cantidad == 0) {
      navigation.goBack();
      return;
    }
    await agregarItemPreventaStorage();
    return;
  };

  const handleCantidad = (text) => {
    setCantidad(text.replace(/[^0-9]/g, ''))
  }

  const handleFocusCant = (text) => {
    setCantidad("");
    setVerAgregar(false);
  }
  const handleFocusDescuento = (text) => {
    setDescuento("");
    setVerAgregar(false);
  }

  const handleDescuento = (text) => {
    setDescuento(text.replace(/[^0-9]/g, ''));
    
  };
  
  const handleEnd = async() => {
    let cuenta = 0;
    if (cantidad == 0) {
      setCantidad(0)
    }
    cuenta = (precioUnitario.toFixed(2)) * (cantidad); 
    cuenta = cuenta - (cuenta * (descuento / 100)) 
    setPrecioTotal(cuenta);
    setVerAgregar(true);
  };

  const handleCancel = () => {
    navigation.goBack();
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
    await eliminarItemEnPreventaEnStorage (articulo.id);
    await agregarItemPreventaStorage();
  }


  return (
    <View style={styles.container}>
      <Text style={styles.articuloInfo}>Codigo {articulo ? articulo.id : ''}</Text>
      <Text style={styles.articuloInfo}>{articulo ? articulo.descripcion : ''}</Text>
      <Text style={styles.articuloInfo}> $ {articulo ? precioUnitario.toFixed(2) : ''}</Text>
      <Text style={styles.label}>Cantidad:</Text>
      
      <TextInput
        ref={cantidadInputRef}
        style={styles.input}
        onFocus={handleFocusCant}
        onChangeText={handleCantidad}
        onEndEditing={handleEnd}
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
        value={String(descuento)}
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
          <Text style={styles.saveButtonText}>Agregar</Text>
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
