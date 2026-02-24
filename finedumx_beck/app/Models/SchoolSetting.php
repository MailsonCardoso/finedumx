<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'cnpj',
        'phone',
        'email',
        'address',
        'pix_key',
        'theme',
    ];
}
