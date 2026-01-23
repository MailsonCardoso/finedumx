<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Tuition;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentPortalController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'student' || !$user->student_id) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }

        $studentId = $user->student_id;

        // Meus Horários (Appointments individuais ou da turma)
        $classIds = SchoolClass::whereHas('students', function ($q) use ($studentId) {
            $q->where('student_id', $studentId);
        })->pluck('id');

        $appointments = Appointment::with(['course', 'schoolClass'])
            ->where(function ($q) use ($studentId, $classIds) {
                $q->where('student_id', $studentId)
                    ->orWhereIn('school_class_id', $classIds);
            })
            ->where('date', '>=', now()->toDateString())
            ->orderBy('date')
            ->orderBy('start_time')
            ->limit(10)
            ->get();

        // Minhas Mensalidades com lógica de status e links
        $tuitions = Tuition::where('student_id', $studentId)
            ->orderBy('due_date', 'desc')
            ->get()
            ->map(function ($t) {
                // Se não estiver pago, pode gerar link do MP
                if ($t->status !== 'pago') {
                    // Adicionamos um campo virtual para o frontend saber que pode cobrar
                    $t->payment_url = route('tuitions.payment-link', $t->id);
                }

                // Determinar se está em atraso
                if ($t->status !== 'pago' && $t->due_date < now()->toDateString()) {
                    $t->is_overdue = true;
                } else {
                    $t->is_overdue = false;
                }

                return $t;
            });

        // Estatísticas para os KPI Cards
        $stats = [
            'next_due_date' => $tuitions->where('status', 'pendente')->where('due_date', '>=', now()->toDateString())->sortBy('due_date')->first()?->due_date,
            'total_paid' => $tuitions->where('status', 'pago')->sum('amount'),
            'overdue_count' => $tuitions->where('status', 'pendente')->where('due_date', '<', now()->toDateString())->count(),
            'pending_amount' => $tuitions->where('status', 'pendente')->sum('amount'),
        ];

        // Minhas Presenças (Aulas com status 'realizado')
        $presences = Appointment::where(function ($q) use ($studentId, $classIds) {
            $q->where('student_id', $studentId)
                ->orWhereIn('school_class_id', $classIds);
        })
            ->where('status', 'realizado')
            ->orderBy('date', 'desc')
            ->limit(15)
            ->get();

        // Matriculado em (Cursos/Turmas)
        $enrolled = SchoolClass::whereHas('students', function ($q) use ($studentId) {
            $q->where('student_id', $studentId);
        })->with('course')->get();

        return response()->json([
            'student' => $user->load('student'),
            'appointments' => $appointments,
            'tuitions' => $tuitions,
            'presences' => $presences,
            'enrolled' => $enrolled,
            'stats' => $stats
        ]);
    }
}
