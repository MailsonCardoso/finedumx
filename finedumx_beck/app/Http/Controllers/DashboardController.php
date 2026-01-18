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

        // Pendências Prioritárias (atrasadas: pendente e due_date < hoje)
        $today = now()->startOfDay();
        $priorityQuery = Tuition::where('status', 'pendente')
            ->where('due_date', '<', $today);

        $priorityAmount = $priorityQuery->sum('amount');
        $priorityCount = $priorityQuery->count();
        $priorityDetails = $priorityQuery->with('student')
            ->orderBy('due_date', 'asc') // Os mais antigos primeiro
            ->take(5)
            ->get()
            ->map(function ($t) use ($today) {
                $dueDate = \Carbon\Carbon::parse($t->due_date);
                $daysOverdue = (int) $dueDate->diffInDays($today);

                return [
                    'id' => $t->id,
                    'studentName' => $t->student->name ?? 'N/A',
                    'due_date' => $t->due_date,
                    'amount' => (float) $t->amount,
                    'reference' => $t->reference,
                    'daysOverdue' => $daysOverdue,
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
            'priority' => [
                'totalAmount' => (float) $priorityAmount,
                'count' => $priorityCount,
                'details' => $priorityDetails,
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
