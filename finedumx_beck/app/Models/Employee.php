<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'cpf',
        'phone',
        'role',
        'salary',
        'status',
        'payment_day',
        'is_teacher',
    ];

    protected $casts = [
        'is_teacher' => 'boolean',
        'salary' => 'decimal:2',
        'payment_day' => 'integer',
    ];
}
