<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class FixOrderItemsForeignKeyForSqlite extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (DB::getDriverName() === 'sqlite') {
            // Check if order_items has a broken FK or if we just want to ensure it's clean
            // Recreating the table for SQLite is the safest way to reset FKs
            
            $tempTableName = 'tmp_order_items';
            
            if (Schema::hasTable('order_items')) {
                // 1. Rename existing table
                Schema::rename('order_items', $tempTableName);
                
                // 2. Create new table with correct schema and CLEAN FOREIGN KEYS
                Schema::create('order_items', function (Blueprint $table) {
                    $table->bigIncrements('id_order_item');
                    $table->unsignedBigInteger('order_id');
                    $table->unsignedBigInteger('product_id');
                    $table->integer('quantity');
                    $table->decimal('price', 10, 2);
                    $table->timestamps();

                    // Point specifically to the NEW 'orders' table
                    $table->foreign('order_id')->references('id_order')->on('orders')->onDelete('cascade');
                    $table->foreign('product_id')->references('id_product')->on('products')->onDelete('cascade');
                });
                
                // 3. Copy data
                $columns = ['id_order_item', 'order_id', 'product_id', 'quantity', 'price', 'created_at', 'updated_at'];
                $columnList = implode(', ', $columns);
                
                try {
                    DB::statement("INSERT INTO order_items ($columnList) SELECT $columnList FROM $tempTableName");
                } catch (\Exception $e) {
                    // If insert fails (e.g. because of the very FK error we are fixing), 
                    // we might need to do it with FK checks disabled
                    DB::statement('PRAGMA foreign_keys = OFF');
                    DB::statement("INSERT INTO order_items ($columnList) SELECT $columnList FROM $tempTableName");
                    DB::statement('PRAGMA foreign_keys = ON');
                }
                
                // 4. Drop temp table
                Schema::dropIfExists($tempTableName);
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // No easy way to rollback
    }
}
