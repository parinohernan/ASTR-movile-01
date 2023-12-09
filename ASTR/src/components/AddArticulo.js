import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { guardarPreventa, obtenerPreventa} from "../utils/storageUtils";
import { useNavigation } from '@react-navigation/native';

const AddArticulo = ({route}) => {
  const {params} = route;
  const articulo = params.articulo;
  console.log("addArt9. ",articulo);
  const [cantidad, setCantidad] = useState(articulo.cantidad);
  const [descuento, setDescuento] = useState(articulo.descuento);
  const [precioFinal, setPrecioFinal] = useState(articulo.preciototal);
  const navigation = useNavigation();

  const handleSave = async () => {
    // ... lógica para guardar el artículo en la preventa
        const articuloConDetalles = {
      ...articulo,
      cantidad: parseInt(cantidad),
      descuento: parseFloat(descuento),
      precioFinal: parseFloat(precioFinal),
    };
    // Obtener la preventa actualizada después de guardar el artículo
    const preventaActual = await obtenerPreventa();
    
    // Actualizar la preventa con el nuevo artículo
    const nuevaPreventa = [...preventaActual, articuloConDetalles];
    console.log("Add28. nueva prev", nuevaPreventa);
    guardarPreventa(nuevaPreventa);
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.articuloInfo}>{articulo ? articulo.id : ''}</Text>
      <Text style={styles.articuloInfo}>{articulo ? articulo.descripcion : ''}</Text>

      <Text style={styles.label}>Cantidad:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => setCantidad(text.replace(/[^0-9]/g, ''))}
        value={cantidad}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Descuento:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => setDescuento(text.replace(/[^0-9.]/g, ''))}
        value={descuento}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Precio total:</Text>
      <TextInput
        style={styles.input}
        onChangeText={(text) => setPrecioFinal(text.replace(/[^0-9.]/g, ''))}
        value={precioFinal}
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
