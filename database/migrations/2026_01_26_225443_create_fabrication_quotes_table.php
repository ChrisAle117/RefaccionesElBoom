<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('fabrication_quotes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('apellido');
            $table->string('telefono');
            $table->string('email');
            $table->string('estado');
            $table->string('servicio');
            $table->text('descripcion');
            
            // Technical Specs (Nullable)
            $table->string('material')->nullable();
            $table->string('espesor')->nullable();
            $table->string('dimensiones')->nullable();
            $table->string('angulo')->nullable();
            $table->string('longitud')->nullable();
            $table->string('cantidad_dobleces')->nullable();
            
            // File
            $table->string('archivo_path')->nullable();
            
            // System
            $table->string('status')->default('pending'); // pending, processed, etc.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fabrication_quotes');
    }
};
