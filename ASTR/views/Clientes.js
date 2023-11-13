import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { datosClientes } from '../assets/data';

const Clientes = () => {
  const [search, setSearch] = useState('');
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    // Aquí puedes realizar cualquier lógica adicional al cargar los datos de clientes
    setClientes(datosClientes);
  }, []);

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      cliente.codigo.toLowerCase().includes(search.toLowerCase())
  );

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
        keyExtractor={(item) => item.codigo}
        renderItem={({ item }) => (
          <View style={styles.clienteItem}>
            <View style={styles.clienteText}>
              <Icon name="user" size={30} color="#000" style={styles.icon} />
              <Text style={styles.text}>{item.descripcion}</Text>
              <Text style={styles.codigo}>{item.codigo}</Text>
            </View>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between', 
    fontSize: 30,
    width: '100%',
  },
  text: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    fontSize: 30,
    width: '100%',
  },
  icon: {
    paddingRight: 24,
    marginLeft: 4,
    fontSize: 40,
  },
  codigo: {
    fontSize: 20,
    color : "blue",
    marginRight: 20,
  },
});

export default Clientes;

