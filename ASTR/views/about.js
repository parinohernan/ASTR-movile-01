import React, { useState } from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';
import { /*actualizarClientes, actualizarVendedores, actualizarArticulos,*/ actualizarAPP } from '../handlers/actualizarApp';
import ConsoleComponent from '../src/components/ConsoleComponent';


const About = () => {
  const [actualizarDatos, setActualizarDatos] = useState(false);
  const [logs, setLogs] = useState([]);



  const handleEnviarPreventas = async () => {
    await actualizarAPP(actualizarDatos, setLogs);

  };


  return (
    <ScrollView style={{ padding: 20, backgroundColor: '#2A25E6'}}>
      <Text>Astr es una Aplicacion de hpDev </Text>
    </ScrollView>
  );
};

export default About;