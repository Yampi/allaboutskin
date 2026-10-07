<?php

namespace App\Services\Scraper\Discovery\Providers;

use App\Services\Scraper\Discovery\Contracts\WebSearchProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleSerperSearchProvider implements WebSearchProviderInterface
{
    protected ?string $apiKey;

    public function __construct(?string $apiKey = null)
    {
        $this->apiKey = $apiKey ?? config('services.serper.api_key', env('SERPER_API_KEY'));
    }

    /**
     * Determina si el proveedor de Serper cuenta con la clave de API.
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey);
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
        $gl = $options['gl'] ?? 've'; // Geolocation: Venezuela por defecto
        $hl = $options['hl'] ?? 'es';

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'X-API-KEY' => $this->apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post('https://google.serper.dev/search', [
                    'q' => $query,
                    'gl' => $gl,
                    'hl' => $hl,
                    'num' => min($limit, 20),
                ]);

            if (!$response->successful()) {
                Log::channel('scraper')->warning('Serper Google Search API error', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);
                return [];
            }

            $data = $response->json();
            $organic = $data['organic'] ?? [];
            $urls = [];

            foreach ($organic as $item) {
                if (!empty($item['link'])) {
                    $urls[] = $item['link'];
                }
            }

            Log::channel('scraper')->info("Google (via Serper) '{$query}' devolvió " . count($urls) . " URLs.");

            return $urls;
        } catch (\Throwable $e) {
            Log::channel('scraper')->error('Serper Google Search API exception: ' . $e->getMessage());
            return [];
        }
    }
}
