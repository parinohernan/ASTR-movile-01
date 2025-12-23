import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './views/LoginScreen';
import Home from './views/Home';
import Clientes from './views/Clientes';
import Preventa from './views/Preventa';
import EditPreventa from './views/EditPreventa';
import Articulos from './views/Articulos';
import ArticulosFrecuentes from './views/ArticulosFrecuentes';
import GestionFrecuentes from './views/GestionFrecuentes';
// import Informes from './views/Informes';
import Sincronizar from './views/Sincronizar';
import Configurar from './views/Configurar';
import Usuarios from './views/Usuarios';
import PreventasEnviadas from './views/PreventasEnviadas';
import {AddArticulo} from './src/components/AddArticulo';
import ListaPreventas from './src/components/ListaPreventas';
// import About from './views/about';
import UserMenuPPal from './views/UserMenuPPal';
import ClientesInfo from './src/components/clientes/ClientesInfo';

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
  const RenderSincronizarScreen = (props) => <Sincronizar {...props} />;
  const RenderConfigurarScreen = (props) => <Configurar />;
  const RenderArticulosScreen = (props) => <Articulos {...props} />;
  const RenderArticulosFrecuentesScreen = (props) => <ArticulosFrecuentes {...props} />;
  const RenderGestionFrecuentesScreen = (props) => <GestionFrecuentes {...props} />;
  const RenderAddArticuloScreen = (props) => <AddArticulo {...props} />;
  // const RenderAbout = (props) => <About />;
  const RenderUsuariosScreen = (props) => <Usuarios />;
  const RenderClientesScreen = (props) => <Clientes {...props} setClienteSeleccionado={setClienteSeleccionado} />;
  const RenderClientesInfoScreen = (props) => <ClientesInfo {...props} />;
  const RenderPreventaScreen = (props) => <Preventa {...props} clienteSeleccionado={clienteSeleccionado} setPreventaSeleccionada={setPreventaSeleccionada} />;
  const RenderEditPreventaScreen = (props) => <EditPreventa {...props} clienteSeleccionado={clienteSeleccionado} setPreventaSeleccionada={setPreventaSeleccionada} />;
  const RenderUserMenuPPal = (props) => <UserMenuPPal {...props}/>;
  const RenderPreventasEnviadasScreen = (props) => <PreventasEnviadas {...props} />;

  return (
    <SafeAreaProvider>
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
        <Stack.Screen name="ArticulosFrecuentes" component={RenderArticulosFrecuentesScreen} />
        <Stack.Screen name="GestionFrecuentes" component={RenderGestionFrecuentesScreen} />
        <Stack.Screen name="AddArticulo" component={RenderAddArticuloScreen} />
        <Stack.Screen name="Usuarios" component={RenderUsuariosScreen} />
        <Stack.Screen name="Clientes" component={RenderClientesScreen} />
        <Stack.Screen name="ClientesInfo" component={RenderClientesInfoScreen} />
        <Stack.Screen name="Preventa" component={RenderPreventaScreen} />
        <Stack.Screen name="EditPreventa" component={RenderEditPreventaScreen} />
        <Stack.Screen name="UserMenuPPal" component={RenderUserMenuPPal} />
        <Stack.Screen name="PreventasEnviadas" component={RenderPreventasEnviadasScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
