import axios from 'axios';
import { initDatabase} from '../database/database';
import { borrarArticulosDeSqlite, insertArticulosFromAPI, insertArticulosFrecuentesToSqlite } from '../database/controllers/Articulos.Controller';
import { insertUsuariosFromAPI } from '../database/controllers/Usuarios.controler';
import { insertClientesFromAPI } from '../database/controllers/Clientes.Controller';
import { preventasBDDToArray } from '../database/controllers/Preventa.Controller';
import { borrarContenidoPreventasEnBDD } from '../database/controllers/Preventa.Controller';
import { 
  configuracionEndPoint, 
  sincronizarDatosInteligente,
  verificarEspacioDisponible,
  CONFIG_PAGINACION,
  getConfiguracionDelStorage
} from '../src/utils/storageConfigData';

const handleLogs = (logs, mensaje, setLogs) => {
  console.log("handleLogs actualizaAPP ",mensaje);
  setLogs( [...logs, mensaje]);
  return [...logs, mensaje];
};

const actualizarVendedores = async (logs, setLogs) => {
    console.log("Trayendo Vendedores...");
    try {
        logs = handleLogs(logs, "🔄 Iniciando sincronización de vendedores...", setLogs);
        
        // Verificar si estamos en versión web
        if (typeof window !== 'undefined' && window.localStorage) {
            // Versión web - sincronización directa
            logs = handleLogs(logs, "🌐 Usando sincronización web...", setLogs);
            
            // Obtener configuración
            const config = await getConfiguracionDelStorage();
            const endpoint = config.endPoint || config.endpoint;
            
            if (!endpoint) {
                throw new Error('Endpoint no configurado. Configure el servidor primero.');
            }
            
            const url = `${endpoint}vendedores`;
            logs = handleLogs(logs, `📡 Conectando a: ${url}`, setLogs);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const vendedores = Array.isArray(data) ? data : (data.items || data.data || []);
            
            logs = handleLogs(logs, `📦 Datos recibidos: ${vendedores.length} vendedores`, setLogs);
            
            // Guardar en localStorage
            localStorage.setItem('usuarios', JSON.stringify(vendedores));
            logs = handleLogs(logs, `💾 Vendedores guardados en localStorage`, setLogs);
            
            logs = handleLogs(logs, `✅ Sincronización web de vendedores completada: ${vendedores.length} vendedores`, setLogs);
            return vendedores.length;
        } else {
            // Versión móvil - usar sincronización inteligente
            // Verificar espacio disponible
            const espacio = await verificarEspacioDisponible();
            logs = handleLogs(logs, `📊 Espacio disponible: ${(espacio.disponible / 1024 / 1024).toFixed(2)}MB`, setLogs);
            
            if (espacio.porcentajeUsado > 90) {
                logs = handleLogs(logs, "⚠️ Espacio crítico detectado", setLogs);
                return;
            }
            
            // Usar sincronización inteligente para vendedores
            const totalVendedores = await sincronizarDatosInteligente('vendedores', logs, setLogs);
            logs = handleLogs(logs, `✅ Sincronización de vendedores completada: ${totalVendedores} vendedores`, setLogs);
            return totalVendedores;
        }
        
    } catch (error) {
        console.error('Error en actualizarVendedores:', error);
        
        let mensajeError = 'Error desconocido';
        
        if (error.code === 'ECONNREFUSED') {
            mensajeError = 'El servidor no está disponible. Verifique la dirección IP y puerto.';
        } else if (error.code === 'ENOTFOUND') {
            mensajeError = 'No se puede resolver la dirección del servidor. Verifique la configuración.';
        } else if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
            mensajeError = 'Problema con el certificado SSL del servidor.';
        } else if (error.code === 'ECONNABORTED') {
            mensajeError = 'Tiempo de espera agotado. El servidor no responde.';
        } else if (error.response) {
            mensajeError = `Error del servidor: ${error.response.status} - ${error.response.statusText}`;
        } else if (error.request) {
            mensajeError = 'No se recibió respuesta del servidor.';
        } else {
            mensajeError = error.message || 'Error de conexión';
        }
        
        logs = handleLogs(logs, `❌ Error al sincronizar vendedores: ${mensajeError}`, setLogs);
    }
};

