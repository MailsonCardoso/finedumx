<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tuitions', function (Blueprint $row) {
            $row->id();
            $row->foreignId('student_id')->constrained()->onDelete('cascade');
            $row->string('reference');
            $row->date('due_date');
            $row->decimal('amount', 10, 2);
            $row->enum('status', ['pago', 'pendente', 'atrasado'])->default('pendente');
            $row->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tuitions');
    }
};
