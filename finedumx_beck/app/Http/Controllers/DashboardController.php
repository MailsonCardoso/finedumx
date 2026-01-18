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

        // Upcoming Tuitions (pendente e due_date >= hoje)
        $today = now()->startOfDay();
        $upcomingQuery = Tuition::where('status', 'pendente')
            ->where('due_date', '>=', $today);

        $upcomingAmount = $upcomingQuery->sum('amount');
        $upcomingCount = $upcomingQuery->count();
        $upcomingDetails = $upcomingQuery->with('student')
            ->orderBy('due_date', 'asc')
            ->take(5)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'studentName' => $t->student->name ?? 'N/A',
                    'due_date' => $t->due_date,
                    'amount' => (float) $t->amount,
                    'reference' => $t->reference,
                ];
            });

        return response()->json([
            'kpis' => [
                'monthlyRevenue' => $monthlyRevenue,
                'overdueAmount' => $overdueAmount,
                'activeStudents' => $activeStudents,
                'revenueTrend' => 'Mês Atual',
                'overdueTrend' => Tuition::where('status', 'atrasado')->count() . ' atrasadas',
                'studentsTrend' => $activeStudents . ' ativos',
            ],
            'upcoming' => [
                'totalAmount' => (float) $upcomingAmount,
                'count' => $upcomingCount,
                'details' => $upcomingDetails,
            ],
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
