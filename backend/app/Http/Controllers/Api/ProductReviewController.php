<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\UserRoutineItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductReviewController extends Controller
{
    /**
     * Obtener calificaciones y opiniones de un producto por su slug.
     */
    public function index(string $slug): JsonResponse
    {
        $normalizedSlug = Str::slug($slug);

        $reviews = ProductReview::whereIn('product_slug', array_unique([$normalizedSlug, $slug]))
            ->orderBy('helpful_count', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $total = $reviews->count();

        $starsCount = [];
        foreach ([5, 4, 3, 2, 1] as $stars) {
            $starsCount[$stars] = $reviews->where('rating', $stars)->count();
        }

        return response()->json([
            'product_slug' => $slug,
            // Sin reseñas no hay promedio: nunca una calificación estimada.
            'average_rating' => $total > 0 ? round($reviews->avg('rating'), 1) : null,
            'total_reviews' => $total,
            'stars_breakdown' => $starsCount,
            'reviews' => $reviews,
        ]);
    }

    /**
     * Publicar una calificación (requiere sesión; una por usuario y producto).
     * "Verificada" significa que el usuario tiene el producto en su rutina.
     */
    public function store(Request $request, string $slug): JsonResponse
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'required|string|max:150',
            'comment' => 'required|string|min:10|max:2000',
            'user_skin_type' => 'nullable|string|max:50',
            'usage_duration' => 'nullable|string|max:50',
        ]);

        $user = $request->user();
        $normalizedSlug = Str::slug($slug);

        if (ProductReview::where('user_id', $user->id)->where('product_slug', $normalizedSlug)->exists()) {
            return response()->json([
                'status' => 'error',
                'error_type' => 'REVIEW_ALREADY_EXISTS',
                'message' => 'Ya publicaste una opinión sobre este producto.',
            ], 409);
        }

        $product = Product::where('slug', $normalizedSlug)->first();
        $inRoutine = $product !== null && UserRoutineItem::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->exists();

        $review = ProductReview::create([
            'product_id' => $product?->id,
            'product_slug' => $normalizedSlug,
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_skin_type' => $validated['user_skin_type'] ?? null,
            'rating' => $validated['rating'],
            'title' => $validated['title'],
            'comment' => $validated['comment'],
            'usage_duration' => $validated['usage_duration'] ?? null,
            'is_verified' => $inRoutine,
            'helpful_count' => 0,
        ]);

        return response()->json([
            'message' => '¡Opinión y calificación registradas exitosamente!',
            'review' => $review,
        ], 201);
    }

    /**
     * Votar una opinión como útil (requiere sesión; un voto por usuario).
     */
    public function voteHelpful(Request $request, int $id): JsonResponse
    {
        $review = ProductReview::findOrFail($id);
        $userId = $request->user()->id;

        $review = DB::transaction(function () use ($review, $userId) {
            $inserted = DB::table('review_helpful_votes')->insertOrIgnore([
                'product_review_id' => $review->id,
                'user_id' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if ($inserted > 0) {
                $review->increment('helpful_count');
            }

            return $review->fresh();
        }, 5);

        return response()->json([
            'message' => 'Voto registrado como útil.',
            'helpful_count' => $review->helpful_count,
        ]);
    }
}
