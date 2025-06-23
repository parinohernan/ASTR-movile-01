import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions, StatusBar, Animated } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { version, producto, empresa, whatsapp, mail } from '../src/cconstantes/constantes';

const { width, height } = Dimensions.get('window');

const Home = ({ user }) => {
  const navigation = useNavigation();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  const menuOptions = [
    {
      name: 'Vendedores',
      icon: 'account-group',
      description: 'Gestionar usuarios y vendedores',
      color: '#3498db',
      route: 'Usuarios'
    },
    {
      name: 'Sincronizar',
      icon: 'sync',
      description: 'Sincronizar datos con el servidor',
      color: '#27ae60',
      route: 'Sincronizar'
    },
    {
      name: 'Configuración',
      icon: 'cog',
      description: 'Configurar parámetros del sistema',
      color: '#e74c3c',
      route: 'Configuracion'
    },
  ];

  useFocusEffect(
    React.useCallback(() => {
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
    }, [])
  );

  const handleOptionPress = (option) => {
    console.log(`Seleccionaste: ${option.name}`);
    navigation.navigate(option.route, {});
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#073a70" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header con logo y título */}
          <View style={styles.header}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>Osvi</Text>
              <Text style={styles.subtitleText}>Panel de Administración</Text>
            </View>
          </View>

          {/* Información del sistema */}
          <View style={styles.systemInfo}>
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="information" size={24} color="#3498db" />
              <Text style={styles.infoText}>
                {empresa} - {producto} v{version}
              </Text>
            </View>
          </View>

          {/* Menú de opciones */}
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Opciones de Administración</Text>
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
                    {/* <Text style={styles.menuItemTitle}>{option.name}</Text> */}
                    <Text style={styles.menuItemDescription}>{option.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Footer con información de contacto */}
          <View style={styles.footer}>
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="cellphone" size={20} color="#073a70" />
                <Text style={styles.contactText}>{empresa}</Text>
              </View>
              
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="email" size={20} color="#D44638" />
                <Text style={styles.contactText}>{mail}</Text>
              </View>
              
              <View style={styles.contactItem}>
                <MaterialCommunityIcons name="whatsapp" size={20} color="#075E54" />
                <Text style={styles.contactText}>{whatsapp}</Text>
              </View>
            </View>
            
            <View style={styles.developerInfo}>
              <Image
                source={require('../assets/hpdev.png')}
                style={styles.developerLogo}
                resizeMode="contain"
              />
              <Text style={styles.developerText}>Desarrollado por HP Dev</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginRight: 15,
  },
  titleContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#073a70',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: '#eb1e2a',
    fontWeight: '600',
  },
  systemInfo: {
    marginBottom: 30,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 10,
    fontWeight: '500',
  },
  menuContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
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
  footer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  contactInfo: {
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 10,
    fontWeight: '500',
  },
  developerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 15,
  },
  developerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  developerText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
});

export default Home;
