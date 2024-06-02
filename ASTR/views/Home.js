import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { version, producto, empresa, whatsapp, mail } from '../src/cconstantes/constantes';
const Home = ({user}) => {
  const navigation = useNavigation();
  const menuOptions = [
    // { name: 'Preventa', icon: 'clipboard-check' },
    // { name: 'Acerca de', icon: 'AppShortcut' },
    { name: 'Vendedores', icon: 'account-group' },
    // { name: 'Informes', icon: 'file-chart' },
    { name: 'Sincronizar', icon: 'sync' },
    { name: 'Configuracion', icon: 'cog' },
  ];

  const handleOptionPress = (option) => {
    // Implementar lógica según la opción seleccionada
    console.log(`Seleccionaste: ${option.name}`);
    switch (option.name) {
      case 'Sincronizar':
        navigation.navigate('Sincronizar', {});
        break;
      case 'Configuracion':
        navigation.navigate('Configuracion', {});
        break;
      case 'Vendedores':
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
        <Text style={styles.tituloText}>Osvi</Text>
        <Text style={styles.subtituloText}>panel de administracion</Text>
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
        <View style={{ flexDirection: 'column' }}>
          <View style={{ flexDirection: 'row' }}>
            <MaterialCommunityIcons name="cellphone" size={24} color="#000" />
            <Text style={styles.footerText}>{empresa} - {producto} - {version} </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <MaterialCommunityIcons name="email" size={24} color="#D44638" />
            <Text style={styles.footerText}> {mail} </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <MaterialCommunityIcons name="whatsapp" size={24} color="#075E54" />
            <Text style={styles.footerText}>{whatsapp} </Text>
          </View>
          {/* <View style={{ flexDirection: 'row' }}>
            <MaterialCommunityIcons name="trademark" size={24} color="#000" />
            <Text style={styles.footerText}> Hernan Parino - 2024   </Text>
          </View> */}
        </View>
        <Image
          source={require('../assets/hpdev.png')}
          style={[styles.logo, { width: 100, height: 100 }]} // Establece el ancho de la image
          />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    marginBottom: 30,
    alignItems: 'center',
  },
  tituloText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#073a70',
  },
  subtituloText: {
    fontSize: 16,
    color: '#eb1e2a',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#eb1e2a70',
    borderRadius: 10,
    width: '100%',
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#073a70',
    marginLeft: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  logo: {
    resizeMode: 'contain',
    height: 20,
    marginRight: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#073a70',
  },
});

export default Home;
