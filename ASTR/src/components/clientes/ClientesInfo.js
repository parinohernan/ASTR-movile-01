import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Text, FlatList, StyleSheet, View, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getInformeOnline } from '../../../handlers/actualizarApp';
// import { initDatabase, getUsuarios, insertUsuariosFromAPI } from '../database/database';

const ClientesInfo = (props) => {
    const {route} = props;
    const {params} = route;
    const {cliente} = params;
    const [informe, setInforme] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const informeOnline = await getInformeOnline(cliente.id);
          setInforme(informeOnline || []);
        } catch (error) {
          console.error('Error al obtener informe: ', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, []);
    
    console.log("Informe ", informe ," documentos del cliente ", cliente);

    const formatFecha = (fechaISO) => {
      const fecha = new Date(fechaISO);
      const year = fecha.getFullYear().toString().slice(2);
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const day = fecha.getDate().toString().padStart(2, '0');
      return `${year}/${month}/${day}`;
    }

    const formatImporte = (importe) => {
      return `$${parseFloat(importe || 0).toFixed(2)}`;
    }

    const renderItem = ({ item }) => (
      <View style={[
        styles.documentoCard,
        item.DocumentoTipo === "RCF" ? styles.documentoRecibo : styles.documentoFactura
      ]}>
        <View style={styles.documentoHeader}>
          <View style={styles.documentoInfo}>
            <Text style={styles.documentoFecha}>{formatFecha(item.Fecha)}</Text>
            <Text style={styles.documentoTipo}>
              {item.DocumentoTipo} Nº{item.DocumentoNumero}
            </Text>
          </View>
          <MaterialCommunityIcons 
            name={item.DocumentoTipo === "RCF" ? "receipt" : "file-document"} 
            size={24} 
            color={item.DocumentoTipo === "RCF" ? "#27ae60" : "#3498db"} 
          />
        </View>
        
        <View style={styles.documentoDetalles}>
          <Text style={styles.documentoTotal}>
            Total: {item.DocumentoTipo === "RCF" ? "-" : ""}{formatImporte(item.ImporteTotal)}
          </Text>
          {item.DocumentoTipo !== "RCF" && (
            <Text style={styles.documentoPagado}>
              Pagado: {formatImporte(item.ImportePagado)}
            </Text>
          )}
        </View>
      </View>
    );

    const renderEmptyState = () => (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="file-document-outline" size={60} color="#95a5a6" />
        <Text style={styles.emptyStateText}>No hay documentos</Text>
        <Text style={styles.emptyStateSubtext}>Este cliente no tiene documentos en el período consultado</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Información de Cuenta Corriente</Text>
        <Text style={styles.clienteName}>{cliente.descripcion}</Text>
        <Text style={styles.clienteCode}>Código: {cliente.id}</Text>
        
        {/* Saldo de deuda */}
        <View style={styles.saldoContainer}>
          <MaterialCommunityIcons 
            name="cash-multiple" 
            size={24} 
            color={cliente.importeDeuda > 0 ? "#e74c3c" : "#27ae60"} 
          />
          <Text style={[
            styles.saldoText,
            cliente.importeDeuda > 0 ? styles.saldoDeuda : styles.saldoFavorable
          ]}>
            Saldo: {formatImporte(cliente.importeDeuda)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Esta función muestra los principales documentos. Para un informe completo solicitar a administración.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#30bced" />
            <Text style={styles.loadingText}>Cargando documentos...</Text>
          </View>
        ) : (
          <FlatList
            data={informe}
            keyExtractor={(item, index) => `${item.DocumentoNumero}_${index}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>
    </View>
  );
};

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f9fa',
    },
    header: {
      backgroundColor: '#ffffff',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#ecf0f1',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: 5,
    },
    clienteName: {
      fontSize: 18,
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: 2,
    },
    clienteCode: {
      fontSize: 14,
      color: '#7f8c8d',
      marginBottom: 10,
    },
    saldoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      padding: 12,
      borderRadius: 8,
      marginTop: 5,
    },
    saldoText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    saldoDeuda: {
      color: '#e74c3c',
    },
    saldoFavorable: {
      color: '#27ae60',
    },
    content: {
      flex: 1,
      padding: 15,
    },
    infoCard: {
      backgroundColor: '#ffffff',
      padding: 15,
      borderRadius: 8,
      marginBottom: 15,
      borderLeftWidth: 4,
      borderLeftColor: '#3498db',
    },
    infoText: {
      fontSize: 14,
      color: '#7f8c8d',
      lineHeight: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: '#7f8c8d',
      marginTop: 10,
    },
    listContainer: {
      paddingBottom: 20,
    },
    documentoCard: {
      backgroundColor: '#ffffff',
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    documentoRecibo: {
      borderLeftWidth: 4,
      borderLeftColor: '#27ae60',
    },
    documentoFactura: {
      borderLeftWidth: 4,
      borderLeftColor: '#3498db',
    },
    documentoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    documentoInfo: {
      flex: 1,
    },
    documentoFecha: {
      fontSize: 12,
      color: '#7f8c8d',
      marginBottom: 2,
    },
    documentoTipo: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#2c3e50',
    },
    documentoDetalles: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    documentoTotal: {
      fontSize: 16,
      fontWeight: '600',
      color: '#2c3e50',
    },
    documentoPagado: {
      fontSize: 14,
      color: '#27ae60',
      fontWeight: '500',
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
})
export default ClientesInfo;



