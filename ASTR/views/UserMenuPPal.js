import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet,Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const UserMenuPPal = ({route}) => {
  const {params} = route;
  // const user = params.form;
  const user = {
    vendedor:"vendedor de test",
    password:"3214",
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
        <Text style={styles.tituloText}>ASTR La aplicacion movil para astrial</Text>
        <Text style={styles.tituloText}>Vendedor {user.vendedor}</Text>
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
          <MaterialCommunityIcons name={option.icon} size={40} color="blue" />
          <Text style={styles.menuItemText}>{option.name}</Text>
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
    
    // padding: 20,
    // marginTop:40,
    backgroundColor: '#FAF7E6',
  },
  titulo: {
    marginTop: 40,
    backgroundColor: '#3A37E625',
  },
  logo: {
    marginBottom: 20,
  },
  tituloText: {
    alignContent: "center",
    fontSize: 20,
    marginBottom: 5,
    color: '#3A37E6',
  },
  menuItem :{
    flex:1,
    alignContent: 'space-around',
    justifyContent:'flex-start',
    alignItems:'center,',
     
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
    backgroundColor: '#3A37E625',
  }
});

export default UserMenuPPal;
