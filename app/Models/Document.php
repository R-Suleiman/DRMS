<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = ['record_id', 'volume_id', 'category', 'name', 'nature', 'file_path', 'size', 'mime_type', 'created_by', 'updated_by'];

    public function record()
    {
        return $this->belongsTo(AllRecords::class, 'record_id', 'id');
    }

    public function volume()
    {
        return $this->belongsTo(DocumentVolume::class, 'volume_id', 'id');
    }

    public function category()
    {
        return $this->belongsTo(DocumentCategory::class, 'category', 'id');
    }

    public function type()
    {
        return $this->belongsTo(DocumentType::class, 'name', 'id');
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
    protected static function booted()
    {
        static::creating(function ($model) {
            if (auth()->check()) {
                $model->created_by = auth()->id();
            }
        });

        static::updating(function ($model) {
            if (auth()->check()) {
                $model->updated_by = auth()->id();
            }
        });
    }
}
