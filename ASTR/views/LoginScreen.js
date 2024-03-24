import React, {useEffect, useState} from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Akira, Kaede } from 'react-native-textinput-effects';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginScreen = () => {
  const navigation = useNavigation();

  const [form, setForm]= useState({
    vendedor:"",
    password:"",
  })

  const [modalVisible, setModalVisible] = useState(false);
  const [mostrar, setMostrar] = useState(false);
  
  useEffect (() => {
    setMostrar(form.vendedor && form.password.length > 3);
  },[form]);

  const isAuhoriced = () => true;

  const handleVendedor = (text) => {
    console.log(text);
    setForm({vendedor: text, password: form.password})
  }
  const handlePassword = (text) => {
    console.log(text);
    setForm({vendedor: form.vendedor, password: text})
  }


  const handleIngresar = () => {
    if ((form.vendedor == "Root") && form.password === "Acfll" ) {
      console.log("ingresando a aplicacion", form);
      navigation.navigate('Home', {form});
      return;
    }else{
      if (isAuhoriced()) {
        console.log("Form ",form);
        // navigation.navigate('Preventa', { preventaNumero, cliente });
        navigation.navigate('UserMenuPPal', {form});
      return;
      }
      setModalVisible(true);
    }
  }

const Ingresar = () => {

  return (

    <Button theme={{ colors: { primary: 'blue' } }} 
    mode={mostrar ? 'contained' : 'disabled'} 
    // onPress={() => handleIngresar()}
    onPress={mostrar ? (() => handleIngresar()) : (console.log(""))}>
      Ingresar

    </Button>
  );
};

const closeModal = () => {
  setModalVisible(false);
  // setSelectedItem(null);
};
  return (
    <View style={styles.container}>
      <Image source={require('../assets/OIG1.jpg')} style={styles.logo} />
      <Text style={styles.logoText}>Bienvenido</Text>
     
      <Kaede style={styles.input}
        label={'Vendedor'}
        // this is used as active and passive border color
        inputPadding={16}
        labelHeight={18}
        inputStyle={{ backgroundColor: '#FFFFFF75', color: '#112233' }}
        labelStyle={{ color: '#112233' }}
        onChangeText = { ( texto )  =>  {  handleVendedor(texto)  } }
      />
      <Kaede style={styles.input}
        label={'Contraseña'}
        secureTextEntry={true}
        // this is used as active and passive border color
        inputStyle={{ backgroundColor: '#FFFFFF75', color: '#112233' }}
        labelStyle={{ color: '#112233'}}
        onChangeText = { ( texto )  =>  {  handlePassword(texto)  } }
      />
      <Ingresar/>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            {/* <Text>Opciones para Nº {selectedItem?.numero}</Text>
            <Button title="Borrar" onPress={() => handleAction('Borrar')} />
            <Button title="Editar" onPress={() => handleAction('Editar')} /> */}
           <Text>Error. usuario o password es incorrecta</Text>
            <Button theme={{ colors: { primary: 'red' }}}  mode= 'contained'  onPress={() => closeModal()}>
              cerrar
            </Button>
          </View>
        </View>
      </Modal> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF7E6'
  },
  logo: {
    width: 200,
    height: 200,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    // backgroundColor: "#EEEEEE",
    // borderColor: "red",
    width: '100%',
    // height: 45,
  },
  // button: {
  //   backgroundColor: '#345678',
  //   padding: 10,
  //   borderRadius: 5,
  //   marginTop: 10,
  // },
  // buttonText: {
  //   color: 'white',
  //   textAlign: 'center',
  // },
});

export default LoginScreen;
