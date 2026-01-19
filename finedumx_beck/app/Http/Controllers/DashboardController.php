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
        $today = now()->startOfDay();
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        // 0. RECEBIDO TOTAL (Histórico completo)
        $totalRevenue = Payment::whereHas('student')
            ->where('status', 'confirmado')
            ->sum('amount');

        // 1. RECEBIDO MÊS (Apenas o que foi pago dentro deste mês)
        $monthlyRevenue = Payment::whereHas('student')
            ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->where('status', 'confirmado')
            ->sum('amount');

        // Receita apenas de matrículas
        $matriculaRevenue = Payment::whereHas('student')
            ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->where('status', 'confirmado')
            ->whereHas('tuition', function ($q) {
                $q->where('type', 'matricula');
            })
            ->sum('amount');

        // Receita apenas de rematrículas
        $rematriculaRevenue = Payment::whereHas('student')
            ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->where('status', 'confirmado')
            ->whereHas('tuition', function ($q) {
                $q->where('type', 'rematricula');
            })
            ->sum('amount');

        // 2. MENSALIDADES VENCENDO (Pendentes que vencem hoje ou até o fim do mês)
        $pendingQuery = Tuition::whereHas('student')
            ->where('status', 'pendente')
            ->whereBetween('due_date', [$today, $endOfMonth]);

        $pendingAmount = $pendingQuery->sum('amount');
        $pendingCount = $pendingQuery->count();

        // 3. INADIMPLÊNCIA TOTAL (Tudo o que venceu e não foi pago, de qualquer tempo)
        $overdueQuery = Tuition::whereHas('student')
            ->whereIn('status', ['pendente', 'atrasado'])
            ->where('due_date', '<', $today);

        $overdueAmount = $overdueQuery->sum('amount');
        $overdueCount = $overdueQuery->count();

        // 4. ALUNOS ATIVOS
        $activeStudents = Student::where('status', 'ativo')->count();

        // Tendências (Comparativo simples ou contagem)
        // Simulando a meta de 85% para visual (podemos ajustar depois para ser real)
        $goalAmount = $monthlyRevenue + $pendingAmount;
        $revenuePercent = $goalAmount > 0 ? round(($monthlyRevenue / $goalAmount) * 100) : 0;

        // Pendências Prioritárias
        $priorityDetails = $overdueQuery->with('student')
            ->orderBy('due_date', 'asc')
            ->take(5)
            ->get()
            ->map(function ($t) use ($today) {
                $dueDate = \Carbon\Carbon::parse($t->due_date);
                $daysOverdue = (int) $dueDate->diffInDays($today);

                return [
                    'id' => $t->id,
                    'student_id' => $t->student_id,
                    'studentName' => $t->student->name ?? 'N/A',
                    'due_date' => $t->due_date,
                    'amount' => (float) $t->amount,
                    'reference' => $t->reference,
                    'daysOverdue' => $daysOverdue,
                ];
            });

        return response()->json([
            'kpis' => [
                'totalRevenue' => (float) $totalRevenue,
                'monthlyRevenue' => (float) $monthlyRevenue,
                'matriculaRevenue' => (float) $matriculaRevenue,
                'rematriculaRevenue' => (float) $rematriculaRevenue,
                'revenueTrend' => $revenuePercent . '% da meta',
                'pendingAmount' => (float) $pendingAmount,
                'pendingTrend' => $pendingCount . ' alunos',
                'overdueAmount' => (float) $overdueAmount,
                'overdueTrend' => $overdueCount . ' matrículas',
                'activeStudents' => $activeStudents,
                'studentsTrend' => $activeStudents . ' ativos',
            ],
            'priority' => [
                'totalAmount' => (float) $overdueAmount,
                'count' => $overdueCount,
                'details' => $priorityDetails,
            ],
            'recentPayments' => Payment::with('student')
                ->whereHas('student')
                ->where('status', 'confirmado')
                ->latest('payment_date')
                ->take(5)
                ->get()
                ->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'student_id' => $p->student_id,
                        'studentName' => $p->student->name ?? 'N/A',
                        'type' => $p->type,
                        'amount' => (float) $p->amount,
                        'status' => $p->status,
                    ];
                }),
            'analysis' => collect(range(5, 0))->map(function ($i) {
                $date = now()->subMonths($i);
                return [
                    'label' => ucfirst($date->translatedFormat('M')),
                    'value' => (float) Payment::whereHas('student')
                        ->whereBetween('payment_date', [$date->copy()->startOfMonth(), $date->copy()->endOfMonth()])
                        ->where('status', 'confirmado')
                        ->sum('amount'),
                    'expected' => (float) Tuition::whereHas('student')
                        ->whereBetween('due_date', [$date->copy()->startOfMonth(), $date->copy()->endOfMonth()])
                        ->sum('amount')
                ];
            })->values(),
        ]);
    }
}
