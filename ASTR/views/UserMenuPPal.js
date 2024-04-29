import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet,Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const UserMenuPPal = ({route}) => {
  const {params} = route;
  const vendedor = params.vendedor;
  const user = {
    vendedor: vendedor.descripcion,
    password: vendedor.clave,
    id: vendedor.id,
  };
  const navigation = useNavigation();
  // console.log("Usuario",params);
  const menuOptions = [
    { name: 'Preventa', icon: 'clipboard-check' },
    // { name: 'Acerca de', icon: 'AppShortcut' },
    // { name: 'Cobros', icon: 'account-group' },
    { name: 'Informes', icon: 'file-chart' },
    { name: 'Sincronizar', icon: 'sync' },
  ];

  const handleOptionPress = (option) => {
    // Implementar lógica según la opción seleccionada
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
      // Agrega otros casos según sea necesario
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titulo}>
        <View ></View>
        <Text style={styles.tituloText}>ASTR</Text>
        <Text style={styles.subTituloText}>Vendedor: {user.vendedor}</Text>
      </View>
      <View>
      <Image
          source={require('../assets/favicon.png')}
          //style={[styles.logo, { width: width - 40 }]} // Establece el ancho de la imagen
          resizeMode="contain" // Ajusta la imagen proporcionalmente dentro de su contenedor
        />
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
    // width: "100%",
    // padding: 20,
    marginTop: 40,
    backgroundColor: '#96ddf5',
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
  subTituloText: {
    margin: 0,
    padding: 0,
    color: '#96ddf5',
    // border: 1,
    borderColor: '#96ddf5',
    // backgroundColor: '#0c2f3c',
  },
  logo: {
    marginBottom: 20,
  },
  tituloText: {
    alignContent: "center",
    fontSize: 30,
    color: '#c9eefa',
  },
  menuItem :{
    // flex:1,
    // alignContent: 'space-around',
    // justifyContent:'flex-start',
    // alignItems:'center,',
  },
  menuItemText: {
    color: "#c9eefa",
  },

  bottonContainer: {
    // flex: 1,
    flexDirection: 'row',
    // flexWrap: 'nowrap',
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
