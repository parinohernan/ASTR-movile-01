import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import LoginScreen from './views/LoginScreen';
import Home from './views/Home';
import Clientes from './views/Clientes';
import Prefactura from './views/Prefactura';
import Articulos from './views/Articulos';

export default function App() {
  return (
    // <View style={styles.container}>
    //   <Text>Open up App.js to start working on your app!</Text>
    //   <StatusBar style="auto" />
    // </View>
    // <Home/>
    // <Clientes/>
    // <Prefactura prefacturaNumero={4} odigoCliente="3456788" nombreCliente="Belen Parra" codigoCliente="45004" saldoCliente="32424.45"/>
    <Articulos prefacturaNumero={4}/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

