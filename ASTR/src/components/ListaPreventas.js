import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity, Button, Alert, StyleSheet} from 'react-native';
import { db } from '../../database/database';
import { useNavigation } from '@react-navigation/native';
import { borrarPreventaYSusItems } from '../../database/controllers/Preventa.Controller';
import { getClientes } from '../../database/controllers/Clientes.Controller';
import Icon from 'react-native-vector-icons/FontAwesome';

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
        'SELECT preventaCabeza.id as numero, clientes.descripcion as cliente, clientes.id as clienteCodigo, preventaCabeza.importetotal as importe FROM preventaCabeza JOIN clientes ON preventaCabeza.cliente = clientes.id ORDER BY preventaCabeza.id DESC',
        [],
        (_, result) => {
        const preventasArray = [];
        for (let i = 0; i < result.rows.length; i++) {
            preventasArray.push(result.rows.item(i));
        }
        setPreventas(preventasArray);
        // console.log("que tiene",preventasArray);
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
        const clienteCodigo = selectedItem.clienteCodigo;
        let edit=true;
        setModalVisible(false);
        navigation.navigate('EditPreventa', { preventaNumero, cliente : objCliente, edit });

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
        <Text style={styles.tituloText}>ASTR</Text>
        <Text style={styles.subTituloText}>Informe de prefacturas:</Text>
      </View>
      <FlatList
        data={preventas}
        renderItem={renderItem}
        keyExtractor={(item) => item.numero.toString()}
      />

      {/* <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text>Opciones para Nº {selectedItem?.numero}</Text>
            <Button title="Borrar" onPress={() => handleAction('Borrar')} />
            <Button title="Editar" onPress={() => handleAction('Editar')} />
            <Button title="Cancelar" onPress={() => handleAction('Cancelar')} />
          </View>
        </View>
      </Modal> */}
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
  container: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    // alignItems: 'center',
    // width: "100%",
    // padding: 20,
    marginTop: 40,
    backgroundColor: '#c9eefa',
  },
  titulo: {
    marginBottom: 30,
    alignItems: 'center',
    backgroundColor: '#96ddf5',
    padding:24,
  },
  tituloText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
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
