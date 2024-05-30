import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text, FlatList, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { getArticulosFiltrados } from '../database/controllers/Articulos.Controller';
import { cantidadYDescuentoCargados, cantidadCargado, descuentoCargado } from '../src/components/AddArticulo';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { configuracionCantidadMaximaArticulos } from '../src/utils/storageConfigData';
import { obtenerPreventaDeStorage } from '../src/utils/storageUtils';

const Articulos = ({ route }) => {
  const [mostrarFrecuentes, setMostrasFrecuentes] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { params } = route;
  const preventaNumero = params.numeroPreventa; /*solo el numero de la preventa, va a estar en el local storage*/
  const cliente =params.cliente; //solo el codigo del cliente
  const listaDePrecios =params.listaDePrecio; //solo la lista
  const articulosFrecuentes = params.articulosFrecuentes;
  const hasInternetAccess = params.hasInternetAccess;
  console.log('ART20 linea en la preventa numroº  frecuentes',articulosFrecuentes.length);
  const [search, setSearch] = useState('');
  
  const [articulosList, setArticulosList] = useState([]); /*necesita estar en un estado?*/
  const [filteredArticulosConCantidad, setFilteredArticulosConCantidad] =useState([]);
  const [filtredArticulos, setFilteredArticulos] = useState([]);
  //const [articulosEnPreventa, setArticulosEnPreventa] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  var buscoDesde = 2;
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // console.log("esta cargando fethchdata, frecuentes? " ,mostrarFrecuentes);
        setArticulosList(await buscarAdaptarFiltrar(search));
        setLoading(false);
        // console.log( filteredArticulos.length, 'artículos filtrados con: ',search, filteredArticulos[0], articulosList[1]);
      } catch (error) {
        // console.error('Error al obtener artículos filtrados: ', error);
        setLoading(false);
      }
    };
    // console.log("entre a articulos y quiero cargar");
    if ((mostrarFrecuentes) && (search.length > buscoDesde-1)) {
        fetchData();
    }else{
      if (search.length > buscoDesde) { /* no hago busquedas hasta tener 2 letras */
        fetchData();
      }else{
        setArticulosList([]);
      }
    }
    
  }, [search, isFocused, mostrarFrecuentes]);
  
  /*para quitar campos innecesarios*/
  const buscarAdaptarFiltrar = async (search) =>{
    
    const obtenerPrecio = async (articulo)=>{
      // console.log("AR61 lista", listaDePrecios ,"articulo", articulo);
      let costo = articulo.precioCosto;
      let iva = articulo.iva;
      let costoIva = costo * (1+ iva/100);
      let ganancia = 0;
      switch (listaDePrecios) {
        case "1":
          ganancia = articulo.lista1;
          return (costoIva * (1 + ganancia /100)) 
        case "2":
          ganancia = articulo.lista2;
          return (costoIva * (1 + ganancia /100)) 
        case "3":
          ganancia = articulo.lista3;
          return (costoIva * (1 + ganancia /100)) 
        case "4":
          ganancia = articulo.lista4;
          return (costoIva * (1 + ganancia /100)) 
        case "5":
          ganancia = articulo.lista5;
          return (costoIva * (1 + ganancia /100)) 
          break;
        default:
          return 0;
          // código a ejecutar si la expresión no coincide con ningún valor
      }
    }

    const filtrarBusqueda = async (articulos) =>{
      if (mostrarFrecuentes) {
        return articulos.filter(element => element.frecuente === true);
      }
      return articulos;
    }
    
    // console.log("a buscar a bucar", searchOld, search)
    //paso 1 traer articulos de la BDD
    //paso 2 agregar cantidad y descuento en preventa actual y si es frecuente
    //paso 3 filtrar segun configuracion

      //paso 1
      const filteredArticulosBDD = await getArticulosFiltrados(search);
      // console.log("encontrados filtrando ", filteredArticulosBDD[1]);
      //paso 2 agregar cantidad y descuento en preventa actual y si es frecuente
      let filteredArticulos = await Promise.all(
        filteredArticulosBDD.map(async (element) => {
          // const cantidadYDescuento = await cantidadYDescuentoCargados(element.id);
          const cantidad = await cantidadCargado(element.id);
          const descuento = await descuentoCargado(element.id);
          const frecuente = articulosFrecuentes?.includes(element.id);
          const precio = await obtenerPrecio(element);
          // console.log("precio", precio); //depende de la lista del cliente
          if (frecuente) {
            // console.log("es frecuente ",element.descripcion);
          }
          element.seleccionados = cantidad;
          element.descuento = descuento;
          element.frecuente = frecuente;
          element.precio = precio;
          // console.log("articulos filtrados ",element.descripcion, "cant", cantidad);
          return element;
        })
      )
      
      // console.log("encontrados 2 ", filteredArticulos.length);
      // setFilteredArticulosConCantidad ( filteredArticulos );
    // }
    //paso 3
    return await filtrarBusqueda(filteredArticulos);
  }

  
  const openModal = async (articulo) => {
    // let datos = await cantidadYDescuentoCargados(articulo.id)
    // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAarticulo ",datos);
    let cantidad = await configuracionCantidadMaximaArticulos();
    const carrito = await obtenerPreventaDeStorage();
    // console.log("CANTIDAD ", cantidad, carrito.length);
  
    if (carrito.length >= cantidad) {
      Alert.alert(
        "Límite de artículos alcanzado",
        `Se ha superado la cantidad máxima de ${cantidad} artículos permitidos.`,
        [
          {
            text: "Aceptar",
            onPress: () => console.log("Aceptar presionado"),
            style: "cancel"
          }
        ]
      );}else{
        console.log("art 153 ",articulo);
        navigation.navigate('AddArticulo', { articulo });
      }
  };
  
  const renderItem = ({ item }) => {
    // console.log("item", item);
    return(
    <TouchableOpacity onPress={() => openModal(item)}>
      <View style={styles.articuloItem}>
        <View  style={styles.articuloItemLinea}>
          <Text style={styles.articuloInfo}>{item.id} - {item.descripcion}</Text>
        </View>
        <View style={styles.articuloItemLinea}>
          <Text style={styles.articuloInfo}>Stock: {item.existencia}</Text>
          <Text style={styles.articuloInfo}>
            {/* Precio s/iva: ${(item?.precio / (1+(item.iva /100))) .toFixed(2) } */}
            Precio c/iva: ${item?.precio?.toFixed(2)}
          </Text>
          <Text style={styles.articuloInfo}>
            iva: {item?.iva}
          </Text>
          <View style= {{ width: "15%",
                        borderWidth: 0 ,
                        flexDirection: 'row', // Hijos en columna vertical
                        alignItems: 'flex-end', // Alinear hijos a la izquierda
                      }}>
            <Text style={styles.check}>{item.frecuente? "F": ""}</Text>
            <Text style={styles.check}>{item.seleccionados !== 0? `${item.seleccionados}  ✓` : ""}</Text> 
            {/* <Text style={styles.check}>{item.seleccionados}</Text> */}
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
        value={search}
        onChangeText={(value) => setSearch(value)}
        onIconPress={(value) => setSearch(value)}
      />
      <View style={{ backgroundColor:"#c9eefa", flexDirection: 'row', alignItems:"center", justifyContent: "space-between", margin: 4, borderBottomColor: "grey", borderBottomWidth:2 }} >
        <Text style={styles.subInfoText}> Resultados: {loading ? '...' : articulosList.length}    Lista: {listaDePrecios}</Text> 
        {hasInternetAccess && (
        <View style={[styles.barraFrecuentes, {alignItems: 'center'}]}>
          <Text >Ver frecuentes</Text>
          <Switch value={mostrarFrecuentes} onValueChange={() => setMostrasFrecuentes(!mostrarFrecuentes)} />
        </View>
        )}
      </View>
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
    color:'black',
    // border: 14,
    // margin:14,
    // backgroundColor: '#06181e',
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
    fontSize: 16, // Tamaño del check
    color: '#1229f7', // Color del check
    fontWeight: "bold",
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
  barraFrecuentes: {
    flex: 1,
    justifyContent:"flex-end",
    alignContent:"center",
    flexDirection: 'row',
    // marginRight: 10,
  },
});

export default Articulos ;
