import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity, Button, Alert, StyleSheet} from 'react-native';
import { db } from '../../database/database';
import { useNavigation } from '@react-navigation/native';
import { borrarPreventaYSusItems } from '../../database/controllers/Preventa.Controller';

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

  const handleAction = (action) => {
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
                console.log('Borrar preventa número ', selectedItem.numero);
                borrarPreventaYSusItems(selectedItem.numero);
                navigation.goBack();
              },
            },
          ],
          { cancelable: false }
        );
        break;
      case 'Editar':
        // Lógica para editar el elemento seleccionado
        console.log("Lista73, c",selectedItem);
        const preventaNumero = selectedItem.numero;
        const cliente = selectedItem.clienteCodigo;
        // let edit=true;
        // navigation.navigate('Preventa', { preventaNumero, cliente, edit });
        Alert.alert(
          "En esta version, no se pueden editar preventas.",
          `Por el momento la unica forma es borrarla y crear una nueva.`,
          [
            {
              text: "Aceptar",
              onPress: () => console.log("Aceptar presionado"),
              style: "cancel"
            }
          ]
        );
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

      <Modal
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
  
});

export default ListaPreventas;
