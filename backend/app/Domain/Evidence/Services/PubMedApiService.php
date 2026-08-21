<?php

namespace App\Domain\Evidence\Services;

use App\Models\Ingredient;
use App\Models\PubMedStudy;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PubMedApiService
{
    protected string $baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
    protected ?string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.ncbi.api_key', env('NCBI_API_KEY'));
    }

    /**
     * Search PubMed for clinical evidence on a specific active ingredient.
     *
     * @param Ingredient $ingredient
     * @param int $maxResults
     * @return array<PubMedStudy>
     */
    public function searchAndSyncStudies(Ingredient $ingredient, int $maxResults = 5): array
    {
        $cacheKey = "pubmed_studies_ingredient_{$ingredient->id}";

        return Cache::remember($cacheKey, now()->addDays(7), function () use ($ingredient, $maxResults) {
            $existing = $ingredient->pubmedStudies()->take($maxResults)->get();

            if ($existing->count() >= 3) {
                return $existing->all();
            }

            $term = $this->buildSearchTerm($ingredient);
            $pmids = $this->searchPmids($term, $maxResults);

            if (empty($pmids)) {
                return $existing->all();
            }

            $studies = [];
            foreach ($pmids as $pmid) {
                $study = $this->fetchStudySummary($pmid);
                if ($study) {
                    $ingredient->pubmedStudies()->syncWithoutDetaching([
                        $study->id => ['primary_finding' => "Clinical evidence for {$ingredient->inci_name}"],
                    ]);
                    $studies[] = $study;
                }
            }

            return !empty($studies) ? $studies : $existing->all();
        });
    }

    /**
     * Formulate targeted PubMed search query for dermatology & cosmetic clinical efficacy.
     */
    public function buildSearchTerm(Ingredient $ingredient): string
    {
        $name = $ingredient->inci_name;
        $common = $ingredient->common_name ? " OR \"{$ingredient->common_name}\"[Title/Abstract]" : "";

        return "(\"{$name}\"[Title/Abstract]{$common}) AND (skin[Title/Abstract] OR dermatology[Title/Abstract] OR topical[Title/Abstract]) AND (\"clinical trial\"[pt] OR \"randomized controlled trial\"[pt] OR \"systematic review\"[pt] OR \"meta-analysis\"[pt] OR efficacy[Title/Abstract])";
    }

    /**
     * Execute esearch to get array of PMIDs.
     *
     * @return array<string>
     */
    public function searchPmids(string $term, int $retmax = 5): array
    {
        try {
            $params = [
                'db' => 'pubmed',
                'term' => $term,
                'retmode' => 'json',
                'retmax' => $retmax,
                'sort' => 'pub_date',
            ];

            if ($this->apiKey) {
                $params['api_key'] = $this->apiKey;
            }

            $response = Http::timeout(6)->get("{$this->baseUrl}/esearch.fcgi", $params);

            if ($response->successful()) {
                $data = $response->json();
                return $data['esearchresult']['idlist'] ?? [];
            }
        } catch (\Throwable $e) {
            Log::warning("PubMed esearch failed: {$e->getMessage()}");
        }

        return [];
    }

    /**
     * Fetch study summary details via esummary / efetch.
     */
    public function fetchStudySummary(string $pmid): ?PubMedStudy
    {
        $existing = PubMedStudy::where('pmid', $pmid)->first();
        if ($existing) {
            return $existing;
        }

        try {
            $params = [
                'db' => 'pubmed',
                'id' => $pmid,
                'retmode' => 'json',
            ];

            if ($this->apiKey) {
                $params['api_key'] = $this->apiKey;
            }

            $response = Http::timeout(6)->get("{$this->baseUrl}/esummary.fcgi", $params);

            if ($response->successful()) {
                $data = $response->json();
                $result = $data['result'][$pmid] ?? null;

                if ($result) {
                    $title = $result['title'] ?? 'Clinical Study on PubMed';
                    $journal = $result['source'] ?? 'Medical Journal';
                    $pubYear = isset($result['pubdate']) ? (int) substr($result['pubdate'], 0, 4) : null;
                    $studyType = $this->detectStudyType($title, $result['pubtype'] ?? []);
                    $grade = $this->determineEvidenceGrade($studyType);

                    return PubMedStudy::create([
                        'pmid' => $pmid,
                        'title' => html_entity_decode(strip_tags($title)),
                        'journal' => $journal,
                        'pub_year' => $pubYear,
                        'study_type' => $studyType,
                        'evidence_grade' => $grade,
                        'url' => "https://pubmed.ncbi.nlm.nih.gov/{$pmid}/",
                        'conclusions' => "Evaluated clinical outcomes on topical epidermal and dermal parameters.",
                    ]);
                }
            }
        } catch (\Throwable $e) {
            Log::warning("PubMed esummary failed for PMID {$pmid}: {$e->getMessage()}");
        }

        return null;
    }

    /**
     * Deduce study type from publication types & title.
     */
    protected function detectStudyType(string $title, array $pubTypes): string
    {
        $types = array_map('strtolower', $pubTypes);
        $titleLower = strtolower($title);

        if (in_array('meta-analysis', $types) || str_contains($titleLower, 'meta-analysis')) {
            return 'META_ANALYSIS';
        }
        if (in_array('systematic review', $types) || str_contains($titleLower, 'systematic review')) {
            return 'SYSTEMATIC_REVIEW';
        }
        if (in_array('randomized controlled trial', $types) || str_contains($titleLower, 'randomized') || str_contains($titleLower, 'double-blind')) {
            return 'RCT';
        }
        if (in_array('clinical trial', $types) || str_contains($titleLower, 'clinical evaluation') || str_contains($titleLower, 'clinical study')) {
            return 'CONTROLLED_CLINICAL_TRIAL';
        }

        return 'IN_VIVO';
    }

    /**
     * Calculate evidence grade A, B, C, D based on study type.
     */
    protected function determineEvidenceGrade(string $studyType): string
    {
        return match ($studyType) {
            'META_ANALYSIS', 'SYSTEMATIC_REVIEW', 'RCT' => 'A',
            'CONTROLLED_CLINICAL_TRIAL', 'CLINICAL_TRIAL' => 'B',
            'IN_VIVO' => 'C',
            default => 'D',
        };
    }
}
