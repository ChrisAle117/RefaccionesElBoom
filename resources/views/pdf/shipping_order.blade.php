<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Orden de Surtido #{{ $order->id_order }}</title>
    <style>
        body {
            font-family: 'Helvetica', Arial, sans-serif;
            margin: 0;
            padding: 15px;
            font-size: 12px;
            color: #333;
            line-height: 1.3;
        }
        
        .header {
            position: relative;
            margin-bottom: 10px;
            height: 60px;
        }
        
        .logo {
            position: absolute;
            top: 0;
            left: 0;
            max-height: 50px;
        }
        
        .order-number {
            position: absolute;
            top: 0;
            right: 0;
            text-align: right;
        }
        
        .order-number h1 {
            margin: 0;
            color: #2c3e50;
            font-size: 20px;
            font-weight: bold;
        }
        
        .order-status {
            position: absolute;
            top: 30px;
            right: 250px;
            background-color: #27ae60;
            color: white;
            padding: 3px 10px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 14px;
        }
        
        .separator {
            border-top: 1px solid #FBCC13;
            margin: 10px 0;
            clear: both;
        }
        
        .container {
            display: table;
            width: 100%;
            margin-bottom: 10px;
        }
        
        .column {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding: 0 5px;
        }
        
        h2 {
            color: #2c3e50;
            border-bottom: 1px solid #ddd;
            padding-bottom: 3px;
            font-size: 14px;
            margin: 5px 0;
        }
        
        .info-box {
            background-color: #f8f9fa;
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 10px;
            border-left: 3px solid #006CFA;
        }
        
        .dimension-box {
            background-color: #f8f9fa;
            padding: 6px;
            border-radius: 4px;
            margin-bottom: 10px;
            border-left: 3px solid #e74c3c;
        }
        
        .customer-info p, .shipping-info p {
            margin: 3px 0;
        }
        
        strong {
            font-weight: bold;
            color: #2c3e50;
        }
        
        .order-date {
            color: #7f8c8d;
            font-style: italic;
            margin-top: 3px;
            text-align: right;
            font-size: 11px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
        }
        
        table th {
            background-color: #DEDCDC;
            color: black;
            text-align: center;
            padding: 5px;
            font-size: 12px;
        }
        
        table td {
            padding: 4px;
            border-bottom: 1px solid #f0f0f0;
            text-align: center;
            font-size: 11px;
        }
        
        table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .check-column {
            width: 30px;
            text-align: center;
        }
        
        .notes {
            background-color: #f8f9fa;
            padding: 8px;
            border-radius: 4px;
            border-left: 3px solid #e74c3c;
            font-size: 11px;
            margin-bottom: 10px;
        }
        
        .footer {
            margin-top: 10px;
            border-top: 1px solid #ddd;
            padding-top: 5px;
            font-size: 10px;
            color: #7f8c8d;
            text-align: center;
        }
        
        /* Estilos de firmas eliminados ya que ahora usamos tabla */
    </style>
</head>
<body>
    <div class="header">
        <img src="{{ public_path('images/logotipo.png') }}" alt="Logo" class="logo">
        <div class="order-number">
            <h1>Orden de surtido No. {{ $order->id_order }}</h1>
            <div class="order-date">Fecha de generación: {{ $dateGenerated }}</div>
        </div>
        <div class="order-status">Aprobado</div>
    </div>
    
    <div class="separator"></div>
    @php
        $isPickup = false;
        if (isset($address)) {
            $isPickup = ((isset($address->referencia) && $address->referencia === 'Recoger en sucursal')
                        || (isset($address->calle) && str_starts_with($address->calle, 'REFACCIONES EL BOOM')));
        }
    @endphp
    @if($isPickup)
        <div style="background-color:#e9f7ef;color:#27ae60;border:1px solid #27ae60;padding:6px 10px;border-radius:4px;margin:8px 0;font-weight:bold;">
            El cliente seleccionó recoger su pedido en sucursal, por lo que no se generó una guía de envío.
        </div>
    @endif
    
    <!-- Dimensiones del paquete - Primera sección importante -->
    <h2>Dimensiones del paquete</h2>
    @php
        $totalWeight = 0;
        $maxLength = 0;
        $maxWidth = 0;
        $maxHeight = 0;
        
        // Calcular peso total y dimensiones máximas
        foreach($items as $item) {
            $weight = $item->product->weight * $item->quantity;
            $totalWeight += $weight;
            
            // Solo consideramos la dimensión más grande para envíos con múltiples productos
            $maxLength = max($maxLength, $item->product->length ?? 0);
            $maxWidth = max($maxWidth, $item->product->width ?? 0);
            $maxHeight = max($maxHeight, $item->product->height ?? 0);
        }
    @endphp
    <div class="dimension-box">
        <table style="margin: 0;">
            <thead>
                <tr>
                    <th>Largo (cm)</th>
                    <th>Ancho (cm)</th>
                    <th>Alto (cm)</th>
                    <th>Peso (kg)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ number_format($maxLength, 2) }}</td>
                    <td>{{ number_format($maxWidth, 2) }}</td>
                    <td>{{ number_format($maxHeight, 2) }}</td>
                    <td>{{ number_format($totalWeight, 2) }}</td>
                </tr>
            </tbody>
        </table>
        <p style="margin: 5px 0 0 0; font-size: 11px;"><strong>Importante:</strong> Estos valores son utilizados para la cotización de envío DHL.</p>
    </div>

    <div class="container">
        <div class="column">
            <h2>Dirección de envío</h2>
            <div class="info-box shipping-info">
                <p>{{ $address->calle }} {{ $address->numero_exterior }}
                    @if($address->numero_interior) Int. {{ $address->numero_interior }} @endif</p>
                <p>{{ $address->colonia }}, {{ $address->codigo_postal }}</p>
                <p>{{ $address->ciudad }}, {{ $address->estado }}</p>
                @if($address->referencia)
                <p><strong>Ref:</strong> {{ $address->referencia }}</p>
                @endif
            </div>
        </div>
        
        <div class="column">
            <h2>Información del cliente</h2>
            <div class="info-box customer-info">
                <p><strong>Nombre:</strong> {{ $customer->name }}</p>
                <p><strong>Teléfono:</strong> {{ $address->telefono }}</p>
                <p><strong>Monto:</strong> ${{ number_format($order->total_amount, 2) }} MXN</p>
            </div>
        </div>
    </div>
    
    <h2>Productos a surtir</h2>
    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Cant.</th>
                <th class="check-column">✓</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $item)
            <tr>
                <td>{{ $item->product->code ?? 'N/A' }}</td>
                <td style="text-align: left;">{{ $item->product->name }}</td>
                <td>{{ $item->quantity }}</td>
                <td class="check-column"></td>
            </tr>
            @endforeach
        </tbody>
    </table>
    
    <table style="width: 100%; margin-top: 20px;">
        <tr>
            <td style="width: 40%; text-align: center;">
                <div style="border-bottom: 1px solid #333; height: 40px;"></div>
                <strong>Nombre y firma de quien surte</strong>
            </td>
            <td style="width: 20%;"></td>
            <td style="width: 40%; text-align: center;">
                <div style="border-bottom: 1px solid #333; height: 40px;"></div>
                <strong>Nombre y firma de quien recibe</strong>
            </td>
        </tr>
    </table>
    
    <div class="footer">
        Documento generado automáticamente - Sistema de Gestión de Pedidos
    </div>
</body>
</html>
</body>
</html>