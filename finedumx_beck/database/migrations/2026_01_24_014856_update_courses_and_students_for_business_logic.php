<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->string('days_of_week')->nullable();
        });

        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('course_id')->nullable()->constrained('courses')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['course_id']);
            $table->dropColumn('course_id');
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('days_of_week');
        });
    }
};
