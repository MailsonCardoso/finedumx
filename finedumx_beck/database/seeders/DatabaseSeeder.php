<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Student;
use App\Models\Tuition;
use App\Models\Payment;
use App\Models\SchoolSetting;
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
                'name' => 'Admin FinEdu',
                'email' => 'admin@finedu.com',
                'password' => bcrypt('@Secur1t1@'),
            ]
        );

        // School Settings
        SchoolSetting::updateOrCreate(
            ['cnpj' => '12.345.678/0001-90'],
            [
                'name' => 'Colégio FinEdu',
                'phone' => '(11) 3456-7890',
                'email' => 'contato@finedu.edu.br',
                'address' => 'Rua da Educação, 123 - São Paulo, SP',
            ]
        );

        // Students
        $students = [
            ['name' => 'Ana Silva', 'course' => 'Ensino Fundamental', 'due_day' => 10, 'monthly_fee' => 850, 'status' => 'em_dia', 'email' => 'ana@email.com', 'phone' => '(11) 99999-0001'],
            ['name' => 'Bruno Costa', 'course' => 'Ensino Médio', 'due_day' => 15, 'monthly_fee' => 1200, 'status' => 'a_vencer', 'email' => 'bruno@email.com', 'phone' => '(11) 99999-0002'],
            ['name' => 'Carla Mendes', 'course' => 'Educação Infantil', 'due_day' => 5, 'monthly_fee' => 650, 'status' => 'atrasado', 'email' => 'carla@email.com', 'phone' => '(11) 99999-0003'],
            ['name' => 'Daniel Oliveira', 'course' => 'Ensino Fundamental', 'due_day' => 10, 'monthly_fee' => 850, 'status' => 'em_dia', 'email' => 'daniel@email.com', 'phone' => '(11) 99999-0004'],
            ['name' => 'Elena Ferreira', 'course' => 'Ensino Médio', 'due_day' => 20, 'monthly_fee' => 1200, 'status' => 'em_dia', 'email' => 'elena@email.com', 'phone' => '(11) 99999-0005'],
        ];

        foreach ($students as $sData) {
            $student = Student::create($sData);

            // Create Tuitions for Jan and Feb
            $t1 = Tuition::create([
                'student_id' => $student->id,
                'reference' => 'Jan/2025',
                'due_date' => '2025-01-' . str_pad($student->due_day, 2, '0', STR_PAD_LEFT),
                'amount' => $student->monthly_fee,
                'status' => $student->status === 'em_dia' ? 'pago' : ($student->status === 'atrasado' ? 'atrasado' : 'pendente'),
            ]);

            // If paid, create a payment record
            if ($t1->status === 'pago') {
                Payment::create([
                    'student_id' => $student->id,
                    'tuition_id' => $t1->id,
                    'type' => 'Mensalidade Jan/2025',
                    'method' => 'pix',
                    'payment_date' => '2025-01-05',
                    'amount' => $t1->amount,
                    'status' => 'confirmado',
                ]);
            }
        }
    }
}
