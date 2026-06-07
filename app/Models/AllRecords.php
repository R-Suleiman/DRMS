<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AllRecords extends Model
{
    protected $fillable = ['record_number', "record_type"];

    public function personalRecords() {
        return $this->hasMany(Record::class, 'record_id', 'id');
    }

    public function serviceRecords() {
        return $this->hasMany(ServiceRecord::class, 'record_id', 'id');
    }

    public function metadata()
    {
        return $this->hasMany(RecordMetadata::class, 'record_id', 'id');
    }

    public function documents()
    {
        return $this->hasMany(Document::class, 'record_id', 'id');
    }
}
