<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonMetadata extends Model
{
    protected $fillable = ['person_id', 'meta_key', 'meta_value'];

    public function person()
    {
        return $this->belongsTo(Person::class);
    }
}
