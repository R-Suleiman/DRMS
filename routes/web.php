<?php

use App\Http\Controllers\RecordsController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/records/documents/{documentId}', [RecordsController::class, 'viewDocument']);
Route::get('/records/{recordId}/photo', [RecordsController::class, 'getRecordPhoto']);
