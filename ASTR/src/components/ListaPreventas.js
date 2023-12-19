import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity, Button } from 'react-native';
import { db } from '../../database/database';
import { useNavigation } from '@react-navigation/native';


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
      <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
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
        // Lógica para borrar el elemento seleccionado
        break;
      case 'Editar':
        // Lógica para editar el elemento seleccionado
        console.log("Lista73, c",selectedItem);
        const preventaNumero = selectedItem.numero;
        const cliente = selectedItem.clienteCodigo;
        navigation.navigate('Preventa', { preventaNumero, cliente });
        break;
      case 'Cancelar':
        closeModal();
        break;
      default:
        break;
    }
  };

  return (
    <View>
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

export default ListaPreventas;
