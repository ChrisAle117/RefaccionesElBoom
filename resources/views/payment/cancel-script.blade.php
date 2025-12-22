@section('additional_head')
<script>
    // Script para detectar cuando el usuario usa el botón atrás del navegador durante el proceso de pago
    (function(){
        function isOpenpay() {
            return window.location.href.includes('sandbox-api.openpay.mx') || window.location.href.includes('api.openpay.mx');
        }
        function cancelIfPossible(){
            try{
                const url = new URL(window.location.href);
                const orderIdParam = url.searchParams.get('order_id');
                if (orderIdParam) {
                    navigator.sendBeacon('{{ route('payment.navigation.cancel') }}?order_id=' + orderIdParam);
                }
            }catch(e){}
        }
        window.addEventListener('beforeunload', function(){ if (isOpenpay()) cancelIfPossible(); });
        window.addEventListener('pageshow', function(ev){ if (isOpenpay() && ev.persisted) cancelIfPossible(); });
        window.addEventListener('popstate', function(){ if (isOpenpay()) cancelIfPossible(); });
    })();
</script>
@endsection
