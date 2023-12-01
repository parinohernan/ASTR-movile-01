// Usuarios.js
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Text, FlatList } from 'react-native';
import { initDatabase, getUsuarios, insertUsuariosFromAPI } from '../database/database';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const usuariosFromDB = await getUsuarios();
        setUsuarios(usuariosFromDB);
      } catch (error) {
        console.error('Error al obtener o insertar usuarios: ', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Text>Estos son los usuarios en la base de datos:</Text>
      <FlatList
        data={usuarios}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Text>{item.codigo} - {item.descripcion} - {item.clave}</Text>
        )}
      />
    </>
  );
};

export default Usuarios;



