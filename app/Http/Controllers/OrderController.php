<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\PaymentProof;
use App\Models\ShoppingCart;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Order;
use App\Models\Address;
use Inertia\Inertia;
use Carbon\Carbon;

class OrderController extends Controller
{
    public function createOrder(Request $request)
    {
        try {
            $user = Auth::user();
            $sessionId = \Illuminate\Support\Facades\Session::getId();
            
            // Si es usuario invitado, validamos datos de contacto
            if (!$user) {
                $request->validate([
                    'guest_name' => 'required|string|max:255',
                    'guest_email' => 'required|email|max:255',
                ]);
            }

            $addressId = $request->input('address_id');
            $pickupInStore = (bool) $request->input('pickup_in_store', false);

            if ($pickupInStore && empty($addressId)) {
                $branchId = $request->input('branch_id', 'alpuyeca');
                $branches = [
                    'alpuyeca' => [
                        'name' => 'Sucursal Matriz Alpuyeca',
                        'calle' => 'REFACCIONES EL BOOM, Carr. Federal Mexico-Acapulco Km. 29',
                        'colonia' => 'Alpuyeca',
                        'cp' => '62660',
                        'estado' => 'Morelos',
                        'ciudad' => 'Puente de Ixtla'
                    ],
                    'acapulco' => [
                        'name' => 'Sucursal Acapulco',
                        'calle' => 'Refaccionaria EL BOOM, Avenida Lázaro Cárdenas, No. 2, Manzana 18',
                        'colonia' => 'La Popular',
                        'cp' => '39700',
                        'estado' => 'Guerrero',
                        'ciudad' => 'Acapulco'
                    ],
                    'chilpancingo' => [
                        'name' => 'Sucursal Chilpancingo',
                        'calle' => 'Refaccionaria EL BOOM, Boulevard Vicente Guerrero, Km 269',
                        'colonia' => 'Centro',
                        'cp' => '39010',
                        'estado' => 'Guerrero',
                        'ciudad' => 'Chilpancingo'
                    ],
                    'tizoc' => [
                        'name' => 'Sucursal Tizoc',
                        'calle' => 'Refaccionaria EL BOOM, Boulevard Cuauhnáhuac Km 3.5, No. 25',
                        'colonia' => 'Buganbilias',
                        'cp' => '62560',
                        'estado' => 'Morelos',
                        'ciudad' => 'Jiutepec'
                    ]
                ];

                $branchData = $branches[$branchId] ?? $branches['alpuyeca'];
                
                // Para guests, buscamos por session_id o creamos nueva sin user_id
                $query = Address::query();
                if ($user) {
                    $query->where('user_id', $user->id);
                } else {
                    $query->where('session_id', $sessionId);
                }
                
                $existing = $query->where('calle', $branchData['calle'])
                    ->where('referencia', 'Recoger en sucursal')
                    ->first();

                if ($existing) {
                    $addressId = $existing->id_direccion;
                } else {
                    $addr = new Address();
                    if ($user) {
                        $addr->user_id = $user->id;
                    } else {
                        $addr->session_id = $sessionId;
                    }
                    $addr->calle           = $branchData['calle'];
                    $addr->colonia         = $branchData['colonia'];
                    $addr->numero_exterior = 'SN';
                    $addr->numero_interior = null;
                    $addr->codigo_postal   = $branchData['cp'];
                    $addr->estado          = $branchData['estado'];
                    $addr->ciudad          = $branchData['ciudad'];
                    $addr->telefono        = ($user->phone ?? $request->input('phone')) ?? '7771807312';
                    $addr->referencia      = 'Recoger en sucursal';
                    $addr->save();
                    $addressId = $addr->id_direccion;
                }
            }
            
            // Verificar si es una compra individual o desde carrito
            $isSinglePurchase = $request->has('product_id') && $request->has('quantity');
            
            if ($isSinglePurchase) {
                // Compra individual de producto
                $productId = $request->input('product_id');
                $quantity = $request->input('quantity');
                
                // Verificar producto y stock
                $product = Product::find($productId);
                if (!$product) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Producto no encontrado'
                    ], 404);
                }
                
                // Verificar stock disponible
                if ($quantity > $product->disponibility) {
                    return response()->json([
                        'success' => false,
                        'message' => "No hay suficiente stock del producto '{$product->name}'",
                        'error_type' => 'stock_error',
                        'details' => [
                            'product_name' => $product->name,
                            'requested' => $quantity,
                            'available' => $product->disponibility,
                            'product_id' => $product->id_product
                        ]
                    ], 400);
                }
                
