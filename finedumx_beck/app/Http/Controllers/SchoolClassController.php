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
                'student_ids' => $class->students->pluck('id'),
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

        $class = SchoolClass::create($validated);

        if (isset($validated['student_ids'])) {
            $class->students()->sync($validated['student_ids']);
        }

        return response()->json($class->load(['course', 'teacher', 'students']), 201);
    }

    public function show(SchoolClass $schoolClass)
    {
        return response()->json([
            'id' => $schoolClass->id,
            'name' => $schoolClass->name,
            'course_id' => $schoolClass->course_id,
            'course_name' => $schoolClass->course ? $schoolClass->course->name : null,
            'teacher_id' => $schoolClass->teacher_id,
            'teacher_name' => $schoolClass->teacher ? $schoolClass->teacher->name : null,
            'shift' => $schoolClass->shift,
            'start_time' => $schoolClass->start_time,
            'end_time' => $schoolClass->end_time,
            'days_of_week' => $schoolClass->days_of_week,
            'max_students' => $schoolClass->max_students,
            'current_students' => $schoolClass->students->count(),
            'room' => $schoolClass->room,
            'status' => $schoolClass->status,
            'student_ids' => $schoolClass->students->pluck('id'),
        ]);
    }

    public function update(Request $request, SchoolClass $schoolClass)
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

        $schoolClass->update($validated);

        if (isset($validated['student_ids'])) {
            $schoolClass->students()->sync($validated['student_ids']);
        }

        return response()->json($schoolClass->load(['course', 'teacher', 'students']));
    }

    public function destroy(SchoolClass $schoolClass)
    {
        $schoolClass->delete();
        return response()->json(null, 204);
    }
}
