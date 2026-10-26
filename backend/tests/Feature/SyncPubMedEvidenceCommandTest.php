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
}
