import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput, Modal, Alert, ActivityIndicator} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useIsFocused, useFocusEffect} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { obtenerPreventaDeStorage, preventaDesdeBDD, calcularTotal, limpiarPreventaDeStorage, eliminarItemEnPreventaEnStorage } from "../src/utils/storageUtils";
import { grabarPreventaEnBDD } from '../database/controllers/Preventa.Controller';
import { getClientes } from '../database/controllers/Clientes.Controller';
import { nextPreventa, configuracionCantidadMaximaArticulos, configuracionEndPoint  } from '../src/utils/storageConfigData';
import { getArticulosFrecuentesDesdeAPI } from '../handlers/actualizarApp';
import { ModalEliminarEditarCancelar } from '../src/components/preventa/Modal';
import axios from 'axios';
import { AddArticulo } from '../src/components/AddArticulo';
import { getArticuloPorCodigo } from '../database/controllers/Articulos.Controller';
import { borrarPreventaYSusItems } from '../database/controllers/Preventa.Controller';
import { obtenerArticulosFrecuentesOrdenados, obtenerArticulosFrecuentesCombinados, obtenerArticulosFrecuentesClienteOrdenados, obtenerArticulosFrecuentesGlobalesOrdenados } from '../src/utils/storageUtils';

// import { Fontisto } from '@expo/vector-icons'; 

