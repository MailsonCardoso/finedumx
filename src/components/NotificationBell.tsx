import { Bell, MessageCircle, AlertCircle, Clock, Eye } from "lucide-react";
import { useState } from "react";
import { StudentSheet } from "@/components/StudentSheet";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function NotificationBell() {
    const queryClient = useQueryClient();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [sheetStudentId, setSheetStudentId] = useState<number | null>(null);

    // Fetch tuitions to check for overdue ones that need re-notification
    const { data: tuitions = [] } = useQuery<any[]>({
        queryKey: ['tuitions'],
        queryFn: () => apiFetch('/tuitions'),
    });

    const { data: schoolData } = useQuery({
        queryKey: ['school-settings'],
        queryFn: () => apiFetch<any>('/settings'),
    });

    const notifyMutation = useMutation({
        mutationFn: (id: number) => apiFetch(`/tuitions/${id}/notify`, { method: 'POST' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tuitions'] });
        }
    });

    // Filter tuitions: Overdue AND (never notified OR notified more than 3 days ago)
    const pendingNotifications = tuitions.filter(t => {
        // Se já estiver pago ou o aluno não existir mais, ignora
        if (t.status === 'pago' || !t.student) return false;

        if (t.status !== 'atrasado' && new Date(t.due_date) >= new Date()) return false;

        // Check if never notified or notified > 3 days ago
        if (!t.last_notification_at) return true;

        const lastNotify = new Date(t.last_notification_at);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        return lastNotify < threeDaysAgo;
    });

    const handleWhatsApp = (tuition: any) => {
        const student = tuition.student;
        if (!student?.phone) {
            toast.error("Aluno sem telefone cadastrado");
            return;
        }

        const phone = student.phone.replace(/\D/g, '');
        const hasResp = student.active_responsible && student.active_responsible.trim() !== "";
        const respName = student.active_responsible;
        const studentName = student.name;
        const pix = schoolData?.pix_key || "98988221217";

        const dueDate = new Date(tuition.due_date + 'T23:59:59');
        const today = new Date();
        const diffTime = today.getTime() - dueDate.getTime();
        const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const overduePhrase = daysOverdue > 5 ? `está em aberto há *${daysOverdue} dias*` : `ainda está em aberto`;

        let message = "";
        if (hasResp) {
            message = `Olá *${respName}*! Notamos que a mensalidade de *${tuition.reference}* de *${studentName}* ${overduePhrase}. Segue o PIX para regularização: *${pix}* . Qualquer dúvida, estamos à disposição!`;
        } else {
            message = `Olá *${studentName}*! Notamos que a mensalidade de *${tuition.reference}* ${overduePhrase}. Segue o PIX para regularização: *${pix}* . Qualquer dúvida, estamos à disposição!`;
        }

        notifyMutation.mutate(tuition.id);
        window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative group text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                        <Bell className="w-5 h-5 transition-transform group-hover:scale-110" />
                        {pendingNotifications.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 shadow-2xl border-primary/20 bg-card overflow-hidden" align="end">
                    <div className="bg-primary/5 p-4 border-b border-border/50">
                        <h3 className="font-bold text-base flex items-center gap-2">
                            <Bell className="w-4 h-4 text-primary" />
                            Lembretes de Cobrança
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            {pendingNotifications.length > 0
                                ? `Você tem ${pendingNotifications.length} pendências para re-notificar.`
                                : "Tudo em dia! Nenhuma cobrança pendente de re-envio."}
                        </p>
                    </div>

                    <ScrollArea className="h-[350px]">
                        {pendingNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                </div>
                                <p className="text-sm text-muted-foreground">Parabéns! Nenhuma mensalidade precisa de re-notificação no momento.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {pendingNotifications.map((t) => (
                                    <div key={t.id} className="p-4 hover:bg-muted/50 transition-colors group">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1 min-w-0 cursor-pointer group/name" onClick={() => {
                                                if (t.student_id) {
                                                    setSheetStudentId(t.student_id);
                                                    setIsSheetOpen(true);
                                                }
                                            }}>
                                                <p className="text-sm font-bold text-foreground truncate group-hover/name:text-primary transition-colors flex items-center gap-1.5">
                                                    {t.student?.name}
                                                    <Eye className="w-3 h-3 opacity-0 group-hover/name:opacity-50" />
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                        {t.reference}
                                                    </span>
                                                    <span className="text-xs text-destructive flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Atrasada
                                                    </span>
                                                </div>
                                                {t.last_notification_at && (
                                                    <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Último envio: {formatDistanceToNow(new Date(t.last_notification_at), { addSuffix: true, locale: ptBR })}
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-8 w-8 rounded-full border-primary/20 hover:border-primary hover:bg-primary/10 text-primary shrink-0 transition-all hover:scale-110"
                                                onClick={() => handleWhatsApp(t)}
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                    {pendingNotifications.length > 0 && (
                        <div className="p-3 bg-muted/30 border-t border-border/50 text-center">
                            <p className="text-[10px] text-muted-foreground italic">
                                * Listando apenas atrasos há mais de 3 dias sem contato.
                            </p>
                        </div>
                    )}
                </PopoverContent>
            </Popover>

            <StudentSheet
                studentId={sheetStudentId}
                isOpen={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </>
    );
}

function CheckCircle2({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
