import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Bell, Printer, Plus, Filter, Search, CheckCircle2, Loader2, DollarSign, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { StudentSheet } from "@/components/StudentSheet";
import { Eye } from "lucide-react";

interface Student {
  id: number;
  name: string;
  phone: string;
  active_responsible?: string;
  status: string;
}

interface Tuition {
  id: number;
  student_id: number;
  reference: string;
  due_date: string;
  amount: number;
  status: 'pago' | 'pendente' | 'atrasado';
  type?: 'mensalidade' | 'matricula' | 'rematricula';
  student: Student;
  last_notification_at?: string;
}

export default function Tuition() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const queryClient = useQueryClient();

  // Deletion State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [tuitionToDelete, setTuitionToDelete] = useState<Tuition | null>(null);

  // Batch Generation Modal
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generateYear, setGenerateYear] = useState(new Date().getFullYear().toString());
  const [generateMonth, setGenerateMonth] = useState((new Date().getMonth() + 1).toString());

  // One-off Charge Modal
  const [isChargeOpen, setIsChargeOpen] = useState(false);
  const [chargeStudentId, setChargeStudentId] = useState<number | null>(null);
  const [chargeReference, setChargeReference] = useState('');
  const [chargeDueDate, setChargeDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeType, setChargeType] = useState<'mensalidade' | 'matricula' | 'rematricula'>('mensalidade');

  // Anti-spam Alert
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [tuitionToNotify, setTuitionToNotify] = useState<Tuition | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetStudentId, setSheetStudentId] = useState<number | null>(null);

  // Bulk Notification State
  const [isBulkNotifyOpen, setIsBulkNotifyOpen] = useState(false);
  const [bulkNotifyIndex, setBulkNotifyIndex] = useState(0);
  const [bulkQueue, setBulkQueue] = useState<Tuition[]>([]);

  const handleStartBulk = () => {
    if (overdueTuitions.length === 0) {
      toast.info("Não há mensalidades atrasadas para notificar.");
      return;
    }
    setBulkQueue(overdueTuitions);
    setBulkNotifyIndex(0);
    setIsBulkNotifyOpen(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const generateMutation = useMutation({
    mutationFn: (data: { reference: string, year: number, month: number }) =>
      apiFetch('/tuitions/generate-batch', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['tuitions'] });
      toast.success(data.message || "Mensalidades geradas com sucesso!");
      setIsGenerateOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao gerar mensalidades");
    }
  });

  const chargeMutation = useMutation({
    mutationFn: (data: { student_id: number, reference: string, due_date: string, amount: number, type: string }) =>
      apiFetch('/tuitions', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuitions'] });
      toast.success("Cobrança criada com sucesso!");
      setIsChargeOpen(false);
      setChargeStudentId(null);
      setChargeReference('');
      setChargeDueDate(new Date().toISOString().split('T')[0]);
      setChargeAmount('');
      setChargeType('mensalidade');
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar cobrança");
    }
  });

  // Payment Modal
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedTuition, setSelectedTuition] = useState<Tuition | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("pix");

  // Queries
  const { data: tuitions = [], isLoading } = useQuery<Tuition[]>({
    queryKey: ['tuitions', searchTerm, statusFilter],
    queryFn: () => apiFetch(`/tuitions?search=${searchTerm}&status=${statusFilter}`),
  });

  const overdueTuitions = tuitions.filter(t => {
    const dueDate = new Date(t.due_date + 'T23:59:59');
    const isOverdue = t.status !== 'pago' && (t.status === 'atrasado' || dueDate < new Date());

    // Check if notified recently (within last 5 days)
    let notifiedRecently = false;
    if (t.last_notification_at) {
      const lastNotify = new Date(t.last_notification_at);
      const diffTime = new Date().getTime() - lastNotify.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      notifiedRecently = diffDays < 5;
    }

    return isOverdue && !notifiedRecently;
  });

  const { data: schoolData } = useQuery({
    queryKey: ['school-settings'],
    queryFn: () => apiFetch<any>('/settings'),
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: () => apiFetch('/students'),
  });

  // Mutations
  const payMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/payments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuitions'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success("Pagamento confirmado com sucesso!");
      setIsPayOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao processar pagamento");
    }
  });

  const notifyMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/tuitions/${id}/notify`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuitions'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/tuitions/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuitions'] });
      toast.success("Mensalidade excluída com sucesso!");
      setIsDeleteOpen(false);
      setTuitionToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir mensalidade");
    }
  });

  // Handlers
  const handlePayClick = (tuition: Tuition) => {
    setSelectedTuition(tuition);
    setIsPayOpen(true);
  };

  const confirmPayment = () => {
    if (!selectedTuition) return;

    payMutation.mutate({
      student_id: selectedTuition.student_id,
      tuition_id: selectedTuition.id,
      method: paymentMethod,
      amount: selectedTuition.amount,
      payment_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleGenerateClick = () => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const monthName = months[parseInt(generateMonth) - 1];
    const reference = `${monthName}/${generateYear}`;

    generateMutation.mutate({
      reference,
      year: parseInt(generateYear),
      month: parseInt(generateMonth)
    });
  };

  const handleWhatsAppClick = (tuition: Tuition) => {
    // Check if notified recently (within last 5 days)
    if (tuition.last_notification_at) {
      const lastNotify = new Date(tuition.last_notification_at);
      const diffTime = new Date().getTime() - lastNotify.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays < 5) {
        setTuitionToNotify(tuition);
        setIsAlertOpen(true);
        return;
      }
    }

    sendWhatsAppMessage(tuition);
  };

  const sendWhatsAppMessage = (tuition: Tuition) => {
    if (!tuition.student?.phone) {
      toast.error("Aluno sem telefone cadastrado");
      return;
    }

    // Remove formatting from phone (keep only numbers)
    const phone = tuition.student.phone.replace(/\D/g, '');

    // Build Message based on status and responsible
    const hasResp = tuition.student.active_responsible && tuition.student.active_responsible.trim() !== "";
    const respName = tuition.student.active_responsible;
    const studentName = tuition.student.name;
    const pix = schoolData?.pix_key || "98988221217";
    const schoolPhone = schoolData?.phone?.replace(/\D/g, '') || "98988221217";
    const schoolName = schoolData?.name || "ESCOLA DE MUSICA VEM CANTAR";

    // Detect if overdue (either by status or by date)
    const dueDate = new Date(tuition.due_date + 'T23:59:59'); // use end of day for comparison
    const today = new Date();
    const isOverdue = tuition.status === 'atrasado' || dueDate < today;

    // Calculate days overdue
    const diffTime = today.getTime() - dueDate.getTime();
    const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const showDays = daysOverdue > 5;

    // Determine charge type label
    const getChargeLabel = () => {
      if (tuition.type === 'matricula') return 'taxa de matrícula';
      if (tuition.type === 'rematricula') return 'rematrícula';
      return 'mensalidade';
    };

    let message = "";

    if (isOverdue) {
      const overduePhrase = showDays ? `está em aberto há *${daysOverdue} dias*` : `ainda está em aberto`;
      const chargeLabel = getChargeLabel();

      if (hasResp) {
        message = `Olá *${respName}*! responsável de *${studentName}*. Notamos que a ${chargeLabel} de *${tuition.reference}* ${overduePhrase}. Segue o PIX para regularização: *${pix}* . Qualquer dúvida, estamos à disposição!`;
      } else {
        message = `Olá *${studentName}*! Notamos que a ${chargeLabel} de *${tuition.reference}* ${overduePhrase}. Segue o PIX para regularização: *${pix}* . Qualquer dúvida, estamos à disposição!`;
      }
    } else {
      // Mensagem padrão para cobrança normal (pendente a vencer)
      const chargeLabel = getChargeLabel();

      if (hasResp) {
        message = `Olá *${respName}*! responsável de *${studentName}*\na ${chargeLabel} de *${tuition.reference}* no valor de *${formatCurrency(Number(tuition.amount))}* vence em *${formatDate(tuition.due_date)}*.`;
      } else {
        message = `Olá *${studentName}*!\nsua ${chargeLabel} de *${tuition.reference}* no valor de *${formatCurrency(Number(tuition.amount))}* vence em *${formatDate(tuition.due_date)}*.`;
      }

      message += `\n\nPara facilitar o pagamento, utilize nossa chave PIX:\n*${pix}*\n\nQualquer dúvida, estamos à disposição!\nConversar com *+55 ${schoolPhone}* no WhatsApp\n\n*${schoolName}*`;
    }

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Mark as notified in backend
    notifyMutation.mutate(tuition.id);

    // Open WhatsApp Web
    window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, '_blank');
  };

  // Helpers
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    // Add time to force timezone to be treated loosely or use verify backend format
    // Assuming backend sends YYYY-MM-DD
    return new Date(dateString + 'T12:00:00').toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (tuition: Tuition) => {
    if (tuition.status === "pago") return <StatusBadge status="success">Pago</StatusBadge>;

    // Check if overdue by date
    const dueDate = new Date(tuition.due_date + 'T23:59:59');
    const isOverdue = tuition.status === 'atrasado' || dueDate < new Date();

    if (isOverdue) {
      return <StatusBadge status="danger">Atrasado</StatusBadge>;
    }

    return <StatusBadge status="warning">Pendente</StatusBadge>;
  };

  const filteredTuitions = tuitions.filter(t => {
    // Exclude orphans (tuitions without students)
    if (!t.student) return false;

    const matchesSearch = t.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort by status priority: atrasado > pendente > pago
  const sortedTuitions = [...filteredTuitions].sort((a, b) => {
    const getPriority = (t: Tuition) => {
      if (t.status === 'pago') return 3;
      const dueDate = new Date(t.due_date + 'T23:59:59');
      if (t.status === 'atrasado' || dueDate < new Date()) return 1;
      return 2;
    };

    const prioA = getPriority(a);
    const prioB = getPriority(b);

    if (prioA !== prioB) return prioA - prioB;

    // Within same priority, sort by due date (oldest first)
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Mensalidades</h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Gerencie e dê baixa nas mensalidades dos alunos.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleStartBulk}
              variant="outline"
              className="gap-2 h-11 px-6 border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-500/10"
            >
              <Bell className="w-5 h-5 text-emerald-500" />
              Mutirão de Cobrança
            </Button>
            <Button
              onClick={() => setIsChargeOpen(true)}
              variant="outline"
              className="gap-2 h-11 px-6"
            >
              <Plus className="w-5 h-5" />
              Nova Cobrança Avulsa
            </Button>
            <Button
              onClick={() => setIsGenerateOpen(true)}
              className="gap-2 shadow-lg shadow-primary/20 h-11 px-6"
            >
              <Plus className="w-5 h-5" />
              Gerar Mensalidades
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-2xl border border-border/50 shadow-soft"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-background border-border/50 focus:border-primary"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-11 bg-background">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Pendentes</SelectItem>
              <SelectItem value="atrasado">Atrasadas</SelectItem>
              <SelectItem value="pago">Pagas</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                  <TableHead className="font-bold h-14 text-foreground">Referência</TableHead>
                  <TableHead className="font-bold h-14 text-foreground">Aluno</TableHead>
                  <TableHead className="font-bold h-14 text-foreground">Vencimento</TableHead>
                  <TableHead className="font-bold h-14 text-foreground">Valor</TableHead>
                  <TableHead className="font-bold h-14 text-foreground">Status</TableHead>
                  <TableHead className="font-bold h-14 text-foreground text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Carregando mensalidades...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {sortedTuitions.map((tuition, i) => (
                      <motion.tr
                        key={tuition.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: i * 0.05 }}
                        className="group border-b border-border/40 hover:bg-primary/5 transition-colors"
                      >
                        <TableCell className="py-4 font-medium">
                          <div className="flex flex-col">
                            <span>{tuition.reference}</span>
                            {tuition.type === 'matricula' && (
                              <span className="inline-flex items-center rounded-sm bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 w-fit mt-0.5">
                                MATRÍCULA
                              </span>
                            )}
                            {tuition.type === 'rematricula' && (
                              <span className="inline-flex items-center rounded-sm bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 w-fit mt-0.5">
                                REMATRÍCULA
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className="py-4 font-medium text-foreground group-hover:text-primary transition-colors cursor-pointer"
                          onClick={() => {
                            if (tuition.student_id) {
                              setSheetStudentId(tuition.student_id);
                              setIsSheetOpen(true);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {tuition.student?.name}
                            <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-muted-foreground">
                          {formatDate(tuition.due_date)}
                        </TableCell>
                        <TableCell className="py-4 font-bold text-foreground">
                          {formatCurrency(Number(tuition.amount))}
                        </TableCell>
                        <TableCell className="py-4">{getStatusBadge(tuition)}</TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            {tuition.status !== 'pago' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 transition-colors relative ${(() => {
                                    if (!tuition.last_notification_at) return false;
                                    const lastNotify = new Date(tuition.last_notification_at);
                                    const diffDays = (new Date().getTime() - lastNotify.getTime()) / (1000 * 60 * 60 * 24);
                                    return diffDays < 5;
                                  })()
                                    ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                                    : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10"
                                    }`}
                                  onClick={() => handleWhatsAppClick(tuition)}
                                  title={tuition.last_notification_at
                                    ? `Último envio: ${new Date(tuition.last_notification_at).toLocaleString('pt-BR')}`
                                    : "Enviar WhatsApp"
                                  }
                                >
                                  <MessageCircle className="w-5 h-5" />
                                  {(() => {
                                    if (!tuition.last_notification_at) return false;
                                    const lastNotify = new Date(tuition.last_notification_at);
                                    const diffDays = (new Date().getTime() - lastNotify.getTime()) / (1000 * 60 * 60 * 24);
                                    return diffDays < 5;
                                  })() && (
                                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
                                    )}
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                  onClick={() => handlePayClick(tuition)}
                                  title="Confirmar Pagamento"
                                >
                                  <DollarSign className="w-4 h-4 mr-1.5" />
                                  Receber
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    setTuitionToDelete(tuition);
                                    setIsDeleteOpen(true);
                                  }}
                                  title="Excluir Mensalidade"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}

                            {tuition.status === 'pago' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-muted-foreground"
                                onClick={() => {
                                  setSelectedTuition(tuition);
                                  setIsReceiptOpen(true);
                                }}
                                title="Imprimir Recibo"
                              >
                                <Printer className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                    {!isLoading && sortedTuitions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          Nenhuma mensalidade encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Payment Confirmation Modal */}
        <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Recebimento</DialogTitle>
              <DialogDescription>
                Confirme os dados do pagamento para dar baixa na mensalidade.
              </DialogDescription>
            </DialogHeader>

            {selectedTuition && (
              <div className="space-y-4 py-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 border border-border/50">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aluno:</span>
                    <span className="font-semibold">{selectedTuition.student?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Referência:</span>
                    <span className="font-medium">{selectedTuition.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-bold text-primary text-lg">{formatCurrency(Number(selectedTuition.amount))}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Forma de Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="bottom" align="start" sideOffset={5} className="max-h-[250px]">
                      <SelectItem value="pix">Pix</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                      <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                      <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPayOpen(false)}>Cancelar</Button>
              <Button onClick={confirmPayment} className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={payMutation.isPending}>
                {payMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Confirmar Baixa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* One-off Charge Modal */}
        <Dialog open={isChargeOpen} onOpenChange={setIsChargeOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Cobrança Avulsa</DialogTitle>
              <DialogDescription>
                Crie uma cobrança individual para um aluno específico.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Aluno</Label>
                <Select value={chargeStudentId?.toString() || ''} onValueChange={(val) => setChargeStudentId(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aluno..." />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" sideOffset={5} className="max-h-[250px]">
                    {students.filter(s => s.status === 'ativo').map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Cobrança</Label>
                <Select value={chargeType} onValueChange={(val: any) => setChargeType(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensalidade">Mensalidade</SelectItem>
                    <SelectItem value="matricula">Matrícula</SelectItem>
                    <SelectItem value="rematricula">Rematrícula</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Referência</Label>
                  <Input
                    value={chargeReference}
                    onChange={(e) => setChargeReference(e.target.value)}
                    placeholder="Ex: Jan/2026"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vencimento</Label>
                  <Input
                    type="date"
                    value={chargeDueDate}
                    onChange={(e) => setChargeDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsChargeOpen(false)}>Cancelar</Button>
              <Button
                onClick={() => {
                  if (!chargeStudentId || !chargeReference || !chargeDueDate || !chargeAmount) {
                    toast.error('Preencha todos os campos');
                    return;
                  }
                  chargeMutation.mutate({
                    student_id: chargeStudentId,
                    reference: chargeReference,
                    due_date: chargeDueDate,
                    amount: parseFloat(chargeAmount),
                    type: chargeType
                  });
                }}
                disabled={chargeMutation.isPending}
              >
                {chargeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Cobrança
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Batch Generation Modal */}
        <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerar Mensalidades em Lote</DialogTitle>
              <DialogDescription>
                Isso irá gerar mensalidades para <b>todos os alunos ativos</b> para o mês selecionado.
                Mensalidades que já existem não serão duplicadas.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select value={generateMonth} onValueChange={setGenerateMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" sideOffset={5} className="max-h-[250px]">
                    <SelectItem value="1">Janeiro</SelectItem>
                    <SelectItem value="2">Fevereiro</SelectItem>
                    <SelectItem value="3">Março</SelectItem>
                    <SelectItem value="4">Abril</SelectItem>
                    <SelectItem value="5">Maio</SelectItem>
                    <SelectItem value="6">Junho</SelectItem>
                    <SelectItem value="7">Julho</SelectItem>
                    <SelectItem value="8">Agosto</SelectItem>
                    <SelectItem value="9">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Input
                  type="number"
                  value={generateYear}
                  onChange={(e) => setGenerateYear(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>Cancelar</Button>
              <Button onClick={handleGenerateClick} disabled={generateMutation.isPending}>
                {generateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Gerar Agora
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Notification Alert Modal */}
        <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="w-5 h-5" />
                Aviso de Reenvio
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                Uma cobrança já foi enviada <span className="font-bold text-foreground underline underline-offset-2">HOJE</span> para este aluno.
                <br /><br />
                Deseja prosseguir e enviar o lembrete novamente?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAlertOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  if (tuitionToNotify) {
                    sendWhatsAppMessage(tuitionToNotify);
                    setIsAlertOpen(false);
                  }
                }}
              >
                Sim, enviar novamente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Receipt Modal */}
        <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader className="no-print">
              <DialogTitle>Visualização do Recibo</DialogTitle>
              <DialogDescription>
                Confirmação de recebimento para a mensalidade selecionada.
              </DialogDescription>
            </DialogHeader>
            <div id="receipt-area" className="p-8 bg-white text-black border-2 border-dashed border-gray-300 rounded-lg">
              <style>
                {`
                    @media print {
                      body * {
                        visibility: hidden;
                      }
                      #receipt-area, #receipt-area * {
                        visibility: visible;
                      }
                      #receipt-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        border: none !important;
                      }
                      .no-print {
                        display: none !important;
                      }
                    }
                  `}
              </style>

              <div className="text-center border-b-2 border-black pb-6 mb-6">
                <h1 className="text-3xl font-bold uppercase tracking-wider">{schoolData?.name || "ESCOLA DE MUSICA VEM CANTAR"}</h1>
                <p className="text-sm text-gray-600 mt-2">{schoolData?.address || "Rua da Música, 123 - Centro, São Paulo - SP"}</p>
                <p className="text-sm text-gray-600">CNPJ: {schoolData?.cnpj || "12.345.678/0001-90"} | Tel: {schoolData?.phone || "(11) 99999-9999"}</p>
              </div>

              <div className="flex justify-between items-center mb-8">
                <div className="text-xl font-bold border-2 border-black p-2 px-4 rounded">
                  RECIBO Nº {selectedTuition?.id.toString().padStart(6, '0')}
                </div>
                <div className="text-xl font-bold">
                  VALOR: {selectedTuition && formatCurrency(Number(selectedTuition.amount))}
                </div>
              </div>

              <div className="space-y-6 text-lg leading-relaxed">
                <p>
                  Recebemos de <span className="font-bold underline decoration-dotted underline-offset-4">{selectedTuition?.student?.name}</span>
                </p>
                <p>
                  A importância de <span className="font-bold">{selectedTuition && formatCurrency(Number(selectedTuition.amount))}</span>
                </p>
                <p>
                  Referente à mensalidade de <span className="font-bold">{selectedTuition?.reference}</span>.
                </p>
                <p>
                  Para clareza e verdade, firmamos o presente.
                </p>
              </div>

              <div className="mt-16 text-center flex flex-col items-center justify-center">
                <div className="w-64 border-b border-black mb-2"></div>
                <p className="font-bold">{schoolData?.name || "ESCOLA DE MUSICA VEM CANTAR"}</p>
                <p className="text-sm text-gray-500">{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <DialogFooter className="no-print">
              <Button variant="outline" onClick={() => setIsReceiptOpen(false)}>Fechar</Button>
              <Button onClick={handlePrintReceipt} className="gap-2">
                <Printer className="w-4 h-4" /> Imprimir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <StudentSheet
          studentId={sheetStudentId}
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação excluirá permanentemente a mensalidade de <b>{tuitionToDelete?.student?.name}</b> ref. <b>{tuitionToDelete?.reference}</b>.
                As mensalidades pagas não podem ser excluídas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTuitionToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => tuitionToDelete && deleteMutation.mutate(tuitionToDelete.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Excluir Permanentemente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* Bulk Notification Modal */}
        <Dialog open={isBulkNotifyOpen} onOpenChange={(open) => {
          if (!open) {
            setIsBulkNotifyOpen(false);
            setBulkNotifyIndex(0);
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-500" />
                Mutirão de Cobrança
              </DialogTitle>
              <DialogDescription>
                Enviando lembretes para alunos com mensalidades atrasadas que ainda não foram notificados hoje.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              {bulkQueue.length === 0 ? (
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="font-medium">Tudo em dia!</p>
                  <p className="text-sm text-muted-foreground">Não há novos alunos pendentes de cobrança hoje.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
                    <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      <span>Progresso</span>
                      <span>{bulkNotifyIndex + 1} de {bulkQueue.length}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${((bulkNotifyIndex + 1) / bulkQueue.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-xl shadow-sm">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {bulkQueue[bulkNotifyIndex]?.student?.name?.[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{bulkQueue[bulkNotifyIndex]?.student?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {bulkQueue[bulkNotifyIndex]?.reference} • {formatCurrency(bulkQueue[bulkNotifyIndex]?.amount)}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-lg border border-amber-200 dark:border-amber-500/20 flex gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>Ao clicar em enviar, o WhatsApp abrirá em uma nova aba. Volte aqui para passar para o próximo aluno.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setIsBulkNotifyOpen(false)}>
                {bulkQueue.length === 0 ? "Fechar" : "Cancelar"}
              </Button>
              {bulkQueue.length > 0 && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  onClick={() => {
                    sendWhatsAppMessage(bulkQueue[bulkNotifyIndex]);
                    if (bulkNotifyIndex < bulkQueue.length - 1) {
                      setBulkNotifyIndex(prev => prev + 1);
                    } else {
                      toast.success("Mutirão concluído com sucesso!");
                      setIsBulkNotifyOpen(false);
                      setBulkNotifyIndex(0);
                    }
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar e Próximo
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
