<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceRecord extends Model
{
    protected $fillable = [
        'record_id',
        'service_name',
        'description',
        'department_id',
        'is_classified',
    ];

     public function mainRecord() {
        return $this->belongsTo(AllRecords::class, 'record_id', 'id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

     protected $casts = [
        'is_classified' => 'boolean',
    ];

    public function metadata()
    {
        return $this->hasMany(RecordMetadata::class, 'record_id', 'id');
    }

    public function documents()
    {
        return $this->hasMany(Document::class, 'record_id', 'id');
    }
}
