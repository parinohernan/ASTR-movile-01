import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Modal, StatusBar, Alert, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { version, empresa, producto } from "../src/constantes/constantes";
import { getUsuariosFromStore, initializeDefaultUsers, authenticateUser } from "../src/utils/authUtils";

const LoginScreen = ({ rootUser }) => {
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
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 Iniciando carga de datos...");
        
        const usuariosData = await initializeDefaultUsers();
        setUsuarios(usuariosData);
        
        console.log("✅ Datos cargados exitosamente");
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
        Alert.alert("Error", "No se pudo cargar la información de usuarios");
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    setMostrar(form.vendedor.length > 0 && form.password.length >= 3);
  }, [form]);



  const handleVendedor = (text) => {
    setForm({ vendedor: text, password: form.password });
  };

  const handlePassword = (text) => {
    setForm({ vendedor: form.vendedor, password: text });
  };

  const handleIngresar = async () => {
    console.log("🚀 === INICIO DE LOGIN ===");
    console.log("📝 Datos del formulario:", {
      vendedor: form.vendedor,
      password: form.password,
      vendedorType: typeof form.vendedor,
      passwordType: typeof form.password,
      vendedorLength: form.vendedor.length,
      passwordLength: form.password.length
    });
    
    if (loginAttempts >= 3) {
      Alert.alert(
        "Demasiados intentos",
        "Has excedido el número de intentos permitidos. Intenta más tarde.",
        [{ text: "OK" }]
      );
      return;
    }

    // Autenticar usuario usando la utilidad
    const userData = authenticateUser(form, usuarios);
    
    if (userData) {
      console.log("✅ Usuario autenticado:", userData);
      
      if (userData.isRoot) {
        // Navegar a Home para root
        navigation.navigate("Home", { form: userData });
      } else {
        // Determinar si estamos en entorno web y navegar al componente correcto
        const isWeb = typeof window !== 'undefined' && window.localStorage;
        const targetRoute = isWeb ? "UserMenuPPalWeb" : "UserMenuPPal";
        
        console.log(`🌐 Navegando a: ${targetRoute} (${isWeb ? 'Web' : 'Móvil'})`);
        
        setTimeout(() => {
          navigation.navigate(targetRoute, { vendedor: userData });
        }, 100);
      }
      return;
    }

    // Login fallido
    console.log("❌ === LOGIN FALLIDO ===");
    console.log("❌ Login fallido, incrementando intentos. Intentos actuales:", loginAttempts);
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando sistema...</Text>
      </View>
    );
  }

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
            <Text style={styles.welcomeText}>Bienvenido a Osvi</Text>
            <Text style={styles.subtitleText}>Sistema de Gestión de Preventas</Text>
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
                  onChangeText={handlePassword}
                  value={form.password}
                  secureTextEntry={!showPassword}
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
                    color="#95a5a6"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Información de usuarios disponibles (solo en desarrollo) */}
            {__DEV__ && usuarios.length > 0 && (
              <View style={styles.devInfo}>
                <Text style={styles.devInfoTitle}>Usuarios disponibles:</Text>
                {usuarios.map((user, index) => {
                  // Determinar la contraseña según el tipo de usuario
                  const password = user.authToken ? 
                    (user.codigo === '001' ? '123' : user.codigo === '002' ? '456' : '789') : 
                    '789';
                  
                  return (
                    <Text key={index} style={styles.devInfoText}>
                      {user.codigo}: {user.descripcion} (clave: {password})
                    </Text>
                  );
                })}
              </View>
            )}

            {/* Botón Ingresar */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                mostrar ? styles.loginButtonActive : styles.loginButtonInactive
              ]}
              onPress={handleIngresar}
              disabled={!mostrar}
            >
              <Text style={[
                styles.loginButtonText,
                mostrar ? styles.loginButtonTextActive : styles.loginButtonTextInactive
              ]}>
                Ingresar
              </Text>
            </TouchableOpacity>

            {/* Botón Configuración */}
            <TouchableOpacity
              style={styles.configButton}
              onPress={() => navigation.navigate("Home", { form: { vendedor: "root", password: "root" } })}
            >
              <Text style={styles.configButtonText}>Configuración</Text>
            </TouchableOpacity>

            {/* Información de versión */}
            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>
                {producto} v{version}
              </Text>
              <Text style={styles.companyText}>{empresa}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal de error */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
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
            <Text style={styles.modalText}>
              Usuario o contraseña incorrectos. Intento {loginAttempts} de 3.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={closeModal}
              >
                <Text style={styles.modalButtonText}>Aceptar</Text>
              </TouchableOpacity>
              {loginAttempts >= 3 && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.resetButton]}
                  onPress={resetForm}
                >
                  <Text style={styles.modalButtonText}>Reiniciar</Text>
                </TouchableOpacity>
              )}
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
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
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
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e1e8ed",
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
    paddingVertical: 8,
  },
  eyeIcon: {
    padding: 4,
  },
  devInfo: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  devInfoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#495057",
    marginBottom: 8,
  },
  devInfoText: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 4,
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonActive: {
    backgroundColor: "#3498db",
  },
  loginButtonInactive: {
    backgroundColor: "#bdc3c7",
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  loginButtonTextActive: {
    color: "white",
  },
  loginButtonTextInactive: {
    color: "#7f8c8d",
  },
  configButton: {
    backgroundColor: "#95a5a6",
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  configButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  versionText: {
    fontSize: 14,
    color: "#95a5a6",
    marginBottom: 4,
  },
  companyText: {
    fontSize: 12,
    color: "#bdc3c7",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 15,
  },
  modalButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  resetButton: {
    backgroundColor: "#e74c3c",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default LoginScreen;
