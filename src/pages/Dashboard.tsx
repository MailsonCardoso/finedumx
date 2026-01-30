import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DollarSign,
  AlertTriangle,
  Users,
  ArrowRight,
  Clock,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { StudentSheet } from "@/components/StudentSheet";
import { Eye, TrendingUp, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface DashboardData {
  kpis: {
    totalRevenue: number;
    monthlyRevenue: number;
    matriculaRevenue: number;
    rematriculaRevenue: number;
    revenueTrend: string;
    overdueAmount: number;
    overdueTrend: string;
    pendingAmount: number;
    pendingTrend: string;
    activeStudents: number;
    studentsTrend: string;
  };
  priority: {
    totalAmount: number;
    count: number;
    details: Array<{
      id: number;
      student_id: number;
      studentName: string;
      due_date: string;
      amount: number;
      reference: string;
      daysOverdue: number;
    }>;
  };
  recentPayments: Array<{
    id: string;
    student_id: number;
    studentName: string;
    type: string;
    amount: number;
    status: string;
  }>;
  analysis: Array<{
    label: string;
    value: number;
    expected: number;
  }>;
}

export default function Dashboard() {
  const navigate = useNavigate();

  // Fetch current user role
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<any>('/me'),
  });

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiFetch('/dashboard/stats'),
  });

  const { data: todayAppointments = [] } = useQuery<any[]>({
    queryKey: ['today-appointments'],
    queryFn: () => {
      const today = new Date().toISOString().split('T')[0];
      return apiFetch(`/appointments?date=${today}`);
    },
  });

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetStudentId, setSheetStudentId] = useState<number | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return <StatusBadge status="success">Confirmado</StatusBadge>;
      case "processando":
        return <StatusBadge status="warning">Processando</StatusBadge>;
      case "falha":
        return <StatusBadge status="danger">Falha</StatusBadge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  const role = (user?.role || "").toLowerCase();
  const isFinanceiro = role === 'financeiro';
  const isAdministrativo = role === 'administrativo';
  const isAdmin = role === 'admin';

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {isAdministrativo ? "Gestão Administrativa" : "Dashboard Financeiro"}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              {isAdministrativo
                ? "Acompanhe a agenda e as atividades escolares de hoje."
                : "Bem-vindo ao centro de controle financeiro da PlatFormX."}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/50 shadow-sm self-start md:self-center">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Hoje:</span>
            <span className="text-sm font-bold text-primary">
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </motion.div>

        {/* --- DASHBOARD ADMINISTRATIVO (AGENDA EM DESTAQUE) --- */}
        {isAdministrativo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-soft border-border/50 hover:shadow-card transition-shadow overflow-hidden bg-white dark:bg-card">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-primary/5 px-6 py-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  Agenda de Hoje
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary/5 font-semibold text-sm"
                  onClick={() => navigate("/agenda")}
                >
                  Ver agenda completa
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {todayAppointments.length > 0 ? (
                    todayAppointments.map((app, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={app.id}
                        className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors cursor-pointer group"
                        onClick={() => {
                          if (app.type === 'individual' && app.student_id) {
                            setSheetStudentId(app.student_id);
                            setIsSheetOpen(true);
                          }
                        }}
                      >
                        <div className="flex items-center gap-6">
                          <div className="bg-primary/10 text-primary w-16 h-10 flex items-center justify-center rounded-xl text-md font-black shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                            {app.start_time.substring(0, 5)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-lg leading-snug">
                              {app.course?.name || "Aula"} - {app.type === 'individual' ? app.student?.name : app.school_class?.name}
                            </p>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                              {app.type === 'individual' ? 'Aula Individual' : 'Aula em Grupo'} • {app.duration} MIN
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {app.status === 'realizado' ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold text-xs uppercase">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Realizado
                            </div>
                          ) : app.status === 'falta' ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 font-bold text-xs uppercase">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Falta
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold text-xs uppercase">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Pendente
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                      <p className="text-muted-foreground font-bold text-lg">Nenhuma aula agendada para hoje.</p>
                      <Button variant="outline" className="mt-4" onClick={() => navigate("/agenda")}>
                        Agendar agora
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* --- DASHBOARD FINANCEIRO / ADMIN (KPIs E PAGAMENTOS) --- */}
        {(isFinanceiro || isAdmin) && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                index={0}
                title="Caixa Total Acumulado"
                value={formatCurrency(data?.kpis.totalRevenue || 0)}
                trend={{ value: "Desde o início", direction: "neutral" }}
                icon={<DollarSign className="w-5 h-5" />}
                className="border-primary/20 bg-primary/5"
              />
              <KPICard
                index={1}
                title="Recebido (Mês)"
                value={formatCurrency(data?.kpis.monthlyRevenue || 0)}
                trend={{ value: data?.kpis.revenueTrend || "", direction: "up" }}
                subText={(() => {
                  const matricula = data?.kpis.matriculaRevenue || 0;
                  const rematricula = data?.kpis.rematriculaRevenue || 0;

                  if (matricula > 0 && rematricula > 0) {
                    return `(Inclui ${formatCurrency(matricula)} em matrículas e ${formatCurrency(rematricula)} em rematrículas)`;
                  } else if (matricula > 0) {
                    return `(Inclui ${formatCurrency(matricula)} em matrículas)`;
                  } else if (rematricula > 0) {
                    return `(Inclui ${formatCurrency(rematricula)} em rematrículas)`;
                  }
                  return undefined;
                })()}
                icon={<DollarSign className="w-5 h-5" />}
              />
              <KPICard
                index={2}
                title="Inadimplência Total"
                value={formatCurrency(data?.kpis.overdueAmount || 0)}
                trend={{ value: data?.kpis.overdueTrend || "", direction: "down" }}
                icon={<AlertTriangle className="w-5 h-5" />}
              />
              <KPICard
                index={3}
                title="Alunos Ativos"
                value={String(data?.kpis.activeStudents || 0)}
                trend={{ value: data?.kpis.studentsTrend || "", direction: "up" }}
                icon={<Users className="w-5 h-5" />}
              />
            </div>

            {/* Charts and Recent Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="shadow-soft border-border/50 hover:shadow-card transition-shadow overflow-hidden bg-card/50 backdrop-blur-sm h-full">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-destructive/5">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                      Pendências Prioritárias
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="divide-y divide-border/50">
                      {data?.priority.details.map((tuition, i) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                          key={tuition.id}
                          className="flex items-center justify-between py-4 group hover:bg-destructive/5 -mx-6 px-6 transition-colors cursor-pointer"
                          onClick={() => {
                            if (tuition.student_id) {
                              setSheetStudentId(tuition.student_id);
                              setIsSheetOpen(true);
                            }
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate group-hover:text-destructive transition-colors flex items-center gap-2">
                              {tuition.studentName}
                              <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50" />
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <AlertCircle className="w-3 h-3 text-destructive" />
                              <p className="text-xs font-medium text-destructive">
                                {tuition.daysOverdue} {tuition.daysOverdue === 1 ? 'dia' : 'dias'} de atraso
                              </p>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-foreground">
                              {formatCurrency(tuition.amount)}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Venceu em {new Date(tuition.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Payments */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="shadow-soft border-border/50 hover:shadow-card transition-shadow overflow-hidden bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      Pagamentos Recentes
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/5 font-medium"
                      onClick={() => navigate("/pagamentos")}
                    >
                      Ver todos
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="divide-y divide-border/50">
                      {data?.recentPayments.map((payment, i) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          key={payment.id}
                          className="flex items-center justify-between py-4 group hover:bg-muted/50 -mx-6 px-6 transition-colors cursor-pointer"
                          onClick={() => {
                            if (payment.student_id) {
                              setSheetStudentId(payment.student_id);
                              setIsSheetOpen(true);
                            }
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-2">
                              {payment.studentName}
                              <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50" />
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {payment.type}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-foreground">
                              {formatCurrency(payment.amount)}
                            </p>
                            <div className="mt-1">
                              {getPaymentStatusBadge(payment.status)}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Agenda (escondida para o financeiro) */}
            {!isFinanceiro && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="shadow-soft border-border/50 overflow-hidden bg-card/50">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 px-6 py-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Resumo da Agenda Escolar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/50 text-sm">
                      {todayAppointments.slice(0, 3).map((app) => (
                        <div key={app.id} className="p-3 px-6 flex justify-between items-center">
                          <span className="font-bold text-primary">{app.start_time.substring(0, 5)}</span>
                          <span className="font-medium">{app.course?.name} - {app.student?.name || app.school_class?.name}</span>
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">{app.status}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>

      <StudentSheet
        studentId={sheetStudentId}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />
    </MainLayout>
  );
}
