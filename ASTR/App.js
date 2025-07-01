import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, View, Text, StyleSheet } from 'react-native';

// Importaciones directas para web
import LoginScreen from './views/LoginScreen';
import Home from './views/Home';
import Clientes from './views/Clientes';
import Preventa from './views/Preventa';
import EditPreventa from './views/EditPreventa';
import Articulos from './views/Articulos';
import ArticulosFrecuentes from './views/ArticulosFrecuentes';
import GestionFrecuentes from './views/GestionFrecuentes';
import Sincronizar from './views/Sincronizar';
import Configurar from './views/Configurar';
import Usuarios from './views/Usuarios';
import PreventasEnviadas from './views/PreventasEnviadas';
import { AddArticulo } from './src/components/AddArticulo';
import ListaPreventas from './src/components/ListaPreventas';
import UserMenuPPal from './views/UserMenuPPal';
import ClientesInfo from './src/components/clientes/ClientesInfo';

const Stack = createStackNavigator();

// Componente de carga para web
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Cargando ASTR...</Text>
  </View>
);

const App = () => {
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [preventaSeleccionada, setPreventaSeleccionada] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🌐 Iniciando aplicación web...');
        
        // Registrar Service Worker para web
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
          { name: 'mobile-web-app-capable', content: 'yes' },
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
        
        // Simular tiempo de carga para inicialización
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
        
      } catch (err) {
        console.error('❌ Error al inicializar la aplicación:', err);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Cargar la aplicación completa para web
  const rootUser = {
    user: "root",
    password: "root",
  }
  
  const RenderLoginScreen = (props) => <LoginScreen {...props} rootUser={rootUser}/>;
  const RenderHomeScreen = (props) => <Home />;
  const RenderListaPreventasScreen = (props) => <ListaPreventas />;
  const RenderSincronizarScreen = (props) => <Sincronizar {...props} />;
  const RenderArticulosScreen = (props) => <Articulos {...props} />;
  const RenderArticulosFrecuentesScreen = (props) => <ArticulosFrecuentes {...props} />;
  const RenderGestionFrecuentesScreen = (props) => <GestionFrecuentes {...props} />;
  const RenderAddArticuloScreen = (props) => <AddArticulo {...props} />;
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
        <Stack.Screen name="Configuracion" component={Configurar} />
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
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
});

export default App;
