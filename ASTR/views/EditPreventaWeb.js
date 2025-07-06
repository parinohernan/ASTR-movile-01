import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { configuracionCantidadMaximaArticulos } from '../src/utils/storageConfigData';
import { guardarPreventaEnStorage, obtenerPreventaDeStorage, obtenerArticulosFrecuentesCombinados } from '../src/utils/storageUtils';
import { ModalEliminarEditarCancelar } from '../src/components/preventa/Modal';
import { AddArticulo } from '../src/components/AddArticulo';
import indexedDBHandler from '../src/utils/indexedDBHandler';

const EditPreventaWeb = (props) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [preventaNumero, setPreventaNumero] = useState('');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nota, setNota] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalEditarVisible, setIsModalEditarVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [preventaCargada, setPreventaCargada] = useState(false);
  const [articulosFrecuentes, setArticulosFrecuentes] = useState([]);
  const [hasInternetAccess, setHasInternetAccess] = useState(true);
  const [cargaInicialCompletada, setCargaInicialCompletada] = useState(false);
  const [isModalEdicionVisible, setIsModalEdicionVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { params } = props.route;
        console.log('📋 EditPreventaWeb - Parámetros recibidos:', params);
        
        setCliente(params.cliente);
        setPreventaNumero(params.numeroPreventa);
        setHasInternetAccess(params.hasInternetAccess || true);
        
        // Esperar a que preventaNumero se establezca antes de cargar la preventa
        if (params.numeroPreventa && !cargaInicialCompletada) {
          console.log('🔄 Carga inicial desde IndexedDB...');
          await cargarPreventaDesdeBDD(params.numeroPreventa);
          await cargarDatos();
          setCargaInicialCompletada(true);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    if (isFocused) {
      loadData();
    }
  }, [isFocused, props.route.params, cargaInicialCompletada]);

  // Recargar datos cuando regreses de ArticulosWeb
  useFocusEffect(
    useCallback(() => {
      const recargarDatos = async () => {
        if (preventaNumero && preventaCargada && cargaInicialCompletada) {
          console.log('🔄 Recargando datos desde storage local después de regresar de ArticulosWeb...');
          
          // Cargar datos actualizados desde storage local (AsyncStorage)
          await cargarPreventaDesdeStorageLocal();
          
          // También recargar artículos frecuentes
          await cargarDatos();
        }
      };

      recargarDatos();
    }, [preventaNumero, preventaCargada, cargaInicialCompletada])
  );

  const cargarPreventaDesdeBDD = async (numeroPreventa) => {
    try {
      setLoading(true);
      console.log('🔍 Cargando preventa desde IndexedDB:', numeroPreventa);
      
      const preventaData = await indexedDBHandler.obtenerPreventa(numeroPreventa);
      console.log('📋 Datos de preventa obtenidos de IndexedDB:', preventaData);
      
      if (preventaData) {
        setCarrito(preventaData.items || []);
        setNota(preventaData.nota || '');
        calcularTotal(preventaData.items || []);
        setPreventaCargada(true);
        console.log('✅ Preventa cargada correctamente desde IndexedDB');
        console.log('📦 Items cargados:', preventaData.items?.length || 0);
        console.log('📝 Nota:', preventaData.nota || 'Sin nota');
        console.log('💰 Total:', preventaData.total || 0);
      } else {
        console.error('❌ No se encontró la preventa en IndexedDB:', numeroPreventa);
        Alert.alert("Error", "No se encontró la preventa");
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error al cargar preventa desde IndexedDB:', error);
      Alert.alert("Error", "No se pudo cargar la preventa");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const cargarPreventaDesdeStorageLocal = async () => {
    try {
      console.log('🔍 Cargando preventa desde storage local (AsyncStorage)...');
      
      const preventaLocal = await obtenerPreventaDeStorage();
      console.log('📋 Datos de preventa obtenidos de AsyncStorage:', preventaLocal);
      
      if (preventaLocal && preventaLocal.length > 0) {
        setCarrito(preventaLocal);
        calcularTotal(preventaLocal);
        console.log('✅ Preventa cargada correctamente desde AsyncStorage');
        console.log('📦 Items cargados:', preventaLocal.length);
        console.log('💰 Total calculado:', total);
      } else {
        console.log('⚠️ No hay datos en AsyncStorage, manteniendo datos actuales');
      }
    } catch (error) {
      console.error('Error al cargar preventa desde AsyncStorage:', error);
    }
  };

  const cargarDatos = async () => {
    try {
      // Cargar artículos frecuentes
      const frecuentes = await obtenerArticulosFrecuentesCombinados(cliente?.id);
      setArticulosFrecuentes(frecuentes);
      console.log('📦 Artículos frecuentes cargados:', frecuentes.length);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const calcularTotal = (items) => {
    const totalCalculado = items.reduce((sum, item) => sum + (item.precio || 0), 0);
    setTotal(totalCalculado);
  };

  const grabarPreventa = async () => {
    try {
      setLoading(true);
      
      // Sincronizar storage local con IndexedDB
      console.log('💾 Sincronizando storage local con IndexedDB...');
      await guardarPreventaEnStorage(carrito);
      
      const preventaData = {
        numero: preventaNumero,
        cliente: cliente,
        items: carrito,
        nota: nota,
        total: total,
        fecha: new Date().toISOString(),
        estado: 'borrador'
      };

      console.log('💾 Guardando preventa actualizada en IndexedDB:', preventaData.numero);
      await indexedDBHandler.guardarPreventa(preventaData);
      
      Alert.alert(
        "Preventa actualizada",
        "La preventa se ha actualizado correctamente",
        [
          {
            text: "Aceptar",
            onPress: () => console.log("Preventa actualizada en IndexedDB")
          }
        ]
      );
    } catch (error) {
      console.error('Error al grabar preventa en IndexedDB:', error);
      Alert.alert("Error", "No se pudo actualizar la preventa");
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = () => {
    setIsModalVisible(true);
  };

  const cerrarModal = () => {
    setIsModalVisible(false);
  };

  const abrirModalEditar = (item) => {
    setSelectedItem(item);
    setIsModalEditarVisible(true);
  };

  const cerrarModalEditar = () => {
    setIsModalEditarVisible(false);
    setSelectedItem(null);
  };

  const cerrarModalEdicion = () => {
    setIsModalEdicionVisible(false);
    setSelectedItem(null);
  };

  const handleDelete = async() => {
    try {
      const nuevosItems = carrito.filter(item => item.uniqueId !== selectedItem.uniqueId);
      setCarrito(nuevosItems);
      calcularTotal(nuevosItems);
      
      // Actualizar tanto el storage local como IndexedDB
      console.log('🗑️ Actualizando storage local después de eliminar item');
      await guardarPreventaEnStorage(nuevosItems);
      
      // También actualizar IndexedDB para persistencia
      const preventaActualizada = {
        numero: preventaNumero,
        cliente: cliente,
        items: nuevosItems,
        nota: nota,
        total: total,
        fecha: new Date().toISOString(),
        estado: 'borrador'
      };
      
      console.log('🗑️ Actualizando preventa en IndexedDB después de eliminar item');
      await indexedDBHandler.guardarPreventa(preventaActualizada);
      
      cerrarModalEditar();
    } catch (error) {
      console.error('Error al eliminar item:', error);
    }
  };

  const handleEdit = async() => {
    try {
      console.log('✏️ Abriendo modal de edición para item:', selectedItem);
      
      // Cerrar el modal de opciones
      cerrarModalEditar();
      
      // Abrir el modal de edición
      setIsModalEdicionVisible(true);
    } catch (error) {
      console.error('Error al editar item:', error);
    }
  };

  const guardarNota = async () => {
    try {
      // Actualizar tanto el storage local como IndexedDB
      console.log('📝 Actualizando nota en storage local');
      await guardarPreventaEnStorage(carrito);
      
      // También actualizar IndexedDB para persistencia
      const preventaActualizada = {
        numero: preventaNumero,
        cliente: cliente,
        items: carrito,
        nota: nota,
        total: total,
        fecha: new Date().toISOString(),
        estado: 'borrador'
      };
      
      console.log('📝 Actualizando nota en IndexedDB');
      await indexedDBHandler.guardarPreventa(preventaActualizada);
      
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar nota:', error);
      cerrarModal();
    }
  };

  const abrirArticulos = async () => {
    let cantidad = await configuracionCantidadMaximaArticulos();
  
    if (carrito.length >= cantidad) {
      Alert.alert(
        "Límite de artículos alcanzado",
        `Se ha superado la cantidad máxima de ${cantidad} artículos permitidos.`,
        [
          {
            text: "Aceptar",
            onPress: () => console.log("Aceptar presionado"),
            style: "cancel"
          }
        ]
      );
    } else {
      console.log('Abriendo ArtículosWeb con cliente:', cliente);
      console.log('Cliente ID a pasar:', cliente.id);
      
      navigation.navigate('ArticulosWeb', { 
        numeroPreventa: preventaNumero, 
        cliente: cliente, 
        listaDePrecio: cliente.listaPrecio, 
        cantItems: carrito.length, 
        articulosFrecuentes: articulosFrecuentes, 
        hasInternetAccess: hasInternetAccess 
      });
    }
  };

  const handleItem = (item) => {
    setSelectedItem(item);
    abrirModalEditar(item);
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.itemCard} onPress={() => handleItem(item)}>
        <View style={styles.itemHeader}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Text style={styles.itemTitle}>{item.descripcion}</Text>
            <Text style={styles.itemCode}>  |  {item.id}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => handleItem(item)}>
            <MaterialCommunityIcons name="pencil" size={20} color="#3498db" />
          </TouchableOpacity>
        </View>
        <View style={styles.itemDataRow}>
          <View style={styles.dataColumn}>
            <Text style={styles.dataValue}>{item.cantidad}</Text>
          </View>
          <View style={styles.dataColumn}>
            <Text style={styles.dataValue}>${(item.precioLista || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.dataColumn}>
            <Text style={styles.dataValue}>{item.descuento || 0}%</Text>
          </View>
          <View style={styles.dataColumn}>
            <Text style={styles.dataValueTotal}>${(item.precio || 0).toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <View style={styles.headerColumn}>
        <Text style={styles.headerText}>Cantidad</Text>
      </View>
      <View style={styles.headerColumn}>
        <Text style={styles.headerText}>Lista</Text>
      </View>
      <View style={styles.headerColumn}>
        <Text style={styles.headerText}>Descuento</Text>
      </View>
      <View style={styles.headerColumn}>
        <Text style={styles.headerText}>Total</Text>
      </View>
    </View>
  );

  const BarraIcons = () => {
    return (
      <View style={styles.iconBar}>
        <TouchableOpacity onPress={grabarPreventa} disabled={loading} style={styles.iconButton}>
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <MaterialCommunityIcons name="content-save" size={24} color="#ffffff" />
          )}
          <Text style={styles.iconButtonText}>Actualizar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={abrirArticulos} style={styles.iconButton}>
          <MaterialCommunityIcons name="plus" size={24} color="#ffffff" />
          <Text style={styles.iconButtonText}>Agregar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={abrirModal} style={styles.iconButton}>
          <MaterialCommunityIcons name="note-text" size={24} color="#ffffff" />
          <Text style={styles.iconButtonText}>Nota</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const CabezaPreventa = () => {
    return (
      <View style={styles.cabezaContainer}>
        <View style={styles.clienteInfo}>
          <MaterialCommunityIcons name="account" size={24} color="#2c3e50" />
          <Text style={styles.clienteName}>{cliente?.descripcion}</Text>
        </View>
        
        <View style={styles.cabezaData}>
          <View style={styles.cabezaSubdata}>
            <Text style={styles.dataText}>Código: {cliente?.id}</Text>
            <Text style={styles.dataText}>Saldo: ${cliente?.importeDeuda || 0}</Text>
          </View>
          <View style={styles.cabezaSubdata}>
            <Text style={[styles.dataText, styles.totalText]}>Total: ${total?.toFixed(2)}</Text>
            <Text style={styles.dataText}>Items: {carrito.length}</Text>
          </View>
        </View>
        
        <View style={styles.preventaInfo}>
          <MaterialCommunityIcons name="file-document-edit" size={20} color="#e67e22" />
          <Text style={styles.preventaNumber}>Preventa #{preventaNumero}</Text>
        </View>
      </View>
    );
  };

  if (loading && !preventaCargada) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando preventa...</Text>
      </View>
    );
  }

  return (    
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          <Text style={styles.backButtonText}>Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>EDITAR PREVENTA</Text>
        <Text style={styles.webIndicator}>Versión Web</Text>
      </View>
      
      <CabezaPreventa/>
      
      <View style={styles.itemsContainer}>
        <Modal visible={isModalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Editar observación</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Escribe una observación..."
                placeholderTextColor="#95a5a6"
                value={nota}
                onChangeText={setNota}
                multiline
              />
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity style={styles.modalButton} onPress={guardarNota}>
                  <Text style={styles.modalButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {isModalEditarVisible && (
          <ModalEliminarEditarCancelar 
            item={selectedItem} 
            handleEdit={handleEdit} 
            handleDelete={handleDelete} 
            cerrarModalEditar={cerrarModalEditar}
          />
        )}
        
        {isModalEdicionVisible && selectedItem && (
          <Modal
            visible={isModalEdicionVisible}
            animationType="slide"
            onRequestClose={cerrarModalEdicion}
            presentationStyle="fullScreen"
          >
            <AddArticulo
              route={{ 
                params: { 
                  articulo: {
                    ...selectedItem,
                    editandoItem: true,
                    uniqueIdOriginal: selectedItem.uniqueId
                  }, 
                  preventaNumero: preventaNumero, 
                  cliente: cliente, 
                  cantItems: carrito.length 
                } 
              }}
              navigationOverride={cerrarModalEdicion}
            />
          </Modal>
        )}
        
        <View style={styles.listContainer}>
          {carrito.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="cart-outline" size={60} color="#95a5a6" />
              <Text style={styles.emptyStateText}>No hay artículos en la preventa</Text>
              <Text style={styles.emptyStateSubtext}>Toca "Agregar" para comenzar</Text>
            </View>
          ) : (
            <>
              {renderHeader()}
              <FlatList
                data={carrito}
                keyExtractor={(item) => item.uniqueId || item.id || Math.random().toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </View>
      </View> 
      
      <BarraIcons/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#30bced',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#30bced',
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#0c2f3c',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
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
  cabezaContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clienteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  clienteName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  cabezaData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cabezaSubdata: {
    flex: 1,
  },
  dataText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  preventaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  preventaNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e67e22',
    marginLeft: 8,
  },
  itemsContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  headerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7f8c8d',
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  itemCode: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  editButton: {
    padding: 5,
  },
  itemDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dataValue: {
    fontSize: 14,
    color: '#2c3e50',
  },
  dataValueTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
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
  iconBar: {
    flexDirection: 'row',
    backgroundColor: '#0c2f3c',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
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
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2c3e50',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditPreventaWeb; 