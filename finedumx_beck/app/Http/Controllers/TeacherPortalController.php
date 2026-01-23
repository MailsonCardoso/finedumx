<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TeacherPortalController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'teacher' || !$user->employee_id) {
            return response()->json(['error' => 'Acesso negado. Apenas professores podem acessar este portal.'], 403);
        }

        $teacherId = $user->employee_id;

        // Recuperar agendamentos vinculados ao professor via Curso OU Turma
        $myAppointments = Appointment::with(['course', 'student', 'schoolClass.students'])
            ->where(function ($query) use ($teacherId) {
                // Filtra por professor no curso
                $query->whereHas('course', function ($q) use ($teacherId) {
                    $q->where('teacher_id', $teacherId);
                })
                    // OU filtra por professor na turma
                    ->orWhereHas('schoolClass', function ($q) use ($teacherId) {
                    $q->where('teacher_id', $teacherId);
                });
            })
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'asc')
            ->get();

        // Estatísticas rápidas
        $stats = [
            'total_lessons' => $myAppointments->count(),
            'upcoming_lessons' => $myAppointments->where('date', '>=', now()->toDateString())->where('status', 'pendente')->count(),
            'completed_lessons' => $myAppointments->where('status', 'realizado')->count(),
        ];

        return response()->json([
            'teacher' => $user->load('employee'),
            'appointments' => $myAppointments,
            'stats' => $stats
        ]);
    }
}
