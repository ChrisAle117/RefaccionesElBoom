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
        Schema::create('payment_proofs', function (Blueprint $table) {
            $table->bigIncrements('id_payment_proof');
            $table->unsignedBigInteger('order_id');
            $table->foreign('order_id')->references('id_order')->on('orders')->onDelete('cascade');
            $table->string('file_path');
            $table->string('file_name');  // Nombre original del archivo
            $table->string('file_type');  // Tipo MIME
            $table->integer('file_size');  // Tamaño en bytes
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_proofs');
    }
};