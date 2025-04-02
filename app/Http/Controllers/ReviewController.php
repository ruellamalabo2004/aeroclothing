<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ReviewController extends Controller
{
    // Fetch all reviews for a product (updated to include reply and format response)
    public function getReviews($productId)
    {
        $reviews = Review::where('product_id', $productId)
            ->with(['user.profile', 'product'])
            ->get();

        return response()->json($reviews->map(function ($review) {
            return [
                'id' => $review->id,
                'user' => $review->user->profile ? [
                    'first_name' => $review->user->profile->first_name,
                    'last_name' => $review->user->profile->last_name,
                    'profile_pic' => $review->user->profile->profile_pic,
                ] : [
                    'first_name' => $review->user->name,
                    'last_name' => '',
                    'profile_pic' => null,
                ],
                'product' => $review->product,
                'review' => $review->review,
                'rating' => $review->rating,
                'reply' => $review->reply, // Include the reply field
                'created_at' => $review->created_at->toDateTimeString(),
            ];
        }));
    }

    // Fetch all reviews (for admin panel)
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden: Admins only'], 403);
        }

        $reviews = Review::with(['user.profile', 'product'])->get();
        return response()->json($reviews->map(function ($review) {
            return [
                'id' => $review->id,
                'user' => [
                    'name' => $review->user->profile
                        ? "{$review->user->profile->first_name} {$review->user->profile->last_name}"
                        : $review->user->name,
                ],
                'product' => $review->product,
                'review' => $review->review,
                'rating' => $review->rating,
                'reply' => $review->reply,
                'created_at' => $review->created_at->toDateTimeString(),
            ];
        }));
    }

    // Add a reply to a review (for admin panel)
    public function reply(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden: Admins only'], 403);
        }

        $review = Review::findOrFail($id);
        $validated = $request->validate(['reply' => 'required|string']);

        $review->update(['reply' => $validated['reply']]);
        return response()->json(['reply' => $review->reply]);
    }

    // Add a new review (original method, with duplicate check)
    public function addReview(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'product_id' => 'required|exists:products,id',
            'review' => 'nullable|string',
            'rating' => 'required|integer|min:1|max:5'
        ]);
    
        $existingReview = Review::where('user_id', Auth::id())
            ->where('product_id', $request->product_id)
            ->first();
    
        if ($existingReview) {
            return response()->json(['message' => 'You have already reviewed this product'], 400);
        }
    
        $review = Review::create([
            'user_id' => Auth::id(),
            'order_id' => $request->order_id,
            'product_id' => $request->product_id,
            'review' => $request->review,
            'rating' => $request->rating
        ]);
    
        return response()->json(['message' => 'Review added successfully', 'review' => $review]);
    }

    // Store a new review (alternative method with logging)
    public function store(Request $request)
    {
        $user = Auth::user();
        Log::info('Review store request:', $request->all());
    
        try {
            $validated = $request->validate([
                'order_id' => 'required|exists:orders,id',
                'product_id' => 'required|exists:products,id',
                'rating' => 'required|integer|min:1|max:5',
                'review' => 'required|string|max:1000',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed:', $e->errors());
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        }
    
        $existingReview = Review::where('user_id', $user->id)
                                ->where('product_id', $validated['product_id'])
                                ->first();
        if ($existingReview) {
            Log::warning('Duplicate review attempt by user:', [
                'user_id' => $user->id,
                'product_id' => $validated['product_id'],
                'existing_review' => $existingReview->toArray()
            ]);
            return response()->json(['message' => 'You have already reviewed this product'], 400);
        }
    
        $review = Review::create([
            'user_id' => $user->id,
            'order_id' => $validated['order_id'],
            'product_id' => $validated['product_id'],
            'rating' => $validated['rating'],
            'review' => $validated['review'],
        ]);
    
        Log::info('Review created:', $review->toArray());
        return response()->json(['message' => 'Review submitted successfully', 'review' => $review], 201);
    }

    // Fetch user's reviews (for OrderHistory.js)
    public function userReviews(Request $request)
    {
        $user = Auth::user();
        $reviews = Review::where('user_id', $user->id)->get(['id', 'order_id', 'product_id', 'rating', 'review']);
        Log::info('User reviews fetched:', ['user_id' => $user->id, 'reviews' => $reviews->toArray()]);
        return response()->json($reviews);
    }

    // Update a review
    public function updateReview(Request $request, $id)
    {
        $request->validate([
            'review' => 'nullable|string',
            'rating' => 'required|integer|min:1|max:5'
        ]);

        $review = Review::where('id', $id)->where('user_id', Auth::id())->first();

        if (!$review) {
            return response()->json(['message' => 'Review not found'], 404);
        }

        $review->update([
            'review' => $request->review,
            'rating' => $request->rating
        ]);

        return response()->json(['message' => 'Review updated successfully', 'review' => $review]);
    }

    // Delete a review
    public function deleteReview($id)
    {
        $review = Review::where('id', $id)->where('user_id', Auth::id())->first();

        if (!$review) {
            return response()->json(['message' => 'Review not found'], 404);
        }

        $review->delete();
        return response()->json(['message' => 'Review deleted successfully']);
    }
}