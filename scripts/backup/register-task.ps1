[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$TaskName = "AllaboutSkin_Daily_Postgres_Backup",
    [string]$BackupScriptPath = (Join-Path $PSScriptRoot "backup-db.ps1"),
    [string]$DailyTime = "02:00",
    [switch]$Execute
)

$resolvedScript = [System.IO.Path]::GetFullPath($BackupScriptPath)

Write-Output "=========================================================="
Write-Output " Configurador de Tarea Programada: Respaldo Diario"
Write-Output "=========================================================="
Write-Output "Nombre de la Tarea : $TaskName"
Write-Output "Script destino     : $resolvedScript"
Write-Output "Hora programada    : Diariamente a las $DailyTime (hora local)"
Write-Output "StartWhenAvailable : Habilitado (ejecuta si la laptop estuvo apagada)"
Write-Output "=========================================================="

if (-not (Test-Path $resolvedScript)) {
    throw "No se encontró el script de respaldo en '$resolvedScript'."
}

# Verificar permisos de Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Warning "AVISO: Este script no se está ejecutando con privilegios de Administrador."
    Write-Warning "Para registrar tareas globales que se ejecuten sin inicio de sesión activo, abre PowerShell como Administrador."
}

if (-not $Execute) {
    Write-Output ""
    Write-Output "MODO DE SIMULACION / INFORMATIVO:"
    Write-Output "Para registrar la tarea en el Programador de Tareas de Windows de forma efectiva, ejecuta:"
    Write-Output "   pwsh -ExecutionPolicy Bypass -File `"$PSScriptRoot\register-task.ps1`" -Execute"
    Write-Output ""
    Write-Output "Comando PowerShell equivalente:"
    Write-Output "   `$action = New-ScheduledTaskAction -Execute 'pwsh.exe' -Argument '-NoProfile -ExecutionPolicy Bypass -File `"$resolvedScript`"'"
    Write-Output "   `$trigger = New-ScheduledTaskTrigger -Daily -At '$DailyTime'"
    Write-Output "   `$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries"
    Write-Output "   Register-ScheduledTask -TaskName '$TaskName' -Action `$action -Trigger `$trigger -Settings `$settings -Description 'Respaldo automatico diario de PostgreSQL allaboutskin' -Force"
    exit 0
}

try {
    # 1. Definir acción (usar pwsh si está disponible, o powershell)
    $shellExe = if (Get-Command "pwsh.exe" -ErrorAction SilentlyContinue) { "pwsh.exe" } else { "powershell.exe" }
    $action = New-ScheduledTaskAction -Execute $shellExe -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$resolvedScript`""

    # 2. Definir disparador diario a la hora configurada
    $trigger = New-ScheduledTaskTrigger -Daily -At $DailyTime

    # 3. Definir configuración con resiliencia (StartWhenAvailable y baterías de laptop)
    $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

    # 4. Registrar tarea
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description "Respaldo diario de base de datos allaboutskin en PostgreSQL 16" -Force | Out-Null

    Write-Output "[EXITO] Tarea '$TaskName' registrada exitosamente en el Programador de Windows."
} catch {
    Write-Error "Error al registrar la tarea programada: $($_.Exception.Message)"
    exit 1
}
