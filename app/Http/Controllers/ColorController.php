<?php

namespace App\Http\Controllers;

use App\Models\Color;
use Illuminate\Http\Request;

class ColorController extends Controller
{
    public function index()
    {
        $colors = Color::all();
        return response()->json($colors);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:colors',
            'hex_code' => 'nullable|string|max:7',
        ]);

        $color = Color::create($validated);
        return response()->json($color, 201);
    }

    public function show(Color $color)
    {
        return response()->json($color);
    }

    public function update(Request $request, Color $color)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:colors,name,' . $color->id,
            'hex_code' => 'nullable|string|max:7',
        ]);

        $color->update($validated);
        return response()->json($color);
    }

    public function destroy(Color $color)
    {
        $color->delete();
        return response()->json(['message' => 'Color archived successfully']);
    }

    public function restore($id)
    {
        $color = Color::onlyTrashed()->findOrFail($id);
        $color->restore();
        return response()->json(['message' => 'Color restored successfully']);
    }
}