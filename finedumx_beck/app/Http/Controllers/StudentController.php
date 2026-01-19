<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::query();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('status') && $request->status !== 'todos') {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'active_responsible' => 'nullable|string',
            'email' => 'required|email|unique:students',
            'phone' => 'nullable|string',
            'course' => 'nullable|string',
            'due_day' => 'required|integer|min:1|max:31',
            'monthly_fee' => 'required|numeric|min:0',
            // Optional flags
            'generate_matricula' => 'boolean',
            'matricula_value' => 'nullable|numeric',
            'generate_tuition' => 'boolean',
        ], [
            'email.unique' => 'Este e-mail já está sendo utilizado por outro aluno.',
            'email.required' => 'O campo e-mail é obrigatório.',
            'email.email' => 'Insira um e-mail válido.',
            'name.required' => 'O nome do aluno é obrigatório.',
            'due_day.required' => 'O dia do vencimento é obrigatório.',
            'due_day.integer' => 'O dia do vencimento deve ser um número inteiro.',
            'due_day.min' => 'O dia do vencimento deve ser entre 1 e 31.',
            'due_day.max' => 'O dia do vencimento deve ser entre 1 e 31.',
            'monthly_fee.required' => 'O valor da mensalidade é obrigatório.',
            'monthly_fee.numeric' => 'O valor da mensalidade deve ser um número.',
            'monthly_fee.min' => 'O valor da mensalidade não pode ser negativo.',
        ]);

        $student = Student::create($validated);

        // Gerar Matrícula (Se solicitado)
        if ($request->input('generate_matricula')) {
            $val = $request->input('matricula_value', 100);
            \App\Models\Tuition::create([
                'student_id' => $student->id,
                'reference' => 'Matrícula',
                'due_date' => now()->toDateString(), // Vence hoje
                'amount' => $val,
                'status' => 'pendente',
                'type' => 'matricula'
            ]);
        }

        // Gerar 1ª Mensalidade (Se solicitado - para o próximo mês)
        if ($request->input('generate_tuition')) {
            $nextMonth = now()->addMonth();
            $day = str_pad((string) $student->due_day, 2, '0', STR_PAD_LEFT);
            $month = $nextMonth->format('m');
            $year = $nextMonth->format('Y');

            // Ref: Mês/Ano (ex: Fev/2025)
            $months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

            // Laravel format 'm' 01-12, array index 0-11
            $ref = $months[(int) $month - 1] . '/' . $year;

            $dueDate = "{$year}-{$month}-{$day}";

            \App\Models\Tuition::create([
                'student_id' => $student->id,
                'reference' => $ref,
                'due_date' => $dueDate,
                'amount' => $student->monthly_fee,
                'status' => 'pendente',
                'type' => 'mensalidade'
            ]);
        }

        return response()->json($student, 201);
    }

    public function show(Student $student)
    {
        return response()->json($student);
    }

    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string',
            'active_responsible' => 'nullable|string',
            'email' => 'sometimes|required|email|unique:students,email,' . $student->id,
            'phone' => 'nullable|string',
            'course' => 'nullable|string',
            'due_day' => 'integer',
            'monthly_fee' => 'sometimes|required|numeric',
            'status' => 'sometimes|required|string',
        ], [
            'email.unique' => 'Este e-mail já está sendo utilizado por outro aluno.',
            'email.required' => 'O campo e-mail é obrigatório.',
            'email.email' => 'Insira um e-mail válido.',
            'name.required' => 'O nome do aluno é obrigatório.',
            'monthly_fee.required' => 'O valor da mensalidade é obrigatório.',
        ]);

        $student->update($validated);
        return response()->json($student);
    }

    public function destroy(Student $student)
    {
        \DB::transaction(function () use ($student) {
            // Manualmente limpando para garantir que não fiquem órfãos se a constraint falhar
            $student->payments()->delete();
            $student->tuitions()->delete();
            $student->delete();
        });

        return response()->json(null, 204);
    }
}
