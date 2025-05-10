<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ReviewController extends Controller
{
    // Store a new review with images
    public function store(Request $request)
    {
        try {
            Log::info('Received review submission with data: ' . json_encode($request->except(['images'])));
            
            // Log all request keys for debugging
            Log::info('Request keys: ' . implode(', ', array_keys($request->all())));
            
            // Validate incoming request
            $validator = \Validator::make($request->all(), [
                'product_id' => 'required|exists:products,id',
                'order_id' => 'required|exists:orders,id',
                'review' => 'required|string',
                'rating' => 'required|integer|between:1,5',
                'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // image validation
            ]);
            
            if ($validator->fails()) {
                Log::error('Validation error: ' . json_encode($validator->errors()->toArray()));
                return response()->json([
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Check if user has already reviewed this product for this order
            $existingReview = Review::where([
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
                'order_id' => $request->order_id
            ])->first();
            
            if ($existingReview) {
                return response()->json([
                    'message' => 'You have already reviewed this product for this order.',
                    'review' => $existingReview,
                ], 409); // Conflict status code
            }
            
            // Store the review (without images)
            $review = Review::create([
                'user_id' => Auth::id(), // Assumes the user is authenticated
                'product_id' => $request->product_id,
                'order_id' => $request->order_id,
                'review' => $request->review,
                'rating' => $request->rating,
                'reply' => null, // Optional, start as null
            ]);
            
            Log::info('Created review with ID: ' . $review->id);
            
            // Store the images (if any)
            if ($request->hasFile('images')) {
                Log::info('Processing ' . count($request->file('images')) . ' images for review');
                
                foreach ($request->file('images') as $image) {
                    // Store image and get its path
                    $path = $image->store('reviews/images', 'public');
                    Log::info('Stored image at path: ' . $path);
                    
                    try {
                        // Create a new ReviewImage record for each uploaded image
                        $reviewImage = ReviewImage::create([
                            'review_id' => $review->id,
                            'image_path' => $path,
                        ]);
                        Log::info('Created review image with ID: ' . $reviewImage->id);
                    } catch (\Exception $e) {
                        Log::error('Error creating review image: ' . $e->getMessage());
                    }
                }
            } else {
                Log::info('No images submitted with review');
            }
            
            // Return success response
            return response()->json([
                'message' => 'Review created successfully!',
                'review' => $review,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating review: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Failed to create review: ' . $e->getMessage()
            ], 500);
        }
    }
    
    // Get reviews by the currently authenticated user
    public function userReviews()
    {
        try {
            Log::info('Fetching user reviews for user ID: ' . Auth::id());
            
            // Get reviews by the authenticated user
            $reviews = Review::where('user_id', Auth::id())
                ->select('id', 'user_id', 'product_id', 'order_id', 'review', 'rating', 'created_at')
                ->orderBy('created_at', 'desc')
                ->get();
                
            Log::info('Found ' . $reviews->count() . ' reviews');
            
            return response()->json($reviews);
        } catch (\Exception $e) {
            Log::error('Error fetching user reviews: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Failed to fetch reviews: ' . $e->getMessage()
            ], 500);
        }
    }
    
    // Get reviews for a specific product ID
    public function getReviews($productId)
    {
        try {
            Log::info('Fetching reviews for product ID: ' . $productId);
            
            // Get reviews for the product with their images and user info
            $reviews = Review::where('product_id', $productId)
                ->with(['user.profile', 'images'])
                ->orderBy('created_at', 'desc')
                ->get();
                
            Log::info('Found ' . $reviews->count() . ' reviews for product ID: ' . $productId);
            
            // Prepare reviews for display
            $formattedReviews = $reviews->map(function($review) {
                // Process images to get full URLs
                $images = $review->images->map(function($image) {
                    // Determine if path is already a URL or needs storage path prepended
                    $imagePath = $image->image_path;
                    if (!str_starts_with($imagePath, 'http')) {
                        $imagePath = asset('storage/' . $imagePath);
                    }
                    
                    return [
                        'id' => $image->id,
                        'url' => $imagePath
                    ];
                });
                
                // Get user info
                $firstName = 'Anonymous';
                $lastName = '';
                $profilePic = null;
                
                if ($review->user) {
                    Log::debug('User found for review', [
                        'review_id' => $review->id,
                        'user_id' => $review->user->id,
                        'user_name' => $review->user->name,
                        'has_profile' => isset($review->user->profile),
                    ]);
                    
                    // Get user's first name - from profile or direct
                    if ($review->user->profile && $review->user->profile->first_name) {
                        $firstName = $review->user->profile->first_name;
                        Log::debug('Using profile first name: ' . $firstName);
                    } else if ($review->user->first_name) {
                        $firstName = $review->user->first_name;
                        Log::debug('Using user first name: ' . $firstName);
                    } else {
                        $fullName = $review->user->name ?? '';
                        $nameParts = explode(' ', $fullName);
                        if (count($nameParts) > 0) {
                            $firstName = $nameParts[0];
                            Log::debug('Extracted first name from full name: ' . $firstName);
                        }
                    }
                    
                    // Get user's last name - from profile or direct
                    if ($review->user->profile && $review->user->profile->last_name) {
                        $lastName = $review->user->profile->last_name;
                        Log::debug('Using profile last name: ' . $lastName);
                    } else if ($review->user->last_name) {
                        $lastName = $review->user->last_name;
                        Log::debug('Using user last name: ' . $lastName);
                    } else {
                        $fullName = $review->user->name ?? '';
                        $nameParts = explode(' ', $fullName);
                        if (count($nameParts) > 1) {
                            $lastName = end($nameParts);
                            Log::debug('Extracted last name from full name: ' . $lastName);
                        }
                    }
                    
                    // Get profile picture - similar approach as in AdminHeader.js
                    $profilePic = null;
                    
                    if ($review->user && $review->user->profile && $review->user->profile->profile_pic) {
                        // Get the profile picture path
                        $profilePicPath = $review->user->profile->profile_pic;
                        
                        // Handle different path formats
                        if (str_starts_with($profilePicPath, 'http')) {
                            $profilePic = $profilePicPath;
                        } else if (str_starts_with($profilePicPath, '/')) {
                            $profilePic = url($profilePicPath);
                        } else {
                            $profilePic = url('storage/' . $profilePicPath);
                        }
                        
                        Log::debug('Found profile picture: ' . $profilePic);
                    }
                }
                
                // Mask the names: J*HN D*E format
                $maskedFirstName = $this->maskName($firstName);
                $maskedLastName = $this->maskName($lastName);
                
                Log::debug('Masked names', [
                    'original_first' => $firstName,
                    'masked_first' => $maskedFirstName,
                    'original_last' => $lastName,
                    'masked_last' => $maskedLastName
                ]);
                
                return [
                    'id' => $review->id,
                    'user' => [
                        'first_name' => $maskedFirstName,
                        'last_name' => $maskedLastName,
                        'masked_name' => $maskedFirstName . ' ' . $maskedLastName,
                        'profile_image' => $profilePic ?? url('/images/default-avatar.jpg'),
                    ],
                    'product_id' => $review->product_id,
                    'order_id' => $review->order_id,
                    'review' => $review->review,
                    'rating' => $review->rating,
                    'helpful_count' => 0, // We'll implement this feature later
                    'images' => $images,
                    'created_at' => $review->created_at,
                    'updated_at' => $review->updated_at,
                ];
            });
            
            return response()->json($formattedReviews);
        } catch (\Exception $e) {
            Log::error('Error fetching product reviews: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Failed to fetch reviews: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get all reviews (for admin use)
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllReviews()
    {
        try {
            Log::info('Admin fetching all reviews');
            
            // Get all reviews with basic relationships
            $reviews = Review::with(['user', 'product'])
                ->orderBy('created_at', 'desc')
                ->get();
                
            Log::info('Found ' . $reviews->count() . ' total reviews');
            
            // Return raw reviews with minimal formatting
            return response()->json($reviews);
        } catch (\Exception $e) {
            Log::error('Error fetching all reviews: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Failed to fetch reviews: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get all reviews for admin panel listing
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            Log::info('Fetching all reviews for admin panel');
            
            // Get all reviews with detailed user and product info
            $reviews = Review::with(['user.profile', 'product'])
                ->orderBy('created_at', 'desc')
                ->get();
                
            Log::info('Found ' . $reviews->count() . ' total reviews');
            
            return response()->json($reviews);
        } catch (\Exception $e) {
            Log::error('Error fetching all reviews: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Failed to fetch reviews: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Mask a name by replacing middle characters with asterisks
     * For example: "John" becomes "J*hn", "Doe" becomes "D*e"
     */
    private function maskName($name)
    {
        // If name is empty or too short, return as is
        if (empty($name) || strlen($name) <= 2) {
            return $name;
        }
        
        // For names with 3 or more characters, mask the middle part
        $length = strlen($name);
        $result = '';
        
        for ($i = 0; $i < $length; $i++) {
            // Keep first and last character, replace middle with asterisks
            if ($i === 0 || $i === $length - 1) {
                $result .= $name[$i];
            } else {
                $result .= '*';
            }
        }
        
        return $result;
    }
    
    // Update an existing review
    public function updateReview(Request $request, $id)
    {
        try {
            $review = Review::findOrFail($id);
            
            // Check if the review belongs to the authenticated user
            if ($review->user_id !== Auth::id()) {
                return response()->json([
                    'message' => 'Unauthorized. This review does not belong to your account.'
                ], 403);
            }
            
            // Validate request data
            $request->validate([
                'review' => 'required|string',
                'rating' => 'required|integer|between:1,5',
            ]);
            
            // Update the review
            $review->update([
                'review' => $request->review,
                'rating' => $request->rating,
            ]);
            
            return response()->json([
                'message' => 'Review updated successfully',
                'review' => $review
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating review: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to update review: ' . $e->getMessage()
            ], 500);
        }
    }
    
    // Delete a review
    public function deleteReview($id)
    {
        try {
            $review = Review::findOrFail($id);
            
            // Check if the review belongs to the authenticated user
            if ($review->user_id !== Auth::id()) {
                return response()->json([
                    'message' => 'Unauthorized. This review does not belong to your account.'
                ], 403);
            }
            
            // Delete any associated images
            foreach ($review->images as $image) {
                // Delete file from storage if it exists
                if (Storage::disk('public')->exists($image->image_path)) {
                    Storage::disk('public')->delete($image->image_path);
                }
                
                // Delete the image record
                $image->delete();
            }
            
            // Delete the review
            $review->delete();
            
            return response()->json([
                'message' => 'Review deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting review: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to delete review: ' . $e->getMessage()
            ], 500);
        }
    }
}
