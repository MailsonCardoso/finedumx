<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'active_responsible',
        'email',
        'cpf',
        'phone',
        'course',
        'due_day',
        'monthly_fee',
        'status',
        'course_id',
        'class_type',
        'teacher_id',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function tuitions()
    {
        return $this->hasMany(Tuition::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function schoolClasses()
    {
        return $this->belongsToMany(SchoolClass::class, 'class_student', 'student_id', 'school_class_id');
    }
}
