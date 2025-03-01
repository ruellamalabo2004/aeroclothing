namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::with('category')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'type' => 'required|string',
            'sub_type' => 'required|string',
            'size' => 'required|array',
            'product_name' => 'required|string|max:100',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'stock_quantity' => 'required|integer',
            'payment_methods' => 'required|array',
            'status' => 'required|in:Published,Archived',
        ]);

        $product = Product::create([
            'category_id' => $request->category_id,
            'type' => $request->type,
            'sub_type' => $request->sub_type,
            'size' => json_encode($request->size),
            'product_name' => $request->product_name,
            'description' => $request->description,
            'price' => $request->price,
            'stock_quantity' => $request->stock_quantity,
            'payment_methods' => json_encode($request->payment_methods),
            'status' => $request->status,
        ]);

        return response()->json(['message' => 'Product added successfully', 'product' => $product]);
    }

    public function show($id)
    {
        $product = Product::with('category')->find($id);
        return $product ? response()->json($product) : response()->json(['error' => 'Product not found'], 404);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        
        $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'type' => 'sometimes|string',
            'sub_type' => 'sometimes|string',
            'size' => 'sometimes|array',
            'product_name' => 'sometimes|string|max:100',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric',
            'stock_quantity' => 'sometimes|integer',
            'payment_methods' => 'sometimes|array',
            'status' => 'sometimes|in:Published,Archived',
        ]);

        $product->update([
            'category_id' => $request->category_id ?? $product->category_id,
            'type' => $request->type ?? $product->type,
            'sub_type' => $request->sub_type ?? $product->sub_type,
            'size' => json_encode($request->size) ?? $product->size,
            'product_name' => $request->product_name ?? $product->product_name,
            'description' => $request->description ?? $product->description,
            'price' => $request->price ?? $product->price,
            'stock_quantity' => $request->stock_quantity ?? $product->stock_quantity,
            'payment_methods' => json_encode($request->payment_methods) ?? $product->payment_methods,
            'status' => $request->status ?? $product->status,
        ]);

        return response()->json(['message' => 'Product updated successfully', 'product' => $product]);
    }

    public function archive($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Product archived successfully']);
    }
}
