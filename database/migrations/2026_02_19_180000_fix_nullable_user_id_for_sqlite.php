<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class FixNullableUserIdForSqlite extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (DB::getDriverName() === 'sqlite') {
            $this->fixTableForSqlite('addresses', function (Blueprint $table) {
                $table->bigIncrements('id_direccion');
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('session_id')->nullable()->index();
                $table->string('calle');
                $table->string('colonia');
                $table->string('numero_exterior')->nullable();
                $table->string('numero_interior')->nullable();
                $table->string('codigo_postal');
                $table->string('ciudad');
                $table->string('telefono');
                $table->string('referencia')->nullable();
                $table->string('estado');
                $table->timestamps();
            });

            $this->fixTableForSqlite('orders', function (Blueprint $table) {
                $table->bigIncrements('id_order');
                $table->unsignedBigInteger('user_id')->nullable();
                $table->unsignedBigInteger('address_id')->nullable();
                $table->decimal('total_amount', 10, 2);
                $table->string('status')->default('pending_payment');
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
                $table->string('shipping_order_pdf')->nullable();
                $table->timestamp('shipping_email_sent_at')->nullable();
                $table->string('payment_method')->nullable();
                $table->timestamp('payment_date')->nullable();
                $table->string('dhl_label_path')->nullable();
                $table->string('dhl_tracking_number')->nullable();
                $table->timestamp('dhl_label_created_at')->nullable();
                $table->timestamp('dhl_pickup_scheduled_at')->nullable();
                $table->boolean('requires_invoice')->default(false);
                $table->string('rfc')->nullable();
                $table->string('tax_situation_document')->nullable();
                $table->string('session_id')->nullable()->index();
                $table->string('guest_name')->nullable();
                $table->string('guest_email')->nullable();
            });
        } else {
            // For MySQL or other engines that support change() properly
            Schema::table('addresses', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->change();
            });
            Schema::table('orders', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->change();
            });
        }
    }

    private function fixTableForSqlite($tableName, $definition)
    {
        $tempTableName = 'tmp_' . $tableName;
        
        // 1. Rename existing table
        Schema::rename($tableName, $tempTableName);
        
        // SQLite indices are global. We MUST drop them from the temp table before creating the new table.
        $indices = [
            'addresses' => ['addresses_session_id_index'],
            'orders' => ['orders_session_id_index'],
        ];

        if (isset($indices[$tableName])) {
            foreach ($indices[$tableName] as $indexName) {
                try {
                    DB::statement("DROP INDEX IF EXISTS \"$indexName\"");
                } catch (\Exception $e) {
                    // Ignore errors if index doesn't exist
                }
            }
        }

        // 2. Create new table with correct schema
        Schema::create($tableName, $definition);
        
        // 3. Copy data
        $columns = Schema::getColumnListing($tempTableName);
        $columnList = implode(', ', $columns);
        
        DB::statement("INSERT INTO $tableName ($columnList) SELECT $columnList FROM $tempTableName");
        
        // 4. Drop temp table
        Schema::dropIfExists($tempTableName);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // No easy way to rollback a destructive recreation without knowing old exact NOT NULL state
    }
}
