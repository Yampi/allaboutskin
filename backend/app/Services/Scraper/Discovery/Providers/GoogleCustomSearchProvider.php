<?php

namespace App\Services\Scraper\Discovery\Providers;

use App\Services\Scraper\Discovery\Contracts\WebSearchProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleCustomSearchProvider implements WebSearchProviderInterface
{
    protected ?string $apiKey;
    protected ?string $searchEngineId;

    public function __construct(?string $apiKey = null, ?string $searchEngineId = null)
    {
        $this->apiKey = $apiKey ?? config('services.google_search.api_key', env('GOOGLE_SEARCH_API_KEY'));
        $this->searchEngineId = $searchEngineId ?? config('services.google_search.cx', env('GOOGLE_SEARCH_CX'));
    }

    /**
     * Determina si el proveedor de Google Search cuenta con las credenciales requeridas.
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey) && !empty($this->searchEngineId);
    }

    /**
     * @inheritDoc
     */
    public function search(string $query, array $options = []): array
    {
        if (!$this->isConfigured()) {
            return [];
        }

        $limit = $options['limit'] ?? 10;

        try {
            $response = Http::timeout(10)->get('https://www.googleapis.com/customsearch/v1', [
                'key' => $this->apiKey,
                'cx' => $this->searchEngineId,
                'q' => $query,
                'num' => min($limit, 10),
                'gl' => 've', // Geolocation: Venezuela
                'hl' => 'es',
            ]);

            if (!$response->successful()) {
                Log::channel('scraper')->warning('Google Custom Search API error', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);
                return [];
            }

            $data = $response->json();
            $items = $data['items'] ?? [];
            $urls = [];

            foreach ($items as $item) {
                if (!empty($item['link'])) {
                    $urls[] = $item['link'];
                }
            }

            Log::channel('scraper')->info("Google Custom Search '{$query}' returned " . count($urls) . " URLs.");

            return $urls;
        } catch (\Throwable $e) {
            Log::channel('scraper')->error('Google Custom Search API exception: ' . $e->getMessage());
            return [];
        }
    }
}
