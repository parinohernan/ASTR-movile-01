import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Switch, Modal } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getClientes } from '../database/controllers/Clientes.Controller';
import { nextPreventa, getConfiguracionDelStorage } from '../src/utils/storageConfigData';
import { Searchbar } from 'react-native-paper';
import checkServerHandler from '../src/utils/checkServerHandler';

const Clientes = ({ route }) => {
  const [search, setSearch] = useState('');
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const { user } = route.params || {};
  const [showOnlyMyClients, setShowOnlyMyClients] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const fetchInitialData = async () => {
      try {
          setLoading(true);
          setError(null);

          // Cargar la configuración para saber el estado inicial del filtro
          const config = await getConfiguracionDelStorage();
          setShowOnlyMyClients(config?.filtrarClientesPorVendedor ?? true);

          // Cargar los clientes
        const clientesFromDB = await getClientes();
        setClientes(clientesFromDB);
          console.log(`Se cargaron ${clientesFromDB.length} clientes`);

      } catch (error) {
          console.error('Error al obtener datos iniciales: ', error);
          setError('Error al cargar la configuración o los clientes.');
        } finally {
          setLoading(false);
      }
    };
      
      fetchInitialData();
    }, [])
  );

  const filteredClientes = clientes
    .filter(cliente => {
      if (showOnlyMyClients && user) {
        return String(cliente.codigoVendedor) === String(user.id);
      }
      return true;
    })
    .filter(
      (cliente) =>
        search.length === 0 ||
        (typeof cliente.id === 'string' &&
        (cliente.descripcion.toLowerCase().includes(search.toLowerCase()) ||
        cliente.id.toLowerCase().includes(search.toLowerCase())))
  );

  const handleClienteInfoClick = async (cliente) => {
    setIsButtonDisabled(true);
    try {
    const hayInternet = await checkServerHandler();
    if (hayInternet) {
      navigation.navigate('ClientesInfo', {cliente});
      } else {
        Alert.alert(
          "Sin conexión",
          "No hay acceso al servidor. Verifique su conexión a internet.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error al verificar conexión:", error);
      Alert.alert("Error", "No se pudo verificar la conexión al servidor.");
    } finally {
    setIsButtonDisabled(false);
    }
  };

  const handleClientClick = async (cliente) => {
    try {
    let preventaNumero = await nextPreventa(); 
      let edit = false;
    navigation.navigate('Preventa', { preventaNumero, cliente, edit });
    } catch (error) {
      console.error("Error al crear preventa:", error);
      Alert.alert("Error", "No se pudo crear la preventa.");
    }
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#30bced" />
          <Text style={styles.emptyStateText}>Cargando clientes...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="alert-circle" size={60} color="#e74c3c" />
          <Text style={styles.emptyStateText}>{error}</Text>
          <Text style={styles.emptyStateSubtext}>Vaya a Sincronizar para cargar los clientes</Text>
        </View>
      );
    }
    
    if (clientes.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="account-group" size={60} color="#95a5a6" />
          <Text style={styles.emptyStateText}>No hay clientes disponibles</Text>
          <Text style={styles.emptyStateSubtext}>Vaya a Sincronizar para cargar los clientes</Text>
        </View>
      );
    }
    
    if (filteredClientes.length === 0 && search.length > 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="magnify" size={60} color="#95a5a6" />
          <Text style={styles.emptyStateText}>No se encontraron clientes</Text>
          <Text style={styles.emptyStateSubtext}>Intente con otro término de búsqueda</Text>
        </View>
      );
    }
    
    return null;
  };

  const renderClienteItem = ({ item }) => (
    <View style={styles.clienteCard}>
      <View style={styles.clienteInfo}>
        <View style={styles.clienteHeader}>
          <MaterialCommunityIcons 
            name="account" 
            size={24} 
            color="#3498db" 
            style={styles.clienteIcon}
          />
          <View style={styles.clienteDetails}>
            <Text style={styles.clienteName}>{item.descripcion}</Text>
            <Text style={styles.clienteCode}>Código: {item.id}</Text>
          </View>
        </View>
        
        <View style={styles.clienteMeta}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="tag" size={16} color="#7f8c8d" />
            <Text style={styles.metaText}>Lista {item.listaPrecio}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.clienteActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.infoButton]} 
          onPress={() => handleClienteInfoClick(item)} 
          disabled={isButtonDisabled}
        >
          <MaterialCommunityIcons name="information" size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>Info</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.preventaButton]} 
          onPress={() => handleClientClick(item)}
        >
          <MaterialCommunityIcons name="cart-plus" size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>Preventa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Opciones de Filtro</Text>
            
            {user && (
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Mostrar solo mis clientes</Text>
                <Switch
                  value={showOnlyMyClients}
                  onValueChange={setShowOnlyMyClients}
                  trackColor={{ false: "#bdc3c7", true: "#3498db" }}
                  thumbColor={showOnlyMyClients ? "#ffffff" : "#f4f3f4"}
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Seleccionar Cliente</Text>
          <Text style={styles.subtitle}>Elige un cliente para crear una preventa</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.headerIcon}>
          <MaterialCommunityIcons name="filter-variant" size={26} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
      <Searchbar
          placeholder="Buscar por nombre o código..."
          onChangeText={setSearch}
        value={search}
          style={styles.searchbar}
          iconColor="#3498db"
      />
      </View>

      <View style={styles.content}>
        {renderEmptyState() ? (
          renderEmptyState()
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {filteredClientes.length} cliente{filteredClientes.length !== 1 ? 's' : ''} encontrado{filteredClientes.length !== 1 ? 's' : ''}
              </Text>
            </View>
    
      <FlatList 
        data={filteredClientes}
        keyExtractor={(item) => `${item.id}-${item.descripcion}`}
              renderItem={renderClienteItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#30bced',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#0c2f3c',
  },
  headerIcon: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
  },
  searchbar: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    elevation: 2,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  resultsText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
  },
  clienteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clienteInfo: {
    marginBottom: 15,
  },
  clienteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  clienteIcon: {
    marginRight: 12,
  },
  clienteDetails: {
    flex: 1,
  },
  clienteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  clienteCode: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  clienteMeta: {
    marginLeft: 36,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  clienteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoButton: {
    backgroundColor: '#3498db',
  },
  preventaButton: {
    backgroundColor: '#27ae60',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  closeButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    elevation: 2,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default Clientes;