import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import checkServerHandler from '../src/utils/checkServerHandler';

const { width, height } = Dimensions.get('window');

const UserMenuPPal = ({ route }) => {
  const { params } = route;
  const vendedor = params?.vendedor;
  const navigation = useNavigation();
  
  console.log("UserMenuPPal - Datos recibidos:", { params, vendedor });
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  // Procesar datos del vendedor directamente
  const user = vendedor ? {
    vendedor: vendedor.descripcion || 'Usuario',
    password: vendedor.clave || '',
    id: vendedor.id || '0',
  } : {
    vendedor: 'Usuario',
    password: '',
    id: '0',
  };
  
  console.log("UserMenuPPal - Usuario procesado:", user);

  const menuOptions = [
    { 
      name: 'Preventa', 
      icon: 'clipboard-check',
      description: 'Crear y gestionar preventas',
      color: '#3498db',
      route: 'Clientes'
    },
    { 
      name: 'Informes', 
      icon: 'file-chart',
      description: 'Ver reportes y estadísticas',
      color: '#e74c3c',
      route: 'Informes'
    },
    { 
      name: 'Sincronizar', 
      icon: 'sync',
      description: 'Sincronizar datos con el servidor',
      color: '#27ae60',
      route: 'Sincronizar'
    },
  ];

  const verServer = async () => {
    try {
      setIsCheckingConnection(true);
      const serverStatus = await checkServerHandler();
      setIsServerOnline(serverStatus);
    } catch (error) {
      console.error('Error checking server:', error);
      setIsServerOnline(false);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Animación de entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      const unsubscribe = NetInfo.addEventListener(state => {
        setIsConnected(state.isConnected);
        verServer();
      });

      return () => {
        unsubscribe();
      };
    }, [])
  );

  const handleOptionPress = (option) => {
    console.log(`Seleccionaste: ${option.name}`);
    navigation.navigate(option.route, { user });
  };

  const getConnectionStatusText = () => {
    if (isCheckingConnection) return 'Verificando conexión...';
    if (!isConnected) return 'Sin conexión a internet';
    if (!isServerOnline) return 'Servidor no disponible';
    return 'Todo conectado';
  };

  const getConnectionStatusColor = () => {
    if (isCheckingConnection) return '#f39c12';
    if (!isConnected || !isServerOnline) return '#e74c3c';
    return '#27ae60';
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Header con información del usuario */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons 
                name="account-circle" 
                size={60} 
                color="#3498db" 
              />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.vendedor}</Text>
              <Text style={styles.userId}>ID: {user.id}</Text>
            </View>
          </View>
          
          {/* Estado de conexión */}
          <View style={styles.connectionStatus}>
            <View style={styles.statusItem}>
              <MaterialCommunityIcons
                name={isConnected ? 'wifi' : 'wifi-off'}
                size={20}
                color={isConnected ? '#27ae60' : '#e74c3c'}
              />
              <Text style={[styles.statusText, { color: isConnected ? '#27ae60' : '#e74c3c' }]}>
                {isConnected ? 'Online' : 'Offline'}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <MaterialCommunityIcons
                name={isServerOnline ? 'server' : 'server-off'}
                size={20}
                color={isServerOnline ? '#27ae60' : '#e74c3c'}
              />
              <Text style={[styles.statusText, { color: isServerOnline ? '#27ae60' : '#e74c3c' }]}>
                {isServerOnline ? 'Servidor OK' : 'Servidor Off'}
              </Text>
            </View>
          </View>
        </View>

        {/* Logo central */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>Osvi</Text>
          <Text style={styles.appSubtitle}>Sistema de Gestión De Preventas</Text>
        </View>

        {/* Menú de opciones */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>¿Qué deseas hacer?</Text>
          <View style={styles.menuGrid}>
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, { backgroundColor: option.color }]}
                onPress={() => handleOptionPress(option)}
                activeOpacity={0.8}
              >
                <View style={styles.menuItemContent}>
                  <MaterialCommunityIcons 
                    name={option.icon} 
                    size={40} 
                    color="#ffffff" 
                    style={styles.menuIcon}
                  />
                  <Text style={styles.menuItemTitle}>{option.name}</Text>
                  <Text style={styles.menuItemDescription}>{option.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#30bced',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  connectionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 15,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 15,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  menuContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: (width - 60) / 3,
    aspectRatio: 1,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItemContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  menuIcon: {
    marginBottom: 8,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 10,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 12,
  },
});

export default UserMenuPPal;
