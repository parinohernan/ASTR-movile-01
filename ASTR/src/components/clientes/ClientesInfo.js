import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Text, FlatList, StyleSheet, View } from 'react-native';
// import { initDatabase, getUsuarios, insertUsuariosFromAPI } from '../database/database';

const ClientesInfo = () => {
    // const {route} = props;
    // const {params} = route;
    const cliente = "0303";
//   const [usuarios, setUsuarios] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
      
//       try {
//         const usuariosFromDB = await getUsuarios();
//         setUsuarios(usuariosFromDB);
//       } catch (error) {
//         console.error('Error al obtener o insertar usuarios: ', error);
//       }
//     };
//     fetchData();
//   }, []);
    console.log("clienteinfo",cliente);
  return (
  <View style={styles.container}>
    <View style={styles.titulo}>
      <Text style={styles.tituloText}>Osvi</Text>
      <Text style={styles.subtituloText}>Informacion cuenta corriente del cliente</Text>
    </View>
      <Text>Disculpe esta funsion no se encuentra disponible en la actual version:</Text>
      {/* <FlatList
        data={usuarios}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Text>{item.id} - {item.descripcion}</Text>
        )}
      /> */}
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
export default ClientesInfo;



