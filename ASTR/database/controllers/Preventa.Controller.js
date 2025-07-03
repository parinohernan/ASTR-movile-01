// ARCHIVO COMENTADO - SQLite no disponible en versión web
// import { db } from '../database';
import { limpiarPreventaDeStorage } from '../../src/utils/storageUtils';
import { mas1NexPreventa } from '../../src/utils/storageConfigData';
import { configuracionVendedor, configuracionSucursal } from '../../src/utils/storageConfigData';

const syncPreventas = () => {
    console.log("Función mock: syncPreventas - SQLite no disponible en web");
};

const grabarCabezaPreventaEnBDD = async (numero, nota, cliente, cantItems, importeTotal, vendedor, sucursal) => {
    console.log("Función mock: grabarCabezaPreventaEnBDD - SQLite no disponible en web");
    return Promise.resolve();
};

const grabarPreventaEnBDD = async (numero, cliente, vendedor, observacion, fecha, cantidadItems, importeTotal) => {
    console.log("Función mock: grabarPreventaEnBDD - SQLite no disponible en web");
    return Promise.resolve();
};

const grabarItemsPreventaEnBDD = async (numero, items) => {
    console.log("Función mock: grabarItemsPreventaEnBDD - SQLite no disponible en web");
    return Promise.resolve();
};

const buscarItemsPreventaEnBDD = async (numeroPreventa) => {
    console.log("Función mock: buscarItemsPreventaEnBDD - SQLite no disponible en web");
    return Promise.resolve([]);
};

const getPreventas = async () => {
    console.log("Función mock: getPreventas - SQLite no disponible en web");
    return Promise.resolve([]);
};

const borrarContenidoPreventasEnBDD = async () => {
    console.log("Función mock: borrarContenidoPreventasEnBDD - SQLite no disponible en web");
    return Promise.resolve();
};

const borrarPreventaYSusItems = async (numeroPreventa) => {
    console.log("Función mock: borrarPreventaYSusItems - SQLite no disponible en web");
    return Promise.resolve();
};

const limpiarArticulosInvalidos = async (numeroPreventa) => {
    console.log("Función mock: limpiarArticulosInvalidos - SQLite no disponible en web");
    return Promise.resolve();
};

// Función para validar los datos de la preventa antes de enviar
const validarPreventaParaEnvio = (preventa) => {
    const errores = [];
    
    // Validar estructura básica
    if (!preventa) {
        errores.push("La preventa es null o undefined");
        return errores;
    }
    
    if (!preventa.items || preventa.items.length === 0) {
        errores.push("La preventa no tiene items");
        return errores;
    }
    
    // Validar campos obligatorios de la preventa
    if (!preventa.DocumentoNumero) {
        errores.push("Falta número de documento");
    }
    
    if (!preventa.ClienteCodigo) {
        errores.push("Falta código de cliente");
    }
    
    if (!preventa.VendedorCodigo) {
        errores.push("Falta código de vendedor");
    }
    
    if (preventa.ImporteTotal === null || preventa.ImporteTotal === undefined || preventa.ImporteTotal < 0) {
        errores.push("Importe total inválido");
    }
    
    // Validar cada item
    preventa.items.forEach((item, index) => {
        if (!item.CodigoArticulo || item.CodigoArticulo === "000NaN" || item.CodigoArticulo.trim() === "") {
            errores.push(`Item ${index + 1}: Código de artículo inválido`);
        }
        
        if (item.Cantidad === null || item.Cantidad === undefined || item.Cantidad <= 0) {
            errores.push(`Item ${index + 1}: Cantidad debe ser mayor a 0`);
        }
        
        if (item.PrecioUnitario === null || item.PrecioUnitario === undefined || item.PrecioUnitario < 0) {
            errores.push(`Item ${index + 1}: Precio unitario no puede ser negativo`);
        }
        
        if (item.PorcentajeBonificacion === null || item.PorcentajeBonificacion === undefined || 
            item.PorcentajeBonificacion < 0 || item.PorcentajeBonificacion > 100) {
            errores.push(`Item ${index + 1}: Porcentaje de bonificación debe estar entre 0 y 100`);
        }
        
        if (item.iva === null || item.iva === undefined || item.iva < 0) {
            errores.push(`Item ${index + 1}: IVA inválido`);
        }
        
        // Validar que si el descuento es 100%, el precio unitario sea 0
        if (item.PorcentajeBonificacion === 100 && item.PrecioUnitario !== 0) {
            errores.push(`Item ${index + 1}: Si el descuento es 100%, el precio unitario debe ser 0`);
        }
    });
    
    return errores;
};

const asyncPreventasBDDToArray = async() => {
    console.log("Función mock: asyncPreventasBDDToArray - SQLite no disponible en web");
    return Promise.resolve([]);
};

const preventasBDDToArray = async () => {
    console.log("Función mock: preventasBDDToArray - SQLite no disponible en web");
    return Promise.resolve([]);
};

export {
    syncPreventas,
    grabarCabezaPreventaEnBDD,
    grabarPreventaEnBDD,
    grabarItemsPreventaEnBDD,
    buscarItemsPreventaEnBDD,
    getPreventas,
    borrarContenidoPreventasEnBDD,
    borrarPreventaYSusItems,
    limpiarArticulosInvalidos,
    validarPreventaParaEnvio,
    asyncPreventasBDDToArray,
    preventasBDDToArray
};