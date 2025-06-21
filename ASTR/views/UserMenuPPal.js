import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import checkServerHandler from '../src/utils/checkServerHandler';

const UserMenuPPal = ({ route }) => {
  const { params } = route;
  const vendedor = params.vendedor;
  const user = {
    vendedor: vendedor.descripcion,
    password: vendedor.clave,
    id: vendedor.id,
  };
  const navigation = useNavigation();
  const menuOptions = [
    { name: 'Preventa', icon: 'clipboard-check' },
    { name: 'Informes', icon: 'file-chart' },
    { name: 'Sincronizar', icon: 'sync' },
  ];
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const verServer = async () => {
    const serverStatus = await checkServerHandler();
    setIsServerOnline(serverStatus);
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsConnected(state.isConnected);
        verServer();
      });

      // Cleanup function
      return () => {
        unsubscribe();
      };
    }, [])
  );

  const handleOptionPress = (option) => {
    console.log(`Seleccionaste: ${option.name}`);
    switch (option.name) {
      case 'Preventa':
        navigation.navigate('Clientes', {});
        break;
      case 'Informes':
        navigation.navigate('Informes', {});
        break;
      case 'Sincronizar':
        navigation.navigate('Sincronizar', {});
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titulo}>
        <Text style={styles.tituloText}>Vendedor </Text>
        <Text style={styles.tituloText}>{user.vendedor}</Text>
      </View>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo} // Establece el ancho de la imagen
          resizeMode="contain" // Ajusta la imagen proporcionalmente dentro de su contenedor
        />
      </View>
      <View style={styles.connectionStatus}>
        <MaterialCommunityIcons
          name={isConnected ? 'wifi' : 'wifi-off'}
          size={24}
          color={isConnected ? 'green' : 'red'}
        />
        <Text style={{ color: isConnected ? 'green' : 'red' }}>
          {isConnected ? 'Conectado' : 'Sin conexión'}
        </Text>
        <MaterialCommunityIcons
          name={isServerOnline ? 'check-circle' : 'alert-circle' }
          size={24}
          color={isServerOnline ? 'green' : 'red'}
        />
        <Text style={{ color: isServerOnline ? 'green' : 'red' }}>
          {isServerOnline ? 'Servidor online' : 'Servidor Offline'}
        </Text>
      </View>
      <View style={styles.bottonContainer}>
        {menuOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleOptionPress(option)}
          >
            <View style={styles.menuItem}>
              <MaterialCommunityIcons name={option.icon} size={50} color="cyan" />
              <Text style={styles.menuItemText}>{option.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -40,
    backgroundColor: '#96ddf5',
    paddingTop:60,
  },
  container222: {
    flex: 1,
    backgroundColor: '#96ddf5',
    padding: 10,
  },
  titulo: {
    width: '100%',
    margin: 0,
    padding: 10,
    borderTopWidth: 2,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 60,
    backgroundColor: '#0c2f3c',
    borderColor: "#30bced",
    borderWidth: 10,
  },
  subTituloText: {
    margin: 0,
    padding: 0,
    color: '#96ddf5',
    borderColor: '#96ddf5',
  },
  logo: {
    flex: 1,
    width: "100%"
  },
  logoContainer: {
    flex: 1,
    width: 280,
    height: 200,
  },
  tituloText: {
    alignContent: "center",
    fontSize: 30,
    color: '#c9eefa',
  },
  menuItem :{
  },

  menuItemText: {
    color: "#c9eefa",
  },

  bottonContainer: {
    flexDirection: 'row',
    width: "100%",
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginBottom: 0,
    backgroundColor: '#0c2f3c',
    borderColor: "#30bced",
    borderWidth: 10,
    borderTopLeftRadius:80,
    borderBottomWidth:3,
    borderRightWidth:2,
  }
});

export default UserMenuPPal;
