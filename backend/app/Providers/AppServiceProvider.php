<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Services\Scraper\Contracts\GeocodingServiceInterface::class,
            \App\Services\Scraper\Geocoding\NominatimGeocodingService::class
        );

        $this->app->bind(
            \App\Services\Scraper\Discovery\Contracts\WebSearchProviderInterface::class,
            \App\Services\Scraper\Discovery\MultiProviderSearchManager::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * Límites de las rutas públicas de escritura o costosas. La clave es el usuario
     * si hay sesión y si no la IP (detrás de un proxy, configurar TRUSTED_PROXIES).
     */
    private function configureRateLimiting(): void
    {
        // Guard sanctum explícito: en rutas públicas el guard por defecto no lee el token Bearer.
        $key = fn (Request $request) => $request->user('sanctum')
            ? 'user:'.$request->user('sanctum')->id
            : 'ip:'.$request->ip();

        RateLimiter::for('register', fn (Request $request) => Limit::perHour(10)->by('ip:'.$request->ip()));

        RateLimiter::for('audit', fn (Request $request) => Limit::perMinute(30)->by($key($request)));

        RateLimiter::for('reviews', fn (Request $request) => [
            Limit::perMinute(5)->by($key($request)),
            Limit::perDay(20)->by('day:'.$key($request)),
        ]);

        RateLimiter::for('review-votes', fn (Request $request) => Limit::perMinute(30)->by($key($request)));

        RateLimiter::for('store-suggestions', fn (Request $request) => Limit::perHour(10)->by($key($request)));

        RateLimiter::for('store-interactions', fn (Request $request) => Limit::perMinute(60)->by($key($request)));
    }
}
