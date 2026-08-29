import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = '@MyApp:BiometricLoginEnabled';
const BIOMETRIC_CREDENTIALS_KEY = 'MyAppBiometricCredentials';

export const isBiometricAvailable = async () => {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch (error) {
    console.warn('Error al verificar biometría:', error);
    return false;
  }
};

export const getBiometricLabel = async () => {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return Platform.OS === 'ios' ? 'Face ID' : 'reconocimiento facial';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'huella digital';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'iris';
    }
    return 'biometría';
  } catch {
    return 'huella digital';
  }
};

export const isBiometricLoginEnabled = async () => {
  try {
    const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return value === 'true';
  } catch {
    return false;
  }
};

export const setBiometricLoginEnabled = async (enabled) => {
  if (enabled) {
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
  } else {
    await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    await clearBiometricCredentials();
  }
};

export const saveBiometricCredentials = async (vendedorId, clave) => {
  const payload = JSON.stringify({
    vendedorId: String(vendedorId),
    clave: String(clave),
  });

  await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, payload, {
    requireAuthentication: true,
    authenticationPrompt: 'Confirmá tu identidad para guardar el acceso',
  });
};

export const getBiometricCredentials = async ({ requireAuth = true } = {}) => {
  const options = requireAuth
    ? {
        requireAuthentication: true,
        authenticationPrompt: 'Ingresar a OSVI',
      }
    : {};

  const raw = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY, options);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.vendedorId || !parsed?.clave) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const clearBiometricCredentials = async () => {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
  } catch (error) {
    console.warn('No se pudieron borrar credenciales biométricas:', error);
  }
};

export const authenticateWithBiometric = async (promptMessage = 'Ingresar a OSVI') => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancelar',
    disableDeviceFallback: false,
  });

  return result.success === true;
};

export const enableBiometricLogin = async (vendedorId, clave) => {
  await saveBiometricCredentials(vendedorId, clave);
  await setBiometricLoginEnabled(true);
};

export const disableBiometricLogin = async () => {
  await setBiometricLoginEnabled(false);
};
