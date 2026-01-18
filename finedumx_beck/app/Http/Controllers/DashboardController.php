<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Payment;
use App\Models\Tuition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $monthlyRevenue = Payment::whereMonth('payment_date', now()->month)
            ->where('status', 'confirmado')
            ->sum('amount');

        $overdueAmount = Tuition::where('status', 'atrasado')->sum('amount');
        $activeStudents = Student::where('status', 'ativo')->count();

        // Cash flow data (last 6 months)
        $cashFlow = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthName = $date->translatedFormat('M');

            $receita = Payment::whereMonth('payment_date', $date->month)
                ->whereYear('payment_date', $date->year)
                ->where('status', 'confirmado')
                ->sum('amount');

            // Hypothetical expenses (for simulation)
            $despesas = $receita * 0.6;

            $cashFlow[] = [
                'month' => $monthName,
                'receita' => (float) $receita,
                'despesas' => (float) $despesas,
            ];
        }

        return response()->json([
            'kpis' => [
                'monthlyRevenue' => $monthlyRevenue,
                'overdueAmount' => $overdueAmount,
                'activeStudents' => $activeStudents,
                'revenueTrend' => 'Mês Atual',
                'overdueTrend' => Tuition::where('status', 'atrasado')->count() . ' atrasadas',
                'studentsTrend' => $activeStudents . ' ativos',
            ],
            'cashFlow' => $cashFlow,
            'recentPayments' => Payment::with('student')
                ->where('status', 'confirmado')
                ->latest('payment_date')
                ->take(5)
                ->get()
                ->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'studentName' => $p->student->name ?? 'N/A',
                        'type' => $p->type,
                        'amount' => (float) $p->amount,
                        'status' => $p->status,
                    ];
                }),
        ]);
    }
}
