import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const Home = () => {

  const navigation = useNavigation();

  const menuOptions = [
    { name: 'Preventa', icon: 'clipboard-check' },
    // { name: 'Cobro', icon: 'cash' },
    { name: 'Usuarios', icon: 'account-group' },
    { name: 'Informes', icon: 'file-chart' },
    { name: 'Sincronizar', icon: 'sync' },
    { name: 'Configuracion', icon: 'cog' },
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
      {menuOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={() => handleOptionPress(option)}
        >
          <MaterialCommunityIcons name={option.icon} size={60} color="blue" />
          <Text style={styles.menuItemText}>{option.name}</Text>
        </TouchableOpacity>
      ))}
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
    padding: 20,
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
});

export default Home;
