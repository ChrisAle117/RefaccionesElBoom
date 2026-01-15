<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        
        {{-- Performance Hints --}}
        <link rel="preconnect" href="https://resources.openpay.mx">
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link rel="preconnect" href="https://www.googletagmanager.com">
        <link rel="preconnect" href="https://www.google-analytics.com">
        <link rel="dns-prefetch" href="https://resources.openpay.mx">
        <link rel="dns-prefetch" href="https://fonts.bunny.net">
        <link rel="dns-prefetch" href="https://www.googletagmanager.com">
        
        {{-- Defer Openpay scripts to avoid render blocking --}}
        <script type="text/javascript" src="https://resources.openpay.mx/lib/openpay.v1.min.js" defer></script>
        <script type="text/javascript" src="https://resources.openpay.mx/lib/openpay-data.v1.min.js" defer></script>

        @php
            $currentPath = request()->path();
            $type = request()->query('type');
            
            $title = "Refaccionaria El Boom - Tractopartes Nuevas y Usadas";
            $description = "Refaccionaria El Boom - Venta de tractopartes nuevas y usadas. Encuentra las mejores refacciones para tu transporte de carga en un solo lugar.";
            
            if (str_contains($currentPath, 'productos')) {
                $title = $type ? ucfirst($type) . " | Refaccionaria El Boom" : "Catálogo de Productos | Refaccionaria El Boom";
                $description = "Explora nuestro catálogo de refacciones" . ($type ? " para $type" : "") . ": faros LED, bocinas, suspensiones y más.";
            } elseif (str_contains($currentPath, 'nosotros')) {
                $title = "Sobre Nosotros | Refaccionaria El Boom";
                $description = "Conoce la historia y el compromiso de Refaccionaria El Boom con el transporte de carga en México.";
            } elseif (str_contains($currentPath, 'sucursales')) {
                $title = "Nuestras Sucursales | Refaccionaria El Boom";
                $description = "Encuentra la sucursal de Refaccionaria El Boom más cercana a ti.";
            } elseif (str_contains($currentPath, 'deshuesadero')) {
                $title = "Deshuesadero de Tractocamiones | Refaccionaria El Boom";
                $description = "Venta de tractopartes usadas y componentes recuperados con garantía.";
            }
        @endphp

        {{-- SEO Meta Tags --}}
        <title inertia>{{ $title }}</title>
        <meta name="description" content="{{ $description }}">
        <meta name="keywords" content="tractopartes, refacciones, tractocamiones, El Boom, diesel, partes de motor, transmisión, colisión, refaccionaria, deshuesadero,tractopartes usadas">
        <meta name="author" content="Refaccionaria El Boom">

        {{-- Open Graph / Facebook --}}
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="{{ $title }}">
        <meta property="og:description" content="{{ $description }}">
        <meta property="og:image" content="{{ asset('images/logotipo.png') }}">

        {{-- Twitter --}}
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{{ url()->current() }}">
        <meta property="twitter:title" content="{{ $title }}">
        <meta property="twitter:description" content="{{ $description }}">
        <meta property="twitter:image" content="{{ asset('images/logotipo.png') }}">

        {{-- CSRF Token --}}
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>


        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap" rel="stylesheet" />
        <link rel="icon" href="{{ asset('favicon.ico') }}" type="image/x-icon">
        
        

        {{-- Google Tag Manager (GTM) - head --}}
        @if (config('services.gtm.container_id'))
            <script>
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','{{ config('services.gtm.container_id') }}');
            </script>
        @endif

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
                    gtag('config', '{{ config('services.ga.measurement_id') }}', {
                        send_page_view: {{ config('services.ga.send_manual_pageviews') ? 'false' : 'true' }}
                    });
                @endif
                @if (config('services.google_ads.conversion_id'))
                    // Ensure Google Ads config is initialized on all pages
                    gtag('config', '{{ config('services.google_ads.conversion_id') }}');
                @endif
            </script>
        @endif

        @routes
        @viteReactRefresh
        @if(isset($page) && is_array($page) && isset($page['component']))
            @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @else
            @vite(['resources/js/app.tsx'])
        @endif
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        {{-- GTM NoScript --}}
        @if (config('services.gtm.container_id'))
            <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ config('services.gtm.container_id') }}"
                height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        @endif
        @inertia

        {{-- SPA manual page_view tracking if enabled --}}
        @if (config('services.ga.measurement_id') && config('services.ga.send_manual_pageviews'))
            <script>
                (function(){
                    function sendPageView(){
                        if (typeof gtag === 'function') {
                            gtag('event','page_view',{
                                page_title: document.title,
                                page_location: location.href,
                                page_path: location.pathname + location.search
                            });
                        } else if (window.dataLayer) {
                            window.dataLayer.push({
                                event: 'page_view',
                                page_title: document.title,
                                page_location: location.href,
                                page_path: location.pathname + location.search
                            });
                        }
                    }
                    // initial
                    sendPageView();
                    // intercept pushState/replaceState
                    var _ps = history.pushState, _rs = history.replaceState;
                    history.pushState = function(){ _ps.apply(this, arguments); sendPageView(); };
                    history.replaceState = function(){ _rs.apply(this, arguments); sendPageView(); };
                    // back/forward
                    window.addEventListener('popstate', sendPageView);
                })();
            </script>
        @endif

        {{-- Google Ads conversion on next render via flash session --}}
        @if (config('services.google_ads.conversion_id') && config('services.google_ads.conversion_label') && session('ads_conversion'))
            <script>
                (function(){
                    var firedKey = 'ads_conv_fired_{{ data_get(session('ads_conversion'),'transaction_id') }}';
                    try {
                        if (sessionStorage.getItem(firedKey)) return;
                    } catch(e) {}
                    var payload = {
                        'send_to': '{{ config('services.google_ads.conversion_id') }}/{{ config('services.google_ads.conversion_label') }}',
                        'value': {{ (float) data_get(session('ads_conversion'),'value', 1.0) }},
                        'currency': '{{ e(data_get(session('ads_conversion'),'currency', config('services.google_ads.currency','MXN'))) }}',
                        'transaction_id': '{{ e((string) data_get(session('ads_conversion'),'transaction_id')) }}'
                    };
                    function fire(){
                        if (typeof gtag === 'function') {
                            gtag('event','conversion', payload);
                            try { sessionStorage.setItem(firedKey,'1'); } catch(e) {}
                        } else if (window.dataLayer) {
                            window.dataLayer.push(Object.assign({event:'conversion'}, payload));
                            try { sessionStorage.setItem(firedKey,'1'); } catch(e) {}
                        } else {
                            setTimeout(fire, 200);
                        }
                    }
                    // Intenta inmediatamente y también tras load
                    fire();
                    window.addEventListener('load', fire);
                })();
            </script>
        @endif
    </body>
</html>