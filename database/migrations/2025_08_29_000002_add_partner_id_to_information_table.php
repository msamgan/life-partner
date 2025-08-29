<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('information', function (Blueprint $table) {
            $table->foreignId('partner_id')->nullable()->after('user_id')->constrained('partners')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('information', function (Blueprint $table) {
            $table->dropConstrainedForeignId('partner_id');
        });
    }
};
