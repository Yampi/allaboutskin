<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SyncPubMedEvidenceCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_dry_run_lists_ingredients_without_calling_pubmed(): void
    {
        Http::fake();
        Ingredient::create(['inci_name' => 'ZZ ACTIVE', 'is_active' => true]);
        Ingredient::create(['inci_name' => 'ZZ EXCIPIENT', 'is_active' => false]);

        $this->artisan('evidence:sync-pubmed --dry-run')
            ->expectsOutputToContain('ZZ ACTIVE')
            ->doesntExpectOutputToContain('ZZ EXCIPIENT')
            ->assertSuccessful();

        Http::assertNothingSent();
    }

    public function test_sync_stores_studies_and_derives_the_evidence_level(): void
    {
        $ingredient = Ingredient::create(['inci_name' => 'ZZ ACTIVE', 'is_active' => true]);
        Http::fake([
            '*esearch.fcgi*' => Http::response(['esearchresult' => ['idlist' => ['111']]]),
            '*esummary.fcgi*' => Http::response(['result' => ['111' => [
                'title' => 'A randomized trial of ZZ',
                'source' => 'J Test',
                'pubdate' => '2021 Jan',
                'pubtype' => ['Randomized Controlled Trial'],
            ]]]),
        ]);

        $this->artisan('evidence:sync-pubmed --delay=0')->assertSuccessful();

        $ingredient->refresh();
        $this->assertSame(1, $ingredient->pubmedStudies()->count());
        $this->assertSame('A', $ingredient->evidence_level);
        $this->assertNull($ingredient->pubmedStudies()->first()->conclusions);
    }

    public function test_ingredient_without_results_keeps_no_evidence_level(): void
    {
        $ingredient = Ingredient::create(['inci_name' => 'ZZ ACTIVE', 'is_active' => true]);
        Http::fake(['*esearch.fcgi*' => Http::response(['esearchresult' => ['idlist' => []]])]);

        $this->artisan('evidence:sync-pubmed --delay=0')->assertSuccessful();

        $this->assertNull($ingredient->fresh()->evidence_level);
    }

    public function test_titles_where_the_name_is_part_of_another_compound_are_discarded(): void
    {
        $ingredient = Ingredient::create(['inci_name' => 'UREA', 'is_active' => true]);
        Http::fake([
            '*esearch.fcgi*' => Http::response(['esearchresult' => ['idlist' => ['1', '2', '3']]]),
            '*esummary.fcgi*' => Http::sequence()
                ->push(['result' => ['1' => ['title' => 'Imidazolidinyl urea-preserved cream', 'pubtype' => []]]])
                ->push(['result' => ['2' => ['title' => 'Debridement with papain-urea', 'pubtype' => []]]])
                ->push(['result' => ['3' => ['title' => 'Urea creams in xerosis', 'pubtype' => ['Randomized Controlled Trial']]]]),
        ]);

        $this->artisan('evidence:sync-pubmed --only=UREA --delay=0')->assertSuccessful();

        $this->assertSame(['Urea creams in xerosis'], $ingredient->pubmedStudies()->pluck('title')->all());
    }

    public function test_botanical_names_are_searched_by_species_and_genus(): void
    {
        $service = app(\App\Domain\Evidence\Services\PubMedApiService::class);

        $this->assertSame('GLYCYRRHIZA GLABRA', $service->searchableName('GLYCYRRHIZA GLABRA ROOT EXTRACT'));

        $term = $service->buildSearchTerm(new Ingredient(['inci_name' => 'GLYCYRRHIZA GLABRA ROOT EXTRACT']));
        $this->assertStringContainsString('"GLYCYRRHIZA GLABRA"[Title] OR GLYCYRRHIZA[Title]', $term);

        $plain = $service->buildSearchTerm(new Ingredient(['inci_name' => 'NIACINAMIDE']));
        $this->assertStringNotContainsString(' OR NIACINAMIDE[Title]', $plain);
    }

    public function test_botanical_titles_must_talk_about_skin(): void
    {
        $service = app(\App\Domain\Evidence\Services\PubMedApiService::class);

        $this->assertFalse($service->isRelevantTitle('Artemisia annua immunotherapy drops', 'ARTEMISIA ANNUA', true));
        $this->assertFalse($service->isRelevantTitle('Immunotherapy for Artemisia pollen asthma', 'ARTEMISIA ANNUA', true));
        $this->assertTrue($service->isRelevantTitle('Aloe cream for second-degree burns', 'ALOE BARBADENSIS', true));
        $this->assertTrue($service->isRelevantTitle('Artemisia annua extract in acne', 'ARTEMISIA ANNUA', true));
    }
}
