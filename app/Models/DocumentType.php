<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    protected $fillable = ['category_id', 'name'];

    public function category() {
        return $this->belongsTo(DocumentCategory::class, 'category_id', 'id');
    }

    public function documents() {
        return $this->hasMany(Document::class, 'name');
    }
}
