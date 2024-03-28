import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { getClientes } from '../database/controllers/Clientes.Controller';
import { nextPreventa } from '../src/utils/storageConfigData';
import { Searchbar } from 'react-native-paper';

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
    // console.log('Código del cliente:', cliente.descripcion);
    console.log('Preventa Número:', preventaNumero);
    navigation.navigate('Preventa', { preventaNumero, cliente });
  };

  return (
    <View style={styles.container}>
      <View >
        <Text style={styles.viewTitle}> Elegir cliente </Text>
      </View>
      <View style={styles.searchbar}      >
      <Searchbar
        placeholder="Buscar cliente..."
        onChangeText={(value) => setSearch(value)}
        value={search}
      />
      </View>

      <FlatList
        data={filteredClientes}
        keyExtractor={(item) => `${item.id}-${item.descripcion}`}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleClientClick(item)}> 
            <View style={styles.clienteItem}>
              <View >
                <Icon name="user" size={24} color="#626262" />
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
    padding: 20,
    backgroundColor: '#FAF7E6',
  },
  viewTitle: {
    color : "#1223a2",
    fontSize: 22,
    padding:20,
  },
  clienteItem: {
    // display :'flex',
    // flexDirection: 'row',  
    // alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    paddingVertical: 10,
  }
});

export default Clientes;