import { db } from "../database";

const handleLogs = (logs, mensaje, setLogs) => {
  console.log("haldlerLogs UsersControler", mensaje);
  setLogs([...logs, mensaje]);
  return [...logs, mensaje];
};

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
      db.execSync("CREATE TABLE IF NOT EXISTS usuarios (id TEXT PRIMARY KEY, descripcion TEXT, clave TEXT)");
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
          const codigo = String(item.codigo);
          db.runSync(
            "INSERT OR REPLACE INTO usuarios (id, descripcion, clave) VALUES (?, ?, ?)",
            [codigo, item.descripcion, item.clave]
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

const getUsuarios = () => {
  try {
    console.log("traigo los usuarios de la api");
    const usuarios = db.getAllSync("SELECT * FROM usuarios");
    console.log("Usuarios obtenidos:", usuarios);
    return Promise.resolve(usuarios || []);
  } catch (error) {
    console.log("Error al obtener usuarios:", error);
    // Si hay error, retornar array vacío en lugar de rechazar
    return Promise.resolve([]);
  }
};

const insertUsuariosPrueba = () => {
  try {
    console.log("Insertando usuarios de prueba");
    db.withTransactionSync(() => {
      // Insertar algunos usuarios de prueba
      const usuariosPrueba = [
        { id: "1", descripcion: "Hernan Parino", clave: "1234" },
        { id: "2", descripcion: "Usuario Test", clave: "5678" },
        { id: "3", descripcion: "Admin Demo", clave: "9999" },
      ];

      usuariosPrueba.forEach((usuario) => {
        try {
          db.runSync(
            "INSERT OR REPLACE INTO usuarios (id, descripcion, clave) VALUES (?, ?, ?)",
            [usuario.id, usuario.descripcion, usuario.clave]
          );
          console.log("Usuario de prueba insertado: ", usuario.descripcion);
        } catch (error) {
          console.log("Error al insertar usuario de prueba: ", error);
        }
      });
    });

    console.log("Usuarios de prueba insertados exitosamente");
    return Promise.resolve();
  } catch (error) {
    console.error("Error en transacción de usuarios de prueba:", error);
    return Promise.reject(error);
  }
};

export { insertUsuariosFromAPI, getUsuarios, insertUsuariosPrueba };
