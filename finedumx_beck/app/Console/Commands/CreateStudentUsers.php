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

            // Verificar se usuário já existe por email ou cpf
            $exists = User::where('email', $cpf)->orWhere('cpf', $cpf)->exists();

            if (!$exists) {
                $user = new User();
                $user->name = $student->name;
                $user->email = $cpf;
                $user->cpf = $cpf;
                $user->password = Hash::make($cpf);
                $user->role = 'student';
                $user->student_id = $student->id;
                $user->save();

                $count++;
            }
        }

        $this->info("Sucesso! {$count} novos acessos de alunos criados.");
    }
}
