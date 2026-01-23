import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import {
    Calendar,
    Clock,
    Music,
    Loader2,
    CheckCircle2,
    DollarSign,
    GraduationCap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";

interface PortalData {
    student: {
        name: string;
        student: {
            course: string;
            monthly_fee: string;
        }
    };
    stats?: {
        next_due_date: string | null;
        total_paid: number;
        absences: number;
    };
    appointments: any[];
    tuitions: any[];
    presences: any[];
    enrolled: any[];
}

export default function StudentPortal() {
    const { data, isLoading } = useQuery<PortalData>({
        queryKey: ['student-portal'],
        queryFn: () => apiFetch('/student/portal'),
    });

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    return (
        <MainLayout>
            <div className="space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Meu Portal</h1>
                        <p className="text-muted-foreground mt-1 text-lg">
                            Olá, {data?.student?.name}. Bem-vindo à sua área do aluno.
                        </p>
                    </div>
                </motion.div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KPICard
                        index={0}
                        title="Meu Curso"
                        value={data?.student?.student?.course || "Nenhum"}
                        icon={<GraduationCap className="w-5 h-5" />}
                        className="border-primary/20 bg-primary/5"
                    />
                    <KPICard
                        index={1}
                        title="Valor Mensal"
                        value={formatCurrency(Number(data?.student?.student?.monthly_fee || 0))}
                        icon={<DollarSign className="w-5 h-5" />}
                    />
                    <KPICard
                        index={2}
                        title="Próximo Vencimento"
                        value={data?.stats?.next_due_date ? new Date(data.stats.next_due_date).toLocaleDateString('pt-BR') : "Nenhum"}
                        icon={<Calendar className="w-5 h-5" />}
                        trend={data?.stats?.next_due_date ? { value: "Aguardando", direction: "neutral" } : undefined}
                    />
                    <KPICard
                        index={3}
                        title="Total Pago"
                        value={formatCurrency(data?.stats?.total_paid || 0)}
                        icon={<CheckCircle2 className="w-5 h-5" />}
                        trend={{ value: "Histórico total", direction: "up" }}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Meus Horários */}
                    <Card className="shadow-soft border-border/50 hover:shadow-card transition-shadow bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center border-b border-border/50 bg-primary/5 py-4">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Meus Horários
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                                {data?.appointments && data.appointments.length > 0 ? (
                                    data.appointments.map((app, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <Music className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{app.course?.name || "Aula"}</p>
                                                    <p className="text-xs text-muted-foreground uppercase">
                                                        {new Date(app.date).toLocaleDateString('pt-BR', { weekday: 'long' })} • {app.start_time.substring(0, 5)} - {app.duration}min
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-muted-foreground italic">Nenhum horário agendado.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Minhas Mensalidades */}
                    <Card className="shadow-soft border-border/50 hover:shadow-card transition-shadow bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center border-b border-border/50 bg-emerald-500/5 py-4">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-emerald-500" />
                                Minhas Mensalidades
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                                {data?.tuitions && data.tuitions.length > 0 ? (
                                    data.tuitions.map((tuition, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">Fatura #{tuition.id}</p>
                                                    <p className="text-xs text-muted-foreground">Pago em {new Date(tuition.updated_at).toLocaleDateString('pt-BR')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-foreground">{formatCurrency(Number(tuition.amount))}</p>
                                                <Badge variant="outline" className="mt-1 bg-emerald-500/10 text-emerald-600 border-none">PAGO</Badge>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-muted-foreground italic">Nenhuma fatura encontrada.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Presenças */}
                <Card className="shadow-soft border-border/50 hover:shadow-card transition-shadow bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center border-b border-border/50 bg-muted/20 py-4">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            Minhas Presenças
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {data?.presences && data.presences.length > 0 ? (
                                data.presences.map((p, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50">
                                        <div>
                                            <p className="font-semibold text-foreground">{p.course?.name || "Aula"}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <StatusBadge status="success">Presente</StatusBadge>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-8 text-center text-muted-foreground italic">Nenhuma presença registrada.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
