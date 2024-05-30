import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { /*actualizarClientes, actualizarVendedores, actualizarArticulos,*/ actualizarAPP } from '../handlers/actualizarApp';
import ConsoleComponent from '../src/components/ConsoleComponent';
// import { initDatabase } from '../handlers/actualizarApp';

const Sincronizar = () => {
  const [actualizarDatos, setActualizarDatos] = useState(false);
  const [logs, setLogs] = useState([]);


  const handleEnviarPreventas = async () => {
    await actualizarAPP(actualizarDatos, logs, setLogs);

  };


  return (
    <ScrollView style={styles.container}>
      {/* Switch para actualizar datos */}
      <View style={styles.titulo}>
        <Text style={styles.tituloText}>ASTR</Text>
        <Text style={styles.subtituloText}>Sincronizacion</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Button title="Sincronizar" onPress={handleEnviarPreventas} buttonStyle={{ margin: 10, width: "70%", backgroundColor:'blue', borderWidth: 3 , borderRadius: 20 }}/>
        <Text style={{ flex: 1 }}>Activar Actualizar Datos</Text>
        <Switch value={actualizarDatos} onValueChange={() => setActualizarDatos(!actualizarDatos)} />
        {/* <Text style={styles.explanationText}>Si quiere solo enviar las preventas no es necesario que active Actualizar Datos.</Text> */}
      </View>
      {/* <ConsoleComponent logs="logs mostrar" /> */}
      <ConsoleComponent logs={logs} />
      <Text style={styles.explanationText}>* Si quiere solo enviar las preventas no es necesario que active Actualizar Datos.</Text>
      <Text style={styles.explanationText}>* Una vez enviadad las preventas no quedan guardadas en su telefono.</Text>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#96ddf5',
    paddingTop:60,
    // alignItems: 'center',
    // justifyContent: 'center',
    padding: 10,
  },
  titulo: {
      marginBottom: 30,
      alignItems: 'center',
      backgroundColor: '#0c2f3c',
      padding: 20,
    },
    // titulo: {
    //   marginBottom: 30,
    //   alignItems: 'center',
    //   backgroundColor: '#0c2f3c',
    //   // width: '100%',
    //   paddingLeft: 10,
    //   paddingLeft: -50,
    // },
    tituloText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: "cyan",
    // color: '#2c3e50',
  },
  subtituloText: {
    fontSize: 16,
    color: 'cyan',
  }, 
})
export default Sincronizar;
