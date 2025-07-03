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
  ActivityIndicator,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getConfiguracionDelStorage, guardarConfiguracionEnStorage, limpiarConfiguracionDelStorage } from '../src/utils/storageConfigData';

const { width } = Dimensions.get('window');

const Configurar = ({ navigation }) => {
  const [config, setConfig] = useState({
    endPoint: '',
    vendedor: '',
    cantidadMaximaArticulos: '18',
    mostrarPrecios: true,
    mostrarStock: true,
    usaGeolocalizacion: true,
    sucursal: '0001',
    siguientePreventa: '15'
  });
  const [vendedores, setVendedores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    cargarConfiguracion();
    cargarVendedores();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setIsLoading(true);
      const configGuardada = await getConfiguracionDelStorage();
      setConfig(prev => ({ ...prev, ...configGuardada }));
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      Alert.alert('Error', 'No se pudo cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const cargarVendedores = async () => {
    try {
      // Cargar vendedores desde AsyncStorage (simulado)
      const vendedoresData = [
        { id: '0001', descripcion: 'Vendedor Principal' },
        { id: '0002', descripcion: 'Vendedor Secundario' },
        { id: '0003', descripcion: 'Vendedor Tercero' }
      ];
      setVendedores(vendedoresData);
    } catch (error) {
      console.error('Error al cargar vendedores:', error);
    }
  };

  const guardarConfiguracion = async () => {
    try {
      setIsSaving(true);
      
      // Validar endpoint
      if (!config.endPoint.trim()) {
        Alert.alert('Error', 'El endpoint es obligatorio');
        return;
      }

      // Asegurar que el endpoint termine en /
      let endpoint = config.endPoint;
      if (!endpoint.endsWith('/')) {
        endpoint += '/';
        setConfig(prev => ({ ...prev, endPoint: endpoint }));
      }

      // Guardar en AsyncStorage
      await guardarConfiguracionEnStorage(config);
      
      Alert.alert(
        'Éxito', 
        'Configuración guardada correctamente',
        [{ text: 'OK' }]
      );
      
      console.log('Configuración guardada:', config);
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      Alert.alert('Error', 'No se pudo guardar la configuración');
    } finally {
      setIsSaving(false);
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
              await limpiarConfiguracionDelStorage();
              setConfig({
                endPoint: '',
                vendedor: '',
                cantidadMaximaArticulos: '18',
                mostrarPrecios: true,
                mostrarStock: true,
                usaGeolocalizacion: true,
                sucursal: '0001',
                siguientePreventa: '15'
              });
              Alert.alert('Éxito', 'Configuración limpiada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo limpiar la configuración');
            }
          }
        }
      ]
    );
  };

  const exportarConfiguracion = () => {
    try {
      const configData = JSON.stringify(config, null, 2);
      const fileName = `configuracion-astr-${new Date().toISOString().split('T')[0]}.json`;
      
      // En React Native, mostrar el contenido para copiar manualmente
      Alert.alert(
        'Exportar Configuración',
        `Nombre del archivo: ${fileName}\n\nContenido:\n${configData}`,
        [
          { text: 'Copiar', onPress: () => console.log('Copiar al portapapeles:', configData) },
          { text: 'Cerrar', style: 'cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar la configuración');
    }
  };

  const importarConfiguracion = () => {
    Alert.alert(
      'Importar Configuración',
      'Esta función requiere implementación adicional para seleccionar archivos. Por ahora, puedes pegar el contenido JSON en la consola.',
      [{ text: 'Entendido' }]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#30bced" />
        <Text style={styles.loadingText}>Cargando configuración...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="cog" size={32} color="#30bced" />
          <Text style={styles.title}>Configuración del Sistema</Text>
          <Text style={styles.subtitle}>Ajustes generales de la aplicación</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conexión al Servidor</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Endpoint del Servidor</Text>
            <TextInput
              style={styles.input}
              placeholder="https://ejemplo.com/api/"
              value={config.endPoint}
              onChangeText={(text) => setConfig(prev => ({ ...prev, endPoint: text }))}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendedor</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Vendedor Seleccionado</Text>
            <View style={styles.pickerContainer}>
              {vendedores.map((vendedor) => (
                <TouchableOpacity
                  key={vendedor.id}
                  style={[
                    styles.vendedorOption,
                    config.vendedor === vendedor.id && styles.vendedorOptionSelected
                  ]}
                  onPress={() => setConfig(prev => ({ ...prev, vendedor: vendedor.id }))}
                >
                  <Text style={[
                    styles.vendedorText,
                    config.vendedor === vendedor.id && styles.vendedorTextSelected
                  ]}>
                    {vendedor.descripcion} ({vendedor.id})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cantidad Máxima de Artículos</Text>
            <TextInput
              style={styles.input}
              placeholder="18"
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

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Usar Geolocalización</Text>
            <Switch
              value={config.usaGeolocalizacion}
              onValueChange={(value) => setConfig(prev => ({ ...prev, usaGeolocalizacion: value }))}
              trackColor={{ false: '#767577', true: '#30bced' }}
              thumbColor={config.usaGeolocalizacion ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestión de Configuración</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={guardarConfiguracion}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Guardar Configuración</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={exportarConfiguracion}
            >
              <MaterialCommunityIcons name="export" size={20} color="#30bced" />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Exportar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={importarConfiguracion}
            >
              <MaterialCommunityIcons name="import" size={20} color="#30bced" />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Importar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={limpiarConfiguracion}
            >
              <MaterialCommunityIcons name="delete" size={20} color="#fff" />
              <Text style={styles.buttonText}>Limpiar Configuración</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
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
    marginBottom: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
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
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#30bced',
  },
});

export default Configurar;
