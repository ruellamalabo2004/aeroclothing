<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:categories|max:255',
        ]);

        $category = Category::create(['name' => $request->name]);

        return response()->json($category, 201);
    }

    public function show($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }
        return response()->json($category);
    }

    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $request->validate([
            'name' => 'required|unique:categories,name,' . $id . '|max:255',
        ]);

        $category->update(['name' => $request->name]);

        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }

    // Archive a category
    public function archive($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        // Check if category is already archived
        if ($category->status === 'archived') {
            return response()->json(['message' => 'Category is already archived'], 400);
        }

        // Update the status and archived_at fields
        $category->status = 'archived';
        $category->archived_at = now();  // Assuming you have 'archived_at' column
        $category->save();

        return response()->json(['message' => 'Category archived successfully', 'category' => $category]);
    }

    // Restore a category
    public function restore($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        if ($category->status !== 'archived') {
            return response()->json(['message' => 'Category is not archived'], 400);
        }

        // Restore the category (remove archived status)
        $category->status = 'active';
        $category->archived_at = null;  // Reset archived_at
        $category->save();

        return response()->json(['message' => 'Category restored successfully', 'category' => $category]);
    }
}
