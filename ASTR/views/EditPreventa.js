import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput,Modal, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useIsFocused, useFocusEffect} from '@react-navigation/native';
import { obtenerPreventaDeStorage, preventaDesdeBDD, calcularTotal, limpiarPreventaDeStorage, eliminarItemEnPreventaEnStorage } from "../src/utils/storageUtils";
import { grabarPreventaEnBDD } from '../database/controllers/Preventa.Controller';
import { getClientes } from '../database/controllers/Clientes.Controller';
import { nextPreventa, configuracionCantidadMaximaArticulos, configuracionEndPoint  } from '../src/utils/storageConfigData';
import { getArticulosFrecuentesDesdeAPI } from '../handlers/actualizarApp';
import { ModalEliminarEditarCancelar } from '../src/components/preventa/Modal';
import axios from 'axios';
import { AddArticulo } from '../src/components/AddArticulo';
import { getArticuloPorCodigo } from '../database/controllers/Articulos.Controller';
import { borrarPreventaYSusItems } from '../database/controllers/Preventa.Controller';

// import { Fontisto } from '@expo/vector-icons';

const EditPreventa = (props) => {
  useFocusEffect(
    React.useCallback(() => {
      const handleBeforeRemove = async (e) => {
        e.preventDefault();
  
        try {
          // Aquí la lógica para verificar si hay una preventa sin grabar
          // y preguntar al usuario si quiere guardar o descartar los cambios
          const carrito2 = await obtenerPreventaDeStorage();
          if (carrito2.length > 0) {
            e.preventDefault();
            Alert.alert(
              'No guardaste la preventa',
              '¿Quieres guardar los cambios antes de salir?',
              [
                { text: 'Descartar preventa', style: 'destructive', onPress: () => {limpiarPreventaDeStorage(); navigation.goBack() }},
                // { text: 'Guardar', style: 'default', onPress: () => grabarPreventa() },
                { text: 'Volver a preventa', style: 'cancel', onPress: () => {} },
              ]
            );
          } else {
            // Si no hay cambios sin guardar, puedes dejar que el usuario salga
            navigation.dispatch(e.data.action);
          }
        } catch (error) {
          console.error('Error al obtener la preventa:', error);
        }
      };
  
      const unsubscribe = navigation.addListener('beforeRemove', handleBeforeRemove);
  
      return unsubscribe;
    }, [navigation, isModalEditarVisible])
  );

  const isFocused = useIsFocused();
  const {route} = props;
  const {params} = route;
  const {preventaNumero, cliente, edit} = params;
  const navigation = useNavigation();
  const [carrito, setCarrito] = useState([]);
  const [cantidadItems, setCantidadItems] = useState([]);
  const [total, setTotal] = useState();
  const [articulosFrecuentes, setArticulosFrecuentes] = useState([]);
  const [hasInternetAccess, setHasInternetAccess] = useState(false);
  const [estoyBuscandoFrecuentes, setEstoyBuscandoFrecuentes] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalEditarVisible, setIsModalEditarVisible] = useState(false);
  const [nota, setNota] = useState('');
  const [selectedItem, setSelectedItem]= useState();
//   const [listaDePrecios,setListaDePrecios]=useState(cliente?.listaDePrecio);
  const [noCarguePreventa, setNoCarguePreventa]=useState(true);

  const siEstoyEditando = async () => {
    // setNueva(false);
    setNoCarguePreventa(false); //una ves que este en falso ya no voy a entrar a "siEstoyEditando"
    await preventaDesdeBDD(preventaNumero);//busca la preventa en la BDD  y la carga al local storage
    await cargarDatosEditando(); //cargar
    
  }
  
  useEffect(() => {
    const loadData = async () => {
      //tengo que cargar los datos en la storage
        console.log("editando PREVENTA", preventaNumero);
        noCarguePreventa? (
            await siEstoyEditando()
            
        ):(
        //   console.log("Editando pero ya cargue antes al strage")
          cargarDatosEditando()
        )

    };
    const checkInternetAccess = async () => {
      try {
        let endpoint = await configuracionEndPoint()
        const response = await axios.get(endpoint);
        // Si la solicitud se completa con éxito, significa que hay acceso al servidor
        setHasInternetAccess(true);
      } catch (error) {
        // Si ocurre un error, no hay acceso al servidor
        setHasInternetAccess(false);
      }
    };
    // console.log("entro a preventa editando= T nueva =fale ", edit);
    loadData();
    checkInternetAccess();
    console.log("hay internet?", hasInternetAccess);
  }, [isFocused, isModalEditarVisible]);
  
  const cargarDatosEditando = async () => {

    const calcularDescuento = async (elemento) => {
      let itemArray = await getArticuloPorCodigo(elemento.id);
      let articulo = itemArray[0];
      let lista = await obtenerPrecio(articulo);
      articulo.precio = lista;
      let factorDescuento = elemento.precioTotal / (lista * elemento.cantidad);
      let descuento = 0;
      descuento = 100 - (factorDescuento * 100);
      descuento == 0 ? descuento = 0 : descuento = Math.round(descuento * 100) / 100;
      return {descuento: descuento, lista: lista};
    }
  
    const carritoData = await obtenerPreventaDeStorage();
    console.log("prv129 ",carritoData);
    
    if (carritoData.length > 0) {
      const updatedCarritoData = await Promise.all(carritoData.map(async (item) => {
        const {descuento, lista} = await calcularDescuento(item);
        console.log(lista);
        return {
          cantidad: item.cantidad,
          descripcion: item.descripcion,
          id: item.id,
          iva: item.iva,
          precio: item.precioTotal,
          descuento: descuento.toFixed(),
          precioLista: lista,/* lista con iva */
          // precio: ( item.precioTotal / ((100-item.descuento)/100) / item.cantidad ),
          
        };
      }));
      console.log("prv156 ",updatedCarritoData);
      setCarrito(updatedCarritoData);
    }
    setCantidadItems(carritoData.length);
    setTotal(await calcularTotal());
   
  };

