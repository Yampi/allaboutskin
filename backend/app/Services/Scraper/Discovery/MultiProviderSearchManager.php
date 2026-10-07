<?php

namespace App\Services\Scraper\Discovery;

use App\Services\Scraper\Discovery\Contracts\WebSearchProviderInterface;
use App\Services\Scraper\Discovery\Providers\DuckDuckGoSearchProvider;
use App\Services\Scraper\Discovery\Providers\ECommerceSeedDiscoveryProvider;
use App\Services\Scraper\Discovery\Providers\GoogleCustomSearchProvider;
use App\Services\Scraper\Discovery\Providers\GoogleSerperSearchProvider;
use Illuminate\Support\Facades\Log;

class MultiProviderSearchManager implements WebSearchProviderInterface
{
    public function __construct(
        protected ?GoogleSerperSearchProvider $serper = null,
        protected ?GoogleCustomSearchProvider $google = null,
        protected ?DuckDuckGoSearchProvider $duckDuckGo = null,
        protected ?ECommerceSeedDiscoveryProvider $seedDiscovery = null
    ) {
        $this->serper = $serper ?? new GoogleSerperSearchProvider();
        $this->google = $google ?? new GoogleCustomSearchProvider();
        $this->duckDuckGo = $duckDuckGo ?? new DuckDuckGoSearchProvider();
        $this->seedDiscovery = $seedDiscovery ?? new ECommerceSeedDiscoveryProvider();
    }

    /**
     * @inheritDoc
     */
    public function search(string $query, array $options = []): array
    {
        // 1. Google Search Real (vía Serper.dev API)
        if ($this->serper->isConfigured()) {
            $urls = $this->serper->search($query, $options);
            if (!empty($urls)) {
                return $urls;
            }
        }

        // 2. Google Custom Search (si está configurado con CSE)
        if ($this->google->isConfigured()) {
            $urls = $this->google->search($query, $options);
            if (!empty($urls)) {
                return $urls;
            }
        }

        // 3. DuckDuckGo (búsqueda web abierta)
        $ddgUrls = $this->duckDuckGo->search($query, $options);
        if (!empty($ddgUrls)) {
            return $ddgUrls;
        }

        // 4. Fallback inteligente a Seeds de E-Commerce y expansión de red
        Log::channel('scraper')->info("Activando fallback a ECommerceSeedDiscoveryProvider para consulta: '{$query}'");
        return $this->seedDiscovery->search($query, $options);
    }
}
