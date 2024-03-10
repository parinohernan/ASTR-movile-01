import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch } from 'react-native';
import { Button } from 'react-native-elements';
import { eliminarTodasLasTablas, getTables } from '../database/database';
import { actualizarAPP, initDatabase } from '../handlers/actualizarApp';
// import limpiarDatos from "../database/database"r

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

  //esto en realidad sincroniza y actualiza la APP
  const handleGuardar = async () => {
    
    await actualizarAPP();
 
  };
    // if (guardarHabilitado) {
    // } else {
    //   Alert.alert('Error', 'Completa todos los campos antes de guardar.');
    // }
  const handleTablas =   () => {
    console.log("creando tablas en BDD local: ", initDatabase())
    
  };
  const handleCancelar = () => {
    // Implementa la lógica para cancelar la configuración
    console.log('Configuración cancelada');
  };

  const handleLimpiarSQLite = async () => {
    try {
      await  eliminarTodasLasTablas();
      console.log('Limpieza finalizada');
    } catch (error) {
      console.error('Error al limpiar la base de datos: ', error);
    }
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
      {/* <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        value={sucursal}
        onChangeText={(text) => setSucursal(text.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ flex: 1 }}>Actualizar Datos</Text>
        <Switch value={modificacionPrecios} onValueChange={() => setModificacionPrecios(!modificacionPrecios)} />
       {/* <Switch value={activarGeolocalizacion} onValueChange={() => setActivarGeolocalizacion(!activarGeolocalizacion)} /> * /}
      </View> */}
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
      
      <Button title="crear tablas" onPress={handleTablas} buttonStyle={{ marginTop: 40 }} />
      {/* <Button title="Cancelar" onPress={handleCancelar} buttonStyle={{ marginTop: 40 }} />
      <Button title="Limpiar BD" onPress={handleLimpiarSQLite} buttonStyle={{ marginTop: 40 }} /> */}
    </View>
  );
};

export default Configurar;

