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

        // Minhas Mensalidades
        $tuitions = Tuition::where('student_id', $studentId)
            ->orderBy('due_date', 'desc')
            ->get();

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
            'enrolled' => $enrolled
        ]);
    }
}
