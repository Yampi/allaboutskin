<?php

namespace App\Http\Controllers\Api;

use App\Domain\Audit\Services\FormulaAuditEngine;
use App\Domain\Cosmetics\Services\InciParserService;
use App\Domain\UserProfile\Services\SkinCompatibilityService;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\UserSkinProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function __construct(
        protected FormulaAuditEngine $auditEngine,
        protected InciParserService $inciParser,
        protected SkinCompatibilityService $compatibilityService
    ) {}

    /**
     * Audit raw INCI text.
     */
    public function auditInci(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'inci_text' => 'required|string|min:3',
            'product_name' => 'nullable|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:5',
        ]);

        $report = $this->auditEngine->auditFromRawInci(
            rawInciText: $validated['inci_text'],
            productName: $validated['product_name'] ?? null,
            brandName: $validated['brand_name'] ?? null,
            price: isset($validated['price']) ? (float)$validated['price'] : null,
            currency: $validated['currency'] ?? 'USD'
        );

        return response()->json([
            'status' => 'success',
            'data' => $report,
        ]);
    }

    /**
     * Audit OCR scanned text from label photography.
     */
    public function auditOcr(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ocr_text' => 'required|string|min:3',
            'product_name' => 'nullable|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:5',
        ]);

        $report = $this->auditEngine->auditFromRawInci(
            rawInciText: $validated['ocr_text'],
            productName: $validated['product_name'] ?? null,
            brandName: $validated['brand_name'] ?? null,
            price: isset($validated['price']) ? (float)$validated['price'] : null,
            currency: $validated['currency'] ?? 'USD'
        );

        return response()->json([
            'status' => 'success',
            'type' => 'OCR_ANALYSIS',
            'data' => $report,
        ]);
    }

    /**
     * Audit an existing product from catalog by slug or ID.
     */
    public function auditProduct(string $identifier): JsonResponse
    {
        $product = Product::where('slug', $identifier)
            ->orWhere('id', is_numeric($identifier) ? $identifier : null)
            ->firstOrFail();

        $report = $this->auditEngine->auditProduct($product);

        return response()->json([
            'status' => 'success',
            'data' => $report,
        ]);
    }

    /**
     * Audit formula compatibility against a skin profile (authenticated user or custom payload).
     */
    public function checkCompatibility(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'inci_text' => 'nullable|string',
            'product_id' => 'nullable|exists:products,id',
            'skin_type' => 'nullable|string|in:OILY,DRY,COMBINATION,NORMAL,SENSITIVE',
            'barrier_status' => 'nullable|string|in:HEALTHY,COMPROMISED,ACUTELY_DAMAGED',
            'active_conditions' => 'nullable|array',
            'known_allergens' => 'nullable|array',
        ]);

        // 1. Resolve Profile
        if ($request->user() && $request->user()->skinProfile) {
            $profile = $request->user()->skinProfile;
        } else {
            $profile = new UserSkinProfile([
                'skin_type' => $validated['skin_type'] ?? 'COMBINATION',
                'barrier_status' => $validated['barrier_status'] ?? 'HEALTHY',
                'active_conditions' => $validated['active_conditions'] ?? ['ACNE'],
                'known_allergens' => $validated['known_allergens'] ?? [],
            ]);
        }

        // 2. Resolve Ingredients & Audit
        if (!empty($validated['product_id'])) {
            $product = Product::with('ingredients')->findOrFail($validated['product_id']);
            $ingredients = $product->ingredients;
            $auditReport = $this->auditEngine->auditProduct($product);
        } else {
            $parseResult = $this->inciParser->parseAndMatch($validated['inci_text'] ?? '');
            $ingredients = $parseResult['matched_ingredients']->pluck('ingredient');
            $auditReport = $this->auditEngine->auditFromRawInci($validated['inci_text'] ?? '');
        }

        $compatibilityReport = $this->compatibilityService->evaluateCompatibility($profile, $ingredients);

        return response()->json([
            'status' => 'success',
            'compatibility' => $compatibilityReport,
            'audit_report' => $auditReport,
        ]);
    }
}