const actualizarClientes = async (logs, setLogs) => {
    console.log("Trayendo Clientes...");
    try {
        logs = handleLogs(logs, "🔄 Iniciando sincronización de clientes...", setLogs);
        
        // Verificar si estamos en versión web
        if (typeof window !== 'undefined' && window.localStorage) {
            // Versión web - sincronización directa
            logs = handleLogs(logs, "🌐 Usando sincronización web...", setLogs);
            
            // Obtener configuración
            const config = await getConfiguracionDelStorage();
            const endpoint = config.endPoint || config.endpoint;
            
            if (!endpoint) {
                throw new Error('Endpoint no configurado. Configure el servidor primero.');
            }
            
            const url = `${endpoint}clientes`;
            logs = handleLogs(logs, `📡 Conectando a: ${url}`, setLogs);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const clientes = Array.isArray(data) ? data : (data.items || data.data || []);
            
            logs = handleLogs(logs, `📦 Datos recibidos: ${clientes.length} clientes`, setLogs);
            
            // Guardar en localStorage
            localStorage.setItem('clientes', JSON.stringify(clientes));
            logs = handleLogs(logs, `💾 Clientes guardados en localStorage`, setLogs);
            
            logs = handleLogs(logs, `✅ Sincronización web de clientes completada: ${clientes.length} clientes`, setLogs);
            return clientes.length;
        } else {
            // Versión móvil - usar sincronización inteligente
            // Verificar espacio disponible
            const espacio = await verificarEspacioDisponible();
            logs = handleLogs(logs, `📊 Espacio disponible: ${(espacio.disponible / 1024 / 1024).toFixed(2)}MB`, setLogs);
            
            if (espacio.porcentajeUsado > 85) {
                logs = handleLogs(logs, "⚠️ Espacio limitado, cargando solo clientes más importantes", setLogs);
                // Cargar solo los primeros 500 clientes
                const resultado = await sincronizarDatosInteligente('clientes', logs, setLogs);
                logs = handleLogs(logs, `✅ Sincronización limitada de clientes: ${resultado} clientes`, setLogs);
                return resultado;
            } else {
                // Cargar todos los clientes
                const totalClientes = await sincronizarDatosInteligente('clientes', logs, setLogs);
                logs = handleLogs(logs, `✅ Sincronización completa de clientes: ${totalClientes} clientes`, setLogs);
                return totalClientes;
            }
        }
        
    } catch (error) {
        console.error('Error en actualizarClientes:', error);
        
        let mensajeError = 'Error desconocido';
        
        if (error.code === 'ECONNREFUSED') {
            mensajeError = 'El servidor no está disponible. Verifique la dirección IP y puerto.';
        } else if (error.code === 'ENOTFOUND') {
            mensajeError = 'No se puede resolver la dirección del servidor. Verifique la configuración.';
        } else if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
            mensajeError = 'Problema con el certificado SSL del servidor.';
        } else if (error.code === 'ECONNABORTED') {
            mensajeError = 'Tiempo de espera agotado. El servidor no responde.';
        } else if (error.response) {
            mensajeError = `Error del servidor: ${error.response.status} - ${error.response.statusText}`;
        } else if (error.request) {
            mensajeError = 'No se recibió respuesta del servidor.';
        } else {
            mensajeError = error.message || 'Error de conexión';
        }
        
        logs = handleLogs(logs, `❌ Error al sincronizar clientes: ${mensajeError}`, setLogs);
    }
};

