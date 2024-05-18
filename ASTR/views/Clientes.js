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
    let edit= false;
    navigation.navigate('Preventa', { preventaNumero, cliente, edit });
  };

  return (
    <View style={styles.container}>
      <View style={styles.viewTitle}> 
        <Text style={styles.title}> Elegir cliente </Text>
      </View>
      <View style={styles.searchbar}      >
      <Searchbar
        placeholder="Buscar cliente..."
        onChangeText={(value) => setSearch(value)}
        value={search}
      />
      </View>
      <View style={styles.itemsContainer}  >

      <FlatList 
        data={filteredClientes}
        keyExtractor={(item) => `${item.id}-${item.descripcion}`}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleClientClick(item)}> 
            <View style={styles.clienteItem}>
              <View >
                {/* <Icon name="user" size={24} color="#626262" /> */}
                <Text style={styles.text}>{item.descripcion}</Text>
                <Text style={styles.text}>Lista {item.listaPrecio}</Text>
                <Text style={styles.codigo}>Codigo {item.id}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#06181e',
  },
  viewTitle: {
    alignItems: 'center', // Centrar horizontalmente
    justifyContent: 'center', // Centrar verticalmente
    marginVertical: 20, // Margen vertical
    padding: 0,
  },
  title: {
    marginTop: 20,
    marginBottom: -10,
    fontSize: 20, // Tamaño de fuente
    fontWeight: 'bold', // Fuente en negrita
    color: 'cyan', // Color de texto
    letterSpacing: 2, // Espaciado entre letras
  },
  clienteItem: {
    // display :'flex',
    // flexDirection: 'row',  
    // alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    paddingVertical: 10,
  },
  itemsContainer: {
    flex: 1,
    padding: 10,
    paddingTop: 20,
    margin: 0,
    marginTop: 2,
    zIndex: -1,
    backgroundColor: '#c9eefa',//background liviano
    borderWidth: 2, // Agregar borde
    borderColor: '#000', // Color del borde
    borderRadius: 10, // Radio de las esquinas (para hacerlas redondeadas)
    shadowColor: '#000', // Color de la sombra
    shadowOffset: { width: 0, height: 2 }, // Offset de la sombra
    shadowOpacity: 0.5, // Opacidad de la sombra
    shadowRadius: 2, // Radio de la sombra
    elevation: 50, // Elevación de la sombra (solo para Android)
  },
});

export default Clientes;