import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet } from 'react-native';

const Clientes = () => {
  const [search, setSearch] = useState('');
  const [clientes, setClientes] = useState([]);

  // Ejemplo de datos de clientes (sustituir con tus propios datos)
  const datosClientes = [
    { codigo: '001', descripcion: 'Cliente 1' },
    { codigo: '002', descripcion: 'Cliente 2' },
    { codigo: '003', descripcion: 'Cliente 3' },
    // ... otros clientes ...
  ];

  useEffect(() => {
    // Aquí puedes realizar cualquier lógica adicional al cargar los datos de clientes
    setClientes(datosClientes);
  }, []);

  const filteredClientes = clientes.filter((cliente) =>
    cliente.descripcion.toLowerCase().includes(search.toLowerCase())
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
            <Text style={styles.codigo}>{item.codigo}</Text>
            <Text>{item.descripcion}</Text>
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
  },
  searchbar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  clienteItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    paddingVertical: 10,
  },
  codigo: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default Clientes;
