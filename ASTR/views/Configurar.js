import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch } from 'react-native';
import { Button } from 'react-native-elements';
import { eliminarTodasLasTablas, getTables } from '../database/database';
import { actualizarAPP, initDatabase } from '../handlers/actualizarApp';
// import { getConfiguracion, setConfiguracion, crearConfiguracion } from '../database/controllers/ConfiguracionController';
import { guardarConfiguracionEnStorage, getConfiguracionDelStorage } from '../src/utils/storageConfigData';

// import limpiarDatos from "../database/database"r


const Configurar = () => {
 
  const [configuracion, setConfiguracion]= useState({
    endPoint:"http://localhost:3000/preventas",
    siguientePreventa: 100,//este dato solo se visualiza, se actualiza automaticamente
    vendedor: "0001",
    usaGeolocalizacion: true,
    cantidadMaximaArticulos: "18",
  })

  useEffect(() => {
    handleGetConfiguracion()
  }, []);

  
  const handleTablas =   () => {
    initDatabase()
  };

  const handleGetConfiguracion = async ()=>{
    let config = await getConfiguracionDelStorage();
    console.log("Confi 70.. config ", config);
    setConfiguracion(config);
  }

  const handleGuardarConfiguracion = ()=>{
    guardarConfiguracionEnStorage(configuracion);
  }

  return (
    <View style={{ padding: 20, backgroundColor: '#FAF7E6' }}>
      <Text>EndPoint:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={configuracion.endPoint}
        onChangeText={(text) => setConfiguracion({ ...configuracion, endPoint: text })}
      />  
      <Text>Sucursal:</Text>
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
        value={configuracion.siguientePreventa}
        onChangeText={(text) => setConfiguracion({ ...configuracion, siguientePreventa: text.replace(/[^0-9]/g, '') })}
        // editable:false
      />

      {/* Botones */}
      <Button title="crear tablas" onPress={handleTablas} buttonStyle={{ marginTop: 40 }} />
      <Button title="guardar configuracion" onPress={handleGuardarConfiguracion} buttonStyle={{ marginTop: 40 }} />
    </View>
  );
};

export default Configurar;

