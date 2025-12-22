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
        Schema::table('orders', function (Blueprint $table) {
            // Añadir campo para almacenar la ruta del PDF de orden de surtido
            $table->string('shipping_order_pdf')->nullable();
            
            // Añadir campo para registrar cuándo se envió el correo electrónico
            $table->timestamp('shipping_email_sent_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Eliminar los campos si se necesita revertir la migración
            $table->dropColumn('shipping_order_pdf');
            $table->dropColumn('shipping_email_sent_at');
        });
    }
};