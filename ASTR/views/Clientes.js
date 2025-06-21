import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { getClientes } from '../database/controllers/Clientes.Controller';
import { nextPreventa } from '../src/utils/storageConfigData';
import { Searchbar } from 'react-native-paper';
import checkServerHandler from '../src/utils/checkServerHandler';

const Clientes = () => {
  const [search, setSearch] = useState('');
  const [clientes, setClientes] = useState([]);
  const navigation = useNavigation();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

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

  const handleClienteInfoClick = async (cliente) => {
    setIsButtonDisabled(true);
    const hayInternet = await checkServerHandler();
    if (hayInternet) {
      navigation.navigate('ClientesInfo', {cliente});
    }else{
      console.log("no hay acceso al servidor");
    }
    setIsButtonDisabled(false);
  };

  const handleClientClick = async (cliente) => {
    let preventaNumero = await nextPreventa(); 
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
          <View style={styles.item}>
              <View style={styles.clienteItem}>
                <Text style={styles.text}>{item.descripcion}</Text>
                <Text style={styles.text}>Lista {item.listaPrecio}</Text>
                <Text style={styles.codigo}>Codigo {item.id}</Text>
              </View>
              <View style={styles.BotonesItem} >
                <TouchableOpacity onPress={() => handleClienteInfoClick(item)} disabled={isButtonDisabled}> 
                  <View style={styles.BotonItem}>
                    <Icon name="info" size={30} color="#c9eefa" />
                  </View>
                </TouchableOpacity>
        
                <TouchableOpacity onPress={() => handleClientClick(item)}>
                  <View style={styles.BotonItem}>
                    <Icon name="cart-plus" size={30} color="#c9eefa" />
                  </View> 
                </TouchableOpacity>
                
              </View>
            </View>
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
  item: {
    display :'flex',
    flexDirection: 'row', 

    // alignItems: "center",
    borderBottomWidth: 1,
    
    borderBottomColor: 'black',
    paddingVertical: 10,
  },
  BotonesItem: {
    width: "40%",
    flexDirection: 'row', 
    justifyContent: "space-around",
    paddingHorizontal: 0,
  },
  BotonItem: {
    width: 50,
    backgroundColor: "#0c2f3c",
    borderWidth: 1,
    // justifyContent: "center",
    // alignContent:"center",
    alignItems:"center",
    borderColor: '#2223ff10',
    borderRadius: 50,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal:10,
  },
  clienteItem: {
    width: "60%",
    // display :'flex',
    // flexDirection: 'row',  
    // alignItems: 'center',
    borderBottomWidth: 0,
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