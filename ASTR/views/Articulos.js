import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Searchbar } from 'react-native-paper';
import { getArticulos } from '../database/controllers/Articulos.Controler';
import AddArticulo from '../src/components/AddArticulo';
// import { guardarPreventa, obtenerPreventa, limpiarPreventa } from "../src/utils/storageUtils";
import { useNavigation } from '@react-navigation/native';
import { obtenerPreventa, guardarPreventa, limpiarPreventa } from "../src/utils/storageUtils"; //manejo del local storage

const Articulos = ({ route }) => {
  const navigation = useNavigation();
  const { params } = route;
  const preventaNumero = params.numeroPreventa;
  console.log('ART14 en la preventa nº ', preventaNumero, params);
  const [search, setSearch] = useState('');
  const [articulosList, setArticulosList] = useState([]);
  const [filteredArticulos, setFilteredArticulos] = useState(articulosList);
  const [articulosEnPreventa, setArticulosEnPreventa] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticulo, setSelectedArticulo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const seleccionados = await obtenerPreventa();
        const articulosFromDB = await getArticulos();
        let codigosSeleccionados = seleccionados.map((e)=>{
          return e.id;
        })
        console.log("seleccionados ",codigosSeleccionados);
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
    let filtered = articulosList;
    setSearch(text)
    if (articulosList.length > 0 ) {
      console.log("filtro por ..." , text.toLowerCase(), "articulos :", articulosList.length);
      filtered = articulosList.filter(
        (articulo) =>
         articulo.id.toLowerCase().includes(text.toLowerCase()) ||
         articulo.descripcion.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredArticulos(filtered)
    }
  }

  const handleCheck = (codigo) => {
    console.log(`Artículo ${codigo} marcado/desmarcado para la preventa ${preventaNumero}`);
  };

  const openModal = (articulo) => {
    // setSelectedArticulo(articulo);
    // setModalVisible(true);
    navigation.navigate('AddArticulo', { articulo });
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedArticulo(null);
  };

  const estaElegido = (item) => {
    if (articulosEnPreventa.includes(item)) {
      console.log("MATCH", item);
      return true
    }
    return false
    // articulosEnPreventa.includes(item)
  }
 
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item, preventaNumero)}>
      <View style={styles.articuloItem}>
        <Text style={styles.articuloInfo}>{item.id}</Text>
        <Text style={styles.articuloInfo}>{item.descripcion}</Text>
        <Text style={styles.articuloInfo}>Stock: {item.existencia}</Text>
        <Text style={styles.articuloInfo}>
          Precio: ${(item.precioCostoMasImp * (1 + item.lista1 / 100)).toFixed(2)}
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
      <FlatList data={filteredArticulos} keyExtractor={(item) => item.id} renderItem={renderItem}  maxToRenderPerBatch={10} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <AddArticulo
            articulo={selectedArticulo}
            closeModal={closeModal}
            guardarPreventa={guardarPreventa}
            obtenerPreventa={obtenerPreventa}
            limpiarPreventa={limpiarPreventa}
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

