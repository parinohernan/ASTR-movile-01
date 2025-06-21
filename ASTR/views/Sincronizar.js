import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import { actualizarAPP, errorSincronizando } from '../handlers/actualizarApp';
import ConsoleComponent from '../src/components/ConsoleComponent';
import { empresa, producto } from '../src/cconstantes/constantes';
import checkServerHandler from '../src/utils/checkServerHandler';
import { limpiarDatos } from '../database/database';

const Sincronizar = () => {
  const [actualizarDatos, setActualizarDatos] = useState(false);
  const [logs, setLogs] = useState([]);


  const handleEnviarPreventas = async () => {
    setLogs (["Conectando al servidor"]);
    if (await checkServerHandler()) {
      await actualizarAPP(actualizarDatos, logs, setLogs);
    }
    else{
      errorSincronizando( logs, setLogs);
      console.log("error ");
    }

  };
  
  const handleLimpiarDatos = async () => {

      Alert.alert(
        'Confirmar eliminación de todas las preventas',
        '¿Está seguro que desea borrar TODO ?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Borrar',
            style: 'destructive',
            onPress: async () => {
              // setLogs (["Borrando tablas"]);
                  if (await checkServerHandler()) {
                    await limpiarDatos( logs, setLogs);
                  }
                  else{
                    errorSincronizando( logs, setLogs);
                    console.log("error ");
                  }
              // closeModal();
            },
          },
        ],
        { cancelable: false }
      );

    

  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.titulo}>
      <Text style={styles.tituloText}>{empresa} - {producto}</Text>
        <Text style={styles.subtituloText}>Sincronizacion</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Button title="Sincronizar" onPress={handleEnviarPreventas} buttonStyle={{ margin: 10, width: "70%", backgroundColor:'blue', borderWidth: 3 , borderRadius: 20 }}/>
        <Text style={{ flex: 1 }}>Activar Actualizar Datos</Text>
        <Switch value={actualizarDatos} onValueChange={() => setActualizarDatos(!actualizarDatos)} />
      </View>
      <ConsoleComponent logs={logs} />
      <View style={{  flexDirection: 'row' }}>
        <Button title="borrar datos" onPress={handleLimpiarDatos} buttonStyle={{ margin: 15, width: "auto", backgroundColor:'#991111', borderWidth: 1 , borderRadius: 20 }}/>
        <Button title="borrar logs" onPress={()=>{setLogs([])}} buttonStyle={{ margin: 15, width: "auto", backgroundColor:'green', borderWidth: 1 , borderRadius: 20 }}/>
      </View >
      {/* <View style={styles.explanation}>
        <Text style={styles.explanationText}>* En esta version solo puede enviar las preventas una a una desde informes.</Text>
      </View> */}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#96ddf5',
    paddingTop:60,
    marginTop:-40,
    padding: 10,
  },
    titulo: {
      width: '100%',
      margin: 0,
      padding: 10,
      borderTopWidth: 2,
      borderTopRightRadius: 30,
      borderBottomRightRadius: 60,
      backgroundColor: '#0c2f3c',
      borderColor: "#30bced",
      borderWidth: 10,
    },
    tituloText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: "cyan",
  },
  subtituloText: {
    fontSize: 16,
    color: 'cyan',
  }, 
  explanationText: {
    fontSize: 16,
    color: 'red',
    fontWeight: ''
  },
  explanation: {
    paddingHorizontal:20
  }
})
export default Sincronizar;
