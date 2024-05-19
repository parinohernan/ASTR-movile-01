import React, {useEffect, useState} from 'react';
import { View, Text, Image, StyleSheet, Modal } from 'react-native';
import { Akira, Kaede } from 'react-native-textinput-effects';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getUsuarios } from '../database/controllers/Usuarios.controler';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginScreen = () => {
  const navigation = useNavigation();

  const [form, setForm]= useState({
    vendedor:"",
    password:"",
  })

  const [modalVisible, setModalVisible] = useState(false);
  const [mostrar, setMostrar] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [vendedor, setVendedor] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const usuariosFromDB = await getUsuarios();
        setUsuarios(usuariosFromDB);
        isAuhoriced();
      } catch (error) {
        console.error('Error al obtener o insertar usuarios: ', error);
      }
    };
    fetchData();
  }, [form]);

  useEffect (() => {
    setMostrar(form.vendedor && form.password.length > 3);
  },[form]);

  const isAuhoriced = () => {
    
    
    //busco si coinside
    for (let i = 0; i < usuarios.length; i++) {
      const element = usuarios[i];
      if ((form.password == element.clave) && (form.vendedor == element.id)) {
        console.log("Usuario ", element, " log", form);
        //seteo el vendedor
        setVendedor(
          {
            clave: form.password,
            id: form.vendedor,
            descripcion: element.descripcion,
          })
        console.log("vendedor", vendedor);
        return true;
      }
      
    }
    return false;
  }

  const handleVendedor = (text) => {
    console.log(text);
    setForm({vendedor: text, password: form.password})
  }
  const handlePassword = (text) => {
    console.log(text);
    setForm({vendedor: form.vendedor, password: text})
  }


  const handleIngresar = () => {
   
    if ((form.vendedor.toLocaleLowerCase() == "root") && form.password.toLocaleLowerCase() === "root" ) {
      console.log("ingresando a aplicacion", form);
      navigation.navigate('Home', {form});
      return;
    }else{
      if (isAuhoriced()) {
        console.log("Vendedor ",vendedor);
        // navigation.navigate('Preventa', { preventaNumero, cliente });
        navigation.navigate('UserMenuPPal', {vendedor});
      return;
      }
      setModalVisible(true);
    }
  }

const Ingresar = () => {

  return (
    <View style={styles.boton}>
      <Button theme={{ colors: { primary: 'blue' } }} 
      mode={mostrar ? 'contained' : 'disabled'} 
      // onPress={() => handleIngresar()}
      onPress={mostrar ? (() => handleIngresar()) : (console.log(""))}>
        Ingresar
      </Button>
    </View>
  );
};

const IngresarRoot = () => {
 
  return (
    <View >
      <Button theme={{ colors: { primary: 'pink' } }}  
      // onPress={() => handleIngresar()}
      onPress={()=>navigation.navigate('Home', {form})}>
        Ingresar Root
      </Button>
    </View>
  );
};
const IngresarUser = () => {
  // setForm({vendedor: "1", password: "1234"})
  let vendedor={
    clave: "1234",
    id: "1",
    descripcion: "Hernan Parino",
  }
  return (
    <View>
      <Button theme={{ colors: { primary: 'white' } }} 
      // onPress={() => handleIngresar()}
      onPress={()=>navigation.navigate('UserMenuPPal', {vendedor})}>
        Ingresar User
      </Button>
    </View>
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
      <Text style={styles.vecsionText}>hernyDev version 1.1.2</Text>
      <IngresarRoot/>
      <IngresarUser/>
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
    backgroundColor: '#30bced'
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  logoText: {
    fontSize: 10,
    
    marginVertical: 10,
  },
  input: {
    // backgroundColor: "#EEEEEE",
    // borderColor: "red",
    width: '100%',
    // height: 45,
  },
  boton: {
    padding: 10,
    // borderRadius: 5,
    marginTop: 10,
  },
  // buttonText: {
  //   color: 'white',
  //   textAlign: 'center',
  // },
});

export default LoginScreen;
