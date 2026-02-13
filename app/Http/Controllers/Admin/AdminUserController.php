<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserNote;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    public function index()
    {
        $users = User::where('role', '!=', 'admin')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/UsersAdmin', [
            'users' => $users
        ]);
    }

    public function show($id)
    {
        try {
            // Intenta cargar con notas
            $user = User::with(['address', 'orders', 'notes.admin'])
                ->findOrFail($id);
        } catch (\Illuminate\Database\QueryException $e) {
            // Si falla (probablemente falta la tabla user_notes), carga sin notas
            $user = User::with(['address', 'orders'])
                ->findOrFail($id);
            // Agregamos notas vacías manualmente para evitar error en frontend
            $user->setRelation('notes', collect([]));
        }

        return Inertia::render('Admin/UserDetail', [
            'client' => $user
        ]);
    }

    public function storeNote(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|string|min:5'
        ]);

        UserNote::create([
            'user_id' => $id,
            'admin_id' => auth()->id(),
            'content' => $request->content
        ]);

        return back()->with('success', 'Nota agregada correctamente');
    }
}
