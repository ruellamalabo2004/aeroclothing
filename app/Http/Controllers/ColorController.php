<?php

// app/Http/Controllers/ColorController.php
namespace App\Http\Controllers;

use App\Models\Color;
use Illuminate\Http\Request;

class ColorController extends Controller
{
    public function index()
    {
        return response()->json(Color::all());
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $color = Color::create($request->all());
        return response()->json($color, 201);
    }

    public function show($id)
    {
        $color = Color::find($id);

        if (!$color) {
            return response()->json(['message' => 'Color not found'], 404);
        }

        return response()->json($color);
    }

    public function update(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $color = Color::find($id);

        if (!$color) {
            return response()->json(['message' => 'Color not found'], 404);
        }

        $color->update($request->all());
        return response()->json($color);
    }

    public function destroy($id)
    {
        $color = Color::find($id);

        if (!$color) {
            return response()->json(['message' => 'Color not found'], 404);
        }

        $color->delete();
        return response()->json(['message' => 'Color deleted successfully']);
    }
}

