import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";


import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Plus, Search, Filter, Users, Loader2, Pencil, Trash2, GraduationCap, Clock, User, CalendarDays, MoreVertical } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ClassModal } from "@/components/ClassModal";

interface Class {
    id: number;
    name: string;
    course_id: number;
    course_name: string;
    teacher_id?: number;
    teacher_name?: string;
    shift: string;
    start_time: string;
    end_time: string;
    days_of_week: string;
    max_students: number;
    current_students: number;
    room: string;
    status: string;
    student_ids: number[];
}

export default function Classes() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");
    const queryClient = useQueryClient();

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);

    // Queries
    const { data: classesData = [], isLoading } = useQuery<Class[]>({
        queryKey: ['classes', searchTerm, statusFilter],
        queryFn: () => apiFetch(`/classes?search=${searchTerm}&status=${statusFilter}`),
    });

    // Sort: Active classes first
    const sortedClasses = [...classesData].sort((a, b) => {
        if (a.status === 'ativo' && b.status !== 'ativo') return -1;
        if (a.status !== 'ativo' && b.status === 'ativo') return 1;
        return 0;
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) =>
            apiFetch(`/classes/${id}`, {
                method: 'DELETE'
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            toast.success("Turma removida com sucesso!");
            setIsDeleteOpen(false);
            setSelectedClass(null);
        },
        onError: (error: any) => {
            toast.error(error.message || "Erro ao remover turma");
        }
    });

    // Handlers
    const handleEditClick = (classItem: Class) => {
        setSelectedClass(classItem);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (classItem: Class) => {
        setSelectedClass(classItem);
        setIsDeleteOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ativo":
                return <StatusBadge status="success">Ativo</StatusBadge>;
            case "inativo":
                return <StatusBadge status="neutral">Inativo</StatusBadge>;
            case "completo":
                return <StatusBadge status="warning">Completo</StatusBadge>;
            default:
                return <StatusBadge status="neutral">{status}</StatusBadge>;
        }
    };

    const getShiftBadge = (shift: string) => {
        const shifts: { [key: string]: { label: string; color: string } } = {
            manha: { label: "Manhã", color: "bg-amber-100 text-amber-700 border-amber-300" },
            tarde: { label: "Tarde", color: "bg-orange-100 text-orange-700 border-orange-300" },
            noite: { label: "Noite", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
            integral: { label: "Integral", color: "bg-purple-100 text-purple-700 border-purple-300" },
        };
        const s = shifts[shift] || { label: shift, color: "bg-gray-100 text-gray-700" };
        return <Badge className={`${s.color} border`}>{s.label}</Badge>;
    };

    const getOccupancyPercentage = (current: number, max: number) => {
        return max > 0 ? Math.round((current / max) * 100) : 0;
    };

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
                        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                            <GraduationCap className="w-8 h-8 text-primary" />
                            Turmas
                        </h1>
                        <p className="text-muted-foreground mt-1 text-lg">
                            Gerencie as turmas, horários e capacidade de alunos.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setSelectedClass(null);
                            setIsModalOpen(true);
                        }}
                        className="gap-2 shadow-lg shadow-primary/20 h-11 px-6"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Turma
                    </Button>
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
                            placeholder="Buscar turma por nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 bg-background border-border/50 focus:border-primary transition-all"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[200px] h-11 bg-background">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <SelectValue placeholder="Filtrar status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos os status</SelectItem>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                            <SelectItem value="completo">Completo</SelectItem>
                        </SelectContent>
                    </Select>
                </motion.div>

                {/* Table */}
                {/* Grid of Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-[320px] bg-card rounded-[24px] border border-border/50 animate-pulse" />
                        ))
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {sortedClasses.map((classItem, i) => (
                                <motion.div
                                    key={classItem.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-card rounded-[24px] shadow-sm hover:shadow-lg transition-all border border-border/40 overflow-hidden relative flex flex-col group"
                                >
                                    {/* Top Accent */}
                                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/80 to-primary/40" />

                                    {/* Actions Menu Absolute */}
                                    <div className="absolute top-3 right-3 z-10">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                <DropdownMenuLabel>Opções</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEditClick(classItem)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteClick(classItem)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="p-5 flex flex-col gap-4 h-full pt-7">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3 w-full">
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <GraduationCap className="h-6 w-6" />
                                                </div>
                                                <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
                                                    <h3 className="font-bold text-foreground leading-tight truncate w-full pr-6" title={classItem.name}>
                                                        {classItem.name}
                                                    </h3>
                                                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground hover:bg-muted px-2 py-0.5 h-auto truncate max-w-full">
                                                        {classItem.course_name}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Body Information */}
                                        <div className="space-y-3 mt-2">
                                            {/* Professor */}
                                            <div className="bg-muted/30 rounded-full px-4 py-2.5 flex items-center gap-3 text-sm text-foreground/70">
                                                <User className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                                                <span className="truncate text-xs font-medium">
                                                    {classItem.teacher_name || "Sem professor"}
                                                </span>
                                            </div>

                                            {/* Time */}
                                            <div className="bg-muted/30 rounded-full px-4 py-2.5 flex items-center gap-3 text-sm text-foreground/70">
                                                <Clock className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                                                <div className="flex flex-col leading-none gap-0.5 min-w-0">
                                                    <span className="truncate text-xs font-semibold">{classItem.days_of_week}</span>
                                                    <span className="text-[10px] text-muted-foreground">{classItem.start_time.substring(0, 5)} - {classItem.end_time.substring(0, 5)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 space-y-4">
                                            {/* Students Progress */}
                                            <div className="space-y-1.5 px-1">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1.5">
                                                        <Users className="w-3 h-3" />
                                                        Alunos
                                                    </span>
                                                    <span className="font-medium text-foreground">
                                                        {classItem.current_students}/{classItem.max_students}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-primary h-1.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${getOccupancyPercentage(classItem.current_students || 0, classItem.max_students)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div className="h-px w-full bg-border/40" />

                                            {/* Footer: Status & Shift/Room */}
                                            <div className="flex items-center justify-between text-xs px-2">
                                                <div className="scale-90 origin-left">
                                                    {getStatusBadge(classItem.status)}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-border/60 text-muted-foreground">
                                                        {classItem.room}
                                                    </Badge>
                                                    <div className="scale-90 origin-right">
                                                        {getShiftBadge(classItem.shift)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {!isLoading && sortedClasses.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-16 text-center flex flex-col items-center gap-4 bg-card/50 border border-dashed border-border rounded-xl"
                    >
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-foreground">Nenhuma turma encontrada</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                                Tente ajustar seus filtros ou termos de busca para encontrar o que procura.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => { setSearchTerm(""); setStatusFilter("todos"); }}
                            className="mt-2"
                        >
                            Limpar filtros
                        </Button>
                    </motion.div>
                )}

                <ClassModal
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    classItem={selectedClass}
                />

                {/* Delete Alert */}
                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente a turma
                                <span className="font-bold text-foreground"> {selectedClass?.name} </span>
                                e todos os seus dados associados.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => selectedClass && deleteMutation.mutate(selectedClass.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </MainLayout>
    );
}
