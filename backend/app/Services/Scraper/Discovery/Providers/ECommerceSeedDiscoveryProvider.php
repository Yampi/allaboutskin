<?php

namespace App\Services\Scraper\Discovery\Providers;

use App\Services\Scraper\Discovery\Contracts\WebSearchProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ECommerceSeedDiscoveryProvider implements WebSearchProviderInterface
{
    /** @var array<string> Semillas de tiendas y portales de cosmética y farmacia en Venezuela y la región */
    protected array $seedDirectories = [
        'https://multilidervenezuela.com',
        'https://venezuela.yaxa.co',
        'https://perfumeriasunidas.com',
        'https://bellisimavirtual.com',
        'https://beka.com.ve',
        'https://cosmeticosalmayor.com',
        'https://tiendasbeco.com',
        'https://redvital.com',
        'https://plumavenezuela.com',
        'https://farmahorro.com.ve',
        'https://farmatodo.com.ve',
        'https://locatel.com.ve',
        'https://www.sweetcare.com/ve',
    ];

    /**
     * @inheritDoc
     */
    public function search(string $query, array $options = []): array
    {
        $limit = $options['limit'] ?? 10;
        $discovered = [];

        // 1. Devolver semillas que coincidan con tiendas conocidas no registradas aún
        shuffle($this->seedDirectories);
        foreach ($this->seedDirectories as $seedUrl) {
            $discovered[] = $seedUrl;
            if (count($discovered) >= $limit) {
                break;
            }
        }

        // 2. Opcionalmente inspeccionar enlaces externos en las semillas
        try {
            $randomSeed = $this->seedDirectories[array_rand($this->seedDirectories)];
            $response = Http::timeout(6)->get($randomSeed);
            if ($response->successful()) {
                $html = $response->body();
                if (preg_match_all('/<a[^>]+href="(https?:\/\/[^"\'\s>]+)"/i', $html, $matches)) {
                    foreach ($matches[1] as $outbound) {
                        $parsed = parse_url($outbound);
                        $host = $parsed['host'] ?? '';
                        if (!empty($host) && !str_contains($randomSeed, $host)) {
                            $discovered[] = "{$parsed['scheme']}://{$host}";
                        }
                        if (count($discovered) >= $limit * 2) {
                            break;
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::channel('scraper')->debug('Seed outbound discovery error: ' . $e->getMessage());
        }

        $unique = array_values(array_unique($discovered));
        return array_slice($unique, 0, $limit);
    }
}
