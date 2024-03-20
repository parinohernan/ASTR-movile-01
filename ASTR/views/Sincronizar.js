import React, { useState } from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';
import { /*actualizarClientes, actualizarVendedores, actualizarArticulos,*/ actualizarAPP } from '../handlers/actualizarApp';
import ConsoleComponent from '../src/components/ConsoleComponent';
// import { initDatabase } from '../handlers/actualizarApp';

const Sincronizar = () => {
  const [actualizarDatos, setActualizarDatos] = useState(false);
  const [logs, setLogs] = useState([]);

  // const handleSincronizar = () => {
  //   // Implementa la lógica de sincronización aquí
  //   console.log('Sincronizando...');
  // };
  // const handleAtras = () => {
  //   // Implementa la lógica de retroceder aquí
  //   console.log('Atrás');
  // };
  // const handleTraerVendedores = async () => {
  //   await actualizarVendedores(setLogs);
  // };
  // const handleTraerClientes = async () => {
  //   await actualizarClientes(setLogs);
  // };
  // const handleTraerArticulos = async () => {
  //   await actualizarArticulos(setLogs);
  // };
  // const handleTablas =  async () => {
  //   //inicializa las tablas en BDD sqlite
  //   await initDatabase(setLogs)
  // };

  const handleEnviarPreventas = async () => {
    await actualizarAPP(actualizarDatos, setLogs);

  };


  return (
    <ScrollView style={{ padding: 20, backgroundColor: '#FAF7E6'}}>
      {/* Switch para actualizar datos */}
      <Button title="Sincronizar" onPress={handleEnviarPreventas} buttonStyle={{ marginTop: 40, backgroundColor:'#ef5224' }}/>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ flex: 1 }}>Actualizar Datos</Text>
        <Switch value={actualizarDatos} onValueChange={() => setActualizarDatos(!actualizarDatos)} />
      </View>
      {/* <ConsoleComponent logs="logs mostrar" /> */}
      <ConsoleComponent logs={logs} />
    </ScrollView>
  );
};

export default Sincronizar;
