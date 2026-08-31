# acceso_osvi - Google Sheet

## 1. Crear la hoja

Crear un Google Spreadsheet con dos pestañas:

### Pestaña `usuarios` (fila 1 = encabezados)

```
codigo_vendedor | clave | nombre | empresa_codigo | endpoint | sucursal | cantidad_maxima_articulos | filtrar_clientes_por_vendedor | usa_geolocalizacion | siguiente_preventa | activo | created_at
```

### Pestaña `empresas` (fila 1 = encabezados)

```
empresa_codigo | nombre | endpoint_default | sucursal_default | cantidad_maxima_articulos | filtrar_clientes_por_vendedor | usa_geolocalizacion | siguiente_preventa
```

Ejemplo fila TEST:

```
TEST | Empresa Test | https://novak-dist.janus314.com.ar/ | 0003 | 18 | TRUE | TRUE | 100
```

## 2. Apps Script y vincular la hoja

**Importante:** el script debe crearse **desde la hoja** (Extensiones > Apps Script). Así queda ligado al spreadsheet.

### Paso a paso

1. Abrí tu Google Sheet `acceso_osvi`
2. **Extensiones > Apps Script**
3. Pegá el contenido de `AppsScript.gs`
4. Configurá `TOKEN` = mismo valor que `accesoOsviToken` en `src/constantes/constantes.js`
5. **Vincular hoja y crear plantillas (obligatorio):**
   - Elegí la función **`vincularHojaAlScript`** (también crea pestaña `empresas` con fila TEST si falta)
   - Clic en **Ejecutar** (▶) y autorizá permisos
   - Alternativa: ejecutar solo **`inicializarPlantillas`** si ya vinculaste antes
6. **Implementar > Nueva implementación > Aplicación web**
   - Ejecutar como: **Yo**
   - Acceso: **Cualquier persona**
7. Copiá la URL `/exec` del Web App a `accesoOsviSheetUrl` en constantes.js

### Verificar vinculación

Abrí la URL del Web App en el navegador. Debe responder algo como:

```json
{
  "ok": true,
  "servicio": "acceso_osvi",
  "spreadsheetId": "...",
  "nombreHoja": "acceso_osvi",
  "pestañas": ["usuarios", "empresas"]
}
```

Si dice `"Hoja no vinculada"`, volvé al paso 5 y ejecutá `vincularHojaAlScript()`.

**Alternativa manual:** pegar el ID de la hoja en `SPREADSHEET_ID` dentro de `AppsScript.gs`  
(ID en la URL: `.../spreadsheets/d/ESTE_ID/edit`)

## 3. Errores frecuentes

### Error 403 desde la app

1. **Implementar > Administrar implementaciones** → editar la activa
2. **Ejecutar como:** Yo | **Quién tiene acceso:** Cualquier persona
3. Guardar y volver a **implementar** (nueva versión si cambiaste el script)

La app envía POST con `Content-Type: text/plain`.

### Error "Empresa no configurada TEST"

Falta la fila TEST en la pestaña **`empresas`**. Solución:

1. En Apps Script ejecutá **`inicializarPlantillas`** (con la Sheet abierta)
2. O agregá manualmente en pestaña `empresas`:

```
TEST | Empresa Test | https://novak-dist.janus314.com.ar/ | 0003 | 18 | TRUE | TRUE | 100
```

3. Volvé a **implementar** el Web App

La columna debe llamarse **`empresa_codigo`** (fila 1 = encabezados).

### Error getSheetByName / getActiveSpreadsheet null

El Web App **no** ve la hoja activa. Ejecutá **`vincularHojaAlScript()`** una vez (paso 5 arriba) y volvé a implementar.

## 4. Gestión manual

- Nuevo registro desde la app → fila en empresa **TEST**
- Para mover a cliente real: editar `empresa_codigo`, `endpoint` y `sucursal` en la Sheet
- El vendedor toca **Actualizar acceso** en Configuración cuando tenga internet

La app valida claves al registrarse: **mínimo 8 caracteres** y **al menos un símbolo** (ej. `! @ # $`).

## 5. Acciones del Web App (POST JSON)

```json
{ "token": "...", "action": "login", "codigo_vendedor": "0001", "clave": "1234" }
{ "token": "...", "action": "registro", "codigo_vendedor": "0001", "clave": "1234", "nombre": "Juan" }
{ "token": "...", "action": "refresh", "codigo_vendedor": "0001", "clave": "1234" }
{ "token": "...", "action": "update_siguiente_preventa", "codigo_vendedor": "0001", "clave": "1234", "siguiente_preventa": 105 }
```

Tras enviar preventas desde la app, se llama automáticamente a `update_siguiente_preventa` para mantener la numeración en la Sheet alineada con el dispositivo.
