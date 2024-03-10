import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Searchbar } from 'react-native-paper';
import { getArticulos } from '../database/controllers/Articulos.Controller';
import AddArticulo from '../src/components/AddArticulo';
import { useNavigation } from '@react-navigation/native';
import { obtenerPreventa, guardarPreventa } from "../src/utils/storageUtils";

const Articulos = ({ route }) => {
  const navigation = useNavigation();
  const { params } = route;
  const preventaNumero = params.numeroPreventa;
  console.log('ART14 linea en la preventa numroº ', preventaNumero, params);
  const [search, setSearch] = useState('');
  const [articulosList, setArticulosList] = useState([]);
  const [filteredArticulos, setFilteredArticulos] = useState([]);
  const [articulosEnPreventa, setArticulosEnPreventa] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticulo, setSelectedArticulo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const seleccionados = await obtenerPreventa();
        const articulosFromDB = await getArticulos();
        const codigosSeleccionados = seleccionados.map((item) => item.id);
        console.log("seleccionados ", codigosSeleccionados);
        setArticulosEnPreventa(codigosSeleccionados);
        console.log("leng articulos", articulosFromDB.length);
        setFilteredArticulos(articulosFromDB);
        setArticulosList(articulosFromDB);
      } catch (error) {
        console.error('Error al obtener o insertar articulos: ', error);
      }
    };
    
    fetchData();
  }, []);
  
  const handleBuscar = (text) =>{
    let filtered = [...articulosList]; // Copia de la lista de artículos
    setSearch(text);
    if (articulosList.length > 0) {
      console.log("filtro por ..." , text.toLowerCase(), "articulos :", articulosList.length);
      filtered = articulosList.filter(
        (articulo) =>
         articulo.id.toLowerCase().includes(text.toLowerCase()) ||
         articulo.descripcion.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredArticulos(filtered);
    }
  };

  const handleCheck = (codigo) => {
    console.log(`Artículo ${codigo} marcado/desmarcado para la preventa ${preventaNumero}`);
  };

  const openModal = (articulo) => {
    // setSelectedArticulo(articulo);
    // setModalVisible(true);
    navigation.navigate('AddArticulo', { articulo });
  };

  const estaElegido = (itemId) => {
    return articulosEnPreventa.includes(itemId);
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
          <Icon
            name="check"
            size={20}
            color={estaElegido(item.id) ? 'blue' : '#fff'}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar artículo..."
        onChangeText={(value) => handleBuscar(value)}
        value={search}
        onIconPress={() => setFilteredArticulos([])}
        onSubmitEditing={() => setFilteredArticulos([])}
      />
      <FlatList 
        data={filteredArticulos} 
        keyExtractor={(item) => item.id} 
        renderItem={renderItem}  
        maxToRenderPerBatch={10} 
        // getItemLayout={40}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <AddArticulo
            articulo={selectedArticulo}
            closeModal={() => setModalVisible(false)}
            guardarPreventa={guardarPreventa}
            obtenerPreventa={obtenerPreventa}
          />
        </View>
      </Modal>
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