//   const cargarDatos = async () => {
    
//     const calcularDescuento = async (elemento) => {
//         let itemArray = await getArticuloPorCodigo(elemento.id);
//         let articulo = itemArray[0];
//         console.log("133prv data",cliente);
//         let lista = await obtenerPrecio(articulo);
//         console.log("134obteniendo precio de ",articulo, lista/*, cliente*/);
//         articulo.precio = lista;
//         let factorDescuento = elemento.precioTotal / (lista * elemento.cantidad);
//         let descuento = 0;
//         descuento = 100 - (factorDescuento * 100);
//         console.info("138 ",descuento,lista);
//         return {descuento: descuento, lista: lista};
//       }
    
//       const carritoData = await obtenerPreventaDeStorage();
//       console.log("prv129 ",carritoData);
      
//       if (carritoData.length > 0) {
//         const updatedCarritoData = await Promise.all(carritoData.map(async (item) => {
//           const {descuento, lista} = await calcularDescuento(item);
//           console.log(lista);
//           return {
//             cantidad: item.cantidad,
//             descripcion: item.descripcion,
//             id: item.id,
//             iva: item.iva,
//             precio: item.precioTotal,
//             descuento: descuento.toFixed(),
//             precioLista: lista,/* lista con iva */
//             // precio: ( item.precioTotal / ((100-item.descuento)/100) / item.cantidad ),
            
