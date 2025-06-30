import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { db } from '../../database/database';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { borrarPreventaYSusItems } from '../../database/controllers/Preventa.Controller';
import { getClientes } from '../../database/controllers/Clientes.Controller';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { empresa, producto } from '../constantes/constantes';
import { sincronizarPreventa } from '../../handlers/actualizarApp';

const ListaPreventas = () => {
  const navigation = useNavigation();
  const [preventas, setPreventas] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncingItem, setSyncingItem] = useState(null);

  useEffect(() => {
    cargarPreventas();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log("🔄 ListaPreventas recibió foco - actualizando datos automáticamente");
      cargarPreventas();
      
      // Cleanup function (opcional)
      return () => {
        console.log("📱 ListaPreventas perdió foco");
      };
    }, [])
  );

  const cargarPreventas = () => {
    console.log("📊 Iniciando carga de preventas...");
    db.transaction((tx) => {
      try {
        tx.executeSql(
          'SELECT preventaCabeza.id as numero, clientes.descripcion as cliente, clientes.id as clienteCodigo, preventaCabeza.importetotal as importe, preventaCabeza.observacion as observacion, preventaCabeza.fecha as fecha, preventaCabeza.cantidadItems as cantidadItems FROM preventaCabeza JOIN clientes ON preventaCabeza.cliente = clientes.id ORDER BY preventaCabeza.id DESC',
          [],
          (_, result) => {
            const preventasArray = [];
            for (let i = 0; i < result.rows.length; i++) {
              preventasArray.push(result.rows.item(i));
            }
            setPreventas(preventasArray);
            console.log("✅ Preventas cargadas exitosamente:", preventasArray.length, "preventas");
          },
          (_, error) => {
            console.error('❌ Error al cargar preventas:', error);
          }
        );
      } catch (error) {
        console.error('❌ Excepción al ejecutar la transacción:', error);
      }
    });
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
    return (
      <View style={styles.containerResults}>
        {preventas.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="file-document-outline" size={60} color="#95a5a6" />
            <Text style={styles.emptyStateText}>No hay preventas</Text>
            <Text style={styles.emptyStateSubtext}>Las preventas aparecerán aquí</Text>
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
      </View>
    </TouchableOpacity>
  );

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const buscarCliente = async (clienteCodigo, clientes) => {
    return clientes.find(element => element.id == clienteCodigo);
  };

  const handleAction = async (action) => {
    switch (action) {
      case 'Borrar':
        Alert.alert(
          'Confirmar eliminación',
          '¿Está seguro que desea borrar la preventa?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Borrar',
              style: 'destructive',
              onPress: async () => {
                setLoading(true);
                try {
                  await borrarPreventaYSusItems(selectedItem.numero);
                  cargarPreventas();
                  closeModal();
                } catch (error) {
                  console.error('Error al borrar preventa:', error);
                  Alert.alert('Error', 'No se pudo borrar la preventa');
                } finally {
                  setLoading(false);
                }
              },
            },
          ],
          { cancelable: false }
        );
        break;

      case 'Editar':
        try {
          setLoading(true);
          let clientes = await getClientes();
          let objCliente = await buscarCliente(selectedItem.clienteCodigo, clientes);
          let preventaNumero = selectedItem.numero;
          let observacion = selectedItem.observacion;
          let edit = true;
          setModalVisible(false);
          navigation.navigate('EditPreventa', { preventaNumero, cliente: objCliente, edit, observacion });
        } catch (error) {
          console.error('Error al editar preventa:', error);
          Alert.alert('Error', 'No se pudo abrir la preventa para editar');
        } finally {
          setLoading(false);
        }
        break;

      case 'Sincronizar':
        try {
          setSyncingItem(selectedItem.numero);
          console.log("🔄 Iniciando sincronización de preventa:", selectedItem.numero);
          let clientes = await getClientes();
          let objCliente = await buscarCliente(selectedItem.clienteCodigo, clientes);
          let preventaNumero = selectedItem.numero;
          let observacion = selectedItem.observacion;
          
          console.log("📋 Datos preparados para sincronización:", {
            preventaNumero,
            cliente: objCliente,
            observacion
          });
          
          const resultado = await sincronizarPreventa(preventaNumero, objCliente);
          console.log("📡 Resultado de sincronización:", resultado);
          
          if (resultado) {
            console.log("✅ Sincronización exitosa, borrando preventa local");
            await borrarPreventaYSusItems(selectedItem.numero);
            cargarPreventas();
            closeModal();
            Alert.alert('✅ Éxito', 'Preventa procesada correctamente');
          } else {
            console.log("❌ Sincronización falló");
            Alert.alert('❌ Error', 'Error de sincronización, comuníquese con soporte.');
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
      onPress={() => handleAction(action)}
      disabled={loading || (action === 'Sincronizar' && syncingItem === selectedItem?.numero)}
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
            {/* <Text style={styles.headerTitle}>{ermpresa} - {producto}</Text> */}
            <Text style={styles.headerSubtitle}>Informe de preventas</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#bdc3c7',
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
});

export default ListaPreventas;
