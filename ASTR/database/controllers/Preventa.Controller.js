import { db } from '../database';
import { limpiarPreventaDeStorage } from '../../src/utils/storageUtils';
import { mas1NexPreventa } from '../../src/utils/storageConfigData';
import { configuracionVendedor, configuracionSucursal } from '../../src/utils/storageConfigData';
import { obtenerUbicacionPedido } from '../../src/utils/geolocationService';

const syncPreventas = () => {
    //sube las preventas a la BDD del servidor
    console.log("Subiento preventas al servidor");
};

const grabarCabezaPreventaEnBDD = async (numero, nota, cliente, cantItems, importeTotal, vendedor, sucursal, latitud = null, longitud = null) => {
    const fecha = new Date().toISOString();  // Formato ISO 8601
    
    console.log('PrvControler51. grabando cabeza en la bdd numero, cliente:', numero, cliente, vendedor, nota, fecha, cantItems, importeTotal, "suc", sucursal, "lat", latitud, "lng", longitud);
    
    try {
        db.withTransactionSync(() => {
            const result = db.runSync(
                'INSERT OR REPLACE INTO preventaCabeza (id, cliente, vendedor, observacion, fecha, cantidadItems, importeTotal, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [numero, cliente, vendedor, nota, fecha, cantItems, importeTotal, latitud, longitud]
            );
            console.log('Cabeza insertada o actualizada con ID:', result.lastInsertRowId, numero, cliente, vendedor, nota, fecha, cantItems, importeTotal);
        });
        return numero;
    } catch (error) {
        console.error('Error al insertar o actualizar cabeza:', error);
        throw error;
    }
};

// Grabalos items de la preventa del storage en la BDD sqlite
const grabarItemsPreventaEnBDD = async (numero, items) => {
    try {
        db.withTransactionSync(() => {
            items.forEach((item) => {
                console.log("80grabo BDD item ", numero, item);
                const result = db.runSync(
                    'INSERT INTO preventaItem (idPreventa, articulo, cantidad, importe, porcentajeBonificacion, precioLista, iva) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [numero, item.id, item.cantidad, item.precio, item.descuento, item.precioLista, item.iva]
                );
                console.log('ID del nuevo item:', result.lastInsertRowId, item);
            });
        });
    } catch (error) {
        console.error('Error al insertar items:', error);
        throw error;
    }
};

