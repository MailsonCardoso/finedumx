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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

interface DashboardData {
  kpis: {
    monthlyRevenue: number;
    overdueAmount: number;
    activeStudents: number;
    revenueTrend: string;
    overdueTrend: string;
    studentsTrend: string;
  };
  upcoming: {
    totalAmount: number;
    count: number;
    details: Array<{
      id: number;
      studentName: string;
      due_date: string;
      amount: number;
      reference: string;
    }>;
  };
  recentPayments: Array<{
    id: string;
    studentName: string;
    type: string;
    amount: number;
    status: string;
  }>;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiFetch('/dashboard/stats'),
  });

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

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Bem-vindo ao centro de controle financeiro da FinEdu.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KPICard
            index={0}
            title="Receita Mensal"
            value={formatCurrency(data?.kpis.monthlyRevenue || 0)}
            trend={{ value: data?.kpis.revenueTrend || "", direction: "up" }}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <KPICard
            index={1}
            title="Inadimplência"
            value={formatCurrency(data?.kpis.overdueAmount || 0)}
            trend={{ value: data?.kpis.overdueTrend || "", direction: "down" }}
            icon={<AlertTriangle className="w-5 h-5" />}
          />
          <KPICard
            index={2}
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
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  Mensalidades a Vencer
                </CardTitle>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-600">
                    {formatCurrency(data?.upcoming.totalAmount || 0)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Total previsto
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="divide-y divide-border/50">
                  {data?.upcoming.details.map((tuition, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      key={tuition.id}
                      className="flex items-center justify-between py-4 group hover:bg-muted/50 -mx-6 px-6 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate group-hover:text-amber-600 transition-colors">
                          {tuition.studentName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            Vence em {new Date(tuition.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-foreground">
                          {formatCurrency(tuition.amount)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Ref: {tuition.reference}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {data?.upcoming.details.length === 0 && (
                    <div className="py-12 text-center">
                      <Clock className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">Nenhuma mensalidade a vencer em breve.</p>
                    </div>
                  )}
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
                      className="flex items-center justify-between py-4 group hover:bg-muted/50 -mx-6 px-6 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {payment.studentName}
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
      </div>
    </MainLayout>
  );
}
