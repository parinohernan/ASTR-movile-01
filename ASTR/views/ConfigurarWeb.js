import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  Switch,
  ActivityIndicator
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import indexedDBHandler from '../src/utils/indexedDBHandler';

const ConfigurarWeb = ({ navigation }) => {
  const [config, setConfig] = useState({
    endpoint: '',
    vendedorSeleccionado: '',
    cantidadMaximaArticulos: '50',
    mostrarPrecios: true,
    mostrarStock: true,
  });
  const [vendedores, setVendedores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVendedores, setIsLoadingVendedores] = useState(false);

  useEffect(() => {
    cargarConfiguracion();
    cargarVendedores();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      const configData = await indexedDBHandler.obtenerConfiguracion();
      if (configData && Object.keys(configData).length > 0) {
        setConfig(prev => ({ ...prev, ...configData }));
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  };

  const cargarVendedores = async () => {
    try {
      setIsLoadingVendedores(true);
      console.log('🔄 Iniciando carga de vendedores...');
      
      // Intentar obtener vendedores desde IndexedDB
      const vendedores = await indexedDBHandler.obtenerVendedores();
      console.log('📦 Vendedores obtenidos de IndexedDB:', vendedores);
      
      if (vendedores && vendedores.length > 0) {
        setVendedores(vendedores);
        console.log(`✅ Se cargaron ${vendedores.length} vendedores desde IndexedDB`);
      } else {
        setVendedores([]);
        console.log('⚠️ No hay vendedores sincronizados disponibles');
      }
      
    } catch (error) {
      console.error('❌ Error al cargar vendedores:', error);
      setVendedores([]);
    } finally {
      setIsLoadingVendedores(false);
    }
  };

  const irASincronizar = () => {
    navigation.navigate('Sincronizar');
  };

  const probarSincronizacionVendedores = async () => {
    try {
      setIsLoading(true);
      console.log('🧪 Probando sincronización completa...');
      
      // Obtener configuración desde IndexedDB
      const config = await indexedDBHandler.obtenerConfiguracion();
      if (!config || !config.endpoint) {
        Alert.alert('Error', 'Endpoint no configurado. Configure el servidor primero.');
        return;
      }
      
      let totalSincronizados = 0;
      let mensajes = [];
      
      // 1. Sincronizar vendedores
      try {
        console.log('📋 Sincronizando vendedores...');
        const vendedoresResponse = await fetch(`${config.endpoint}vendedores`);
        if (vendedoresResponse.ok) {
          const vendedores = await vendedoresResponse.json();
          const vendedoresArray = Array.isArray(vendedores) ? vendedores : (vendedores.items || vendedores.data || []);
          await indexedDBHandler.guardarVendedores(vendedoresArray);
          totalSincronizados += vendedoresArray.length;
          mensajes.push(`${vendedoresArray.length} vendedores`);
          console.log(`✅ ${vendedoresArray.length} vendedores sincronizados`);
        } else {
          mensajes.push('Error en vendedores');
          console.log('❌ Error al sincronizar vendedores');
        }
      } catch (error) {
        mensajes.push('Error en vendedores');
        console.log('❌ Error al sincronizar vendedores:', error);
      }
      
      // 2. Sincronizar clientes
      try {
        console.log('📋 Sincronizando clientes...');
        const clientesResponse = await fetch(`${config.endpoint}clientes`);
        if (clientesResponse.ok) {
          const clientes = await clientesResponse.json();
          const clientesArray = Array.isArray(clientes) ? clientes : (clientes.items || clientes.data || []);
          await indexedDBHandler.guardarClientes(clientesArray);
          totalSincronizados += clientesArray.length;
          mensajes.push(`${clientesArray.length} clientes`);
          console.log(`✅ ${clientesArray.length} clientes sincronizados`);
        } else {
          mensajes.push('Error en clientes');
          console.log('❌ Error al sincronizar clientes');
        }
      } catch (error) {
        mensajes.push('Error en clientes');
        console.log('❌ Error al sincronizar clientes:', error);
      }
      
      // 3. Sincronizar artículos
      try {
        console.log('📋 Sincronizando artículos...');
        const articulosResponse = await fetch(`${config.endpoint}articulos`);
        if (articulosResponse.ok) {
          const articulos = await articulosResponse.json();
          const articulosArray = Array.isArray(articulos) ? articulos : (articulos.items || articulos.data || []);
          await indexedDBHandler.guardarArticulos(articulosArray);
          totalSincronizados += articulosArray.length;
          mensajes.push(`${articulosArray.length} artículos`);
          console.log(`✅ ${articulosArray.length} artículos sincronizados`);
        } else {
          mensajes.push('Error en artículos');
          console.log('❌ Error al sincronizar artículos');
        }
      } catch (error) {
        mensajes.push('Error en artículos');
        console.log('❌ Error al sincronizar artículos:', error);
      }
      
      // Recargar vendedores en el componente
      const vendedoresActualizados = await indexedDBHandler.obtenerVendedores();
      setVendedores(vendedoresActualizados);
      
      Alert.alert(
        'Sincronización Completada', 
        `Total sincronizado: ${totalSincronizados} elementos\n\n${mensajes.join('\n')}`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('❌ Error en prueba de sincronización:', error);
      Alert.alert('Error', `No se pudo sincronizar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const guardarConfiguracion = async () => {
    try {
      console.log('🚀 Iniciando guardado de configuración...');
      console.log('📝 Configuración a guardar:', config);
      
      setIsLoading(true);
      
      // Validar endpoint
      if (!config.endpoint.trim()) {
        console.log('❌ Endpoint vacío');
        Alert.alert('Error', 'El endpoint es obligatorio');
        return;
      }

      // Validar que haya un vendedor seleccionado si hay vendedores disponibles
      if (vendedores.length > 0 && !config.vendedorSeleccionado) {
        console.log('❌ No hay vendedor seleccionado');
        Alert.alert('Error', 'Debe seleccionar un vendedor');
        return;
      }

      console.log('💾 Guardando en IndexedDB...');
      // Guardar en IndexedDB
      const resultado = await indexedDBHandler.guardarConfiguracion(config);
      console.log('✅ Resultado del guardado:', resultado);
      
      // Mostrar mensaje de éxito
      console.log('📢 Mostrando mensaje de éxito...');
      Alert.alert(
        '✅ Configuración Guardada', 
        'La configuración se ha guardado correctamente en la base de datos local.',
        [{ 
          text: 'OK',
          onPress: () => {
            console.log('👆 Usuario confirmó el mensaje de éxito');
          }
        }]
      );
      
      console.log('🎉 Proceso de guardado completado exitosamente');
    } catch (error) {
      console.error('❌ Error al guardar configuración:', error);
      Alert.alert(
        '❌ Error al Guardar', 
        `No se pudo guardar la configuración: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      console.log('🏁 Finalizando proceso de guardado');
    }
  };

  const limpiarConfiguracion = () => {
    Alert.alert(
      'Confirmar',
      '¿Está seguro de que desea limpiar toda la configuración?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpiar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await indexedDBHandler.limpiarBaseDatos();
              setConfig({
                endpoint: '',
                vendedorSeleccionado: '',
                cantidadMaximaArticulos: '50',
                mostrarPrecios: true,
                mostrarStock: true,
              });
              setVendedores([]);
              Alert.alert('Éxito', 'Configuración y datos limpiados');
            } catch (error) {
              console.error('Error al limpiar configuración:', error);
              Alert.alert('Error', 'No se pudo limpiar la configuración');
            }
          }
        }
      ]
    );
  };

  const exportarConfiguracion = () => {
    try {
      const configData = {
        ...config,
        fechaExportacion: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(configData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `configuracion-astr-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      Alert.alert('Éxito', 'Configuración exportada correctamente');
    } catch (error) {
      console.error('Error al exportar configuración:', error);
      Alert.alert('Error', 'No se pudo exportar la configuración');
    }
  };

  const importarConfiguracion = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const configData = JSON.parse(e.target.result);
            setConfig(prev => ({ ...prev, ...configData }));
            localStorage.setItem('configuracion', JSON.stringify(configData));
            Alert.alert('Éxito', 'Configuración importada correctamente');
          } catch (error) {
            console.error('Error al importar configuración:', error);
            Alert.alert('Error', 'El archivo no es válido');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const renderVendedoresSection = () => {
    if (isLoadingVendedores) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#30bced" />
          <Text style={styles.loadingText}>Cargando vendedores...</Text>
        </View>
      );
    }

    if (vendedores.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>No hay vendedores disponibles</Text>
          <Text style={styles.emptyStateSubtitle}>
            Para seleccionar un vendedor, primero debe sincronizar los datos con el servidor
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.syncButton}
              onPress={irASincronizar}
            >
              <Text style={styles.syncButtonText}>Ir a Sincronizar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.syncButton, styles.testButton]}
              onPress={probarSincronizacionVendedores}
              disabled={isLoading}
            >
              <Text style={styles.syncButtonText}>
                {isLoading ? 'Probando...' : 'Probar Sincronización'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Vendedor Seleccionado</Text>
        <View style={styles.pickerContainer}>
          {vendedores.map((vendedor) => (
            <TouchableOpacity
              key={vendedor.codigo}
              style={[
                styles.vendedorOption,
                config.vendedorSeleccionado === vendedor.codigo && styles.vendedorOptionSelected
              ]}
              onPress={() => setConfig(prev => ({ ...prev, vendedorSeleccionado: vendedor.codigo }))}
            >
              <Text style={[
                styles.vendedorText,
                config.vendedorSeleccionado === vendedor.codigo && styles.vendedorTextSelected
              ]}>
                {vendedor.descripcion} ({vendedor.codigo})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
              <Text style={styles.backButtonText}>Atrás</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Configuración del Sistema</Text>
            <Text style={styles.subtitle}>Ajustes generales de la aplicación</Text>
          </View>
          
          <View style={styles.headerRight}>
            {/* Espacio para futuros elementos */}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conexión al Servidor</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Endpoint del Servidor</Text>
            <TextInput
              style={styles.input}
              placeholder="https://ejemplo.com/api"
              value={config.endpoint}
              onChangeText={(text) => setConfig(prev => ({ ...prev, endpoint: text }))}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendedor</Text>
          {renderVendedoresSection()}
          
          {/* Botón de prueba de sincronización */}
          <View style={styles.syncTestContainer}>
            <Text style={styles.syncTestTitle}>Prueba de Sincronización</Text>
            <Text style={styles.syncTestSubtitle}>
              Descargue vendedores, clientes y artículos desde el servidor configurado
            </Text>
            <TouchableOpacity
              style={[styles.syncTestButton, isLoading && styles.syncTestButtonDisabled]}
              onPress={probarSincronizacionVendedores}
              disabled={isLoading}
            >
              <Text style={styles.syncTestButtonText}>
                {isLoading ? 'Sincronizando...' : 'Probar Sincronización'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cantidad Máxima de Artículos</Text>
            <TextInput
              style={styles.input}
              placeholder="50"
              value={config.cantidadMaximaArticulos}
              onChangeText={(text) => setConfig(prev => ({ ...prev, cantidadMaximaArticulos: text }))}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Mostrar Precios</Text>
            <Switch
              value={config.mostrarPrecios}
              onValueChange={(value) => setConfig(prev => ({ ...prev, mostrarPrecios: value }))}
              trackColor={{ false: '#767577', true: '#30bced' }}
              thumbColor={config.mostrarPrecios ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Mostrar Stock</Text>
            <Switch
              value={config.mostrarStock}
              onValueChange={(value) => setConfig(prev => ({ ...prev, mostrarStock: value }))}
              trackColor={{ false: '#767577', true: '#30bced' }}
              thumbColor={config.mostrarStock ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={guardarConfiguracion}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Guardando...' : 'Guardar Configuración'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={exportarConfiguracion}
            >
              <Text style={styles.secondaryButtonText}>Exportar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={importarConfiguracion}
            >
              <Text style={styles.secondaryButtonText}>Importar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={limpiarConfiguracion}
            >
              <Text style={styles.dangerButtonText}>Limpiar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  syncButton: {
    backgroundColor: '#30bced',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vendedorOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  vendedorOptionSelected: {
    backgroundColor: '#30bced',
    borderColor: '#30bced',
  },
  vendedorText: {
    fontSize: 14,
    color: '#666',
  },
  vendedorTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#30bced',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#30bced',
  },
  dangerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#30bced',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  testButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#30bced',
  },
  syncTestContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  syncTestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  syncTestSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  syncTestButton: {
    backgroundColor: '#27ae60',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    elevation: 2,
  },
  syncTestButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  syncTestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConfigurarWeb; 