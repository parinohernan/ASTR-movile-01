import React, { useState } from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';

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

  return (
    <ScrollView style={{ padding: 20, backgroundColor: '#FAF7E6'}}>
      {/* Switch para actualizar datos */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ flex: 1 }}>Actualizar Datos</Text>
        <Switch value={actualizarDatos} onValueChange={() => setActualizarDatos(!actualizarDatos)} />
      </View>

      {/* Consola */}
      <View style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 20, backgroundColor: '#CFFCFF', height: '150%' }}>
        {/* Muestra los mensajes y errores aquí */}
        <Text>Consola de Sincronización</Text>
      </View>

      {/* Botones */}
      <Button title="Sincronizar" onPress={handleSincronizar} />
      <Button title="Atrás" onPress={handleAtras} buttonStyle={{ marginTop: 10 }} />
    </ScrollView>
  );
};


export default Sincronizar;
