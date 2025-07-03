import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import indexedDBHandler from '../utils/indexedDBHandler';
import { sincronizarPreventaWeb } from '../utils/webSyncHandler';

const ListaPreventasWeb = () => {
  const navigation = useNavigation();
  const [preventas, setPreventas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncingItem, setSyncingItem] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);

  useEffect(() => {
    cargarPreventas();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log("🔄 ListaPreventasWeb recibió foco - actualizando datos automáticamente");
      cargarPreventas();
      
      return () => {
        console.log("📱 ListaPreventasWeb perdió foco");
      };
    }, [])
  );

  const cargarPreventas = async () => {
    try {
      setLoading(true);
      console.log("📊 Cargando preventas desde IndexedDB...");
      
      const preventasData = await indexedDBHandler.obtenerTodasPreventas();
      console.log("📋 Preventas obtenidas:", preventasData.length);
      
      // Mapear los datos de IndexedDB al formato esperado
      const preventasMapeadas = preventasData.map(preventa => ({
        numero: preventa.numero,
        cliente: preventa.cliente?.descripcion || 'Cliente sin nombre',
        clienteCodigo: preventa.cliente?.id || '',
        importe: preventa.total || 0,
        cantidadItems: preventa.items?.length || 0,
        fecha: preventa.fecha,
        observacion: preventa.nota || '',
        estado: preventa.estado || 'borrador',
        // Datos completos para edición
        clienteCompleto: preventa.cliente,
        items: preventa.items || []
      }));
      
      setPreventas(preventasMapeadas);
      console.log("✅ Preventas cargadas correctamente");
    } catch (error) {
      console.error('❌ Error al cargar preventas:', error);
      setPreventas([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const ListaPreventasActuales = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.emptyStateText}>Cargando preventas...</Text>
        </View>
      );
    }

    return (
      <View style={styles.containerResults}>
        {preventas.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="file-document-outline" size={60} color="#95a5a6" />
            <Text style={styles.emptyStateText}>No hay preventas</Text>
            <Text style={styles.emptyStateSubtext}>Las preventas guardadas aparecerán aquí</Text>
          </View>
        ) : (
          <FlatList
            data={preventas}
            renderItem={renderItem}
            keyExtractor={(item) => item.numero.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.preventaCard}
      onPress={() => {
        setSelectedItem(item);
        setModalVisible(true);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <MaterialCommunityIcons name="file-document" size={24} color="#3498db" />
          <Text style={styles.preventaNumber}>Preventa #{item.numero}</Text>
        </View>
        <View style={styles.cardStatus}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#7f8c8d" />
          <Text style={styles.dateText}>{formatDate(item.fecha)}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.clienteRow}>
          <MaterialCommunityIcons name="account" size={20} color="#2c3e50" />
          <Text style={styles.clienteText} numberOfLines={1}>{item.cliente}</Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="currency-usd" size={16} color="#27ae60" />
            <Text style={styles.importeText}>${parseFloat(item.importe || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="package-variant" size={16} color="#e67e22" />
            <Text style={styles.itemsText}>{item.cantidadItems || 0} items</Text>
          </View>
        </View>

        {item.observacion && (
          <View style={styles.observacionRow}>
            <MaterialCommunityIcons name="note-text" size={16} color="#95a5a6" />
            <Text style={styles.observacionText} numberOfLines={2}>{item.observacion}</Text>
          </View>
        )}

        <View style={styles.estadoRow}>
          <MaterialCommunityIcons 
            name={item.estado === 'enviada' ? 'check-circle' : 'clock-outline'} 
            size={16} 
            color={item.estado === 'enviada' ? '#27ae60' : '#f39c12'} 
          />
          <Text style={[styles.estadoText, { color: item.estado === 'enviada' ? '#27ae60' : '#f39c12' }]}>
            {item.estado === 'enviada' ? 'Enviada' : 'Borrador'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const handleConfirmAction = async () => {
    if (actionToConfirm === 'Borrar') {
      console.log("🗑️ Confirmación de borrado aceptada para preventa:", selectedItem?.numero);
      try {
        const resultado = await indexedDBHandler.eliminarPreventa(selectedItem.numero);
        console.log("🗑️ Resultado de eliminación:", resultado);
        console.log("🗑️ Preventa eliminada de IndexedDB:", selectedItem.numero);
        await cargarPreventas();
        setConfirmModalVisible(false);
        setActionToConfirm(null);
        closeModal();
        Alert.alert('✅ Éxito', 'Preventa eliminada correctamente');
      } catch (error) {
        console.error('❌ Error al borrar preventa:', error);
        Alert.alert('❌ Error', 'No se pudo borrar la preventa');
      }
    }
  };

  const handleCancelAction = () => {
    setConfirmModalVisible(false);
    setActionToConfirm(null);
  };

  const handleAction = async (action) => {
    switch (action) {
      case 'Borrar':
        console.log("🔴 Botón Borrar presionado para preventa:", selectedItem?.numero);
        setActionToConfirm('Borrar');
        setConfirmModalVisible(true);
        break;

      case 'Editar':
        try {
          setLoading(true);
          let preventaNumero = selectedItem.numero;
          let cliente = selectedItem.clienteCompleto;
          let observacion = selectedItem.observacion;
          let edit = true;
          setModalVisible(false);
          
          console.log("✏️ Abriendo preventa para editar:", preventaNumero);
          navigation.navigate('EditPreventaWeb', { 
            preventaNumero, 
            cliente, 
            edit, 
            observacion 
          });
        } catch (error) {
          console.error('❌ Error al editar preventa:', error);
          Alert.alert('❌ Error', 'No se pudo abrir la preventa para editar');
        } finally {
          setLoading(false);
        }
        break;

      case 'Sincronizar':
        try {
          setSyncingItem(selectedItem.numero);
          console.log("🔄 Iniciando sincronización de preventa:", selectedItem.numero);
          
          // Usar la función real de sincronización web
          const resultado = await sincronizarPreventaWeb(selectedItem.numero);
          
          console.log("📡 Resultado de sincronización:", resultado);
          
          if (resultado.exitoso) {
            console.log("✅ Sincronización exitosa - eliminando preventa local");
            
            // Eliminar la preventa de IndexedDB después de sincronización exitosa
            try {
              await indexedDBHandler.eliminarPreventa(selectedItem.numero);
              console.log("🗑️ Preventa eliminada de IndexedDB después de sincronización exitosa:", selectedItem.numero);
            } catch (deleteError) {
              console.error('❌ Error al eliminar preventa después de sincronización:', deleteError);
            }
            
            cargarPreventas();
            closeModal();
            Alert.alert('✅ Éxito', `${resultado.mensaje}\n\nLa preventa ha sido eliminada del almacenamiento local.`);
          } else {
            console.log("❌ Sincronización falló");
            Alert.alert('❌ Error', resultado.mensaje);
          }
        } catch (error) {
          console.error('❌ Error en sincronización:', error);
          Alert.alert('❌ Error', 'Error de sincronización, comuníquese con soporte.');
        } finally {
          setSyncingItem(null);
        }
        break;

      case 'Cancelar':
        closeModal();
        break;
      default:
        break;
    }
  };

  const renderActionButton = (action, icon, color, backgroundColor) => (
    <TouchableOpacity 
      style={[styles.actionButton, { backgroundColor }]} 
      onPress={() => {
        console.log("🔘 Botón presionado:", action);
        handleAction(action);
      }}
      disabled={(action === 'Sincronizar' && syncingItem === selectedItem?.numero)}
    >
      {action === 'Sincronizar' && syncingItem === selectedItem?.numero ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      )}
      <Text style={[styles.actionButtonText, { color }]}>{action}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="file-document-multiple" size={32} color="#ffffff" />
          <View style={styles.headerTexts}>
            <Text style={styles.headerSubtitle}>Informe de preventas</Text>
            <Text style={styles.webIndicator}>Versión Web</Text>
          </View>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>{preventas.length} preventas</Text>
        </View>
      </View>

      <ListaPreventasActuales />

      <Modal 
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={closeModal} />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Acciones de preventa</Text>
              <Text style={styles.modalSubtitle}>Preventa #{selectedItem?.numero}</Text>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.selectedItemInfo}>
                <Text style={styles.selectedItemText}>{selectedItem?.cliente}</Text>
                <Text style={styles.selectedItemAmount}>${parseFloat(selectedItem?.importe || 0).toFixed(2)}</Text>
                <Text style={styles.selectedItemStatus}>
                  {'Estado: ' + (selectedItem?.estado === 'enviada' ? 'Enviada' : 'Borrador')}
                </Text>
              </View>
              
              <View style={styles.actionsGrid}>
                {renderActionButton('Editar', 'pencil', '#ffffff', '#3498db')}
                {renderActionButton('Sincronizar', 'cloud-upload', '#ffffff', '#27ae60')}
                {renderActionButton('Borrar', 'delete', '#ffffff', '#e74c3c')}
                {renderActionButton('Cancelar', 'close', '#2c3e50', '#ecf0f1')}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación */}
      <Modal 
        visible={confirmModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCancelAction}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContainer}>
            <View style={styles.confirmModalContent}>
              <MaterialCommunityIcons name="alert-circle" size={48} color="#e74c3c" />
              <Text style={styles.confirmModalTitle}>Confirmar eliminación</Text>
              <Text style={styles.confirmModalText}>
                ¿Está seguro que desea borrar la preventa #{selectedItem?.numero}?
              </Text>
              <Text style={styles.confirmModalSubtext}>
                Esta acción no se puede deshacer.
              </Text>
              
              <View style={styles.confirmModalButtons}>
                <TouchableOpacity 
                  style={[styles.confirmButton, styles.cancelButton]} 
                  onPress={handleCancelAction}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.confirmButton, styles.deleteButton]} 
                  onPress={handleConfirmAction}
                >
                  <Text style={styles.deleteButtonText}>Borrar</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#0c2f3c',
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTexts: {
    marginLeft: 15,
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#bdc3c7',
    marginBottom: 2,
  },
  webIndicator: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: 12,
    color: '#95a5a6',
    fontWeight: '600',
  },
  containerResults: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  listContent: {
    paddingBottom: 20,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preventaNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  cardContent: {
    gap: 8,
  },
  clienteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clienteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  importeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginLeft: 6,
  },
  itemsText: {
    fontSize: 14,
    color: '#e67e22',
    fontWeight: '600',
    marginLeft: 6,
  },
  observacionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  observacionText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginLeft: 6,
    flex: 1,
    fontStyle: 'italic',
  },
  estadoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#bdc3c7',
    borderRadius: 2,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  modalContent: {
    padding: 20,
  },
  selectedItemInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },
  selectedItemAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 5,
  },
  selectedItemStatus: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: '48%',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  confirmModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: 400,
    width: '100%',
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmModalText: {
    fontSize: 16,
    color: '#34495e',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmModalSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  confirmModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ListaPreventasWeb; 