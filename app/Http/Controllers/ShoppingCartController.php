<?php

namespace App\Http\Controllers;

use App\Models\ShoppingCart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class ShoppingCartController extends Controller
{
    /**
     * Helper to get the current cart based on auth or session.
     */
    private function getCart()
    {
        if (auth()->check()) {
            return ShoppingCart::firstOrCreate(['user_id' => auth()->id()]);
        }

        $sessionId = Session::getId();
        return ShoppingCart::firstOrCreate(['session_id' => $sessionId]);
    }

    /**
     * Get the cart items formatted for frontend.
     */
    private function getCartItems()
    {
        $cart = $this->getCart();

        if (!$cart) {
            return [];
        }

        return $cart->items()->with('product')->get()->map(function ($item) {
            return [
                'id_product'    => (int) ($item->id_product),
                'name'          => $item->product->name ?? 'Producto no disponible',
                'price'         => (float) ($item->product->price ?? 0),
                'quantity'      => (int) ($item->quantity),
                'disponibility' => (int) ($item->product->disponibility ?? 0),
                'image'         => $item->product->image ?? 'images/default.png',
            ];
        })->values()->toArray();
    }

    /**
     * Agregar un producto al carrito.
     */
    public function addItem(Request $request)
    {
        $request->validate([
            'id_product' => 'required|exists:products,id_product',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $this->getCart();

        // Agregar o actualizar el producto en el carrito
        $item = $cart->items()->where('id_product', $request->id_product)->first();
        if ($item) {
            $item->increment('quantity', $request->quantity);
        } else {
            $item = $cart->items()->create([
                'id_product' => $request->id_product,
                'quantity' => $request->quantity
            ]);
        }

        return response()->json([
            'message' => 'Item added to cart',
            'items'   => $this->getCartItems(),
            'authenticated' => auth()->check(),
            'user_id' => auth()->id()
        ]);
    }

    /**
     * Actualizar la cantidad de un producto en el carrito.
     */
    public function updateItem(Request $request)
    {
        try {
            $request->validate([
                'id_product' => 'required|exists:products,id_product',
                'quantity' => 'required|integer|min:1',
            ]);

            $cart = $this->getCart();
            
            $item = $cart->items()->where('id_product', $request->id_product)->first();
            if (!$item) {
                return response()->json(['message' => 'Item not found in cart'], 404);
            }

            $item->update(['quantity' => $request->quantity]);

            return response()->json([
                'message' => 'Item quantity updated',
                'items'   => $this->getCartItems(),
                'authenticated' => auth()->check(),
                'user_id' => auth()->id()
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error updating item quantity', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Eliminar un producto del carrito.
     */
    public function removeItem($id)
    {
        $cart = $this->getCart();
        $cart->items()->where('id_product', $id)->delete();

        return response()->json([
            'message' => 'Item removed from cart',
            'items'   => $this->getCartItems(),
            'authenticated' => auth()->check(),
            'user_id' => auth()->id()
        ]);
    }

    /**
     * Ver el contenido del carrito.
     */
    public function viewCart()
    {
        // Ya no requerimos autenticación estricta aquí, el frontend decidirá qué mostrar
        // pero responderemos con los items de la sesión o usuario.
        
        return response()->json([
            'items' => $this->getCartItems(),
            'authenticated' => auth()->check(),
            'user_id'       => auth()->id(),
            'timestamp'     => now()->toIso8601String()
        ]);
    }
}