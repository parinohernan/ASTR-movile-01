import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { actualizarAPP, errorSincronizando } from '../handlers/actualizarApp';
import ConsoleComponent from '../src/components/ConsoleComponent';
import { empresa, producto } from '../src/constantes/constantes';
import checkServerHandler from '../src/utils/checkServerHandler';
import { limpiarDatos } from '../database/database';
import indexedDBHandler from '../src/utils/indexedDBHandler';

const Sincronizar = ({ navigation }) => {
  const [actualizarDatos, setActualizarDatos] = useState(false);
  const [logs, setLogs] = useState([]);

  const handleEnviarPreventas = async () => {
    setLogs(["Conectando al servidor"]);
    if (await checkServerHandler()) {
      await actualizarAPP(actualizarDatos, logs, setLogs);
    } else {
      errorSincronizando(logs, setLogs);
      console.log("error ");
    }
  };

  const handleSincronizarDatos = async () => {
    try {
      setLogs(["🔄 Iniciando sincronización de datos..."]);
      
      // Obtener configuración
      const config = await indexedDBHandler.obtenerConfiguracion();
      if (!config || !config.endpoint) {
        setLogs(prev => [...prev, "❌ Error: Endpoint no configurado"]);
        return;
      }

      setLogs(prev => [...prev, "📡 Conectando al servidor..."]);
      
      // Sincronizar vendedores
      setLogs(prev => [...prev, "📋 Descargando vendedores..."]);
      const vendedoresResponse = await fetch(`${config.endpoint}vendedores`);
      if (vendedoresResponse.ok) {
        const vendedores = await vendedoresResponse.json();
        await indexedDBHandler.guardarVendedores(vendedores);
        setLogs(prev => [...prev, `✅ ${vendedores.length} vendedores sincronizados`]);
      } else {
        setLogs(prev => [...prev, "❌ Error al descargar vendedores"]);
      }

      // Sincronizar clientes
      setLogs(prev => [...prev, "📋 Descargando clientes..."]);
      const clientesResponse = await fetch(`${config.endpoint}clientes`);
      if (clientesResponse.ok) {
        const clientes = await clientesResponse.json();
        await indexedDBHandler.guardarClientes(clientes);
        setLogs(prev => [...prev, `✅ ${clientes.length} clientes sincronizados`]);
      } else {
        setLogs(prev => [...prev, "❌ Error al descargar clientes"]);
      }

      // Sincronizar artículos
      setLogs(prev => [...prev, "📋 Descargando artículos..."]);
      const articulosResponse = await fetch(`${config.endpoint}articulos`);
      if (articulosResponse.ok) {
        const articulos = await articulosResponse.json();
        await indexedDBHandler.guardarArticulos(articulos);
        setLogs(prev => [...prev, `✅ ${articulos.length} artículos sincronizados`]);
      } else {
        setLogs(prev => [...prev, "❌ Error al descargar artículos"]);
      }

      setLogs(prev => [...prev, "🎉 Sincronización completada exitosamente"]);
      
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      setLogs(prev => [...prev, `❌ Error: ${error.message}`]);
    }
  };
  
  const handleLimpiarDatos = async () => {
    Alert.alert(
      'Confirmar eliminación de todas las preventas',
      '¿Está seguro que desea borrar TODO ?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            if (await checkServerHandler()) {
              await limpiarDatos(logs, setLogs);
            } else {
              errorSincronizando(logs, setLogs);
              console.log("error ");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleVerPreventasEnviadas = () => {
    navigation.navigate('PreventasEnviadas');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{empresa} - {producto}</Text>
        <Text style={styles.subtitle}>Sincronización</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección de sincronización principal */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="sync" size={24} color="#30bced" />
            <Text style={styles.sectionTitle}>Sincronización Principal</Text>
          </View>
          
          <View style={styles.syncOptions}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Actualizar datos del servidor</Text>
              <Switch 
                value={actualizarDatos} 
                onValueChange={() => setActualizarDatos(!actualizarDatos)}
                trackColor={{ false: '#bdc3c7', true: '#30bced' }}
                thumbColor={actualizarDatos ? '#ffffff' : '#f4f3f4'}
              />
            </View>
            
            <Button 
              title="Sincronizar Preventas" 
              onPress={handleEnviarPreventas} 
              buttonStyle={styles.syncButton}
              titleStyle={styles.syncButtonText}
              icon={
                <MaterialCommunityIcons 
                  name="cloud-upload" 
                  size={20} 
                  color="#ffffff" 
                  style={{ marginRight: 8 }}
                />
              }
            />
            
            <Button 
              title="Descargar Datos" 
              onPress={handleSincronizarDatos} 
              buttonStyle={[styles.syncButton, { backgroundColor: '#9b59b6', marginTop: 10 }]}
              titleStyle={styles.syncButtonText}
              icon={
                <MaterialCommunityIcons 
                  name="cloud-download" 
                  size={20} 
                  color="#ffffff" 
                  style={{ marginRight: 8 }}
                />
              }
            />
          </View>
        </View>

        {/* Consola de logs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="console" size={24} color="#30bced" />
            <Text style={styles.sectionTitle}>Logs de Sincronización</Text>
          </View>
          <ConsoleComponent logs={logs} />
        </View>

        {/* Acciones de administración */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="tools" size={24} color="#30bced" />
            <Text style={styles.sectionTitle}>Herramientas de Administración</Text>
          </View>
          
          <View style={styles.actionButtons}>
            <Button 
              title="Limpiar Logs" 
              onPress={() => setLogs([])} 
              buttonStyle={styles.actionButton}
              titleStyle={styles.actionButtonText}
              icon={
                <MaterialCommunityIcons 
                  name="delete-sweep" 
                  size={18} 
                  color="#ffffff" 
                  style={{ marginRight: 6 }}
                />
              }
            />
            
            <Button 
              title="Borrar Datos" 
              onPress={handleLimpiarDatos} 
              buttonStyle={[styles.actionButton, styles.dangerButton]}
              titleStyle={styles.actionButtonText}
              icon={
                <MaterialCommunityIcons 
                  name="database-remove" 
                  size={18} 
                  color="#ffffff" 
                  style={{ marginRight: 6 }}
                />
              }
            />
          </View>
        </View>

        {/* Respaldo de preventas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="backup-restore" size={24} color="#30bced" />
            <Text style={styles.sectionTitle}>Respaldo de Preventas</Text>
          </View>
          
          <View style={styles.backupInfo}>
            <Text style={styles.backupText}>
              Acceda a las últimas 50 preventas enviadas como respaldo de seguridad
            </Text>
          </View>
          
          <Button 
            title="Ver Preventas Enviadas" 
            onPress={handleVerPreventasEnviadas} 
            buttonStyle={styles.backupButton}
            titleStyle={styles.backupButtonText}
            icon={
              <MaterialCommunityIcons 
                name="file-document-multiple" 
                size={20} 
                color="#ffffff" 
                style={{ marginRight: 8 }}
              />
            }
          />
        </View>
      </ScrollView>
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
    fontSize: 16,
    color: '#bdc3c7',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  syncOptions: {
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  syncButton: {
    backgroundColor: '#27ae60',
    borderRadius: 10,
    paddingVertical: 12,
    elevation: 2,
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 120,
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  backupInfo: {
    backgroundColor: '#e8f4fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  backupText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    textAlign: 'center',
  },
  backupButton: {
    backgroundColor: '#9b59b6',
    borderRadius: 10,
    paddingVertical: 12,
    elevation: 2,
  },
  backupButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Sincronizar;
