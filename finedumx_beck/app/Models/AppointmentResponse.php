<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppointmentResponse extends Model
{
    protected $fillable = ['appointment_id', 'student_id', 'response', 'reason'];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
