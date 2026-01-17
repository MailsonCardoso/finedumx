import { MainLayout } from "@/components/layout/MainLayout";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DollarSign,
  AlertTriangle,
  Users,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DashboardData {
  kpis: {
    monthlyRevenue: number;
    overdueAmount: number;
    activeStudents: number;
    revenueTrend: string;
    overdueTrend: string;
    studentsTrend: string;
  };
  cashFlow: Array<{ month: string; receita: number; despesas: number }>;
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
          {/* Cash Flow Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="shadow-soft border-border/50 hover:shadow-card transition-shadow overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Fluxo de Caixa
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.cashFlow}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                      <XAxis
                        dataKey="month"
                        className="text-xs fill-muted-foreground"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        className="text-xs fill-muted-foreground"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `R$ ${value / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        }}
                        itemStyle={{ fontWeight: 600 }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend iconType="circle" />
                      <Bar
                        dataKey="receita"
                        name="Receita"
                        fill="hsl(var(--primary))"
                        radius={[6, 6, 0, 0]}
                        barSize={32}
                      />
                      <Bar
                        dataKey="despesas"
                        name="Despesas"
                        fill="hsl(var(--chart-3))"
                        radius={[6, 6, 0, 0]}
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
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
