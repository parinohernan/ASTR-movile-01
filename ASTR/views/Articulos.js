import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
// import { preventas } from '../assets/data';
import { Searchbar } from 'react-native-paper';
import { getArticulos } from '../database/controllers/Articulos.Controler';
import AddArticulo from '../components/AddArticulo';

const Articulos = ({route}) => {
  const {params} = route;
  const preventaNumero = params.numeroPreventa;
  console.log('ART12 en la preventa nº ', preventaNumero,params);
  const [search, setSearch] = useState('');
  const [filteredArticulos, setFilteredArticulos] = useState(articulosList);
  const [articulosList, setArticulosList] = useState([]);
  const [articulosEnPreventa, setArticulosEnPreventa] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticulo, setSelectedArticulo] = useState(null);

  useEffect(() => {
   
    const fetchData = async () => {
      
      try {
        const articulosFromDB = await getArticulos();
        setArticulosList(articulosFromDB);
      } catch (error) {
        console.error('Error al obtener o insertar articulos: ', error);
      }
    };

    fetchData();
  }, [preventaNumero]);
  

  useEffect(() => {
    // Filtrar la lista de artículos cada vez que cambie la búsqueda
    if (articulosList.length> 0) {
      
      const filtered = articulosList.filter(
        (articulo) =>
        articulo.id.toLowerCase().includes(search.toLowerCase()) ||
        articulo.descripcion.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredArticulos(filtered);
      }else{
        setFilteredArticulos(articulosList);
      }
  }, [search, articulosList]);

  const handleCheck = (codigo) => {
    // Lógica para marcar/desmarcar el artículo con el código proporcionado en la preventa
    console.log(`Artículo ${codigo} marcado/desmarcado para la preventa ${preventaNumero}`);
  };

  const openModal = (articulo,numero) => {
    // Establecer el artículo seleccionado y mostrar el modal
    console.log("articulo",articulo.descripcion);
    console.log("preventa",numero);
    setSelectedArticulo(articulo);
    setModalVisible(true);
  };

  const closeModal = () => {
    // Cerrar el modal y restablecer el artículo seleccionado
    setModalVisible(false);
    setSelectedArticulo(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item,preventaNumero)}>
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
            color={articulosEnPreventa.includes(item.id) ? 'blue' : '#fff'}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar artículo..."
        onChangeText={(value) => setSearch(value)}
        value={search}
        onIconPress={() => setFilteredArticulos([])} // Limpiar la lista al presionar la lupa
        onSubmitEditing={() => setFilteredArticulos([])} // Limpiar la lista al confirmar la búsqueda
      />
      <FlatList
        data={filteredArticulos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      {/* Modal para agregar artículo */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <AddArticulo
            articulo={selectedArticulo}
            closeModal={closeModal}
            preventaNumero= {preventaNumero}
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

