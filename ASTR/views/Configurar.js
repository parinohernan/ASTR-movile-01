import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, Alert } from 'react-native';
import { CheckBox, Button } from 'react-native-elements';

const Configurar = () => {
  const [webService, setWebService] = useState('');
  const [sucursal, setSucursal] = useState('');
  const [modificacionPrecios, setModificacionPrecios] = useState(false);
  const [activarGeolocalizacion, setActivarGeolocalizacion] = useState(false);
  const [cantidadMaximaArticulos, setCantidadMaximaArticulos] = useState('');
  const [guardarHabilitado, setGuardarHabilitado] = useState(false);

  useEffect(() => {
    // Verificar si todos los campos están completos
    if (webService && sucursal && cantidadMaximaArticulos) {
      setGuardarHabilitado(true);
    } else {
      setGuardarHabilitado(false);
    }
  }, [webService, sucursal, cantidadMaximaArticulos]);

  const handleGuardar = () => {
    if (guardarHabilitado) {
      // Implementa la lógica para guardar la configuración
      console.log('Configuración guardada');
    } else {
      Alert.alert('Error', 'Completa todos los campos antes de guardar.');
    }
  };

  const handleCancelar = () => {
    // Implementa la lógica para cancelar la configuración
    console.log('Configuración cancelada');
  };

  return (
    <View style={{ padding: 20, backgroundColor: '#FAF7E6' }}>
      <Text>WebService:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={webService}
        onChangeText={(text) => setWebService(text)}
      />

      <Text>Sucursal:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={sucursal}
        onChangeText={(text) => setSucursal(text.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ flex: 1 }}>Actualizar Datos</Text>
        <Switch value={modificacionPrecios} onValueChange={() => setModificacionPrecios(!modificacionPrecios)} />
       {/* <Switch value={activarGeolocalizacion} onValueChange={() => setActivarGeolocalizacion(!activarGeolocalizacion)} /> */}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 }}>
        <Text style={{ flex: 1 , padding: 5 }}>Activar Geolocalizacion</Text>
        {/* <Switch value={modificacionPrecios} onValueChange={() => setModificacionPrecios(!modificacionPrecios)} /> */}
       <Switch value={activarGeolocalizacion} onValueChange={() => setActivarGeolocalizacion(!activarGeolocalizacion)} />
      </View>

      <Text>Cantidad máxima de artículos:</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={cantidadMaximaArticulos}
        onChangeText={(text) => setCantidadMaximaArticulos(text.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
      />

      {/* Botones */}
      <Button title="Guardar" onPress={handleGuardar} disabled={!guardarHabilitado} buttonStyle={{ marginTop: 40, backgroundColor:'green' }}/>
      <Button title="Cancelar" onPress={handleCancelar} buttonStyle={{ marginTop: 40 }} />
    </View>
  );
};

export default Configurar;

