import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { getClientes } from '../database/controllers/Clientes.Controller';
import { nextPreventa } from '../database/controllers/Preventa.Controller';

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
      typeof cliente.id === 'string' &&
      cliente.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      cliente.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleClientClick = async (cliente) => {
    let preventaNumero = await nextPreventa();
    console.log('Código del cliente:', cliente.descripcion);
    console.log('Preventa Número:', preventaNumero);
  
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
        keyExtractor={(item) => `${item.id}-${item.descripcion}`}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleClientClick(item)}> 
            <View style={styles.clienteItem}>
              <View style={styles.clienteText}>
                <Icon name="user" size={10} color="#121212" style={styles.icon} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchbar: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 10,
    padding: 10,
    borderRadius: 5,
  },
  clienteItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 10,
  },
  clienteText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginLeft: 10,
  },
  icon: {
    fontSize: 10,
  },
  codigo: {
    marginLeft: 'auto',
    color: 'blue',
  },
});

export default Clientes;
