import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import {
    Calendar,
    Clock,
    FileText,
    CheckCircle2,
    Music,
    Download,
    Loader2,
    User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useEffect } from "react";

interface PortalData {
    student: {
        name: string;
        student: {
            course: string;
        }
    };
    appointments: any[];
    tuitions: any[];
    presences: any[];
    enrolled: any[];
}

export default function StudentPortal() {
    const { setTheme } = useTheme();

    // Forçar tema escuro no portal do aluno para o visual premium do print
    useEffect(() => {
        setTheme("dark");
    }, []);

    const { data, isLoading } = useQuery<PortalData>({
        queryKey: ['student-portal'],
        queryFn: () => apiFetch('/student/portal'),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <MainLayout>
            <motion.div
                className="space-y-8 pb-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Banner de Boas-vindas */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#2e0249] via-[#570a57] to-[#a91079] p-8 md:p-12 shadow-2xl"
                >
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                            <span className="text-3xl font-bold text-white">
                                {data?.student?.name?.substring(0, 1).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-white/70 uppercase tracking-[0.2em] text-xs font-bold mb-1">Área do Aluno</p>
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                                Olá, {data?.student?.name?.split(' ')[0]}!
                            </h1>
                        </div>
                    </div>
                    {/* Elementos decorativos de fundo */}
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-20%] left-[20%] w-48 h-48 bg-purple-500/20 rounded-full blur-2xl" />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Meus Horários */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2rem] border-white/5 bg-[#1a1c2e]/50 backdrop-blur-xl shadow-xl h-full flex flex-col">
                            <CardHeader className="flex flex-row items-center gap-3 border-b border-white/5 pb-6">
                                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-white">Meus Horários</CardTitle>
                                    <p className="text-sm text-white/50">Sua grade semanal de aulas</p>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-6 space-y-4">
                                {data?.appointments && data.appointments.length > 0 ? (
                                    data.appointments.map((app, idx) => (
                                        <div key={idx} className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                    <Music className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{app.course?.name || "Aula"}</p>
                                                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-1">
                                                        {new Date(app.date).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')} • {app.start_time.substring(0, 5)} - {app.duration}m
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center">
                                        <p className="text-white/30 italic">Nenhum horário agendado.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Minhas Mensalidades */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2rem] border-white/5 bg-[#1a1c2e]/50 backdrop-blur-xl shadow-xl h-full flex flex-col">
                            <CardHeader className="flex flex-row items-center gap-3 border-b border-white/5 pb-6">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-white">Minhas Mensalidades</CardTitle>
                                    <p className="text-sm text-white/50">Financeiro e mensalidades</p>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-6 space-y-4">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Pagas</p>
                                {data?.tuitions && data.tuitions.length > 0 ? (
                                    data.tuitions.map((tuition, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-[#10b981]/5 border border-[#10b981]/10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white/90">Fatura #{tuition.id} - {data.student.name.split(' ')[0]}</p>
                                                    <p className="text-[10px] text-white/40 font-bold uppercase mt-0.5">Pago em {tuition.updated_at ? new Date(tuition.updated_at).toLocaleDateString('pt-BR') : '-'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-1">
                                                <p className="text-white font-black">{formatCurrency(Number(tuition.amount))}</p>
                                                <Button variant="ghost" size="sm" className="h-6 gap-1.5 text-[10px] text-emerald-400 font-black hover:bg-emerald-400/10 p-0">
                                                    <Download className="w-3 h-3" /> COMPROVANTE
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-white/30 italic">Nenhum registro encontrado.</div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Matriculado em */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2rem] border-white/5 bg-[#1a1c2e]/50 backdrop-blur-xl shadow-xl">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <Music className="w-5 h-5 text-purple-400" />
                                    <h3 className="text-white/90 uppercase tracking-[0.2em] text-[10px] font-black mt-0.5">Matriculado em:</h3>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {data?.enrolled.map((item, idx) => (
                                        <Badge key={idx} className="px-5 py-2 rounded-xl bg-purple-500/20 text-purple-300 border-none font-black text-xs uppercase tracking-widest">
                                            {item.course?.name || "Curso"}
                                        </Badge>
                                    ))}
                                    {data?.enrolled.length === 0 && data?.student.student.course && (
                                        <Badge className="px-5 py-2 rounded-xl bg-purple-500/20 text-purple-300 border-none font-black text-xs uppercase tracking-widest">
                                            {data.student.student.course}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Minhas Presenças */}
                    <motion.div variants={itemVariants}>
                        <Card className="rounded-[2rem] border-white/5 bg-[#1a1c2e]/50 backdrop-blur-xl shadow-xl">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    <h3 className="text-white/90 uppercase tracking-[0.2em] text-[10px] font-black mt-0.5">Minhas Presenças</h3>
                                </div>
                                <div className="space-y-4">
                                    {data?.presences && data.presences.length > 0 ? (
                                        data.presences.map((p, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                                <div>
                                                    <p className="text-white font-bold">{p.course?.name || "Aula"}</p>
                                                    <p className="text-[10px] text-white/40 font-bold">{new Date(p.date).toLocaleDateString('pt-BR')}</p>
                                                </div>
                                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black text-[10px] uppercase">Presente</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-4 text-center text-white/30 italic text-sm">Nenhuma presença registrada recentemente.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </MainLayout>
    );
}
