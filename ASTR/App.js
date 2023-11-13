import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import LoginScreen from './views/LoginScreen';
import Home from './views/Home';
import Clientes from './views/Clientes';
import Prefactura from './views/Prefactura';

export default function App() {
  return (
    // <View style={styles.container}>
    //   <Text>Open up App.js to start working on your app!</Text>
    //   <StatusBar style="auto" />
    // </View>
    // <Clientes/>
    <Prefactura prefacturaNumero={4} odigoCliente="3456788" nombreCliente="Belen Parra" saldoCliente="32424.45"/>
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
