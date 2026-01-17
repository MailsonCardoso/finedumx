<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'tuition_id',
        'type',
        'method',
        'payment_date',
        'amount',
        'status',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function tuition()
    {
        return $this->belongsTo(Tuition::class);
    }
}
