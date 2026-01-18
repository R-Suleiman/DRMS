<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RecordsController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware(['auth:sanctum', 'checkToken'])->group(function () {
    Route::get('/records', [RecordsController::class, 'records']);
    Route::post('/records', [RecordsController::class, 'createRecord']);
    Route::get('/records/{id}', [RecordsController::class, 'record']);
    Route::post('/records/{id}/update', [RecordsController::class, 'updateRecord']);
    Route::post('/records/{id}/documents', [RecordsController::class, 'createRecordDocument']);
    Route::get('/records/documents/{documentId}', [RecordsController::class, 'viewDocument']);
    Route::delete('/records/documents/{documentId}', [RecordsController::class, 'deleteDocument']);
    Route::get('/record-categories', [RecordsController::class, 'getRecordCategories']);
    Route::get('/record-categories/{id}/record-types', [RecordsController::class, 'getRecordTypes']);
});
