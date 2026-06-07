<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Record extends Model
{
    protected $fillable = [
        'record_id',
        'first_name',
        'middle_name',
        'last_name',
        'phone',
        'dob',
        'gender',
        'email',
        'nida',
        'photo',
        'is_classified',
    ];

    protected $casts = [
        'dob' => 'date:Y-m-d',
        'is_classified' => 'boolean',
    ];

    protected $appends = ['photo_url'];

    public function mainRecord() {
        return $this->belongsTo(AllRecords::class, 'record_id', 'id');
    }

    public function metadata()
    {
        return $this->hasMany(RecordMetadata::class);
    }

    public function getPhotoUrlAttribute()
    {
        if (!$this->photo) {
            return null;
        }

        return url("/records/{$this->id}/photo");
    }
}
