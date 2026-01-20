<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RecordsController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware(['auth:sanctum', 'checkToken'])->group(function () {
    Route::get('/stats', [DashboardController::class, 'stats']);
    Route::get('/records', [RecordsController::class, 'records']);
    Route::post('/records', [RecordsController::class, 'createRecord']);
    Route::get('/records/{id}', [RecordsController::class, 'record']);
    Route::delete('/records/{id}', [RecordsController::class, 'deleteRecord']);
    Route::post('/records/{id}/update', [RecordsController::class, 'updateRecord']);
    Route::post('/records/{id}/documents', [RecordsController::class, 'createRecordDocument']);
    Route::get('/records/documents/{documentId}', [RecordsController::class, 'viewDocument']);
    Route::delete('/records/documents/{documentId}', [RecordsController::class, 'deleteDocument']);
    Route::get('/record-categories', [RecordsController::class, 'getRecordCategories']);
    Route::get('/record-categories/{id}/record-types', [RecordsController::class, 'getRecordTypes']);
    Route::get('/record-volumes', [RecordsController::class, 'getRecordVolumes']);

    // Roles & Permissions
    Route::get('/roles', [RoleController::class, 'index']);
    Route::get('/get-roles', [RoleController::class, 'getRoles']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::get('/roles/{roleId}', [RoleController::class, 'show']);
    Route::put('/roles/{roleId}', [RoleController::class, 'update']);
    Route::delete('/roles/{roleId}', [RoleController::class, 'destroy']);

    Route::get('/permissions', [PermissionController::class, 'index']);

    Route::post('/roles/{roleId}/permissions', [RoleController::class, 'syncPermissions']);
    Route::post('/users/{userId}/roles', [RoleController::class, 'assignRole']);

    //users
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{userId}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{userId}', [UserController::class, 'update']);
    Route::delete('/users/{userId}', [UserController::class, 'destroy']);

    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/users/{userId}/reset-password', [AuthController::class, 'resetUserPassword']);

    // Route::middleware('role:admin')->group(function () {
    // });
});
