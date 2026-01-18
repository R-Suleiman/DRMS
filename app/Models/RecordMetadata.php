<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecordMetadata extends Model
{
    protected $fillable = ['record_id', 'meta_key', 'meta_value'];

    public function record()
    {
        return $this->belongsTo(Record::class);
    }
}
