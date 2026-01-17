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
        $activeStudents = Student::count();

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
                'revenueTrend' => '+12% vs mês anterior', // Static for now
                'overdueTrend' => '3 alunos atrasados',
                'studentsTrend' => '+5 novos este mês',
            ],
            'cashFlow' => $cashFlow,
            'recentPayments' => Payment::with('student')->latest()->take(5)->get()->map(function ($p) {
                return [
                    'id' => $p->id,
                    'studentName' => $p->student->name,
                    'type' => $p->type,
                    'amount' => (float) $p->amount,
                    'status' => $p->status,
                ];
            }),
        ]);
    }
}
