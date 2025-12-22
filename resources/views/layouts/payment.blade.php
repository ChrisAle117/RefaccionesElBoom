<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <title>{{ config('app.name') }} - Procesamiento de pago</title>
    
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="icon" href="{{ asset('favicon.ico') }}" type="image/x-icon">
    
    @include('payment.cancel-script')
    @yield('additional_head')
    
    {{-- Google tag (gtag.js) - load if GA4 or Google Ads is configured --}}
    @if (config('services.ga.measurement_id') || config('services.google_ads.conversion_id'))
        @php
            $gtagId = config('services.ga.measurement_id') ?: config('services.google_ads.conversion_id');
        @endphp
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ $gtagId }}"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);} 
            gtag('js', new Date());
            @if (config('services.ga.measurement_id'))
                gtag('config', '{{ config('services.ga.measurement_id') }}');
            @endif
            @if (config('services.google_ads.conversion_id'))
                gtag('config', '{{ config('services.google_ads.conversion_id') }}');
            @endif
        </script>
    @endif
    
    <style>
        :root {
            --primary-color: #3490dc;
            --success-color: #38c172;
            --warning-color: #ffcc00;
            --danger-color: #e3342f;
            --dark-color: #343a40;
            --light-color: #f8f9fa;
            --body-color: #f7f8fc;
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', sans-serif;
            background-color: var(--body-color);
            color: #333;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .page-container {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .header-bar {
            background: linear-gradient(135deg, var(--primary-color), #5c6bc0);
            height: 5px;
            width: 100%;
        }
        
        .content-wrapper {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 15px;
        }
        
        .card {
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            border: none;
            transition: transform 0.3s ease;
            max-width: 100%;
            margin: 0 auto;
        }
        
        .card:hover {
            transform: translateY(-5px);
        }
        
        .card-header {
            text-align: center;
            border-bottom: none;
            padding: 25px 20px;
        }
        
        .card-body {
            padding: 30px 25px;
        }
        
        .icon-container {
            width: 100px;
            height: 100px;
            margin: 0 auto 25px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(255, 255, 255, 0.2);
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .status-icon {
            font-size: 50px;
            color: white;
        }
        
        .btn {
            padding: 12px 24px;
            font-weight: 500;
            border-radius: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, var(--primary-color), #5c6bc0);
            border: none;
        }
        
        .btn-outline {
            background: transparent;
            color: var(--dark-color);
            border: 1px solid #dee2e6;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 14px;
            color: #6c757d;
            background-color: white;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
        }
        
        /* Estilos responsivos */
        @media (max-width: 768px) {
            .card-body {
                padding: 20px 15px;
            }
            
            .icon-container {
                width: 80px;
                height: 80px;
                margin-bottom: 20px;
            }
            
            .status-icon {
                font-size: 40px;
            }
            
            .btn {
                padding: 10px 20px;
            }
        }
        
        @media (max-width: 576px) {
            .content-wrapper {
                padding: 20px 10px;
            }
            
            .card-header {
                padding: 20px 15px;
            }
            
            h4 {
                font-size: 18px;
            }
            
            .icon-container {
                width: 70px;
                height: 70px;
            }
            
            .status-icon {
                font-size: 35px;
            }
        }
        
        /* Animaciones */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .animate-fadeInUp {
            animation: fadeInUp 0.6s ease-out;
        }

        /* Estilos adicionales para links */
        a {
            color: var(--primary-color);
            text-decoration: none;
            transition: all 0.2s;
        }
        
        a:hover {
            color: #5c6bc0;
        }
        
        /* Espaciados consistentes */
        .mb-30 {
            margin-bottom: 30px;
        }
        
        .mt-30 {
            margin-top: 30px;
        }
        
        /* Estilos para alerts y badges */
        .alert {
            border-radius: 10px;
            padding: 15px;
        }
        
        .badge {
            padding: 8px 12px;
            font-weight: 500;
            border-radius: 6px;
        }
        
        /* Efectos hover en tarjetas */
        .hover-card {
            transition: all 0.3s ease;
        }
        
        .hover-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
    </style>
    
    @yield('additional_styles')
</head>
<body>
    <div class="page-container">
        <div class="header-bar"></div>
        
        <div class="content-wrapper">
            <div class="container">
                @yield('content')
            </div>
        </div>
        
        <footer class="footer">
            <div class="container">
                <p>© {{ date('Y') }} {{ config('app.name') }}. Todos los derechos reservados.</p>
                <p>¿Necesitas ayuda? <a href="#" class="text-decoration-none">Contacta a soporte</a></p>
            </div>
        </footer>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Animación de entrada para elementos clave
        document.addEventListener('DOMContentLoaded', function() {
            const card = document.querySelector('.card');
            if (card) {
                card.classList.add('animate-fadeInUp');
            }
        });
    </script>
    @yield('additional_scripts')
</body>
</html>