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
            $table->string('session_id')->nullable()->after('user_id')->index();
            $table->string('guest_name')->nullable()->after('session_id');
            $table->string('guest_email')->nullable()->after('guest_name');
            $table->foreignId('user_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['session_id', 'guest_name', 'guest_email']);
            // Revert cancelling nullable is risky if data exists
             // $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
