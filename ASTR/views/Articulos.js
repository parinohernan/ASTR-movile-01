import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Searchbar } from 'react-native-paper';
import { getArticulosFiltrados } from '../database/controllers/Articulos.Controller';
import { cantidadCargados} from '../src/components/AddArticulo';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { obtenerPreventaDeStorage} from "../src/utils/storageUtils";
// import { getArticulosFrecuentesDesdeAPI } from '../handlers/actualizarApp';



const Articulos = ({ route }) => {
  const [mostrarFrecuentes, setMostrasFrecuentes] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { params } = route;
  const preventaNumero = params.numeroPreventa; /*solo el numero de la preventa, va a estar en el local storage*/
  const cliente =params.cliente;
  const articulosFrecuentes = params.articulosFrecuentes;
  console.log('ART18 linea en la preventa numroº ', preventaNumero, "cliente: ", cliente, "frecuentes ",mostrarFrecuentes);
  const [search, setSearch] = useState('marol');
  const [searchOld, setSearchOld] = useState('');
  const [articulosList, setArticulosList] = useState([]); /*necesita estar en un estado?*/
  const [filtredArticulos, setFilteredArticulos] = useState([]);
  //const [articulosEnPreventa, setArticulosEnPreventa] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  var buscoDesde = 2;
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("esta cargando fethchdata, frecuentes? " ,mostrarFrecuentes);
        setArticulosList(await filtrarAgregarCantidadEnPreventa(search));
        setLoading(false);
        // console.log( filteredArticulos.length, 'artículos filtrados con: ',search, filteredArticulos[0], articulosList[1]);
      } catch (error) {
        console.error('Error al obtener artículos filtrados: ', error);
        setLoading(false);
      }
    };
    if (mostrarFrecuentes) {
        fetchData();
    }else{
      if (search.length > buscoDesde) { /* no hago busquedas hasta tener 2 letras */
        fetchData();
      }else{
        setArticulosList([]);
      }
    }
    
  }, [search, isFocused, mostrarFrecuentes]);
 
  const filtrarAgregarCantidadEnPreventa = async (search) => {
    // esto es para cuando edito un item, pero lo estoy reutilizando para mostrar los frecuentes
    // const preventaActual = await obtenerPreventaDeStorage();
    let filteredArticulosConCantidad = articulosList;
    
    // if (search.includes(searchOld) && searchOld !== "" ) {
    //   console.log("ahorro cargar con getArticulosFiltrados y uso lista anterior", searchOld, search);
    //   filteredArticulosConCantidad = filteredArticulosConCantidad.filter(element => element.descripcion.includes(search));
    // } else {
      console.log("a buscar a bucar", searchOld, search)
      setSearchOld(search);
      const filteredArticulosBDD = await getArticulosFiltrados(search);
      // let articulosFrecuentes = await getArticulosFrecuentesDesdeAPI(cliente);
      // console.log("frecuentesd desde ART59 ",articulosFrecuentes);
      filteredArticulosConCantidad = await Promise.all(
        filteredArticulosBDD.map(async (element) => {
          const cantidad = await cantidadCargados(element.id);
          const frecuente = articulosFrecuentes.includes(element.id)
          element.seleccionados = cantidad;
          element.frecuente = frecuente;
          return element;
        })
      );
    // }
    if (mostrarFrecuentes) {
      return filteredArticulosConCantidad.filter(element => element.frecuente === true);
    }
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
            Precio: ${item?.precio?.toFixed(2)}
          </Text>
          {/* <View style= {{ width: "10%",
                        borderWidth: 0 ,
                        flexDirection: 'row', // Hijos en columna vertical
                        alignItems: 'flex-end', // Alinear hijos a la izquierda
                      }}>
           </View> */}
          <View style= {{ width: "10%",
                        borderWidth: 0 ,
                        flexDirection: 'row', // Hijos en columna vertical
                        alignItems: 'flex-end', // Alinear hijos a la izquierda
                      }}>
            <Text style={styles.check}>{item.frecuente? "F": ""}</Text>
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
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: -50 }} >
        <Text style={styles.subInfoText}>Mostrar articulos frecuentes</Text>
        <Switch value={mostrarFrecuentes} onValueChange={() => setMostrasFrecuentes(!mostrarFrecuentes)} />
      </View>
      <View style={styles.viewTitle}> 
        <Text style={styles.title}> Elegir articulos </Text>
      </View>
      <Searchbar
        placeholder="Buscar artículo..."
        value={search}
        onChangeText={(value) => setSearch(value)}
        onIconPress={(value) => setSearch(value)}
      />
      <Text style={styles.subInfoText}> Resultados: {loading ? '...' : articulosList.length} ingrese al menos 3 letras</Text>
      <View style={styles.itemsContainer} >
      {loading ?  <ActivityIndicator size="large" color="#0000ff" /> : ((articulosList.length > 0)? <RenderList/> : "")}
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
  subInfoText: {
    color:'cyan',
    padding: 4,
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
    borderWidth: 0,
    borderBottomWidth:1,
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
