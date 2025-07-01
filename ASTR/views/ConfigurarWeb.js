import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  Switch 
} from 'react-native';

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

  useEffect(() => {
    cargarConfiguracion();
    cargarVendedores();
  }, []);

  const cargarConfiguracion = () => {
    try {
      const configGuardada = localStorage.getItem('configuracion');
      if (configGuardada) {
        const configData = JSON.parse(configGuardada);
        setConfig(prev => ({ ...prev, ...configData }));
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  };

  const cargarVendedores = () => {
    try {
      const usuarios = localStorage.getItem('usuarios');
      if (usuarios) {
        const usuariosData = JSON.parse(usuarios);
        setVendedores(usuariosData);
      }
    } catch (error) {
      console.error('Error al cargar vendedores:', error);
    }
  };

  const guardarConfiguracion = async () => {
    try {
      setIsLoading(true);
      
      // Validar endpoint
      if (!config.endpoint.trim()) {
        Alert.alert('Error', 'El endpoint es obligatorio');
        return;
      }

      // Guardar en localStorage
      localStorage.setItem('configuracion', JSON.stringify(config));
      
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
      setIsLoading(false);
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
          onPress: () => {
            localStorage.removeItem('configuracion');
            setConfig({
              endpoint: '',
              vendedorSeleccionado: '',
              cantidadMaximaArticulos: '50',
              mostrarPrecios: true,
              mostrarStock: true,
            });
            Alert.alert('Éxito', 'Configuración limpiada');
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Configuración del Sistema</Text>
          <Text style={styles.subtitle}>Ajustes generales de la aplicación</Text>
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
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Vendedor Seleccionado</Text>
            <View style={styles.pickerContainer}>
              {vendedores.map((vendedor) => (
                <TouchableOpacity
                  key={vendedor.id}
                  style={[
                    styles.vendedorOption,
                    config.vendedorSeleccionado === vendedor.id && styles.vendedorOptionSelected
                  ]}
                  onPress={() => setConfig(prev => ({ ...prev, vendedorSeleccionado: vendedor.id }))}
                >
                  <Text style={[
                    styles.vendedorText,
                    config.vendedorSeleccionado === vendedor.id && styles.vendedorTextSelected
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
    alignItems: 'center',
    marginBottom: 30,
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
});

export default ConfigurarWeb; 