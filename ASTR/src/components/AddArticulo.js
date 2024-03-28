import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { guardarPreventaEnStorage, obtenerPreventaDeStorage, eliminarItemEnPreventaEnStorage, limpiarPreventaDeStorage} from "../utils/storageUtils";
import { useNavigation } from '@react-navigation/native';

const cantidadCargados= async (codigo) =>{  //articulo.id
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

const AddArticulo = ({route}) => {
  const {params} = route;
  const {articulo, preventaNumero, cliente, cantItems} = params;
  
  const setFuiAAdd = params.setFuiAAdd;

  console.log("que tene el articulo.. ",articulo, preventaNumero, cliente, cantItems);
  const [cantidad, setCantidad] = useState(articulo.seleccionados? articulo.seleccionados : 0 );
  // const [descuento, setDescuento] = useState(0);
  const [precioFinal, setPrecioFinal] = useState(articulo.precio ); //useState(articulo.precioCostoMasImp.toFixed(2))
  const [precioUnitario, setPrecioUnitario] = useState (cantidad === 0 ? articulo.precio : articulo.precio / cantidad);
  const navigation = useNavigation();
  const articuloConDetalles = {
    ...articulo,
    cantidad: parseInt(cantidad),
    // descuento: parseFloat(descuento),
    precioFinal: parseFloat(precioFinal),
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
  
  const vaciarPreventaStorage = async () =>{
     // eliminar item de la preventa de sorage actual
      console.log("elimina todo chauu",articuloConDetalles.id);
      await limpiarPreventaDeStorage();
      navigation.navigate('Preventa',{preventaNumero: preventaNumero, cliente : cliente});
      return
  }

  const eliminar1PreventaStorage = async () =>{
    // eliminar item de la preventa de sorage actual
     console.log("elimina solo uno",articuloConDetalles.id);
     await eliminarItemEnPreventaEnStorage(articuloConDetalles.id);
     navigation.navigate('Preventa',{preventaNumero: preventaNumero, cliente : cliente});
     return
 }

  const modificarItemPreventaStorage = async () => {
    console.log("modificarItemPreventaStorage");
    await eliminarItemEnPreventaEnStorage (articulo.id);
    await agregarItemPreventaStorage();
  }

  const agregarItemPreventaStorage = async() => {
    console.log("agregarItemPreventaStorage");
    const preventa = await obtenerPreventaDeStorage();
    preventa.push(articuloConDetalles);
    guardarPreventaEnStorage(preventa);
    navigation.goBack();
  }

  // console.log("addArt19. ",articuloConDetalles);
  const handleSave = async () => {
    // ... lógica para guardar el artículo en la preventa
    const yaEsta = await estaCargado(articulo.id);
    console.log(yaEsta, "articulo a modificar o agregar ", cantidad ,  articulo.id, "items", cantItems);
    if ( ( cantidad == 0) && (cantItems == 1)) {
      console.log("vaciarpreventa");
      await vaciarPreventaStorage();
   
      return
    } 
    
    if ( yaEsta && ( cantidad == 0)) {
      await eliminar1PreventaStorage();
   
      return
    } 
    if (yaEsta && cantidad > 0) {
      console.log("aca modifico existe y cantidad no es 0");
      await modificarItemPreventaStorage();
    
      return
    } 
    if (cantidad == 0) { //en este caso no hago nada
      navigation.goBack();
      return
    }
    await agregarItemPreventaStorage();
   
    return
};
  
  const handleCantidad = (text) => {
    const cuenta = (precioUnitario.toFixed(2)) * text; //talves no deberia redondear
    // console.log("Add37. preciofinal ..antes ",(articulo.precio.toFixed(2)), "x ",text," = ",cuenta);
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
      <Text style={styles.articuloInfo}> $ {articulo ? precioUnitario : ''}</Text>
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
        value={"$ " +String(precioFinal)}
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

export {cantidadCargados, AddArticulo} ;
