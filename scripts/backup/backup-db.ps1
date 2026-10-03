[CmdletBinding()]
param(
    [string]$DestinationDir = (Join-Path $env:USERPROFILE "Backups\allaboutskin"),
    [string]$EnvFile = (Join-Path $PSScriptRoot "..\..\backend\.env"),
    [int]$RetentionCount = 14
)

$ErrorActionPreference = "Stop"

function Find-PostgresBinary {
    param([string]$BinaryName)

    # 1. Verificar si está en PATH
    $cmd = Get-Command $BinaryName -ErrorAction SilentlyContinue
    if ($cmd) {
        return $cmd.Source
    }

    # 2. Buscar en C:\Program Files\PostgreSQL\*\bin
    $pgDirs = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\$BinaryName.exe" -ErrorAction SilentlyContinue
    if ($pgDirs -and $pgDirs.Count -gt 0) {
        return ($pgDirs | Select-Object -Last 1).FullName
    }

    throw "No se encontró el ejecutable '$BinaryName'. Asegúrate de que PostgreSQL esté instalado en 'C:\Program Files\PostgreSQL\' o en el PATH."
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

$logFile = Join-Path $DestinationDir "backup.log"

function Write-BackupLog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Output $logEntry
    try {
        if (-not (Test-Path $DestinationDir)) {
            New-Item -ItemType Directory -Path $DestinationDir -Force | Out-Null
        }
        Add-Content -Path $logFile -Value $logEntry -Encoding UTF8
    } catch {
        # Si falla escribir al log, no interrumpir ejecución crítica
    }
}

try {
    Write-BackupLog "Iniciando proceso de respaldo de PostgreSQL..." "INFO"

    # Localizar pg_dump
    $pgDumpExe = Find-PostgresBinary "pg_dump"
    Write-BackupLog "Utilizando binario pg_dump en: $pgDumpExe" "INFO"

    # Leer configuración desde backend/.env
    $resolvedEnvFile = [System.IO.Path]::GetFullPath($EnvFile)
    $envConfig = Get-EnvConfig -FilePath $resolvedEnvFile

    $dbHost = if ($envConfig["DB_HOST"]) { $envConfig["DB_HOST"] } else { "127.0.0.1" }
    $dbPort = if ($envConfig["DB_PORT"]) { $envConfig["DB_PORT"] } else { "5432" }
    $dbUser = if ($envConfig["DB_USERNAME"]) { $envConfig["DB_USERNAME"] } else { "postgres" }
    $dbName = if ($envConfig["DB_DATABASE"]) { $envConfig["DB_DATABASE"] } else { "allaboutskin" }
    $dbPassword = $envConfig["DB_PASSWORD"]

    if (-not $dbPassword) {
        Write-BackupLog "Advertencia: DB_PASSWORD no está definida en $resolvedEnvFile o está vacía." "WARN"
    }

    # Asegurar directorio de destino
    if (-not (Test-Path $DestinationDir)) {
        New-Item -ItemType Directory -Path $DestinationDir -Force | Out-Null
    }

    # Nombre de archivo con timestamp
    $nowStr = (Get-Date).ToString("yyyyMMdd_HHmmss")
    $dumpFileName = "${dbName}_${nowStr}.dump"
    $dumpFilePath = Join-Path $DestinationDir $dumpFileName

    Write-BackupLog "Generando dump de la base de datos '$dbName' hacia '$dumpFilePath'..." "INFO"

    # Configurar PGPASSWORD en el ámbito de proceso
    $previousPgPassword = $env:PGPASSWORD
    try {
        $env:PGPASSWORD = $dbPassword

        # Ejecución de pg_dump en formato custom (-Fc)
        $dumpArgs = @(
            "-h", $dbHost,
            "-p", $dbPort,
            "-U", $dbUser,
            "-d", $dbName,
            "-Fc",
            "-f", $dumpFilePath
        )

        $process = Start-Process -FilePath $pgDumpExe -ArgumentList $dumpArgs -NoNewWindow -Wait -PassThru

        if ($process.ExitCode -ne 0) {
            throw "pg_dump finalizó con código de error $($process.ExitCode)."
        }
    } finally {
        # Restaurar / limpiar variable sensible inmediatamente
        $env:PGPASSWORD = $previousPgPassword
    }

    # Validar creación y tamaño
    if (-not (Test-Path $dumpFilePath)) {
        throw "El archivo de respaldo no fue generado en '$dumpFilePath'."
    }

    $dumpItem = Get-Item $dumpFilePath
    $sizeMb = [Math]::Round(($dumpItem.Length / 1MB), 2)
    Write-BackupLog "Respaldo completado exitosamente: $dumpFileName (Tamaño: ${sizeMb} MB)" "SUCCESS"

    # Política de retención: conservar los últimos N y eliminar más antiguos
    Write-BackupLog "Aplicando política de retención (conservar últimos $RetentionCount respaldos)..." "INFO"
    $existingDumps = Get-ChildItem -Path $DestinationDir -Filter "${dbName}_*.dump" | Sort-Object CreationTime -Descending

    if ($existingDumps.Count -gt $RetentionCount) {
        $toDelete = $existingDumps | Select-Object -Skip $RetentionCount
        foreach ($oldDump in $toDelete) {
            Remove-Item $oldDump.FullName -Force
            Write-BackupLog "Depurado respaldo antiguo: $($oldDump.Name)" "INFO"
        }
    }

    Write-BackupLog "Proceso finalizado correctamente." "SUCCESS"
    exit 0
} catch {
    $errMessage = $_.Exception.Message
    Write-BackupLog "ERROR durante el respaldo: $errMessage" "ERROR"
    exit 1
}
