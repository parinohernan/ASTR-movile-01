import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';
import LoginScreen from './views/LoginScreen';
import Home from './views/Home';
import Clientes from './views/Clientes';
import Prefactura from './views/Prefactura';
import Articulos from './views/Articulos';
import Informes from './views/Informes';
import Sincronizar from './views/Sincronizar';
import Configurar from './views/Configurar';
import Usuarios from './views/Usuarios';

const Stack = createStackNavigator();

export default function App() {
  // Puedes usar el estado para mantener el cliente y la prefactura seleccionados
  const [clienteSeleccionado, setClienteSeleccionado] = React.useState(null);
  const [prefacturaSeleccionada, setPrefacturaSeleccionada] = React.useState(null);
  // const sequelize = new Sequelize(config.development);
  // // Inicializar modelos
  // const Usuario = UsuarioModel(sequelize);

 
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home">
          {props => <Home />}
        </Stack.Screen>
        <Stack.Screen name="Informes">
          {props => <Informes />}
        </Stack.Screen>
        <Stack.Screen name="Sincronizar">
          {props => <Sincronizar />}
        </Stack.Screen>
        <Stack.Screen name="Configuracion">
          {props => <Configurar />}
        </Stack.Screen>
        <Stack.Screen name="Articulos">
          {props => <Articulos />}
        </Stack.Screen>
        <Stack.Screen name="Usuarios">
          {props => <Usuarios />}
        </Stack.Screen>
        <Stack.Screen name="Clientes">
          {props => <Clientes {...props} setClienteSeleccionado={setClienteSeleccionado} />}
        </Stack.Screen>
        <Stack.Screen name="Prefactura">
          {props => (
            <Prefactura
              {...props}
              clienteSeleccionado={clienteSeleccionado}
              setPrefacturaSeleccionada={setPrefacturaSeleccionada}
            />
          )}
        </Stack.Screen>
        {/* <Stack.Screen name="Articulos" component={Articulos} /> */}
      </Stack.Navigator>
    </NavigationContainer>
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

