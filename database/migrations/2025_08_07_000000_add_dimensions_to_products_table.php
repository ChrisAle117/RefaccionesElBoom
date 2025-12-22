<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDimensionsToProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            // Añadir columnas para dimensiones después de price y en orden específico con 3 decimales
            $table->decimal('weight', 8, 3)->nullable()->after('price');
            $table->decimal('length', 8, 3)->nullable()->after('weight');
            $table->decimal('width', 8, 3)->nullable()->after('length');
            $table->decimal('height', 8, 3)->nullable()->after('width');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['weight', 'length', 'width', 'height']);
        });
    }
}
