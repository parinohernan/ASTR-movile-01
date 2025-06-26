import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Modal, 
  ScrollView,
  Share,
  ActivityIndicator
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { obtenerPreventasEnviadas, limpiarPreventasEnviadas, exportarPreventaComoTexto } from '../src/utils/storageUtils';

const PreventasEnviadas = () => {
  const navigation = useNavigation();
  const [preventas, setPreventas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPreventa, setSelectedPreventa] = useState(null);

  useEffect(() => {
    cargarPreventas();
  }, []);

  const cargarPreventas = async () => {
    try {
      setLoading(true);
      const preventasEnviadas = await obtenerPreventasEnviadas();
      setPreventas(preventasEnviadas);
    } catch (error) {
      console.error('Error al cargar preventas enviadas:', error);
      Alert.alert('Error', 'No se pudieron cargar las preventas enviadas');
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

  const formatearImporte = (importe) => {
    return `$${parseFloat(importe || 0).toFixed(2)}`;
  };

  // Función para determinar el estado real de la preventa
  const obtenerEstadoReal = (preventa) => {
    // Si no hay resultado de envío, mostrar como enviada (comportamiento por defecto)
    if (!preventa.resultadoEnvio) {
      return { estado: 'enviada', texto: 'Enviada', icono: 'check-circle', color: '#27ae60' };
    }

    const { codigoServidor, tipo, exitoso } = preventa.resultadoEnvio;
    
    // Si el código del servidor es 201, es exitoso
    if (codigoServidor === 201) {
      return { estado: 'enviada', texto: 'Enviada', icono: 'check-circle', color: '#27ae60' };
    }
    
    // Si el código es 500 pero es duplicada, mostrar como duplicada
    if (codigoServidor === 500 && tipo === 'duplicada') {
      return { estado: 'duplicada', texto: 'Duplicada', icono: 'alert-circle', color: '#f39c12' };
    }
    
    // Si no es exitoso, mostrar como error
    if (!exitoso) {
      return { estado: 'error', texto: 'Error', icono: 'close-circle', color: '#e74c3c' };
    }
    
    // Si es exitoso pero no es código 201, mostrar como dudosa
    if (exitoso && codigoServidor !== 201) {
      return { estado: 'dudosa', texto: 'Dudosa', icono: 'help-circle', color: '#9b59b6' };
    }
    
    // Por defecto, mostrar como enviada
    return { estado: 'enviada', texto: 'Enviada', icono: 'check-circle', color: '#27ae60' };
  };

  const verPreventa = (preventa) => {
    setSelectedPreventa(preventa);
    setModalVisible(true);
  };

  const compartirPreventa = async (preventa) => {
    try {
      const texto = exportarPreventaComoTexto(preventa);
      await Share.share({
        message: `Preventa ${preventa.DocumentoNumero}\n\n${texto}`,
        title: `Preventa ${preventa.DocumentoNumero}`
      });
    } catch (error) {
      console.error('Error al compartir:', error);
      Alert.alert('Error', 'No se pudo compartir la preventa');
    }
  };

  const limpiarRespaldo = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro que desea eliminar todas las preventas enviadas del respaldo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await limpiarPreventasEnviadas();
              setPreventas([]);
              Alert.alert('Éxito', 'Respaldo eliminado correctamente');
            } catch (error) {
              console.error('Error al limpiar respaldo:', error);
              Alert.alert('Error', 'No se pudo eliminar el respaldo');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const estadoReal = obtenerEstadoReal(item);
    
    return (
      <TouchableOpacity style={styles.preventaCard} onPress={() => verPreventa(item)}>
        <View style={styles.preventaHeader}>
          <View style={styles.preventaInfo}>
            <Text style={styles.preventaNumero}>Preventa {item.DocumentoNumero}</Text>
            <Text style={styles.preventaCliente}>
              Cliente: {item.ClienteCodigo}
              {item.ClienteDescripcion && (
                <Text style={styles.clienteDescripcion}> - {item.ClienteDescripcion}</Text>
              )}
            </Text>
          </View>
          <View style={styles.preventaActions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => compartirPreventa(item)}
            >
              <MaterialCommunityIcons name="share" size={20} color="#3498db" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.preventaDetails}>
          <Text style={styles.preventaFecha}>{formatearFecha(item.timestamp)}</Text>
          <Text style={styles.preventaImporte}>Total: {formatearImporte(item.ImporteTotal)}</Text>
          <Text style={styles.preventaItems}>{item.items?.length || 0} artículos</Text>
        </View>
        
        <View style={[
          styles.estadoEnviada, 
          estadoReal.estado === 'duplicada' && styles.estadoDuplicada,
          estadoReal.estado === 'error' && styles.estadoError,
          estadoReal.estado === 'dudosa' && styles.estadoDudosa
        ]}>
          <MaterialCommunityIcons 
            name={estadoReal.icono}
            size={16} 
            color={estadoReal.color}
          />
          <Text style={[
            styles.estadoTexto,
            estadoReal.estado === 'duplicada' && styles.estadoTextoDuplicada,
            estadoReal.estado === 'error' && styles.estadoTextoError,
            estadoReal.estado === 'dudosa' && styles.estadoTextoDudosa
          ]}>
            {estadoReal.texto}
          </Text>
        </View>
        
        {item.resultadoEnvio && (
          <View style={styles.resultadoInfo}>
            <Text style={styles.resultadoTipo}>
              Tipo: {item.resultadoEnvio.tipo === 'nuevo' ? 'Nueva' : 
                     item.resultadoEnvio.tipo === 'duplicada' ? 'Duplicada' : 
                     'Error'}
            </Text>
            <Text style={styles.resultadoMensaje}>
              {item.resultadoEnvio.mensaje}
            </Text>
            {item.resultadoEnvio.codigoServidor && item.resultadoEnvio.codigoServidor !== 'N/A' && (
              <Text style={styles.resultadoCodigo}>
                Código: {item.resultadoEnvio.codigoServidor}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="file-document-outline" size={60} color="#95a5a6" />
      <Text style={styles.emptyStateText}>No hay preventas enviadas</Text>
      <Text style={styles.emptyStateSubtext}>Las preventas enviadas aparecerán aquí como respaldo</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Preventas Enviadas</Text>
        <Text style={styles.subtitle}>Respaldo de las últimas 50 preventas</Text>
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.refreshButton} onPress={cargarPreventas}>
          <MaterialCommunityIcons name="refresh" size={20} color="#3498db" />
          <Text style={styles.refreshText}>Actualizar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.clearButton} onPress={limpiarRespaldo}>
          <MaterialCommunityIcons name="delete-sweep" size={20} color="#e74c3c" />
          <Text style={styles.clearText}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#30bced" />
          <Text style={styles.loadingText}>Cargando preventas...</Text>
        </View>
      ) : (
        <FlatList
          data={preventas}
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
                Preventa {selectedPreventa?.DocumentoNumero}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalText}>
                {selectedPreventa ? exportarPreventaComoTexto(selectedPreventa) : ''}
              </Text>
              
              {/* Información detallada del resultado del envío */}
              {selectedPreventa?.resultadoEnvio && (
                <View style={styles.modalResultadoSection}>
                  <Text style={styles.modalResultadoTitle}>Resultado del Envío:</Text>
                  <View style={styles.modalResultadoDetails}>
                    <Text style={styles.modalResultadoLabel}>Estado:</Text>
                    <Text style={styles.modalResultadoValue}>
                      {selectedPreventa.resultadoEnvio.exitoso ? '✅ Exitoso' : '❌ Fallido'}
                    </Text>
                    
                    <Text style={styles.modalResultadoLabel}>Tipo:</Text>
                    <Text style={styles.modalResultadoValue}>
                      {selectedPreventa.resultadoEnvio.tipo === 'nuevo' ? '🆕 Nueva' : 
                       selectedPreventa.resultadoEnvio.tipo === 'duplicada' ? '🔄 Duplicada' : 
                       '⚠️ Error'}
                    </Text>
                    
                    <Text style={styles.modalResultadoLabel}>Mensaje:</Text>
                    <Text style={styles.modalResultadoValue}>
                      {selectedPreventa.resultadoEnvio.mensaje}
                    </Text>
                    
                    {selectedPreventa.resultadoEnvio.codigoServidor && selectedPreventa.resultadoEnvio.codigoServidor !== 'N/A' && (
                      <>
                        <Text style={styles.modalResultadoLabel}>Código del Servidor:</Text>
                        <Text style={styles.modalResultadoValue}>
                          {selectedPreventa.resultadoEnvio.codigoServidor}
                        </Text>
                      </>
                    )}
                    
                    {selectedPreventa.resultadoEnvio.respuestaServidor && (
                      <>
                        <Text style={styles.modalResultadoLabel}>Respuesta del Servidor:</Text>
                        <Text style={styles.modalResultadoValue}>
                          {JSON.stringify(selectedPreventa.resultadoEnvio.respuestaServidor, null, 2)}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  if (selectedPreventa) {
                    compartirPreventa(selectedPreventa);
                  }
                }}
              >
                <MaterialCommunityIcons name="share" size={20} color="#ffffff" />
                <Text style={styles.modalButtonText}>Compartir</Text>
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
  preventaCard: {
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
  preventaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  preventaInfo: {
    flex: 1,
  },
  preventaNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  preventaCliente: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  preventaActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  preventaDetails: {
    marginBottom: 10,
  },
  preventaFecha: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  preventaImporte: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 2,
  },
  preventaItems: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  estadoEnviada: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  estadoTexto: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: 'bold',
    marginLeft: 4,
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
  modalText: {
    fontSize: 12,
    color: '#2c3e50',
    fontFamily: 'monospace',
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
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  estadoDuplicada: {
    backgroundColor: '#fef9e7',
  },
  estadoTextoDuplicada: {
    color: '#f39c12',
  },
  estadoError: {
    backgroundColor: '#fdf2f2',
  },
  estadoTextoError: {
    color: '#e74c3c',
  },
  resultadoInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  resultadoTipo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  resultadoMensaje: {
    fontSize: 11,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  resultadoCodigo: {
    fontSize: 10,
    color: '#95a5a6',
    fontFamily: 'monospace',
  },
  modalResultadoSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  modalResultadoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  modalResultadoDetails: {
    flexDirection: 'column',
  },
  modalResultadoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
  },
  modalResultadoValue: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  clienteDescripcion: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  estadoDudosa: {
    backgroundColor: '#f3e5f5',
  },
  estadoTextoDudosa: {
    color: '#9b59b6',
  },
});

export default PreventasEnviadas;
