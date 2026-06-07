<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = [
        'name',
        'short_name',
    ];

    public function records()
    {
        return $this->hasMany(ServiceRecord::class);
    }
}
