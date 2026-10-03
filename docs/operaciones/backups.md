# Estrategia y Operación de Respaldos de PostgreSQL 16 — Allabout.skin

**Versión:** 1.0 (Entorno de Producción Local & Contingencia)  
**Base de Datos Principal:** `allaboutskin` (PostgreSQL 16 en `127.0.0.1:5432`)  
**Directorio por defecto:** `%USERPROFILE%\Backups\allaboutskin`  

---

## 1. Resumen Ejecutivo de la Estrategia

Para mitigar riesgos asociados a cortes de energía eléctrica o fallos en el nodo local, se implementa una política de copias de seguridad automáticas:
- **Herramienta:** `pg_dump` con formato comprimido custom (`-Fc`). Este formato incluye compresión zlib nativa, metadatos y permite restauración selectiva o total mediante `pg_restore`.
- **Frecuencia:** Diaria a las 02:00 AM (hora local Venezuela).
- **Retención:** Se mantienen los últimos **14 respaldos** de forma rotativa; los dumps anteriores se depuran automáticamente.
- **Seguridad de Credenciales:** La contraseña nunca se escribe en argumentos de consola, logs ni variables permanentes. Se transmite únicamente dentro del hilo de ejecución mediante la variable de entorno transitoria `PGPASSWORD`.

---

## 2. Advertencia Crítica de Seguridad Operativa

> [!WARNING]
> **UN RESPALDO GUARDADO ÚNICAMENTE EN LA MISMA COMPUTADORA NO ES UN RESPALDO SEGURO.**  
> Si la laptop sufre daño físico, robo, sobretensión eléctrica o fallo irreversible de disco duro, se perderán simultáneamente la base de datos viva y las copias locales.
> 
> **Medidas obligatorias de redundancia externa:**
> 1. Sincronizar periódicamente la carpeta `%USERPROFILE%\Backups\allaboutskin` hacia un almacenamiento en la nube (p. ej., Google Drive, OneDrive, Mega o bucket S3 privado mediante herramientas como `rclone`).
> 2. O copiar manualmente los archivos `.dump` hacia una unidad USB / disco duro externo al menos una vez por semana.

---

## 3. Scripts Disponibles en `scripts/backup/`

### A. Generación de Respaldo (`backup-db.ps1`)
Genera un nuevo archivo de respaldo con estampilla de tiempo (`allaboutskin_YYYYMMDD_HHmmss.dump`), aplica rotación y registra el evento en `backup.log`.

**Ejecución manual:**
```powershell
pwsh -ExecutionPolicy Bypass -File scripts/backup/backup-db.ps1
```

**Parámetros opcionales:**
- `-DestinationDir "D:\MisRespaldos"`: Define una carpeta de destino personalizada.
- `-RetentionCount 30`: Ajusta la cantidad de copias a conservar (por defecto 14).

---

### B. Prueba de Restauración y Validación de Integridad (`restore-test.ps1`)
Restaura el respaldo más reciente (o uno indicado) en una base de datos temporal aislada llamada `allaboutskin_restore_test`.
- **Garantía de Aislamiento:** **Nunca escribe ni modifica la base de datos `allaboutskin`**.
- **Comprobación:** Extrae los conteos de filas de tablas críticas (`users`, `products`) en ambas bases y verifica que la coincidencia sea del 100%.
- **Limpieza:** Al finalizar la comprobación, la base de datos temporal se destruye automáticamente para no consumir espacio innecesario.

**Ejecución:**
```powershell
pwsh -ExecutionPolicy Bypass -File scripts/backup/restore-test.ps1
```

---

### C. Registro en el Programador de Tareas de Windows (`register-task.ps1`)
Configura una tarea programada para que el respaldo se ejecute automáticamente todos los días a las 02:00 AM.
- **Opción de Resiliencia (`StartWhenAvailable`):** Si la laptop estaba apagada o sin batería a las 02:00 AM, Windows ejecutará el respaldo automáticamente tan pronto como la máquina se encienda.

**Para ver la configuración sin aplicar cambios:**
```powershell
pwsh -ExecutionPolicy Bypass -File scripts/backup/register-task.ps1
```

**Para registrar la tarea en Windows (se recomienda ejecutar en consola como Administrador):**
```powershell
pwsh -ExecutionPolicy Bypass -File scripts/backup/register-task.ps1 -Execute
```

---

## 4. Procedimiento de Restauración ante Desastres (Disaster Recovery)

Si fuese necesario restaurar la base de datos `allaboutskin` en una instalación limpia o tras una contingencia:

1. Asegurarse de que el servicio PostgreSQL esté activo.
2. Localizar el dump más reciente (por ejemplo, `allaboutskin_20261003_154500.dump`).
3. Crear o limpiar la base de datos destino:
   ```powershell
   psql -h 127.0.0.1 -U postgres -d postgres -c "CREATE DATABASE allaboutskin;"
   ```
4. Ejecutar la restauración con `pg_restore`:
   ```powershell
   $env:PGPASSWORD = "TU_CONTRASEÑA"
   pg_restore -h 127.0.0.1 -p 5432 -U postgres -d allaboutskin --no-owner --no-privileges "C:\Users\tu-usuario\Backups\allaboutskin\allaboutskin_YYYYMMDD_HHmmss.dump"
   $env:PGPASSWORD = $null
   ```
5. Verificar el estado del servicio:
   ```powershell
   php artisan tinker --execute="echo 'Usuarios: ' . App\Models\User::count() . ' | Productos: ' . App\Models\Product::count();"
   ```
