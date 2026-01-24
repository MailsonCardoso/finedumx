import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Filter, Users, Loader2, Pencil, Trash2, GraduationCap, Clock } from "lucide-react";
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
                                    <TableHead className="font-bold h-14 text-foreground">Turma</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground">Professor</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground">Turno</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground">Horário</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground">Dias</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground">Sala</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground">Alunos</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground">Status</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground text-right pr-6">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="text-muted-foreground">Carregando turmas...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <AnimatePresence mode="popLayout">
                                        {sortedClasses.map((classItem, i) => (
                                            <motion.tr
                                                key={classItem.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="group border-b border-border/40 hover:bg-primary/5 transition-colors"
                                            >
                                                <TableCell className="py-4 font-semibold text-foreground">
                                                    <div className="flex flex-col">
                                                        <span>{classItem.name}</span>
                                                        <span className="text-xs text-muted-foreground font-normal">{classItem.course_name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 text-muted-foreground">
                                                    {classItem.teacher_name || <span className="text-muted-foreground/50 italic">Não atribuído</span>}
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    {getShiftBadge(classItem.shift)}
                                                </TableCell>
                                                <TableCell className="py-4 text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {classItem.start_time} - {classItem.end_time}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 text-muted-foreground text-sm">
                                                    {classItem.days_of_week}
                                                </TableCell>
                                                <TableCell className="py-4 text-muted-foreground">
                                                    <Badge variant="outline">{classItem.room}</Badge>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                {classItem.current_students || 0}/{classItem.max_students}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-muted rounded-full h-1.5">
                                                            <div
                                                                className="bg-primary h-1.5 rounded-full transition-all"
                                                                style={{ width: `${getOccupancyPercentage(classItem.current_students || 0, classItem.max_students)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">{getStatusBadge(classItem.status)}</TableCell>
                                                <TableCell className="py-4 text-right pr-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditClick(classItem)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteClick(classItem)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {!isLoading && sortedClasses.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-16 text-center flex flex-col items-center gap-4"
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
                </motion.div>

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
