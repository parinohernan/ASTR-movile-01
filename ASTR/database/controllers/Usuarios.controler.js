import { db } from "../database";

const handleLogs = (logs, mensaje, setLogs) => {
  console.log("haldlerLogs UsersControler", mensaje);
  setLogs([...logs, mensaje]);
  return [...logs, mensaje];
};

const insertUsuariosFromAPI = (data, logs, setLogs) => {
  logs = handleLogs(
    logs,
    "Verificando y creando tabla usuarios si no existe...",
    setLogs
  );

  try {
    db.withTransactionSync(() => {
      // Verificar y crear la tabla usuarios si no existe
      db.execSync("CREATE TABLE IF NOT EXISTS usuarios (id TEXT PRIMARY KEY, descripcion TEXT, clave TEXT)");
      logs = handleLogs(
        logs,
        "Tabla usuarios verificada/creada exitosamente",
        setLogs
      );

      // Insertar datos en la tabla usuarios
      data.forEach((item) => {
        try {
          const result = db.runSync(
            "INSERT OR REPLACE INTO usuarios (id, descripcion, clave) VALUES (?, ?, ?)",
            [item.codigo, item.descripcion, item.clave]
          );
          console.log("Usuario insertado con ID: ", result.lastInsertRowId);
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
    });

    handleLogs(logs, "Transacción completada exitosamente", setLogs);
    return Promise.resolve();
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
