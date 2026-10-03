[CmdletBinding()]
param(
    [string]$ConfigFile = (Join-Path $PSScriptRoot "config.yml")
)

$ErrorActionPreference = "Stop"

function Find-Cloudflared {
    # 1. Comprobar en el PATH del sistema
    $cmd = Get-Command "cloudflared" -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    # 2. Rutas comunes de instalación en Windows
    $commonPaths = @(
        "C:\Program Files\cloudflared\cloudflared.exe",
        "C:\Program Files (x86)\cloudflared\cloudflared.exe",
        (Join-Path $env:LOCALAPPDATA "Programs\cloudflared\cloudflared.exe"),
        "C:\tools\cloudflared\cloudflared.exe"
    )

    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            return $path
        }
    }

    return $null
}

Write-Output "=========================================================="
Write-Output " Allabout.skin - Inicializador de Cloudflare Tunnel"
Write-Output "=========================================================="

# 1. Localizar binario de cloudflared
$cloudflaredExe = Find-Cloudflared

if (-not $cloudflaredExe) {
    Write-Error @"
[ERROR] No se encontró el binario 'cloudflared' en el sistema.

Para instalar Cloudflare Tunnel en Windows:
  Opción A (Recomendada con winget):
    winget install --id Cloudflare.cloudflared

  Opción B (Descarga directa oficial):
    Descarga 'cloudflared-windows-amd64.exe' desde:
    https://github.com/cloudflare/cloudflared/releases/latest
    y colócalo en 'C:\Program Files\cloudflared\cloudflared.exe' o en tu PATH.
"@
    exit 1
}

Write-Output "Binario cloudflared detectado en: $cloudflaredExe"

# 2. Validar archivo de configuración
$resolvedConfig = [System.IO.Path]::GetFullPath($ConfigFile)
$exampleConfig = Join-Path $PSScriptRoot "config.example.yml"

if (-not (Test-Path $resolvedConfig)) {
    Write-Error @"
[ERROR] No se encontró el archivo de configuración en:
  $resolvedConfig

Pasos requeridos:
  1. Copia el archivo de plantilla:
     Copy-Item '$exampleConfig' '$resolvedConfig'
  2. Abre '$resolvedConfig' y coloca tu UUID de túnel, ruta de credenciales y tu dominio real.
  3. Vuelve a ejecutar este script.
"@
    exit 1
}

# 3. Comprobar que no contenga placeholders sin reemplazar
$configContent = Get-Content -Path $resolvedConfig -Raw
if ($configContent -match "TU-TUNNEL-UUID-AQUI" -or $configContent -match "api\.tu-dominio\.com") {
    Write-Warning "El archivo de configuración todavía contiene placeholders de ejemplo ('TU-TUNNEL-UUID-AQUI' o 'api.tu-dominio.com')."
    Write-Warning "Asegúrate de configurar los valores reales antes de poner el túnel en marcha."
}

# 4. Iniciar túnel
Write-Output "Iniciando túnel con archivo de configuración: $resolvedConfig"
Write-Output "Presiona Ctrl+C para detener el túnel en cualquier momento."
Write-Output "----------------------------------------------------------"

try {
    & $cloudflaredExe tunnel --config $resolvedConfig run
} catch {
    Write-Error "Error durante la ejecución del túnel: $($_.Exception.Message)"
    exit 1
}
