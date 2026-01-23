<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateStudentUsers extends Command
{
    protected $signature = 'app:create-student-users';
    protected $description = 'Cria usuários para todos os alunos usando CPF como login e senha';

    public function handle()
    {
        $students = Student::whereNotNull('cpf')->get();
        $count = 0;

        foreach ($students as $student) {
            // Limpar CPF (apenas números)
            $cpf = preg_replace('/\D/', '', $student->cpf);

            if (empty($cpf)) {
                $this->warn("Aluno {$student->name} (ID: {$student->id}) não possui CPF válido para login.");
                continue;
            }

            // Verificar se usuário já existe
            $exists = User::where('email', $cpf)->exists();

            if (!$exists) {
                User::create([
                    'name' => $student->name,
                    'email' => $cpf, // Usando CPF no campo email para simplificar login
                    'password' => Hash::make($cpf),
                    'role' => 'student',
                    'student_id' => $student->id
                ]);
                $count++;
            }
        }

        $this->info("Sucesso! {$count} novos acessos de alunos criados.");
    }
}
