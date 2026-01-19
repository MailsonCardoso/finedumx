<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tuition extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'reference',
        'due_date',
        'amount',
        'status',
        'type',
        'last_notification_at',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
