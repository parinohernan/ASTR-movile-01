import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const Home = ({user}) => {

  const navigation = useNavigation();

  const menuOptions = [
    // { name: 'Preventa', icon: 'clipboard-check' },
    // { name: 'Acerca de', icon: 'AppShortcut' },
    { name: 'Usuarios', icon: 'account-group' },
    { name: 'Informes', icon: 'file-chart' },
    { name: 'Sincronizar', icon: 'sync' },
    { name: 'Configuracion', icon: 'cog' },
  ];

  const handleOptionPress = (option) => {
    // Implementar lógica según la opción seleccionada
    console.log(`Seleccionaste: ${option.name}`);
    switch (option.name) {
      // case 'Preventa':
      //   navigation.navigate('Clientes', {});
      //   break;
      // case 'Informes':
      //   navigation.navigate('Informes', {});
      //   break;
      case 'Sincronizar':
        navigation.navigate('Sincronizar', {});
        break;
      case 'Configuracion':
        navigation.navigate('Configuracion', {});
        break;
      case 'Usuarios':
        navigation.navigate('Usuarios', {});
        break;
      // Agrega otros casos según sea necesario
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titulo}>
        <Text style={styles.tituloText}>ASTR</Text>
        <Text style={styles.subtituloText}>La aplicacion movil para astrial</Text>
      </View>
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
      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 0.0.4 - hernanpa Dev </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    // padding: 20,
    marginTop:40,
    backgroundColor: '#FAF7E6',
  },
  menuItem: {
    alignItems: 'center',
    marginBottom: 20,
  },
  menuItemText: {
    fontSize: 20,
    marginTop: 10,
  },
  tituloText: {
    alignContent: "center",
    fontSize: 40,
    marginBottom: 5,
    color: '#FAF7E6'
  },
  subtituloText: {
    alignContent: "center",
    fontSize: 18,
    marginBottom: 5,
    color: '#FAF7E6'
  },
  
  titulo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
    // borderTopRightRadius: 35,
    borderTopLeftRadius: 35,
    backgroundColor: "#1212ef",
    marginBottom: 20,
  },
  footer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
    borderBottomEndRadius: 35,
    borderBottonLeftRadius: 35,
    backgroundColor: "#1212ef",
    marginBottom: 0,
  },
  footerText: {

    
    alignContent: "center",
    fontSize: 18,
    marginBottom: 0,
    color: '#FAF7E6'
  },
});

export default Home;
