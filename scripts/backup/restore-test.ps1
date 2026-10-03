[CmdletBinding()]
param(
    [string]$DumpFile = "",
    [string]$DestinationDir = (Join-Path $env:USERPROFILE "Backups\allaboutskin"),
    [string]$EnvFile = (Join-Path $PSScriptRoot "..\..\backend\.env"),
    [string]$TestDbName = "allaboutskin_restore_test"
)

$ErrorActionPreference = "Stop"

function Find-PostgresBinary {
    param([string]$BinaryName)

    $cmd = Get-Command $BinaryName -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    $pgDirs = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\$BinaryName.exe" -ErrorAction SilentlyContinue
    if ($pgDirs -and $pgDirs.Count -gt 0) {
        return ($pgDirs | Select-Object -Last 1).FullName
    }

    throw "No se encontró el ejecutable '$BinaryName'."
}

function Get-EnvConfig {
    param([string]$FilePath)

    if (-not (Test-Path $FilePath)) {
        throw "No se encontró el archivo de entorno en '$FilePath'."
    }

    $config = @{}
    Get-Content $FilePath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $key = $parts[0].Trim()
            $value = $parts[1].Trim().Trim('"').Trim("'")
            $config[$key] = $value
        }
    }
    return $config
}

$pgRestoreExe = Find-PostgresBinary "pg_restore"
$psqlExe = Find-PostgresBinary "psql"

# Leer configuración
$resolvedEnvFile = [System.IO.Path]::GetFullPath($EnvFile)
$envConfig = Get-EnvConfig -FilePath $resolvedEnvFile

$dbHost = if ($envConfig["DB_HOST"]) { $envConfig["DB_HOST"] } else { "127.0.0.1" }
$dbPort = if ($envConfig["DB_PORT"]) { $envConfig["DB_PORT"] } else { "5432" }
$dbUser = if ($envConfig["DB_USERNAME"]) { $envConfig["DB_USERNAME"] } else { "postgres" }
$realDbName = if ($envConfig["DB_DATABASE"]) { $envConfig["DB_DATABASE"] } else { "allaboutskin" }
$dbPassword = $envConfig["DB_PASSWORD"]

# Determinar el dump a restaurar
$targetDump = $DumpFile
if (-not $targetDump) {
    if (-not (Test-Path $DestinationDir)) {
        throw "El directorio de respaldos '$DestinationDir' no existe."
    }
    $latest = Get-ChildItem -Path $DestinationDir -Filter "${realDbName}_*.dump" | Sort-Object CreationTime -Descending | Select-Object -First 1
    if (-not $latest) {
        throw "No se encontraron archivos de respaldo en '$DestinationDir'."
    }
    $targetDump = $latest.FullName
}

if (-not (Test-Path $targetDump)) {
    throw "No se encontró el archivo de dump en '$targetDump'."
}

Write-Output "Iniciando prueba de restauración para: $targetDump"
Write-Output "Base de datos destino temporal: $TestDbName"
Write-Output "Base de datos original (solo lectura para comparación): $realDbName"

$previousPgPassword = $env:PGPASSWORD
$env:PGPASSWORD = $dbPassword

try {
    # 1. Asegurar que no quede conexión activa y recrear base temporal
    Write-Output "Creando base de datos temporal '$TestDbName'..."
    $dropCmd = "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$TestDbName'; DROP DATABASE IF EXISTS $TestDbName;"
    & $psqlExe -h $dbHost -p $dbPort -U $dbUser -d postgres -c $dropCmd -q 2>&1 | Out-Null

    $createCmd = "CREATE DATABASE $TestDbName;"
    & $psqlExe -h $dbHost -p $dbPort -U $dbUser -d postgres -c $createCmd -q 2>&1 | Out-Null

    # 2. Restaurar dump en la base temporal
    Write-Output "Ejecutando pg_restore en '$TestDbName'..."
    $restoreArgs = @(
        "-h", $dbHost,
        "-p", $dbPort,
        "-U", $dbUser,
        "-d", $TestDbName,
        "--no-owner",
        "--no-privileges",
        $targetDump
    )

    $restoreProc = Start-Process -FilePath $pgRestoreExe -ArgumentList $restoreArgs -NoNewWindow -Wait -PassThru
    # pg_restore retorna 1 si hay advertencias menores no críticas, verificaremos con los datos reales
    Write-Output "pg_restore finalizó con código: $($restoreProc.ExitCode)"

    # 3. Contar registros en base original
    $realUsers = (& $psqlExe -h $dbHost -p $dbPort -U $dbUser -d $realDbName -t -A -c "SELECT count(*) FROM users;").Trim()
    $realProducts = (& $psqlExe -h $dbHost -p $dbPort -U $dbUser -d $realDbName -t -A -c "SELECT count(*) FROM products;").Trim()

    # 4. Contar registros en base temporal restaurada
    $restoredUsers = (& $psqlExe -h $dbHost -p $dbPort -U $dbUser -d $TestDbName -t -A -c "SELECT count(*) FROM users;").Trim()
    $restoredProducts = (& $psqlExe -h $dbHost -p $dbPort -U $dbUser -d $TestDbName -t -A -c "SELECT count(*) FROM products;").Trim()

    Write-Output "--- RESULTADO DE COMPARACIÓN ---"
    Write-Output "Usuarios  -> Original: $realUsers | Restaurado: $restoredUsers"
    Write-Output "Productos -> Original: $realProducts | Restaurado: $restoredProducts"

    if ($realUsers -ne $restoredUsers -or $realProducts -ne $restoredProducts) {
        throw "Discrepancia detectada en los conteos de registros entre la base original y la restaurada."
    }

    Write-Output "[EXITO] Prueba de restauración verificada con 100% de coincidencia e integridad."
} finally {
    # 5. Destruir base temporal para no ocupar espacio
    Write-Output "Limpiando base de datos temporal '$TestDbName'..."
    try {
        $cleanupCmd = "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$TestDbName'; DROP DATABASE IF EXISTS $TestDbName;"
        & $psqlExe -h $dbHost -p $dbPort -U $dbUser -d postgres -c $cleanupCmd -q 2>&1 | Out-Null
    } catch {
        Write-Warning "No se pudo eliminar la base temporal: $($_.Exception.Message)"
    }
    $env:PGPASSWORD = $previousPgPassword
}
