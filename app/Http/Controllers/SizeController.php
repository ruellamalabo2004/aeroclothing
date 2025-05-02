<?php

namespace App\Http\Controllers;

use App\Models\Size;
use Illuminate\Http\Request;

class SizeController extends Controller
{
    public function index()
    {
        $sizes = Size::all();
        return response()->json($sizes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:sizes',
        ]);

        $size = Size::create($validated);
        return response()->json($size, 201);
    }

    public function show(Size $size)
    {
        return response()->json($size);
    }

    public function update(Request $request, Size $size)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:sizes,name,' . $size->id,
        ]);

        $size->update($validated);
        return response()->json($size);
    }

    public function destroy(Size $size)
    {
        $size->delete();
        return response()->json(['message' => 'Size archived successfully']);
    }

    public function restore($id)
    {
        $size = Size::onlyTrashed()->findOrFail($id);
        $size->restore();
        return response()->json(['message' => 'Size restored successfully']);
    }
}