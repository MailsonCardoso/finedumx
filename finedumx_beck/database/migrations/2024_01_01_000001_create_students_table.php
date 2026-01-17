<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('students', function (Blueprint $row) {
            $row->id();
            $row->string('name');
            $row->string('email')->unique();
            $row->string('phone')->nullable();
            $row->string('course')->nullable();
            $row->integer('due_day')->default(10);
            $row->decimal('monthly_fee', 10, 2);
            $row->string('status')->default('ativo');
            $row->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
