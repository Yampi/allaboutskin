<?php

namespace App\Services\Scraper\Discovery\Providers;

use App\Services\Scraper\Discovery\Contracts\WebSearchProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DuckDuckGoSearchProvider implements WebSearchProviderInterface
{
    protected string $endpoint = 'https://html.duckduckgo.com/html/';

    protected array $userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    ];

    /**
     * @inheritDoc
     */
    public function search(string $query, array $options = []): array
    {
        $limit = $options['limit'] ?? 15;
        $ua = $this->userAgents[array_rand($this->userAgents)];

        try {
            $ch = curl_init($this->endpoint);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => http_build_query(['q' => $query]),
                CURLOPT_USERAGENT => $ua,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS => 5,
                CURLOPT_TIMEOUT => 12,
                CURLOPT_HTTPHEADER => [
                    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language: es-ES,es;q=0.9,en;q=0.8',
                    'Content-Type: application/x-www-form-urlencoded',
                    'Referer: https://html.duckduckgo.com/',
                ]
            ]);

            $html = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($httpCode !== 200 || empty($html)) {
                Log::channel('scraper')->warning('DuckDuckGo search returned non-200 or empty status', [
                    'status' => $httpCode,
                    'error' => $curlError,
                    'query' => $query,
                ]);
                return [];
            }

            $parsed = $this->parseResults($html, $limit);

            Log::channel('scraper')->info("DuckDuckGo search '{$query}' returned " . count($parsed) . " URLs (HTML len: " . strlen($html) . ")");

            return $parsed;
        } catch (\Throwable $e) {
            Log::channel('scraper')->error('DuckDuckGo search provider failed', [
                'query' => $query,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Parsea el HTML devuelto por DuckDuckGo extrayendo URLs limpias.
     *
     * @param string $html
     * @param int $limit
     * @return array<string>
     */
    protected function parseResults(string $html, int $limit): array
    {
        $urls = [];

        // 1. Selector principal de DuckDuckGo HTML: <a class="result__url" href="...">
        if (preg_match_all('/<a[^>]+class="[^"]*result__url[^"]*"[^>]*href="([^"]+)"/i', $html, $matches)) {
            foreach ($matches[1] as $rawHref) {
                $clean = $this->cleanResultUrl($rawHref);
                if ($clean) {
                    $urls[] = $clean;
                }
            }
        }

        // 2. Si no encontró por result__url, buscar por links en snippets
        if (empty($urls) && preg_match_all('/<a[^>]+class="[^"]*result__snippet[^"]*"[^>]*href="([^"]+)"/i', $html, $matchesSnippet)) {
            foreach ($matchesSnippet[1] as $rawHref) {
                $clean = $this->cleanResultUrl($rawHref);
                if ($clean) {
                    $urls[] = $clean;
                }
            }
        }

        // 3. Buscar enlaces empaquetados en uddg=
        if (empty($urls) && preg_match_all('/uddg=([^"&]+)/i', $html, $matchesUddg)) {
            foreach ($matchesUddg[1] as $enc) {
                $decoded = urldecode($enc);
                if (filter_var($decoded, FILTER_VALIDATE_URL)) {
                    $urls[] = $decoded;
                }
            }
        }

        $unique = array_values(array_unique($urls));
        return array_slice($unique, 0, $limit);
    }

    /**
     * Limpia y desenvuelve URLs de redirección de DuckDuckGo descartando anuncios.
     */
    protected function cleanResultUrl(string $rawHref): ?string
    {
        // Ignorar anuncios de DuckDuckGo / Bing Ads (y.js)
        if (str_contains($rawHref, 'duckduckgo.com/y.js') || str_contains($rawHref, 'bing.com/aclick')) {
            return null;
        }

        // Si es un wrapper interno de redirección
        if (str_contains($rawHref, 'uddg=')) {
            $parsed = parse_url($rawHref);
            if (!empty($parsed['query'])) {
                parse_str($parsed['query'], $queryParams);
                if (!empty($queryParams['uddg'])) {
                    $decoded = urldecode($queryParams['uddg']);
                    if (filter_var($decoded, FILTER_VALIDATE_URL)) {
                        return $decoded;
                    }
                }
            }
        }

        if (str_starts_with($rawHref, 'http://') || str_starts_with($rawHref, 'https://')) {
            return $rawHref;
        }

        return null;
    }
}
