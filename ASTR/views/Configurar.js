import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Button } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getConfiguracionDelStorage,
  guardarConfiguracionEnStorage,
} from '../src/utils/storageConfigData';
import axios from 'axios';
import { getUsuarios } from '../database/controllers/Usuarios.controler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { obtenerMaxNumeroPreventaLocal } from '../src/utils/preventaNumeracion';

const enmascararEndpoint = (endpoint) => {
  if (!endpoint) {
    return 'No configurado';
  }
  const valor = String(endpoint);
  if (valor.length <= 20) {
    return valor;
  }
  return `${valor.slice(0, 20)}****`;
};

const Configurar = () => {
  const [configuracion, setConfiguracion] = useState({
    endPoint: '',
    siguientePreventa: '100',
    vendedor: '',
    sucursal: '',
    usaGeolocalizacion: true,
    cantidadMaximaArticulos: '18',
    filtrarClientesPorVendedor: true,
  });
  const [hasInternetAccess, setHasInternetAccess] = useState(null);
  const [serverData, setServerData] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [vendedores, setVendedores] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const config = await getConfiguracionDelStorage();
    setConfiguracion({
      ...config,
      siguientePreventa: String(config.siguientePreventa ?? '100'),
      cantidadMaximaArticulos: String(config.cantidadMaximaArticulos ?? '18'),
    });
    const usuarios = await getUsuarios();
    setVendedores(usuarios);
  };

  const selectedVendedor = vendedores.find((v) => v.id === configuracion.vendedor);

  const actualizarCampo = (campo, valor) => {
    setConfiguracion((prev) => ({ ...prev, [campo]: valor }));
  };

  const validarYGuardar = async () => {
    const siguiente = parseInt(String(configuracion.siguientePreventa).replace(/[^0-9]/g, ''), 10);
    const maxArticulos = parseInt(
      String(configuracion.cantidadMaximaArticulos).replace(/[^0-9]/g, ''),
      10
    );

    if (!Number.isFinite(siguiente) || siguiente < 1) {
      Alert.alert('Error', 'Siguiente preventa debe ser un número mayor a 0');
      return;
    }

    if (!Number.isFinite(maxArticulos) || maxArticulos < 1) {
      Alert.alert('Error', 'La cantidad máxima de artículos debe ser mayor a 0');
      return;
    }

    const maxLocal = obtenerMaxNumeroPreventaLocal();
    const siguienteFinal =
      maxLocal > 0 ? Math.max(siguiente, maxLocal + 1) : siguiente;

    if (siguienteFinal !== siguiente) {
      Alert.alert(
        'Ajuste automático',
        `Hay preventas locales hasta el número ${maxLocal}. Se guardó ${siguienteFinal} como siguiente preventa.`
      );
    }

    setIsSaving(true);
    try {
      const configActual = await getConfiguracionDelStorage();
      const nuevaConfig = {
        ...configActual,
        ...configuracion,
        siguientePreventa: String(siguienteFinal),
        cantidadMaximaArticulos: String(maxArticulos),
      };

      await guardarConfiguracionEnStorage(nuevaConfig);
      setConfiguracion(nuevaConfig);
      Alert.alert('Éxito', 'Opciones guardadas en el dispositivo');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar las opciones');
    } finally {
      setIsSaving(false);
    }
  };

  const checkInternetAccess = async () => {
    const endpoint = configuracion.endPoint;

    if (!endpoint || endpoint.length === 0) {
      setHasInternetAccess(false);
      setServerData('Endpoint no configurado');
      return;
    }

    if (endpoint[endpoint.length - 1] !== '/') {
      setHasInternetAccess(false);
      setServerData('El endpoint debe terminar en /');
      return;
    }

    setIsTestingConnection(true);
    try {
      const response = await axios.get(endpoint, {
        timeout: 10000,
        validateStatus: (status) => status < 500,
      });

      setServerData(`Servidor accesible - Status: ${response.status}`);
      setHasInternetAccess(true);
    } catch (error) {
      setHasInternetAccess(false);
      let errorMessage = 'Sin conexión';

      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Servidor no disponible en esa IP/puerto';
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'No se puede resolver la dirección';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Tiempo de espera agotado';
      } else if (error.response) {
        errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'No se recibió respuesta del servidor';
      }

      setServerData(errorMessage);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const mostrarValor = (valor, vacio = 'No configurado') => {
    if (valor === null || valor === undefined || valor === '') {
      return vacio;
    }
    return String(valor);
  };

  const insets = useSafeAreaInsets();

  const filasSoloLectura = [
    {
      label: 'Empresa',
      valor: mostrarValor(configuracion.empresaCodigo),
      icon: 'office-building',
    },
    {
      label: 'Endpoint',
      valor: enmascararEndpoint(configuracion.endPoint),
      icon: 'earth',
    },
    {
      label: 'Sucursal',
      valor: mostrarValor(configuracion.sucursal),
      icon: 'store',
    },
    {
      label: 'Vendedor',
      valor: selectedVendedor
        ? `${selectedVendedor.descripcion} (${selectedVendedor.id})`
        : mostrarValor(configuracion.vendedor, 'No seleccionado'),
      icon: 'account',
    },
    {
      label: 'Última sincronización',
      valor: configuracion.ultimaSincronizacionAcceso
        ? new Date(configuracion.ultimaSincronizacionAcceso).toLocaleString()
        : 'No sincronizado',
      icon: 'clock-outline',
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: Math.max(insets.bottom, 20),
      }}
    >
      <View style={styles.container}>
        <View style={styles.titulo}>
          <Text style={styles.tituloText}>OSVI</Text>
          <Text style={styles.subtituloText}>Configuración del dispositivo</Text>
          <Text style={styles.descripcionText}>
            Los datos de acceso se actualizan al iniciar sesión online. Las opciones
            operativas se pueden ajustar y guardar en el dispositivo.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos de acceso</Text>
          {filasSoloLectura.map((fila) => (
            <View key={fila.label} style={styles.row}>
              <View style={styles.rowLabel}>
                <MaterialCommunityIcons name={fila.icon} size={18} color="#3498db" />
                <Text style={styles.label}>{fila.label}</Text>
              </View>
              <Text style={styles.value}>{fila.valor}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Opciones operativas</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Siguiente preventa</Text>
            <TextInput
              style={styles.input}
              value={String(configuracion.siguientePreventa)}
              onChangeText={(text) =>
                actualizarCampo('siguientePreventa', text.replace(/[^0-9]/g, ''))
              }
              keyboardType="numeric"
              placeholder="100"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Máx. artículos por preventa</Text>
            <TextInput
              style={styles.input}
              value={String(configuracion.cantidadMaximaArticulos)}
              onChangeText={(text) =>
                actualizarCampo('cantidadMaximaArticulos', text.replace(/[^0-9]/g, ''))
              }
              keyboardType="numeric"
              placeholder="18"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <MaterialCommunityIcons name="filter" size={18} color="#3498db" />
              <Text style={styles.fieldLabel}>Filtrar clientes por vendedor</Text>
            </View>
            <Switch
              value={configuracion.filtrarClientesPorVendedor !== false}
              onValueChange={(value) =>
                actualizarCampo('filtrarClientesPorVendedor', value)
              }
              trackColor={{ false: '#bdc3c7', true: '#3498db' }}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <MaterialCommunityIcons name="map-marker" size={18} color="#3498db" />
              <Text style={styles.fieldLabel}>Usar geolocalización</Text>
            </View>
            <Switch
              value={configuracion.usaGeolocalizacion !== false}
              onValueChange={(value) => actualizarCampo('usaGeolocalizacion', value)}
              trackColor={{ false: '#bdc3c7', true: '#3498db' }}
            />
          </View>

          <Button
            title={isSaving ? 'Guardando...' : 'Guardar opciones'}
            onPress={validarYGuardar}
            loading={isSaving}
            disabled={isSaving}
            buttonStyle={styles.saveButton}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Prueba de conexión</Text>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons
              name={
                hasInternetAccess === null
                  ? 'help-circle-outline'
                  : hasInternetAccess
                    ? 'check-circle'
                    : 'close-circle'
              }
              size={22}
              color={
                hasInternetAccess === null
                  ? '#95a5a6'
                  : hasInternetAccess
                    ? '#27ae60'
                    : '#e74c3c'
              }
            />
            <Text
              style={[
                styles.statusText,
                hasInternetAccess === true && styles.statusSuccess,
                hasInternetAccess === false && styles.statusError,
              ]}
            >
              {serverData || 'Presioná "Probar conexión" para verificar el servidor'}
            </Text>
          </View>

          <Button
            title={isTestingConnection ? 'Probando...' : 'Probar conexión'}
            onPress={checkInternetAccess}
            loading={isTestingConnection}
            disabled={isTestingConnection}
            buttonStyle={styles.testButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 60,
    padding: 20,
  },
  titulo: {
    marginBottom: 24,
    alignItems: 'center',
  },
  tituloText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtituloText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 4,
  },
  descripcionText: {
    fontSize: 13,
    color: '#95a5a6',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingVertical: 12,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7f8c8d',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 15,
    color: '#2c3e50',
    lineHeight: 20,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginLeft: 8,
  },
  input: {
    height: 44,
    borderColor: '#bdc3c7',
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#2c3e50',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 10,
    lineHeight: 20,
  },
  statusSuccess: {
    color: '#27ae60',
  },
  statusError: {
    color: '#e74c3c',
  },
  saveButton: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 4,
  },
  testButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 12,
  },
});

export default Configurar;
