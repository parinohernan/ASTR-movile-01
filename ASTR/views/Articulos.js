import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { articulos } from '../assets/dataArticulos';
import { prefacturas } from '../assets/data';
import { Searchbar } from 'react-native-paper';

// Importa el componente AddArticulo
import AddArticulo from '../components/AddArticulo';

const Articulos = ({ prefacturaNumero }) => {
  const [search, setSearch] = useState('');
  const [filteredArticulos, setFilteredArticulos] = useState(articulosList);
  const [articulosList, setArticulosList] = useState([]);
  const [articulosEnPrefactura, setArticulosEnPrefactura] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticulo, setSelectedArticulo] = useState(null);

  useEffect(() => {
    // Cargar la lista de artículos y artículos en la prefactura (simulación)
    setArticulosList(articulos);
    const prefactura = prefacturas.find((factura) => factura.numero === prefacturaNumero);
    if (prefactura) {
      setArticulosEnPrefactura(prefactura.items.map((item) => item.codigo));
    }
  }, [prefacturaNumero]);

  useEffect(() => {
    // Filtrar la lista de artículos cada vez que cambie la búsqueda
    const filtered = articulosList.filter(
      (articulo) =>
        articulo.codigo.toString().includes(search.toLowerCase()) ||
        articulo.descripcion.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredArticulos(filtered);
  }, [search, articulosList]);

  const handleCheck = (codigo) => {
    // Lógica para marcar/desmarcar el artículo con el código proporcionado en la preventa
    // Esto dependerá de cómo estés gestionando los datos de la preventa
    console.log(`Artículo ${codigo} marcado/desmarcado para la preventa ${prefacturaNumero}`);
  };

  const openModal = (articulo) => {
    // Establecer el artículo seleccionado y mostrar el modal
    setSelectedArticulo(articulo);
    setModalVisible(true);
  };

  const closeModal = () => {
    // Cerrar el modal y restablecer el artículo seleccionado
    setModalVisible(false);
    setSelectedArticulo(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)}>
      <View style={styles.articuloItem}>
        <Text style={styles.articuloInfo}>{item.codigo}</Text>
        <Text style={styles.articuloInfo}>{item.descripcion}</Text>
        <Text style={styles.articuloInfo}>Stock: {item.existencia}</Text>
        <Text style={styles.articuloInfo}>
          Precio: ${item.PrecioCostoMasImp * (1 + item.Lista1 / 100)}
        </Text>
        <TouchableOpacity onPress={() => handleCheck(item.codigo)}>
          <Icon
            name="check"
            size={20}
            color={articulosEnPrefactura.includes(item.codigo) ? 'blue' : 'whithe'}
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
        keyExtractor={(item) => item.codigo.toString()}
        renderItem={renderItem}
      />

      {/* Modal para agregar artículo */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <AddArticulo
            articulo={selectedArticulo}
            closeModal={closeModal}
            prefacturaNumero={prefacturaNumero}
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