//           };
//         }));
//         console.log("prv156 ",updatedCarritoData);
//         setCarrito(updatedCarritoData);
//       }
//       setCantidadItems(carritoData.length);
//       setTotal(await calcularTotal());
//   };

  const grabarPreventa = async () => {
    /* Grabar la preventa en la base de datos requiere cabeza de la preventa y grabar cada item */
    /* todos los errores deben estar controlados */
    if (edit) {
      console.log(  "PRV184   eliminal la preventa antes de guardar ", preventaNumero);
      await borrarPreventaYSusItems(preventaNumero);
    }
    if (carrito.length > 0) {
      let numero = preventaNumero
    //   if (nueva) {
    //   numero = await nextPreventa();
    // }
    await grabarPreventaEnBDD (numero, nota , cliente .id, carrito);
    console.log("preventa guardada con exito  ");
    setCarrito ([]);    
    }
    console.log("preventa estaba vacia  ");
    navigation.goBack();
  };
  
  const abrirModal = () => { //modal de la nota
    setIsModalVisible(true);
    
  };
  
  const cerrarModal = () => { //modal de la nota
    setIsModalVisible(false);
    guardarNota();
    
  };

  const abrirModalEditar = (item) => { //modal de la nota
    setIsModalEditarVisible(true);
    // setSelectedItem (item);
    console.log("prev157", item);
  };
  
  const cerrarModalEditar = () => { //modal de la nota
    setIsModalEditarVisible(false);
    // setSelectedItem ({});    
  };

  const handleDelete = async() =>{ /* borra un item seleccionado, deñ storage */
    if (cantidadItems < 2) {
        console.log("CHAU NO QUIERO ESTA PREVNTA");
        navigation.navigate('Informes', {});
    }
    console.log("borrar ",selectedItem);
    console.info("esta");
    await eliminarItemEnPreventaEnStorage(selectedItem.id);
    setIsModalEditarVisible(false);

  }

  const obtenerPrecio = async (articulo)=>{
    console.log("PREVENT246 lista", cliente.listaPrecio ,"articulo", articulo);
    let costo = articulo.precioCosto;
    let iva = articulo.iva;
    let costoIva = costo * (1+ iva/100);
    let ganancia = 0;
    let listaDePrecios = cliente.listaPrecio;
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

  const handleEdit = async() =>{


    let itemArray = await getArticuloPorCodigo (selectedItem.id);
    let articulo = itemArray[0];
    articulo.seleccionados = selectedItem.cantidad;
    articulo.precio = await obtenerPrecio(articulo);
    articulo.descuento = selectedItem.descuento;
    console.log("editar ",articulo, selectedItem);
    setIsModalEditarVisible(false);
    navigation.navigate('AddArticulo', { articulo });
    //refrescar la preventa
  }

  const guardarNota = () => {
    // Aquí puedes implementar la lógica para guardar la nota en tu aplicación
    console.log('Nota guardada:', nota);
  };

  const traerFrecuentes = async() => {
    // Aquí puedes implementar la lógica para guardar la nota en tu aplicación
    setEstoyBuscandoFrecuentes(true);
    hasInternetAccess == true? (
    // console.log('buscando frecuentes:');
    setArticulosFrecuentes(await getArticulosFrecuentesDesdeAPI(cliente.id))    
    ):(
    console.log('buscando frecuentes:'))
  };

  const abrirArticulos = async () => {
    let cantidad = await configuracionCantidadMaximaArticulos();
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
      );
    } else {
      // console.log("cli CLI CLI listaprecio ", cliente.listaPrecio);
      navigation.navigate('Articulos', { numeroPreventa: preventaNumero, cliente: cliente.id, listaDePrecio: cliente.listaPrecio, cantItems: cantidadItems, articulosFrecuentes: articulosFrecuentes, hasInternetAccess: hasInternetAccess });
    }
  };



  const handleItem = (item) =>{
    setSelectedItem(item);
    abrirModalEditar(item);
    
  }

  // Renderiza cada elemento del array reducido
  const renderItem = ({ item }) => {
    // console.log("prv152 intem ", item);
    return (
    <TouchableOpacity /*style= {{ borderWidth: 1,}}*/ onPress={() => handleItem(item)}>
      <Text style={{fontWeight: "bold"}}>{`${item.descripcion} `}</Text>
      <View style= {{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',}}>
        
        <View style= {{ width: "20%",
                        // borderWidth: 1 ,
                        borderRightWidth:1,
                        flexDirection: 'row', // Hijos en columna vertical
                        alignItems: 'center', // Alinear hijos a la izquierda
                      }}>
          <Text >Cantidad: {item.cantidad}</Text>                
        </View>
        <View style= {{ borderWidth: 0 , width: "22%", borderRightWidth:1,
                        flexDirection: 'column', // Hijos en columna vertical
                        alignItems: 'flex-start', // Alinear hijos a la izquierda
                      }}>
          <Text>Lista {cliente.listaPrecio }: $ {String(item.precioLista.toFixed(2))}  </Text>              
                       
        </View>
        <View style= {{ borderWidth: 0 , width: "22%", borderRightWidth:1,
                        flexDirection: 'column', // Hijos en columna vertical
                        alignItems: 'flex-start', // Alinear hijos a la izquierda
                      }}>
          <Text>Descuento: { String(item.descuento)} % </Text>              
                       
        </View>
        <View style= {{ borderWidth: 0 , width: "22%",
                        flexDirection: 'column', // Hijos en columna vertical
                        alignItems: 'flex-start', // Alinear hijos a la izquierda
                      }}>
                        
          <Text>Total: {`$ ${String(item.precio?.toFixed(2))}`}</Text>               
        </View>
        <View style= {{ borderWidth: 0 , width: "10%", marginBottom: 4, marginTop: 4, // aca sacaremos todos los margin despues de probar el scrol
                        flexDirection: 'column', // Hijos en columna vertical
                        alignItems: 'flex-start', // Alinear hijos a la izquierda
                      }}>
          {/* <Text>Editar</Text> */}
          <Icon name="edit" size={30} color="#9203F9" />            
        </View>
      </View>
      <View style={{ borderBottomColor: 'black', borderBottomWidth: 1, margin:2, marginBottom: 4 }} />
    </TouchableOpacity>
  )};
  const BarraIcons = () =>{
    return (
    <View style={styles.iconBar}>
      <TouchableOpacity onPress={grabarPreventa}>
        <Icon name="save" size={30} color= "cyan" />
        <Text style={{ color:"cyan"}}>Guardar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={abrirArticulos}>
        <Icon name="plus" size={30} color="cyan" />
        <Text style={{ color:"cyan"}}>Agrega Item</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={abrirModal}>
        <Icon name="wpforms" size={30} color="cyan" />
        <Text  style={{ color:"cyan"}}>Nota</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity onPress={cargarDatos}>
        <Fontisto size={30} color="cyan" name='preview' />
      </TouchableOpacity> */}
    </View>
    )
  }
  
  const CabezaPreventa = () =>{
    return (
    <View style= {styles.cabezaContainer} >
      <Text style={{ 
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: 'black',
                    letterSpacing: 2,
                  }}>
        {cliente?.descripcion}
      </Text>
      <TouchableOpacity onPress={traerFrecuentes}>
        {/* <Icon name="plus" size={20} color="orange" />  */}
        <Text>articulos frecuentes: {(articulosFrecuentes.length == 0)? (
          (estoyBuscandoFrecuentes == false)? <Icon name="question-circle-o" size={20} color="black" /> : <Icon name="hourglass-2" size={20} color="black" />
          
          ): articulosFrecuentes.length}</Text>
          {/* <Text>Lista: {cliente?.listaPrecio}</Text> */}
      </TouchableOpacity>
      <View style= {styles.cabezaData}>
        <View style= {styles.cabezaSubdata}>
          <Text>Codigo: {cliente?.id}</Text>
          <Text>Saldo: $ -{cliente?.importeDeuda}</Text>
        </View>
        <View style= {styles.cabezaSubdata}>
            <Text>Total $: {total?.toFixed(2)} </Text>
            <Text>Items: {carrito.length.toString()} </Text>
        </View >
      </View>
    </View>
    )
  }
 
 
return (
  <View style={styles.container}>
  {/* <SafeAreaView style={styles.container}> */}
    <View style={styles.viewTitle} >
     <Text style={styles.title}> EDITAR PREVENTA </Text>
    </View>
    
    <CabezaPreventa/>
    <View style={styles.itemsContainer}>
        <Modal visible={isModalVisible} /*animationType="slide" transparent*/>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Escribir nota</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Escribe una nota..."
              placeholderTextColor="white"
              value={nota}
              onChangeText={setNota}
              />
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={cerrarModal}>
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {isModalEditarVisible? <ModalEliminarEditarCancelar  item={selectedItem} handleEdit={handleEdit} handleDelete={handleDelete} cerrarModalEditar={cerrarModalEditar}/>:""}
        <View style={{ flex: 1, }}>
          <FlatList
          data={carrito}
          keyExtractor={(item, index) => index.toString()} // Puedes ajustar la clave según tus necesidades
          renderItem={renderItem}
          />
        </View>
        {/* <TouchableOpacity style={styles.modalButton} onPress={cargarDatosEditando}>
                <Text style={styles.modalButtonText}>cargar items</Text>
        </TouchableOpacity> */}
    </View> 
<BarraIcons/>
</View>
)
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#0c2f3c '
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
  itemsContainer: {
    flex: 1,
    padding: 10,
    paddingTop: 20,
    margin: 6,
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

  // estilos para la cabecera
  cabezaContainer: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 30,
    backgroundColor: '#96ddf5',// 96ddf5 non Photo blue--- background intermedio
    borderWidth: 1, // Agregar borde
    borderColor: '#000', // Color del borde
    borderRadius: 10, // Radio de las esquinas (para hacerlas redondeadas)
    shadowColor: '#000', // Color de la sombra
    shadowOffset: { width: 0, height: 2 }, // Offset de la sombra
    shadowOpacity: 0.5, // Opacidad de la sombra
    shadowRadius: 2, // Radio de la sombra
    elevation: 5, // Elevación de la sombra (solo para Android)
  },

  cabezaData: {
    flexDirection: 'row', // Hijos en línea horizontal
    justifyContent: 'flex-start', 
    alignItems: 'center', // Centrar verticalmente
  },
  cabezaSubdata: {
    width: "50%",
    flexDirection: 'column', // Hijos en columna vertical
    alignItems: 'flex-start', // Alinear hijos a la izquierda
  },

  // estilos para la barra de ICONOS
  iconBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: "#000000",
    marginBottom: 10,
    padding: 20,
    width: '100%',
  },
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 2,
  },

  // ESTILOS DEL MODAL
  modalContainer: {
    backgroundColor: '#06181e',
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    color: "#30bced",
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    color: "#30bced",
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
  },
  modalButton: {
    backgroundColor: 'blue',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
}, 

});

export default EditPreventa;

