# Guía Operativa: Cloudflare Tunnel, Despliegue Local y Monitoreo de Contingencia

**Proyecto:** Allabout.skin (Backend Laravel 12 + Frontend Next.js 16)  
**Versión:** 1.0 (Entorno de Validación Comercial & Producción Local en Venezuela)  
**Objetivo:** Exponer de forma segura, cifrada y gratuita la API del backend que corre en la laptop local hacia el frontend desplegado en Vercel (o dispositivos móviles de prueba), sin abrir puertos en el router hogareño ni requerir IP pública fija.

---

## 1. Arquitectura de Conexión

```
┌─────────────────────────────────┐        HTTPS        ┌───────────────────────────────┐
│     Frontend en Vercel / PWA     ├────────────────────► Cloudflare Edge Global Network│
│   (https://allaboutskin.app)    │                     │   (api.tu-dominio.com)        │
└─────────────────────────────────┘                     └───────────────┬───────────────┘
                                                                        │ Túnel Saliente Cifrado
                                                                        │ (Quick / Argo Tunnel)
                                                                        ▼
                                                        ┌───────────────────────────────┐
                                                        │  cloudflared (Servicio Windows)│
                                                        │   en Laptop de Desarrollo     │
                                                        └───────────────┬───────────────┘
                                                                        │ localhost:8000
                                                        ┌───────────────▼───────────────┐
                                                        │      Backend Laravel 12       │
                                                        │   + PostgreSQL 16 (Local)     │
                                                        └───────────────────────────────┘
```

---

## 2. Paso a Paso: Configuración de Cloudflare Tunnel en Windows

### Paso 1: Instalación de `cloudflared`
Abre una terminal PowerShell y ejecuta:

```powershell
# Opción recomendada mediante el gestor de paquetes de Windows:
winget install --id Cloudflare.cloudflared
```

