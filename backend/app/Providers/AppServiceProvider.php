<?php

namespace App\Providers;

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
        //
    }
}
