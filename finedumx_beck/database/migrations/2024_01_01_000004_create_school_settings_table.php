<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('school_settings', function (Blueprint $row) {
            $row->id();
            $row->string('name');
            $row->string('cnpj')->nullable();
            $row->string('phone')->nullable();
            $row->string('email')->nullable();
            $row->string('address')->nullable();
            $row->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_settings');
    }
};
