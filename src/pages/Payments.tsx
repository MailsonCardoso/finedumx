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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  QrCode,
  FileText,
  CreditCard as CreditCardIcon,
  CheckCircle,
  Clock,
  Loader2,
  DollarSign,
  Landmark,
  AlertCircle,
  MoreVertical,
  Calendar,
  Eye
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";

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
  created_at: string;
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

  const formatTime = (dateTimeString: string) => {
    if (!dateTimeString) return "-";
    return new Date(dateTimeString).toLocaleTimeString("pt-BR", {
      hour: '2-digit',
      minute: '2-digit'
    });
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
      default: return <StatusBadge status="neutral">{status}</StatusBadge>;
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth(), 30); // Requested 'até o dia 30'

  const amountReceivedToday = payments
    .filter(p => p.status === "confirmado" && p.payment_date === todayStr)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const amountReceivedMonth = payments
    .filter(p => {
      if (p.status !== "confirmado") return false;
      const pDate = new Date(p.payment_date + 'T12:00:00');
      return pDate >= startOfMonth && pDate <= endOfMonth;
    })
    .reduce((sum, p) => sum + Number(p.amount), 0);

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
          <Card className="shadow-soft border-border/50 bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Recebido Hoje</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(amountReceivedToday)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50 bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total do Mês (até dia 30)</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(amountReceivedMonth)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[200px] bg-card rounded-[24px] border border-border/50 animate-pulse" />
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {payments.map((payment, i) => (
                <motion.div
                  key={payment.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-[24px] shadow-sm hover:shadow-lg transition-all border border-border/40 overflow-hidden relative flex flex-col group h-full"
                >
                  {/* Top Accent based on status */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${payment.status === 'confirmado' ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                  {/* Actions Menu Absolute */}
                  <div className="absolute top-3 right-3 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground bg-background/50 backdrop-blur-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel>Opções</DropdownMenuLabel>
                        <DropdownMenuItem disabled>
                          <FileText className="mr-2 h-4 w-4" />
                          Gerar Recibo
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="p-6 flex flex-col gap-5 h-full pt-8">
                    {/* Header: Student & Status */}
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0 border border-primary/10">
                        {payment.student?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
                        <h3 className="font-bold text-foreground leading-tight truncate w-full pr-6" title={payment.student?.name}>
                          {payment.student?.name}
                        </h3>
                        <div className="scale-90 origin-left">
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                    </div>

                    {/* Payment Info: Method & Date */}
                    <div className="space-y-2.5">
                      <div className="bg-muted/30 rounded-xl px-3 py-2 flex items-center gap-3 text-sm border border-border/20">
                        {getMethodIcon(payment.method)}
                        <span className="text-xs font-semibold text-foreground/80">
                          {getMethodLabel(payment.method)}
                        </span>
                      </div>

                      <div className="bg-muted/30 rounded-xl px-3 py-2 flex items-center gap-3 text-sm border border-border/20">
                        <Calendar className="w-4 h-4 text-primary/60" />
                        <span className="text-xs font-medium text-foreground/80">
                          {formatDate(payment.payment_date)} às {formatTime(payment.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Footer: Amount */}
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/40">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Recebido
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600 text-lg">
                          + {formatCurrency(Number(payment.amount))}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {!isLoading && payments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-16 text-center flex flex-col items-center gap-4 bg-card/50 border border-dashed border-border rounded-xl"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground opacity-50">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Sem histórico</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                Ainda não foram registrados pagamentos no sistema.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
