import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Image 
} from 'react-native';
import indexedDBHandler from '../src/utils/indexedDBHandler';

const LoginWeb = ({ navigation, rootUser }) => {
  const [form, setForm] = useState({
    vendedor: "",
    password: "",
  });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);

  // Usuarios de prueba para inicialización (solo si no hay usuarios sincronizados)
  const usuariosPrueba = [
    { id: '001', codigo: '001', descripcion: 'Vendedor 1', clave: '123' },
    { id: '002', codigo: '002', descripcion: 'Vendedor 2', clave: '456' },
    { id: '003', codigo: '003', descripcion: 'Vendedor 3', clave: '789' }
  ];

  useEffect(() => {
    // Inicializar IndexedDB y cargar usuarios disponibles
    const inicializarDB = async () => {
      try {
        await indexedDBHandler.init();
        
        // Verificar si hay vendedores en la base de datos
        const vendedores = await indexedDBHandler.obtenerVendedores();
        if (vendedores.length === 0) {
          // Si no hay vendedores, agregar los de prueba
          await indexedDBHandler.guardarVendedores(usuariosPrueba);
          console.log('✅ Usuarios de prueba inicializados en IndexedDB');
          setUsuariosDisponibles(usuariosPrueba);
        } else {
          console.log(`📋 ${vendedores.length} vendedores sincronizados encontrados en IndexedDB`);
          setUsuariosDisponibles(vendedores);
        }
      } catch (error) {
        console.error('❌ Error al inicializar IndexedDB:', error);
      }
    };

    inicializarDB();
  }, []);

  const isAuthorized = async () => {
    try {
      const vendedor = await indexedDBHandler.autenticarVendedor(form.vendedor, form.password);
      if (vendedor) {
        console.log("✅ Usuario autorizado:", vendedor);
        const vendedorData = {
          clave: form.password,
          id: form.vendedor,
          descripcion: vendedor.descripcion,
        };
        return vendedorData;
      }
      return false;
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      return false;
    }
  };

  const handleVendedor = (text) => {
    setForm({ vendedor: text, password: form.password });
  };

  const handlePassword = (text) => {
    setForm({ vendedor: form.vendedor, password: text });
  };

  const handleIngresar = async () => {
    console.log("🚀 === INICIO DE LOGIN ===");
    console.log("📝 Datos del formulario:", form);
    
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
      console.log("✅ === LOGIN ROOT EXITOSO ===");
      console.log("🔑 Acceso root autorizado");
      
      // Crear datos de vendedor para root
      const rootVendedor = {
        clave: "root",
        id: "root",
        descripcion: "Administrador Root",
        isRoot: true
      };
      
      console.log("👤 Datos de root:", rootVendedor);
      
      setTimeout(() => {
        navigation.navigate("Home", { vendedor: rootVendedor });
      }, 100);
      return;
    }

    // User access
    console.log("🔍 Iniciando autenticación de usuario...");
    const vendedorData = await isAuthorized();
    if (vendedorData) {
      console.log("✅ Vendedor autorizado:", vendedorData);
      setTimeout(() => {
        navigation.navigate("UserMenuPPal", { vendedor: vendedorData });
      }, 100);
      return;
    }

    // Failed login
    console.log("❌ === LOGIN FALLIDO ===");
    setLoginAttempts(prev => prev + 1);
    Alert.alert(
      "Error de autenticación",
      "Usuario o contraseña incorrectos. Intento " + (loginAttempts + 1) + " de 3",
      [{ text: "OK" }]
    );
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
            <Text style={styles.subtitleText}>Sistema de Gestión de Preventas</Text>
          </View>

          {/* Mensaje de usuarios sincronizados */}
          {/* <View style={{marginBottom: 20, backgroundColor: '#e0f7fa', borderRadius: 10, padding: 12, width: '100%', maxWidth: 400, alignSelf: 'center', borderWidth: 1, borderColor: '#30bced'}}>
            <Text style={{fontWeight: 'bold', color: '#00796b', fontSize: 16, marginBottom: 4}}>
              {usuariosDisponibles.length > 0 && usuariosDisponibles[0] && usuariosDisponibles[0].codigo !== '001'
                ? `Usuarios sincronizados encontrados: ${usuariosDisponibles.length}`
                : 'No hay usuarios sincronizados, usando usuarios de prueba.'}
            </Text>
            {usuariosDisponibles.length > 0 && usuariosDisponibles[0] && usuariosDisponibles[0].codigo !== '001' && (
              <View>
                {usuariosDisponibles.slice(0, 5).map((u, i) => (
                  <Text key={i} style={{color: '#00796b', fontSize: 14}}>
                    {u.codigo} - {u.descripcion}
                  </Text>
                ))}
                {usuariosDisponibles.length > 5 && (
                  <Text style={{color: '#00796b', fontSize: 13, fontStyle: 'italic'}}>...y más</Text>
                )}
              </View>
            )}
          </View> */}

          <View style={styles.formContainer}>
            {/* Campo Vendedor */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Vendedor</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese su código de vendedor"
                  value={form.vendedor}
                  onChangeText={handleVendedor}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="default"
                />
              </View>
            </View>

            {/* Campo Contraseña */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Contraseña</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Ingrese su contraseña"
                    value={form.password}
                    onChangeText={handlePassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeText}>
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Botón Ingresar */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                (form.vendedor.length > 0 && form.password.length >= 3) && styles.loginButtonActive
              ]}
              onPress={handleIngresar}
              disabled={!(form.vendedor.length > 0 && form.password.length >= 3)}
            >
              <Text style={styles.loginButtonText}>Ingresar</Text>
            </TouchableOpacity>

            {/* Botón Limpiar */}
            <TouchableOpacity
              style={styles.clearButton}
              onPress={resetForm}
            >
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>

            {/* Información de acceso */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Información de acceso</Text>
              <Text style={styles.infoText}>Root: root / root</Text>
              {usuariosDisponibles.length > 0 && (
                <Text style={styles.infoText}>
                  {usuariosDisponibles.length} vendedores disponibles
                </Text>
              )}
            </View>
          </View> 
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  eyeButton: {
    padding: 8,
  },
  eyeText: {
    fontSize: 20,
  },
  loginButton: {
    backgroundColor: '#ccc',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonActive: {
    backgroundColor: '#30bced',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default LoginWeb; 