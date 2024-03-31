import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Searchbar } from 'react-native-paper';
import { getArticulosFiltrados } from '../database/controllers/Articulos.Controller';
import { cantidadCargados} from '../src/components/AddArticulo';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { obtenerPreventaDeStorage} from "../src/utils/storageUtils";



const Articulos = ({ route }) => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { params } = route;
  const preventaNumero = params.numeroPreventa; /*solo el numero de la preventa, va a estar en el local storage*/
  console.log('ART14 linea en la preventa numroº ', preventaNumero, params);
  const [search, setSearch] = useState('naran');
  const [articulosList, setArticulosList] = useState([]); /*necesita estar en un estado?*/
  const [filteredArticulos, setFilteredArticulos] = useState([]);
  // const [articulosEnPreventa, setArticulosEnPreventa] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setArticulosList(await filtrarAgregarCantidadEnPreventa(search));
        setLoading(false);
        // console.log( filteredArticulos.length, 'artículos filtrados con: ',search, filteredArticulos[0], articulosList[1]);
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
  }, [search, isFocused]);
 
  const filtrarAgregarCantidadEnPreventa = async (search) => {
    // const preventaActual = await obtenerPreventaDeStorage();
    const filteredArticulosBDD = await getArticulosFiltrados(search);
  
    const filteredArticulosConCantidad = await Promise.all(
      filteredArticulosBDD.map(async (element) => {
        const cantidad = await cantidadCargados(element.id);
        element.seleccionados = cantidad;
        return element;
      })
    );
    return filteredArticulosConCantidad;
  };

  const openModal = (articulo) => {
    console.log("articulo ",articulo);
    navigation.navigate('AddArticulo', { articulo });
  };
 
  const renderItem = ({ item }) => {
    return(
    <TouchableOpacity onPress={() => openModal(item)}>
      <View style={styles.articuloItem}>
        <View  style={styles.articuloItemLinea}>
          <Text style={styles.articuloInfo}>{item.id} - {item.descripcion}</Text>
        </View>
        <View style={styles.articuloItemLinea}>
          <Text style={styles.articuloInfo}>Stock: {item.existencia}</Text>
          <Text style={styles.articuloInfo}>
            Precio: ${item.precio.toFixed(2)}
          </Text>
          <View style= {{ width: "10%",
                        borderWidth: 0 ,
                        flexDirection: 'row', // Hijos en columna vertical
                        alignItems: 'flex-end', // Alinear hijos a la izquierda
                      }}>
            <Text style={styles.check}>{item.seleccionados !== 0? "✓": ""}</Text>
           </View>
        </View>
      </View>
    </TouchableOpacity>
  )};

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
      <View style={styles.viewTitle}> 
        <Text style={styles.title}> Elegir articulos </Text>
      </View>
      <Searchbar
        placeholder="Buscar artículo..."
        onChangeText={(value) => setSearch(value)}
        value={search}
      />
      <Text> Resultados: {loading ? '...' : articulosList.length}</Text>
      <View style={styles.itemsContainer} >
      {loading ?  <ActivityIndicator size="large" color="#0000ff" /> : <RenderList/>}
      </View>
  
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 2,
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
  check: {
    fontSize: 24, // Tamaño del check
    color: 'green', // Color del check
  },
  articuloItem: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderBottomColor: 'gray',
    paddingVertical: 0,
  },
  articuloItemLinea: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 10,
  },
  articuloInfo: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsContainer: {
    flex: 1,
    padding: 2,
    paddingTop: 20,
    margin: 2,
    marginTop: -22,
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

export default Articulos;
