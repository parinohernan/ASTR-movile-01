import React, { useState, useEffect } from "react";
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
  TextInput,
  Share,
  Clipboard
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { 
  obtenerResumenFrecuentes,
  exportarFrecuentesComoTexto,
  restaurarFrecuentesDesdeTexto,
  limpiarTodosArticulosFrecuentes,
  obtenerClientesConFrecuentes,
  obtenerArticulosFrecuentesGlobalesOrdenados
} from '../src/utils/storageUtils';
import { getClientes } from '../database/controllers/Clientes.Controller';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Utilidad para limpiar claves mal guardadas
const limpiarFrecuentesMalos = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const clavesMalas = keys.filter(key => key.includes('[object Object]'));
    if (clavesMalas.length === 0) {
      Alert.alert('Limpieza', 'No se encontraron claves mal guardadas.');
      return;
    }
    await AsyncStorage.multiRemove(clavesMalas);
    Alert.alert('Limpieza', `Claves mal guardadas eliminadas:\n${clavesMalas.join('\n')}`);
  } catch (error) {
    Alert.alert('Error', 'Error al limpiar claves malas: ' + error);
  }
};

const GestionFrecuentes = () => {
  const navigation = useNavigation();
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'export' o 'import'
  const [textoImportacion, setTextoImportacion] = useState('');
  const [exportando, setExportando] = useState(false);
  const [importando, setImportando] = useState(false);
  
  // Nuevos estados para ordenamiento y filtros
  const [ordenamiento, setOrdenamiento] = useState('frecuencia'); // 'frecuencia', 'descripcion', 'proveedor', 'rubro'
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [filtroRubro, setFiltroRubro] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [articulosFiltrados, setArticulosFiltrados] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [rubros, setRubros] = useState([]);

  useEffect(() => {
    cargarResumen();
  }, []);

  useEffect(() => {
    if (resumen) {
      procesarArticulos();
    }
  }, [resumen, ordenamiento, filtroTexto, filtroProveedor, filtroRubro]);

  const cargarResumen = async () => {
    try {
      setLoading(true);
      const datosResumen = await obtenerResumenFrecuentes();
      setResumen(datosResumen);
    } catch (error) {
      console.error('Error al cargar resumen:', error);
      Alert.alert('Error', 'No se pudo cargar el resumen de frecuentes');
    } finally {
      setLoading(false);
    }
  };

  // Función para extraer proveedor y rubro de la descripción
  const extraerProveedorYRubro = (descripcion) => {
    if (!descripcion) return { proveedor: 'Sin proveedor', rubro: 'Sin rubro' };
    
    // Intentar extraer proveedor (generalmente al inicio, antes del primer espacio o guión)
    let proveedor = 'Sin proveedor';
    let rubro = 'Sin rubro';
    
    // Buscar patrones comunes en descripciones
    const patrones = [
      /^([A-Z]{2,})\s/, // Dos o más mayúsculas al inicio
      /^([A-Z]{2,})-/i, // Dos o más letras seguidas de guión
      /^([A-Z]{2,})/i,  // Dos o más letras al inicio
    ];
    
    for (const patron of patrones) {
      const match = descripcion.match(patron);
      if (match) {
        proveedor = match[1].toUpperCase();
        break;
      }
    }
    
    // Intentar extraer rubro (palabras clave comunes)
    const palabrasRubro = descripcion.toLowerCase();
    if (palabrasRubro.includes('chocolate') || palabrasRubro.includes('dulce') || palabrasRubro.includes('caramelo')) {
      rubro = 'Dulces';
    } else if (palabrasRubro.includes('galleta') || palabrasRubro.includes('biscocho')) {
      rubro = 'Galletas';
    } else if (palabrasRubro.includes('bebida') || palabrasRubro.includes('gaseosa') || palabrasRubro.includes('jugo')) {
      rubro = 'Bebidas';
    } else if (palabrasRubro.includes('limpieza') || palabrasRubro.includes('detergente') || palabrasRubro.includes('jabón')) {
      rubro = 'Limpieza';
    } else if (palabrasRubro.includes('papel') || palabrasRubro.includes('servilleta') || palabrasRubro.includes('toalla')) {
      rubro = 'Papelería';
    } else {
      rubro = 'Otros';
    }
    
    return { proveedor, rubro };
  };

  const procesarArticulos = () => {
    if (!resumen?.globales?.topArticulos) return;
    
    // Procesar todos los artículos para agregar proveedor y rubro
    const articulosProcesados = resumen.globales.topArticulos.map(articulo => {
      const { proveedor, rubro } = extraerProveedorYRubro(articulo.descripcion);
      return {
        ...articulo,
        proveedor,
        rubro
      };
    });
    
    // Extraer listas únicas de proveedores y rubros
    const proveedoresUnicos = [...new Set(articulosProcesados.map(a => a.proveedor))].sort();
    const rubrosUnicos = [...new Set(articulosProcesados.map(a => a.rubro))].sort();
    
    setProveedores(proveedoresUnicos);
    setRubros(rubrosUnicos);
    
    // Aplicar filtros
    let articulosFiltrados = articulosProcesados;
    
    if (filtroTexto) {
      articulosFiltrados = articulosFiltrados.filter(art => 
        art.descripcion.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        art.id.toLowerCase().includes(filtroTexto.toLowerCase())
      );
    }
    
    if (filtroProveedor) {
      articulosFiltrados = articulosFiltrados.filter(art => 
        art.proveedor === filtroProveedor
      );
    }
    
    if (filtroRubro) {
      articulosFiltrados = articulosFiltrados.filter(art => 
        art.rubro === filtroRubro
      );
    }
    
    // Aplicar ordenamiento
    articulosFiltrados.sort((a, b) => {
      switch (ordenamiento) {
        case 'frecuencia':
          return b.frecuencia - a.frecuencia;
        case 'descripcion':
          return a.descripcion.localeCompare(b.descripcion);
        case 'proveedor':
          return a.proveedor.localeCompare(b.proveedor);
        case 'rubro':
          return a.rubro.localeCompare(b.rubro);
        default:
          return b.frecuencia - a.frecuencia;
      }
    });
    
    setArticulosFiltrados(articulosFiltrados);
  };

  const exportarFrecuentes = async () => {
    try {
      setExportando(true);
      const textoExportacion = await exportarFrecuentesComoTexto();
      
      // Intentar compartir el archivo
      try {
        await Share.share({
          message: textoExportacion,
          title: 'Frecuentes ASTR - ' + new Date().toLocaleDateString()
        });
      } catch (shareError) {
        // Si no se puede compartir, copiar al portapapeles
        await Clipboard.setString(textoExportacion);
        Alert.alert(
          'Exportación Completada', 
          'Los datos han sido copiados al portapapeles. Puedes pegarlos en un archivo de texto.'
        );
      }
    } catch (error) {
      console.error('Error al exportar:', error);
      Alert.alert('Error', 'No se pudieron exportar los frecuentes');
    } finally {
      setExportando(false);
    }
  };

  const importarFrecuentes = async () => {
    if (!textoImportacion.trim()) {
      Alert.alert('Error', 'Por favor ingresa el texto de importación');
      return;
    }

    Alert.alert(
      'Confirmar Importación',
      '¿Estás seguro de que quieres importar estos frecuentes? Esto sobrescribirá los datos actuales.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Importar', 
          style: 'destructive',
          onPress: async () => {
            try {
              setImportando(true);
              const resultado = await restaurarFrecuentesDesdeTexto(textoImportacion);
              setTextoImportacion('');
              setModalVisible(false);
              await cargarResumen();
              Alert.alert('Éxito', resultado.mensaje);
            } catch (error) {
              console.error('Error al importar:', error);
              Alert.alert('Error', 'No se pudieron importar los frecuentes. Verifica el formato del texto.');
            } finally {
              setImportando(false);
            }
          }
        }
      ]
    );
  };

  const limpiarTodos = () => {
    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que quieres eliminar TODOS los artículos frecuentes? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar Todo', 
          style: 'destructive',
          onPress: async () => {
            try {
              await limpiarTodosArticulosFrecuentes();
              await cargarResumen();
              Alert.alert('Éxito', 'Todos los artículos frecuentes han sido eliminados');
            } catch (error) {
              console.error('Error al limpiar:', error);
              Alert.alert('Error', 'No se pudieron eliminar los artículos frecuentes');
            }
          }
        }
      ]
    );
  };

  const limpiarFiltros = () => {
    setFiltroTexto('');
    setFiltroProveedor('');
    setFiltroRubro('');
    setOrdenamiento('frecuencia');
  };

  const renderEstadisticaCard = ({ title, value, subtitle, icon, color, onPress }) => (
    <TouchableOpacity 
      style={[styles.estadisticaCard, { borderLeftColor: color }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.estadisticaHeader}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
        <Text style={styles.estadisticaTitle}>{title}</Text>
      </View>
      <Text style={[styles.estadisticaValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.estadisticaSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );

  const renderTopItem = ({ item, index }) => (
    <TouchableOpacity style={styles.topItem} onPress={() => {}}>
      <View style={styles.topItemRank}>
        <Text style={styles.topItemRankText}>{index + 1}</Text>
      </View>
      <View style={styles.topItemInfo}>
        <Text style={styles.topItemTitle}>{item.id}</Text>
        <Text style={styles.topItemSubtitle}>{item.descripcion}</Text>
        <View style={styles.topItemTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.proveedor}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: '#e8f5e8' }]}>
            <Text style={[styles.tagText, { color: '#27ae60' }]}>{item.rubro}</Text>
          </View>
        </View>
      </View>
      <View style={styles.topItemFreq}>
        <Text style={styles.topItemFreqText}>{item.frecuencia}</Text>
        <Text style={styles.topItemFreqLabel}>veces</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTopCliente = ({ item, index }) => (
    <View style={styles.topItem}>
      <View style={styles.topItemRank}>
        <Text style={styles.topItemRankText}>{index + 1}</Text>
      </View>
      <View style={styles.topItemInfo}>
        <Text style={styles.topItemTitle}>{item.id}</Text>
        <Text style={styles.topItemSubtitle}>{item.cantidadFrecuentes} artículos</Text>
      </View>
    </View>
  );

  const renderFiltros = () => (
    <View style={styles.filtrosContainer}>
      <View style={styles.filtrosHeader}>
        <Text style={styles.filtrosTitle}>Filtros y Ordenamiento</Text>
        <TouchableOpacity onPress={() => setMostrarFiltros(!mostrarFiltros)}>
          <MaterialCommunityIcons 
            name={mostrarFiltros ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#3498db" 
          />
        </TouchableOpacity>
      </View>
      
      {mostrarFiltros && (
        <View style={styles.filtrosContent}>
          {/* Búsqueda por texto */}
          <View style={styles.filtroGrupo}>
            <Text style={styles.filtroLabel}>Buscar:</Text>
            <TextInput
              style={styles.filtroInput}
              placeholder="Buscar por código o descripción..."
              value={filtroTexto}
              onChangeText={setFiltroTexto}
            />
          </View>
          
          {/* Filtro por proveedor */}
          <View style={styles.filtroGrupo}>
            <Text style={styles.filtroLabel}>Proveedor:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroOpciones}>
              <TouchableOpacity 
                style={[styles.filtroOpcion, !filtroProveedor && styles.filtroOpcionActiva]} 
                onPress={() => setFiltroProveedor('')}
              >
                <Text style={[styles.filtroOpcionText, !filtroProveedor && styles.filtroOpcionTextActiva]}>Todos</Text>
              </TouchableOpacity>
              {proveedores.map(prov => (
                <TouchableOpacity 
                  key={prov}
                  style={[styles.filtroOpcion, filtroProveedor === prov && styles.filtroOpcionActiva]} 
                  onPress={() => setFiltroProveedor(prov)}
                >
                  <Text style={[styles.filtroOpcionText, filtroProveedor === prov && styles.filtroOpcionTextActiva]}>{prov}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Filtro por rubro */}
          <View style={styles.filtroGrupo}>
            <Text style={styles.filtroLabel}>Rubro:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtroOpciones}>
              <TouchableOpacity 
                style={[styles.filtroOpcion, !filtroRubro && styles.filtroOpcionActiva]} 
                onPress={() => setFiltroRubro('')}
              >
                <Text style={[styles.filtroOpcionText, !filtroRubro && styles.filtroOpcionTextActiva]}>Todos</Text>
              </TouchableOpacity>
              {rubros.map(rubro => (
                <TouchableOpacity 
                  key={rubro}
                  style={[styles.filtroOpcion, filtroRubro === rubro && styles.filtroOpcionActiva]} 
                  onPress={() => setFiltroRubro(rubro)}
                >
                  <Text style={[styles.filtroOpcionText, filtroRubro === rubro && styles.filtroOpcionTextActiva]}>{rubro}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Ordenamiento */}
          <View style={styles.filtroGrupo}>
            <Text style={styles.filtroLabel}>Ordenar por:</Text>
            <View style={styles.ordenamientoOpciones}>
              <TouchableOpacity 
                style={[styles.ordenamientoOpcion, ordenamiento === 'frecuencia' && styles.ordenamientoOpcionActiva]} 
                onPress={() => setOrdenamiento('frecuencia')}
              >
                <MaterialCommunityIcons name="sort-numeric-descending" size={16} color={ordenamiento === 'frecuencia' ? '#ffffff' : '#3498db'} />
                <Text style={[styles.ordenamientoOpcionText, ordenamiento === 'frecuencia' && styles.ordenamientoOpcionTextActiva]}>Frecuencia</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.ordenamientoOpcion, ordenamiento === 'descripcion' && styles.ordenamientoOpcionActiva]} 
                onPress={() => setOrdenamiento('descripcion')}
              >
                <MaterialCommunityIcons name="sort-alphabetical-ascending" size={16} color={ordenamiento === 'descripcion' ? '#ffffff' : '#3498db'} />
                <Text style={[styles.ordenamientoOpcionText, ordenamiento === 'descripcion' && styles.ordenamientoOpcionTextActiva]}>Descripción</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.ordenamientoOpcion, ordenamiento === 'proveedor' && styles.ordenamientoOpcionActiva]} 
                onPress={() => setOrdenamiento('proveedor')}
              >
                <MaterialCommunityIcons name="factory" size={16} color={ordenamiento === 'proveedor' ? '#ffffff' : '#3498db'} />
                <Text style={[styles.ordenamientoOpcionText, ordenamiento === 'proveedor' && styles.ordenamientoOpcionTextActiva]}>Proveedor</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.ordenamientoOpcion, ordenamiento === 'rubro' && styles.ordenamientoOpcionActiva]} 
                onPress={() => setOrdenamiento('rubro')}
              >
                <MaterialCommunityIcons name="tag" size={16} color={ordenamiento === 'rubro' ? '#ffffff' : '#3498db'} />
                <Text style={[styles.ordenamientoOpcionText, ordenamiento === 'rubro' && styles.ordenamientoOpcionTextActiva]}>Rubro</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Botón limpiar filtros */}
          <TouchableOpacity style={styles.limpiarFiltrosButton} onPress={limpiarFiltros}>
            <MaterialCommunityIcons name="filter-remove" size={16} color="#e74c3c" />
            <Text style={styles.limpiarFiltrosText}>Limpiar Filtros</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#30bced" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Frecuentes</Text>
        <Text style={styles.subtitle}>Resumen y administración de artículos frecuentes</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tarjetas de estadísticas principales */}
        <View style={styles.estadisticasGrid}>
          {renderEstadisticaCard({
            title: 'Artículos Globales',
            value: resumen?.globales?.cantidad || 0,
            subtitle: 'Frecuentes de toda la app',
            icon: 'earth',
            color: '#3498db'
          })}
          
          {renderEstadisticaCard({
            title: 'Clientes Activos',
            value: resumen?.clientes?.cantidad || 0,
            subtitle: 'Con frecuentes individuales',
            icon: 'account-group',
            color: '#27ae60'
          })}
          
          {renderEstadisticaCard({
            title: 'Total Artículos',
            value: resumen?.total?.articulos || 0,
            subtitle: 'Globales + por cliente',
            icon: 'package-variant',
            color: '#9b59b6'
          })}
        </View>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.exportButton]} 
            onPress={() => {
              setModalType('export');
              setModalVisible(true);
            }}
            disabled={exportando}
          >
            <MaterialCommunityIcons name="export" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>
              {exportando ? 'Exportando...' : 'Exportar'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.importButton]} 
            onPress={() => {
              setModalType('import');
              setModalVisible(true);
            }}
            disabled={importando}
          >
            <MaterialCommunityIcons name="import" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>
              {importando ? 'Importando...' : 'Importar'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.clearButton]} 
            onPress={limpiarTodos}
          >
            <MaterialCommunityIcons name="delete-sweep" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Limpiar Todo</Text>
          </TouchableOpacity>
          {/* Botón temporal para limpiar claves malas */}
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#e67e22' }]} 
            onPress={limpiarFrecuentesMalos}
          >
            <MaterialCommunityIcons name="broom" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Limpiar Claves Malas</Text>
          </TouchableOpacity>
        </View>

        {/* Filtros y ordenamiento */}
        {renderFiltros()}

        {/* Lista de artículos filtrados */}
        {articulosFiltrados.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#3498db" />
              <Text style={styles.sectionTitle}>
                Artículos Frecuentes ({articulosFiltrados.length})
              </Text>
            </View>
            <FlatList
              data={articulosFiltrados}
              keyExtractor={(item) => item.id}
              renderItem={renderTopItem}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Top 5 Clientes */}
        {resumen?.clientes?.topClientes?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="account-star" size={20} color="#e74c3c" />
              <Text style={styles.sectionTitle}>Top 5 Clientes con Más Frecuentes</Text>
            </View>
            <FlatList
              data={resumen.clientes.topClientes}
              keyExtractor={(item) => item.id}
              renderItem={renderTopCliente}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Botón de actualizar */}
        <TouchableOpacity style={styles.refreshButton} onPress={cargarResumen}>
          <MaterialCommunityIcons name="refresh" size={20} color="#3498db" />
          <Text style={styles.refreshText}>Actualizar Estadísticas</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Exportación/Importación */}
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
                {modalType === 'export' ? 'Exportar Frecuentes' : 'Importar Frecuentes'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              {modalType === 'export' ? (
                <View>
                  <Text style={styles.modalDescription}>
                    Los datos se exportarán en formato JSON y se compartirán o copiarán al portapapeles.
                  </Text>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.exportButton]} 
                    onPress={exportarFrecuentes}
                    disabled={exportando}
                  >
                    <MaterialCommunityIcons name="export" size={20} color="#ffffff" />
                    <Text style={styles.modalButtonText}>
                      {exportando ? 'Exportando...' : 'Exportar Ahora'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Text style={styles.modalDescription}>
                    Pega aquí el texto JSON de la exportación anterior:
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    numberOfLines={10}
                    placeholder="Pega el texto JSON aquí..."
                    value={textoImportacion}
                    onChangeText={setTextoImportacion}
                    textAlignVertical="top"
                  />
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.importButton]} 
                    onPress={importarFrecuentes}
                    disabled={importando}
                  >
                    <MaterialCommunityIcons name="import" size={20} color="#ffffff" />
                    <Text style={styles.modalButtonText}>
                      {importando ? 'Importando...' : 'Importar Ahora'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
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
  content: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#30bced',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ffffff',
  },
  estadisticasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  estadisticaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    width: '48%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  estadisticaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  estadisticaTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  estadisticaValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  estadisticaSubtitle: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  exportButton: {
    backgroundColor: '#27ae60',
  },
  importButton: {
    backgroundColor: '#3498db',
  },
  clearButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 12,
  },
  filtrosContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtrosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  filtrosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  filtrosContent: {
    padding: 16,
  },
  filtroGrupo: {
    marginBottom: 16,
  },
  filtroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  filtroInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  filtroOpciones: {
    flexDirection: 'row',
  },
  filtroOpcion: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  filtroOpcionActiva: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  filtroOpcionText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  filtroOpcionTextActiva: {
    color: '#ffffff',
  },
  ordenamientoOpciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ordenamientoOpcion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  ordenamientoOpcionActiva: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  ordenamientoOpcionText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
    marginLeft: 4,
  },
  ordenamientoOpcionTextActiva: {
    color: '#ffffff',
  },
  limpiarFiltrosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fed7d7',
  },
  limpiarFiltrosText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  topItemRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topItemRankText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  topItemInfo: {
    flex: 1,
  },
  topItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  topItemSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  topItemTags: {
    flexDirection: 'row',
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#ebf3fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    color: '#3498db',
    fontWeight: '500',
  },
  topItemFreq: {
    alignItems: 'center',
  },
  topItemFreqText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  topItemFreqLabel: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  refreshText: {
    marginLeft: 8,
    color: '#3498db',
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
    padding: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 15,
    minHeight: 120,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default GestionFrecuentes;
