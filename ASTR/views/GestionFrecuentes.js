import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { 
  obtenerArticulosFrecuentesCombinados,
  obtenerArticulosFrecuentesGlobalesOrdenados,
  limpiarArticulosFrecuentesCliente,
  limpiarArticulosFrecuentesGlobales,
  limpiarTodosArticulosFrecuentes,
  obtenerClientesConFrecuentes
} from '../src/utils/storageUtils';
import { getArticuloPorCodigo } from '../database/controllers/Articulos.Controller';
import { getClientes } from '../database/controllers/Clientes.Controller';

const GestionFrecuentes = () => {
  const navigation = useNavigation();
  const [articulosFrecuentes, setArticulosFrecuentes] = useState([]);
  const [clientesConFrecuentes, setClientesConFrecuentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [mostrarSoloGlobales, setMostrarSoloGlobales] = useState(false);
  const [mostrarSoloCliente, setMostrarSoloCliente] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [selectedCliente, mostrarSoloGlobales, mostrarSoloCliente]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar clientes con frecuentes
      const clientes = await obtenerClientesConFrecuentes();
      const clientesCompletos = await Promise.all(
        clientes.map(async (cliente) => {
          try {
            const clienteCompleto = await getClientes(cliente.id);
            if (clienteCompleto && clienteCompleto.length > 0) {
              return {
                ...cliente,
                descripcion: clienteCompleto[0].descripcion || cliente.id
              };
            }
            return cliente;
          } catch (error) {
            return cliente;
          }
        })
      );
      setClientesConFrecuentes(clientesCompletos);
      
      // Cargar artículos frecuentes según la selección
      let frecuentes = [];
      if (mostrarSoloGlobales) {
        frecuentes = await obtenerArticulosFrecuentesGlobalesOrdenados();
        frecuentes = frecuentes.map(art => ({ ...art, esGlobal: true }));
      } else if (mostrarSoloCliente && selectedCliente) {
        const { obtenerArticulosFrecuentesClienteOrdenados } = await import('../src/utils/storageUtils');
        frecuentes = await obtenerArticulosFrecuentesClienteOrdenados(selectedCliente.id);
        frecuentes = frecuentes.map(art => ({ ...art, esCliente: true }));
      } else if (selectedCliente) {
        frecuentes = await obtenerArticulosFrecuentesCombinados(selectedCliente.id);
      } else {
        // Mostrar globales por defecto
        frecuentes = await obtenerArticulosFrecuentesGlobalesOrdenados();
        frecuentes = frecuentes.map(art => ({ ...art, esGlobal: true }));
      }
      
      // Obtener información completa de cada artículo
      const articulosCompletos = await Promise.all(
        frecuentes.map(async (frecuente) => {
          try {
            const articuloCompleto = await getArticuloPorCodigo(frecuente.id);
            if (articuloCompleto && articuloCompleto.length > 0) {
              return {
                ...frecuente,
                ...articuloCompleto[0]
              };
            }
            return frecuente;
          } catch (error) {
            console.error('Error al obtener artículo completo:', error);
            return frecuente;
          }
        })
      );
      
      setArticulosFrecuentes(articulosCompletos);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (timestamp) => {
    const fecha = new Date(timestamp);
    return fecha.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const seleccionarCliente = (cliente) => {
    setSelectedCliente(cliente);
    setMostrarSoloGlobales(false);
    setMostrarSoloCliente(false);
  };

  const mostrarGlobales = () => {
    setSelectedCliente(null);
    setMostrarSoloGlobales(true);
    setMostrarSoloCliente(false);
  };

  const mostrarCombinados = () => {
    setMostrarSoloGlobales(false);
    setMostrarSoloCliente(false);
  };

  const activarSoloCliente = () => {
    if (selectedCliente) {
      setMostrarSoloGlobales(false);
      setMostrarSoloCliente(true);
    }
  };

  const limpiarFrecuentesCliente = async (cliente) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Está seguro que desea eliminar todos los artículos frecuentes del cliente "${cliente.descripcion}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await limpiarArticulosFrecuentesCliente(cliente.id);
              await cargarDatos();
              Alert.alert('Éxito', 'Artículos frecuentes del cliente eliminados');
            } catch (error) {
              console.error('Error al eliminar frecuentes del cliente:', error);
              Alert.alert('Error', 'No se pudieron eliminar los artículos frecuentes');
            }
          }
        }
      ]
    );
  };

  const limpiarGlobales = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro que desea eliminar todos los artículos frecuentes globales?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await limpiarArticulosFrecuentesGlobales();
              await cargarDatos();
              Alert.alert('Éxito', 'Artículos frecuentes globales eliminados');
            } catch (error) {
              console.error('Error al eliminar frecuentes globales:', error);
              Alert.alert('Error', 'No se pudieron eliminar los artículos frecuentes');
            }
          }
        }
      ]
    );
  };

  const limpiarTodos = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro que desea eliminar TODOS los artículos frecuentes (clientes + globales)?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await limpiarTodosArticulosFrecuentes();
              await cargarDatos();
              Alert.alert('Éxito', 'Todos los artículos frecuentes han sido eliminados');
            } catch (error) {
              console.error('Error al limpiar todos los frecuentes:', error);
              Alert.alert('Error', 'No se pudieron eliminar los artículos frecuentes');
            }
          }
        }
      ]
    );
  };

  const verArticulo = (articulo) => {
    setSelectedArticulo(articulo);
    setModalVisible(true);
  };

  const renderClienteItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.clienteCard,
        selectedCliente?.id === item.id && styles.clienteCardSelected
      ]} 
      onPress={() => seleccionarCliente(item)}
    >
      <View style={styles.clienteInfo}>
        <Text style={styles.clienteCodigo}>{item.id}</Text>
        <Text style={styles.clienteDescripcion}>{item.descripcion}</Text>
        <Text style={styles.clienteFrecuentes}>{item.cantidadFrecuentes} artículos frecuentes</Text>
      </View>
      <View style={styles.clienteActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => limpiarFrecuentesCliente(item)}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderArticuloItem = ({ item }) => (
    <TouchableOpacity style={styles.articuloCard} onPress={() => verArticulo(item)}>
      <View style={styles.articuloHeader}>
        <View style={styles.articuloInfo}>
          <Text style={styles.articuloCodigo}>{item.id}</Text>
          <Text style={styles.articuloDescripcion}>{item.descripcion}</Text>
          <View style={styles.articuloTipo}>
            {item.esGlobal && (
              <View style={styles.tipoGlobal}>
                <MaterialCommunityIcons name="earth" size={14} color="#3498db" />
                <Text style={styles.tipoTexto}>Global</Text>
              </View>
            )}
            {item.esCliente && (
              <View style={styles.tipoCliente}>
                <MaterialCommunityIcons name="account" size={14} color="#27ae60" />
                <Text style={styles.tipoTexto}>Cliente</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.articuloDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="counter" size={16} color="#3498db" />
            <Text style={styles.detailText}>Frecuencia: {item.frecuencia}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar" size={16} color="#27ae60" />
            <Text style={styles.detailText}>
              Último uso: {formatearFecha(item.ultimoUso)}
            </Text>
          </View>
        </View>
        
        {item.existencia !== undefined && (
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="warehouse" size={16} color="#7f8c8d" />
              <Text style={styles.detailText}>Stock: {item.existencia}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="star-outline" size={60} color="#95a5a6" />
      <Text style={styles.emptyStateText}>No hay artículos frecuentes</Text>
      <Text style={styles.emptyStateSubtext}>
        Los artículos que agregues a las preventas se guardarán automáticamente aquí
      </Text>
    </View>
  );

  const getTituloSeccion = () => {
    if (mostrarSoloGlobales) return 'Frecuentes Globales';
    if (mostrarSoloCliente && selectedCliente) return `Frecuentes de ${selectedCliente.descripcion}`;
    if (selectedCliente) return `Frecuentes Combinados - ${selectedCliente.descripcion}`;
    return 'Frecuentes Globales';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Frecuentes</Text>
        <Text style={styles.subtitle}>Artículos frecuentes por cliente y globales</Text>
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.refreshButton} onPress={cargarDatos}>
          <MaterialCommunityIcons name="refresh" size={20} color="#3498db" />
          <Text style={styles.refreshText}>Actualizar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.clearButton} onPress={limpiarTodos}>
          <MaterialCommunityIcons name="delete-sweep" size={20} color="#e74c3c" />
          <Text style={styles.clearText}>Limpiar Todo</Text>
        </TouchableOpacity>
      </View>

      {/* Selector de vista */}
      <View style={styles.viewSelector}>
        <TouchableOpacity 
          style={[styles.viewButton, !selectedCliente && !mostrarSoloGlobales && styles.viewButtonActive]} 
          onPress={mostrarGlobales}
        >
          <MaterialCommunityIcons name="earth" size={16} color="#3498db" />
          <Text style={styles.viewButtonText}>Globales</Text>
        </TouchableOpacity>
        
        {selectedCliente && (
          <>
            <TouchableOpacity 
              style={[styles.viewButton, mostrarSoloCliente && styles.viewButtonActive]} 
              onPress={activarSoloCliente}
            >
              <MaterialCommunityIcons name="account" size={16} color="#27ae60" />
              <Text style={styles.viewButtonText}>Solo Cliente</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.viewButton, !mostrarSoloGlobales && !mostrarSoloCliente && styles.viewButtonActive]} 
              onPress={mostrarCombinados}
            >
              <MaterialCommunityIcons name="merge" size={16} color="#9b59b6" />
              <Text style={styles.viewButtonText}>Combinados</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Lista de clientes */}
      {!mostrarSoloGlobales && (
        <View style={styles.clientesSection}>
          <Text style={styles.sectionTitle}>Clientes con Frecuentes</Text>
          <FlatList
            data={clientesConFrecuentes}
            keyExtractor={(item) => item.id}
            renderItem={renderClienteItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.clientesList}
          />
        </View>
      )}

      {/* Título de la sección actual */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{getTituloSeccion()}</Text>
        {mostrarSoloGlobales && (
          <TouchableOpacity style={styles.clearSectionButton} onPress={limpiarGlobales}>
            <MaterialCommunityIcons name="delete" size={16} color="#e74c3c" />
            <Text style={styles.clearSectionText}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#30bced" />
          <Text style={styles.loadingText}>Cargando artículos frecuentes...</Text>
        </View>
      ) : (
        <FlatList
          data={articulosFrecuentes}
          keyExtractor={(item) => item.id}
          renderItem={renderArticuloItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Artículo {selectedArticulo?.id}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {selectedArticulo && (
                <View>
                  <Text style={styles.modalLabel}>Descripción:</Text>
                  <Text style={styles.modalValue}>{selectedArticulo.descripcion}</Text>
                  
                  <Text style={styles.modalLabel}>Tipo:</Text>
                  <Text style={styles.modalValue}>
                    {selectedArticulo.esGlobal ? '🌍 Global' : 
                     selectedArticulo.esCliente ? '👤 Cliente' : '🔄 Combinado'}
                  </Text>
                  
                  <Text style={styles.modalLabel}>Frecuencia:</Text>
                  <Text style={styles.modalValue}>{selectedArticulo.frecuencia} veces</Text>
                  
                  <Text style={styles.modalLabel}>Fecha de agregado:</Text>
                  <Text style={styles.modalValue}>{formatearFecha(selectedArticulo.fechaAgregado)}</Text>
                  
                  <Text style={styles.modalLabel}>Último uso:</Text>
                  <Text style={styles.modalValue}>{formatearFecha(selectedArticulo.ultimoUso)}</Text>
                  
                  {selectedArticulo.existencia !== undefined && (
                    <>
                      <Text style={styles.modalLabel}>Stock:</Text>
                      <Text style={styles.modalValue}>{selectedArticulo.existencia}</Text>
                    </>
                  )}
                  
                  {selectedArticulo.precioCosto !== undefined && (
                    <>
                      <Text style={styles.modalLabel}>Precio de costo:</Text>
                      <Text style={styles.modalValue}>${selectedArticulo.precioCosto?.toFixed(2)}</Text>
                    </>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#30bced',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#0c2f3c',
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
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  refreshText: {
    marginLeft: 5,
    color: '#3498db',
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearText: {
    marginLeft: 5,
    color: '#e74c3c',
    fontWeight: '500',
  },
  viewSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  viewButtonActive: {
    backgroundColor: '#3498db',
  },
  viewButtonText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '500',
    color: '#2c3e50',
  },
  clientesSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  clearSectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearSectionText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: '500',
  },
  clientesList: {
    paddingHorizontal: 20,
  },
  clienteCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    minWidth: 150,
  },
  clienteCardSelected: {
    backgroundColor: '#3498db',
  },
  clienteInfo: {
    flex: 1,
  },
  clienteCodigo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  clienteDescripcion: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  clienteFrecuentes: {
    fontSize: 10,
    color: '#95a5a6',
    marginTop: 2,
  },
  clienteActions: {
    marginTop: 8,
  },
  actionButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  listContainer: {
    padding: 15,
  },
  articuloCard: {
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
  articuloHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  articuloInfo: {
    flex: 1,
  },
  articuloCodigo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  articuloDescripcion: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  articuloTipo: {
    flexDirection: 'row',
    marginTop: 4,
  },
  tipoGlobal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ebf3fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  tipoCliente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tipoTexto: {
    fontSize: 10,
    color: '#2c3e50',
    marginLeft: 2,
    fontWeight: '500',
  },
  articuloDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 5,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 15,
    marginBottom: 5,
  },
  modalValue: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
});

export default GestionFrecuentes; 