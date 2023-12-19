import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { db } from '../../database/database';

const ListaPreventas = () => {
  const [preventas, setPreventas] = useState([]);

  useEffect(() => {
    cargarPreventas();
  }, []);

  const cargarPreventas = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM preventaCabeza ORDER BY id DESC',
        //'SELECT * FROM preventaItem ORDER BY id DESC',
        //'SELECT preventaCabeza.id as numero, clientes.descripcion as cliente, SUM(preventaItem.precio) as importe FROM preventaCabeza JOIN clientes ON eventaCabeza.cliente = clientes.id LEFT JOIN preventaItem ON preventaCabeza.id = preventaItem.numero GROUP BY preventaCabeza.id, clientes.descripcion ORDER BY preventaCabeza.id DESC',
        [],
        (_, result) => {
          const preventasArray = [];
          for (let i = 0; i < result.rows.length; i++) {
            preventasArray.push(result.rows.item(i));
          }
          setPreventas(preventasArray);
          console.log("que tiene",preventasArray);
        },
        (_, error) => {
          console.error('Error al cargar preventas:', error);
        }
      );
    });
  };

  const renderItem = ({ item }) => (
    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
      <Text>Nº: {item.id}</Text>
      <Text>Preventa: {item.idPreventa}</Text>
      {/* <Text>Codigo: {item.idPreventa}</Text> */}
      <Text>idPreventa: {item.idPreventa}</Text>
      {/* Agrega aquí más detalles según la estructura de tu tabla */}
    </View>
  );

  return (
    <View>
      <FlatList
        data={preventas}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

export default ListaPreventas;

