<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Student;
use App\Models\Tuition;
use App\Models\Payment;
use App\Models\SchoolSetting;
use App\Models\Course;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default User
        User::updateOrCreate(
            ['cpf' => '019.358.063-27'],
            [
                'name' => 'Administrador Vem Cantar',
                'email' => 'contato@vemcantar.com.br',
                'password' => bcrypt('@Secur1t1@'),
            ]
        );

        // School Settings
        SchoolSetting::updateOrCreate(
            ['cnpj' => '12.345.678/0001-90'],
            [
                'name' => 'ESCOLA DE MUSICA VEM CANTAR',
                'phone' => '(11) 3456-7890',
                'email' => 'contato@finedu.edu.br',
                'address' => 'Rua da Educação, 123 - São Paulo, SP',
                'pix_key' => '98988221217',
            ]
        );

        // System is now clean. 
        // No students, courses, tuitions or payments will be seeded.
    }
}