const Preventa = (props) => {
  useFocusEffect(
    React.useCallback(() => {
      const handleBeforeRemove = async (e) => {
        e.preventDefault();
  
        try {
          const carrito2 = await obtenerPreventaDeStorage();
          if (carrito2.length > 0) {
            e.preventDefault();
            Alert.alert(
              'Preventa sin guardar',
              '¿Quieres guardar los cambios antes de salir?',
              [
                { text: 'Descartar', style: 'destructive', onPress: () => {limpiarPreventaDeStorage(); navigation.goBack() }},
                { text: 'Volver', style: 'cancel', onPress: () => {} },
              ]
            );
          } else {
            navigation.dispatch(e.data.action);
          }
        } catch (error) {
          console.error('Error al obtener la preventa:', error);
        }
      };
  
      const unsubscribe = navigation.addListener('beforeRemove', handleBeforeRemove);
  
      return unsubscribe;
    }, [navigation, isModalEditarVisible])
  );

  const isFocused = useIsFocused();
  const {route} = props;
  const {params} = route;
  const {preventaNumero, cliente, clienteCodigo, edit} = params;
  const navigation = useNavigation();
  const [carrito, setCarrito] = useState([]);
  const [editando, setEditando] = useState(edit? edit : false);
  const [cantidadItems, setCantidadItems] = useState([]);
  const [total, setTotal] = useState();
  const [nueva, setNueva] = useState(true);/* solo indica si es una nueva preventa o estoy editando*/
  // const [dataCliente, setDataCliente] = useState( {codigo: params.cliente, id: params.cliente } );
  // const [dataCliente, setDataCliente] = useState( params.objCliente );
  const [articulosFrecuentes, setArticulosFrecuentes] = useState([]);
  const [hasInternetAccess, setHasInternetAccess] = useState(false);
  const [estoyBuscandoFrecuentes, setEstoyBuscandoFrecuentes] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalEditarVisible, setIsModalEditarVisible] = useState(false);
  const [nota, setNota] = useState('');
  const [selectedItem, setSelectedItem]= useState();
  const [loading, setLoading] = useState(false);
  // const [listaDePrecios,setListaDePrecios]=useState();
  
  // Ref para trackear si ya se inicializó la preventa (limpieza inicial)
  const inicializadoRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      if (isFocused) {
        // Si es una nueva preventa (no edición), limpiar el storage SOLO la primera vez
        // para evitar que queden artículos de sesiones anteriores, pero no limpiar
        // cuando se vuelve de agregar artículos
        if (nueva && !edit && !inicializadoRef.current) {
          console.log("Nueva preventa detectada - limpiando storage previo para evitar duplicados (primera vez)");
          await limpiarPreventaDeStorage();
          inicializadoRef.current = true; // Marcar como inicializado
        }
        // Cargar datos aquí
        cargarDatos();
      }
    };

    const checkInternetAccess = async () => {
      try {
        let endpoint = await configuracionEndPoint()
        const response = await axios.get(endpoint);
        // Si la solicitud se completa con éxito, significa que hay acceso al servidor
        setHasInternetAccess(true);
      } catch (error) {
        // Si ocurre un error, no hay acceso al servidor
        setHasInternetAccess(false);
      }
    };
    // console.log("entro a preventa editando= T nueva =fale ", edit);
    loadData();
    checkInternetAccess();
    // console.log("hay internet?", hasInternetAccess);
  }, [isFocused, isModalEditarVisible]);
  
  const cargarDatos = async () => {
    const carritoData = await obtenerPreventaDeStorage();
    // console.log("prv166 ",carritoData);
    
    // Eliminamos la doble verificación ya que ahora se controla con inicializadoRef
    // La limpieza solo se hace una vez al inicio con el useEffect
    
    if (carritoData.length != 0) {
      setCarrito(carritoData.map(item => {
        let precioLista = 0;
        if (item.descuento === 100) {
          // Si el descuento es 100%, el precio de lista es 0
          precioLista = 0;
        } else if (item.cantidad > 0 && item.precioTotal > 0) {
          // Calcular precio de lista normal
          precioLista = (item.precioTotal / ((100-item.descuento)/100) / item.cantidad);
        }
        
        return { 
          cantidad: item.cantidad, 
          descripcion: item.descripcion,
          id: item.id,
          iva: item.iva,
          precio: item.precioTotal, 
          descuento: item.descuento,
          precioLista: precioLista,
          uniqueId: item.uniqueId
        };
      }));
    }
    setCantidadItems (carritoData.length);
    setTotal(await calcularTotal());
  };

  const grabarPreventa = async () => {
    setLoading(true);
    try {
      if (edit) {
        console.log("PRV184 eliminal la preventa antes de guardar ", preventaNumero);
        await borrarPreventaYSusItems(preventaNumero);
      }
      if (carrito.length > 0) {
        let numero = preventaNumero
        if (nueva) {
          numero = await nextPreventa();
        }
        await grabarPreventaEnBDD (numero, nota , cliente .id, carrito);
        console.log("preventa guardada con exito  ");
        setCarrito ([]);    
        Alert.alert("Éxito", "Preventa guardada correctamente");
      } else {
        Alert.alert("Aviso", "La preventa está vacía");
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error al guardar preventa:", error);
      Alert.alert("Error", "No se pudo guardar la preventa");
    } finally {
      setLoading(false);
    }
  };

  
  const abrirModal = () => { //modal de la nota
    setIsModalVisible(true);
    
  };
  
  const cerrarModal = () => { //modal de la nota
    setIsModalVisible(false);
    guardarNota();
    
  };

  const abrirModalEditar = (item) => { //modal de la nota
    setIsModalEditarVisible(true);
    // setSelectedItem (item);
    console.log("prev157", item);
  };
  
  const cerrarModalEditar = () => { //modal de la nota
    setIsModalEditarVisible(false);
    // setSelectedItem ({});    
  };

  const handleDelete = async() =>{ /* borra un item seleccionado, deñ storage */
  if (cantidadItems < 2) {
    console.log("CHAU NO QUIERO ESTA PREVNTA");
    navigation.navigate('Clientes', {});
}
    
    await eliminarItemEnPreventaEnStorage(selectedItem.uniqueId);
    setIsModalEditarVisible(false);
    cargarDatos(); // Recargar datos
  }

  const obtenerPrecio = async (articulo)=>{
    console.log("PREVENT246 lista", cliente.listaPrecio ,"articulo", articulo);
    let costo = articulo.precioCosto;
    let iva = articulo.iva;
    let costoIva = costo * (1+ iva/100);
    let ganancia = 0;
    let listaDePrecios = cliente.listaPrecio;
    switch (listaDePrecios) {
      case "1":
        ganancia = articulo.lista1;
        return (costoIva * (1 + ganancia /100)) 
      case "2":
        ganancia = articulo.lista2;
        return (costoIva * (1 + ganancia /100)) 
      case "3":
        ganancia = articulo.lista3;
        return (costoIva * (1 + ganancia /100)) 
      case "4":
        ganancia = articulo.lista4;
        return (costoIva * (1 + ganancia /100)) 
      case "5":
        ganancia = articulo.lista5;
        return (costoIva * (1 + ganancia /100)) 
        break;
      default:
        return 0;
        // código a ejecutar si la expresión no coincide con ningún valor
    }
  }

  const handleEdit = async() =>{
    //edita in articulo
    let itemArray = await getArticuloPorCodigo (selectedItem.id);
    let articulo = itemArray[0];
    articulo.seleccionados = selectedItem.cantidad;
    articulo.precio = await obtenerPrecio(articulo);
    articulo.descuento = selectedItem.descuento;
    console.log("editar ",articulo, selectedItem);
    setIsModalEditarVisible(false);
    
    // Eliminar el item actual antes de editar (para productos repetidos)
    await eliminarItemEnPreventaEnStorage(selectedItem.uniqueId);
    
    navigation.navigate('AddArticulo', { articulo });
    //refrescar la preventa
  }

  const guardarNota = () => {
    // Aquí puedes implementar la lógica para guardar la nota en tu aplicación
    console.log('Nota guardada:', nota);
  };

  const traerFrecuentes = async() => {
    setEstoyBuscandoFrecuentes(true);
    try {
      // Debug: Verificar que el cliente se esté recibiendo correctamente
      console.log('Cliente recibido en Preventa:', cliente);
      console.log('Cliente ID:', cliente?.id);
      console.log('Cliente descripción:', cliente?.descripcion);
      
      // Usar artículos frecuentes combinados (cliente + globales)
      const clienteId = cliente?.id || null;
      console.log('Cliente ID para frecuentes:', clienteId);
      
      // Debug simple: verificar frecuentes del cliente
      if (clienteId) {
        console.log('=== DEBUG FRECUENTES ===');
        const frecuentesCliente = await obtenerArticulosFrecuentesClienteOrdenados(clienteId);
        const frecuentesGlobales = await obtenerArticulosFrecuentesGlobalesOrdenados();
        console.log('Frecuentes del cliente:', frecuentesCliente.length);
        console.log('Frecuentes globales:', frecuentesGlobales.length);
        console.log('=== FIN DEBUG ===');
      }
      
      const articulosFrecuentesLocales = await obtenerArticulosFrecuentesCombinados(clienteId);
      console.log('Artículos frecuentes obtenidos:', articulosFrecuentesLocales);
      
      const codigosFrecuentes = articulosFrecuentesLocales.map(art => art.id);
      setArticulosFrecuentes(codigosFrecuentes);
      console.log(`Artículos frecuentes combinados cargados para cliente ${clienteId}:`, codigosFrecuentes.length);
    } catch (error) {
      console.error('Error al cargar artículos frecuentes combinados:', error);
      setArticulosFrecuentes([]);
    } finally {
      setEstoyBuscandoFrecuentes(false);
    }
  };

  const abrirArticulos = async () => {
    let cantidad = await configuracionCantidadMaximaArticulos();
    // console.log("CANTIDAD ", cantidad, carrito.length);
  
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
      // Debug: Verificar que el cliente se esté pasando correctamente
      console.log('Abriendo Artículos con cliente:', cliente);
      console.log('Cliente ID a pasar:', cliente.id);
      
      // console.log("cli CLI CLI listaprecio ", dataCliente.listaPrecio);
      navigation.navigate('Articulos', { numeroPreventa: preventaNumero, cliente: cliente, listaDePrecio: cliente.listaPrecio, cantItems: cantidadItems, articulosFrecuentes: articulosFrecuentes, hasInternetAccess: hasInternetAccess });
    }
  };

  const handleItem = (item) =>{
    setSelectedItem(item);
    abrirModalEditar(item);
  }

  // Renderiza cada elemento del array reducido
  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.itemCard} onPress={() => handleItem(item)}>
        {/* Primera línea: Nombre y código + editar */}
        <View style={styles.itemHeader}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Text style={styles.itemTitle}>{item.descripcion}</Text>
            <Text style={styles.itemCode}>  |  {item.id}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => handleItem(item)}>
            <MaterialCommunityIcons name="pencil" size={20} color="#3498db" />
          </TouchableOpacity>
        </View>
        {/* Segunda línea: Solo valores */}
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
    const insets = useSafeAreaInsets();
    return (
      <View style={[styles.iconBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity onPress={grabarPreventa} disabled={loading} style={styles.iconButton}>
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <MaterialCommunityIcons name="content-save" size={24} color="#ffffff" />
          )}
          <Text style={styles.iconButtonText}>Guardar</Text>
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
    )
  }
  
  const CabezaPreventa = () =>{
    return (
      <View style={styles.cabezaContainer}>
        <View style={styles.clienteInfo}>
          <MaterialCommunityIcons name="account" size={24} color="#2c3e50" />
          <Text style={styles.clienteName}>{cliente?.descripcion}</Text>
        </View>
        
        {/* <TouchableOpacity onPress={traerFrecuentes} style={styles.frecuentesButton}>
          <MaterialCommunityIcons 
            name={estoyBuscandoFrecuentes ? "loading" : "star"} 
            size={20} 
            color="#f39c12" 
          />
          <Text style={styles.frecuentesText}>
            Frecuentes Locales: {articulosFrecuentes.length}
          </Text>
        </TouchableOpacity> */}
        
        <View style={styles.cabezaData}>
          <View style={styles.cabezaSubdata}>
            <Text style={styles.dataText}>Código: {cliente?.id}</Text>
            <Text style={styles.dataText}>Saldo: ${cliente?.importeDeuda}</Text>
          </View>
          <View style={styles.cabezaSubdata}>
            <Text style={[styles.dataText, styles.totalText]}>Total: ${total?.toFixed(2)}</Text>
            <Text style={styles.dataText}>Items: {carrito.length}</Text>
          </View>
        </View>
      </View>
    )
  }
 
  if (editando !== true) {
    return (    
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>PREVENTA</Text>
        </View>
        
        <CabezaPreventa/>
        
        <View style={styles.itemsContainer}>
          <Modal visible={isModalVisible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Escribir nota</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Escribe una nota..."
                  placeholderTextColor="#95a5a6"
                  value={nota}
                  onChangeText={setNota}
                  multiline
                />
                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity style={styles.modalButton} onPress={cerrarModal}>
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
    )
  } else {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>PREVENTA</Text>
        </View>
        
        <CabezaPreventa/>
        
        <View style={styles.itemsContainer}>
          <Modal visible={isModalVisible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Escribir nota</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Escribe una nota..."
                  placeholderTextColor="#95a5a6"
                  value={nota}
                  onChangeText={setNota}
                  multiline
                />
                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity style={styles.modalButton} onPress={cerrarModal}>
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
        </View> 
        
        <BarraIcons/>
      </View>
    )
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#30bced',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#0c2f3c',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  cabezaContainer: {
    padding: 10,
    backgroundColor: '#ffffff',
    margin: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clienteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  clienteName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  // frecuentesButton: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   marginBottom: 15,
  // },
  // frecuentesText: {
  //   fontSize: 14,
  //   color: '#7f8c8d',
  //   marginLeft: 5,
  // },
  cabezaData: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cabezaSubdata: {
    flex: 1,
  },
  dataText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  totalText: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
  itemsContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listContainer: {
    flex: 1,
    padding: 15,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 2,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    marginTop: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  itemCode: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
    // marginBottom: 12,
  },
  itemDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
    
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  dataColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dataValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    textAlign: 'center',
  },
  dataValueTotal: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  headerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editButton: {
    padding: 5,
  },
  iconBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: "#0c2f3c",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20, // Se sobrescribe dinámicamente con useSafeAreaInsets
  },
  iconButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  iconButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
    margin: 20,
    width: '90%',
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
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
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
});

export default Preventa;

