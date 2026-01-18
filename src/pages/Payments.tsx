import { MainLayout } from "@/components/layout/MainLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  QrCode,
  FileText,
  CreditCard as CreditCardIcon,
  CheckCircle,
  Clock,
  Loader2,
  DollarSign,
  Landmark
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

interface Payment {
  id: number;
  student: {
    name: string;
  };
  type: string;
  method: string;
  payment_date: string;
  amount: number;
  status: string;
}

export default function Payments() {
  const { data: payments = [], isLoading: isLoadingPayments } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: () => apiFetch('/payments'),
  });

  const { data: tuitions = [], isLoading: isLoadingTuitions } = useQuery<any[]>({
    queryKey: ['tuitions'],
    queryFn: () => apiFetch('/tuitions'),
  });

  const isLoading = isLoadingPayments || isLoadingTuitions;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString + 'T12:00:00').toLocaleDateString("pt-BR");
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "pix": return <QrCode className="w-4 h-4 text-emerald-500" />;
      case "boleto": return <FileText className="w-4 h-4 text-amber-500" />;
      case "cartao":
      case "cartao_credito":
      case "cartao_debito": return <CreditCardIcon className="w-4 h-4 text-blue-500" />;
      case "dinheiro": return <DollarSign className="w-4 h-4 text-green-600" />;
      case "transferencia": return <Landmark className="w-4 h-4 text-purple-500" />;
      default: return null;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "pix": return "PIX";
      case "boleto": return "Boleto";
      case "cartao":
      case "cartao_credito": return "Cartão de Crédito";
      case "cartao_debito": return "Cartão de Débito";
      case "dinheiro": return "Dinheiro";
      case "transferencia": return "Transferência";
      default: return method;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado": return <StatusBadge status="success">Confirmado</StatusBadge>;
      case "processando": return <StatusBadge status="warning">Processando</StatusBadge>;
      case "falha": return <StatusBadge status="danger">Falha</StatusBadge>;
      default: return <StatusBadge status="default">{status}</StatusBadge>;
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const confirmedToday = payments.filter(p => p.status === "confirmado" && p.payment_date === today).length;
  const pendingCount = tuitions.filter(t => t.status === "pendente" || t.status === "atrasado").length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pagamentos</h1>
          <p className="text-muted-foreground mt-1">
            Histórico de pagamentos recebidos
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="shadow-card border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmados Hoje</p>
                <p className="text-2xl font-bold text-foreground">{confirmedToday}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mensalidades Pendentes</p>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Aluno</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Método</TableHead>
                  <TableHead className="font-semibold">Data</TableHead>
                  <TableHead className="font-semibold">Valor</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Carregando pagamentos...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {payments.map((payment) => (
                      <TableRow
                        key={payment.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="font-medium">{payment.student?.name}</TableCell>
                        <TableCell className="text-muted-foreground">{payment.type}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMethodIcon(payment.method)}
                            <span className="text-muted-foreground">
                              {getMethodLabel(payment.method)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(payment.payment_date)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(Number(payment.amount))}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      </TableRow>
                    ))}
                    {payments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          Nenhum pagamento encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