const actualizarArticulos = async (logs, setLogs) => {
    console.log("Trayendo Articulos...");
    try {
        logs = handleLogs(logs, "🔄 Iniciando sincronización de artículos...", setLogs);
        
        // Verificar si estamos en versión web
        if (typeof window !== 'undefined' && window.localStorage) {
            // Versión web - sincronización directa
            logs = handleLogs(logs, "🌐 Usando sincronización web...", setLogs);
            
            // Obtener configuración
            const config = await getConfiguracionDelStorage();
            const endpoint = config.endPoint || config.endpoint;
            
            if (!endpoint) {
                throw new Error('Endpoint no configurado. Configure el servidor primero.');
            }
            
            const url = `${endpoint}articulos`;
            logs = handleLogs(logs, `📡 Conectando a: ${url}`, setLogs);
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const articulos = Array.isArray(data) ? data : (data.items || data.data || []);
            
            logs = handleLogs(logs, `📦 Datos recibidos: ${articulos.length} artículos`, setLogs);
            
            // Guardar en localStorage
            localStorage.setItem('articulos', JSON.stringify(articulos));
            logs = handleLogs(logs, `💾 Artículos guardados en localStorage`, setLogs);
            
            logs = handleLogs(logs, `✅ Sincronización web de artículos completada: ${articulos.length} artículos`, setLogs);
            return articulos.length;
        } else {
            // Versión móvil - usar sincronización inteligente
            // Verificar espacio disponible
            const espacio = await verificarEspacioDisponible();
            logs = handleLogs(logs, `📊 Espacio disponible: ${(espacio.disponible / 1024 / 1024).toFixed(2)}MB`, setLogs);
            
            if (espacio.porcentajeUsado > 80) {
                logs = handleLogs(logs, "⚠️ Espacio crítico, cargando solo artículos más importantes", setLogs);
                // Cargar solo los primeros 5000 artículos
                const resultado = await sincronizarDatosInteligente('articulos', logs, setLogs);
                logs = handleLogs(logs, `✅ Sincronización limitada de artículos: ${resultado} artículos`, setLogs);
                return resultado;
            } else {
                // Cargar todos los artículos con paginación
                const totalArticulos = await sincronizarDatosInteligente('articulos', logs, setLogs);
                logs = handleLogs(logs, `✅ Sincronización completa de artículos: ${totalArticulos} artículos`, setLogs);
                return totalArticulos;
            }
        }
        
    } catch (error) {
        console.error('Error en actualizarArticulos:', error);
        logs = handleLogs(logs, `❌ Error al sincronizar artículos: ${error.message}`, setLogs);
    }
};

