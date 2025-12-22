<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 - Página no encontrada</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
        }
        .error-container {
            text-align: center;
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
        }
        .error-header {
            font-size: 120px;
            font-weight: bold;
            color: #333;
            margin-bottom: 1rem;
            line-height: 1;
        }
        .error-image {
            max-width: 300px;
            height: auto;
            margin: 1rem 0;
        }
        .error-message {
            font-size: 1.5rem;
            color: #333;
            margin-bottom: 1rem;
        }
        a {
            color: #ff4d4d;
            text-decoration: none;
            transition: color 0.3s;
        }
        a:hover {
            color: #ff3333;
        }
        .back-link {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background-color: #ff4d4d;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s;
            margin-top: 20px;
        }
        .back-link:hover {
            background-color: #ff3333;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-header">404</div>
        <img src="{{ asset('images/ElBoom404.png') }}" alt="404 Error" class="error-image">
        <div class="error-message">
            La página que intentas solicitar<br>
            no está en el servidor (Error 404).
        </div>
        
        <a href="{{ url('/') }}" class="back-link">Volver al inicio</a>
    </div>
</body>
</html>
