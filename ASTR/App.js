import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './views/LoginScreen';
import Home from './views/Home';
import Clientes from './views/Clientes';
import Preventa from './views/Preventa';
import Articulos from './views/Articulos';
import Informes from './views/Informes';
import Sincronizar from './views/Sincronizar';
import Configurar from './views/Configurar';
import Usuarios from './views/Usuarios';
import AddArticulo from './src/components/AddArticulo';
import ListaPreventas from './src/components/ListaPreventas';

const Stack = createStackNavigator();

const App = () => {
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [preventaSeleccionada, setPreventaSeleccionada] = useState(null);

  const RenderHomeScreen = (props) => <Home />;
  const RenderListaPreventasScreen = (props) => <ListaPreventas />;
  const RenderSincronizarScreen = (props) => <Sincronizar />;
  const RenderConfigurarScreen = (props) => <Configurar />;
  const RenderArticulosScreen = (props) => <Articulos {...props} />;
  const RenderAddArticuloScreen = (props) => <AddArticulo {...props} />;
  const RenderUsuariosScreen = (props) => <Usuarios />;
  const RenderClientesScreen = (props) => <Clientes {...props} setClienteSeleccionado={setClienteSeleccionado} />;
  const RenderPreventaScreen = (props) => <Preventa {...props} clienteSeleccionado={clienteSeleccionado} setPreventaSeleccionada={setPreventaSeleccionada} />;
  

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={RenderHomeScreen} />
        <Stack.Screen name="Informes" component={RenderListaPreventasScreen} />
        <Stack.Screen name="Sincronizar" component={RenderSincronizarScreen} />
        <Stack.Screen name="Configuracion" component={RenderConfigurarScreen} />
        <Stack.Screen name="Articulos" component={RenderArticulosScreen} />
        <Stack.Screen name="AddArticulo" component={RenderAddArticuloScreen} />
        <Stack.Screen name="Usuarios" component={RenderUsuariosScreen} />
        <Stack.Screen name="Clientes" component={RenderClientesScreen} />
        <Stack.Screen name="Preventa" component={RenderPreventaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;



