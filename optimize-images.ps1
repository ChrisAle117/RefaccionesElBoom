# Script para convertir c4.png a WebP y crear versiones responsive de las imágenes

# Instalar ImageMagick si no está disponible
# Windows: choco install imagemagick
# O descargar de: https://imagemagick.org/script/download.php

Write-Host "Converting and optimizing images..." -ForegroundColor Cyan

$imagePath = "public\images"

# Convertir c4.png a WebP con alta calidad
if (Test-Path "$imagePath\c4.png") {
    Write-Host "Converting c4.png to WebP..." -ForegroundColor Yellow
    magick "$imagePath\c4.png" -quality 85 -define webp:method=6 "$imagePath\c4.webp"
    
    # Crear versiones responsive del c4
    magick "$imagePath\c4.png" -resize 1920x1080 -quality 85 -define webp:method=6 "$imagePath\c4-1920w.webp"
    magick "$imagePath\c4.png" -resize 1280x720 -quality 85 -define webp:method=6 "$imagePath\c4-1280w.webp"
    magick "$imagePath\c4.png" -resize 768x432 -quality 85 -define webp:method=6 "$imagePath\c4-768w.webp"
    
    Write-Host "c4.png converted successfully!" -ForegroundColor Green
}

# Optimizar carruseles 21:9 existentes - crear versiones responsive
$carouselImages = @("c1-21x9.webp", "c2-21x9.webp", "c3-21x9.webp")

foreach ($img in $carouselImages) {
    if (Test-Path "$imagePath\$img") {
        $baseName = $img -replace '\.webp$', ''
        Write-Host "Creating responsive versions for $img..." -ForegroundColor Yellow
        
        # Versiones responsive
        magick "$imagePath\$img" -resize 1920x823 -quality 85 -define webp:method=6 "$imagePath\${baseName}-1920w.webp"
        magick "$imagePath\$img" -resize 1280x549 -quality 85 -define webp:method=6 "$imagePath\${baseName}-1280w.webp"
        magick "$imagePath\$img" -resize 768x329 -quality 85 -define webp:method=6 "$imagePath\${baseName}-768w.webp"
        
        Write-Host "$img optimized!" -ForegroundColor Green
    }
}

# Optimizar imágenes de categorías (789x788 -> versiones más pequeñas)
$categoryImages = @("faroled.webp", "limpiaparabrisas.webp", "modulos.webp", "plafon.webp", 
                    "otros.webp", "bocinas.webp", "cubretuercas.webp")

foreach ($img in $categoryImages) {
    if (Test-Path "$imagePath\$img") {
        $baseName = $img -replace '\.(png|jpg)$', ''
        Write-Host "Converting and resizing $img..." -ForegroundColor Yellow
        
        # Convertir a WebP y crear versiones responsive
        magick "$imagePath\$img" -resize 789x788 -quality 85 -define webp:method=6 "$imagePath\${baseName}.webp"
        magick "$imagePath\$img" -resize 500x500 -quality 85 -define webp:method=6 "$imagePath\${baseName}-500w.webp"
        magick "$imagePath\$img" -resize 350x350 -quality 85 -define webp:method=6 "$imagePath\${baseName}-350w.webp"
        
        Write-Host "$img converted!" -ForegroundColor Green
    }
}

# Optimizar logo (420x221 -> versiones más pequeñas)
if (Test-Path "$imagePath\logotipo.png") {
    Write-Host "Optimizing logotipo.png..." -ForegroundColor Yellow
    magick "$imagePath\logotipo.png" -resize 420x221 -quality 85 -define webp:method=6 "$imagePath\logotipo.webp"
    magick "$imagePath\logotipo.png" -resize 256x135 -quality 85 -define webp:method=6 "$imagePath\logotipo-256w.webp"
    magick "$imagePath\logotipo.png" -resize 128x67 -quality 85 -define webp:method=6 "$imagePath\logotipo-128w.webp"
    Write-Host "logotipo.png optimized!" -ForegroundColor Green
}

# Optimizar catálogos
if (Test-Path "$imagePath\catalogos.png") {
    Write-Host "Optimizing catalogos.png..." -ForegroundColor Yellow
    magick "$imagePath\catalogos.png" -quality 85 -define webp:method=6 "$imagePath\catalogos.webp"
    Write-Host "catalogos.png optimized!" -ForegroundColor Green
}

# Optimizar otras imágenes
$otherImages = @("mantenimiento-y-quimicos.png", "accesorios-y-herramientas.png", "dondeComprar.png")

foreach ($img in $otherImages) {
    if (Test-Path "$imagePath\$img") {
        $baseName = $img -replace '\.(png|jpg)$', ''
        Write-Host "Converting $img to WebP..." -ForegroundColor Yellow
        magick "$imagePath\$img" -quality 85 -define webp:method=6 "$imagePath\${baseName}.webp"
        
        # Si son 500x500, crear versión más pequeña
        magick "$imagePath\$img" -resize 350x350 -quality 85 -define webp:method=6 "$imagePath\${baseName}-350w.webp"
        Write-Host "$img converted!" -ForegroundColor Green
    }
}

# Optimizar WSPLOGO (940x788 -> mucho más pequeño)
if (Test-Path "$imagePath\WSPLOGO.webp") {
    Write-Host "Resizing WSPLOGO.webp..." -ForegroundColor Yellow
    magick "$imagePath\WSPLOGO.webp" -resize 128x107 -quality 85 -define webp:method=6 "$imagePath\WSPLOGO-128w.webp"
    magick "$imagePath\WSPLOGO.webp" -resize 64x54 -quality 85 -define webp:method=6 "$imagePath\WSPLOGO-64w.webp"
    Write-Host "WSPLOGO.webp resized!" -ForegroundColor Green
}

Write-Host "`nOptimization complete!" -ForegroundColor Green
Write-Host "Now update your components to use the new responsive images with srcset." -ForegroundColor Cyan