*Alternativa manual:* Descarga el ejecutable `cloudflared-windows-amd64.exe` desde el repositorio oficial de GitHub (`https://github.com/cloudflare/cloudflared/releases/latest`), renómbralo a `cloudflared.exe` y colócalo en una ruta accesible en el `PATH` (p. ej., `C:\Program Files\cloudflared\`).

Verifica la instalación:
```powershell
cloudflared --version
```

---

### Paso 2: Autenticación de la Cuenta Cloudflare
Ejecuta el comando de inicio de sesión:

```powershell
cloudflared tunnel login
```

Este comando abrirá automáticamente tu navegador web para que inicies sesión en tu cuenta de Cloudflare y selecciones el dominio en el que deseas enrutar el tráfico (p. ej., `tu-dominio.com`).  
Al autorizar el dominio, se descargará un certificado criptográfico en `%USERPROFILE%\.cloudflared\cert.pem`.

---

### Paso 3: Creación del Túnel
Crea un túnel con un nombre identificativo para el backend:

```powershell
cloudflared tunnel create allaboutskin-backend
```

La consola mostrará una salida con el **UUID del túnel** (un identificador alfanumérico como `a1b2c3d4-e5f6-7890-abcd-ef0123456789`) y creará el archivo de credenciales correspondiente en:  
`%USERPROFILE%\.cloudflared\<UUID>.json`.

---

### Paso 4: Enrutamiento DNS (Crear CNAME Automático)
Asocia un subdominio público (por ejemplo, `api.tu-dominio.com`) al túnel que acabas de crear:

```powershell
cloudflared tunnel route dns allaboutskin-backend api.tu-dominio.com
```

Cloudflare creará automáticamente un registro DNS de tipo `CNAME` apuntando `api.tu-dominio.com` hacia `<UUID>.cfargotunnel.com`.

---

### Paso 5: Creación del Archivo de Configuración (`config.yml`)
En la carpeta del proyecto `scripts/tunnel/` encontrarás la plantilla `config.example.yml`.  
Crea una copia de este archivo como `config.yml` o en `%USERPROFILE%\.cloudflared\config.yml`:

```yaml
tunnel: a1b2c3d4-e5f6-7890-abcd-ef0123456789
credentials-file: C:\Users\TU-USUARIO\.cloudflared\a1b2c3d4-e5f6-7890-abcd-ef0123456789.json

ingress:
  # Enrutamiento hacia el servidor Laravel local (puerto 8000 por defecto de artisan serve)
  - hostname: api.tu-dominio.com
    service: http://127.0.0.1:8000
    originRequest:
      connectTimeout: 30s
      noTLSVerify: false
      keepAliveTimeout: 1m30s

  # Regla catch-all obligatoria para descartar tráfico inválido
  - service: http_status:404
```

> [!NOTE]
> Puedes verificar la sintaxis de tu configuración en cualquier momento ejecutando:  
> `cloudflared tunnel ingress validate` (para ver opciones adicionales, consultar `cloudflared --help`).

---

### Paso 6: Prueba Manual del Túnel
Para iniciar el túnel de forma interactiva durante sesiones de desarrollo:

```powershell
pwsh -ExecutionPolicy Bypass -File scripts/tunnel/run-tunnel.ps1
```

O directamente con `cloudflared`:
```powershell
cloudflared tunnel --config scripts/tunnel/config.yml run
```

---

### Paso 7: Configuración como Servicio de Windows (Arranque Automático)
Para que el túnel se inicie automáticamente en segundo plano cada vez que la laptop se encienda (sin necesidad de abrir una terminal ni mantener una sesión iniciada):

1. Copia tu `config.yml` al directorio raíz del usuario: `%USERPROFILE%\.cloudflared\config.yml`.
2. Abre PowerShell como **Administrador** y ejecuta:
   ```powershell
   cloudflared service install
   Start-Service cloudflared
   ```
3. Verifica el estado del servicio:
   ```powershell
   Get-Service cloudflared
   ```

---

## 3. Matriz de Variables de Entorno y Conectividad

A continuación se detalla el valor que debe asignarse a cada variable al pasar a producción:

### En Vercel (Frontend Next.js 16)
Configurar en la consola de Vercel (*Project Settings -> Environment Variables*):

| Variable | Valor de Producción | Descripción |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://api.tu-dominio.com/api/v1` | URL base pública expuesta por el túnel hacia la API Laravel. |

---

### En la Laptop (Backend Laravel 12 en `backend/.env`)

| Variable | Valor Requerido | Justificación / Seguridad |
| :--- | :--- | :--- |
| `APP_ENV` | `production` | Activa las optimizaciones de producción y desactiva stack traces detallados. |
| `APP_DEBUG` | `false` | **CRÍTICO:** Previene la fuga de variables de base de datos, claves y fragmentos de código ante errores HTTP 500. |
| `APP_URL` | `https://api.tu-dominio.com` | Dominio canónico HTTPS de la API en producción. |
| `SANCTUM_STATEFUL_DOMAINS` | `tu-dominio.com,allaboutskin.vercel.app` | Dominios frontend autorizados para cookies de sesión o autenticación SPA. |

---

### Ajuste de CORS en `backend/config/cors.php`
El archivo actual permite `allowed_origins => ['*']`. Para endurecer la seguridad al conectar con Vercel:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => [
    'https://allaboutskin.vercel.app',
    'https://tu-dominio.com',
    'http://localhost:3000', // Para pruebas locales
],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

---

## 4. Protocolo de Resiliencia ante Contingencias Eléctricas y de Red en Venezuela

### ¿Qué sucede durante un corte eléctrico o pérdida de internet local?
1. **Frontend (Vercel):** El frontend permanece 100% en línea a nivel mundial alojado en la red edge de Vercel.
2. **Detección Automática de Reposo:**
   - Si la laptop se apaga o pierde internet, Cloudflare responde con un código de error de origen (HTTP 502/530).
   - El componente de Next.js [`OfflineStatusBanner.tsx`](file:///c:/Users/soulw/Documents/antigravity/brave-fermi/frontend/src/components/system/OfflineStatusBanner.tsx) detecta tras dos intentos fallidos que el nodo local no responde.
   - Se muestra el banner sobrio `DLG-EXEC`: *"No podemos comunicarnos con el servidor en este momento. Reintentaremos automáticamente; tu rutina guardada en este dispositivo sigue disponible."*
   - Las rutinas de *Skin Cycling*, el tocador cosmético y los tutoriales de aplicación facial continúan utilizables gracias a la memoria local (`localStorage` y assets alojados en el cliente).

### ¿Qué sucede al restablecerse el suministro eléctrico y el internet?
1. **Reinicio de la Laptop:** Windows arranca automáticamente.
2. **Servicios en Segundo Plano:**
   - El servicio `postgresql-x64-16` inicia automáticamente como servicio del sistema.
   - El servicio `cloudflared` restablece los túneles TCP/QUIC salientes hacia los servidores de Cloudflare de forma autónoma.
3. **Reanudación del Servicio:**
   - La API vuelve a responder inmediatamente con estado `200 operational`.
   - El banner del frontend desaparece automáticamente en el siguiente ciclo de sondeo (cada 30 segundos) sin que el usuario tenga que recargar la página.

### Recomendaciones de Hardware y Autonomía
- **Mini-UPS para Telecomunicaciones:** Conectar el módem de fibra óptica / router Wi-Fi a un Mini-UPS de 12V (autonomía típica de 4 a 6 horas durante cortes de energía).
- **Ajustes de Energía en la Laptop:**
  - Configurar Windows para *"No suspender al cerrar la tapa conectada a la corriente"* (*Panel de Control -> Opciones de Energía*).
  - En la BIOS de la máquina (si la placa base lo admite), activar la opción *"Restore on AC Power Loss / Power On"* para que la laptop encienda automáticamente en cuanto regrese la electricidad.

---

## 5. Monitoreo de Disponibilidad (Uptime Monitoring)

Para supervisar la disponibilidad del túnel y la salud del backend sin costo:

1. Crear una cuenta gratuita en **UptimeRobot** (`https://uptimerobot.com`) o **BetterStack** (`https://betterstack.com`).
2. Configurar un monitor de tipo **HTTP(s)**:
   - **Nombre:** `Allabout.skin Backend Node`
   - **URL:** `https://api.tu-dominio.com/api/v1/health`
   - **Intervalo de Monitoreo:** Cada 5 minutos.
   - **Códigos HTTP Esperados:** `200` (Saludable). Si devuelve `503` (base de datos o ingredientes no cargados) o no responde, el monitor enviará una notificación inmediata por correo o Telegram.

---

## 6. Checklist de Seguridad Previa a la Exposición Pública

Antes de compartir el enlace público o invitar a las primeras farmacias y comercios:

- [ ] **`APP_DEBUG=false`** confirmado en `backend/.env`.
- [ ] **`APP_KEY`** generada y única (`php artisan key:generate`).
- [ ] **PostgreSQL Aislado:** El puerto `5432` solo debe aceptar conexiones locales (`127.0.0.1`). Nunca crees reglas de reenvío de puertos (Port Forwarding) en tu router para PostgreSQL.
- [ ] **Ingress Limitado:** Cloudflare Tunnel solo debe mapear tráfico HTTP hacia el puerto del servidor web (`http://127.0.0.1:8000`).
- [ ] **Rate Limiting:** Verificar que las rutas de API públicas (`/api/v1/audit/ocr`, `/api/v1/auth/login`) mantengan middleware `throttle` para prevenir abusos.
- [ ] **Firewall de Windows:** Windows Defender Firewall activado con perfil privado/público por defecto.
- [ ] **Respaldos Activos:** Ejecutar periódicamente la prueba de restauración con `scripts/backup/restore-test.ps1`.
