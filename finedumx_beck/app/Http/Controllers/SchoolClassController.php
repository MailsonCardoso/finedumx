<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use Illuminate\Http\Request;

class SchoolClassController extends Controller
{
    public function index(Request $request)
    {
        $query = SchoolClass::with(['course', 'teacher', 'students']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->has('status') && $request->status !== 'todos') {
            $query->where('status', $request->status);
        }

        $classes = $query->get()->map(function ($class) {
            return [
                'id' => $class->id,
                'name' => $class->name,
                'course_id' => $class->course_id,
                'course_name' => $class->course ? $class->course->name : null,
                'teacher_id' => $class->teacher_id,
                'teacher_name' => $class->teacher ? $class->teacher->name : null,
                'shift' => $class->shift,
                'start_time' => $class->start_time,
                'end_time' => $class->end_time,
                'days_of_week' => $class->days_of_week,
                'max_students' => $class->max_students,
                'current_students' => $class->students->count(),
                'room' => $class->room,
                'status' => $class->status,
                'student_ids' => $class->students->pluck('id')->toArray(),
                'students' => $class->students->map(function ($s) {
                    return [
                        'id' => $s->id,
                        'name' => $s->name,
                    ];
                }),
            ];
        });

        return response()->json($classes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'course_id' => 'required|exists:courses,id',
            'teacher_id' => 'nullable|exists:employees,id',
            'shift' => 'nullable|string',
            'start_time' => 'nullable|string',
            'end_time' => 'nullable|string',
            'days_of_week' => 'nullable|string',
            'max_students' => 'nullable|integer',
            'room' => 'nullable|string',
            'status' => 'nullable|string',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        $class = \App\Models\SchoolClass::create($validated);

        if (isset($validated['student_ids'])) {
            $class->students()->sync($validated['student_ids']);
        }

        // Gerar agenda automática se solicitado
        if ($request->input('generate_appointments') === true && $class->days_of_week) {
            $this->generateAppointments($class);
        }

        return response()->json($class->load(['course', 'teacher', 'students']), 201);
    }

    public function show(\App\Models\SchoolClass $class)
    {
        return response()->json([
            'id' => $class->id,
            'name' => $class->name,
            'course_id' => $class->course_id,
            'course_name' => $class->course ? $class->course->name : null,
            'teacher_id' => $class->teacher_id,
            'teacher_name' => $class->teacher ? $class->teacher->name : null,
            'shift' => $class->shift,
            'start_time' => $class->start_time,
            'end_time' => $class->end_time,
            'days_of_week' => $class->days_of_week,
            'max_students' => $class->max_students,
            'current_students' => $class->students->count(),
            'room' => $class->room,
            'status' => $class->status,
            'student_ids' => $class->students->pluck('id')->toArray(),
            'students' => $class->students->map(function ($s) {
                return [
                    'id' => $s->id,
                    'name' => $s->name,
                ];
            }),
        ]);
    }

    public function update(Request $request, \App\Models\SchoolClass $class)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'course_id' => 'required|exists:courses,id',
            'teacher_id' => 'nullable|exists:employees,id',
            'shift' => 'nullable|string',
            'start_time' => 'nullable|string',
            'end_time' => 'nullable|string',
            'days_of_week' => 'nullable|string',
            'max_students' => 'nullable|integer',
            'room' => 'nullable|string',
            'status' => 'nullable|string',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        $class->update($validated);

        if (isset($validated['student_ids'])) {
            $class->students()->sync($validated['student_ids']);
        }

        // Gerar agenda automática se solicitado (em edição)
        if ($request->input('generate_appointments') === true && $class->days_of_week) {
            // Opcional: Remover agendamentos futuros antes de gerar novos para evitar duplicidade
            \App\Models\Appointment::where('school_class_id', $class->id)
                ->where('date', '>=', now()->toDateString())
                ->where('status', 'agendado')
                ->delete();

            $this->generateAppointments($class);
        }

        return response()->json($class->load(['course', 'teacher', 'students']));
    }

    private function generateAppointments(\App\Models\SchoolClass $class)
    {
        $daysMap = [
            'Segunda' => 1,
            'Terça' => 2,
            'Quarta' => 3,
            'Quinta' => 4,
            'Sexta' => 5,
            'Sábado' => 6,
            'Domingo' => 0,
        ];

        $selectedDays = explode(', ', $class->days_of_week);
        $carbonDays = [];
        foreach ($selectedDays as $day) {
            if (isset($daysMap[$day])) {
                $carbonDays[] = $daysMap[$day];
            }
        }

        if (empty($carbonDays))
            return;

        $startDate = \Carbon\Carbon::today();
        $endDate = \Carbon\Carbon::parse('2026-12-31');

        $duration = "1h";
        if ($class->start_time && $class->end_time) {
            try {
                $start = \Carbon\Carbon::parse($class->start_time);
                $end = \Carbon\Carbon::parse($class->end_time);
                $diff = $start->diff($end);
                $duration = $diff->format('%Hh %Im');
                $duration = str_replace(' 00m', '', $duration);
                $duration = ltrim($duration, '0');
                if (empty($duration))
                    $duration = "1h";
            } catch (\Exception $e) {
                // Silently fallback to default duration
            }
        }

        while ($startDate->lte($endDate)) {
            if (in_array($startDate->dayOfWeek, $carbonDays)) {
                \App\Models\Appointment::updateOrCreate([
                    'school_class_id' => $class->id,
                    'date' => $startDate->toDateString(),
                    'type' => 'grupo',
                ], [
                    'course_id' => $class->course_id,
                    'start_time' => $class->start_time,
                    'duration' => $duration,
                    'status' => 'agendado',
                ]);
            }
            $startDate->addDay();
        }
    }

    public function destroy(\App\Models\SchoolClass $class)
    {
        $class->delete();
        return response()->json(null, 204);
    }
}
