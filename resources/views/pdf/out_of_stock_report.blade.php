<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte de Artículos sin Stock</title>
    <style>
        body {
            font-family: 'Helvetica', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 14px;
            color: #333;
            line-height: 1.4;
        }
        
        .header {
            position: relative;
            margin-bottom: 30px;
            height: 100px;
        }
        
        .logo {
            position: absolute;
            top: 0;
            left: 0;
            max-height: 60px;
        }
        
        .report-title {
            position: absolute;
            top: 0;
            right: 0;
            text-align: right;
        }
        
        .report-title h1 {
            margin: 0;
            color: #2c3e50;
            font-size: 24px;
            font-weight: bold;
        }
        
        .report-badge {
            position: absolute;
            top: 60px;
            right: 0;
            background-color: #e74c3c;
            color: white;
            padding: 5px 15px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 16px;
        }
        
        .separator {
            border-top: 2px solid #FBCC13;
            margin: 20px 0;
            clear: both;
        }
        
        .report-date {
            color: #7f8c8d;
            font-style: italic;
            margin-top: 5px;
            text-align: right;
            font-size: 12px;
        }
        
        .summary-box {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #e74c3c;
        }
        
        h2 {
            color: #2c3e50;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            font-size: 18px;
            margin-top: 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        table th {
            background-color: #DEDCDC;
            color: black;
            text-align: center;
            padding: 10px;
        }
        
        table td {
            padding: 8px;
            border-bottom: 1px solid #ffffff;
            text-align: center;
        }
        
        table tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        
        .footer {
            margin-top: 40px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
            font-size: 12px;
            color: #7f8c8d;
            text-align: center;
        }

    </style>
</head>
<body>
    <div class="header">
        <img src="{{ public_path('images/logotipo.png') }}" alt="Logo" class="logo">
        <div class="report-title">
            <h1>Reporte de Artículos sin Stock</h1>
            <div class="report-date">Fecha de generación: {{ $dateGenerated }}</div>
        </div>
        <div class="report-badge">Sin Stock</div>
    </div>
    
    <div class="separator"></div>
    
    <div class="summary-box">
        <h2>Resumen</h2>
        <p><strong>Total de productos sin stock:</strong> {{ count($products) }}</p>
        <p><strong>Fecha de consulta:</strong> {{ $dateGenerated }}</p>
        <p><strong>La generación de este reporte es en base a la disponibilidad de artículos 
                para el ECOMMERCE, este no sugiere que no haya stock en almacén.
                Sin embargo, algunos datos podrían coincidir.
            </strong>
        </p>

    </div>
    
    <h2>Listado de productos sin stock</h2>
    
    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Producto</th>
            </tr>
        </thead>
        <tbody>
            @foreach($products as $product)
            <tr>
                <td>{{ $product->code }}</td>
                <td>{{ $product->name }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    
    <div class="notes">
        <h2>Notas</h2>
        <p>Este reporte muestra todos los productos que actualmente no tienen existencia en el inventario. 
        Se recomienda revisar y considerar reabastecer estos productos para mantener un inventario adecuado.</p>
    </div>
    
    <div class="footer">
        Documento generado automáticamente - Sistema de Gestión de Inventario E-COMMERCE REFACCIONARIA EL BOOM TRACTOPARTES
    </div>
</body>
</html>