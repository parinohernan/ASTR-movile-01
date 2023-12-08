import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, SafeAreaView, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { prefacturas } from '../assets/data';
import Articulos from './Articulos'; // Ajusta la ruta según tu estructura de archivos
import { useNavigation } from '@react-navigation/native';
import { getPreventas, nextPreventa } from '../database/controllers/Preventa.Controler';

const Prefactura = (props) => {
  // const prefacturas = getPreventas;
  const {route} = props;
  const {params} = route;
  const {cliente, codigoCliente, prefacturaNumero} = params;
  console.log("preprefactura cliente y nunmero PRF",params.cliente.id, params.prefacturaNumero);
  const navigation = useNavigation();
  const factura = prefacturas.find(factura => factura.numero === prefacturaNumero);
  const { items, total } = factura || { items: [], total: 0 };
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

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.cell}>
        <Text style={styles.headerText}>Descripción</Text>
        <Text>{item.descripcion}</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.headerText}>Cantidad</Text>
        <Text>{item.cantidad}</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.headerText}>Precio Unitario</Text>
        <Text>{item.precioUnitario}</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.headerText}>Precio Total</Text>
        <Text>{item.precioTotal}</Text>
      </View>

    </View>
  );

  const abrirArticulos = () => {
    // setMostrarArticulos(true);
    console.log("PRF62 voy a abrir articu con la prop prefacNume ", prefacturaNumero );
    navigation.navigate('Articulos', { numeroPrefactura: prefacturaNumero });
  };

  // console.log("PRF presiona  +  para agregar articulos...");
  return (
    <View style={styles.container}>
    <SafeAreaView style={styles.container}>
      <View style={styles.rowContainer}>
        <Text>Código: {cliente.id}</Text>
        <Text>Nombre: {cliente.descripcion}</Text>
        <Text>Saldo: {cliente.importeDeuda}</Text>
      </View>
      <View style={styles.separator} />

      <View style={styles.rowContainer}>
        <Text>Prefactura Número: {prefacturaNumero}</Text>
        <Text>Total: {total}</Text>
      </View>
      <View style={styles.separator} />

      <View style={styles.iconBar}>
        <TouchableOpacity>
          <Icon name="save" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={abrirArticulos}>
          <Icon name="plus" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={abrirModal}>
          <Icon name="sticky-note" size={30} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.codigo.toString()}
        renderItem={renderItem}
      />

      {/* {mostrarArticulos && (<Articulos
          numeroPrefactura={prefacturaNumero}
          setMostrarArticulos={setMostrarArticulos}
          />)} */}
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
});

export default Prefactura;

