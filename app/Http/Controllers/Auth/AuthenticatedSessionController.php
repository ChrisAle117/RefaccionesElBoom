<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\ShoppingCart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Para solicitudes AJAX o API, devolver información adicional
        if ($request->wantsJson() || $request->expectsJson()) {
            // Obtener carrito del usuario
            $cart = ShoppingCart::with('items.product')
                ->where('user_id', auth()->id())
                ->first();
                
            $cartItems = $cart ? $cart->items->map(function($item) {
                return [
                    'id_product' => $item->id_product,
                    'name' => $item->product->name ?? 'Producto no disponible',
                    'price' => $item->product->price ?? 0,
                    'quantity' => $item->quantity,
                    'disponibility' => $item->product->disponibility ?? 0,
                    'image' => $item->product->image ?? 'images/default.png',
                ];
            }) : [];
            
            // Devolver JSON con información útil
            return response()->json([
                'success' => true,
                'user' => auth()->user(),
                'redirect' => route('dashboard'),
                'cart_items' => $cartItems
            ]);
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}