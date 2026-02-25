<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserNote;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = User::where('role', '!=', 'admin');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/UsersAdmin', [
            'users' => $users,
            'filters' => [
                'search' => $search
            ]
        ]);
    }

    public function show($id)
    {
        try {
           
            $user = User::with(['address', 'orders', 'notes.admin'])
                ->findOrFail($id);
        } catch (\Illuminate\Database\QueryException $e) {
            
            $user = User::with(['address', 'orders'])
                ->findOrFail($id);
           
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
