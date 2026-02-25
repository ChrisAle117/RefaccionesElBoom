<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notificacion;

class NotificacionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $userId = auth()->user() ? auth()->user()->id : null;
            $all = $request->has('all');
            
            \Log::info("Notificaciones Index - User: $userId - All: " . ($all ? 'Yes' : 'No'));

            $query = Notificacion::query();
            
            $query->where(function($q) use ($userId) {
                $q->whereNull('user_id');
                if ($userId) {
                    $q->orWhere('user_id', $userId);
                }
            });

            if (!$all) {
                $query->where('leida', false);
            }

       
            $notificaciones = $query->orderBy('created_at', 'desc')
                ->limit($all ? 50 : 10)
                ->get();

            $unreadCountQuery = Notificacion::where('leida', false)
                ->where(function($q) use ($userId) {
                    $q->whereNull('user_id');
                    if ($userId) {
                        $q->orWhere('user_id', $userId);
                    }
                });
            
            $unreadCount = $unreadCountQuery->count();
            
            \Log::info("Notificaciones Result - Count: " . $notificaciones->count() . " - Unread: $unreadCount");

            return response()->json([
                'success' => true,
                'data' => $notificaciones,
                'unreadCount' => $unreadCount,
                'hayNuevas' => $unreadCount > 0
            ]);
        } catch (\Throwable $e) {
            \Log::error("Error en NotificacionController@index: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    public function marcarLeidas(Request $request)
    {
        try {
            $ids = $request->input('ids');
            \Log::info("Marcar Leídas - IDs recibidos:", $ids ?? []);
            
            if (!$ids || !is_array($ids)) {
                return response()->json(['success' => false, 'error' => 'IDs inválidos'], 400);
            }

            $count = Notificacion::whereIn('id', $ids)
                ->update(['leida' => true]);
            
            \Log::info("Marcar Leídas - Filas actualizadas: $count");

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            \Log::error("Error en NotificacionController@marcarLeidas: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}
