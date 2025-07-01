import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';
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
  
  // Registrar Service Worker para web
  useEffect(() => {
    if (Platform.OS === 'web') {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
              console.log('✅ Service Worker registrado exitosamente:', registration.scope);
            })
            .catch((registrationError) => {
              console.log('❌ Error al registrar Service Worker:', registrationError);
            });
        });
      }
      
      // Agregar meta tags para PWA
      const metaTags = [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'OSVI' },
        { name: 'theme-color', content: '#30bced' },
        { name: 'description', content: 'Sistema de Gestión de Preventas para vendedores' }
      ];
      
      metaTags.forEach(tag => {
        const meta = document.createElement('meta');
        meta.name = tag.name;
        meta.content = tag.content;
        document.head.appendChild(meta);
      });
      
      // Agregar link al manifest
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/manifest.json';
      document.head.appendChild(manifestLink);
      
      console.log('🌐 Configuración PWA aplicada');
    }
  }, []);

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
  );
}

export default App;
