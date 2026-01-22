<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index()
    {
        $courses = Course::with('teacher')->get()->map(function ($course) {
            return [
                'id' => $course->id,
                'name' => $course->name,
                'price' => $course->price,
                'description' => $course->description,
                'teacher_id' => $course->teacher_id,
                'teacher_name' => $course->teacher ? $course->teacher->name : null,
            ];
        });

        return response()->json($courses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'teacher_id' => 'nullable|exists:employees,id',
        ]);

        if (isset($validated['teacher_id']) && $request->teacher_id === 'none') {
            $validated['teacher_id'] = null;
        }

        $course = Course::create($validated);
        return response()->json($course->load('teacher'), 201);
    }

    public function show(Course $course)
    {
        return response()->json($course->load('teacher'));
    }

    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'teacher_id' => 'nullable|exists:employees,id',
        ]);

        if (isset($request->teacher_id) && $request->teacher_id === 'none') {
            $validated['teacher_id'] = null;
        }

        $course->update($validated);
        return response()->json($course->load('teacher'));
    }

    public function destroy(Course $course)
    {
        $course->delete();
        return response()->noContent();
    }
}
