@extends('layouts.payment')

@section('additional_head')
    {{-- Fallback automático si algo evita la ejecución de JS (solo cuando NO estamos en modo guard) --}}
    @if(!request()->boolean('guard'))
        <meta http-equiv="refresh" content="6; url={{ route('payment.cancelled.page', ['order_id' => request()->query('order_id')]) }}">
    @endif
@endsection

@section('additional_styles')
<style>
    .redirect-header {
        background: linear-gradient(135deg, var(--primary-color), #5c6bc0);
        color: white;
    }
    .redirect-icon {
        font-size: 56px;
        color: white;
        animation: spin 1.2s linear infinite;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .hint {
        color: #6c757d;
        font-size: 14px;
    }
    .progress-bar {
        height: 6px;
        background: rgba(255,255,255,0.2);
        border-radius: 6px;
        overflow: hidden;
        margin-top: 10px;
    }
    .progress-fill {
        width: 35%;
        height: 100%;
        background: #fff;
        opacity: .85;
        animation: load 2s ease-in-out infinite;
    }
    @keyframes load {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(20%); }
        100% { transform: translateX(120%); }
    }
</style>
@endsection

@section('content')
<div class="row justify-content-center">
    <div class="col-lg-7 col-md-9 col-12">
        <div class="card hover-card">
            <div class="card-header redirect-header">
                <div class="icon-container">
                    <i class="fas fa-circle-notch redirect-icon"></i>
                </div>
                <h4 class="mb-0 text-black">Redirigiendo…</h4>
                <div class="progress-bar"><div class="progress-fill"></div></div>
            </div>
            <div class="card-body text-center">
                <p class="mb-2">Te estamos enviando a la vista correspondiente, por favor espere. Gracias.</p>
                <p class="hint">Si no pasa nada en unos segundos, <a id="cancelLink" href="{{ route('payment.cancelled.page', ['order_id' => request()->query('order_id')]) }}">haz clic aquí</a>.</p>
                <noscript>
                    <div class="alert alert-warning mt-3" role="alert">
                        JavaScript está deshabilitado. Serás redirigido automáticamente en unos segundos, o <a href="{{ route('payment.cancelled.page', ['order_id' => request()->query('order_id')]) }}">haz clic aquí</a>.
                    </div>
                </noscript>
            </div>
        </div>
    </div>
    </div>
@endsection

@section('additional_scripts')
<script>
    (function(){
    const params = new URLSearchParams(location.search);
    const orderId = params.get('order_id');
    const guard = params.get('guard') === '1';
    const nextParam = params.get('next');
    const nextUrl = nextParam ? decodeURIComponent(nextParam) : null;
        const baseUrl = new URL(window.location.href);
        baseUrl.searchParams.delete('guard');
        baseUrl.searchParams.delete('next');
        const cancelUrl = `{{ route('payment.cancelled.page') }}` + (orderId ? `?order_id=${orderId}` : '');

        function cancelAndGo(){
            if (orderId) {
                try { navigator.sendBeacon(`{{ route('payment.navigation.cancel') }}` + `?order_id=${orderId}`); } catch(e) {}
            }

            try {
                sessionStorage.removeItem('boom_openpay_expect_back');
                sessionStorage.removeItem('boom_openpay_order_id');
            } catch(e){}
            setTimeout(function(){ window.location.replace(cancelUrl); }, 120);
        }

        function prepareReturnEntry(){

            try { history.pushState({boom: 'payment-openpay'}, '', baseUrl.toString()); } catch(e) {}
        }

        const isGuard = !!(guard && nextUrl);

        document.addEventListener('DOMContentLoaded', function(){
            if (isGuard) {
    
                prepareReturnEntry();
    
                setTimeout(function(){ window.location.assign(nextUrl); }, 50);
            } else {
    
                cancelAndGo();
            }
        });

        window.addEventListener('pageshow', function(ev){
            if (!isGuard) {
                cancelAndGo();
            }
        });

        document.getElementById('cancelLink')?.addEventListener('click', function(ev){ ev.preventDefault(); cancelAndGo(); });
    })();
    </script>
@endsection
