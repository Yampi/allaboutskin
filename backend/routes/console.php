<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;

// 1. Cron de Rastreo Multi-Tienda Continuo (Round-Robin): Cada 2 horas procesa 6 activos en rotación
Schedule::command('scraper:cron-cycle --limit=6')
    ->everyTwoHours()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/crawler_cycle.log'));

// 2. Cron Ligero de Precios & Disponibilidad: Revisa ofertas no auditadas en las últimas 2 horas
Schedule::command('offers:check-prices --limit=50 --stale-hours=2')
    ->everyTwoHours()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/price_monitor.log'));

// 3. Cron de Resumen Ejecutivo y Diagnóstico: Cada 2 horas archiva el resumen de salud y actividad
Schedule::command('crawler:summary --hours=2')
    ->everyTwoHours()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/crawler_summary.log'));

// 4. Cron de Descubrimiento Web Continuo: Rastrea la web con Google (1 consulta/hora = 24 al día para maximizar la cuota de Serper a >100 días)
Schedule::command('crawler:discover-web --limit=1')
    ->hourly()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/web_discovery.log'));

// 5. Cron de Reporte Consolidado Diario al Telegram del Super Admin (20:00 / 8:00 PM)
Schedule::command('report:daily-telegram')
    ->dailyAt('20:00')
    ->withoutOverlapping();



