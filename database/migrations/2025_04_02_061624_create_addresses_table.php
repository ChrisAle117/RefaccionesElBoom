<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAddressesTable extends Migration
{
    public function up()
    {
        Schema::create('addresses', function (Blueprint $table) {
            // Clave primaria personalizada: id_direccion
            $table->bigIncrements('id_direccion');
            
            // Clave foránea para relacionar la dirección con un usuario (tabla users)
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            
            // Campos de dirección
            $table->string('calle');
            $table->string('colonia');
            $table->string('numero_exterior')->nullable();
            $table->string('numero_interior')->nullable();
            $table->string('codigo_postal');
            $table->string('ciudad');
            $table->string('telefono');
            $table->string('referencia')->nullable();
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('addresses');
    }
}
