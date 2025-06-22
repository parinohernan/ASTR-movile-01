// Usuarios.js
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Text, FlatList, StyleSheet, View } from 'react-native';
// import { initDatabase, getUsuarios, insertUsuariosFromAPI } from '../database/database';

import { getUsuarios } from '../database/controllers/Usuarios.controler';
const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const usuariosFromDB = await getUsuarios();
        setUsuarios(usuariosFromDB);
        console.log(`Se cargaron ${usuariosFromDB.length} vendedores`);
      } catch (error) {
        console.error('Error al obtener usuarios: ', error);
        setError('Error al cargar los vendedores. Verifique la sincronización.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Cargando vendedores...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>{error}</Text>
          <Text style={styles.emptyStateSubtext}>Vaya a Sincronizar para cargar los vendedores</Text>
        </View>
      );
    }
    
    if (usuarios.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No hay vendedores disponibles</Text>
          <Text style={styles.emptyStateSubtext}>Vaya a Sincronizar para cargar los vendedores</Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.titulo}>
        <Text style={styles.tituloText}>ASTR</Text>
        <Text style={styles.subtituloText}>Listado de vendedores</Text>
      </View>
      
      {renderEmptyState() ? (
        renderEmptyState()
      ) : (
        <>
          <Text style={styles.description}>Estos son los vendedores registrados:</Text>
          <FlatList
            data={usuarios}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.usuarioItem}>
                <Text style={styles.usuarioCodigo}>Código: {item.id}</Text>
                <Text style={styles.usuarioNombre}>{item.descripcion}</Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop:60,
    // alignItems: 'center',
    // justifyContent: 'center',
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
  description: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 20,
    textAlign: 'center',
  },
  usuarioItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  usuarioCodigo: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  usuarioNombre: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: 'bold',
    marginTop: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
})
export default Usuarios;



