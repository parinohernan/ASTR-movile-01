import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Searchbar } from 'react-native-paper';
import { getArticulosFiltrados } from '../database/controllers/Articulos.Controller';
import AddArticulo from '../src/components/AddArticulo';
import { useNavigation } from '@react-navigation/native';
import { obtenerPreventa, guardarPreventa } from "../src/utils/storageUtils";



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
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const filteredArticulos = await getArticulosFiltrados(search);
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
  
  const handleCheck = (codigo) => {
    console.log(`Artículo ${codigo} marcado/desmarcado para la preventa ${preventaNumero}`);
  };

  const openModal = (articulo) => {
    console.log("articulo ",articulo); 
    navigation.navigate('AddArticulo', { articulo });
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
        <TouchableOpacity onPress={() => handleCheck(item.id)}>
          {/* <Icon
            name="check"
            size={20}
            color={estaElegido(item.id) ? 'blue' : '#fff'}
          /> */}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const RenderList = () => (
      <FlatList 
        data={articulosList} 
        keyExtractor={(item) => item.id} 
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
