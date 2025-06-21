import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Text, FlatList, StyleSheet, View } from 'react-native';
import { getInformeOnline } from '../../../handlers/actualizarApp';
// import { initDatabase, getUsuarios, insertUsuariosFromAPI } from '../database/database';

const ClientesInfo = (props) => {
    const {route} = props;
    const {params} = route;
    const {cliente} = params;
    const [informe, setInforme] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        
        try {
          const informeOnline = await getInformeOnline(cliente.id);
          setInforme(informeOnline);
        } catch (error) {
          console.error('Error al obtener informe: ', error);
        }
      };
      fetchData();
    }, []);
    console.log("Informe ", informe ," documentos del cliente ", cliente);

    formatFecha = (fechaISO)=>{
      const fecha = new Date(fechaISO);
      // Extrae los componentes del año, mes y día
      const year = fecha.getFullYear().toString().slice(2); // Obtiene los últimos dos dígitos del año
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Los meses son de 0 a 11
      const day = fecha.getDate().toString().padStart(2, '0'); // Agrega un 0 al día si es necesario

      // Retorna el formato AAMMDD
      return `${year}/${month}/${day}`;
    }

    const renderItem = ({ item }) => (
      <View style={ item.DocumentoTipo==="RCF"? { padding: 2, borderWidth:4, borderBottomColor: '#ccc', backgroundColor: "#22ff2244"  }: { padding: 2, borderWidth:4, borderBottomColor: '#ccc' , backgroundColor: "#2222ff44" } }>
        <Text> {formatFecha(item.Fecha) }               {item.DocumentoTipo} :Nº{item.DocumentoNumero}</Text>
        <Text> Total: {item.DocumentoTipo==="RCF"? "-":""} {item.ImporteTotal}</Text>
        {item.DocumentoTipo==="RCF"? console.log("no") : <Text> Pagado: $ {item.ImportePagado} </Text>} 
        
      </View>
    
    );

  return (
  <View style={styles.container}>
    <View style={styles.titulo}>
      <Text style={styles.tituloText}>Osvi</Text>
      <Text style={styles.subtituloText}>Informacion cuenta corriente del cliente {cliente.descripcion}</Text>
    </View >
      <View style={styles.containerResults}>
      <Text style={{ margin: 2, padding: 2, color: "gray",}} >Esta funcion solo muestra los primcipales documentos, para un informe completo solicitar a administracion:</Text>
      <FlatList
        data={informe}
        keyExtractor={item => item.DoumentoNumero}
        renderItem={renderItem}
      />

      </View>
  </View>
  );
};

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      flexWrap: 'nowrap',
      // justifyContent: 'center',
      alignItems: 'flex-center',
      width: "100%",
      height: "100%",
      padding: 20,
      // paddingTop: 20,
      backgroundColor: '#96ddf5',
      // paddingTop:0,
    },
    containerResults: {
      // flex: 1,
      // flexDirection: 'column',
      // flexWrap: 'nowrap',
      justifyContent: 'space-between',
      marginTop: 10,
      width: "100%",
      height: "100%",
      padding: 2,
      backgroundColor: '#c9eefa',
      // marginLeft:10,
      borderColor: "grey",
      borderWidth: 1,
      
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 8,
      borderWidth: 2,
    },
    actionButtonText: {
      fontSize: 16,
      marginLeft: 8,
    },
    dangerButton: {
      color: 'red',
    },
    titulo: {
      width: '100%',
      margin: 0,
      padding: 10,
      // border: 10,
      borderTopWidth: 2,
      borderTopRightRadius: 30,
      borderBottomRightRadius: 60,
      backgroundColor: '#0c2f3c',
      borderColor: "#30bced",
      borderWidth: 10,
    },
    tituloText: {
      alignContent: "center",
      fontSize: 30,
      color: 'cyan',
    },
    subtituloText: {
      fontSize: 16,
      color: 'cyan',
    }, 
})
export default ClientesInfo;



