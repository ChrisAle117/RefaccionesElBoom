@extends('layouts.payment')

@section('additional_styles')
<style>
    .error-header {
        background: linear-gradient(135deg, #e3342f, #c23321);
        color: white;
    }
    
    .error-message {
        background-color: #fdeded;
        border-left: 4px solid #e3342f;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
    }
    
    .error-code {
        background-color: #f8d7da;
        padding: 5px 10px;
        border-radius: 5px;
        font-family: monospace;
        margin-left: 5px;
    }
    
    .troubleshoot-section {
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 20px;
        margin-top: 20px;
    }
    
    .troubleshoot-title {
        font-weight: 600;
        color: #343a40;
        margin-bottom: 15px;
        display: flex;
        align-items: center;
    }
    
    .troubleshoot-title i {
        margin-right: 10px;
        color: #e3342f;
    }
    
    .troubleshoot-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .troubleshoot-list li {
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 8px;
        background-color: white;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.03);
        display: flex;
        align-items: flex-start;
        transition: all 0.2s ease;
    }
    
    .troubleshoot-list li:hover {
        transform: translateX(5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    }
    
    .troubleshoot-list li:last-child {
        margin-bottom: 0;
    }
    
    .troubleshoot-icon {
        color: #e3342f;
        margin-right: 15px;
        font-size: 18px;
        margin-top: 3px;
    }
    
    .error-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        justify-content: center;
        margin-top: 30px;
    }
    
    .error-actions .btn {
        min-width: 180px;
    }
    
    /* Efecto de parpadeo para icono de error */
    @keyframes pulse-red {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0.7;
        }
        100% {
            opacity: 1;
        }
    }
    
    .pulse-animation {
        animation: pulse-red 2s infinite;
    }
    
    /* Ajustes responsivos */
    @media (max-width: 768px) {
        .error-actions {
            flex-direction: column;
        }
        
        .error-actions .btn {
            width: 100%;
        }
    }
    
    @media (max-width: 576px) {
        .troubleshoot-list li {
            padding: 12px;
        }
        
        .troubleshoot-icon {
            font-size: 16px;
        }
    }
</style>
@endsection

@section('content')
<div class="row justify-content-center">
    <div class="col-lg-8 col-md-10 col-12">
        <div class="card">
            <div class="card-header error-header">
                <div class="icon-container">
                    <i class="fas fa-exclamation-triangle status-icon pulse-animation"></i>
                </div>
                <h4 class="mb-0">Error en el proceso de pago</h4>
            </div>
            
            <div class="card-body">
                <div class="error-message">
                    <h5><i class="fas fa-times-circle me-2"></i> Error detectado</h5>
                    @if(session('error'))
                        <p class="mb-0">{{ session('error') }}</p>
                    @else
                        <p class="mb-0">Ha ocurrido un error durante el proceso de pago. Por favor, verifica los detalles e intenta nuevamente.</p>
                    @endif
                </div>
                
                <div class="troubleshoot-section">
                    <h5 class="troubleshoot-title">
                        <i class="fas fa-tools"></i>
                        <span>Posibles soluciones:</span>
                    </h5>
                    
                    <ul class="troubleshoot-list">
                        <li>
                            <i class="fas fa-redo-alt troubleshoot-icon"></i>
                            <div>
                                <strong>Intentar nuevamente</strong>
                                <p class="mb-0">A veces los problemas de pago son temporales. Espera unos minutos e intenta procesar el pago nuevamente.</p>
                            </div>
                        </li>
                        <li>
                            <i class="fas fa-credit-card troubleshoot-icon"></i>
                            <div>
                                <strong>Verifica tu método de pago</strong>
                                <p class="mb-0">Asegúrate de que tu tarjeta o método de pago tiene fondos suficientes y está habilitado para compras en línea.</p>
                            </div>
                        </li>
                        <li>
                            <i class="fas fa-lock troubleshoot-icon"></i>
                            <div>
                                <strong>Contacta a tu banco</strong>
                                <p class="mb-0">En ocasiones, los bancos bloquean transacciones por seguridad. Verifica con tu banco si hay alguna restricción.</p>
                            </div>
                        </li>
                        <li>
                            <i class="fas fa-wifi troubleshoot-icon"></i>
                            <div>
                                <strong>Revisa tu conexión</strong>
                                <p class="mb-0">Asegúrate de tener una conexión estable a Internet y que no haya interrupciones durante el pago.</p>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <div class="error-actions">
                    <a href="{{ route('cart.view') }}" class="btn btn-primary">
                        <i class="fas fa-shopping-cart me-1"></i> Volver al carrito
                    </a>
                    <a href="#" class="btn btn-outline-danger">
                        <i class="fas fa-headset me-1"></i> Contactar soporte
                    </a>
                    <a href="{{ route('dashboard') }}" class="btn btn-outline-secondary">
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
        const listItems = document.querySelectorAll('.troubleshoot-list li');
        listItems.forEach((item, index) => {
            item.style.opacity = 0;
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
                item.style.transition = 'all 0.5s ease';
                item.style.opacity = 1;
                item.style.transform = 'translateY(0)';
            }, 300 + (100 * index));
        });
    });
</script>
@endsection