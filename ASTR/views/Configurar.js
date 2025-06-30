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
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';

const Configurar = () => {
 
  const [configuracion, setConfiguracion]= useState({
    endPoint:"",
    siguientePreventa: 100,
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
  
  // Nuevos estados para configuración por archivo
  const [isLoadingConfigFile, setIsLoadingConfigFile] = useState(false);
  const [configuracionMode, setConfiguracionMode] = useState('simple'); // 'simple' o 'advanced'

  useEffect(() => {
    handleGetConfiguracion();
    checkInternetAccess();
    handeBuscarVendedores();
  }, []);

  useEffect(() => {
    setChanges(true);
    checkInternetAccess();
  }, [configuracion.endPoint]);

  // Efecto para verificar que el vendedor seleccionado esté en la lista
  useEffect(() => {
    if (vendedores.length > 0 && configuracion.vendedor) {
      const vendedorEncontrado = vendedores.find(v => v.id === configuracion.vendedor);
      if (!vendedorEncontrado) {
        console.warn("⚠️ Vendedor configurado no encontrado en la lista actualizada");
      } else {
        console.log("✅ Vendedor configurado encontrado:", vendedorEncontrado.descripcion);
      }
    }
  }, [vendedores, configuracion.vendedor]);

  const handeBuscarVendedores = async () => {
    console.log("🔍 Buscando vendedores...");
    try {
      const usuarios = await getUsuarios();
      setVendedores(usuarios);
      console.log("✅ Vendedores cargados:", usuarios.length, "vendedores");
      
      // Verificar si el vendedor actual está en la lista
      if (configuracion.vendedor) {
        const vendedorActual = usuarios.find(v => v.id === configuracion.vendedor);
        if (vendedorActual) {
          console.log("✅ Vendedor actual encontrado en la lista:", vendedorActual.descripcion);
        } else {
          console.warn("⚠️ Vendedor actual no encontrado en la lista:", configuracion.vendedor);
        }
      }
    } catch (error) {
      console.error("❌ Error al buscar vendedores:", error);
      setVendedores([]);
    }
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

  // Nueva función para importar archivo de configuración
  const handleImportarConfiguracion = async () => {
    try {
      setIsLoadingConfigFile(true);
      
      // Abrir selector de archivos
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        return;
      }

      const fileUri = result.assets[0].uri;
      console.log("📁 Archivo seleccionado:", fileUri);

      // Leer contenido del archivo
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      console.log(" Contenido del archivo:", fileContent);

      // Parsear JSON
      const configData = JSON.parse(fileContent);
      console.log(" Datos de configuración:", configData);

      // Validar estructura del archivo
      if (!validarArchivoConfiguracion(configData)) {
        Alert.alert("❌ Error", "El archivo de configuración no es válido");
        return;
      }

      // Aplicar configuración
      await aplicarConfiguracionDesdeArchivo(configData);

      Alert.alert("✅ Éxito", "Configuración importada correctamente");

    } catch (error) {
      console.error('Error al importar configuración:', error);
      Alert.alert("❌ Error", "No se pudo importar la configuración");
    } finally {
      setIsLoadingConfigFile(false);
    }
  };

  // Validar estructura del archivo de configuración
  const validarArchivoConfiguracion = (configData) => {
    console.log("🔍 Validando archivo de configuración:", configData);
    
    const camposRequeridos = ['version', 'empresa', 'vendedor', 'configuracion'];
    const configRequeridos = ['endpoint', 'sucursal'];
    const vendedorRequeridos = ['id', 'nombre', 'sucursal'];

    // Verificar campos principales
    for (const campo of camposRequeridos) {
      if (!configData[campo]) {
        console.error(`❌ Campo requerido faltante: ${campo}`);
        return false;
      }
    }

    // Verificar configuración
    for (const campo of configRequeridos) {
      if (!configData.configuracion[campo]) {
        console.error(`❌ Campo de configuración faltante: ${campo}`);
        return false;
      }
    }

    // Verificar vendedor
    for (const campo of vendedorRequeridos) {
      if (!configData.vendedor[campo]) {
        console.error(`❌ Campo de vendedor faltante: ${campo}`);
        return false;
      }
    }

    console.log("✅ Validación exitosa");
    return true;
  };

  // Aplicar configuración desde archivo
  const aplicarConfiguracionDesdeArchivo = async (configData) => {
    try {
      console.log("🔄 Aplicando configuración desde archivo:", configData);
      
      // Crear vendedor desde el archivo con la estructura correcta
      const vendedor = {
        codigo: configData.vendedor.id,        // La función insertUsuariosFromAPI espera 'codigo'
        descripcion: configData.vendedor.nombre,
        clave: configData.vendedor.sucursal    // Usar 'sucursal' como 'clave'
      };

      console.log("🔄 Vendedor creado:", vendedor);

      // Insertar vendedor en la base de datos con parámetros correctos
      const logs = [];
      await insertUsuariosFromAPI([vendedor], logs, (newLogs) => {
        console.log("Logs de inserción:", newLogs[newLogs.length - 1]);
      });
      console.log("✅ Vendedor insertado en BD");

      // Aplicar configuración con valores por defecto para campos faltantes
      const nuevaConfig = {
        ...configuracion,
        endPoint: configData.configuracion.endpoint,
        sucursal: configData.configuracion.sucursal,
        vendedor: vendedor.codigo,  // Usar 'codigo' para la configuración
        cantidadMaximaArticulos: configData.configuracion.cantidadMaximaArticulos || "18",
        filtrarClientesPorVendedor: configData.configuracion.filtrarClientesPorVendedor !== false, // true por defecto
        usaGeolocalizacion: configData.configuracion.usaGeolocalizacion !== false, // true por defecto
        siguientePreventa: configData.configuracion.siguientePreventa || 100
      };

      console.log("⚙️ Nueva configuración:", nuevaConfig);

      // Actualizar estado
      setConfiguracion(nuevaConfig);

      // Guardar en storage
      await guardarConfiguracionEnStorage(nuevaConfig);
      console.log("💾 Configuración guardada en storage");

      // PASO 1: Sincronizar vendedores desde el endpoint
      console.log("🔄 Sincronizando vendedores desde el endpoint...");
      try {
        if (await checkServerHandler()) {
          const logs = [];
          const setLogs = (newLogs) => {
            console.log("Log de sincronización:", newLogs[newLogs.length - 1]);
          };
          
          const resultado = await actualizarSoloVendedores(logs, setLogs);
          
          if (resultado.success) {
            console.log("✅ Vendedores sincronizados desde el endpoint");
          } else {
            console.warn("⚠️ Error al sincronizar vendedores:", resultado.message);
          }
        } else {
          console.warn("⚠️ No se puede conectar al servidor para sincronizar vendedores");
        }
      } catch (error) {
        console.warn("⚠️ Error al sincronizar vendedores:", error);
      }

      // PASO 2: Recargar vendedores de la base de datos local
      await handeBuscarVendedores();
      console.log("🔄 Vendedores recargados desde BD local");

      // PASO 3: Verificar que el vendedor se seleccionó correctamente
      const vendedoresActualizados = await getUsuarios();
      const vendedorSeleccionado = vendedoresActualizados.find(v => v.id === vendedor.codigo);
      
      if (vendedorSeleccionado) {
        console.log("✅ Vendedor seleccionado automáticamente:", vendedorSeleccionado.descripcion);
      } else {
        console.warn("⚠️ No se pudo encontrar el vendedor en la lista actualizada");
        console.log("🔍 Vendedores disponibles:", vendedoresActualizados.map(v => `${v.id}: ${v.descripcion}`));
        console.log("🔍 Buscando vendedor con ID:", vendedor.codigo);
        
        // Si no se encuentra, intentar insertar el vendedor localmente como respaldo
        console.log("🔄 Insertando vendedor localmente como respaldo...");
        const logs = [];
        await insertUsuariosFromAPI([vendedor], logs, (newLogs) => {
          console.log("Logs de inserción local:", newLogs[newLogs.length - 1]);
        });
        
        // Recargar nuevamente
        await handeBuscarVendedores();
        const vendedoresFinales = await getUsuarios();
        const vendedorFinal = vendedoresFinales.find(v => v.id === vendedor.codigo);
        
        if (vendedorFinal) {
          console.log("✅ Vendedor insertado localmente y seleccionado:", vendedorFinal.descripcion);
        } else {
          console.error("❌ No se pudo insertar ni encontrar el vendedor");
        }
      }

      console.log("✅ Configuración aplicada exitosamente:", {
        empresa: configData.empresa,
        vendedor: vendedor.descripcion,
        vendedorId: vendedor.codigo,
        endpoint: configData.configuracion.endpoint
      });

    } catch (error) {
      console.error('❌ Error al aplicar configuración:', error);
      throw error;
    }
  };

  // Nueva función para crear backup de configuración
  const handleCrearBackup = async () => {
    try {
      const backupData = {
        version: "1.0",
        empresa: "OSVI",
        vendedor: {
          id: configuracion.vendedor,
          nombre: selectedVendedor ? selectedVendedor.descripcion : "Vendedor no seleccionado",
          sucursal: configuracion.sucursal
        },
        configuracion: {
          endpoint: configuracion.endPoint,
          sucursal: configuracion.sucursal,
          cantidadMaximaArticulos: configuracion.cantidadMaximaArticulos,
          filtrarClientesPorVendedor: configuracion.filtrarClientesPorVendedor,
          usaGeolocalizacion: configuracion.usaGeolocalizacion,
          siguientePreventa: configuracion.siguientePreventa
        },
        timestamp: new Date().toISOString(),
        tipo: "backup"
      };

      // Crear nombre de archivo con fecha
      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `backup_config_${fecha}.json`;

      // Convertir a JSON formateado
      const jsonString = JSON.stringify(backupData, null, 2);

      Alert.alert(
        "💾 Backup Creado",
        `Archivo: ${nombreArchivo}\n\n¿Qué deseas hacer con el backup?`,
        [
          { 
            text: " Copiar al Portapapeles", 
            onPress: async () => {
              try {
                await Clipboard.setStringAsync(jsonString);
                Alert.alert("✅ Copiado", "Backup copiado al portapapeles correctamente");
                console.log("Backup copiado al portapapeles:", backupData);
              } catch (error) {
                console.error('Error al copiar al portapapeles:', error);
                Alert.alert("❌ Error", "No se pudo copiar al portapapeles");
              }
            }
          },
          { 
            text: "📁 Guardar como Archivo", 
            onPress: async () => {
              try {
                // Guardar en el directorio de documentos
                const fileUri = `${FileSystem.documentDirectory}${nombreArchivo}`;
                await FileSystem.writeAsStringAsync(fileUri, jsonString);
                Alert.alert("✅ Guardado", `Archivo guardado como: ${nombreArchivo}`);
                console.log("Backup guardado como archivo:", fileUri);
              } catch (error) {
                console.error('Error al guardar archivo:', error);
                Alert.alert("❌ Error", "No se pudo guardar el archivo");
              }
            }
          },
          { text: "❌ Cancelar", style: "cancel" }
        ]
      );

    } catch (error) {
      console.error('Error al crear backup:', error);
      Alert.alert("❌ Error", "No se pudo crear el backup");
    }
  };

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
          <Text style={styles.subtituloText}>Panel de configuración</Text>
        </View>

        {/* Selector de modo de configuración */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, configuracionMode === 'simple' && styles.modeButtonActive]}
            onPress={() => setConfiguracionMode('simple')}
          >
            <MaterialCommunityIcons name="lightning-bolt" size={20} color={configuracionMode === 'simple' ? '#fff' : '#7f8c8d'} />
            <Text style={[styles.modeButtonText, configuracionMode === 'simple' && styles.modeButtonTextActive]}>
              Rápida
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modeButton, configuracionMode === 'advanced' && styles.modeButtonActive]}
            onPress={() => setConfiguracionMode('advanced')}
          >
            <MaterialCommunityIcons name="cog" size={20} color={configuracionMode === 'advanced' ? '#fff' : '#7f8c8d'} />
            <Text style={[styles.modeButtonText, configuracionMode === 'advanced' && styles.modeButtonTextActive]}>
              Avanzada
            </Text>
          </TouchableOpacity>
        </View>

        {configuracionMode === 'simple' ? (
          /* Configuración Simplificada */
          <View style={styles.simpleConfig}>
            <Text style={styles.sectionTitle}>Configuración Rápida</Text>
            
            {/* Botón Importar */}
            <TouchableOpacity
              style={[styles.actionButton, styles.importButton]}
              onPress={handleImportarConfiguracion}
              disabled={isLoadingConfigFile}
            >
              <View style={styles.buttonContent}>
                <MaterialCommunityIcons name="file-import" size={28} color="#ffffff" />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.actionButtonText}>
                    {isLoadingConfigFile ? "Importando..." : "Importar Configuración"}
                  </Text>
                  <Text style={styles.actionButtonSubtext}>Selecciona tu archivo .json</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Botón Crear Backup */}
            <TouchableOpacity
              style={[styles.actionButton, styles.backupButton]}
              onPress={handleCrearBackup}
            >
              <View style={styles.buttonContent}>
                <MaterialCommunityIcons name="backup-restore" size={28} color="#ffffff" />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.actionButtonText}>Crear Backup</Text>
                  <Text style={styles.actionButtonSubtext}>Guardar configuración actual</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.currentConfig}>
              <Text style={styles.currentConfigTitle}>Configuración Actual:</Text>
              <Text style={styles.currentConfigText}>
                {configuracion.endPoint ? `📍 ${configuracion.endPoint}` : '❌ No configurado'}
              </Text>
              <Text style={styles.currentConfigText}>
                {configuracion.sucursal ? ` Sucursal: ${configuracion.sucursal}` : '❌ Sucursal no configurada'}
              </Text>
              <Text style={styles.currentConfigText}>
                {selectedVendedor ? ` ${selectedVendedor.descripcion}` : '❌ Vendedor no seleccionado'}
              </Text>
            </View>

            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>📋 Instrucciones:</Text>
              <Text style={styles.instructionsText}>
                1. Recibe el archivo de configuración por WhatsApp
              </Text>
              <Text style={styles.instructionsText}>
                2. Toca "Importar Configuración"
              </Text>
              <Text style={styles.instructionsText}>
                3. Selecciona el archivo .json recibido
              </Text>
              <Text style={styles.instructionsText}>
                4. ¡Listo! Tu app estará configurada
              </Text>
            </View>
          </View>
        ) : (
          /* Configuración Avanzada (actual) */
          <View style={styles.advancedConfig}>
            <Text style={styles.sectionTitle}>Configuración Avanzada</Text>
            
            <Text><MaterialCommunityIcons name="earth" size={16} color="#2c3e50" /> {hasInternetAccess? "✓":"X"} EndPoint:</Text>
            <TextInput
              style={[styles.input, hasInternetAccess ? styles.inputSuccess : styles.inputError]}
              value={configuracion.endPoint}
              onChangeText={(text) => setConfiguracion({ ...configuracion, endPoint: text })}
              placeholder="https://192.168.1.100:3003/"
            />
            
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
        )}

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
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#3498db',
  },
  modeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  simpleConfig: {
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  importButton: {
    borderColor: '#3498db',
    backgroundColor: '#3498db',
  },
  backupButton: {
    borderColor: '#f39c12',
    backgroundColor: '#f39c12',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  actionButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  currentConfig: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  currentConfigTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  currentConfigText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 5,
  },
  instructions: {
    backgroundColor: '#e8f4fd',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 5,
  },
  advancedConfig: {
    marginBottom: 20,
  },
});

export default Configurar;

