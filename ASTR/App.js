import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, View, Text, StyleSheet } from 'react-native';

// Importaciones directas para web
import LoginScreen from './views/LoginScreen';
import Home from './views/Home';
import Clientes from './views/Clientes';
import ClientesWeb from './views/ClientesWeb';
import Preventa from './views/Preventa';
import EditPreventa from './views/EditPreventa';
import Articulos from './views/Articulos';
import ArticulosWeb from './views/ArticulosWeb';
import ArticulosFrecuentes from './views/ArticulosFrecuentes';
import GestionFrecuentes from './views/GestionFrecuentes';
import Sincronizar from './views/Sincronizar';
import ConfigurarWeb from './views/ConfigurarWeb';
import UsuariosWeb from './views/UsuariosWeb';
import PreventasEnviadas from './views/PreventasEnviadas';
import PreventaWeb from './views/PreventaWeb';
import EditPreventaWeb from './views/EditPreventaWeb';
import { AddArticulo } from './src/components/AddArticulo';
import ListaPreventas from './src/components/ListaPreventas';
import ListaPreventasWeb from './src/components/ListaPreventasWeb';
import UserMenuPPal from './views/UserMenuPPal';
import UserMenuPPalWeb from './views/UserMenuPPalWeb';
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
  const RenderListaPreventasWebScreen = (props) => <ListaPreventasWeb />;
  const RenderSincronizarScreen = (props) => <Sincronizar {...props} />;
  const RenderArticulosScreen = (props) => <Articulos {...props} />;
  const RenderArticulosWebScreen = (props) => <ArticulosWeb {...props} />;
  const RenderArticulosFrecuentesScreen = (props) => <ArticulosFrecuentes {...props} />;
  const RenderGestionFrecuentesScreen = (props) => <GestionFrecuentes {...props} />;
  const RenderAddArticuloScreen = (props) => <AddArticulo {...props} />;
  const RenderUsuariosScreen = (props) => <UsuariosWeb />;
  const RenderClientesScreen = (props) => <Clientes {...props} setClienteSeleccionado={setClienteSeleccionado} />;
  const RenderClientesWebScreen = (props) => <ClientesWeb {...props} setClienteSeleccionado={setClienteSeleccionado} />;
  const RenderClientesInfoScreen = (props) => <ClientesInfo {...props} />;
  const RenderPreventaScreen = (props) => <Preventa {...props} clienteSeleccionado={clienteSeleccionado} setPreventaSeleccionada={setPreventaSeleccionada} />;
  const RenderPreventaWebScreen = (props) => <PreventaWeb {...props} clienteSeleccionado={clienteSeleccionado} setPreventaSeleccionada={setPreventaSeleccionada} />;
  const RenderEditPreventaScreen = (props) => <EditPreventa {...props} clienteSeleccionado={clienteSeleccionado} setPreventaSeleccionada={setPreventaSeleccionada} />;
  const RenderEditPreventaWebScreen = (props) => <EditPreventaWeb {...props} clienteSeleccionado={clienteSeleccionado} setPreventaSeleccionada={setPreventaSeleccionada} />;
  const RenderUserMenuPPal = (props) => <UserMenuPPal {...props}/>;
  const RenderUserMenuPPalWeb = (props) => <UserMenuPPalWeb {...props}/>;
  const RenderPreventasEnviadasScreen = (props) => <PreventasEnviadas {...props} />;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#30bced',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitle: 'Atrás',
        headerBackTitleVisible: true,
      }}>
        <Stack.Screen 
          name="Login" 
          component={RenderLoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={RenderHomeScreen} 
          options={{ title: 'ASTR - Inicio' }}
        />
        <Stack.Screen 
          name="Informes" 
          component={RenderListaPreventasScreen} 
          options={{ title: 'Informes' }}
        />
        <Stack.Screen 
          name="InformesWeb" 
          component={RenderListaPreventasWebScreen} 
          options={{ title: 'Informes Web' }}
        />
        <Stack.Screen 
          name="Sincronizar" 
          component={RenderSincronizarScreen} 
          options={{ title: 'Sincronizar' }}
        />
        <Stack.Screen 
          name="Configuracion" 
          component={ConfigurarWeb} 
          options={{ title: 'Configuración' }}
        />
        <Stack.Screen 
          name="ConfigurarWeb" 
          component={ConfigurarWeb} 
          options={{ title: 'Configuración Web' }}
        />
        <Stack.Screen 
          name="Articulos" 
          component={RenderArticulosScreen} 
          options={{ title: 'Artículos' }}
        />
        <Stack.Screen 
          name="ArticulosWeb" 
          component={RenderArticulosWebScreen} 
          options={{ title: 'Artículos Web' }}
        />
        <Stack.Screen 
          name="ArticulosFrecuentes" 
          component={RenderArticulosFrecuentesScreen} 
          options={{ title: 'Artículos Frecuentes' }}
        />
        <Stack.Screen 
          name="GestionFrecuentes" 
          component={RenderGestionFrecuentesScreen} 
          options={{ title: 'Gestión Frecuentes' }}
        />
        <Stack.Screen 
          name="AddArticulo" 
          component={RenderAddArticuloScreen} 
          options={{ title: 'Agregar Artículo' }}
        />
        <Stack.Screen 
          name="Usuarios" 
          component={RenderUsuariosScreen} 
          options={{ title: 'Usuarios' }}
        />
        <Stack.Screen 
          name="Clientes" 
          component={RenderClientesScreen} 
          options={{ title: 'Clientes' }}
        />
        <Stack.Screen 
          name="ClientesWeb" 
          component={RenderClientesWebScreen} 
          options={{ title: 'Clientes Web' }}
        />
        <Stack.Screen 
          name="ClientesInfo" 
          component={RenderClientesInfoScreen} 
          options={{ title: 'Info Cliente' }}
        />
        <Stack.Screen 
          name="Preventa" 
          component={RenderPreventaScreen} 
          options={{ title: 'Nueva Preventa' }}
        />
        <Stack.Screen 
          name="PreventaWeb" 
          component={RenderPreventaWebScreen} 
          options={{ title: 'Nueva Preventa Web' }}
        />
        <Stack.Screen 
          name="EditPreventa" 
          component={RenderEditPreventaScreen} 
          options={{ title: 'Editar Preventa' }}
        />
        <Stack.Screen 
          name="EditPreventaWeb" 
          component={RenderEditPreventaWebScreen} 
          options={{ title: 'Editar Preventa Web' }}
        />
        <Stack.Screen 
          name="UserMenuPPal" 
          component={RenderUserMenuPPal} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="UserMenuPPalWeb" 
          component={RenderUserMenuPPalWeb} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PreventasEnviadas" 
          component={RenderPreventasEnviadasScreen} 
          options={{ title: 'Preventas Enviadas' }}
        />
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
