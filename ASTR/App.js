import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './views/LoginScreen';
import Home from './views/Home';
import Clientes from './views/Clientes';
import Preventa from './views/Preventa';
import EditPreventa from './views/EditPreventa';
import Articulos from './views/Articulos';
// import Informes from './views/Informes';
import Sincronizar from './views/Sincronizar';
import Configurar from './views/Configurar';
import Usuarios from './views/Usuarios';
import {AddArticulo} from './src/components/AddArticulo';
import ListaPreventas from './src/components/ListaPreventas';
import About from './views/about';
import UserMenuPPal from './views/UserMenuPPal';

const Stack = createStackNavigator();

const App = () => {
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [preventaSeleccionada, setPreventaSeleccionada] = useState(null);
  const rootUser = {
    user: "root",
    password: "root",
  }
  const RenderLoginScreen = (props) => <LoginScreen {...props} rootUser={rootUser}/>;
  const RenderHomeScreen = (props) => <Home />;
  const RenderListaPreventasScreen = (props) => <ListaPreventas />;
  const RenderSincronizarScreen = (props) => <Sincronizar />;
  const RenderConfigurarScreen = (props) => <Configurar />;
  const RenderArticulosScreen = (props) => <Articulos {...props} />;
  const RenderAddArticuloScreen = (props) => <AddArticulo {...props} />;
  const RenderAbout = (props) => <About />;
  const RenderUsuariosScreen = (props) => <Usuarios />;
  const RenderClientesScreen = (props) => <Clientes {...props} setClienteSeleccionado={setClienteSeleccionado} />;
  const RenderPreventaScreen = (props) => <Preventa {...props} clienteSeleccionado={clienteSeleccionado} setPreventaSeleccionada={setPreventaSeleccionada} />;
  const RenderEditPreventaScreen = (props) => <EditPreventa {...props} clienteSeleccionado={clienteSeleccionado} setPreventaSeleccionada={setPreventaSeleccionada} />;
  const RenderUserMenuPPal = (props) => <UserMenuPPal {...props}/>;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{
    headerShown: false
  }}>
        <Stack.Screen name="Login" component={RenderLoginScreen} />
        <Stack.Screen name="Home" component={RenderHomeScreen} />
        <Stack.Screen name="Informes" component={RenderListaPreventasScreen} />
        <Stack.Screen name="Sincronizar" component={RenderSincronizarScreen} />
        <Stack.Screen name="Configuracion" component={RenderConfigurarScreen} />
        <Stack.Screen name="Articulos" component={RenderArticulosScreen} />
        <Stack.Screen name="AddArticulo" component={RenderAddArticuloScreen} />
        <Stack.Screen name="Usuarios" component={RenderUsuariosScreen} />
        <Stack.Screen name="Clientes" component={RenderClientesScreen} />
        <Stack.Screen name="Preventa" component={RenderPreventaScreen} />
        <Stack.Screen name="EditPreventa" component={RenderEditPreventaScreen} />
        <Stack.Screen name="UserMenuPPal" component={RenderUserMenuPPal} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
