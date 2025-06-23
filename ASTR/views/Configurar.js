import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, Switch, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Button } from 'react-native-elements';
import { guardarConfiguracionEnStorage, getConfiguracionDelStorage, limpiarConfiguracionDelStorage, establecerConfiguracionPrueba } from '../src/utils/storageConfigData';
import axios  from 'axios';
import { getUsuarios, insertUsuariosFromAPI } from '../database/controllers/Usuarios.controler';
import { Searchbar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { actualizarSoloVendedores } from '../handlers/actualizarApp';
import checkServerHandler from '../src/utils/checkServerHandler';


// import limpiarDatos from "../database/database"r
const Configurar = () => {
 
  const [configuracion, setConfiguracion]= useState({
    endPoint:"",
    siguientePreventa: 100,//este dato solo se visualiza, se actualiza automaticamente
    vendedor: "",
    sucursal: "",
    usaGeolocalizacion: true,
    cantidadMaximaArticulos: "18",
    filtrarClientesPorVendedor: true,
  })
  const [hasInternetAccess, setHasInternetAccess] = useState();
  const [serverData, setServerData] =useState();
  const [changes, setChanges]= useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [vendedores, setVendedores] = useState([]);
  const [vendedorModalVisible, setVendedorModalVisible] = useState(false);
  const [searchVendedor, setSearchVendedor] = useState('');
  const [isLoadingVendedores, setIsLoadingVendedores] = useState(false);

  useEffect(() => {
    handleGetConfiguracion();
    checkInternetAccess();
    handeBuscarVendedores();
  }, []);

  useEffect(() => {
    setChanges(true);
    checkInternetAccess();
  }, [configuracion.endPoint]);

  const handeBuscarVendedores = async () => {
    console.log("buscando vendedores");
    const usuarios = await getUsuarios();
    setVendedores(usuarios);
    console.log("vendedores", vendedores);
  };

  const handleGetConfiguracion = async ()=>{
    let config = await getConfiguracionDelStorage();
    console.log("Confi 70.. config ", config);
    setConfiguracion(config);
  }

  const handleGuardarConfiguracion = ()=>{
    console.log("guardando config:",configuracion);
    guardarConfiguracionEnStorage(configuracion);
    setChanges( !changes)
    Alert.alert("Éxito", "Configuración guardada correctamente");
  }

  const handleLimpiarConfiguracion = async () => {
    Alert.alert(
      "Confirmar limpieza",
      "¿Está seguro que desea limpiar toda la configuración?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpiar",
          style: "destructive",
          onPress: async () => {
            try {
              await limpiarConfiguracionDelStorage();
              await handleGetConfiguracion();
              Alert.alert("Éxito", "Configuración limpiada");
            } catch (error) {
              Alert.alert("Error", "No se pudo limpiar la configuración");
            }
          }
        }
      ]
    );
  };

  const handleConfiguracionPrueba = async () => {
    try {
      await establecerConfiguracionPrueba();
      await handleGetConfiguracion();
      Alert.alert("Éxito", "Configuración de prueba establecida");
    } catch (error) {
      Alert.alert("Error", "No se pudo establecer la configuración de prueba");
    }
  };

  const checkInternetAccess = async () => {
    let endpoint = configuracion.endPoint;
   
    
    if (!endpoint || endpoint.length === 0) {
      setHasInternetAccess(false);
      setServerData("Endpoint no configurado");
      return;
    }
    
    if (endpoint[endpoint.length - 1] !== "/") {
      setHasInternetAccess(false);
      setServerData("El endpoint debe terminar en /");
      return;
    }

    setIsTestingConnection(true);
    try {
      console.log("aca checkeando",endpoint);
      const response = await axios.get(endpoint, {
        timeout: 10000,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      setServerData(`Servidor accesible - Status: ${response.status}`);
      setHasInternetAccess(true);
    } catch (error) {
      setHasInternetAccess(false);
      let errorMessage = "Sin conexión";
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = "Servidor no disponible en esa IP/puerto";
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = "No se puede resolver la dirección";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Tiempo de espera agotado";
      } else if (error.response) {
        errorMessage = `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = "No se recibió respuesta del servidor";
      }
      
      setServerData(errorMessage);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Nuevo: Cargar vendedores desde el endpoint
  const handleCargarVendedores = async () => {
    if (!configuracion.endPoint || !configuracion.endPoint.endsWith('/')) {
      Alert.alert("Error", "El endpoint debe estar configurado y terminar en /");
      return;
    }
    
    setIsLoadingVendedores(true);
    
    try {
      // Verificar conexión al servidor
      if (await checkServerHandler()) {
        const logs = [];
        const setLogs = (newLogs) => {
          console.log("Log actualizado:", newLogs[newLogs.length - 1]);
        };
        
        const resultado = await actualizarSoloVendedores(logs, setLogs);
        
        if (resultado.success) {
          await handeBuscarVendedores();
          Alert.alert("Éxito", resultado.message);
        } else {
          Alert.alert("Error", resultado.message);
        }
      } else {
        Alert.alert("Error", "No se puede conectar al servidor. Verifique la configuración del endpoint.");
      }
    } catch (error) {
      console.error('Error al cargar vendedores:', error);
      Alert.alert("Error", "No se pudieron cargar los vendedores desde el endpoint");
    } finally {
      setIsLoadingVendedores(false);
    }
  };

  const handleSelectVendedor = (vendedor) => {
    setConfiguracion({ ...configuracion, vendedor: vendedor.id });
    setVendedorModalVisible(false);
  };

  const filteredVendedores = vendedores.filter(
    vendedor =>
      vendedor.descripcion.toLowerCase().includes(searchVendedor.toLowerCase()) ||
      vendedor.id.toLowerCase().includes(searchVendedor.toLowerCase())
  );
  
  const selectedVendedor = vendedores.find(v => v.id === configuracion.vendedor);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <Modal
          visible={vendedorModalVisible}
          animationType="slide"
          onRequestClose={() => setVendedorModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Vendedor</Text>
              <TouchableOpacity onPress={() => setVendedorModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>
            <Searchbar
              placeholder="Buscar vendedor..."
              onChangeText={setSearchVendedor}
              value={searchVendedor}
              style={styles.searchbarModal}
            />
            <FlatList
              data={filteredVendedores}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.vendedorItem}
                  onPress={() => handleSelectVendedor(item)}
                >
                  <Text style={styles.vendedorName}>{item.descripcion}</Text>
                  <Text style={styles.vendedorId}>ID: {item.id}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>

        <View style={styles.titulo}>
          <Text style={styles.tituloText}>OSVI</Text>
          <Text style={styles.subtituloText}>panel de configuracion,  {hasInternetAccess? console.log(hasInternetAccess, "tengo internet"): console.log("muerto, no tengo internet")}</Text>
        </View>
        <Text><MaterialCommunityIcons name="earth" size={16} color="#2c3e50" /> {hasInternetAccess? "✓":"X"} EndPoint:</Text>
        <TextInput
          style={[styles.input, hasInternetAccess ? styles.inputSuccess : styles.inputError]}
          value={configuracion.endPoint}
          onChangeText={(text) => setConfiguracion({ ...configuracion, endPoint: text })}
          placeholder="https://192.168.1.100:3003/"
          />
        <Text style={[styles.statusText, hasInternetAccess ? styles.statusSuccess : styles.statusError]}>
          {isTestingConnection ? "Probando conexión..." : serverData}
        </Text>
        <View style={styles.buttonRow}>
          {/* <Button 
            title="Probar Conexión" 
            onPress={checkInternetAccess}
            loading={isTestingConnection}
            buttonStyle={styles.testButton}
          /> */}
          <Button
            title="Cargar Vendedores"
            onPress={handleCargarVendedores}
            loading={isLoadingVendedores}
            buttonStyle={styles.testButton}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración General</Text>
          <Text style={styles.label}>Sucursal:</Text>
          <TextInput
            style={styles.input}
            value={configuracion.sucursal}
            onChangeText={(text) => setConfiguracion({ ...configuracion, sucursal: text.replace(/[^0-9]/g, '') })}
            keyboardType="numeric"
          />
          
          <Text style={styles.label}>Vendedor por defecto:</Text>
          <TouchableOpacity
            style={styles.inputSelector}
            onPress={() => setVendedorModalVisible(true)}
          >
            <Text style={styles.inputText}>
              {selectedVendedor ? selectedVendedor.descripcion : 'Seleccionar Vendedor'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color="#7f8c8d" />
          </TouchableOpacity>
          
          <Text style={styles.label}>Cantidad máxima de artículos:</Text>
          <TextInput
            style={styles.input}
            value={configuracion.cantidadMaximaArticulos}
            onChangeText={(text) => setConfiguracion({ ...configuracion, cantidadMaximaArticulos: text.replace(/[^0-9]/g, '') })}
            keyboardType="numeric"
          />
          
          <Text style={styles.label}>Siguiente preventa:</Text>
          <TextInput
            style={styles.input}
            value={String(configuracion.siguientePreventa)}
            onChangeText={(text) => setConfiguracion({ ...configuracion, siguientePreventa: text.replace(/[^0-9]/g, '') })}
          />

          <View style={styles.switchRow}>
            <Text style={styles.label}>Filtrar clientes por vendedor</Text>
            <Switch
              value={configuracion.filtrarClientesPorVendedor}
              onValueChange={(value) => setConfiguracion({ ...configuracion, filtrarClientesPorVendedor: value })}
              trackColor={{ false: "#bdc3c7", true: "#3498db" }}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title="Guardar Configuración" 
            onPress={handleGuardarConfiguracion} 
            buttonStyle={styles.saveButton}
          /> 
        </View>
        <View style={styles.buttonRow}>
          {/* <Button 
            title="Configuración Local" 
            onPress={handleConfiguracionPrueba}
            buttonStyle={styles.quickButton}
          />
          <Button 
            title="Limpiar Config" 
            onPress={handleLimpiarConfiguracion}
            buttonStyle={[styles.quickButton, styles.dangerButton]}
          /> */}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    padding: 20,
  },
  titulo: {
    marginBottom: 30,
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
  },
  section: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#bdc3c7',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  inputSuccess: {
    borderColor: '#27ae60',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  statusText: {
    fontSize: 14,
    marginBottom: 10,
  },
  statusSuccess: {
    color: '#27ae60',
  },
  statusError: {
    color: '#e74c3c',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  testButton: {
    backgroundColor: '#3498db',
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  quickButton: {
    backgroundColor: '#95a5a6',
    borderRadius: 15,
    paddingHorizontal: 15,
    minWidth: 120,
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  inputSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    borderColor: '#bdc3c7',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  inputText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  vendendorContainer: {
    height: 130,
    zIndex: 10,
    borderColor: '#bdc3c7',
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  saveButton: {
    alignItems: 'center',
    minWidth: 200,
    maxWidth: 300,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#2c3e50",
    backgroundColor: '#2c3e50',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  searchbarModal: {
    marginBottom: 15,
    borderRadius: 10,
  },
  vendedorItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  vendedorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  vendedorId: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
});

export default Configurar;

