<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ModifyProductsTable extends Migration
{
    public function up()
    {
        // Paso 1: Renombrar la columna 'id' a 'id_product'
        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('id', 'id_product');
        });
        

        // Paso 2: Agregar las nuevas columnas: code, disponibility y type.
        Schema::table('products', function (Blueprint $table) {
            // Agrega 'code' después de 'name'
            $table->string('code')->after('name');
            
            // Agrega 'disponibility' después de 'description'
            $table->unsignedInteger('disponibility')->default(0)->after('description');
            
            // Agrega 'type', que puede ser nulo, después de 'disponibility'
            $table->string('type')->nullable()->after('disponibility');
        });
    }

    public function down()
    {
        // Revertir: primero eliminar las nuevas columnas
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['code', 'disponibility', 'type']);
        });

        // Luego renombrar la columna 'id_product' de vuelta a 'id'
        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('id_product', 'id');
        });
    }
}
