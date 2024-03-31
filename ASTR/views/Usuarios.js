// Usuarios.js
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Text, FlatList, StyleSheet, View } from 'react-native';
// import { initDatabase, getUsuarios, insertUsuariosFromAPI } from '../database/database';

import { getUsuarios } from '../database/controllers/Usuarios.controler';
const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const usuariosFromDB = await getUsuarios();
        setUsuarios(usuariosFromDB);
      } catch (error) {
        console.error('Error al obtener o insertar usuarios: ', error);
      }
    };
    fetchData();
  }, []);

  return (
  <View style={styles.container}>
    <View style={styles.titulo}>
      <Text style={styles.tituloText}>ASTR</Text>
      <Text style={styles.subtituloText}>panel de configuracion</Text>
    </View>
      <Text>Estos son los usuarios en la base de datos:</Text>
      <FlatList
        data={usuarios}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Text>{item.codigo} - {item.descripcion} - {item.clave}</Text>
        )}
      />
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
export default Usuarios;