                // Calcular total
                $totalAmount = $quantity * $product->price;
                
                $orderData = [
                    'address_id' => $addressId,
                    'total_amount' => $totalAmount,
                    'status' => 'pending_payment',
                    'expires_at' => Carbon::now()->addHours(24)
                ];

                if ($user) {
                    $orderData['user_id'] = $user->id;
                } else {
                    $orderData['session_id'] = $sessionId;
                    $orderData['guest_name'] = $request->input('guest_name');
                    $orderData['guest_email'] = $request->input('guest_email');
                }

                $order = new Order($orderData);
                
                $order->save();
                
                DB::transaction(function () use ($order, $product, $quantity) {
                    $orderItem = new OrderItem();
                    $orderItem->order_id = $order->id_order;
                    $orderItem->product_id = $product->id_product;
                    $orderItem->quantity = $quantity;
                    $orderItem->price = $product->price;
                    $orderItem->save();

                    // Bloqueo pesimista del producto
                    $locked = Product::where('id_product', $product->id_product)->lockForUpdate()->first();
                    if (!$locked) {
                        throw new \RuntimeException('Producto no disponible para bloqueo');
                    }
                    if ($locked->disponibility < $quantity) {
                        throw new \RuntimeException('Stock insuficiente en confirmación');
                    }
                    $locked->disponibility -= $quantity;
                    $locked->reserved_stock += $quantity;
                    $locked->save();
                });
                
