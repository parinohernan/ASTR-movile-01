import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { eliminarTodasLasTablas, getTables } from '../database/database';
import { actualizarAPP, initDatabase } from '../handlers/actualizarApp';
// import { getConfiguracion, setConfiguracion, crearConfiguracion } from '../database/controllers/ConfiguracionController';
import { guardarConfiguracionEnStorage, getConfiguracionDelStorage } from '../src/utils/storageConfigData';

// import limpiarDatos from "../database/database"r


const Configurar = () => {
 
  const [configuracion, setConfiguracion]= useState({
    endPoint:"",
    siguientePreventa: 100,//este dato solo se visualiza, se actualiza automaticamente
    vendedor: "",
    sucursal: "",
    usaGeolocalizacion: true,
    cantidadMaximaArticulos: "18",
  })

  const [changes, setChanges]= useState(false);

  useEffect(() => {
    handleGetConfiguracion()
  }, []);

  useEffect(() => {
    setChanges(true)
  }, [configuracion]);

  const handleGetConfiguracion = async ()=>{
    let config = await getConfiguracionDelStorage();
    console.log("Confi 70.. config ", config);
    setConfiguracion(config);
  }

  const handleGuardarConfiguracion = ()=>{
    guardarConfiguracionEnStorage(configuracion);
    setChanges( !changes)
  }

  return (
    <View style={styles.container}>
      <View style={styles.titulo}>
        <Text style={styles.tituloText}>ASTR</Text>
        <Text style={styles.subtituloText}>panel de configuracion</Text>
      </View>
      <Text>EndPoint:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={configuracion.endPoint}
        onChangeText={(text) => setConfiguracion({ ...configuracion, endPoint: text })}
      />  
      <Text>Sucursal:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={configuracion.sucursal}
        onChangeText={(text) => setConfiguracion({ ...configuracion, sucursal: text.replace(/[^0-9]/g, '') })}
        keyboardType="numeric"
      />
      <Text>Vendedor:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={configuracion.vendedor}
        onChangeText={(text) => setConfiguracion({ ...configuracion, vendedor: text.replace(/[^0-9]/g, '') })}
        keyboardType="numeric"
      />
      <Text>Cantidad máxima de artículos:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={configuracion.cantidadMaximaArticulos}
        onChangeText={(text) => setConfiguracion({ ...configuracion, cantidadMaximaArticulos: text.replace(/[^0-9]/g, '') })}
        keyboardType="numeric"
      />
      <Text>Siguente preventa:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={String(configuracion.siguientePreventa)}
        onChangeText={(text) => setConfiguracion({ ...configuracion, siguientePreventa: text.replace(/[^0-9]/g, '') })}
        // editable:false
      />

      {/* Botones */}
      {/* <Button title="crear tablas" onPress={handleTablas} buttonStyle={{ marginTop: 40 }} /> */}
      { changes? <Button title="guardar configuracion" onPress={handleGuardarConfiguracion} buttonStyle={{ marginTop: 40 }} /> : ""}
      {/* <Button title="guardar configuracion" onPress={handleGuardarConfiguracion} buttonStyle={{ marginTop: 40 }} /> */}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop:60,
    // alignItems: 'center',
    // justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    marginBottom: 30,
    alignItems: 'center',
  },
  tituloText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtituloText: {
    fontSize: 16,
    color: '#7f8c8d',
  }, 
})

export default Configurar;

