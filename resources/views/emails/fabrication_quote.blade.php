<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Estilos Base */
        body { background-color: #f8f8f8; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { padding: 40px 10px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #d4d4d4; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        
        /* Tipografía Elegante */
        h1, h2, h3 { font-family: 'Georgia', 'Times New Roman', Times, serif; font-weight: normal; }
        p, span, div { font-family: 'Verdana', 'Geneva', sans-serif; }

        /* Logotipo */
        .logo-container { padding: 30px 20px; text-align: center; background-color: #ffffff; }
        .logo-container img { max-width: 200px; height: auto; }

        /* Encabezado Formal */
        .header { background-color: #FFD700; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; }
        .header h1 { color: #000000; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 3px; }
        
        .content { padding: 40px 50px; }
        
        /* Secciones */
        .section-label { font-family: 'Georgia', serif; font-style: italic; color: #888; font-size: 14px; border-bottom: 1px solid #eeeeee; padding-bottom: 5px; margin-bottom: 20px; display: block; }
        
        .data-group { margin-bottom: 25px; }
        .label { color: #555555; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px; }
        .value { color: #1a1a1a; font-size: 16px; font-weight: 500; }
        
        /* Cuadro de descripción elegante */
        .description-box { 
            background-color: #fdfdfd; 
            padding: 20px; 
            border: 1px solid #e0e0e0; 
            border-left: 3px solid #FFD700; 
            font-family: 'Georgia', serif; 
            font-style: italic; 
            color: #444; 
            line-height: 1.6; 
            margin-top: 10px;
        }

        /* Technical Grid for Specs */
        .tech-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; }
        .tech-item { background: #fafafa; padding: 10px; border: 1px solid #eee; }
        
        .footer { padding: 30px; text-align: center; font-size: 11px; color: #999; letter-spacing: 1px; line-height: 1.5; }
        .line { border-top: 1px solid #FFD700; width: 50px; margin: 20px auto; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="logo-container">
                <img src="https://www.refaccioneselboom.com/images/logotipo.png" alt="Refacciones El Boom">
            </div>

            <div class="header">
                <h1>Solicitud de Cotización</h1>
            </div>

            <div class="content">
                <span class="section-label">Detalles de la Recepción</span>

                <div class="data-group">
                    <span class="label">Cliente</span>
                    <span class="value">{{ $quote->nombre }} {{ $quote->apellido }}</span>
                </div>

                <div class="data-group">
                    <span class="label">Contacto Directo</span>
                    <span class="value">{{ $quote->telefono }} • {{ $quote->email }}</span>
                </div>

                <div class="data-group">
                    <span class="label">Estado de origen</span>
                    <span class="value">{{ $quote->estado }}</span>
                </div>

                <div style="margin-top: 40px;">
                    <span class="section-label">Especificaciones del Proyecto</span>
                    
                    <div class="data-group">
                        <span class="label">Tipo de Servicio</span>
                        <span class="value">{{ $quote->servicio }}</span>
                    </div>

                    <span class="label">Descripción solicitada</span>
                    <div class="description-box">
                        "{{ $quote->descripcion }}"
                    </div>
                </div>

                @if($quote->material || $quote->espesor || $quote->dimensiones || $quote->angulo || $quote->archivo_path)
                <div style="margin-top: 40px;">
                    <span class="section-label">Ficha Técnica</span>
                    
                    <div class="tech-grid">
                        @if($quote->material)
                        <div class="tech-item">
                            <span class="label">Material</span>
                            <span class="value">{{ $quote->material }}</span>
                        </div>
                        @endif
                        
                        @if($quote->espesor)
                        <div class="tech-item">
                            <span class="label">Espesor</span>
                            <span class="value">{{ $quote->espesor }}</span>
                        </div>
                        @endif

                        @if($quote->dimensiones)
                        <div class="tech-item">
                            <span class="label">Dimensiones</span>
                            <span class="value">{{ $quote->dimensiones }}</span>
                        </div>
                        @endif

                        @if($quote->angulo)
                        <div class="tech-item">
                            <span class="label">Ángulo</span>
                            <span class="value">{{ $quote->angulo }}</span>
                        </div>
                        @endif
                        
                        @if($quote->cantidad_dobleces)
                        <div class="tech-item">
                            <span class="label">Dobleces</span>
                            <span class="value">{{ $quote->cantidad_dobleces }}</span>
                        </div>
                        @endif
                    </div>
                    
                    @if($quote->archivo_path)
                    <div style="margin-top: 15px; padding: 10px; background-color: #f0fdf4; border: 1px dashed #22c55e; color: #15803d; font-size: 12px; font-weight: bold; text-align: center;">
                        📎 ARCHIVO TÉCNICO ADJUNTO
                    </div>
                    @endif
                </div>
                @endif
            </div>

            <div class="footer">
                <div class="line"></div>
                <strong>Refacciones El Boom</strong><br>
                
                &copy; {{ date('Y') }} Refacciones El Boom
            </div>
        </div>
    </div>
</body>
</html>
