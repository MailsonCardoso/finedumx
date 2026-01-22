<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\TuitionController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/mp-test', function () {
    return response()->json([
        'token_configured' => !empty(env('MERCADO_PAGO_ACCESS_TOKEN')),
        'token_start' => substr(env('MERCADO_PAGO_ACCESS_TOKEN') ?? '', 0, 10) . '...',
        'api_url' => env('APP_URL')
    ]);
});
Route::post('/webhooks/mercadopago', [\App\Http\Controllers\MercadoPagoController::class, 'handleWebhook']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::apiResource('students', StudentController::class);

    // Payments
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);

    // Tuitions (Mensalidades)
    Route::post('/tuitions/generate-batch', [TuitionController::class, 'generateBatch']);
    Route::post('/tuitions/{tuition}/notify', [TuitionController::class, 'notify']);

    // Mercado Pago
    Route::post('/tuitions/{tuition}/payment-link', [\App\Http\Controllers\MercadoPagoController::class, 'createPaymentLink']);

    Route::apiResource('tuitions', TuitionController::class);

    // Courses
    Route::apiResource('courses', App\Http\Controllers\CourseController::class);

    // Employees
    Route::apiResource('employees', EmployeeController::class);

    Route::get('/settings', [SettingController::class, 'index']);
    Route::put('/settings', [SettingController::class, 'update']);
});