// grabo pasando la preventa del localstore a sqlite
const grabarPreventaEnBDD = async (numero, nota, cliente, items) => {
    let vendedor = await configuracionVendedor();
    let sucursal = await configuracionSucursal();

    let importeTotal = 0;
    items.map((e) => {
        importeTotal = importeTotal + e.precio;
    });
    
    if (items.length < 1) {
        console.error("no tenes items cargados");
        return;
    }

    const { latitud, longitud } = await obtenerUbicacionPedido();
    
    try {
        await grabarCabezaPreventaEnBDD(
            numero,
            nota,
            cliente,
            items.length,
            importeTotal,
            vendedor,
            sucursal,
            latitud,
            longitud
        );
        await grabarItemsPreventaEnBDD(numero, items);
        limpiarPreventaDeStorage();
        mas1NexPreventa();
    } catch (error) {
        console.error('Error al grabar preventa en la base de datos:', error);
        throw error;
    }
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

// busco ITEMS desde sqlite y preparo el json para mandar a la api
const buscarItemsPreventaEnBDD = async (numeroPreventa) => {
    try {
        const rows = db.getAllSync('SELECT * FROM preventaItem WHERE idPreventa = ?', [numeroPreventa]);
        const items = [];
        
        rows.forEach((row) => {
            console.log("mirando el contenido de ROW:", row);
            
            // Calcular PrecioUnitario de forma segura
            let precioUnitario = 0;
            if (row.cantidad > 0) {
                precioUnitario = row.importe / row.cantidad;
            }
            
            //adapto la respuesta al JSON de la API
            let itemObjet = {
                CodigoArticulo: row.articulo,
                Cantidad: row.cantidad,
                PrecioUnitario: precioUnitario,
                PrecioLista: row.precioLista || 0,
                PorcentajeBonificacion: row.porcentajeBonificacion || 0,
                iva: row.iva || 0,
            };
            items.push(itemObjet);
            console.log("mirando el item creado:", itemObjet);
        });
        
        console.log("items busc: . ", items);
        return items;
    } catch (error) {
        console.error('Error al buscar items de preventa en la BDD:', error);
        throw error;
    }
};

const asyncPreventasBDDToArray = async () => {
    let sucursal = await configuracionSucursal();
    let vendedorCodigo = await configuracionVendedor();
    
    try {
        const rows = db.getAllSync(
            'SELECT preventaCabeza.cantidadItems, preventaCabeza.vendedor, preventaCabeza.observacion, preventaCabeza.fecha, preventaCabeza.latitud, preventaCabeza.longitud, preventaCabeza.id as DocumentoNumero, clientes.id as ClienteCodigo, clientes.descripcion as ClienteDescripcion, preventaCabeza.importetotal as ImporteTotal FROM preventaCabeza JOIN clientes ON preventaCabeza.cliente = clientes.id ORDER BY preventaCabeza.id DESC'
        );
        
        const preventasArray = rows.map((row) => {
            //adapto la respuesta al JSON de la API
            return {
                DocumentoTipo: "PRV",
                DocumentoSucursal: sucursal.substring(0, 4),
                DocumentoNumero: row.DocumentoNumero,
                Fecha: row.fecha,
                FechaHoraEnvio: row.fecha,
                ClienteCodigo: row.ClienteCodigo,
                ClienteDescripcion: row.ClienteDescripcion,
                VendedorCodigo: vendedorCodigo,
                ImporteTotal: row.ImporteTotal,
                Cant_items: row.cantidadItems,
                Observacion: row.observacion,
                ListaNumero: 1,
                ImporteBonificado: 0,
                PagoTipo: "CC",
                Latitud: row.latitud ?? null,
                Longitud: row.longitud ?? null,
                items: []
            };
        });
        
        return preventasArray;
    } catch (error) {
        console.error('Error al leer preventas:', error);
        throw error;
    }
};

const preventasBDDToArray = async () => {
    try {
        let preventasArray = await asyncPreventasBDDToArray(); //cabeza
        //le tengo que agregar los items
        for (let i = 0; i < preventasArray.length; i++) {
            let preventa = preventasArray[i];
            preventa.items = await buscarItemsPreventaEnBDD(preventa.DocumentoNumero);
        }
        return preventasArray;
    } catch (error) {
        console.error('Error al obtener preventas:', error);
        return []; // En caso de error, devuelve un array vacío
    }
};

const borrarContenidoPreventasEnBDD = async () => {
    try {
        db.withTransactionSync(() => {
            // Borrar todos los registros de la tabla preventaItem
            const resultItem = db.runSync('DELETE FROM preventaItem');
            console.log('Registros eliminados de preventaItem:', resultItem.changes);
            
            // Borrar todos los registros de la tabla preventaCabeza
            const resultCabeza = db.runSync('DELETE FROM preventaCabeza');
            console.log('Registros eliminados de preventaCabeza:', resultCabeza.changes);
        });
    } catch (error) {
        console.error('Error al eliminar registros:', error);
        throw error;
    }
};

const borrarPreventaYSusItems = async (numeroPreventa) => {
    try {
        db.withTransactionSync(() => {
            // Borrar los items de la preventa
            const resultItems = db.runSync('DELETE FROM preventaItem WHERE idPreventa = ?', [numeroPreventa]);
            console.log(`Eliminados ${resultItems.changes} items de la preventa ${numeroPreventa}`);

            // Borrar la cabeza de la preventa
            const resultCabeza = db.runSync('DELETE FROM preventaCabeza WHERE id = ?', [numeroPreventa]);
            console.log(`Eliminada la preventa ${numeroPreventa}`);
        });
    } catch (error) {
        console.error('Error al eliminar preventa:', error);
        throw error;
    }
};

// Función para limpiar artículos inválidos de una preventa
const limpiarArticulosInvalidos = async (numeroPreventa) => {
    try {
        db.withTransactionSync(() => {
            // Eliminar artículos con códigos inválidos
            const resultDelete = db.runSync(
                'DELETE FROM preventaItem WHERE idPreventa = ? AND (articulo = "000NaN" OR articulo IS NULL OR articulo = "")',
                [numeroPreventa]
            );
            console.log(`Artículos inválidos eliminados de preventa ${numeroPreventa}:`, resultDelete.changes);
            
            // Recalcular el importe total y cantidad de items
            const resultCalc = db.getFirstSync(
                'SELECT COUNT(*) as cantidadItems, SUM(importe) as importeTotal FROM preventaItem WHERE idPreventa = ?',
                [numeroPreventa]
            );
            
            const cantidadItems = resultCalc?.cantidadItems || 0;
            const importeTotal = resultCalc?.importeTotal || 0;
            
            // Actualizar la cabeza de la preventa
            db.runSync(
                'UPDATE preventaCabeza SET cantidadItems = ?, importetotal = ? WHERE id = ?',
                [cantidadItems, importeTotal, numeroPreventa]
            );
            console.log(`Preventa ${numeroPreventa} actualizada: ${cantidadItems} items, $${importeTotal}`);
            
            return { cantidadItems, importeTotal };
        });
    } catch (error) {
        console.error('Error al limpiar artículos inválidos:', error);
        throw error;
    }
};

export { syncPreventas, grabarPreventaEnBDD, preventasBDDToArray, borrarContenidoPreventasEnBDD, borrarPreventaYSusItems, validarPreventaParaEnvio, limpiarArticulosInvalidos };
