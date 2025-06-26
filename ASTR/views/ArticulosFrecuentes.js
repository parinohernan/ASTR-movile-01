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
  ScrollView
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { 
  obtenerArticulosFrecuentesOrdenados, 
  limpiarArticulosFrecuentes,
  agregarArticuloFrecuente 
} from '../src/utils/storageUtils';
import { getArticuloPorCodigo } from '../database/controllers/Articulos.Controller';

const ArticulosFrecuentes = () => {
  const navigation = useNavigation();
  const [articulosFrecuentes, setArticulosFrecuentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArticulo, setSelectedArticulo] = useState(null);

  useEffect(() => {
    cargarArticulosFrecuentes();
  }, []);

  const cargarArticulosFrecuentes = async () => {
    try {
      setLoading(true);
      const frecuentes = await obtenerArticulosFrecuentesOrdenados();
      
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
      console.error('Error al cargar artículos frecuentes:', error);
      Alert.alert('Error', 'No se pudieron cargar los artículos frecuentes');
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

  const eliminarArticuloFrecuente = async (articulo) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Está seguro que desea eliminar "${articulo.descripcion}" de los artículos frecuentes?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Obtener la lista actual y filtrar el artículo
              const frecuentesActuales = await obtenerArticulosFrecuentesOrdenados();
              const frecuentesFiltrados = frecuentesActuales.filter(item => item.id !== articulo.id);
              
              // Guardar la lista actualizada
              const { guardarArticulosFrecuentes } = await import('../src/utils/storageUtils');
              await guardarArticulosFrecuentes(frecuentesFiltrados);
              
              // Recargar la lista
              await cargarArticulosFrecuentes();
              Alert.alert('Éxito', 'Artículo eliminado de frecuentes');
            } catch (error) {
              console.error('Error al eliminar artículo frecuente:', error);
              Alert.alert('Error', 'No se pudo eliminar el artículo');
            }
          }
        }
      ]
    );
  };

  const limpiarTodos = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro que desea eliminar todos los artículos frecuentes?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await limpiarArticulosFrecuentes();
              setArticulosFrecuentes([]);
              Alert.alert('Éxito', 'Todos los artículos frecuentes han sido eliminados');
            } catch (error) {
              console.error('Error al limpiar artículos frecuentes:', error);
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

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.articuloCard} onPress={() => verArticulo(item)}>
      <View style={styles.articuloHeader}>
        <View style={styles.articuloInfo}>
          <Text style={styles.articuloCodigo}>{item.id}</Text>
          <Text style={styles.articuloDescripcion}>{item.descripcion}</Text>
        </View>
        <View style={styles.articuloActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => eliminarArticuloFrecuente(item)}
          >
            <MaterialCommunityIcons name="delete" size={20} color="#e74c3c" />
          </TouchableOpacity>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Artículos Frecuentes</Text>
        <Text style={styles.subtitle}>Artículos más utilizados localmente</Text>
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.refreshButton} onPress={cargarArticulosFrecuentes}>
          <MaterialCommunityIcons name="refresh" size={20} color="#3498db" />
          <Text style={styles.refreshText}>Actualizar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.clearButton} onPress={limpiarTodos}>
          <MaterialCommunityIcons name="delete-sweep" size={20} color="#e74c3c" />
          <Text style={styles.clearText}>Limpiar Todo</Text>
        </TouchableOpacity>
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
          renderItem={renderItem}
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
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  if (selectedArticulo) {
                    eliminarArticuloFrecuente(selectedArticulo);
                    setModalVisible(false);
                  }
                }}
              >
                <MaterialCommunityIcons name="delete" size={20} color="#ffffff" />
                <Text style={styles.modalButtonText}>Eliminar de Frecuentes</Text>
              </TouchableOpacity>
            </View>
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
  articuloActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ArticulosFrecuentes; 