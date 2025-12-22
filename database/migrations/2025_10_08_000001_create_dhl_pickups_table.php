<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('dhl_pickups', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id');
            $table->string('dispatch_confirmation_number')->nullable()->index();
            $table->dateTime('planned_pickup_at')->nullable();
            $table->string('planned_pickup_tz', 64)->nullable();
            $table->string('close_time', 16)->nullable();
            $table->string('location')->nullable();
            $table->string('location_type')->nullable();
            $table->string('origin_postal_code', 20)->nullable();
            $table->string('origin_city_name', 100)->nullable();
            $table->string('origin_province_code', 20)->nullable();
            $table->string('origin_country_code', 10)->nullable();
            $table->string('origin_address_line1', 255)->nullable();
            $table->json('payload')->nullable();
            $table->json('response')->nullable();
            $table->timestamps();

            $table->foreign('order_id')
                ->references('id_order')->on('orders')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dhl_pickups');
    }
};
