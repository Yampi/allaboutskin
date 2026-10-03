<#
.SYNOPSIS
    Script de arranque integral para el entorno de desarrollo local Allabout.skin.
.DESCRIPTION
    Inicia la API REST de Laravel, el Scheduler local para tareas de scraping,
    y el servidor de desarrollo web en Next.js.
#>

param (
    [switch]$SkipFrontend,
    [switch]$SkipScheduler
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🚀 Iniciando Allabout.skin Local Development Suite" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$rootDir = $PSScriptRoot
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"

# 1. Verificar PHP y Composer
if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    Write-Error "PHP no está en el PATH del sistema. Por favor, añade PHP a tu PATH (ej. C:\xampp\php)."
    exit 1
}

# 2. Migraciones y estado de base de datos
Write-Host "`n[1/3] Verificando base de datos persistente..." -ForegroundColor Yellow
Push-Location $backendDir
try {
    php artisan migrate --force
} finally {
    Pop-Location
}

# 3. Lanzar procesos en paralelo
Write-Host "`n[2/3] Iniciando servicios de backend..." -ForegroundColor Yellow

# Iniciar servidor Laravel API (puerto 8000)
$apiJob = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; Write-Host '>>> Laravel API en http://localhost:8000' -ForegroundColor Green; php artisan serve --host=127.0.0.1 --port=8000" -PassThru

# Iniciar Scheduler/Cron de Laravel
if (-not $SkipScheduler) {
    Write-Host ">>> Iniciando Scheduler/Cron en segundo plano..." -ForegroundColor DarkYellow
    $cronJob = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; Write-Host '>>> Laravel Scheduler (Cron) Activo' -ForegroundColor Magenta; php artisan schedule:work" -PassThru
}

# 4. Iniciar Frontend Next.js (puerto 3000)
if (-not $SkipFrontend) {
    Write-Host "`n[3/3] Iniciando Frontend Next.js..." -ForegroundColor Yellow
    $frontJob = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; Write-Host '>>> Next.js WebApp en http://localhost:3000' -ForegroundColor Cyan; npm run dev" -PassThru
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " ✨ Entorno Local Levantado Exitosamente" -ForegroundColor Green
Write-Host " - API REST:    http://localhost:8000/api/v1" -ForegroundColor White
Write-Host " - WebApp UI:   http://localhost:3000" -ForegroundColor White
Write-Host " - Scheduler:   php artisan schedule:work (activo)" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Para detener los servicios, simplemente cierra las ventanas correspondientes." -ForegroundColor Gray
