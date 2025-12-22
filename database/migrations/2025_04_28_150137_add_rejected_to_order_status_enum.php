<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM(
                'pending_payment', 
                'payment_uploaded', 
                'payment_verified', 
                'processing', 
                'shipped', 
                'delivered', 
                'cancelled',
                'rejected'
            ) DEFAULT 'pending_payment'");
        }
    }

    public function down()
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM(
                'pending_payment', 
                'payment_uploaded', 
                'payment_verified', 
                'processing', 
                'shipped', 
                'delivered', 
                'cancelled'
            ) DEFAULT 'pending_payment'");
        }
    }
};
