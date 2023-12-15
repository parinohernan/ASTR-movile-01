import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { guardarPreventa, obtenerPreventa} from "../utils/storageUtils";
import { useNavigation } from '@react-navigation/native';

const AddArticulo = ({route}) => {
  const {params} = route;
  const articulo = params.articulo;
  const [cantidad, setCantidad] = useState(0);
  // const [descuento, setDescuento] = useState(0);
  const [precioFinal, setPrecioFinal] = useState(0); //useState(articulo.precioCostoMasImp.toFixed(2))
  const navigation = useNavigation();
  const articuloConDetalles = {
    ...articulo,
    cantidad: parseInt(cantidad),
    // descuento: parseFloat(descuento),
    precioFinal: parseFloat(precioFinal),
  };

  const estaCargado= (codigo) =>{
    const preventaActual = obtenerPreventa();
    for (let i = 0; i < preventaActual.length; i++) {
      const e = preventaActual[i];
      if (e.id == articulo.id) {
        setCantidad(e.cantidad);
        setPrecioFinal(e.precioFinal);
        console.log("ya estaba cargado");
        return true;
      }
    }
    return false
  }

  console.log("addArt19. ",articuloConDetalles);
  
  const handleSave = async () => {
    // ... lógica para guardar el artículo en la preventa
    // Obtener la preventa actualizada después de guardar el artículo
    const preventaActual = await obtenerPreventa();
    for (let i = 0; i < preventaActual.length; i++) {
      const e = preventaActual[i];
      if (e.id == articulo.id) { //actualiza un articulo ya existente
        preventaActual[i].cantidad=cantidad;
        preventaActual[i].precioFinal=precioFinal;
        console.log("gravo la preventa con el articulo modificado ",precioFinal);
        guardarPreventa(preventaActual);
        navigation.goBack();
        return;
      } 
    }// Actualizar la preventa con el nuevo artículo
    const nuevaPreventa = [...preventaActual, articuloConDetalles];
    console.log("Add50. nueva prev", nuevaPreventa);
    guardarPreventa(nuevaPreventa);
    navigation.goBack();
    return
  };
  
  const handleCantidad = (text) => {
    const cuenta = (articulo.precioCostoMasImp.toFixed(2)) * text;
    console.log("Add37. preciofinal ..antes ",(articulo.precioCostoMasImp.toFixed(2)), "x ",text," = ",cuenta);
    setCantidad(text.replace(/[^0-9]/g, ''))
    setPrecioFinal(cuenta)
  }

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.articuloInfo}>Codigo {articulo ? articulo.id : ''}</Text>
      <Text style={styles.articuloInfo}>{articulo ? articulo.descripcion : ''}</Text>
      <Text style={styles.articuloInfo}> $ {articulo ? articulo.precioCostoMasImp.toFixed(2) : ''}</Text>
      <Text style={styles.label}>Cantidad:</Text>
      
      <TextInput
        style={styles.input}
        onChangeText={handleCantidad}
        value={String(cantidad)}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Precio total:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => setPrecioFinal(text.replace(/[^0-9.]/g, ''))}
        value={String(precioFinal)}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
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
        padding: 20,
        backgroundColor: '#FAF7E6',
    },
    articuloInfo: {
        marginBottom: 10,
    },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  saveButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'gray',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddArticulo;
