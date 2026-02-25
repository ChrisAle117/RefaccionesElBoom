<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminReportingController extends Controller
{
    public function index()
    {
        $paidStatuses = ['payment_verified', 'processing', 'shipped', 'delivered'];

     
        $topCustomers = DB::table('orders')
            ->leftJoin('users', 'orders.user_id', '=', 'users.id')
            ->whereIn('orders.status', $paidStatuses)
            ->select(
                DB::raw('COALESCE(users.name, orders.guest_name) as name'),
                DB::raw('COALESCE(users.email, orders.guest_email) as email'),
                DB::raw('COUNT(orders.id_order) as orders_count'),
                DB::raw('SUM(orders.total_amount) as orders_sum_total_amount'),
                'users.id as id' 
            )
            ->groupBy(
                DB::raw('COALESCE(users.email, orders.guest_email)'),
                DB::raw('COALESCE(users.name, orders.guest_name)'),
                'users.id'
            )
            ->orderBy('orders_sum_total_amount', 'desc')
            ->limit(10)
            ->get();

        
        $salesByState = DB::table('addresses')
            ->join('orders', 'addresses.id_direccion', '=', 'orders.address_id')
            ->whereIn('orders.status', $paidStatuses)
            ->select('addresses.estado', DB::raw('SUM(orders.total_amount) as total_sales'), DB::raw('COUNT(orders.id_order) as order_count'))
            ->groupBy('addresses.estado')
            ->orderBy('total_sales', 'desc')
            ->get();

   
        $topRevenueProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id_order')
            ->join('products', 'order_items.product_id', '=', 'products.id_product')
            ->whereIn('orders.status', $paidStatuses)
            ->select('products.name as product_name', DB::raw('SUM(order_items.quantity) as total_quantity'), DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue'))
            ->groupBy('products.id_product', 'products.name')
            ->orderBy('total_revenue', 'desc')
            ->limit(10)
            ->get();

 
        $topCartProducts = DB::table('cart_item')
            ->join('products', 'cart_item.id_product', '=', 'products.id_product')
            ->select('products.name as product_name', DB::raw('SUM(cart_item.quantity) as total_quantity'))
            ->groupBy('products.id_product', 'products.name')
            ->orderBy('total_quantity', 'desc')
            ->limit(10)
            ->get();

      
        $salesTrend = Order::whereIn('status', $paidStatuses)
            ->select('created_at', 'total_amount')
            ->orderBy('created_at', 'asc')
            ->get()
            ->groupBy(function($date) {
                return \Carbon\Carbon::parse($date->created_at)->format('Y-m'); 
            })
            ->map(function ($row) {
                return [
                    'month' => \Carbon\Carbon::parse($row->first()->created_at)->format('Y-m'),
                    'total' => $row->sum('total_amount')
                ];
            })
            ->values()
            ->take(-6); 

      
        $stats = [
            'total_revenue' => (float) Order::whereIn('status', $paidStatuses)->sum('total_amount'),
            'total_orders' => Order::whereIn('status', $paidStatuses)->count(),
            'total_users' => User::where('role', '!=', 'admin')->count(),
            'avg_order_value' => (float) (Order::whereIn('status', $paidStatuses)->avg('total_amount') ?? 0)
        ];

       
        $insight = "No hay datos suficientes para generar un análisis estratégico.";
        if (count($topRevenueProducts) > 0) {
            $bestProduct = $topRevenueProducts[0]->product_name;
            $revenueShare = $stats['total_revenue'] > 0 
                ? round(($topRevenueProducts[0]->total_revenue / $stats['total_revenue']) * 100, 1) 
                : 0;
            
            $insight = "El producto '{$bestProduct}' es el líder absoluto en rentabilidad, aportando el {$revenueShare}% de la facturación total. Un desabasto afectaría severamente el flujo de caja.";
        }

        return Inertia::render('Admin/ReportingAdmin', [
            'topCustomers' => $topCustomers,
            'salesByState' => $salesByState,
            'topProducts' => $topRevenueProducts,
            'topCartProducts' => $topCartProducts,
            'salesTrend' => $salesTrend,
            'stats' => $stats,
            'inventoryInsight' => $insight
        ]);
    }
}
