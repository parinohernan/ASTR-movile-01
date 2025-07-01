import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';

// Importaciones específicas para web
import LoginWeb from './views/LoginWeb';
import ConfigurarWeb from './views/ConfigurarWeb';

const Stack = createStackNavigator();

// Componente de carga para web
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Cargando ASTR Web...</Text>
  </View>
);

const AppWeb = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🌐 Iniciando aplicación ASTR Web...');
        
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
          { name: 'apple-mobile-web-app-title', content: 'ASTR' },
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

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{
        headerShown: false
      }}>
        <Stack.Screen name="Login" component={LoginWeb} />
        <Stack.Screen name="Configuracion" component={ConfigurarWeb} />
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

export default AppWeb; 