const actualizarPreventas = async (preventasJSON, mensajes) => {
  console.log("Enviando preventa al servidor:", JSON.stringify(preventasJSON, null, 2));
  try {
        const response = await axios.post(await configuracionEndPoint() + 'preventas', preventasJSON);
    console.log("Respuesta del servidor:", response.status, response.data);
    
    // Preparar información del resultado exitoso
    const resultadoEnvio = {
      exitoso: true,
      tipo: 'nuevo',
      codigoServidor: response.status,
      respuestaServidor: response.data,
      mensaje: 'Preventa enviada correctamente'
    };
    
    // Guardar como respaldo si el envío fue exitoso
    try {
      const { guardarPreventaEnviada } = await import('../src/utils/storageUtils.js');
      await guardarPreventaEnviada(preventasJSON, resultadoEnvio);
      console.log("Preventa guardada como respaldo exitosamente");
    } catch (backupError) {
      console.error('Error al guardar respaldo:', backupError);
      // No fallamos por error de respaldo, solo lo registramos
    }
    
    return response;
    } catch (error) {
    console.error('Error al enviar preventas:', error);
    
    // Preparar información del resultado
    let resultadoEnvio = {
      exitoso: false,
      tipo: 'error',
      codigoServidor: error.response?.status || 'N/A',
      respuestaServidor: error.response?.data || 'N/A',
      mensaje: 'Error al enviar preventa'
    };
    
    // Manejar específicamente el error de PRIMARY KEY duplicado
    if (error.response && error.response.status === 500) {
      const errorData = error.response.data;
      
      // Verificar si es específicamente un error de clave primaria duplicada
      // El servidor puede devolver el error en diferentes formatos
      const isPrimaryKeyError = 
        (errorData && errorData.details && 
         (errorData.details.includes("PRIMARY must be unique") || 
          (Array.isArray(errorData.details) && errorData.details.some(detail => detail.includes("PRIMARY must be unique"))))) ||
        (errorData && errorData.error === "Validation error" && 
         errorData.details && Array.isArray(errorData.details) && 
         errorData.details.some(detail => detail.includes("PRIMARY must be unique")));
      
      if (isPrimaryKeyError) {
        console.log("Preventa ya existe en el servidor, marcando como exitosa");
        mensajes.hayErrores = false;
        mensajes.mensaje = "Preventa ya fue enviada anteriormente";
        
        // Actualizar información del resultado para duplicada
        resultadoEnvio = {
          exitoso: true,
          tipo: 'duplicada',
          codigoServidor: error.response.status,
          respuestaServidor: error.response.data,
          mensaje: 'Preventa ya existía en el servidor'
        };
        
        // Guardar como respaldo aunque ya exista en el servidor
        try {
          const { guardarPreventaEnviada } = await import('../src/utils/storageUtils.js');
          await guardarPreventaEnviada(preventasJSON, resultadoEnvio);
          console.log("Preventa guardada como respaldo (ya existía en servidor)");
        } catch (backupError) {
          console.error('Error al guardar respaldo:', backupError);
        }
        
        return { status: 200, data: { message: "Preventa ya existía en servidor" } };
      } else {
        // Es un error 500 pero no de clave primaria duplicada
        console.error('Error 500 del servidor (no es preventa duplicada):', errorData);
        mensajes.hayErrores = true;
        mensajes.mensaje = `Error del servidor 500: ${JSON.stringify(errorData)}`;
        
        // Guardar como respaldo con información del error
        try {
          const { guardarPreventaEnviada } = await import('../src/utils/storageUtils.js');
          await guardarPreventaEnviada(preventasJSON, resultadoEnvio);
          console.log("Preventa guardada como respaldo (error 500 del servidor)");
        } catch (backupError) {
          console.error('Error al guardar respaldo:', backupError);
        }
        
        return null;
      }
    }
    
    mensajes.hayErrores = true;
    
    if (error.response) {
      console.error('Error del servidor:', error.response.status, error.response.data);
      mensajes.mensaje = `Error del servidor: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      console.error('Error de red:', error.request);
      mensajes.mensaje = 'Error de conexión al servidor';
    } else {
      console.error('Error:', error.message);
      mensajes.mensaje = `Error: ${error.message}`;
    }
    
    // Guardar respaldo con información del error
    try {
      const { guardarPreventaEnviada } = await import('../src/utils/storageUtils.js');
      await guardarPreventaEnviada(preventasJSON, resultadoEnvio);
      console.log("Preventa guardada como respaldo (con error)");
    } catch (backupError) {
      console.error('Error al guardar respaldo:', backupError);
    }
    
    // No lanzamos la excepción, solo la registramos
    return null;
  }
}

// Verificar si una preventa ya existe en el servidor
const verificarPreventaExistente = async (numeroPreventa) => {
  try {
    const endpoint = await configuracionEndPoint();
    const response = await axios.get(`${endpoint}preventas/${numeroPreventa}`, {
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500; // Resuelve solo si el status es menor a 500
      }
    });
    
    // Si la respuesta es 200, la preventa existe
    // Si es 404, no existe
    return response.status === 200;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false; // La preventa no existe
    }
    console.error('Error al verificar preventa existente:', error);
    return false; // En caso de error, asumimos que no existe
  }
};

//envia solo una preventa
const sincronizarPreventa = async (preventaNumero, cliente) => {
  try {
    console.log("🔄 Sincronizando preventa", preventaNumero, cliente);
    
    // Verificar si la preventa ya existe en el servidor
    const yaExiste = await verificarPreventaExistente(preventaNumero);
    if (yaExiste) {
      console.log("✅ Preventa ya existe en el servidor, marcando como exitosa");
      
      // Obtener la preventa para guardarla como respaldo
      let preventas = await preventasBDDToArray();
      let preventaJSON = preventas.filter(e => e.DocumentoNumero == preventaNumero);
      
      if (preventaJSON.length > 0) {
        const preventa = preventaJSON[0];
        
        // Guardar como respaldo con información de duplicada
        const resultadoEnvio = {
          exitoso: true,
          tipo: 'duplicada',
          codigoServidor: 200,
          respuestaServidor: { message: "Preventa ya existía en servidor" },
          mensaje: 'Preventa ya existía en el servidor'
        };
        
        try {
          const { guardarPreventaEnviada } = await import('../src/utils/storageUtils.js');
          await guardarPreventaEnviada(preventa, resultadoEnvio);
          console.log("✅ Preventa duplicada guardada como respaldo");
        } catch (backupError) {
          console.error('❌ Error al guardar respaldo de preventa duplicada:', backupError);
        }
      }
      
      return true;
    }
    
    // Limpiar artículos inválidos antes de sincronizar
    console.log("🧹 Limpiando artículos inválidos de la preventa...");
    const { limpiarArticulosInvalidos } = await import('../database/controllers/Preventa.Controller.js');
    await limpiarArticulosInvalidos(preventaNumero);
    
    let preventas = await preventasBDDToArray();
    console.log("📊 Preventas encontradas en BDD:", preventas.length);
    
    let preventaJSON = preventas.filter(e => e.DocumentoNumero == preventaNumero); 
    console.log("🎯 Preventa filtrada:", preventaJSON.length);
    
    if (preventaJSON.length === 0) {
      console.error("❌ No se encontró la preventa", preventaNumero);
      return false;
    }
    
    const preventa = preventaJSON[0];
    console.log("📤 Enviando preventa:", {
      numero: preventa.DocumentoNumero,
      cliente: preventa.ClienteCodigo,
      items: preventa.items?.length || 0,
      importe: preventa.ImporteTotal
    });
    
    // Validar la preventa antes de enviar
    const { validarPreventaParaEnvio } = await import('../database/controllers/Preventa.Controller.js');
    const errores = validarPreventaParaEnvio(preventa);
    
    if (errores.length > 0) {
      console.error("❌ Errores de validación:", errores);
      return false;
    }
    
    let mensajes = {
      hayErrores: false,
      mensaje: "No hay errores."
    };    
    
    const resultado = await actualizarPreventas(preventa, mensajes);
    console.log("📡 Resultado de envío:", mensajes);
    
    if (resultado) {
      console.log("✅ Preventa enviada exitosamente al servidor");
    } else {
      console.log("❌ Error al enviar preventa al servidor");
    }
    
    return !mensajes.hayErrores;
    
  } catch (error) {
    console.error('❌ Error en sincronizarPreventa:', error);
    return false;
  }
};

const enviarPreventas = async (logs, setLogs) => {
    let preventas = [];
    let mensajes = {hayErrores: false, mensaje: "No hay errores."};    
    let preventasConError = []; // Array para trackear preventas que fallaron
    
    try {
      // Buscar en BDD local y transformarla en un ARRAY de JSON
      preventas = await preventasBDDToArray();
      console.log("enviando preventas ",preventas);
      
      // Enviarlas por post
      for (let i = 0; i < preventas.length; i++) {
        try {
          const resultado = await actualizarPreventas(preventas[i], mensajes);
          console.log(`enviando preventa ${i + 1}.`,preventas[i]);
          logs = handleLogs(logs,(`enviando preventa ${i + 1}.`) , setLogs);
          
          // Si la preventa falló con error 500 (no duplicada), la agregamos a la lista de errores
          if (!resultado && mensajes.hayErrores) {
            preventasConError.push(preventas[i].DocumentoNumero);
            logs = handleLogs(logs, (`⚠️ Preventa ${preventas[i].DocumentoNumero} falló con error del servidor`), setLogs);
          }
          
        } catch (error) {
          logs = handleLogs(logs, (`Error al enviar la preventa ${i + 1}: ${error}`),setLogs);
          console.error('Error al enviar la preventa', i + 1);
          preventasConError.push(preventas[i].DocumentoNumero);
        }
      }
       
      // Borrarlas de la aplicación solo si no tuvimos errores críticos
      if (!mensajes.hayErrores || preventasConError.length === 0) {
          await borrarContenidoPreventasEnBDD();
          logs = handleLogs(logs, ("✅ Preventas borradas correctamente"),setLogs);
      } else {
          logs = handleLogs(logs, (`⚠️ No se borraron las preventas. Errores en: ${preventasConError.join(', ')}`),setLogs);
          console.error('no se borraron las preventas porque hay errores en:', preventasConError);
      }
    } catch (error) {
      logs = handleLogs(logs, (`❌ Error al enviar o borrar preventas: ${error}`),setLogs);
      console.error('Error al enviar o borrar preventas: ', error);
    }
  };

  const errorSincronizando = (logs, setLogs) =>{
    logs = handleLogs(logs, "ERROR CONECTANDO AL SERVIDOR...", setLogs)
  }

  const actualizarAPP = async (esCompleta, logs, setLogs) => {
    console.log(logs);
    if (esCompleta) {
      logs = handleLogs(logs, "Sincronizando todos los datos...", setLogs);
      await initDatabase(logs, setLogs);
      await actualizarVendedores(logs, setLogs);
      await actualizarClientes(logs, setLogs);
      await borrarArticulosDeSqlite(); 
      await actualizarArticulos(logs, setLogs);
      // await enviarPreventas(logs, setLogs);
      logs = handleLogs(logs, "Sincronización completa.", setLogs);
    } else {
      logs = handleLogs(logs, "SOLO SE ENVIAN LAS PREVENTAS SIN ACTUALIZAR DATOS", setLogs);
      await enviarPreventas(logs, setLogs);
    }
  }
  

  const getArticulosFrecuentesDesdeAPI = async (cliente) => {
    // Obtener la fecha actual
    const today = new Date();
    const year = today.getFullYear();
    // JavaScript cuenta los meses desde 0 (enero es 0, diciembre es 11)
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    // Formatear la fecha actual en el formato AAAA-MM-DD
    const formattedToday = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
    // Obtener la fecha de un año atrás
    const oneYearAgo = new Date(year -1, month , day); // Restar 1 al año actual
  
    // Formatear la fecha de un año atrás en el formato AAAA-MM-DD
    const formattedOneYearAgo = `${oneYearAgo.getFullYear()}-${(oneYearAgo.getMonth() + 1).toString().padStart(2, '0')}-${oneYearAgo.getDate().toString().padStart(2, '0')}`;
    
    console.log("Trayendo Articulos frecuentes...");
   
    try {
      const response = await axios.get(await configuracionEndPoint() + "articulosfrecuentes?clienteCodigo=" + cliente + "&fechaDesde=" + formattedOneYearAgo + "&fechaHasta=" + formattedToday);
      const data = response.data;
      console.log(data);
      return data;
    } catch (error) {
      console.log('Error al obtener artículos frecuentes ', error);
    }
  };  

  const getInformeOnline = async (cliente) => {
    console.log("cargando documentos de ",cliente);
   
    try {
      const response = await axios.get(await configuracionEndPoint() + "clientesdeuda?clienteCodigo=" + cliente );
      const data = response.data;
      // console.log(data);
      return data;
    } catch (error) {
      console.log('Error al obtener artículos frecuentes ', error);
    }
  };  

export const actualizarSoloVendedores = async (logs, setLogs) => {
    console.log("Actualizando solo vendedores...");
    logs = handleLogs(logs, "Iniciando actualización de vendedores...", setLogs);
    
    try {
        await actualizarVendedores(logs, setLogs);
        logs = handleLogs(logs, "✅ Actualización de vendedores completada exitosamente", setLogs);
        return { success: true, message: "Vendedores actualizados correctamente" };
    } catch (error) {
        console.error('Error en actualizarSoloVendedores:', error);
        logs = handleLogs(logs, `❌ Error al actualizar vendedores: ${error.message}`, setLogs);
        return { success: false, message: error.message };
    }
};

export { actualizarAPP, actualizarVendedores, actualizarClientes, initDatabase, enviarPreventas, getArticulosFrecuentesDesdeAPI, getInformeOnline, sincronizarPreventa, verificarPreventaExistente, errorSincronizando};