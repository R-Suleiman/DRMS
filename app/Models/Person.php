<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Person extends Model
{
    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'phone',
        'dob',
        'gender',
        'email',
        'photo',
    ];

    protected $casts = [
        'dob' => 'date',
    ];

    public function metadata() {
        return $this->hasMany(PersonMetadata::class);
    }
}
