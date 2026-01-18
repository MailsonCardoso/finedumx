<?php

namespace App\Http\Controllers;

use App\Models\Tuition;
use Illuminate\Http\Request;

class TuitionController extends Controller
{
    public function index(Request $request)
    {
        $query = Tuition::with('student')->whereHas('student');

        if ($request->has('status') && $request->status !== 'todos') {
            $query->where('status', $request->status);
        }

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('month')) {
            $query->where('reference', 'like', '%' . $request->month . '%');
        }

        return response()->json($query->latest('due_date')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'reference' => 'required|string', // e.g., 'Jan/2025'
            'due_date' => 'required|date',
            'amount' => 'required|numeric',
        ]);

        $student = \App\Models\Student::findOrFail($validated['student_id']);
        if ($student->status !== 'ativo') {
            return response()->json(['message' => 'Não é possível gerar mensalidade para aluno inativo'], 422);
        }

        $validated['status'] = 'pendente';

        // Simple check just to avoid simple duplicates for same month
        $exists = Tuition::where('student_id', $validated['student_id'])
            ->where('reference', $validated['reference'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Mensalidade já existe para este período'], 422);
        }

        $tuition = Tuition::create($validated);
        return response()->json($tuition, 201);
    }

    public function generateBatch(Request $request)
    {
        $request->validate([
            'reference' => 'required|string', // e.g. Feb/2025
            'year' => 'required|integer',
            'month' => 'required|integer', // 1-12
        ]);

        $students = \App\Models\Student::where('status', 'ativo')->get();
        $count = 0;

        foreach ($students as $student) {
            $day = str_pad((string) $student->due_day, 2, '0', STR_PAD_LEFT);
            $month = str_pad((string) $request->month, 2, '0', STR_PAD_LEFT);
            $dueDate = "{$request->year}-{$month}-{$day}";

            $exists = Tuition::where('student_id', $student->id)
                ->where('reference', $request->reference)
                ->exists();

            if (!$exists) {
                Tuition::create([
                    'student_id' => $student->id,
                    'reference' => $request->reference,
                    'due_date' => $dueDate,
                    'amount' => $student->monthly_fee,
                    'status' => 'pendente'
                ]);
                $count++;
            }
        }

        return response()->json(['message' => "Geradas {$count} mensalidades com sucesso!"]);
    }

    public function notify(Tuition $tuition)
    {
        $tuition->update(['last_notification_at' => now()]);
        return response()->json($tuition);
    }
}
