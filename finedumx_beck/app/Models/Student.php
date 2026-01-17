<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'course',
        'due_day',
        'monthly_fee',
        'status',
    ];

    public function tuitions()
    {
        return $this->hasMany(Tuition::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
