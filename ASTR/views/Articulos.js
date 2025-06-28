import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { Searchbar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getArticulosFiltrados, getArticulosFiltradosXCodigo, getArticulosFrecuentes } from '../database/controllers/Articulos.Controller';
import { cantidadYDescuentoCargados, cantidadCargado, descuentoCargado, AddArticulo } from '../src/components/AddArticulo';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { configuracionCantidadMaximaArticulos } from '../src/utils/storageConfigData';
import { obtenerPreventaDeStorage, obtenerArticulosFrecuentesCombinados, agregarArticuloFrecuente, obtenerArticulosFrecuentesClienteOrdenados, obtenerArticulosFrecuentesGlobalesOrdenados } from '../src/utils/storageUtils';

const Articulos = ({ route }) => {
  const [filtroActivo, setFiltroActivo] = useState('todos'); // 'todos', 'cliente', 'globales'
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { params } = route;
  const preventaNumero = params.numeroPreventa;
  const cliente = params.cliente;
  const listaDePrecios = params.listaDePrecio;
  const articulosFrecuentes = params.articulosFrecuentes;
  const hasInternetAccess = params.hasInternetAccess;
  
  const [search, setSearch] = useState('');
  const [articulosList, setArticulosList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscoXCodigo, setBuscoXCodigo]= useState(false);
  var buscoDesde = 2;
  const flatListRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setArticulosList(await buscarAdaptarFiltrar(search));
      } catch (error) {
        console.error('Error al obtener artículos filtrados: ', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Cargar datos cuando:
    // 1. Se cambia el filtro (siempre)
    // 2. Se busca en modo "todos" (solo si hay texto)
    if (filtroActivo !== 'todos' || search.length > buscoDesde) {
        fetchData();
    } else if (filtroActivo === 'todos' && search.length === 0) {
      // En modo "todos" sin búsqueda, mostrar lista vacía
        setArticulosList([]);
    }
  }, [search, isFocused, filtroActivo]);
  
  const buscarAdaptarFiltrar = async (search) =>{
    const obtenerPrecio = async (articulo)=>{
      let costo = articulo.precioCosto;
      let iva = articulo.iva;
      let costoIva = costo * (1+ iva/100);
      let ganancia = 0;
      switch (listaDePrecios) {
        case "1": ganancia = articulo.lista1; break;
        case "2": ganancia = articulo.lista2; break;
        case "3": ganancia = articulo.lista3; break;
        case "4": ganancia = articulo.lista4; break;
        case "5": ganancia = articulo.lista5; break;
        default: return 0;
      }
      return (costoIva * (1 + ganancia /100));
    }
      
      let filteredArticulosBDD = [];
      if (filtroActivo === 'cliente') {
        // Usar artículos frecuentes del cliente
        const articulosFrecuentesCliente = await obtenerArticulosFrecuentesClienteOrdenados(cliente?.id);
        if (articulosFrecuentesCliente.length > 0) {
          const codigosFrecuentes = articulosFrecuentesCliente.map(art => art.id);
          // Obtener todos los artículos frecuentes del cliente
          let todosArticulosCliente = await getArticulosFrecuentes(codigosFrecuentes);
          
          // Si hay búsqueda, filtrar por código o descripción
          if (search.length > 0) {
            if (buscoXCodigo) {
              todosArticulosCliente = todosArticulosCliente.filter(art => 
                art.id.toLowerCase().includes(search.toLowerCase())
              );
            } else {
              todosArticulosCliente = todosArticulosCliente.filter(art => 
                art.descripcion.toLowerCase().includes(search.toLowerCase())
              );
            }
          }
          
          filteredArticulosBDD = todosArticulosCliente;
        } else {
          filteredArticulosBDD = [];
        }
      } else if (filtroActivo === 'globales') {
        // Usar artículos frecuentes globales
        const articulosFrecuentesGlobales = await obtenerArticulosFrecuentesGlobalesOrdenados();
        if (articulosFrecuentesGlobales.length > 0) {
          const codigosFrecuentes = articulosFrecuentesGlobales.map(art => art.id);
          // Obtener todos los artículos frecuentes globales
          let todosArticulosGlobales = await getArticulosFrecuentes(codigosFrecuentes);
          
          // Si hay búsqueda, filtrar por código o descripción
          if (search.length > 0) {
        if (buscoXCodigo) {
              todosArticulosGlobales = todosArticulosGlobales.filter(art => 
                art.id.toLowerCase().includes(search.toLowerCase())
              );
            } else {
              todosArticulosGlobales = todosArticulosGlobales.filter(art => 
                art.descripcion.toLowerCase().includes(search.toLowerCase())
              );
            }
          }
          
          filteredArticulosBDD = todosArticulosGlobales;
        } else {
          filteredArticulosBDD = [];
        }
      } else {
        // Filtro 'todos' - búsqueda normal
        if (buscoXCodigo) {
          filteredArticulosBDD = await getArticulosFiltradosXCodigo(search);
        } else {
          filteredArticulosBDD = await getArticulosFiltrados(search);
        }
      }
    
      let filteredArticulos = await Promise.all(
        filteredArticulosBDD.map(async (element) => {
          const cantidad = await cantidadCargado(element.id);
          const descuento = await descuentoCargado(element.id);
          const frecuente = articulosFrecuentes?.includes(element.id);
          const precio = await obtenerPrecio(element);
        
          element.seleccionados = cantidad;
          element.descuento = descuento;
          element.frecuente = frecuente;
          element.precio = precio;
        
          return element;
        })
      )
    
    return filteredArticulos.sort((a, b) => {
      if (a.descripcion.toLowerCase() < b.descripcion.toLowerCase()) return -1;
      if (a.descripcion.toLowerCase() > b.descripcion.toLowerCase()) return 1;
      return 0;
    });
  }
  
  const openModal = (articulo) => {
    setArticuloSeleccionado(articulo);
    setModalVisible(true);
  };
  
  const closeModal = async (articuloActualizado) => {
    setModalVisible(false);
    
    // Siempre recargar los datos del artículo que se estaba editando
    if (articuloSeleccionado && articuloSeleccionado.id) {
      // Recargar los datos del artículo específico desde el storage
      const cantidadActualizada = await cantidadCargado(articuloSeleccionado.id);
      const descuentoActualizado = await descuentoCargado(articuloSeleccionado.id);
      
      setArticulosList(prevList => prevList.map(item =>
        item.id === articuloSeleccionado.id
          ? { 
              ...item, 
              seleccionados: cantidadActualizada, 
              descuento: descuentoActualizado 
            }
          : item
      ));
      
      // Si se agregó el artículo a la preventa (cantidad > 0), agregarlo a frecuentes
      if (cantidadActualizada > 0) {
        // Usar el cliente que se pasa como parámetro a la pantalla
        let clienteParam = route.params?.cliente || null;
        let clienteId = (typeof clienteParam === 'object' && clienteParam !== null) ? clienteParam.id : clienteParam;
        console.log('Agregando artículo frecuente para cliente:', clienteId);
        console.log('Artículo a agregar:', articuloSeleccionado);
        await agregarArticuloFrecuente(clienteId, articuloSeleccionado);
      }
    }
    
    setArticuloSeleccionado(null);
  };
  
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)} style={styles.articuloCard}>
      <View style={styles.articuloHeader}>
        <Text style={styles.articuloTitle}>{item.id} - {item.descripcion}</Text>
      </View>
      
      <View style={styles.articuloDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="warehouse" size={16} color="#7f8c8d" />
            <Text style={styles.detailText}>Stock: {item.existencia}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="currency-usd" size={16} color="#27ae60" />
            <Text style={styles.detailText}>${item?.precio?.toFixed(2)}</Text>
          </View>
          
          <View style={styles.indicators}>
            {item.frecuente && (
              <View style={styles.frecuenteIndicator}>
                <MaterialCommunityIcons name="star" size={16} color="#f39c12" />
                <Text style={styles.frecuenteText}>F</Text>
              </View>
            )}
            
            {item.seleccionados !== 0 && (
              <View style={styles.cantidadIndicator}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#27ae60" />
                <Text style={styles.cantidadText}>{item.seleccionados}</Text>
        </View>
            )}
           </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#30bced" />
          <Text style={styles.emptyStateText}>Buscando artículos...</Text>
        </View>
      );
    }
    
    if (articulosList.length === 0) {
      if (filtroActivo === 'cliente') {
        if (search.length > 0) {
          return (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="magnify" size={60} color="#f39c12" />
              <Text style={styles.emptyStateText}>No se encontraron artículos frecuentes del cliente</Text>
              <Text style={styles.emptyStateSubtext}>
                No hay artículos que coincidan con "{search}" en los frecuentes del cliente
              </Text>
            </View>
          );
        } else {
          return (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-star-outline" size={60} color="#f39c12" />
              <Text style={styles.emptyStateText}>No hay artículos frecuentes del cliente</Text>
              <Text style={styles.emptyStateSubtext}>
                Este cliente aún no tiene artículos frecuentes registrados
              </Text>
            </View>
          );
        }
      } else if (filtroActivo === 'globales') {
        if (search.length > 0) {
          return (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="magnify" size={60} color="#e74c3c" />
              <Text style={styles.emptyStateText}>No se encontraron artículos frecuentes globales</Text>
              <Text style={styles.emptyStateSubtext}>
                No hay artículos que coincidan con "{search}" en los frecuentes globales
              </Text>
            </View>
          );
        } else {
          return (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="star-outline" size={60} color="#e74c3c" />
              <Text style={styles.emptyStateText}>No hay artículos frecuentes globales</Text>
              <Text style={styles.emptyStateSubtext}>
                Aún no se han registrado artículos frecuentes globales
              </Text>
            </View>
          );
        }
      } else if (search.length > 0) {
        return (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="magnify" size={60} color="#95a5a6" />
            <Text style={styles.emptyStateText}>No se encontraron artículos</Text>
            <Text style={styles.emptyStateSubtext}>Intente con otro término de búsqueda</Text>
          </View>
        );
      } else {
        return (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="package-variant-outline" size={60} color="#95a5a6" />
            <Text style={styles.emptyStateText}>Busque artículos</Text>
            <Text style={styles.emptyStateSubtext}>Escriba un código o descripción para buscar artículos</Text>
          </View>
        );
      }
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Seleccionar Artículos</Text>
      </View>
      
      {hasInternetAccess && (
        <View style={styles.filtrosContainer}>
          <TouchableOpacity 
            style={[
              styles.filtroButton,
              filtroActivo === 'todos' && styles.filtroButtonActivo
            ]}
            onPress={() => setFiltroActivo('todos')}
          >
            <MaterialCommunityIcons 
              name="package-variant" 
              size={16} 
              color={filtroActivo === 'todos' ? "#ffffff" : "#3498db"} 
            />
            <Text style={[
              styles.filtroButtonText,
              filtroActivo === 'todos' && styles.filtroButtonTextActivo
            ]}>
              Todos
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filtroButton,
              filtroActivo === 'cliente' && styles.filtroButtonActivo
            ]}
            onPress={() => setFiltroActivo('cliente')}
          >
            <MaterialCommunityIcons 
              name="account-star" 
              size={16} 
              color={filtroActivo === 'cliente' ? "#ffffff" : "#f39c12"} 
            />
            <Text style={[
              styles.filtroButtonText,
              filtroActivo === 'cliente' && styles.filtroButtonTextActivo
            ]}>
              Cliente
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filtroButton,
              filtroActivo === 'globales' && styles.filtroButtonActivo
            ]}
            onPress={() => setFiltroActivo('globales')}
          >
            <MaterialCommunityIcons 
              name="star" 
              size={16} 
              color={filtroActivo === 'globales' ? "#ffffff" : "#e74c3c"} 
            />
            <Text style={[
              styles.filtroButtonText,
              filtroActivo === 'globales' && styles.filtroButtonTextActivo
            ]}>
              Globales
            </Text>
        </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.searchTypeButton,
              !buscoXCodigo && styles.searchTypeButtonActivo
            ]}
            onPress={() => setBuscoXCodigo(false)}
          >
            <MaterialCommunityIcons 
              name="text-search" 
              size={16} 
              color={!buscoXCodigo ? "#ffffff" : "#3498db"} 
            />
            <Text style={[
              styles.searchTypeButtonText,
              !buscoXCodigo && styles.searchTypeButtonTextActivo
            ]}>
              Desc
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.searchTypeButton,
              buscoXCodigo && styles.searchTypeButtonActivo
            ]}
            onPress={() => setBuscoXCodigo(true)}
          >
            <MaterialCommunityIcons 
              name="barcode" 
              size={16} 
              color={buscoXCodigo ? "#ffffff" : "#3498db"} 
            />
            <Text style={[
              styles.searchTypeButtonText,
              buscoXCodigo && styles.searchTypeButtonTextActivo
            ]}>
              Cód
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.searchSection}>
        <Searchbar
          placeholder={
            filtroActivo === 'todos' 
              ? `Buscar artículo por ${buscoXCodigo ? 'código' : 'descripción'}...` 
              : filtroActivo === 'cliente'
                ? `Filtrar frecuentes del cliente por ${buscoXCodigo ? 'código' : 'descripción'}...`
                : `Filtrar frecuentes globales por ${buscoXCodigo ? 'código' : 'descripción'}...`
          }
          value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
          iconColor="#3498db"
        />
      </View>
      
      {/* <View style={styles.resultsSection}>
        <View style={styles.resultsInfo}>
          <MaterialCommunityIcons name="information" size={16} color="#7f8c8d" />
          <Text style={styles.resultsText}>
            {loading ? '...' : articulosList.length} resultados • Lista {listaDePrecios}
          </Text>
        </View>
      
        <TouchableOpacity 
          style={styles.gestionarFrecuentesButton} 
          onPress={() => navigation.navigate('GestionFrecuentes')}
        >
          <MaterialCommunityIcons name="star-settings" size={20} color="#f39c12" />
          <Text style={styles.gestionarFrecuentesText}>Gestionar Frecuentes</Text>
        </TouchableOpacity>
      </View> */}
      
      <View style={styles.content}>
        {renderEmptyState() ? (
          renderEmptyState()
        ) : (
          <FlatList 
            ref={flatListRef}
            data={articulosList} 
            keyExtractor={(item, index) => item.id ? item.id : index.toString()} 
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            maxToRenderPerBatch={20} 
          />
        )}
      </View>
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeModal}
        presentationStyle="fullScreen"
      >
        {articuloSeleccionado && (
          <AddArticulo
            route={{ params: { articulo: articuloSeleccionado, preventaNumero: route.params.numeroPreventa, cliente: route.params.cliente, cantItems: articulosList.length } }}
            navigationOverride={closeModal}
          />
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 2,
    paddingTop: 2,
    paddingBottom: 2,
    backgroundColor: '#0c2f3c',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  searchSection: {
    // paddingHorizontal: 10,
    // paddingVertical: 10,
    // borderBottomWidth: 2,
    // borderBottomColor: '#ffffff',
  },
  searchTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  searchTypeButtonActivo: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  searchTypeButtonText: {
    fontSize: 11,
    color: '#7f8c8d',
    fontWeight: '600',
    marginLeft: 3,
  },
  searchTypeButtonTextActivo: {
    color: '#ffffff',
  },
  searchbar: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3498db',
    marginHorizontal: 2,
    marginVertical: 2,
    elevation: 2,
  },
  resultsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  resultsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  filtrosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    marginHorizontal: 2,
    marginVertical: 2,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ecf0f1',
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  filtroButtonActivo: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  filtroButtonText: {
    fontSize: 11,
    color: '#7f8c8d',
    fontWeight: '600',
    marginLeft: 3,
  },
  filtroButtonTextActivo: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    padding: 8,
  },
  articuloCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  articuloHeader: {
    marginBottom: 6,
  },
  articuloTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  articuloDetails: {
    marginLeft: 0,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 5,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  frecuenteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  frecuenteText: {
    fontSize: 12,
    color: '#f39c12',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  cantidadIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cantidadText: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: 'bold',
    marginLeft: 2,
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
  gestionarFrecuentesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f39c12',
  },
  gestionarFrecuentesText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f39c12',
    marginLeft: 8,
  },
});

export default Articulos;
