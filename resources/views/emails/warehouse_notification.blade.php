<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Orden de Surtido</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
        }
        .container {
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            background-color: #FBCC13;
            color: #000;
            padding: 15px;
            text-align: center;
            margin-bottom: 20px;
        }
        .content {
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            border: 1px solid #ddd;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
        }
        .button {
            display: inline-block;
            background-color: #006CFA;
            color: #fff !important;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table, th, td {
            border: 1px solid #ddd;
        }
        th, td {
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .underlined {
            text-decoration: underline;
            background-color: #FFFF99; /* Fondo amarillo claro */
            padding: 2px 4px; /* Espaciado para que el fondo no esté pegado al texto */
            font-weight: bold; /* Opcional: hacer el texto más destacado */
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Nueva Orden de Surtido #{{ $order->id_order }}</h1>
        </div>
        
        <div class="content">
            <p>Hola Equipo de Almacén,</p>
            
            <p>Se ha generado una nueva orden de surtido que requiere su atención inmediata.</p>
            
            <p><strong>Información de la orden:</strong></p>
            
            <table>
                <tr>
                    <th>Número de orden</th>
                    <td>{{ $order->id_order }}</td>
                </tr>
                <tr>
                    <th>Cliente</th>
                    <td>{{ $customer->name }}</td>
                </tr>
                @if($order->requires_invoice && $order->rfc)
                <tr>
                    <th>RFC</th>
                    <td>{{ $order->rfc }}</td>
                </tr>
                @endif
                <tr>
                    <th>Fecha</th>
                    <td>{{ $dateGenerated }}</td>
                </tr>
            </table>
            
            <p class="underlined"> Sí este correo contiene el RFC del cliente, el cliente requiere factura, por favor de realizarla, los datos (RFC y Constancia de situación fiscal vienen adjuntos en el correo), de lo contrario, realizar únicamente nota de venta.
            <p><span class="underlined">Importante: Por favor procese esta orden lo más pronto posible. </span> Adjunto encontrarán la orden de surtido y la etiqueta de DHL (archivos PDF), las cuales deberán de descargar para su respectivo embalaje.</p>
            <p>Nota: Si la orden contiene varios productos, deberán de imprimir <span class="underlined">únicamente la penultima etiqueta de DHL</span>, y esta es la que deberá de ser pegada en el paquete a enviar.</p>

            
            <p>Gracias por su atención y diligencia.</p>
            
            <p>Saludos cordiales,<br>
            Equipo de E-Commerce<br>
            Refacciones El Boom</p>
        </div>
        
        <div class="footer">
            <p>Este es un correo automático, por favor no responda a este mensaje.</p>
            <p>© {{ date('Y') }} El Boom Tractopartes - Documento generado automáticamente</p>
        </div>
    </div>
</body>
</html>
