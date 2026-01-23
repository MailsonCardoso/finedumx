import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import {
    Calendar,
    Clock,
    Users,
    CheckCircle2,
    BookOpen,
    Loader2,
    GraduationCap,
    ClipboardList,
    Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface TeacherData {
    teacher: {
        name: string;
        employee: {
            role: string;
        }
    };
    stats: {
        total_lessons: number;
        upcoming_lessons: number;
        completed_lessons: number;
    };
    appointments: any[];
}

export default function TeacherPortal() {
    const [searchTerm, setSearchTerm] = useState("");

    const { data, isLoading } = useQuery<TeacherData>({
        queryKey: ['teacher-portal'],
        queryFn: () => apiFetch('/teacher/portal'),
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

    const filteredAppointments = data?.appointments.filter(app =>
        app.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.course?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.school_class?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

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
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Portal do Professor</h1>
                        <p className="text-muted-foreground mt-1 text-lg">
                            Olá, Prof. {data?.teacher?.name}. Confira sua agenda de aulas.
                        </p>
                    </div>
                </motion.div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KPICard
                        index={0}
                        title="Total de Aulas"
                        value={String(data?.stats?.total_lessons || 0)}
                        icon={<ClipboardList className="w-5 h-5" />}
                        className="border-primary/20 bg-primary/5"
                    />
                    <KPICard
                        index={1}
                        title="Próximas Aulas"
                        value={String(data?.stats?.upcoming_lessons || 0)}
                        icon={<Calendar className="w-5 h-5 text-amber-500" />}
                        trend={data?.stats?.upcoming_lessons > 0 ? { value: "Pendente", direction: "neutral" } : undefined}
                    />
                    <KPICard
                        index={2}
                        title="Aulas Realizadas"
                        value={String(data?.stats?.completed_lessons || 0)}
                        icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        trend={{ value: "Histórico", direction: "up" }}
                    />
                </div>

                {/* Agenda */}
                <Card className="shadow-soft border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 py-4">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Minha Agenda de Aulas
                        </CardTitle>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar aluno ou curso..."
                                className="pl-9 bg-background/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/30 text-muted-foreground font-medium border-b border-border/50 uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Data/Hora</th>
                                        <th className="px-6 py-4">Curso / Turma</th>
                                        <th className="px-6 py-4">Aluno(s)</th>
                                        <th className="px-6 py-4">Duração</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {filteredAppointments.length > 0 ? (
                                        filteredAppointments.map((app, idx) => (
                                            <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-foreground">
                                                            {new Date(app.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {app.start_time.substring(0, 5)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-primary/60" />
                                                        <span className="font-medium">{app.course?.name || "N/A"}</span>
                                                    </div>
                                                    {app.school_class && (
                                                        <div className="text-[10px] text-primary font-bold mt-0.5 uppercase">
                                                            Turma: {app.school_class.name}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {app.type === 'individual' ? (
                                                        <div className="flex items-center gap-2">
                                                            <GraduationCap className="w-4 h-4 text-muted-foreground" />
                                                            <span>{app.student?.name || "Não informado"}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-4 h-4 text-muted-foreground" />
                                                            <span>{app.school_class?.students?.length || 0} Alunos</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="font-medium border-border/50">
                                                        {app.duration} min
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {app.status === 'realizado' ? (
                                                        <StatusBadge status="success">Realizado</StatusBadge>
                                                    ) : app.status === 'falta' ? (
                                                        <StatusBadge status="danger">Falta</StatusBadge>
                                                    ) : (
                                                        <StatusBadge status="warning">Pendente</StatusBadge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                                                Nenhuma aula encontrada para os critérios de busca.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
