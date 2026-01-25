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
            $this->generateAppointments($class, 'all');
        }

        return response()->json($class->load(['course', 'teacher', 'students']), 201);
    }

    public function checkConflicts(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:employees,id',
            'days_of_week' => 'required|string',
            'start_time' => 'required',
            'end_time' => 'required',
            'exclude_class_id' => 'nullable|integer'
        ]);

        $daysMap = [
            'Segunda' => 1,
            'Terça' => 2,
            'Quarta' => 3,
            'Quinta' => 4,
            'Sexta' => 5,
            'Sábado' => 6,
            'Domingo' => 0,
        ];

        $selectedDays = explode(', ', $request->days_of_week);
        $carbonDays = [];
        foreach ($selectedDays as $day) {
            if (isset($daysMap[$day]))
                $carbonDays[] = $daysMap[$day];
        }

        $conflicts = [];

        // Buscar turmas do mesmo professor
        $teacherClasses = \App\Models\SchoolClass::where('teacher_id', $request->teacher_id)
            ->where('status', 'ativo')
            ->when($request->exclude_class_id, function ($q) use ($request) {
                return $q->where('id', '!=', $request->exclude_class_id);
            })
            ->get();

        foreach ($teacherClasses as $tClass) {
            $tDays = explode(', ', $tClass->days_of_week);
            $commonDays = array_intersect($selectedDays, $tDays);

            if (!empty($commonDays)) {
                // Verificar choque de horário
                $start1 = $request->start_time;
                $end1 = $request->end_time;
                $start2 = $tClass->start_time;
                $end2 = $tClass->end_time;

                if (($start1 < $end2) && ($end1 > $start2)) {
                    $conflicts[] = [
                        'class_name' => $tClass->name,
                        'days' => implode(', ', $commonDays),
                        'time' => "{$start2} - {$end2}"
                    ];
                }
            }
        }

        return response()->json([
            'has_conflicts' => count($conflicts) > 0,
            'conflicts' => $conflicts
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

        // Gerar agenda automática se solicitado
        if ($request->input('generate_appointments') === true && $class->days_of_week) {
            $type = $request->input('generate_type', 'future'); // 'all' ou 'future'

            $query = \App\Models\Appointment::where('school_class_id', $class->id)
                ->where('status', 'agendado');

            if ($type === 'future') {
                $query->where('date', '>=', now()->toDateString());
            }

            $query->delete();
            $this->generateAppointments($class, $type);
        }

        return response()->json($class->load(['course', 'teacher', 'students']));
    }

    private function generateAppointments(\App\Models\SchoolClass $class, $type = 'all')
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
            if (isset($daysMap[$day]))
                $carbonDays[] = $daysMap[$day];
        }

        if (empty($carbonDays))
            return;

        $startDate = $type === 'future' ? \Carbon\Carbon::today() : \Carbon\Carbon::parse(now()->format('Y-01-01'));
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
            }
        }

        while ($startDate->lte($endDate)) {
            if (in_array($startDate->dayOfWeek, $carbonDays)) {
                // Não sobrescrever realizados se for 'all'
                $exists = \App\Models\Appointment::where('school_class_id', $class->id)
                    ->where('date', $startDate->toDateString())
                    ->where('status', '!=', 'agendado')
                    ->exists();

                if (!$exists) {
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
