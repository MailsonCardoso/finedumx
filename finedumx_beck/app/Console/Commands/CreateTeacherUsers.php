<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CreateTeacherUsers extends Command
{
    protected $signature = 'app:create-teacher-users';
    protected $description = 'Cria usuários para todos os funcionários que são professores (is_teacher = true)';

    public function handle()
    {
        // Garantir que a coluna employee_id exista (bypass para erro de migração CLI)
        if (!Schema::hasColumn('users', 'employee_id')) {
            $this->info("Adicionando coluna employee_id na tabela users...");
            DB::statement("ALTER TABLE users ADD COLUMN employee_id BIGINT UNSIGNED NULL AFTER student_id");
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_employee_id_foreign FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE");
        }

        $teachers = Employee::where('is_teacher', true)
            ->where('status', 'ativo')
            ->get();

        if ($teachers->isEmpty()) {
            $this->warn("Nenhum funcionário marcado como professor e ativo foi encontrado.");
            return;
        }

        $count = 0;

        foreach ($teachers as $teacher) {
            // Limpar CPF (apenas números)
            $cpf = preg_replace('/\D/', '', $teacher->cpf);

            if (empty($cpf)) {
                $this->warn("Professor {$teacher->name} (ID: {$teacher->id}) não possui CPF válido.");
                continue;
            }

            // Verificar se usuário já existe
            $exists = User::where('employee_id', $teacher->id)
                ->orWhere('cpf', $cpf)
                ->exists();

            if (!$exists) {
                $user = new User();
                $user->name = $teacher->name;
                $user->email = $teacher->email ?: $cpf . '@finedu.com';
                $user->cpf = $cpf;
                $user->password = Hash::make($cpf);
                $user->role = 'teacher';
                $user->employee_id = $teacher->id;
                $user->save();

                $count++;
                $this->info("Usuário criado para o professor: {$teacher->name}");
            }
        }

        $this->info("Sucesso! {$count} novos acessos de professores criados.");
    }
}
