import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Loader2, Phone, Mail, User, Calendar, DollarSign, MessageCircle, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StudentSheetProps {
    studentId: number | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

interface Student {
    id: number;
    name: string;
    active_responsible?: string;
    email: string;
    phone: string;
    course: string;
    due_day: number;
    monthly_fee: number;
    status: string;
}

interface Tuition {
    id: number;
    reference: string;
    due_date: string;
    amount: number;
    status: string;
    type?: 'mensalidade' | 'matricula' | 'rematricula';
}

export function StudentSheet({ studentId, isOpen, onOpenChange }: StudentSheetProps) {
    const { data: student, isLoading: isLoadingStudent } = useQuery<Student>({
        queryKey: ['student', studentId],
        queryFn: () => apiFetch(`/students/${studentId}`),
        enabled: !!studentId && isOpen,
    });

    const { data: tuitions = [], isLoading: isLoadingTuitions } = useQuery<Tuition[]>({
        queryKey: ['student-tuitions', studentId],
        queryFn: () => apiFetch(`/tuitions?student_id=${studentId}`),
        enabled: !!studentId && isOpen,
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const getStatusBadge = (t: Tuition) => {
        if (t.status === 'pago') {
            return <StatusBadge status="success">Pago</StatusBadge>;
        }

        const dueDate = new Date(t.due_date + 'T23:59:59');
        const isOverdue = t.status === 'atrasado' || dueDate < new Date();

        if (isOverdue) {
            return <StatusBadge status="danger">Atrasado</StatusBadge>;
        }

        return <StatusBadge status="warning">Pendente</StatusBadge>;
    };

    const totalPaid = tuitions
        .filter(t => t.status === 'pago')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalPending = tuitions
        .filter(t => t.status !== 'pago')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const handleWhatsApp = () => {
        if (!student?.phone) return;
        const cleanPhone = student.phone.replace(/\D/g, "");
        window.open(`https://wa.me/55${cleanPhone}`, "_blank");
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md overflow-y-auto w-full">
                {isLoadingStudent ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : student ? (
                    <div className="space-y-6 pb-8">
                        <SheetHeader className="text-left">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold shadow-inner">
                                    {student.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <SheetTitle className="text-2xl font-bold leading-tight">{student.name}</SheetTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                        <StatusBadge status={student.status === 'ativo' ? 'success' : 'neutral'}>
                                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                        </StatusBadge>
                                        <span className="text-sm text-muted-foreground">• {student.course}</span>
                                    </div>
                                </div>
                            </div>
                            <SheetDescription className="text-base">
                                Acessando ficha detalhada do aluno e histórico financeiro.
                            </SheetDescription>
                        </SheetHeader>

                        <div className="grid grid-cols-2 gap-3">
                            <Card className="border-none bg-emerald-500/5 shadow-none">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total Pago</p>
                                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none bg-amber-500/5 shadow-none">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Em Aberto</p>
                                    <p className="text-xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" /> Dados Cadastrais
                            </h3>
                            <div className="grid grid-cols-1 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                                {student.active_responsible && (
                                    <div className="flex items-start gap-3">
                                        <User className="w-4 h-4 text-muted-foreground mt-1" />
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase font-semibold">Responsável</p>
                                            <p className="text-foreground font-medium">{student.active_responsible}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start gap-3">
                                    <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-semibold">Telefone</p>
                                        <p className="text-foreground font-medium">{student.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail className="w-4 h-4 text-muted-foreground mt-1" />
                                    <div className="overflow-hidden">
                                        <p className="text-xs text-muted-foreground uppercase font-semibold">E-mail</p>
                                        <p className="text-foreground font-medium truncate">{student.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-4 h-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-semibold">Dia de Vencimento</p>
                                        <p className="text-foreground font-medium">Todo dia {student.due_day}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <DollarSign className="w-4 h-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-semibold">Mensalidade</p>
                                        <p className="text-foreground font-medium">{formatCurrency(student.monthly_fee)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 h-11" onClick={handleWhatsApp}>
                                    <MessageCircle className="w-5 h-5" /> WhatsApp
                                </Button>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" /> Histórico de Mensalidades
                            </h3>

                            {isLoadingTuitions ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
                                </div>
                            ) : tuitions.length > 0 ? (
                                <div className="space-y-3">
                                    {tuitions.map((t) => (
                                        <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-foreground">{t.reference}</span>
                                                    {t.type === 'matricula' && (
                                                        <span className="inline-flex items-center rounded-sm bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
                                                            MATRÍCULA
                                                        </span>
                                                    )}
                                                    {t.type === 'rematricula' && (
                                                        <span className="inline-flex items-center rounded-sm bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                                                            REMATRÍCULA
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground">Vence {format(new Date(t.due_date + 'T12:00:00'), "dd/MM/yyyy")}</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                <span className="font-bold text-foreground">{formatCurrency(Number(t.amount))}</span>
                                                {getStatusBadge(t)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed border-border/50">
                                    <p className="text-muted-foreground text-sm">Nenhuma mensalidade registrada.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                        <p className="text-muted-foreground">Não foi possível carregar os dados deste aluno.</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
