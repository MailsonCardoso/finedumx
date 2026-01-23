<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'cpf' => 'required',
            'password' => 'required',
        ]);

        $cpf = preg_replace('/\D/', '', $request->cpf);

        // Tenta encontrar por CPF limpo ou por e-mail (onde salvamos o CPF do aluno)
        $user = User::where('email', $cpf)
            ->orWhere('cpf', $cpf)
            ->first();

        if (!$user) {
            // Fallback para CPFs formatados no banco
            $user = User::all()->first(function ($u) use ($cpf) {
                return preg_replace('/\D/', '', $u->cpf) === $cpf;
            });
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'cpf' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        // Verificar status se for aluno
        if ($user->role === 'student' && $user->student_id) {
            $student = \App\Models\Student::find($user->student_id);
            if (!$student || $student->status !== 'ativo') {
                throw ValidationException::withMessages([
                    'cpf' => ['Este acesso está desativado. Entre em contato com a secretaria.'],
                ]);
            }
        }

        // Verificar status se for funcionário/professor
        if ($user->role !== 'admin' && $user->employee_id) {
            $employee = \App\Models\Employee::find($user->employee_id);
            if (!$employee || $employee->status !== 'ativo') {
                throw ValidationException::withMessages([
                    'cpf' => ['Acesso de funcionário inativo.'],
                ]);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function me(Request $request)
    {
        return $request->user();
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Desconectado com sucesso']);
    }
}
