import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
// import { articulos } from '../assets/dataArticulos';

const AddArticulo = ({ articulo, prefacturaNumero, closeModal }) => {
  const [cantidad, setCantidad] = useState('');
//   const [descuento, setDescuento] = useState('');
  const [precioFinal, setPrecioFinal] = useState('');

  const handleSave = () => {
    console.log(`AddArt11 Agregando  ${cantidad} unidades del artículo ${articulo.id} a la preventa ${prefacturaNumero}`);
    closeModal();
  };

  const handleCancel = () => {
    closeModal();
  };

//   <Text style={styles.articuloInfo}>{articulo ? articulo.id : ''}</Text>
  if (articulo) {
    return (
    <View style={styles.container}>
      <Text style={styles.articuloInfo}>{articulo.id}</Text>
      <Text style={styles.articuloInfo}>{articulo.descripcion}</Text>
      {/* <Text style={styles.articuloInfo}>{articulo.precioFinal}</Text> */}
      <Text style={styles.label}>Cantidad:</Text>
      <TextInput
        style={styles.input}
        // onChangeText={setCantidad}
        onChangeText={(text) => setCantidad(text.replace(/[^0-9]/g, ''))}
        value={cantidad}
        keyboardType="numeric"
        />
      {/* <Text style={styles.label}>Precio total:</Text> */}
      {/* <TextInput
        style={styles.input}
        onChangeText={setPrecioFinal}
        value= {(articulo.PrecioCostoMasImp * (1 + articulo.Lista1 / 100) * (cantidad))}
        keyboardType="numeric"
        editable={false}
        /> */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Agregar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}
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
