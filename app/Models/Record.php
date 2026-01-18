<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Record extends Model
{
    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'phone',
        'dob',
        'gender',
        'email',
        'nida',
        'photo',
    ];

    protected $casts = [
        'dob' => 'date:Y-m-d',
    ];

    protected $appends = ['photo_url'];

    public function metadata()
    {
        return $this->hasMany(RecordMetadata::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class, 'record_id', 'id');
    }

    public function getPhotoUrlAttribute()
    {
        if (!$this->photo) {
            return null;
        }

        return url("/records/{$this->id}/photo");
    }
}
