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
            $table->boolean('requires_invoice')->default(false)->after('status');
            $table->string('rfc')->nullable()->after('requires_invoice');
            $table->string('tax_situation_document')->nullable()->after('rfc');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['requires_invoice', 'rfc', 'tax_situation_document']);
        });
    }
};
