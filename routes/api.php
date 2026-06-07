<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DocumentCategoryController;
use App\Http\Controllers\DocumentTypeController;
use App\Http\Controllers\DocumentVolumeController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RecordsController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ServiceRecordsController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/login/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/login/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware(['auth:sanctum', 'checkToken'])->group(function () {
    Route::get('/stats', [DashboardController::class, 'stats']);
    Route::get('/records', [RecordsController::class, 'records']);
    Route::post('/records', [RecordsController::class, 'createRecord']);
    Route::get('/records/{id}', [RecordsController::class, 'record']);
    Route::delete('/records/{id}', [RecordsController::class, 'deleteRecord']);
    Route::post('/records/{id}/update', [RecordsController::class, 'updateRecord']);
    Route::post('/records/{id}/documents', [RecordsController::class, 'createRecordDocument']);
    Route::get('/records/{id}/photo', [RecordsController::class, 'getRecordPhoto']);
    Route::get('/records/documents/{documentId}', [RecordsController::class, 'viewDocument']);
    Route::delete('/records/documents/{documentId}', [RecordsController::class, 'deleteDocument']);
    Route::get('/record-categories', [RecordsController::class, 'getRecordCategories']);
    Route::get('/record-categories/{id}/record-types', [RecordsController::class, 'getRecordTypes']);
    Route::get('/record-volumes', [RecordsController::class, 'getRecordVolumes']);

    // service records
    Route::get('/service-records', [ServiceRecordsController::class, 'records']);
    Route::post('/service-records', [ServiceRecordsController::class, 'create']);
    Route::get('/service-records/{id}', [ServiceRecordsController::class, 'record']);
    Route::get('/service-records/departments/get', [ServiceRecordsController::class, 'getDepartments']);
    Route::post('/service-records/{id}/update', [ServiceRecordsController::class, 'updateRecord']);
    Route::delete('/service-records/{id}', [ServiceRecordsController::class, 'deleteRecord']);


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

    // departments
    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::get('/departments/list', [DepartmentController::class, 'getDepartments']);
    Route::post('/departments', [DepartmentController::class, 'store']);
    Route::get('/departments/{id}', [DepartmentController::class, 'show']);
    Route::put('/departments/{id}', [DepartmentController::class, 'update']);
    Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);

    // document settings - categories, types, volumes
    Route::get('/document-categories', [DocumentCategoryController::class, 'index']);
    Route::get('/document-categories/list', [DocumentCategoryController::class, 'list']);
    Route::post('/document-categories', [DocumentCategoryController::class, 'store']);
    Route::get('/document-categories/{id}', [DocumentCategoryController::class, 'show']);
    Route::put('/document-categories/{id}', [DocumentCategoryController::class, 'update']);
    Route::delete('/document-categories/{id}', [DocumentCategoryController::class, 'destroy']);

    Route::get('/document-types', [DocumentTypeController::class, 'index']);
    Route::get('/document-types/list', [DocumentTypeController::class, 'list']);
    Route::post('/document-types', [DocumentTypeController::class, 'store']);
    Route::get('/document-types/{id}', [DocumentTypeController::class, 'show']);
    Route::put('/document-types/{id}', [DocumentTypeController::class, 'update']);
    Route::delete('/document-types/{id}', [DocumentTypeController::class, 'destroy']);

    Route::get('/document-volumes', [DocumentVolumeController::class, 'index']);
    Route::get('/document-volumes/list', [DocumentVolumeController::class, 'list']);
    Route::post('/document-volumes', [DocumentVolumeController::class, 'store']);
    Route::get('/document-volumes/{id}', [DocumentVolumeController::class, 'show']);
    Route::put('/document-volumes/{id}', [DocumentVolumeController::class, 'update']);
    Route::delete('/document-volumes/{id}', [DocumentVolumeController::class, 'destroy']);

    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/users/{userId}/reset-password', [AuthController::class, 'resetUserPassword']);

    // Route::middleware('role:admin')->group(function () {
    // });
});
