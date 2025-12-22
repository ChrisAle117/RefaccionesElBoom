<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DhlPickup;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DhlPickupController extends Controller
{
    public function index(Request $request)
    {
        $query = DhlPickup::query()
            ->with(['order' => function($q){
                $q->select('id_order','user_id','address_id','total_amount','created_at','dhl_label_path');
            }])
            ->latest();

        if ($search = $request->string('search')->toString()) {
            $query->where(function($q) use ($search) {
                $q->where('dispatch_confirmation_number', 'like', "%{$search}%")
                ->orWhere('order_id', $search)
                ->orWhere('origin_postal_code', 'like', "%{$search}%")
                ->orWhere('origin_city_name', 'like', "%{$search}%");
            });
        }

        if ($date = $request->string('date')->toString()) {
            $query->whereDate('planned_pickup_at', $date);
        }

        $pickups = $query->paginate(20)->appends($request->only('search','date'));

        // Prepara conteo por número de despacho (para identificar agrupaciones)
        $dispatchNumbers = collect($pickups->items())
            ->pluck('dispatch_confirmation_number')
            ->filter()
            ->unique()
            ->values();

        $counts = $dispatchNumbers->isEmpty()
            ? collect()
            : DhlPickup::select('dispatch_confirmation_number', DB::raw('COUNT(*) as c'))
                ->whereIn('dispatch_confirmation_number', $dispatchNumbers)
                ->groupBy('dispatch_confirmation_number')
                ->pluck('c', 'dispatch_confirmation_number');

        // Mapear para exponer solo lo necesario y agregar bandera de etiqueta y conteo de grupo
        $data = collect($pickups->items())->map(function (DhlPickup $p) use ($counts) {
            $order = $p->order;
            $labelPath = $order ? $order->getAttribute('dhl_label_path') : null;
            $closeAt = $p->planned_pickup_at ? $p->planned_pickup_at->copy()->addMinutes(180) : null;
            $pickupDate = $closeAt ? $closeAt->toDateString() : null; // ISO date for machine use
            $pickupDateDisplay = $closeAt ? $closeAt->copy()->setTimezone('America/Mexico_City')->format('d/m/Y') : null;
            $groupCount = $p->dispatch_confirmation_number ? ($counts[$p->dispatch_confirmation_number] ?? 1) : 1;
            return [
                'id'                              => $p->id,
                'order_id'                        => $p->order_id,
                'dispatch_confirmation_number'    => $p->dispatch_confirmation_number,
                'planned_pickup_at'               => optional($p->planned_pickup_at)->toIso8601String(),
                'pickup_date'                     => $pickupDate,
                'pickup_date_display'             => $pickupDateDisplay,
                'planned_pickup_tz'               => $p->planned_pickup_tz,
                'close_time'                      => $p->close_time,
                'location'                        => $p->location,
                'location_type'                   => $p->location_type,
                'origin_postal_code'              => $p->origin_postal_code,
                'origin_city_name'                => $p->origin_city_name,
                'origin_province_code'            => $p->origin_province_code,
                'origin_country_code'             => $p->origin_country_code,
                'origin_address_line1'            => $p->origin_address_line1,
                'created_at'                      => optional($p->created_at)->toIso8601String(),
                'label_available'                 => !empty($labelPath),
                'dispatch_group_count'            => $groupCount,
            ];
        })->all();

        return Inertia::render('Admin/DhlPickups', [
            'pickups' => $data,
            'pagination' => [
                'total' => $pickups->total(),
                'per_page' => $pickups->perPage(),
                'current_page' => $pickups->currentPage(),
                'last_page' => $pickups->lastPage(),
            ],
            'filters' => [
                'search' => $request->string('search')->toString(),
                'date' => $request->string('date')->toString(),
            ],
        ]);
    }
}
