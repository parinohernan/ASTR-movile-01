import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';




function Articulo ({ item }) {
    // const navigation = useNavigation();
    // const openModal = (articulo) => {
    //     // setSelectedArticulo(articulo);
    //     // setModalVisible(true);
    //     navigation.navigate('AddArticulo', { articulo });
    // };
    (
    <TouchableOpacity onPress={() => openModal(item)}>
      <View style={styles.articuloItem}>
        <Text style={styles.articuloInfo}>{item.id}</Text>
        <Text style={styles.articuloInfo}>{item.descripcion}</Text>
        <Text style={styles.articuloInfo}>Stock: {item.existencia}</Text>
        <Text style={styles.articuloInfo}>
          Precio: ${item.precio.toFixed(2)}
        </Text>
        {/*<TouchableOpacity onPress={() => handleCheck(item.id)}>
           <Icon
            name="check"
            size={20}
            color={estaElegido(item.id) ? 'blue' : '#fff'}
          /> 
        </TouchableOpacity>*/}
      </View>
    </TouchableOpacity>)
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#FAF7E6',
    },
    articuloItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: 'gray',
      paddingVertical: 10,
    },
    articuloInfo: {
      flex: 1,
      marginRight: 10,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  
export default Articulo;