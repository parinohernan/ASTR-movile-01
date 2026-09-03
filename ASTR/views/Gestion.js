import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Gestion = ({ route }) => {
  const navigation = useNavigation();
  const user = route.params?.user;

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  const menuOptions = [
    {
      name: 'Configuración',
      icon: 'cog',
      description: 'Parámetros y acceso online',
      color: '#9b59b6',
      route: 'Configuracion',
    },
    {
      name: 'Sincronizar',
      icon: 'sync',
      description: 'Enviar preventas y actualizar datos',
      color: '#27ae60',
      route: 'Sincronizar',
    },
    {
      name: 'Artículos frecuentes',
      icon: 'star-settings',
      description: 'Gestión por cliente',
      color: '#f39c12',
      route: 'GestionFrecuentes',
    },
  ];

  useFocusEffect(
    useCallback(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, [])
  );

  const handleOptionPress = (option) => {
    navigation.navigate(option.route, { user, ...option.params });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2980b9" />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Gestión</Text>
            <Text style={styles.subtitle}>Administración del dispositivo</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
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
                    size={36}
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
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  menuContainer: {
    flex: 1,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: (width - 60) / 2,
    minHeight: 130,
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
    padding: 12,
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
    lineHeight: 13,
  },
});

export default Gestion;
