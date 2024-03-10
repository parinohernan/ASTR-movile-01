import React, { useState } from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';
import { actualizarClientes, actualizarVendedores, actualizarArticulos } from '../handlers/actualizarApp';

const Sincronizar = () => {
  const [actualizarDatos, setActualizarDatos] = useState(false);

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
  return (
    <ScrollView style={{ padding: 20, backgroundColor: '#FAF7E6'}}>
      {/* Switch para actualizar datos */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ flex: 1 }}>Actualizar Datos</Text>
        <Switch value={actualizarDatos} onValueChange={() => setActualizarDatos(!actualizarDatos)} />
      </View>

      {/* Consola */}
      {/* <View style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 20, backgroundColor: '#CFFCFF', height: '150%' }}> */}
        {/* Muestra los mensajes y errores aquí */}
        <Text>Consola de Sincronización</Text>
      {/* </View> */}

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
