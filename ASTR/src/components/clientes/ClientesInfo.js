import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Text, FlatList, StyleSheet, View, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getInformeOnline } from '../../../handlers/actualizarApp';
import { obtenerArticulosFrecuentesClienteOrdenados } from '../../utils/storageUtils';
import { getArticuloPorCodigo } from '../../../database/controllers/Articulos.Controller';

const ClientesInfo = (props) => {
    const {route} = props;
    const {params} = route;
    const {cliente} = params;
    const [informe, setInforme] = useState([]);
    const [loading, setLoading] = useState(true);
    const [articulosFrecuentes, setArticulosFrecuentes] = useState([]);
    const [loadingFrecuentes, setLoadingFrecuentes] = useState(false);
    const [frecuentesExpandidos, setFrecuentesExpandidos] = useState(false);
    const [articulosCompletos, setArticulosCompletos] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const informeOnline = await getInformeOnline(cliente.id);
          console.log('Documentos recibidos (incluye facturas, recibos, notas de crédito):', informeOnline);
          setInforme(informeOnline || []);
        } catch (error) {
          console.error('Error al obtener informe: ', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, []);

    useEffect(() => {
      const cargarContadorFrecuentes = async () => {
        try {
          const frecuentes = await obtenerArticulosFrecuentesClienteOrdenados(cliente.id);
          setArticulosFrecuentes(frecuentes);
        } catch (error) {
          console.error('Error al cargar contador de frecuentes:', error);
        }
      };
      cargarContadorFrecuentes();
    }, [cliente.id]);
    
    const toggleFrecuentes = async () => {
      if (!frecuentesExpandidos) {
        setLoadingFrecuentes(true);
        try {
          const frecuentes = await obtenerArticulosFrecuentesClienteOrdenados(cliente.id);
          
          const articulosCompletos = await Promise.all(
            frecuentes.map(async (frecuente) => {
              try {
                const articuloCompleto = await getArticuloPorCodigo(frecuente.id);
                if (articuloCompleto && articuloCompleto.length > 0) {
                  return {
                    ...frecuente,
                    ...articuloCompleto[0]
                  };
                }
                return frecuente;
              } catch (error) {
                console.error('Error al obtener artículo completo:', error);
                return frecuente;
              }
            })
          );
          
          setArticulosCompletos(articulosCompletos);
        } catch (error) {
          console.error('Error al cargar artículos frecuentes:', error);
        } finally {
          setLoadingFrecuentes(false);
        }
      }
      setFrecuentesExpandidos(!frecuentesExpandidos);
    };

    const formatearFecha = (timestamp) => {
      const fecha = new Date(timestamp);
      return fecha.toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

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

    const esNotaCredito = (item) =>
      item?.DocumentoTipo === 'NCF' || (item?.Origen || '').toLowerCase() === 'nota de credito';

    const getEstiloDocumento = (item) => {
      if (item?.DocumentoTipo === 'RCF') return styles.documentoRecibo;
      if (esNotaCredito(item)) return styles.documentoNotaCredito;
      return styles.documentoFactura;
    };

    const getIconoDocumento = (item) => {
      if (item?.DocumentoTipo === 'RCF') return 'receipt';
      if (esNotaCredito(item)) return 'receipt-text';
      return 'file-document';
    };

    const getColorDocumento = (item) => {
      if (item?.DocumentoTipo === 'RCF') return '#27ae60';
      if (esNotaCredito(item)) return '#e67e22';
      return '#3498db';
    };

    const renderItem = ({ item }) => {
      const esNC = esNotaCredito(item);
      return (
      <View style={[styles.documentoCard, getEstiloDocumento(item)]}>
        <View style={styles.documentoHeader}>
          <View style={styles.documentoInfo}>
            <Text style={styles.documentoFecha}>{formatFecha(item.Fecha)}</Text>
            <Text style={styles.documentoTipo}>
              {item.DocumentoTipo} Nº{item.DocumentoNumero}
            </Text>
          </View>
          <MaterialCommunityIcons 
            name={getIconoDocumento(item)} 
            size={24} 
            color={getColorDocumento(item)} 
          />
        </View>
        
        <View style={styles.documentoDetalles}>
          <Text style={styles.documentoTotal}>
            Total: {item.DocumentoTipo === "RCF" ? "-" : ""}{formatImporte(item.ImporteTotal)}
          </Text>
          {item.DocumentoTipo !== "RCF" && (
            <Text style={[styles.documentoPagado, esNC && styles.documentoUtilizado]}>
              {esNC ? 'Utilizado' : 'Pagado'}: {formatImporte(item.ImportePagado)}
            </Text>
          )}
        </View>
      </View>
    );
    };

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

        <TouchableOpacity 
          style={styles.frecuentesButton} 
          onPress={toggleFrecuentes}
          disabled={loadingFrecuentes}
        >
          <View style={styles.frecuentesButtonContent}>
            <MaterialCommunityIcons 
              name={loadingFrecuentes ? "loading" : "star"} 
              size={20} 
              color="#f39c12" 
            />
            <Text style={styles.frecuentesText}>
              {loadingFrecuentes ? 'Cargando...' : `Artículos Frecuentes (${articulosFrecuentes.length})`}
            </Text>
          </View>
          <MaterialCommunityIcons 
            name={frecuentesExpandidos ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#f39c12" 
          />
        </TouchableOpacity>

        {frecuentesExpandidos && (
          <View style={styles.frecuentesSection}>
            {loadingFrecuentes ? (
              <View style={styles.loadingFrecuentes}>
                <ActivityIndicator size="small" color="#f39c12" />
                <Text style={styles.loadingFrecuentesText}>Cargando artículos...</Text>
              </View>
            ) : articulosCompletos.length === 0 ? (
              <View style={styles.emptyFrecuentes}>
                <MaterialCommunityIcons name="star-outline" size={40} color="#95a5a6" />
                <Text style={styles.emptyFrecuentesText}>No hay artículos frecuentes</Text>
                <Text style={styles.emptyFrecuentesSubtext}>
                  Este cliente aún no tiene artículos frecuentes registrados
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.frecuentesList} showsVerticalScrollIndicator={false}>
                {articulosCompletos.map((articulo, index) => (
                  <View key={index} style={styles.articuloCard}>
                    <View style={styles.articuloHeader}>
                      <View style={styles.articuloInfo}>
                        <Text style={styles.articuloCodigo}>{articulo.id}</Text>
                        <Text style={styles.articuloDescripcion}>{articulo.descripcion}</Text>
                      </View>
                      <View style={styles.frecuenciaBadge}>
                        <MaterialCommunityIcons name="star" size={16} color="#f39c12" />
                        <Text style={styles.frecuenciaText}>{articulo.frecuencia}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.articuloDetails}>
                      <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                          <MaterialCommunityIcons name="calendar" size={16} color="#27ae60" />
                          <Text style={styles.detailText}>
                            Último uso: {formatearFecha(articulo.ultimoUso)}
                          </Text>
                        </View>
                      </View>
                      
                      {articulo.existencia !== undefined && (
                        <View style={styles.detailRow}>
                          <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="warehouse" size={16} color="#7f8c8d" />
                            <Text style={styles.detailText}>Stock: {articulo.existencia}</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}
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
  frecuentesButton: {
    flexDirection: 'row',
    alignItems: 'center',
      justifyContent: 'space-between',
    backgroundColor: '#fff3cd',
    padding: 15,
      borderWidth: 1,
    borderColor: '#f39c12',
    borderRadius: 8,
    marginTop: 15,
    },
  frecuentesButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  frecuentesText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f39c12',
      marginLeft: 8,
    },
  frecuentesSection: {
    backgroundColor: '#ffffff',
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    maxHeight: 300,
  },
  loadingFrecuentes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingFrecuentesText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 10,
  },
  emptyFrecuentes: {
    alignItems: 'center',
    padding: 20,
  },
  emptyFrecuentesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 10,
    marginBottom: 5,
  },
  emptyFrecuentesSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  frecuentesList: {
    maxHeight: 250,
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
  documentoNotaCredito: {
    borderLeftWidth: 4,
    borderLeftColor: '#e67e22',
  },
  documentoUtilizado: {
    color: '#e67e22',
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
  articuloCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#f39c12',
  },
  articuloHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  articuloInfo: {
    flex: 1,
  },
  articuloCodigo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  articuloDescripcion: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  articuloDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  detailText: {
    fontSize: 11,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  frecuenciaBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  frecuenciaText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#f39c12',
    marginLeft: 2,
    }, 
});

export default ClientesInfo;