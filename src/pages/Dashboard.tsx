import { MainLayout } from "@/components/layout/MainLayout";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  DollarSign, 
  AlertTriangle, 
  Users,
  ArrowRight,
} from "lucide-react";
import { payments, cashFlowData } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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

export default function Dashboard() {
  const navigate = useNavigate();
  const recentPayments = payments.slice(0, 5);

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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do sistema financeiro
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard
            title="Receita Mensal"
            value="R$ 58.000"
            trend={{ value: "+12% vs mês anterior", direction: "up" }}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <KPICard
            title="Inadimplência"
            value="R$ 1.950"
            trend={{ value: "3 alunos atrasados", direction: "down" }}
            icon={<AlertTriangle className="w-5 h-5" />}
          />
          <KPICard
            title="Alunos Ativos"
            value="124"
            trend={{ value: "+5 novos este mês", direction: "up" }}
            icon={<Users className="w-5 h-5" />}
          />
        </div>

        {/* Charts and Recent Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cash Flow Chart */}
          <Card className="shadow-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Fluxo de Caixa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
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
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar 
                      dataKey="receita" 
                      name="Receita" 
                      fill="hsl(var(--chart-1))" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="despesas" 
                      name="Despesas" 
                      fill="hsl(var(--chart-3))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card className="shadow-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Pagamentos Recentes
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary"
                onClick={() => navigate("/pagamentos")}
              >
                Ver todos
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {payment.studentName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.type}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium text-foreground">
                        {formatCurrency(payment.amount)}
                      </p>
                      <div className="mt-1">
                        {getPaymentStatusBadge(payment.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
