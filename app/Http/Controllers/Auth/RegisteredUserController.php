<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Sanitizar número de teléfono: solo dígitos
        $cleanPhone = preg_replace('/\D/', '', $request->input('phone', ''));
        $request->merge(['phone' => $cleanPhone]);

        $request->validate([
            'name'     => ['required', 'string', 'max:255', 'regex:/^[\pL\pM\s\-]+$/u'],
            'email'    => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'phone'    => ['required', 'digits_between:10,15'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'name.regex'             => 'El nombre solo puede contener letras y espacios.',
            'phone.required'         => 'El número de teléfono es obligatorio.',
            'phone.digits_between'   => 'El teléfono debe tener entre 10 y 15 dígitos.',
        ]);

        $user = User::create([
            'name'     => strip_tags($request->name),
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return to_route('dashboard');
    }
}
