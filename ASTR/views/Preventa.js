import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, SafeAreaView, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { obtenerPreventaDeStorage, preventaDesdeBDD, calcularTotal, limpiarPreventaDeStorage } from "../src/utils/storageUtils";
import { grabarPreventaEnBDD } from '../database/controllers/Preventa.Controller';
import { getClientes } from '../database/controllers/Clientes.Controller';
import { nextPreventa } from '../src/utils/storageConfigData';

const Preventa = (props) => {
  const {route} = props;
  const {params} = route;
  let {cliente, preventaNumero} = params;
  console.log("PRV13 prevnumero y cliente",preventaNumero,cliente);
  
  
  const navigation = useNavigation();
  
  /*busco los items que ya esten cargados en la preventa*/ 
  
  const [carrito, setCarrito] = useState([]);
  const [cantidadItems, setCantidadItems] = useState([]);
  const [total, setTotal] = useState(9999999);
  const [nueva, setNueva] = useState(true);
  const [dCliente, setDCliente] = useState( cliente );

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
    setDCliente(cliente);
  }
  
  useEffect(() => {
    const loadData = async () => {
      if (typeof (cliente) == "string") {
        // solo cuando edito una preventa
        await siEstoyEditando();
        
      }else{

        // console.log("25carritodata",carritoData[0]);
      }
      cargarDatos();
      // const carritoData = await obtenerPreventaDeStorage();
      // setDCliente(cliente);
      // // if (carritoData == []) {
        
      //   setCarrito(carritoData.map(item => ({ cantidad: item.cantidad, descripcion: item.descripcion, id: item.id, precio: item.precioFinal })));
      // // }
      // setCantidadItems (carritoData.length);
      // const totalData = await calcularTotal();
      // setTotal(totalData);
      console.log("30 carrito reducido ", carrito);
    };
    loadData();
  }, []); 

  const cargarDatos = async () => {
    const carritoData = await obtenerPreventaDeStorage();
    setDCliente(cliente);
    if (carritoData.length != 0) {
      setCarrito(carritoData.map(item => ({ cantidad: item.cantidad, descripcion: item.descripcion, id: item.id, precio: item.precioFinal })));
    }
    setCantidadItems (carritoData.length);
    const totalData = await calcularTotal();
    setTotal(totalData);
  };

  const grabarPreventa = async () => {
    /* Grabar la preventa en la base de datos requiere cabeza de la preventa y grabar cada item */
    /* todos los errores deben estar controlado */
    let numero = preventaNumero
    if (nueva) {
      numero = await nextPreventa();
    }
    console.log("carrito ooo ",carrito);
    await grabarPreventaEnBDD (numero, nota , cliente.id, carrito);
    setCarrito ([]);    
  };

  const limpiarLaPreventa = async () => {
    // esta funcion se usa solo para test
    await limpiarPreventaDeStorage();
    // await cargarDatos();
  };

  // console.log("PRV80. actual", carrito);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nota, setNota] = useState('');
  
  const abrirModal = () => {
    setIsModalVisible(true);
  };
  
  const cerrarModal = () => {
    setIsModalVisible(false);
    guardarNota();
    
  };

  const guardarNota = () => {
    // Aquí puedes implementar la lógica para guardar la nota en tu aplicación
    console.log('Nota guardada:', nota);
  };

  const abrirArticulos = () => {
    // setMostrarArticulos(true);
    console.log("PRF127 voy a abrir articu con la prop preventaNume sin clienteID", preventaNumero );
    navigation.navigate('Articulos', { numeroPreventa: preventaNumero});
  };

 
  // Renderiza cada elemento del array reducido
  const renderItem = ({ item }) => (
    <View>
      <Text>{`Descripción: ${item.descripcion}`}</Text>
      <Text>{`Codigo : ${item.id}, Cantidad: ${item.cantidad}`}</Text>
      {/* <Text>{`Codigo : ${item.}, precio: ${item.precio}`}</Text> */}
      <Text>{`$: ${String(item.precio)}`}</Text>
      <View style={{ borderBottomColor: 'black', borderBottomWidth: 1, marginBottom: 10 }} />
    </View>
  );

  return (
    <View style={styles.container}>
  <SafeAreaView style={styles.container}>
    <View style={styles.rowContainer}>
      <Text>{dCliente.descripcion}</Text>
    </View>
    <View />
      <Text>Código: {dCliente.id}  Saldo: $ -{dCliente.importeDeuda}</Text>
    <View style={styles.separator} />

    <View style={styles.rowContainer}>
      <Text>Items: {carrito.length.toString()}</Text>
      <Text>Total: {total}</Text>
    </View> 
    <View style={styles.separator} />

    <View style={styles.iconBar}>
      <TouchableOpacity onPress={grabarPreventa}>
        <Icon name="save" size={30} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity onPress={abrirArticulos}>
        <Icon name="plus" size={30} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity onPress={limpiarLaPreventa}>
        <Icon name="minus" size={30} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity onPress={cargarDatos}>
        <Icon name="repeat" size={30} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity onPress={abrirModal}>
        <Icon name="sticky-note" size={30} color="#000" />
      </TouchableOpacity>
    </View>
    <View style={styles.separator} />
    {carrito.length > 0 && 
        <FlatList
          data={carrito}
          keyExtractor={(item, index) => index.toString()} // Puedes ajustar la clave según tus necesidades
          renderItem={renderItem}
        />
    }
  </SafeAreaView>      
      <Modal visible={isModalVisible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Escribir nota</Text>
        <TextInput
          style={styles.modalInput}
          placeholder="Escribe una nota..."
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

</View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FAF7E6',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: 'gray',
    marginVertical: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    paddingVertical: 10,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
  },
  modalContainer: {
    backgroundColor: '#A2BAB6',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    width: '80%',
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
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  itemText: {
    flex: 1,
    marginRight: 10,
  },
  
});

export default Preventa;

