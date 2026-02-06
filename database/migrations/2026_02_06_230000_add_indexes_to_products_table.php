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
        Schema::table('products', function (Blueprint $table) {
            // Add indexes for frequently queried columns
            $table->index('code', 'idx_products_code');
            $table->index('type', 'idx_products_type');
            $table->index('active', 'idx_products_active');
            $table->index('disponibility', 'idx_products_disponibility');
            $table->index(['active', 'disponibility'], 'idx_products_active_disponibility');
            $table->index(['type', 'active'], 'idx_products_type_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_code');
            $table->dropIndex('idx_products_type');
            $table->dropIndex('idx_products_active');
            $table->dropIndex('idx_products_disponibility');
            $table->dropIndex('idx_products_active_disponibility');
            $table->dropIndex('idx_products_type_active');
        });
    }
};
