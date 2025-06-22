import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Modal, StatusBar, Alert, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getUsuarios,
  insertUsuariosPrueba,
} from "../database/controllers/Usuarios.controler";
import { initDatabase } from "../database/database";
import { version, empresa, producto } from "../src/cconstantes/constantes";

const LoginScreen = () => {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    vendedor: "",
    password: "",
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [mostrar, setMostrar] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [vendedor, setVendedor] = useState({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Iniciando carga de datos...");
        // Inicializar la base de datos primero
        await initDatabase([], () => {});

        const usuariosFromDB = await getUsuarios();

        // Si no hay usuarios, insertar usuarios de prueba
        if (usuariosFromDB.length === 0) {
          console.log(
            "No hay usuarios en la base de datos, insertando usuarios de prueba..."
          );
          await insertUsuariosPrueba();
          const usuariosActualizados = await getUsuarios();
          setUsuarios(usuariosActualizados);
        } else {
          setUsuarios(usuariosFromDB);
        }
        console.log("Datos cargados exitosamente");
      } catch (error) {
        console.error("Error al obtener o insertar usuarios: ", error);
        Alert.alert("Error", "No se pudo cargar la información de usuarios");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setMostrar(form.vendedor.length > 0 && form.password.length >= 3);
  }, [form]);

  const isAuthorized = () => {
    for (let i = 0; i < usuarios.length; i++) {
      const element = usuarios[i];
      if (form.password === element.clave && form.vendedor === element.id) {
        console.log("Usuario ", element, " log", form);
        setVendedor({
          clave: form.password,
          id: form.vendedor,
          descripcion: element.descripcion,
        });
        return true;
      }
    }
    return false;
  };

  const handleVendedor = (text) => {
    setForm({ vendedor: text, password: form.password });
  };

  const handlePassword = (text) => {
    setForm({ vendedor: form.vendedor, password: text });
  };

  const handleIngresar = async () => {
    if (loginAttempts >= 3) {
      Alert.alert(
        "Demasiados intentos",
        "Has excedido el número de intentos permitidos. Intenta más tarde.",
        [{ text: "OK" }]
      );
      return;
    }

    // Root access
    if (
      form.vendedor.toLowerCase() === "root" &&
      form.password.toLowerCase() === "root"
    ) {
      console.log("ingresando como root", form);
      navigation.navigate("Home", { form });
      return;
    }

    // User access
    if (isAuthorized()) {
      console.log("Vendedor autorizado: ", vendedor);
      navigation.navigate("UserMenuPPal", { vendedor });
      return;
    }

    // Failed login
    setLoginAttempts(prev => prev + 1);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const resetForm = () => {
    setForm({ vendedor: "", password: "" });
    setLoginAttempts(0);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <StatusBar hidden />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
            />
            <Text style={styles.welcomeText}>Bienvenido a ASTR</Text>
            <Text style={styles.subtitleText}>Sistema de Gestión Comercial</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Campo Vendedor */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons 
                  name="account" 
                  size={24} 
                  color="#3498db" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Código de Vendedor"
                  placeholderTextColor="#95a5a6"
                  onChangeText={handleVendedor}
                  value={form.vendedor}
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Campo Contraseña */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons 
                  name="lock" 
                  size={24} 
                  color="#3498db" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="#95a5a6"
                  secureTextEntry={!showPassword}
                  onChangeText={handlePassword}
                  value={form.password}
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialCommunityIcons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={24} 
                    color="#7f8c8d" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleIngresar}
                disabled={!mostrar}
                loading={false}
                style={[
                  styles.loginButton,
                  !mostrar && styles.loginButtonDisabled
                ]}
                labelStyle={styles.loginButtonText}
              >
                {mostrar ? "Iniciar Sesión" : "Completa los campos"}
              </Button>

              <Button
                mode="outlined"
                onPress={() => navigation.navigate("Home", { form: { vendedor: "root", password: "root" } })}
                style={styles.configButton}
                labelStyle={styles.configButtonText}
              >
                Configuración
              </Button>
            </View>

            {loginAttempts > 0 && (
              <Text style={styles.attemptsText}>
                Intentos restantes: {3 - loginAttempts}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer fijo fuera del ScrollView */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>
          {empresa} - {producto} v{version}
        </Text>
      </View>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons 
              name="alert-circle" 
              size={60} 
              color="#e74c3c" 
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>Error de Autenticación</Text>
            <Text style={styles.modalMessage}>
              El código de vendedor o la contraseña son incorrectos.
            </Text>
            <View style={styles.modalButtons}>
              <Button
                mode="contained"
                onPress={closeModal}
                style={styles.modalButton}
              >
                Intentar de nuevo
              </Button>
              <Button
                mode="outlined"
                onPress={resetForm}
                style={styles.modalButton}
              >
                Limpiar campos
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#30bced",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 80, // Espacio para el footer
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: "#ffffff",
    opacity: 0.8,
  },
  formContainer: {
    width: "100%",
    maxWidth: 350,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2c3e50',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 5,
  },
  buttonContainer: {
    marginTop: 30,
  },
  loginButton: {
    backgroundColor: "#3498db",
    borderRadius: 10,
    paddingVertical: 8,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonDisabled: {
    backgroundColor: "#bdc3c7",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  configButton: {
    borderColor: "#ffffff",
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 8,
  },
  configButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  attemptsText: {
    textAlign: "center",
    color: "#e74c3c",
    fontSize: 14,
    marginTop: 10,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "rgba(48, 188, 237, 0.9)",
  },
  versionText: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginHorizontal: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default LoginScreen;
