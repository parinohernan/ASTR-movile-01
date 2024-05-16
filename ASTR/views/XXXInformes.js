
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
// import { prefacturas } from '../assets/data';
import Icon from 'react-native-vector-icons/FontAwesome';

const Informes = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = (item) => {
    setSelectedItem(item);
    setModalVisible(!isModalVisible);
  };

  const handleEdit = () => {
    // Implementa la lógica para la acción de editar
    console.log(`Editando prefactura ${selectedItem.numero}`);
    setModalVisible(false);
  };

  const handleDelete = () => {
    // Implementa la lógica para la acción de eliminar
    console.log(`Eliminando prefactura ${selectedItem.numero}`);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Lista de Prefacturas</Text>
      <FlatList
        data={prefacturas}
        keyExtractor={(item) => item.numero.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => toggleModal(item)}
            style={styles.item}
          >
            <Text>Número: {item.numero}</Text>
            <Text>Cliente: {item.cliente}</Text>
            <Text>Importe Total: {item.total}</Text>
          </TouchableOpacity>
        )}
      />

  {/* Modal */}
  <Modal isVisible={isModalVisible}>
  <View style={styles.modalContainer}>
    <TouchableOpacity onPress={handleEdit}>
      <View style={styles.modalOption}>
        <Icon name="edit" size={40} color="blue" />
        <Text style={styles.modalOptionText}>Editar</Text>
      </View>
    </TouchableOpacity>
    <TouchableOpacity onPress={handleDelete}>
      <View style={styles.modalOption}>
        <Icon name="trash" size={40} color="red" />
        <Text style={styles.modalOptionText}>Eliminar</Text>
      </View>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setModalVisible(false)}>
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
    padding: 20,
    backgroundColor: '#FAF7E6',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    paddingVertical: 10,
  },
  modalContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalOption: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 30,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
});

export default Informes;
