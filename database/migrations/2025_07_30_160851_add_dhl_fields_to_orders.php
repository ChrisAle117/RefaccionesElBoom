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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('dhl_label_path')->nullable()->after('shipping_order_pdf');
            $table->string('dhl_tracking_number')->nullable()->after('dhl_label_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['dhl_label_path', 'dhl_tracking_number']);
        });
    }
};
