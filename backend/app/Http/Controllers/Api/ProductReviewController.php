<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ProductReviewController extends Controller
{
    /**
     * Obtener calificaciones y opiniones de un producto por su slug o ID.
     */
    public function index(string $slug): JsonResponse
    {
        $normalizedSlug = Str::slug($slug);

        $query = ProductReview::where('product_slug', $normalizedSlug)
            ->orWhere('product_slug', $slug)
            ->orWhere('product_slug', 'like', "%{$normalizedSlug}%");

        $reviews = $query->orderBy('helpful_count', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $total = $reviews->count();
        $average = $total > 0 ? round($reviews->avg('rating'), 1) : 4.8; // Calificación base estimada

        // Desglose de estrellas
        $starsCount = [
            5 => $reviews->where('rating', 5)->count(),
            4 => $reviews->where('rating', 4)->count(),
            3 => $reviews->where('rating', 3)->count(),
            2 => $reviews->where('rating', 2)->count(),
            1 => $reviews->where('rating', 1)->count(),
        ];

        return response()->json([
            'product_slug' => $slug,
            'average_rating' => $average,
            'total_reviews' => $total,
            'stars_breakdown' => $starsCount,
            'reviews' => $reviews,
        ]);
    }

    /**
     * Publicar una nueva calificación y opinión sobre un producto.
     */
    public function store(Request $request, string $slug): JsonResponse
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'required|string|max:150',
            'comment' => 'required|string|min:10|max:2000',
            'user_name' => 'nullable|string|max:100',
            'user_skin_type' => 'nullable|string|max:50',
            'usage_duration' => 'nullable|string|max:50',
        ]);

        $user = Auth::guard('sanctum')->user();
        $normalizedSlug = Str::slug($slug);

        $review = ProductReview::create([
            'product_slug' => $normalizedSlug,
            'user_id' => $user?->id,
            'user_name' => $validated['user_name'] ?? ($user?->name ?? 'Usuario de AllAboutSkin'),
            'user_skin_type' => $validated['user_skin_type'] ?? 'Piel Mixta',
            'rating' => $validated['rating'],
            'title' => $validated['title'],
            'comment' => $validated['comment'],
            'usage_duration' => $validated['usage_duration'] ?? '2 a 4 semanas',
            'is_verified' => true,
            'helpful_count' => 0,
        ]);

        return response()->json([
            'message' => '¡Opinión y calificación registradas exitosamente!',
            'review' => $review,
        ], 201);
    }

    /**
     * Votar opinión como útil.
     */
    public function voteHelpful(int $id): JsonResponse
    {
        $review = ProductReview::findOrFail($id);
        $review->increment('helpful_count');

        return response()->json([
            'message' => 'Voto registrado como útil.',
            'helpful_count' => $review->helpful_count,
        ]);
    }
}
