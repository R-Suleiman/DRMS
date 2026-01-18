<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentCategory extends Model
{
    protected $fillable = ['category_name'];

    public function documentTypes() {
        return $this->hasMany(DocumentType::class);
    }

    public function documents() {
        return $this->hasMany(Document::class, 'category');
    }
}