                return response()->json([
                    'success' => true,
                    'order_id' => $order->id_order
                ]);
            } else {
                if ($user) {
                    $cart = ShoppingCart::where('user_id', $user->id)->first();
                } else {
                    $cart = ShoppingCart::where('session_id', $sessionId)->first();
                }
                
                if (!$cart || $cart->items->isEmpty()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'El carrito está vacío'
                    ], 400);
                }
                
                if (!$addressId) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Se requiere una dirección'
                    ], 400);
                }
                
                $totalAmount = 0;
                foreach ($cart->items as $item) {
                    $totalAmount += $item->quantity * $item->product->price;
                    
                    $availableStock = $item->product->disponibility;
                    if ($item->quantity > $availableStock) {
                        return response()->json([
                            'success' => false,
                            'message' => "No hay suficiente stock del producto '{$item->product->name}'",
                            'error_type' => 'stock_error',
                            'details' => [
                                'product_name' => $item->product->name,
                                'requested' => $item->quantity,
                                'available' => $availableStock,
                                'product_id' => $item->product->id_product
                            ]
                        ], 400);
                    }
                }
                
                $orderData = [
                    'address_id' => $addressId,
                    'total_amount' => $totalAmount,
                    'status' => 'pending_payment',
                    'expires_at' => Carbon::now()->addHours(24)
                ];

                if ($user) {
                    $orderData['user_id'] = $user->id;
                } else {
                    $orderData['session_id'] = $sessionId;
                    $orderData['guest_name'] = $request->input('guest_name');
                    $orderData['guest_email'] = $request->input('guest_email');
                }

                $order = new Order($orderData);
                
                $order->save();
                
                foreach ($cart->items as $cartItem) {
                    // Verificar que el ID de producto exista y sea válido
                    if (!$cartItem->id_product) {
                        // \Log::warning('CartItem sin id_product válido', ['cart_item_id' => $cartItem->id_cart_item]);
                        continue;
                    }
                    
                    // Crear el item de orden asignando propiedades
                    $orderItem = new OrderItem();
                    $orderItem->order_id = $order->id_order;
                    $orderItem->product_id = $cartItem->id_product;
                    $orderItem->quantity = $cartItem->quantity;
                    $orderItem->price = $cartItem->product->price;
                    $orderItem->save();
                    
                    $product = Product::where('id_product', $cartItem->id_product)->lockForUpdate()->first();
                    if ($product) {
                        $product->disponibility -= $cartItem->quantity; 
                        $product->reserved_stock += $cartItem->quantity; 
                        $product->save();
                    }
                }
                
                $cart->items()->delete();
                $cart->products()->detach(); 
                
                return response()->json([
                    'success' => true,
                    'order_id' => $order->id_order
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el pedido: ' . $e->getMessage()
            ], 500);
        }
    }
    
    
    public function show($id)
    {
        $user = Auth::user();
        $sessionId = \Illuminate\Support\Facades\Session::getId();

        // Cargar de forma estricta por id
        $query = Order::with(['items.product', 'address', 'payment_proofs', 'user'])
            ->where('id_order', $id);

        // Si no es admin, filtramos por pertenencia
        if (!$user || $user->role !== 'admin') {
            if ($user) {
                $query->where('user_id', $user->id);
            } else {
                // Para invitados, verificamos session_id o si viene de un track validado
                // Si la orden tiene guest_email, permitimos si el session_id coincide 
                // o si hay una marca en sesion de que esta orden fue "desbloqueada" via track
                $allowedInSession = session("unlocked_order_{$id}");
                
                if (!$allowedInSession) {
                    $query->where('session_id', $sessionId);
                }
            }
        }

        $order = $query->first();

        if (!$order) {
            return redirect()->route('home')->with('error', 'Orden no encontrada o no tienes permiso para verla');
        }

        $timeLeft = 0;
        if ($order->status === 'pending_payment' && $order->expires_at) {
            $expiresAt = Carbon::parse($order->expires_at);
            $now = Carbon::now();
            if ($expiresAt->gt($now)) {
                $timeLeft = $now->diffInSeconds($expiresAt);
            }
        }

        $orderData = [
            'id' => $order->id_order,
            'status' => $order->status,
            'total' => $order->total_amount,
            // Usar formato ISO para que JavaScript lo maneje correctamente (evitar "Invalid Date")
            'created_at' => $order->created_at ? $order->created_at->toIso8601String() : null,
            'expires_at' => $order->expires_at ? \Carbon\Carbon::parse($order->expires_at)->toIso8601String() : null,
            'time_left' => $timeLeft,
            'address' => $order->address ? [
                'street' => $order->address->calle,
                'exteriorNumber' => $order->address->numero_exterior,
                'interiorNumber' => $order->address->numero_interior,
                'colony' => $order->address->colonia,
                'postalCode' => $order->address->codigo_postal,
                'city' => $order->address->ciudad,
                'state' => $order->address->estado,
                'reference' => $order->address->referencia,
            ] : [
                'street' => '',
                'exteriorNumber' => '',
                'interiorNumber' => '',
                'colony' => '',
                'postalCode' => '',
                'city' => '',
                'state' => '',
                'reference' => '',
            ],
            'items' => [],
            'payment_proofs' => $order->payment_proofs->map(function($proof) {
                return [
                    'id_payment_proof' => $proof->id_payment_proof,
                    'file_path' => $proof->file_path,
                    'file_name' => $proof->file_name,
                    'notes' => $proof->notes,
                    'status' => $proof->status,
                    'admin_notes' => $proof->admin_notes,
                    'created_at' => $proof->created_at->format('d/m/Y H:i')
                ];
            }),
            'user' => $order->user ? [
                'name' => $order->user->name,
                'email' => $order->user->email,
                'telefono' => $order->user->phone ?? $order->address->telefono ?? 'No disponible',
            ] : null
        ];

        foreach ($order->items as $item) {
            $orderData['items'][] = [
                'id' => $item->product->id_product,
                'name' => $item->product->name,
                'price' => (float)$item->price,
                'quantity' => $item->quantity,
                'image' => $item->product->image,
                'description' => $item->product->description ?? '',
            ];
        }

        return Inertia::render('OrderSummary', [
            'order' => $orderData
        ]);
    }
    
    public function adminShowOrder($id)
    {
        $order = Order::with([
            'user',
            'items.product',
            'address',
            'payment_proofs'
        ])->findOrFail($id);
        $isPickup = false;
        if ($order->address) {
            $isPickup = (
                ($order->address->referencia && $order->address->referencia === 'Recoger en sucursal') ||
                ($order->address->calle && str_starts_with($order->address->calle, 'REFACCIONES EL BOOM'))
            );
        }

        $bestPhone = $order->user->phone ?? null;
        if (!$bestPhone) {
            $bestPhone = $order->address->telefono ?? 'No disponible';
        }

        // Handle Guest vs Registered User
        $userData = [];
        if ($order->user) {
            $userData = [
                'name'     => $order->user->name,
                'email'    => $order->user->email,
                'telefono' => $bestPhone,
            ];
        } else {
             $userData = [
                'name'     => $order->guest_name ?? 'Invitado',
                'email'    => $order->guest_email ?? 'Sin email',
                'telefono' => $bestPhone,
            ];
        }

        return Inertia::render('Admin/OrderDetails', [
            'order' => [
                'id'        => $order->id_order,
                'user'      => $userData,
                'status'     => $order->status,
                'created_at' => $order->created_at->format('d/m/Y H:i'),
                'total'      => $order->total_amount,
                'address'    => [
                    'street'         => $order->address->calle,
                    'exteriorNumber' => $order->address->numero_exterior,
                    'interiorNumber' => $order->address->numero_interior,
                    'colony'         => $order->address->colonia,
                    'postalCode'     => $order->address->codigo_postal,
                    'city'           => $order->address->ciudad,
                    'state'          => $order->address->estado,
                ],
                'is_pickup'   => $isPickup,
                'items' => $order->items->map(function($item) {
                    return [
                        'id'            => $item->id_order_item,
                        'product_name'  => $item->product->name,
                        'product_image' => $item->product->image,
                        'quantity'      => $item->quantity,
                        'price'         => $item->price,
                        'subtotal'      => $item->quantity * $item->price,
                    ];
                }),
                'payment_proofs' => $order->payment_proofs->map(function($proof) {
                    return [
                        'id'         => $proof->id_payment_proof,
                        'file_path'  => $proof->file_path,
                        'file_name'  => $proof->file_name,
                        'notes'      => $proof->notes,
                        'status'     => $proof->status,
                        'admin_notes'=> $proof->admin_notes,
                        'created_at' => $proof->created_at->format('d/m/Y H:i'),
                    ];
                }),
                'has_dhl_label' => !empty($order->dhl_label_path),
            ]
        ]);
    }
    
    public function checkExpiredOrders()
    {
        $now = Carbon::now();
        $expiredOrders = Order::where('status', 'pending_payment')
            ->where('expires_at', '<', $now)
            ->get();
            
        $processed = 0;
        
        foreach ($expiredOrders as $order) {
            foreach ($order->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->disponibility += $item->quantity; 
                    $product->reserved_stock -= $item->quantity;
                    $product->save();
                }
            }
            
            $order->status = 'cancelled';
            $order->save();
            
            $processed++;
        }
        
        return response()->json(['processed' => $processed]);
    }
    
    public function getUserOrders()
    {
        $user = Auth::user();
        // Solo exponer los campos mínimos necesarios para la vista
        $orders = Order::where('user_id', $user->id)
            ->select('id_order', 'status', 'total_amount', 'created_at', 'expires_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id_order'     => $order->id_order,
                    'status'       => $order->status,
                    'total_amount' => $order->total_amount,
                    // Usar formato ISO para que JavaScript lo maneje correctamente (evitar "Invalid Date")
                    'created_at'   => $order->created_at ? $order->created_at->toIso8601String() : null,
                    'expires_at'   => $order->expires_at ? \Carbon\Carbon::parse($order->expires_at)->toIso8601String() : null,
                ];
            });

        // Renderizar OrdersList con datos reducidos
        return Inertia::render('OrdersList', [
            'orders' => $orders,
        ]);
    }

    /**
     * Muestra la lista de órdenes para el panel de administración
     */
    public function adminIndex(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        
    $query = Order::with(['user', 'address'])
                    ->select('orders.*')
                    ->selectRaw('(SELECT COUNT(*) FROM order_items WHERE order_items.order_id = orders.id_order) as items_count')
                    ->orderBy('created_at', 'desc');
        
        // Aplicar filtros
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('id_order', 'like', "%$search%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%$search%")
                                ->orWhere('email', 'like', "%$search%");
                  });
            });
        }
        if ($status) {
            $query->where('status', $status);
        }

        $orders = $query->paginate(10);

        return Inertia::render('Admin/OrdersAdmin', [
           'orders' => $orders->getCollection()->map(function ($order) {
                $isPickup = false;
                if ($order->address) {
                    $isPickup = (
                        ($order->address->referencia && $order->address->referencia === 'Recoger en sucursal') ||
                        ($order->address->calle && str_starts_with($order->address->calle, 'REFACCIONES EL BOOM'))
                    );
                }
                $customerName = $order->user ? $order->user->name : ($order->guest_name ?? 'Invitado');
                $customerEmail = $order->user ? $order->user->email : ($order->guest_email ?? 'Sin email');

                return [
                    'id_order'       => $order->id_order,
                    'customer_name'  => $customerName,
                    'customer_email' => $customerEmail,
                    'total_amount'   => $order->total_amount,
                    'status'         => $order->status,
                    // Mostrar hora local de CDMX; evita el desfase que veías por UTC
                    'created_at'     => $order->created_at->copy()->setTimezone('America/Mexico_City')->format('d/m/Y H:i'),
                    'items_count'    => $order->items_count,
                    'has_dhl_label'  => !empty($order->dhl_label_path),
                    'has_shipping_order_pdf' => !empty($order->shipping_order_pdf),
                    'shipping_email_sent_at' => $order->shipping_email_sent_at,
                    'is_pickup'      => $isPickup,

                ];
            }),
            'filters'    => [
                'search' => $search,
                'status' => $status,
            ],
            'pagination' => [
                'total'        => $orders->total(),
                'per_page'     => $orders->perPage(),
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
            ],
        ]);
    }

    /**
     * Actualiza el estado de una orden
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending_payment,payment_uploaded,payment_verified,processing,shipped,delivered,cancelled,rejected'
        ]);
    
        $order = Order::findOrFail($id);
        $oldStatus = $order->status;
        $newStatus = $request->status;
        
        // Verificación especial para el estado rejected
        if ($newStatus === 'rejected' && $order->payment_proofs()->exists()) {
            // Asegurarnos de marcar los comprobantes como rechazados también
            $order->payment_proofs()->update(['status' => 'rejected']);
        }
        
        $order->status = $newStatus;
        $order->save();
    
        // Si el estado cambia a payment_verified, ajustar el stock reservado
        if ($newStatus === 'payment_verified' && $oldStatus !== 'payment_verified') {
            foreach ($order->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    // El stock disponible ya fue reducido, solo ajustamos el reservado
                    $product->reserved_stock -= $item->quantity;
                    $product->save();
                }
            }
        }
        
        // Si el estado cambia a cancelled o rejected, restaurar el stock
        if (($newStatus === 'cancelled' || $newStatus === 'rejected') && 
            $oldStatus !== 'cancelled' && $oldStatus !== 'rejected') {
            
            // Log para debugging
            // \Log::info("Restaurando stock para orden #{$id}. Estado anterior: {$oldStatus}, Nuevo estado: {$newStatus}");
            
            foreach ($order->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    // Log para cada producto
                    // \Log::info("Producto #{$product->id_product}: Disponibilidad antes: {$product->disponibility}, Reserved antes: {$product->reserved_stock}");
                    
                    // Devolver stock al inventario disponible
                    $product->disponibility += $item->quantity;
                    
                    // Reducir el stock reservado si aún existe
                    if ($product->reserved_stock > 0) {
                        $product->reserved_stock -= min($item->quantity, $product->reserved_stock);
                    }
                    $product->save();
                    
                    // \Log::info("Producto #{$product->id_product}: Disponibilidad después: {$product->disponibility}, Reserved después: {$product->reserved_stock}");
                }
            }
        }
    
        return redirect()->back()->with('success', 'Estado de la orden actualizado correctamente');
    }

public function cancelOrder($id)
{
    $order = Order::findOrFail($id);
    
    // Verificar que el usuario es el dueño de la orden
    if ($order->user_id !== Auth::id()) {
        return redirect()->back()->with('error', 'No tienes permiso para cancelar esta orden');
    }
    
    // Verificar que la orden está en un estado que se puede cancelar
    if ($order->status !== 'pending_payment') {
        return redirect()->back()->with('error', 'Solo se pueden cancelar órdenes pendientes de pago');
    }
    
            // Restaurar stock
            DB::beginTransaction();
            try {
                foreach ($order->items as $item) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        // Devolver stock al inventario disponible
                        $product->disponibility += $item->quantity;
                        
                        // Reducir el stock reservado si aún existe
                        if ($product->reserved_stock > 0) {
                            $product->reserved_stock -= min($item->quantity, $product->reserved_stock);
                        }
                        $product->save();
                        
                        // Log::info("Stock restaurado para producto #{$product->id_product}: disponibility={$product->disponibility}, reserved_stock={$product->reserved_stock}");
                    }
                }
                
                // Actualizar estado de la orden
                $order->status = 'cancelled';
                $order->save();

                // Actualizar el registro de pago si existe
                $payment = Payment::where('order_id', $order->id_order)->first();
                if ($payment) {
                    $payment->status = 'cancelled';
                    $payment->save();
                }

                DB::commit();
                // Log::info("Orden #{$order->id_order} cancelada y stock restaurado correctamente.");
            } catch (\Exception $e) {
                DB::rollBack();
                // Log::error("Error restaurando stock para orden #{$order->id_order}: " . $e->getMessage());
                throw $e;
            }    return redirect()->route('orders.show', ['id' => $id])
        ->with('success', 'Orden cancelada exitosamente. Los productos han vuelto al inventario.');
}

    /**
 * Rechaza un comprobante de pago y actualiza el estado de la orden
 */
    public function reject(Request $request, $id)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:255'
        ]);

        $paymentProof = PaymentProof::findOrFail($id);
        $paymentProof->status = 'rejected';
        $paymentProof->admin_notes = $request->admin_notes;
        $paymentProof->save();

        // Actualizar estado de la orden
        $order = Order::findOrFail($paymentProof->order_id);
        $oldStatus = $order->status;
        $order->status = 'rejected';
        $order->save();

        // Restaurar stock
        if ($oldStatus !== 'cancelled' && $oldStatus !== 'rejected') {
            foreach ($order->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    // Devolver stock al inventario disponible
                    $product->disponibility += $item->quantity;

                    // Reducir el stock reservado si aún existe
                    if ($product->reserved_stock > 0) {
                        $product->reserved_stock -= min($item->quantity, $product->reserved_stock);
                    }
                    $product->save();
                }
            }
        }

        return redirect()->back()->with('success', 'Comprobante de pago rechazado correctamente');
    }

    public function downloadShippingPdf($id)
    {
        $order = Order::findOrFail($id);
        
        // Verificar si existe el campo
        if (!$order->shipping_order_pdf) {
            return redirect()->back()->with('error', 'No se encontró la ruta del PDF en la orden.');
        }
        
        $filePath = storage_path('app/public/' . $order->shipping_order_pdf);
        
        // Log para diagnóstico
        // \Log::info("Intentando descargar PDF: {$filePath}");
        
        // Verificar si el archivo existe físicamente
        if (!file_exists($filePath)) {
            // \Log::error("El archivo PDF no existe en la ruta: {$filePath}");
            return redirect()->back()->with('error', 'El archivo PDF no existe en el servidor.');
        }
        
        return response()->download($filePath, 'orden_surtido_' . $order->id_order . '.pdf');
    }

    /**
     * Descarga la etiqueta DHL asociada a la orden (solo admin)
     */
    public function downloadDhlLabel($id)
    {
        $order = Order::findOrFail($id);

        if (!$order->dhl_label_path) {
            return redirect()->back()->with('error', 'No se encontró la etiqueta DHL para esta orden.');
        }

        $filePath = storage_path('app/public/' . $order->dhl_label_path);

        if (!file_exists($filePath)) {
            return redirect()->back()->with('error', 'La etiqueta DHL no existe en el servidor.');
        }

        // Mostrar en el navegador en lugar de forzar descarga
        return response()->file($filePath, [
            'Content-Type' => 'application/pdf',
        ]);
    }
    /**
     * Muestra el formulario de rastreo para invitados
     */
    public function guestLookupForm()
    {
        return Inertia::render('GuestOrderLookup');
    }

    /**
     * Procesa la búsqueda de pedido para invitados
     */
    public function guestLookup(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'order_id' => 'required|integer',
        ]);

        $order = Order::where('id_order', $request->order_id)
            ->where('guest_email', $request->email)
            ->first();

        if (!$order) {
            return back()->with('error', 'No se encontró ningún pedido con esos datos. Verifica el correo y el número de orden.');
        }

        // Si se encuentra la orden, buscamos todas las órdenes asociadas a ese correo
        // para mostrarlas en la lista, similar a un usuario logeado.
        $orders = Order::where('guest_email', $request->email)
            ->select('id_order', 'status', 'total_amount', 'created_at', 'expires_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($o) use ($order) {
                // "Desbloquear" cada orden encontrada en la sesión para que puedan ver detalles
                session(["unlocked_order_{$o->id_order}" => true]);
                
                return [
                    'id_order'     => $o->id_order,
                    'status'       => $o->status,
                    'total_amount' => $o->total_amount,
                    'created_at'   => $o->created_at ? $o->created_at->toIso8601String() : null,
                    'expires_at'   => $o->expires_at ? \Carbon\Carbon::parse($o->expires_at)->toIso8601String() : null,
                ];
            });

        return Inertia::render('OrdersList', [
            'orders' => $orders,
            'isGuest' => true,
        ]);
    }
}
