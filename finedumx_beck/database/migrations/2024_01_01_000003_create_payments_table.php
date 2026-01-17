<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $row) {
            $row->id();
            $row->foreignId('student_id')->constrained()->onDelete('cascade');
            $row->foreignId('tuition_id')->nullable()->constrained()->onDelete('set null');
            $row->string('type')->nullable(); // Ex: "Mensalidade Jan/2025"
            $row->enum('method', ['pix', 'boleto', 'cartao']);
            $row->date('payment_date');
            $row->decimal('amount', 10, 2);
            $row->enum('status', ['confirmado', 'processando', 'falha'])->default('processando');
            $row->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
