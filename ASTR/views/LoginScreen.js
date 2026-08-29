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
import { version, empresa, producto } from "../src/constantes/constantes";
import NetInfo from '@react-native-community/netinfo';
import { activarAccesoOnline, registrarYActivar } from "../src/services/accesoOsviService";
import { validarClaveRegistro, REQUISITOS_CLAVE_TEXTO } from "../src/utils/clavePolicy";
import {
  authenticateWithBiometric,
  disableBiometricLogin,
  enableBiometricLogin,
  getBiometricCredentials,
  getBiometricLabel,
  isBiometricAvailable,
  isBiometricLoginEnabled,
} from "../src/services/biometricLoginService";

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
  const [registroModalVisible, setRegistroModalVisible] = useState(false);
  const [registroCodigo, setRegistroCodigo] = useState("");
  const [registroClave, setRegistroClave] = useState("");
  const [registroNombre, setRegistroNombre] = useState("");
  const [showRegistroClave, setShowRegistroClave] = useState(false);
  const [isLoadingOnline, setIsLoadingOnline] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("huella digital");
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

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
    const loadBiometricStatus = async () => {
      const available = await isBiometricAvailable();
      setBiometricAvailable(available);

      if (!available) {
        setBiometricEnabled(false);
        return;
      }

      const [label, enabled] = await Promise.all([
        getBiometricLabel(),
        isBiometricLoginEnabled(),
      ]);
      setBiometricLabel(label);
      setBiometricEnabled(enabled);
    };

    loadBiometricStatus();
  }, []);

  useEffect(() => {
    setMostrar(form.vendedor.length > 0 && form.password.length >= 3);
  }, [form]);

  const authorizeWithCredentials = (vendedorId, clave, usuariosList = usuarios) => {
    for (let i = 0; i < usuariosList.length; i++) {
      const element = usuariosList[i];
      if (clave === element.clave && vendedorId === element.id) {
        return {
          clave,
          id: vendedorId,
          descripcion: element.descripcion,
        };
      }
    }
    return false;
  };

  const isAuthorized = () => {
    const vendedorData = authorizeWithCredentials(form.vendedor, form.password);
    if (vendedorData) {
      console.log("Usuario autorizado:", vendedorData);
      setVendedor(vendedorData);
    }
    return vendedorData;
  };

  const offerBiometricOptIn = (vendedorId, clave) => {
    if (!biometricAvailable || biometricEnabled) {
      return;
    }

    Alert.alert(
      "Ingreso con huella",
      `¿Activar ingreso con ${biometricLabel}?`,
      [
        { text: "Ahora no", style: "cancel" },
        {
          text: "Activar",
          onPress: async () => {
            try {
              await enableBiometricLogin(vendedorId, clave);
              setBiometricEnabled(true);
            } catch (error) {
              Alert.alert(
                "Error",
                error.message || "No se pudo activar el ingreso biométrico"
              );
            }
          },
        },
      ]
    );
  };

  const navigateAfterLogin = (vendedorData, vendedorId, clave) => {
    setTimeout(() => {
      navigation.navigate("UserMenuPPal", { vendedor: vendedorData });
      offerBiometricOptIn(vendedorId, clave);
    }, 100);
  };

  const handleBiometricLogin = async () => {
    if (isBiometricLoading) {
      return;
    }

    setIsBiometricLoading(true);
    try {
      const authenticated = await authenticateWithBiometric("Ingresar a OSVI");
      if (!authenticated) {
        return;
      }

      const credentials = await getBiometricCredentials({ requireAuth: false });
      if (!credentials) {
        await disableBiometricLogin();
        setBiometricEnabled(false);
        Alert.alert(
          "Error",
          "No hay credenciales guardadas. Ingresá con código y clave."
        );
        return;
      }

      const vendedorData = authorizeWithCredentials(
        credentials.vendedorId,
        credentials.clave
      );

      if (!vendedorData) {
        await disableBiometricLogin();
        setBiometricEnabled(false);
        Alert.alert(
          "Acceso desactualizado",
          "Tu usuario o clave cambió. Ingresá manualmente y volvé a activar la huella."
        );
        return;
      }

      setForm({
        vendedor: credentials.vendedorId,
        password: credentials.clave,
      });
      setVendedor(vendedorData);
      navigation.navigate("UserMenuPPal", { vendedor: vendedorData });
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "No se pudo ingresar con biometría"
      );
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleVendedor = (text) => {
    setForm({ vendedor: text, password: form.password });
  };

  const handlePassword = (text) => {
    setForm({ vendedor: form.vendedor, password: text });
  };

  const recargarUsuarios = async () => {
    const usuariosFromDB = await getUsuarios();
    setUsuarios(usuariosFromDB);
    return usuariosFromDB;
  };

  const tieneInternet = async () => {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable !== false;
  };

  const handleBuscarAccesoOnline = async () => {
    if (!form.vendedor.trim() || !form.password.trim()) {
      Alert.alert("Error", "Complete código y contraseña para buscar acceso online");
      return;
    }

    if (!(await tieneInternet())) {
      Alert.alert("Sin conexión", "Necesitás internet para buscar acceso online");
      return;
    }

    setIsLoadingOnline(true);
    try {
      await activarAccesoOnline(form.vendedor.trim(), form.password.trim());
      await recargarUsuarios();
      Alert.alert("Éxito", "Acceso encontrado y guardado. Ya podés ingresar offline.");
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", error.message || "No se encontró acceso online");
    } finally {
      setIsLoadingOnline(false);
    }
  };

  const abrirRegistroModal = () => {
    setRegistroCodigo(form.vendedor);
    setRegistroClave(form.password);
    setRegistroModalVisible(true);
  };

  const cerrarRegistroModal = () => {
    setRegistroModalVisible(false);
    setRegistroCodigo("");
    setRegistroClave("");
    setRegistroNombre("");
    setShowRegistroClave(false);
  };

  const handleRegistrarse = async () => {
    if (!registroCodigo.trim() || !registroClave.trim() || registroNombre.trim().length < 2) {
      Alert.alert("Error", "Complete código, clave y nombre (mínimo 2 caracteres)");
      return;
    }

    const claveValida = validarClaveRegistro(registroClave.trim());
    if (!claveValida.ok) {
      Alert.alert("Clave inválida", claveValida.error);
      return;
    }

    if (!(await tieneInternet())) {
      Alert.alert("Sin conexión", "El registro requiere conexión a internet");
      return;
    }

    setIsLoadingOnline(true);
    try {
      const codigo = registroCodigo.trim();
      const clave = registroClave.trim();
      const nombre = registroNombre.trim();

      await registrarYActivar(codigo, clave, nombre);
      await recargarUsuarios();
      setForm({
        vendedor: codigo,
        password: clave,
      });
      cerrarRegistroModal();
      Alert.alert(
        "Registro exitoso",
        "Tu cuenta fue creada en modo TEST. Ya podés ingresar offline.",
        [
          {
            text: "OK",
            onPress: () => {
              if (biometricAvailable && !biometricEnabled) {
                offerBiometricOptIn(codigo, clave);
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", error.message || "No se pudo completar el registro");
    } finally {
      setIsLoadingOnline(false);
    }
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
    console.log("🔍 Iniciando autenticación de usuario...");
    const vendedorData = isAuthorized();
    if (vendedorData) {
      console.log("✅ Vendedor autorizado: ", vendedorData);
      navigateAfterLogin(vendedorData, form.vendedor, form.password);
      return;
    }

    // Failed login
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
                  placeholder="Usuario"
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

              {biometricAvailable && biometricEnabled ? (
                <Button
                  mode="outlined"
                  onPress={handleBiometricLogin}
                  style={styles.biometricButton}
                  labelStyle={styles.biometricButtonText}
                  loading={isBiometricLoading}
                  disabled={isBiometricLoading}
                  icon={({ size, color }) => (
                    <MaterialCommunityIcons name="fingerprint" size={size} color={color} />
                  )}
                >
                  Ingresar con {biometricLabel}
                </Button>
              ) : null}

              <Button
                mode="outlined"
                onPress={abrirRegistroModal}
                style={styles.registerButton}
                labelStyle={styles.registerButtonText}
                disabled={isLoadingOnline}
              >
                Registrarse (online)
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
              El usuario o la contraseña son incorrectos.
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
                onPress={handleBuscarAccesoOnline}
                style={styles.modalButton}
                loading={isLoadingOnline}
                disabled={isLoadingOnline}
              >
                Buscar acceso online
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

      <Modal
        visible={registroModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={cerrarRegistroModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons
              name="account-plus"
              size={60}
              color="#3498db"
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>Registrarse</Text>
            <Text style={styles.modalMessage}>
              Se creará una cuenta en empresa TEST. Luego podés ingresar sin internet.
            </Text>
            <TextInput
              style={styles.registroInput}
              placeholder="Usuario"
              placeholderTextColor="#95a5a6"
              value={registroCodigo}
              onChangeText={setRegistroCodigo}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.registroClaveRow}>
              <TextInput
                style={[styles.registroInput, styles.registroClaveInput]}
                placeholder="Clave"
                placeholderTextColor="#95a5a6"
                value={registroClave}
                onChangeText={setRegistroClave}
                secureTextEntry={!showRegistroClave}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.registroEyeIcon}
                onPress={() => setShowRegistroClave(!showRegistroClave)}
              >
                <MaterialCommunityIcons
                  name={showRegistroClave ? "eye-off" : "eye"}
                  size={22}
                  color="#7f8c8d"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.registroHint}>{REQUISITOS_CLAVE_TEXTO}</Text>
            <TextInput
              style={styles.registroInput}
              placeholder="Nombre completo"
              placeholderTextColor="#95a5a6"
              value={registroNombre}
              onChangeText={setRegistroNombre}
            />
            <View style={styles.modalButtons}>
              <Button
                mode="contained"
                onPress={handleRegistrarse}
                style={styles.modalButton}
                loading={isLoadingOnline}
                disabled={isLoadingOnline}
              >
                Crear cuenta
              </Button>
              <Button
                mode="outlined"
                onPress={cerrarRegistroModal}
                style={styles.modalButton}
              >
                Cancelar
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
  biometricButton: {
    borderColor: "#ffffff",
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  biometricButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  registerButton: {
    borderColor: "#ffffff",
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },
  registerButtonText: {
    color: "#ffffff",
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
  registroInput: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    color: "#2c3e50",
    backgroundColor: "#fff",
  },
  registroClaveRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  registroClaveInput: {
    flex: 1,
    marginBottom: 0,
  },
  registroEyeIcon: {
    marginLeft: 8,
    padding: 8,
  },
  registroHint: {
    width: "100%",
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 8,
    lineHeight: 16,
  },
  modalButtons: {
    flexDirection: "column",
    width: "100%",
  },
  modalButton: {
    marginVertical: 4,
  },
});

export default LoginScreen;
