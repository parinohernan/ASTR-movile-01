import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { prefacturas } from '../assets/data';
import Articulos from './Articulos'; // Ajusta la ruta según tu estructura de archivos
import { useNavigation } from '@react-navigation/native';

const Prefactura = ({ codigoCliente, nombreCliente, saldoCliente, prefacturaNumero }) => {
  const [mostrarArticulos, setMostrarArticulos] = useState(false);
  const navigation = useNavigation();
  // Supongo que los datos de los items y el total se obtienen de prefacturas
  const factura = prefacturas.find(factura => factura.numero === prefacturaNumero);
  const { items, total } = factura || { items: [], total: 0 };

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
    setMostrarArticulos(true);
    navigation.navigate('Articulos', { numeroPrefactura: prefacturaNumero });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.rowContainer}>
        <Text>Código: {codigoCliente}</Text>
        <Text>Nombre: {nombreCliente}</Text>
        <Text>Saldo: {saldoCliente}</Text>
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
        <TouchableOpacity>
          <Icon name="sticky-note" size={30} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.codigo.toString()}
        renderItem={renderItem}
      />

      {mostrarArticulos && (<Articulos
          numeroPrefactura={prefacturaNumero}
          setMostrarArticulos={setMostrarArticulos}
        />)}
    </SafeAreaView>
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
});

export default Prefactura;


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#FAF7E6',
//   },
//   rowContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   iconBar: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 10,
//   },
//   separator: {
//     height: 1,
//     backgroundColor: 'gray',
//     marginVertical: 10,
//   },
//   item: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     borderBottomWidth: 1,
//     borderBottomColor: 'gray',
//     paddingVertical: 10,
//   },
//   cell: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   headerText: {
//     fontWeight: 'bold',
//   },
// });

// export default Prefactura;
