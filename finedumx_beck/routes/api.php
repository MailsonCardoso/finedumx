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
Route::get('/dangerzone/clear-agenda', function () {
    \Illuminate\Support\Facades\DB::table('appointment_responses')->delete();
    \Illuminate\Support\Facades\DB::table('appointments')->delete();
    return "Agenda limpa com sucesso! Remova esta rota antes de ir para produção real.";
});

Route::post('/login', [AuthController::class, 'login']);
Route::get('/mp-test', function () {
    return response()->json([
        'token_configured' => !empty(env('MERCADO_PAGO_ACCESS_TOKEN')),
        'token_start' => substr(env('MERCADO_PAGO_ACCESS_TOKEN') ?? '', 0, 10) . '...',
        'api_url' => env('APP_URL')
    ]);
});
Route::post('/webhooks/mercadopago', [\App\Http\Controllers\MercadoPagoController::class, 'handleWebhook']);
Route::get('/settings', [SettingController::class, 'index']);

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
    Route::post('/tuitions/{tuition}/payment-link', [\App\Http\Controllers\MercadoPagoController::class, 'createPaymentLink'])->name('tuitions.payment-link');

    Route::apiResource('tuitions', TuitionController::class);

    // Courses
    Route::apiResource('courses', App\Http\Controllers\CourseController::class);

    // Employees
    Route::apiResource('employees', EmployeeController::class);

    // Classes
    Route::post('/classes/check-conflicts', [App\Http\Controllers\SchoolClassController::class, 'checkConflicts']);
    Route::apiResource('classes', App\Http\Controllers\SchoolClassController::class);

    // Appointments
    Route::apiResource('appointments', App\Http\Controllers\AppointmentController::class);

    // Student Portal
    Route::get('/student/portal', [\App\Http\Controllers\StudentPortalController::class, 'index']);
    Route::post('/student/appointments/{appointment}/respond', [\App\Http\Controllers\StudentPortalController::class, 'respond']);

    // Teacher Portal
    Route::get('/teacher/portal', [\App\Http\Controllers\TeacherPortalController::class, 'index']);

    Route::put('/settings', [SettingController::class, 'update']);
});
