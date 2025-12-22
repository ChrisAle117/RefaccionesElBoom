<?php

namespace App\Http\Controllers;

use App\Models\ShoppingCart;
use App\Models\CartItem;
use Illuminate\Http\Request;

class ShoppingCartController extends Controller
{
    /**
     * Agregar un producto al carrito.
     */
    public function addItem(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'id_product' => 'required|exists:products,id_product',
            'quantity' => 'required|integer|min:1',
        ]);

        // Asegúrate de que el usuario esté autenticado
        $userId = auth()->id();

        // Buscar o crear un carrito único para el usuario autenticado
        $cart = ShoppingCart::firstOrCreate(['user_id' => $userId]);

        // Agregar o actualizar el producto en el carrito
        $item = $cart->items()->updateOrCreate(
            ['id_product' => $request->id_product],
            ['quantity' => $request->quantity]
        );

        return response()->json([
            'message' => 'Item added to cart', 
            'item' => $item,
            'authenticated' => true,
            'user_id' => $userId
        ]);
    }

    /**
     * Actualizar la cantidad de un producto en el carrito.
     */
    public function updateItem(Request $request)
    {
        try {
            // Validar los datos de entrada
            $request->validate([
                'id_product' => 'required|exists:products,id_product',
                'quantity' => 'required|integer|min:1',
            ]);

            // Buscar el carrito del usuario autenticado
            $cart = ShoppingCart::where('user_id', auth()->id())->first();
            if (!$cart) {
                return response()->json(['message' => 'Cart not found'], 404);
            }

            // Buscar el producto en el carrito
            $item = $cart->items()->where('id_product', $request->id_product)->first();
            if (!$item) {
                return response()->json(['message' => 'Item not found in cart'], 404);
            }

            // Actualizar la cantidad del producto
            $item->update(['quantity' => $request->quantity]);

            return response()->json([
                'message' => 'Item quantity updated', 
                'item' => $item,
                'authenticated' => true,
                'user_id' => auth()->id()
            ]);
        } catch (\Exception $e) {
            // Manejar errores inesperados
            return response()->json(['message' => 'Error updating item quantity', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Eliminar un producto del carrito.
     */
    public function removeItem($id)
    {
        // Buscar el carrito del usuario autenticado
        $cart = ShoppingCart::where('user_id', auth()->id())->firstOrFail();

        // Eliminar el producto del carrito
        $cart->items()->where('id_product', $id)->delete();

        return response()->json([
            'message' => 'Item removed from cart',
            'authenticated' => true,
            'user_id' => auth()->id()
        ]);
    }

    /**
     * Ver el contenido del carrito.
     */
    public function viewCart()
    {
        // Verificar si el usuario está autenticado
        if (!auth()->check()) {
            return response()->json([
                'items' => [],
                'authenticated' => false,
                'message' => 'Usuario no autenticado'
            ], 401);
        }
    
        // Buscar el carrito del usuario autenticado con los productos relacionados
        $cart = ShoppingCart::with('items.product')
            ->where('user_id', auth()->id())
            ->first();
    
        // Si el carrito no existe, devolver un carrito vacío
        if (!$cart) {
            return response()->json([
                'items' => [],
                'authenticated' => true,
                'user_id' => auth()->id(),
                'message' => 'Carrito vacío'
            ]);
        }
    
        // Mapear los ítems del carrito para devolverlos en el formato esperado
        return response()->json([
            'items' => $cart->items->map(function ($item) {
                return [
                    'id_product'    => (int) ($item->id_product),
                    'name'          => $item->product->name ?? 'Producto no disponible',
                    'price'         => (float) ($item->product->price ?? 0),
                    'quantity'      => (int) ($item->quantity),
                    'disponibility' => (int) ($item->product->disponibility ?? 0),
                    'image'         => $item->product->image ?? 'images/default.png',
                ];
            }),
            'authenticated' => true,
            'user_id'       => auth()->id(),
            'timestamp'     => now()->toIso8601String()
        ]);

    }
}