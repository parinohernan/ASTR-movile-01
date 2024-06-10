import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity, Button, Alert, StyleSheet} from 'react-native';
import { db } from '../../database/database';
import { useNavigation } from '@react-navigation/native';
import { borrarPreventaYSusItems } from '../../database/controllers/Preventa.Controller';
import { getClientes } from '../../database/controllers/Clientes.Controller';
import Icon from 'react-native-vector-icons/FontAwesome';
import { empresa, producto } from '../cconstantes/constantes';

const ListaPreventas = () => {
  const navigation = useNavigation();
  const [preventas, setPreventas] = useState([]);
//   const [preventa, setPreventa] = useState(""); //codigo de preventa seleccionada
//   const [cliente, setCliente] = useState(""); //codigo de cliente seleccionado
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    cargarPreventas();
  }, []);

const cargarPreventas = () => {
db.transaction((tx) => {
    try {
    tx.executeSql(
        'SELECT preventaCabeza.id as numero, clientes.descripcion as cliente, clientes.id as clienteCodigo, preventaCabeza.importetotal as importe, preventaCabeza.observacion as observacion FROM preventaCabeza JOIN clientes ON preventaCabeza.cliente = clientes.id ORDER BY preventaCabeza.id DESC',
        [],
        (_, result) => {
        const preventasArray = [];
        for (let i = 0; i < result.rows.length; i++) {
            preventasArray.push(result.rows.item(i));
        }
        setPreventas(preventasArray);
        console.log("que tiene",preventasArray);
        },
        (_, error) => {
        console.error('Error al cargar preventas:', error);
        }
    );
    } catch (error) {
    console.error('Excepción al ejecutar la transacción:', error);
    }
});
};

const ListaPreventasActuales = () =>{
  return(
   <View style={styles.containerResults}>
      <FlatList
        data={preventas}
        renderItem={renderItem}
        keyExtractor={(item) => item.numero.toString()}
        />
    </View>
  )
}  

const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedItem(item);
        setModalVisible(true);

      }}
    >
      <View style={{ padding: 2, borderWidth:4, borderBottomColor: '#ccc' }}>
        <Text>Nº: {item.numero}</Text>
        <Text>Cliente: {item.cliente}</Text>
        <Text>Total: $ {item.importe}</Text>
        <Text>OBS:{item.observacion}</Text>
      </View>
    </TouchableOpacity>
  );

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const buscarCliente = async(clienteCodigo, clientes) => {

      return clientes.find(element => element.id == clienteCodigo);

  }

  const handleAction = async(action) => {
    // Agrega la lógica para manejar las acciones (Borrar, Editar, Cancelar)
    switch (action) {
      case 'Borrar':
        Alert.alert(
          'Confirmar eliminación',
          '¿Está seguro que desea borrar la preventa?',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Borrar',
              style: 'destructive',
              onPress: () => {
                borrarPreventaYSusItems(selectedItem.numero);
                cargarPreventas();
                closeModal();
              },
            },
          ],
          { cancelable: false }
        );
        break;
      case 'Editar':
        // editar la preventa seleccionada
        const  clientes = await getClientes();
        let objCliente = await buscarCliente(selectedItem.clienteCodigo, clientes);
        const preventaNumero = selectedItem.numero;
        const observacion = selectedItem.observacion;
        const clienteCodigo = selectedItem.clienteCodigo;
        let edit=true;
        setModalVisible(false);
        navigation.navigate('EditPreventa', { preventaNumero, cliente : objCliente, edit , observacion});

        break;
      case 'Cancelar':
        closeModal();
        break;
      default:
        break;
    }
  };

  const renderAction = (action) => (
    <TouchableOpacity style={styles.actionButton} onPress={() => handleAction(action)}>
      <Icon
        name={action === 'Borrar' ? 'delete' : action === 'Editar' ? 'edit' : 'cancel'}
        size={24}
        color={action === 'Borrar' ? 'red' : 'black'}
      />
      <Text style={[styles.actionButtonText, action === 'Borrar' && styles.dangerButton]}>{action}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titulo}>
        <View ></View>
        <Text style={styles.tituloText}>{empresa} - {producto}</Text>
        <Text style={styles.tituloText}>Informe de prefacturas</Text>
      </View>

      <ListaPreventasActuales/>
      <Modal 
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal} >
        <View style={{ flex: 1, flexDirection:"row", justifyContent: 'center', alignItems: 'center',backgroundColor: "#33333389" }}>
        <TouchableOpacity style={{ backgroundColor: "cyan" , padding: 14, borderBottomLeftRadius: 23}} onPress={() => handleAction('Editar')}>
            <View style={styles.modalOption}>
            <Icon name="edit" size={40} color="blue" />
            <Text style={styles.modalOptionText} >Editar</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: "cyan" , padding: 14, }} onPress={() => handleAction('Borrar')}>
            <View style={styles.modalOption}>
            <Icon name="trash" size={40} color="red" />
            <Text style={styles.modalOptionText}>Eliminar</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: "cyan" , padding: 14, borderBottomRightRadius : 23, borderTopRightRadius : 23}} onPress={() => handleAction('Cancelar')}>
            <View style={styles.modalOption}>
            <Icon name="times" size={40} color="black" />
            <Text style={styles.modalOptionText}>Cancelar</Text>
            </View>
        </TouchableOpacity>
        </View>
    </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'flex-center',
    // width: "90%",
    // padding: 20,
    marginBottom: -50,
    backgroundColor: '#96ddf5',
    paddingTop:0,
  },
  containerResults: {
    // flex: 1,
    // flexDirection: 'column',
    // flexWrap: 'nowrap',
    justifyContent: 'space-between',
    marginTop: 10,
    width: "94%",
    height: "80%",
    padding: 2,
    backgroundColor: '#c9eefa',
    marginLeft:10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 2,
  },
  actionButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
  dangerButton: {
    color: 'red',
  },
  titulo: {
    width: '100%',
    margin: 0,
    padding: 10,
    // border: 10,
    borderTopWidth: 2,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 60,
    backgroundColor: '#0c2f3c',
    borderColor: "#30bced",
    borderWidth: 10,
  },
  tituloText: {
    alignContent: "center",
    fontSize: 30,
    color: '#c9eefa',
  },
  subtituloText: {
    fontSize: 16,
    color: '#7f8c8d',
  }, 
  modalContainer: {
    backgroundColor: 'orange',
    // width: "30%",
    // maxHeight: 300,
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
  modalOptionText: {
    color: 'black',
    fontWeight: 'bold',
    paddingBottom: 20,
  }

});

export default ListaPreventas;
// export {ListaPrenentasActuales};
