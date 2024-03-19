import React, { useState } from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';
import { actualizarClientes, actualizarVendedores, actualizarArticulos, enviarPreventas } from '../handlers/actualizarApp';
import ConsoleComponent from '../src/components/ConsoleComponent';

const Sincronizar = () => {
  const [actualizarDatos, setActualizarDatos] = useState(false);
  const [logs, setLogs] = useState([]);

  const handleSincronizar = () => {
    // Implementa la lógica de sincronización aquí
    console.log('Sincronizando...');
  };

  const handleAtras = () => {
    // Implementa la lógica de retroceder aquí
    console.log('Atrás');
  };

  const handleTraerVendedores = async () => {
    await actualizarVendedores();
  };

  const handleTraerClientes = async () => {
    await actualizarClientes();
  };

  const handleTraerArticulos = async () => {
    await actualizarArticulos();
  };

  const handleEnviarPreventas = async () => {
    await enviarPreventas(setLogs);

  };

  const handleLog =  (mensaje) => {
    setLogs( logs + " " + mensaje )
  };

    // Simulando agregar un mensaje de log
  const addLog = (message) => {
    setLogs([...logs, message]);
  };

  // setTimeout(() => {
  //   addLog('Nuevo mensaje de log');
  // }, 3000);

  return (
    <ScrollView style={{ padding: 20, backgroundColor: '#FAF7E6'}}>
      {/* Switch para actualizar datos */}
      <Button title="Enviar 
      preventass" onPress={handleEnviarPreventas} buttonStyle={{ marginTop: 40, backgroundColor:'#455544' }}/>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ flex: 1 }}>Actualizar Datos</Text>
        <Switch value={actualizarDatos} onValueChange={() => setActualizarDatos(!actualizarDatos)} />
      </View>
      {/* <ConsoleComponent logs="logs mostrar" /> */}
      <ConsoleComponent logs={logs} />
      {/* Botones */}
      <Button title="Sincronizar" onPress={handleSincronizar} />
      <Button title="Atrás" onPress={handleAtras} buttonStyle={{ marginTop: 10 }} />
      <Button title="Sincronizar vendedores" onPress={handleTraerVendedores} buttonStyle={{ marginTop: 40, backgroundColor:'green' }}/>
      <Button title="Sincronizar clientes" onPress={handleTraerClientes} buttonStyle={{ marginTop: 40, backgroundColor:'green' }}/>
      <Button title="Sincronizar Articulos" onPress={handleTraerArticulos} buttonStyle={{ marginTop: 40, backgroundColor:'green' }}/>
    </ScrollView>
  );
};


export default Sincronizar;
