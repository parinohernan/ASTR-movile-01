import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const AddArticulo = ({ articulo, closeModal, guardarPreventa, obtenerPreventa, limpiarPreventa }) => {
  const [cantidad, setCantidad] = useState(0);
  const [descuento, setDescuento] = useState(0);
  const [precioFinal, setPrecioFinal] = useState(0);

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
    console.log("Add23. preventa y articulos", [preventaActual, articuloConDetalles]);

    // Actualizar la preventa con el nuevo artículo
    const nuevaPreventa = [...preventaActual, articuloConDetalles];
    guardarPreventa(nuevaPreventa);

    // Cerrar el modal
    closeModal();
  };

  const handleCancel = () => {
    closeModal();
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

// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
// import { guardarPreventa, obtenerPreventa, limpiarPreventa } from '../utils/storageUtils';

// const AddArticulo = ({ articulo, closeModal, preventaNumero }) => {
//   const [cantidad, setCantidad] = useState('');
//   const [descuento, setDescuento] = useState('');
//   const [precioFinal, setPrecioFinal] = useState('');

//   const handleSave = () => {
//     // Aquí puedes realizar la lógica necesaria antes de guardar en el almacenamiento local
//     const articuloConDetalles = {
//       ...articulo,
//       cantidad: parseInt(cantidad),
//       descuento: parseFloat(descuento),
//       precioFinal: parseFloat(precioFinal),
//     };

//     // Obtener la preventa actual del almacenamiento local
//     const preventaActual = obtenerPreventa();
//     // Agregar el artículo con detalles a la preventa
//     console.log("Add23. preventa y articulos", [preventaActual, articuloConDetalles]);
//     const preventaArray = Array.isArray(preventaActual) ? preventaActual : [];
//     const nuevaPreventa = [...preventaArray, articuloConDetalles];
//     guardarPreventa(nuevaPreventa);
//     // Guardar la preventa actualizada en el almacenamiento local
//     console.log(`Agregando ${cantidad} unidades del artículo ${articulo.id} a la preventa ${preventaNumero}`);

//     closeModal();
//   };

//   const handleCancel = () => {
//     closeModal();
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.articuloInfo}>{articulo ? articulo.id : ''}</Text>
//       <Text style={styles.articuloInfo}>{articulo ? articulo.descripcion : ''}</Text>

//       <Text style={styles.label}>Cantidad:</Text>
//       <TextInput
//         style={styles.input}
//         onChangeText={(text) => setCantidad(text.replace(/[^0-9]/g, ''))}
//         value={cantidad}
//         keyboardType="numeric"
//       />

//       <Text style={styles.label}>Descuento:</Text>
//       <TextInput
//         style={styles.input}
//         onChangeText={(text) => setDescuento(text.replace(/[^0-9.]/g, ''))}
//         value={descuento}
//         keyboardType="numeric"
//       />

//       <Text style={styles.label}>Precio total:</Text>
//       <TextInput
//         style={styles.input}
//         onChangeText={(text) => setPrecioFinal(text.replace(/[^0-9.]/g, ''))}
//         value={precioFinal}
//         keyboardType="numeric"
//       />

//       <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
//         <Text style={styles.saveButtonText}>Agregar</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
//         <Text style={styles.cancelButtonText}>Cancelar</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };


// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';


// // import { articulos } from '../assets/dataArticulos';


// const AddArticulo = ({ articulo, closeModal }) => { //quite el preventa numero solo hay una preventa en el localStorage
//   const [cantidad, setCantidad] = useState('');
//   const [descuento, setDescuento] = useState('');
//   const [precioFinal, setPrecioFinal] = useState('');

//   const handleSave = () => {
//     console.log(`AddArt11 Agregando  ${cantidad} unidades del artículo ${articulo.id} a la localStorage`);
//     closeModal();
//   };

//   const handleCancel = () => {
//     closeModal();
//   };

// //   <Text style={styles.articuloInfo}>{articulo ? articulo.id : ''}</Text>
//   if (articulo) {
//     return (
//     <View style={styles.container}>
//       <Text style={styles.articuloInfo}>{articulo.id}</Text>
//       <Text style={styles.articuloInfo}>{articulo.descripcion}</Text>
//       {/* <Text style={styles.articuloInfo}>{articulo.precioFinal}</Text> */}
//       <Text style={styles.label}>Cantidad:</Text>
//       <TextInput
//         style={styles.input}
//         // onChangeText={setCantidad}
//         onChangeText={(text) => setCantidad(text.replace(/[^0-9]/g, ''))}
//         value={cantidad}
//         keyboardType="numeric"
//         />
//       <Text style={styles.label}>Precio total:</Text>
//       {/* <TextInput
//         style={styles.input}
//         onChangeText={setPrecioFinal}
//         value= {(articulo.PrecioCostoMasImp * (1 + articulo.Lista1 / 100) * (cantidad))}
//         keyboardType="numeric"
//         editable={false}
//         /> */}
//       <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
//         <Text style={styles.saveButtonText}>Agregar</Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
//         <Text style={styles.cancelButtonText}>Cancelar</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
// };

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
