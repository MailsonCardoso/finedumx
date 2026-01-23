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

        // Recuperar agendamentos vinculados aos cursos deste professor
        $appointments = Appointment::with(['course', 'student', 'schoolClass.students'])
            ->whereHas('course', function ($query) use ($teacherId) {
                $query->where('teacher_id', $teacherId);
            })
            ->orWhere('student_id', null) // Se for uma aula de turma, o professor pode estar vinculado à turma/curso
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'asc')
            ->get();

        // Filtrar apenas o que realmente pertence ao professor (caso o orWhere tenha sido muito amplo)
        $myAppointments = $appointments->filter(function ($app) use ($teacherId) {
            return $app->course && $app->course->teacher_id == $teacherId;
        });

        // Estatísticas rápidas
        $stats = [
            'total_lessons' => $myAppointments->count(),
            'upcoming_lessons' => $myAppointments->where('date', '>=', now()->toDateString())->where('status', 'pendente')->count(),
            'completed_lessons' => $myAppointments->where('status', 'realizado')->count(),
        ];

        return response()->json([
            'teacher' => $user->load('employee'),
            'appointments' => $myAppointments->values(),
            'stats' => $stats
        ]);
    }
}
