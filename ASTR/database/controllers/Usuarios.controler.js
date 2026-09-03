import { db } from "../database";

const ROL_VENDEDOR = 'vendedor';
const ROL_AUDITOR = 'auditor';

const handleLogs = (logs, mensaje, setLogs) => {
  console.log("haldlerLogs UsersControler", mensaje);
  setLogs([...logs, mensaje]);
  return [...logs, mensaje];
};

const normalizarRol = (rol) =>
  String(rol || ROL_VENDEDOR).trim().toLowerCase() === ROL_AUDITOR
    ? ROL_AUDITOR
    : ROL_VENDEDOR;

const insertUsuariosFromAPI = (data, logs, setLogs, options = {}) => {
  const { fullSync = false } = options;
  let usuariosProcesados = 0;
  let usuariosEliminados = 0;

  logs = handleLogs(
    logs,
    "Verificando y creando tabla usuarios si no existe...",
    setLogs
  );

  try {
    db.withTransactionSync(() => {
      db.execSync(
        "CREATE TABLE IF NOT EXISTS usuarios (id TEXT PRIMARY KEY, descripcion TEXT, clave TEXT, empresa_codigo TEXT, rol TEXT DEFAULT 'vendedor')"
      );
      logs = handleLogs(
        logs,
        "Tabla usuarios verificada/creada exitosamente",
        setLogs
      );

      const codigosEnDB = new Set();
      if (fullSync) {
        const rows = db.getAllSync("SELECT id FROM usuarios");
        rows.forEach((row) => codigosEnDB.add(String(row.id)));
      }

      data.forEach((item) => {
        try {
          const codigo = String(item.codigo || item.id);
          const empresaCodigo = item.empresa_codigo
            ? String(item.empresa_codigo).trim().toUpperCase()
            : null;
          const rol = normalizarRol(item.rol);

          db.runSync(
            "INSERT OR REPLACE INTO usuarios (id, descripcion, clave, empresa_codigo, rol) VALUES (?, ?, ?, ?, ?)",
            [codigo, item.descripcion, item.clave, empresaCodigo, rol]
          );
          usuariosProcesados++;
          if (fullSync) {
            codigosEnDB.delete(codigo);
          }
        } catch (error) {
          console.log(
            "Error al insertar usuario: ",
            error,
            item.codigo,
            item.descripcion,
            item.clave
          );
          logs = handleLogs(
            logs,
            "Error al insertar usuario: " + error.message + " " + item.descripcion,
            setLogs
          );
        }
      });

      if (fullSync) {
        codigosEnDB.forEach((codigo) => {
          try {
            db.runSync("DELETE FROM usuarios WHERE id = ?", [codigo]);
            usuariosEliminados++;
          } catch (error) {
            console.log("Error al eliminar usuario:", codigo, error);
            logs = handleLogs(
              logs,
              "Error al eliminar usuario: " + error.message + " " + codigo,
              setLogs
            );
          }
        });
      }
    });

    if (fullSync) {
      handleLogs(
        logs,
        `Sincronización de vendedores: ${usuariosProcesados} procesados, ${usuariosEliminados} eliminados`,
        setLogs
      );
    } else {
      handleLogs(logs, "Transacción completada exitosamente", setLogs);
    }

    return Promise.resolve({ usuariosProcesados, usuariosEliminados });
  } catch (error) {
    handleLogs(logs, "Error en la transacción: " + error.message, setLogs);
    return Promise.reject(error);
  }
};

const eliminarUsuariosVendedores = () => {
  try {
    db.runSync("DELETE FROM usuarios WHERE rol IS NULL OR rol != ?", [ROL_AUDITOR]);
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

const getUsuarios = () => {
  try {
    const usuarios = db.getAllSync("SELECT * FROM usuarios");
    return Promise.resolve(usuarios || []);
  } catch (error) {
    console.log("Error al obtener usuarios:", error);
    return Promise.resolve([]);
  }
};

const getUsuarioPorId = (vendedorId) => {
  try {
    const rows = db.getAllSync("SELECT * FROM usuarios WHERE id = ?", [
      String(vendedorId),
    ]);
    return rows[0] || null;
  } catch (error) {
    console.warn("No se pudo obtener usuario:", error);
    return null;
  }
};

const getClaveVendedor = (vendedorId) => {
  try {
    const rows = db.getAllSync("SELECT clave FROM usuarios WHERE id = ?", [
      String(vendedorId),
    ]);
    return rows[0]?.clave || null;
  } catch (error) {
    console.warn("No se pudo obtener clave del vendedor:", error);
    return null;
  }
};

const insertUsuariosPrueba = () => {
  try {
    db.withTransactionSync(() => {
      const usuariosPrueba = [
        { id: "1", descripcion: "Hernan Parino", clave: "1234", empresa_codigo: "TEST", rol: ROL_VENDEDOR },
        { id: "2", descripcion: "Usuario Test", clave: "5678", empresa_codigo: "TEST", rol: ROL_VENDEDOR },
        { id: "3", descripcion: "Admin Demo", clave: "9999", empresa_codigo: "TEST", rol: ROL_VENDEDOR },
      ];

      usuariosPrueba.forEach((usuario) => {
        db.runSync(
          "INSERT OR REPLACE INTO usuarios (id, descripcion, clave, empresa_codigo, rol) VALUES (?, ?, ?, ?, ?)",
          [usuario.id, usuario.descripcion, usuario.clave, usuario.empresa_codigo, usuario.rol]
        );
      });
    });
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

export {
  insertUsuariosFromAPI,
  getUsuarios,
  getUsuarioPorId,
  getClaveVendedor,
  eliminarUsuariosVendedores,
  insertUsuariosPrueba,
  ROL_AUDITOR,
  ROL_VENDEDOR,
};
