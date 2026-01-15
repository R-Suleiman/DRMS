<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = ['person_id', 'type', 'name', 'file_path', 'size', 'created_by', 'updated_by'];

    public function person()
    {
        return $this->belongsTo(Person::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by', 'id');
    }

    // automatically add created_by and updated_by
    public static function boot() {
        parent::boot();
        self::creating(function ($model) {
            $model->created_by = auth()->id;
        });
        self::updating(function ($model) {
            $model->updated_by = auth()->id;
        });
    }
}
