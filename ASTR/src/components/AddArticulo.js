import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import { guardarPreventaEnStorage, obtenerPreventaDeStorage, eliminarItemEnPreventaEnStorage, limpiarPreventaDeStorage} from "../utils/storageUtils";
import { useNavigation } from '@react-navigation/native';
import { Keyboard } from 'react-native-keyboard-aware-scroll-view';

const cantidadCargados= async (codigo) => {  
  const preventaActual = await obtenerPreventaDeStorage();
  for (let i = 0; i < preventaActual?.length; i++) {
    if (preventaActual[i].id === codigo) {
      return preventaActual[i].cantidad;
    }
  }
  return 0;
}

const AddArticulo = ({route}) => {
  const {params} = route;
  const {articulo, preventaNumero, cliente, cantItems} = params;

  const [cantidad, setCantidad] = useState(articulo.seleccionados? articulo.seleccionados : 0 );
  const [descuento, setDescuento] = useState(0);
  const [precioTotal, setPrecioTotal] = useState( articulo.precio );
  const [precioUnitario, setPrecioUnitario] = useState (articulo.precio);
  const [verAgregar, setVerAgregar] = useState (false);
  const navigation = useNavigation();
  const cantidadInputRef = useRef(null);

  // useEffect(() => {
  //   // Enfoque y muestra el teclado en la entrada de cantidad cuando el componente se monta
  //   cantidadInputRef.current?.focus();
  //   const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
  //   const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', _keyboardDidHide);
  
  //   return () => {
  //     keyboardDidShowListener.remove();
  //     keyboardDidHideListener.remove();
  //   };
  // }, []);

  // const _keyboardDidShow = () => {
  //   console.log("Teclado mostrado");
  // };

  // const _keyboardDidHide = () => {
  //   console.log("Teclado ocultado");
  // };
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
    console.log("agregarItemPreventaStorage", articuloConDetalles);
    const preventa = await obtenerPreventaDeStorage();
    preventa.push(articuloConDetalles);
    guardarPreventaEnStorage(preventa);
    navigation.goBack();
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
        editable={false}
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
    marginBottom: 10,
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
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

export {cantidadCargados, AddArticulo};
