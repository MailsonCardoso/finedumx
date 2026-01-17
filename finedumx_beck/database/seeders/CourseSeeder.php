<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            'Canto Individual',
            'Canto em Grupo',
            'Teclado',
            'Bateria',
            'Violão'
        ];

        foreach ($courses as $courseName) {
            \App\Models\Course::firstOrCreate(['name' => $courseName]);
        }
    }
}
