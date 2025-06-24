import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, FlatList, TouchableOpacity, StyleSheet, Switch, Alert, Modal } from 'react-native';
import { Searchbar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getArticulosFiltrados, getArticulosFiltradosXCodigo, getArticulosFrecuentes } from '../database/controllers/Articulos.Controller';
import { cantidadYDescuentoCargados, cantidadCargado, descuentoCargado, AddArticulo } from '../src/components/AddArticulo';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { configuracionCantidadMaximaArticulos } from '../src/utils/storageConfigData';
import { obtenerPreventaDeStorage } from '../src/utils/storageUtils';

const Articulos = ({ route }) => {
  const [mostrarFrecuentes, setMostrasFrecuentes] = useState(false);
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
    
    if (mostrarFrecuentes) {
      fetchData();
    } else {
      if (search.length > buscoDesde) {
        fetchData();
      } else {
        setArticulosList([]);
      }
    }
  }, [search, isFocused, mostrarFrecuentes]);
  
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
      if (mostrarFrecuentes) {
        filteredArticulosBDD = await getArticulosFrecuentes(articulosFrecuentes);
    } else {
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
  
  const closeModal = (articuloActualizado) => {
    setModalVisible(false);
    setArticuloSeleccionado(null);
    if (articuloActualizado && articuloActualizado.id) {
      setArticulosList(prevList => prevList.map(item =>
        item.id === articuloActualizado.id
          ? { ...item, seleccionados: articuloActualizado.cantidad, descuento: articuloActualizado.descuento }
          : item
      ));
    }
  };
  
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)} style={styles.articuloCard}>
      <View style={styles.articuloHeader}>
        <MaterialCommunityIcons name="package-variant" size={20} color="#3498db" />
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
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="percent" size={16} color="#7f8c8d" />
            <Text style={styles.detailText}>IVA: {item?.iva}%</Text>
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
    
    if (articulosList.length === 0 && search.length > 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="magnify" size={60} color="#95a5a6" />
          <Text style={styles.emptyStateText}>No se encontraron artículos</Text>
          <Text style={styles.emptyStateSubtext}>Intente con otro término de búsqueda</Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Seleccionar Artículos</Text>
        <Text style={styles.subtitle}>Busque y seleccione productos</Text>
      </View>
      
      <View style={styles.searchSection}>
        <TouchableOpacity onPress={() => setBuscoXCodigo(!buscoXCodigo)} style={styles.searchTypeButton}>
          <MaterialCommunityIcons 
            name={buscoXCodigo ? "barcode" : "text-search"} 
            size={20} 
            color="#3498db" 
          />
          <Text style={styles.searchTypeText}>
            Buscando por {buscoXCodigo ? "código" : "descripción"}
          </Text>
        </TouchableOpacity>
        
      <Searchbar
        placeholder="Buscar artículo..."
        value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
          iconColor="#3498db"
        />
      </View>
      
      <View style={styles.filtersSection}>
        <View style={styles.resultsInfo}>
          <MaterialCommunityIcons name="information" size={16} color="#7f8c8d" />
          <Text style={styles.resultsText}>
            {loading ? '...' : articulosList.length} resultados • Lista {listaDePrecios}
          </Text>
        </View>
        
        {hasInternetAccess && (
          <View style={styles.frecuentesToggle}>
            <Text style={styles.frecuentesLabel}>Frecuentes</Text>
            <Switch 
              value={mostrarFrecuentes} 
              onValueChange={() => setMostrasFrecuentes(!mostrarFrecuentes)}
              trackColor={{ false: "#bdc3c7", true: "#3498db" }}
              thumbColor={mostrarFrecuentes ? "#ffffff" : "#f4f3f4"}
            />
          </View>
      )}
      </View>
      
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
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
  },
  searchTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
  },
  searchTypeText: {
    fontSize: 14,
    color: '#3498db',
    marginLeft: 8,
    fontWeight: '500',
  },
  searchbar: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    elevation: 2,
  },
  filtersSection: {
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
  frecuentesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  frecuentesLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    alignItems: 'center',
    marginBottom: 12,
  },
  articuloTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
    flex: 1,
  },
  articuloDetails: {
    marginLeft: 28,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
});

export default Articulos;
