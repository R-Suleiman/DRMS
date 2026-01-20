<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentVolume extends Model
{
    protected $fillable = ['volume_name'];

    public function documents() {
        return $this->hasMany(Document::class);
    }
}
