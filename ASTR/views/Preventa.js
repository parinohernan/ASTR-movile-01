import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, SafeAreaView, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, Bottom} from '@react-navigation/native';
import { obtenerPreventaDeStorage, preventaDesdeBDD, calcularTotal, limpiarPreventaDeStorage } from "../src/utils/storageUtils";
import { grabarPreventaEnBDD } from '../database/controllers/Preventa.Controller';
import { getClientes } from '../database/controllers/Clientes.Controller';
import { nextPreventa } from '../src/utils/storageConfigData';
import { Fontisto } from '@expo/vector-icons';

const Preventa = (props) => {
  const {route} = props;
  const {params} = route;
  let {preventaNumero, cliente} = params;
  console.log("PRV13 prevnumero y cliente",preventaNumero,cliente);
  
  const navigation = useNavigation();

  /*busco los items que ya esten cargados en la preventa y los cargo en el estado*/ 
  const [carrito, setCarrito] = useState([]);
  const [cantidadItems, setCantidadItems] = useState([]);
  const [total, setTotal] = useState(9999999);
  const [nueva, setNueva] = useState(true);
  const [dataCliente, setDataCliente] = useState( params.cliente );

  const siEstoyEditando = async () => {
    setNueva(false);
    const  clientes = await getClientes();
    console.log("estoy editando la preventa ");
    clientes.forEach(element => {
        if (element.id == cliente) {
          cliente = element;
        } 
    });
    await preventaDesdeBDD(preventaNumero);//busca la preventa en la BDD y la carga al local storage
    console.log("cliente rescatado =" ,cliente.descripcion);
    setDataCliente(cliente);
  }
  
  useEffect(() => {
    const loadData = async () => {
      if (cliente) {
        // creo que lo hago simpre, pero estaba pensado para hacerlo solo cuando edito una preventa 
        await siEstoyEditando(); //con esto cargo los datos del cliente
      }else{
        console.log("25carritodata",carritoData[0]);
      }
      cargarDatos();
      console.log("50 carrito reducido ", carrito);
    };
    console.log("PRV useefect ");
    loadData();
  }, []); 

  const cargarDatos = async () => {
    const carritoData = await obtenerPreventaDeStorage();
    if (carritoData.length != 0) {
      setCarrito(carritoData.map(item => ({ cantidad: item.cantidad, descripcion: item.descripcion, id: item.id, precio: item.precioFinal })));
    }
    setCantidadItems (carritoData.length);
    setTotal(await calcularTotal());
    setOcultarPreventa(false);
  };

  const grabarPreventa = async () => {
    /* Grabar la preventa en la base de datos requiere cabeza de la preventa y grabar cada item */
    /* todos los errores deben estar controlado */
    let numero = preventaNumero
    if (nueva) {
      numero = await nextPreventa();
    }
    console.log("carrito ooo ",carrito);
    await grabarPreventaEnBDD (numero, nota , dataCliente .id, carrito);
    setCarrito ([]);    
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [ocultarPreventa, setOcultarPreventa] = useState(true);
  const [nota, setNota] = useState('');
  
  const abrirModal = () => { //modal de la nota
    setIsModalVisible(true);
  };
  
  const cerrarModal = () => { //modal de la nota
    setIsModalVisible(false);
    guardarNota();
    
  };

  const guardarNota = () => {
    // Aquí puedes implementar la lógica para guardar la nota en tu aplicación
    console.log('Nota guardada:', nota);
  };

  const abrirArticulos = () => {
    // setMostrarArticulos(true);
    console.log("PRF101 voy a abrir articu con la prop preventaNume sin clienteID", preventaNumero, dataCliente );
    setOcultarPreventa(true);
    navigation.navigate('Articulos', { numeroPreventa: preventaNumero, cliente: dataCliente.id, cantItems: cantidadItems });
  };

  const openAddArticulo = (articulo) => {
    articulo.seleccionados=articulo.cantidad;
    console.log("articulo ",articulo); 
    navigation.navigate('AddArticulo', { articulo: articulo, preventaNumero: preventaNumero, cliente:dataCliente.id, cantItems: carrito.length.toString() });
  };

  // Renderiza cada elemento del array reducido
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openAddArticulo(item)}>
      <Text>{`${item.descripcion} `}</Text>
      <View style= {{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline'}}>
        {/* <Text>Cantidad: {item.cantidad} Total {`$: ${String(item.precio)}`}</Text> */}
        <View style= {{ width: "32%",
                        borderWidth: 2 ,
                        flexDirection: 'row', // Hijos en columna vertical
                        alignItems: 'center', // Alinear hijos a la izquierda
                      }}>
          <Text>Cantidad: {item.cantidad}</Text>                
        </View>
        <View style= {{ borderWidth: 2 , width: "32%",
                        flexDirection: 'column', // Hijos en columna vertical
                        alignItems: 'flex-start', // Alinear hijos a la izquierda
                      }}>
          <Text>Total {`$: ${String(Math.round(item.precio))}`}</Text>               
        </View>
        <View style= {{ borderWidth: 2 , width: "20%", marginBottom: 30, marginTop: 30, // aca sacaremos todos los margin despues de probar el scrol
                        flexDirection: 'column', // Hijos en columna vertical
                        alignItems: 'flex-start', // Alinear hijos a la izquierda
                      }}>
          <Text>Editar</Text>            
        </View>
      </View>
      <View style={{ borderBottomColor: 'black', borderBottomWidth: 1, margin:2, marginBottom: 4 }} />
    </TouchableOpacity>
  );
  const BarraIcons = () =>{
    return (
    <View style={styles.iconBar}>
      <TouchableOpacity onPress={grabarPreventa}>
        <Icon name="save" size={30} color= "cyan" />
      </TouchableOpacity>
      <TouchableOpacity onPress={abrirArticulos}>
        <Icon name="plus" size={30} color="cyan" />
      </TouchableOpacity>
      <TouchableOpacity onPress={abrirModal}>
        <Icon name="wpforms" size={30} color="cyan" />
      </TouchableOpacity>
      <TouchableOpacity onPress={cargarDatos}>
        <Fontisto size={30} color="cyan" name='preview' />
      </TouchableOpacity>
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
        {dataCliente.descripcion}
      </Text>
      <View style= {styles.cabezaData}>
        <View style= {styles.cabezaSubdata}>
          <Text>Codigo: {dataCliente.id}</Text>
          <Text>Saldo: $ -{dataCliente.importeDeuda}</Text>
        </View>
        <View style= {styles.cabezaSubdata}>
          <Text>Total $: {total} </Text>
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
      <Text style={styles.title}> PREVENTA </Text>
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
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={cerrarModal}>
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={{ flex: 1, }}>
          <FlatList
          data={carrito}
          keyExtractor={(item, index) => index.toString()} // Puedes ajustar la clave según tus necesidades
          renderItem={renderItem}
          />
        </View>
    </View> 
<BarraIcons/>
</View>
  );
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
  // viewTitle: {
  //   height:"8%",
  //   backgroundColor: '#06181e',
  //   padding: 0,
  //   flex: 0,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // title:{
  //   color: 'red',
  
  // },
  itemsContainer: {
    flex: 1,
    padding: 10,
    margin: 6,
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
    backgroundColor: "#0c2f3c",
    // color: "#96ddf5",
    marginBottom: 10,
    padding: 20,
    width: '100%',
    // backgroundColor: "#1223a444",
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

export default Preventa;

