<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    protected $filable = ['category_id', 'name'];

    public function category() {
        return $this->belongsTo(DocumentCategory::class);
    }

    public function documents() {
        return $this->hasMany(Document::class, 'name');
    }
}
