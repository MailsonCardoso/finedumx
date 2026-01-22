<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'price', 'description', 'teacher_id'];

    public function teacher()
    {
        return $this->belongsTo(Employee::class, 'teacher_id');
    }
}
