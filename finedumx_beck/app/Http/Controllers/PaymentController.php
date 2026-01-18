<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Tuition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index()
    {
        return response()->json(Payment::with('student', 'tuition')->whereHas('student')->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'tuition_id' => 'required|exists:tuitions,id',
            'method' => 'required|string', // pix, dinheiro, cartao
            'payment_date' => 'required|date',
            'amount' => 'required|numeric',
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. Create Payment
            $payment = Payment::create([
                'student_id' => $validated['student_id'],
                'tuition_id' => $validated['tuition_id'],
                'type' => 'Mensalidade', // or fetch from reference
                'method' => $validated['method'],
                'payment_date' => $validated['payment_date'],
                'amount' => $validated['amount'],
                'status' => 'confirmado'
            ]);

            // 2. Update Tuition Status
            $tuition = Tuition::find($validated['tuition_id']);
            if ($tuition) {
                $tuition->update(['status' => 'pago']);

                // Copy reference if needed for better payment description
                $payment->update(['type' => 'Mensalidade ' . $tuition->reference]);
            }

            return $payment;
        });
    }
}
