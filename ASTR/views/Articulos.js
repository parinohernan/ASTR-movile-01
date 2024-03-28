import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Searchbar } from 'react-native-paper';
import { getArticulosFiltrados } from '../database/controllers/Articulos.Controller';
import { cantidadCargados} from '../src/components/AddArticulo';
import { useNavigation } from '@react-navigation/native';
import { obtenerPreventaDeStorage} from "../src/utils/storageUtils";



const Articulos = ({ route }) => {
  const navigation = useNavigation();
  const { params } = route;
  const preventaNumero = params.numeroPreventa; /*solo el numero de la preventa, va a estar en el local storage*/
  console.log('ART14 linea en la preventa numroº ', preventaNumero, params);
  const [search, setSearch] = useState('naran');
  const [articulosList, setArticulosList] = useState([]); /*necesita estar en un estado?*/
  const [filteredArticulos, setFilteredArticulos] = useState([]);
  // const [articulosEnPreventa, setArticulosEnPreventa] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [fuiAAdd, setFuiAAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const filteredArticulos = await filtrarAgregarCantidadEnPreventa(search);
        setArticulosList(filteredArticulos);
        setLoading(false);
        console.log( filteredArticulos.length, 'artículos filtrados con: ',search);
      } catch (error) {
        console.error('Error al obtener artículos filtrados: ', error);
        setLoading(false);
      }
    };
    
    if (search.length > 2) { /* no hago busquedas hasta tenes 2 letras */
      fetchData();
    }else{
      setArticulosList([]);
    }
  }, [search]);

  useEffect(() => {
    if (fuiAAdd) {
      console.log("FUI FUI");
      filtrarAgregarCantidadEnPreventa(search)
    }
  }, [fuiAAdd]);
  
  const filtrarAgregarCantidadEnPreventa = async (search) => {
    const preventaActual = await obtenerPreventaDeStorage();
    const filteredArticulosBDD = await getArticulosFiltrados(search);
    // console.log("un item 5",filteredArticulosBDD[3]);
    const filteredArticulosConCantidad =  filteredArticulosBDD.map(async(element) => {
      const cantidad= await cantidadCargados(element.id);
      // console.log(element,"seleccionados ", cantidad);
      element.seleccionados = cantidad;
      return element;
    });
    return filteredArticulosBDD;
  };

  const openModal = (articulo) => {
    console.log("articulo ",articulo);
    navigation.navigate('AddArticulo', { articulo , setFuiAAdd});
  };
 
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)}>
      <View style={styles.articuloItem}>
        <Text style={styles.articuloInfo}>{item.id}</Text>
        <Text style={styles.articuloInfo}>{item.descripcion}</Text>
        <Text style={styles.articuloInfo}>Stock: {item.existencia}</Text>
        <Text style={styles.articuloInfo}>
          Precio: ${item.precio.toFixed(2)}
        </Text>
        <Text style={styles.check}>{item.seleccionados !== 0? "✓": ""}</Text>
      </View>
    </TouchableOpacity>
  );

  const RenderList = () => (
      <FlatList 
        data={articulosList} 
        // keyExtractor={(item) => item.id} 
        keyExtractor={(item, index) => item.id ? item.id : index.toString()} 
        renderItem={renderItem}  
        maxToRenderPerBatch={20} 
      />
  )

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar artículo..."
        onChangeText={(value) => setSearch(value)}
        value={search}
      />
      <Text> Resultados: {loading ? '...' : articulosList.length}</Text>
      {/* {loading? (<Text>Cargando...<Text/>):( */}

      <View>
      {loading ?  <ActivityIndicator size="large" color="#0000ff" /> : <RenderList/>}
      </View>
  
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FAF7E6',
  },
  check: {
    fontSize: 24, // Tamaño del check
    color: 'green', // Color del check
  },
  articuloItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    paddingVertical: 10,
  },
  articuloInfo: {
    flex: 1,
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Articulos;
