<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Employee::query();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('cpf', 'like', "%{$search}%");
        }

        if ($request->has('status') && $request->get('status') !== 'todos') {
            $query->where('status', $request->get('status'));
        }

        return $query->latest()->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email',
            'cpf' => 'nullable|string',
            'phone' => 'nullable|string',
            'role' => 'nullable|string',
            'salary' => 'nullable|numeric',
            'status' => 'nullable|string',
            'payment_day' => 'nullable|integer',
            'is_teacher' => 'nullable|boolean',
        ]);

        $employee = Employee::create($validated);

        // Criar usuário de acesso para o portal (CPF limpo ou Email)
        $login = null;
        if ($employee->cpf) {
            $login = preg_replace('/\D/', '', $employee->cpf);
        }

        if ($login) {
            // Verificar se já existe usuário com esse login
            $userExists = \App\Models\User::where('email', $login)
                ->orWhere('cpf', $login)
                ->exists();

            if (!$userExists) {
                \App\Models\User::create([
                    'name' => $employee->name,
                    'email' => $login,
                    'cpf' => $login,
                    'password' => \Illuminate\Support\Facades\Hash::make($login),
                    'role' => $employee->is_teacher ? 'teacher' : ($employee->role ?: 'staff'), // Usa o cargo do funcionário se disponível
                    'employee_id' => $employee->id
                ]);
            }
        }

        return response()->json($employee, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Employee $employee)
    {
        return $employee;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email,' . $employee->id,
            'cpf' => 'nullable|string',
            'phone' => 'nullable|string',
            'role' => 'nullable|string',
            'salary' => 'nullable|numeric',
            'status' => 'nullable|string',
            'payment_day' => 'nullable|integer',
            'is_teacher' => 'nullable|boolean',
        ]);

        $employee->update($validated);

        // Sincronizar usuário
        if ($employee->cpf) {
            $login = preg_replace('/\D/', '', $employee->cpf);
            if ($login) {
                $user = \App\Models\User::where('employee_id', $employee->id)->first();

                if ($user) {
                    $user->update([
                        'name' => $employee->name,
                        'email' => $login,
                        'cpf' => $login,
                        'role' => $employee->is_teacher ? 'teacher' : ($employee->role ?: 'staff'),
                    ]);
                } else {
                    // Criar se não existir
                    $userExists = \App\Models\User::where('email', $login)
                        ->orWhere('cpf', $login)
                        ->exists();

                    if (!$userExists) {
                        \App\Models\User::create([
                            'name' => $employee->name,
                            'email' => $login,
                            'cpf' => $login,
                            'password' => \Illuminate\Support\Facades\Hash::make($login),
                            'role' => $employee->is_teacher ? 'teacher' : ($employee->role ?: 'staff'),
                            'employee_id' => $employee->id
                        ]);
                    }
                }
            }
        }

        return response()->json($employee);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee)
    {
        \DB::transaction(function () use ($employee) {
            // Remover usuário de acesso
            \App\Models\User::where('employee_id', $employee->id)->delete();

            $employee->delete();
        });

        return response()->json(null, 204);
    }
}
