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
import { AlertTriangle, Bell, Printer, Plus, Filter, Search, CheckCircle2, Loader2, DollarSign, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";

interface Student {
  id: number;
  name: string;
  phone: string;
  active_responsible?: string;
}

interface Tuition {
  id: number;
  student_id: number;
  reference: string;
  due_date: string;
  amount: number;
  status: 'pago' | 'pendente' | 'atrasado';
  student: Student;
  last_notification_at?: string;
}

export default function Tuition() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const queryClient = useQueryClient();

  // Batch Generation Modal
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generateYear, setGenerateYear] = useState(new Date().getFullYear().toString());
  const [generateMonth, setGenerateMonth] = useState((new Date().getMonth() + 1).toString());

  // Anti-spam Alert
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [tuitionToNotify, setTuitionToNotify] = useState<Tuition | null>(null);

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

  // Payment Modal
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedTuition, setSelectedTuition] = useState<Tuition | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("pix");

  // Queries
  const { data: tuitions = [], isLoading } = useQuery<Tuition[]>({
    queryKey: ['tuitions'],
    queryFn: () => apiFetch('/tuitions'),
  });

  const { data: schoolData } = useQuery({
    queryKey: ['school-settings'],
    queryFn: () => apiFetch<any>('/settings'),
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
    // Check if notified recently (today)
    if (tuition.last_notification_at) {
      const lastNotify = new Date(tuition.last_notification_at);
      const isToday = lastNotify.toDateString() === new Date().toDateString();

      if (isToday) {
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

    let message = "";

    if (isOverdue) {
      const overduePhrase = showDays ? `está em aberto há *${daysOverdue} dias*` : `ainda está em aberto`;

      if (hasResp) {
        message = `Olá *${respName}*! Notamos que a mensalidade de *${tuition.reference}* de *${studentName}* ${overduePhrase}. Segue o PIX para regularização: *${pix}* . Qualquer dúvida, estamos à disposição!`;
      } else {
        message = `Olá *${studentName}*! Notamos que a mensalidade de *${tuition.reference}* ${overduePhrase}. Segue o PIX para regularização: *${pix}* . Qualquer dúvida, estamos à disposição!`;
      }
    } else {
      // Mensagem padrão para cobrança normal (pendente a vencer)
      if (hasResp) {
        message = `Olá *${respName}*! de *${studentName}*\na mensalidade de *${tuition.reference}* no valor de *${formatCurrency(Number(tuition.amount))}* vence em *${formatDate(tuition.due_date)}*.`;
      } else {
        message = `Olá *${studentName}*!\nsua mensalidade de *${tuition.reference}* no valor de *${formatCurrency(Number(tuition.amount))}* vence em *${formatDate(tuition.due_date)}*.`;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pago": return <StatusBadge status="success">Pago</StatusBadge>;
      case "pendente": return <StatusBadge status="warning">Pendente</StatusBadge>;
      case "atrasado": return <StatusBadge status="danger">Atrasado</StatusBadge>;
      default: return null;
    }
  };

  const filteredTuitions = tuitions.filter(t => {
    const matchesSearch = t.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort by status priority: atrasado > pendente > pago
  const sortedTuitions = [...filteredTuitions].sort((a, b) => {
    const statusOrder: Record<string, number> = {
      'atrasado': 1,
      'pendente': 2,
      'pago': 3
    };
    return (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
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
          <Button
            onClick={() => setIsGenerateOpen(true)}
            className="gap-2 shadow-lg shadow-primary/20 h-11 px-6"
          >
            <Plus className="w-5 h-5" />
            Gerar Mensalidades
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50 backdrop-blur-sm"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-11 bg-background/50">
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
          className="bg-card/50 backdrop-blur-md rounded-2xl shadow-soft border border-border/50 overflow-hidden"
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
                        <TableCell className="py-4 font-medium">{tuition.reference}</TableCell>
                        <TableCell className="py-4 font-medium text-foreground group-hover:text-primary transition-colors">
                          {tuition.student?.name}
                        </TableCell>
                        <TableCell className="py-4 text-muted-foreground">
                          {formatDate(tuition.due_date)}
                        </TableCell>
                        <TableCell className="py-4 font-bold text-foreground">
                          {formatCurrency(Number(tuition.amount))}
                        </TableCell>
                        <TableCell className="py-4">{getStatusBadge(tuition.status)}</TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            {tuition.status !== 'pago' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 transition-colors relative ${tuition.last_notification_at && new Date(tuition.last_notification_at).toDateString() === new Date().toDateString()
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
                                  {tuition.last_notification_at && new Date(tuition.last_notification_at).toDateString() === new Date().toDateString() && (
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

      </div>
    </MainLayout>
  );
}
