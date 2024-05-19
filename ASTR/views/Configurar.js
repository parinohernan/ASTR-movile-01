import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { guardarConfiguracionEnStorage, getConfiguracionDelStorage } from '../src/utils/storageConfigData';
import axios  from 'axios';
import VendedoresSelect from '../src/components/VendedoresSelect';

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
  const [hasInternetAccess, setHasInternetAccess] = useState();
  const [serverData, setServerData] =useState();
  const [changes, setChanges]= useState(false);
  // const [vendedores, setVendedores]= useState();

  useEffect(() => {
    handleGetConfiguracion();
    checkInternetAccess();
    // handeBuscarVendedores();
  }, []);

  useEffect(() => {
    setChanges(true);
    checkInternetAccess();
    // handeBuscarVendedores();
  }, [configuracion]);

  const handleGetConfiguracion = async ()=>{
    let config = await getConfiguracionDelStorage();
    console.log("Confi 70.. config ", config);
    setConfiguracion(config);
  }

  const handleGuardarConfiguracion = ()=>{
    console.log("guardando config:",configuracion);
    guardarConfiguracionEnStorage(configuracion);
    setChanges( !changes)
  }

  const checkInternetAccess = async () => {
    let endpoint = configuracion.endPoint;
    console.log("chequeando internet",endpoint, endpoint[endpoint.length -1] );
    if (endpoint[endpoint.length -1] == "/") { 
      try {
        console.log("aca checkeando",endpoint);
        const response = await axios(endpoint);
        // Si la solicitud se completa con éxito, significa que hay acceso al servidor
        setServerData(response.data);
        
        setHasInternetAccess(true);
      } catch (error) {
        // Si ocurre un error, no hay acceso al servidor
        setHasInternetAccess(false);
        setServerData("Sin coneccion");
      }
    }else{
      setServerData("El endpoint debe terminar en / ");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titulo}>
        <Text style={styles.tituloText}>ASTR</Text>
        <Text style={styles.subtituloText}>panel de configuracion,  {hasInternetAccess? console.log(hasInternetAccess, "tengo internet"): console.log("muerto, no tengo internet")}</Text>
      </View>
      <Text >{hasInternetAccess? "✓":"X"} EndPoint:</Text>  
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={configuracion.endPoint}
        onChangeText={(text) => setConfiguracion({ ...configuracion, endPoint: text })}
        />
      <Text style={styles.subtituloText}>{serverData}</Text> 
      <Text>Sucursal:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={configuracion.sucursal}
        onChangeText={(text) => setConfiguracion({ ...configuracion, sucursal: text.replace(/[^0-9]/g, '') })}
        keyboardType="numeric"
        />
      
      <Text>Vendedor:</Text>
      <View style={{ height: 100, zIndex: 10, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }} >

        <VendedoresSelect style={{ height: 100, zIndex: 20}} configuracion={configuracion} setConfiguracion={setConfiguracion}/>
      </View>
      <Text>Cantidad máxima de artículos:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={configuracion.cantidadMaximaArticulos}
        onChangeText={(text) => setConfiguracion({ ...configuracion, cantidadMaximaArticulos: text.replace(/[^0-9]/g, '') })}
        keyboardType="numeric"
      />
      <Text>Siguente preventa:</Text>
      <TextInput
        style={{ height: 40,  borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={String(configuracion.siguientePreventa)}
        onChangeText={(text) => setConfiguracion({ ...configuracion, siguientePreventa: text.replace(/[^0-9]/g, '') })}
        // editable:false
      />

      {/* Botones */}

      { changes? 
      <Button title="guardar configuracion" onPress={handleGuardarConfiguracion} buttonStyle={{ marginTop: 40 }} /> 
      : 
      <Button title="guardar configuracion" onPress={handleGuardarConfiguracion} buttonStyle={{ marginTop: 40 }} /> 
      }
      
 
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
  picker: {
    width: '80%',
    // height: '167' ,
    // zIndex: 712,
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

