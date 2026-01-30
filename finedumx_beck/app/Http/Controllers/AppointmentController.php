<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Sempre carregar as respostas para visualização no front
        $query = Appointment::with(['student', 'schoolClass.teacher', 'course.teacher', 'responses.student']);

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('school_class_id')) {
            $query->where('school_class_id', $request->school_class_id);
        }

        if ($request->has('date')) {
            $query->where('date', $request->date);
        }
        
        // Novo filtro de data inicial
        if ($request->has('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }

        // Novo filtro por status de resposta (ex: declined)
        if ($request->has('response_status')) {
            $status = $request->response_status;
            $query->whereHas('responses', function($q) use ($status) {
                $q->where('response', $status);
            });
        }

        return $query->orderBy('date', 'asc')->orderBy('start_time', 'asc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:individual,grupo',
            'student_id' => 'required_if:type,individual|nullable|exists:students,id',
            'school_class_id' => 'required_if:type,grupo|nullable|exists:school_classes,id',
            'course_id' => 'nullable|exists:courses,id',
            'date' => 'required|date',
            'start_time' => 'required',
            'duration' => 'required|string',
            'status' => 'required|in:agendado,realizado,falta',
            'notes' => 'nullable|string'
        ]);

        return Appointment::create($validated);
    }

    public function show(Appointment $appointment)
    {
        return $appointment->load(['student', 'schoolClass', 'course']);
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'type' => 'sometimes|required|in:individual,grupo',
            'student_id' => 'nullable|exists:students,id',
            'school_class_id' => 'nullable|exists:school_classes,id',
            'course_id' => 'nullable|exists:courses,id',
            'date' => 'sometimes|required|date',
            'start_time' => 'sometimes|required',
            'duration' => 'sometimes|required|string',
            'status' => 'sometimes|required|in:agendado,realizado,falta',
            'notes' => 'nullable|string'
        ]);

        $appointment->update($validated);
        return $appointment;
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();
        return response()->noContent();
    }
}
