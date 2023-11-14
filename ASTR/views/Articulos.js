import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { articulos } from '../assets/dataArticulos';
import { prefacturas } from '../assets/data';
import { Searchbar } from 'react-native-paper';

const Articulos = ({ prefacturaNumero }) => {
  const [search, setSearch] = useState('');
  const [filteredArticulos, setFilteredArticulos] = useState(articulosList);
  const [articulosList, setArticulosList] = useState([]);
  const [articulosEnPrefactura, setArticulosEnPrefactura] = useState([]);

  useEffect(() => {
    // Cargar la lista de artículos y artículos en la prefactura (simulación)
    setArticulosList(articulos);
    const prefactura = prefacturas.find((factura) => factura.numero === prefacturaNumero);
    if (prefactura) {
      setArticulosEnPrefactura(prefactura.items.map((item) => item.codigo));
    }
  }, [prefacturaNumero]);

  const handleSearch = () => {
    const filtered = articulosList.filter( 
      (articulo) =>
        articulo.codigo.toString().includes(search.toLowerCase()) ||
        articulo.descripcion.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredArticulos(filtered);
  };

  const handleCheck = (codigo) => {
    // Lógica para marcar/desmarcar el artículo con el código proporcionado en la preventa
    // Esto dependerá de cómo estés gestionando los datos de la preventa
    console.log(`Artículo ${codigo} marcado/desmarcado para la preventa ${prefacturaNumero}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.articuloItem}>
      <Text style={styles.articuloInfo}>{item.codigo}</Text>
      <Text style={styles.articuloInfo}>{item.descripcion}</Text>
      <Text style={styles.articuloInfo}>Stock: {item.existencia}</Text>
      <Text style={styles.articuloInfo}>Precio: ${item.PrecioCostoMasImp * (1 + item.Lista1 / 100)}</Text>
      <TouchableOpacity onPress={() => handleCheck(item.codigo)}>
        <Icon
          name="check"
          size={20}
          color={articulosEnPrefactura.includes(item.codigo) ? 'blue' : 'gray'}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <TextInput
        style={styles.searchbar}
        placeholder="Buscar artículo..."
        value={search}
        onChangeText={(text) => setSearch(text)}
      /> */}
      {/* <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Icon name="search" size={20} color="#000" />
      </TouchableOpacity> */}
      <Searchbar
      placeholder="Busqcar articulo..."
      onChangeText={value => setSearch(value)}
      value={search}
      onIconPress={handleSearch}
      onSubmitEditing={handleSearch}
    />
      <FlatList
        data={filteredArticulos}
        keyExtractor={(item) => item.codigo.toString()}
        renderItem={renderItem}
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
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  searchButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 10,
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
});

export default Articulos;

