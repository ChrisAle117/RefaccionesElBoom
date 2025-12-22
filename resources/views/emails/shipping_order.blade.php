<!-- filepath: resources/views/emails/shipping_order.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nueva Orden de Surtido</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-bottom: 3px solid #4caf50;
        }
        .content {
            padding: 20px;
        }
        .order-details {
            background-color: #f8f9fa;
            padding: 15px;
            margin: 20px 0;
            border-left: 4px solid #4caf50;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Nueva orden de surtido #{{ $order->id_order }}</h1>
        </div>
        
        <div class="content">
            <p>Estimado equipo de Almacén:</p>
            
            <p>Se ha aprobado un nuevo pedido y está listo para ser surtido.</p>
            
            <div class="order-details">
                <h3>Detalles del pedido:</h3>
                <ul>
                    <li><strong>Número de Orden:</strong> #{{ $order->id_order }}</li>
                    <li><strong>Cliente:</strong> {{ $order->user->name }}</li>
                    <li><strong>Fecha:</strong> {{ $order->created_at->format('d/m/Y H:i') }}</li>
                    <li><strong>Monto:</strong> ${{ number_format($order->total_amount, 2) }} MXN</li>
                    <li><strong>Total de productos:</strong> {{ $order->items->sum('quantity') }}</li>
                </ul>
            </div>
            
            <p>Adjunto encontrarán la orden de surtido en formato PDF con los detalles completos de los productos a preparar.</p>
            
            <p><strong>Acción requerida:</strong> Por favor proceder con el surtido a la brevedad posible.</p>
            
            <p>Si tienen alguna pregunta o necesitan información adicional, no duden en contactar al departamento de ventas.</p>
            
            <p>Saludos cordiales,<br>
            Departamento de Ventas</p>
        </div>
        
        <div class="footer">
            <p>Este es un correo automático, por favor no responder a esta dirección.</p>
        </div>
    </div>
</body>
</html>