<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('appointments', 'reminder_sent_at')) {
            Schema::table('appointments', function (Blueprint $table) {
                $table->timestamp('reminder_sent_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        //
    }
};
