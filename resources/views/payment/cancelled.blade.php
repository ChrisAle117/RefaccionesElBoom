@extends('layouts.payment')

@section('additional_styles')
<style>
    .cancelled-header {
        background: linear-gradient(135deg, #ffcc00, #ffb700);
        color: #664d00;
    }
    
    .options-container {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-top: 30px;
    }
    
    .option-card {
        flex: 1;
        min-width: 200px;
        background: white;
        border-radius: 10px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.04);
        transition: all 0.3s ease;
    }
    
    .option-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
    }
    
    .option-icon {
        font-size: 30px;
        color: #ffcc00;
        margin-bottom: 15px;
    }
    
    .option-title {
        font-weight: 600;
        margin-bottom: 10px;
        color: #343a40;
    }
    
    .top-message {
        margin-bottom: 20px;
        font-size: 16px;
        line-height: 1.6;
    }
    
    .order-info {
        background-color: white;
        border-radius: 12px;
        padding: 20px;
        margin: 20px 0;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        border-left: 4px solid #ffcc00;
    }
    
    .order-detail-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
    }
    
    .order-detail-item:last-child {
        border-bottom: none;
    }
    
    .btn-warning-custom {
        background-color: #ffcc00;
        border-color: #ffcc00;
        color: #664d00;
    }
    
    .btn-warning-custom:hover {
        background-color: #ffb700;
        border-color: #ffb700;
        color: #664d00;
    }
    
    /* Ajustes responsivos */
    @media (max-width: 768px) {
        .options-container {
            flex-direction: column;
        }
        
        .option-card {
            width: 100%;
        }
    }
</style>
@endsection

@section('content')
<div class="row justify-content-center">
    <div class="col-lg-8 col-md-10 col-12">
        <div class="card">
            <div class="card-header cancelled-header">
                <div class="icon-container">
                    <i class="fas fa-pause-circle status-icon"></i>
                </div>
                <h4 class="mb-0">Proceso de pago cancelado</h4>
            </div>
            
            <div class="card-body">
                <div class="text-center mb-4">
                    <p class="top-message">Has cancelado el proceso de pago. No te preocupes, tu carrito sigue disponible y puedes completar la compra cuando lo desees.</p>
                </div>
                
                @if($order)
                    <div class="order-info">
                        <h5 class="mb-3"><i class="fas fa-info-circle me-2"></i> Información del pedido cancelado:</h5>
                        <div class="order-detail-item">
                            <span><i class="fas fa-receipt me-2"></i> Número de orden:</span>
                            <strong>#{{ $order->id_order }}</strong>
                        </div>
                        <div class="order-detail-item">
                            <span><i class="fas fa-money-bill-wave me-2"></i> Total:</span>
                            <strong>${{ number_format($order->total_amount, 2) }}</strong>
                        </div>
                        <div class="order-detail-item">
                            <span><i class="fas fa-tag me-2"></i> Estado:</span>
                            <span class="badge bg-warning text-dark"><i class="fas fa-exclamation-circle me-1"></i> Pago cancelado</span>
                        </div>
                    </div>
                @endif
                
                <!-- <div class="options-container">
                    <div class="option-card">
                        <div class="option-icon">
                            <i class="fas fa-redo-alt"></i>
                        </div>
                        <h5 class="option-title">Reintentar pago</h5>
                        <p>Puedes intentar completar tu pago nuevamente cuando estés listo</p>
                        <a href="{{ route('confirmation') }}" class="btn btn-warning-custom">
                            <i class="fas fa-shopping-cart me-1"></i> Ir al carrito
                        </a>
                    </div> -->
                    
                    <div class="option-card">
                        <div class="option-icon">
                            <i class="fas fa-headset"></i>
                        </div>
                        <h5 class="option-title">¿Necesitas ayuda?</h5>
                        <p>Nuestro equipo está disponible para asistirte con tu compra</p>
                        <a href="#" class="btn btn-outline-dark">
                            <i class="fas fa-comments me-1"></i> Contactar soporte
                        </a>
                    </div>
                </div>
                
                <div class="text-center mt-4">
                    <a href="{{ route('dashboard') }}" class="btn btn-primary">
                        <i class="fas fa-home me-1"></i> Volver al inicio
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('additional_scripts')
<script>
    // Animación adicional para elementos específicos
    document.addEventListener('DOMContentLoaded', function() {
        const optionCards = document.querySelectorAll('.option-card');
        optionCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = 0;
                setTimeout(() => {
                    card.style.transition = 'all 0.5s ease';
                    card.style.opacity = 1;
                }, 50);
            }, 200 * index);
        });
    });
</script>
@endsection