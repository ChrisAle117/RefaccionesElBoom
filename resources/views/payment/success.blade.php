
@extends('layouts.payment')

@section('additional_styles')
<style>
    .success-header {
        background: linear-gradient(135deg, #38c172, #2dbb5f);
        color: white;
    }
    
    .tracking-info {
        display: flex;
        margin-top: 20px;
        justify-content: space-between;
        background: #f8f9fa;
        border-radius: 10px;
        padding: 15px;
        border-left: 4px solid #38c172;
    }
    
    .tracking-step {
        text-align: center;
        position: relative;
        flex: 1;
    }
    
    .tracking-step:not(:last-child)::after {
        content: '';
        position: absolute;
        top: 15px;
        right: -50%;
        width: 100%;
        height: 2px;
        background-color: #dee2e6;
        z-index: 0;
    }
    
    .step-icon {
        background-color: #38c172;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 10px;
        position: relative;
        z-index: 1;
    }
    
    .step-label {
        font-size: 12px;
        font-weight: 500;
    }
    
    .thank-you {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 20px;
        color: #38c172;
    }
    
    .email-notice {
        background-color: #e9f7ef;
        border-radius: 8px;
        padding: 15px;
        margin-top: 20px;
        display: flex;
        align-items: center;
    }
    
    .email-icon {
        margin-right: 15px;
        font-size: 24px;
        color: #38c172;
    }
    
    .order-details {
        background-color: white;
        border-radius: 12px;
        padding: 20px;
        margin-top: 20px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        border-left: 4px solid #38c172;
    }
    
    .product-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        padding: 10px;
        background-color: #f8f9fa;
        border-radius: 8px;
        transition: all 0.2s;
    }
    
    .product-item:hover {
        transform: translateX(5px);
        background-color: #f0f0f0;
    }
    
    .product-quantity {
        background-color: #38c172;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
        font-weight: bold;
        font-size: 12px;
    }
    
    .section-title {
        font-weight: 600;
        margin-bottom: 15px;
        color: #343a40;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
    }
    
    /* Ajustes responsivos */
    @media (max-width: 768px) {
        .tracking-info {
            flex-wrap: wrap;
            padding: 10px;
        }
        
        .tracking-step {
            flex-basis: 50%;
            margin-bottom: 15px;
        }
        
        .tracking-step::after {
            display: none;
        }
        
        .thank-you {
            font-size: 20px;
        }
    }
    
    @media (max-width: 576px) {
        .tracking-step {
            flex-basis: 100%;
        }
        
        .email-notice {
            flex-direction: column;
            text-align: center;
        }
        
        .email-icon {
            margin: 0 0 10px 0;
        }
    }
</style>
@endsection

@section('content')
<div class="row justify-content-center">
    <div class="col-lg-8 col-md-10 col-12">
        <div class="card">
            <div class="card-header success-header">
                <div class="icon-container">
                    <i class="fas fa-check-circle status-icon"></i>
                </div>
                <h4 class="mb-0">¡Gracias por tu compra!</h4>
            </div>
            
            <div class="card-body">
                <div class="text-center">
                    <p class="thank-you">Tu pedido empezará con el procesamiento de surtido para posteriormente pasar a embalaje</p>
                </div>

                @if(isset($order) && $order)
                    <div class="order-details">
                        <h5 class="section-title">Detalles del pedido:</h5>
                        <div class="row">
                            <div class="col-md-4">
                                <p><i class="fas fa-receipt me-2"></i> <strong>Orden:</strong> #{{ $order->id_order }}</p>
                            </div>
                            <div class="col-md-4">
                                <p><i class="fas fa-money-bill-wave me-2"></i> <strong>Total:</strong> ${{ number_format($order->total_amount, 2) }}</p>
                            </div>
                            <div class="col-md-4">
                                <p><span class="badge bg-success"><i class="fas fa-check me-1"></i> Pago confirmado</span></p>
                            </div>
                        </div>
                        
                        @if(isset($order->items) && is_object($order->items) && $order->items->count() > 0)
                            <h5 class="section-title mt-4">Productos:</h5>
                            <div class="products-container">
                                @foreach($order->items as $item)
                                    <div class="product-item">
                                        <span class="product-quantity">{{ $item->quantity }}</span>
                                        <div>
                                            <strong>{{ isset($item->product) && is_object($item->product) ? ($item->product->name ?? 'Producto') : 'Producto' }}</strong>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                            
                            <div class="alert alert-info mt-3">
                                <i class="fas fa-box me-2"></i>
                                <strong>Tu pedido será embalado y posteriormente enviado.</strong>
                            </div>
                        @endif
                        
                        <div class="tracking-info mt-4">
                            <div class="tracking-step">
                                <div class="step-icon">
                                    <i class="fas fa-check"></i>
                                </div>
                                <div class="step-label">Pedido recibido</div>
                            </div>
                            <div class="tracking-step">
                                <div class="step-icon">
                                    <i class="fas fa-box"></i>
                                </div>
                                <div class="step-label">En preparación</div>
                            </div>
                            <div class="tracking-step">
                                <div class="step-icon">
                                    <i class="fas fa-shipping-fast"></i>
                                </div>
                                <div class="step-label">En camino</div>
                            </div>
                            <div class="tracking-step">
                                <div class="step-icon">
                                    <i class="fas fa-home"></i>
                                </div>
                                <div class="step-label">Entregado</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="email-notice">
                        <i class="fas fa-envelope email-icon"></i>
                        <div>
                            <strong>¡Detalles enviados a tu correo!</strong>
                            <p class="mb-0">Hemos enviado la confirmación y detalles de seguimiento a tu email registrado.</p>
                        </div>
                    </div>
                @else
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i> Tu pago ha sido procesado correctamente. Gracias por tu compra.
                    </div>
                @endif
                
                <div class="text-center mt-4">
                    <a href="/dashboard" class="btn btn-primary me-2">
                        <i class="fas fa-shopping-cart me-1"></i> Seguir comprando
                    </a>
                    <a href="/orders" class="btn btn-outline-secondary">
                        <i class="fas fa-box me-1"></i> Ver mis pedidos
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('additional_scripts')
<script>
    try {
        sessionStorage.removeItem('boom_openpay_expect_back');
        sessionStorage.removeItem('boom_openpay_order_id');
    } catch (e) {}

    document.addEventListener('DOMContentLoaded', function() {
        const productItems = document.querySelectorAll('.product-item');
        productItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = 0;
                item.style.transform = 'translateX(-10px)';
                setTimeout(() => {
                    item.style.transition = 'all 0.3s ease';
                    item.style.opacity = 1;
                    item.style.transform = 'translateX(0)';
                }, 50);
            }, 100 * index);
        });
    });
</script>
@endsection