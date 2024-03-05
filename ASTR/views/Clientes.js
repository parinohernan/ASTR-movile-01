import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
// import { datosClientes } from '../assets/data';
import { useNavigation } from '@react-navigation/native';
import { getClientes } from '../database/controllers/Clientes.Controler';
import { nextPreventa } from '../database/controllers/Preventa.Controler';

const Clientes = () => {
  const [search, setSearch] = useState('');
  const [clientes, setClientes] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const clientesFromDB = await getClientes();
        setClientes(clientesFromDB);
      } catch (error) {
        console.error('Error al obtener de bdd o insertar clientes: ', error);
      }
    };

    fetchData();
  }, []);

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      cliente.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleClienteClick = async (cliente) => {
    let preventaNumero = await nextPreventa();
    console.log('Código del cliente:', cliente.descripcion);
    console.log('Preventa Número:', preventaNumero);
  
    // Resto de tu lógica...
    navigation.navigate('Preventa', { preventaNumero, cliente });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchbar}
        placeholder="Buscar cliente..."
        value={search}
        onChangeText={(text) => setSearch(text)}
      />
      <FlatList
        data={filteredClientes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleClienteClick(item)}> 
            <View style={styles.clienteItem}>
              <View style={styles.clienteText}>
                <Icon name="user" size={10} color="red" style={styles.icon} />
                <Text style={styles.text}>{item.descripcion}</Text>
                <Text style={styles.codigo}>{item.id}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

 // ... (tu estilo existente)
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FAF7E6',
  },
  searchbar: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  clienteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    paddingVertical: 10,
    width: '100%', 
  },
  clienteText: {
    // flexDirection: 'row',
    // justifyContent: 'space-between', 
    // fontSize: 10,
    // width: '100%',
  },
  text: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    fontSize: 16,
    width: '100%',
  },
  icon: {
    paddingRight: 24,
    marginLeft: 4,
    fontSize: 20,
  },
  codigo: {
    fontSize: 20,
    color : "blue",
    marginRight: 20,
  },
});


export default Clientes;



