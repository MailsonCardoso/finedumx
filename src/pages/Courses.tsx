import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit2, Trash2, Loader2, BookOpen, User, Calendar, DollarSign, MoreVertical } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Course {
    id: number;
    name: string;
    price: number;
    description?: string;
    teacher_id?: number | string;
    teacher_name?: string;
    days_of_week?: string;
}

interface Employee {
    id: number;
    name: string;
    is_teacher?: boolean;
    status: string;
}

export default function Courses() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [formData, setFormData] = useState({ name: "", price: "", description: "", teacher_id: "none", days_of_week: "" });

    const queryClient = useQueryClient();

    const { data: employees = [] } = useQuery<Employee[]>({
        queryKey: ['employees'],
        queryFn: () => apiFetch('/employees'),
    });

    const teachers = employees.filter(emp => emp.is_teacher && emp.status === 'ativo');

    const { data: courses = [], isLoading } = useQuery<Course[]>({
        queryKey: ['courses'],
        queryFn: () => apiFetch('/courses'),
    });

    const createMutation = useMutation({
        mutationFn: (newCourse: any) => apiFetch('/courses', {
            method: 'POST',
            body: JSON.stringify(newCourse)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success("Curso criado com sucesso!");
            setIsAddOpen(false);
            setFormData({ name: "", price: "", description: "", teacher_id: "none", days_of_week: "" });
        },
        onError: () => toast.error("Erro ao criar curso")
    });

    const updateMutation = useMutation({
        mutationFn: (course: any) => apiFetch(`/courses/${selectedCourse?.id}`, {
            method: 'PUT',
            body: JSON.stringify(course)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success("Curso atualizado com sucesso!");
            setIsEditOpen(false);
        },
        onError: () => toast.error("Erro ao atualizar curso")
    });

    const deleteMutation = useMutation({
        mutationFn: () => apiFetch(`/courses/${selectedCourse?.id}`, {
            method: 'DELETE'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            toast.success("Curso excluído com sucesso!");
            setIsDeleteOpen(false);
        },
        onError: () => toast.error("Erro ao excluir curso")
    });

    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent, isEdit: boolean) => {
        e.preventDefault();
        const data = {
            ...formData,
            price: formData.price === "" ? 0 : parseFloat(formData.price),
            teacher_id: formData.teacher_id === "none" ? null : formData.teacher_id
        };

        if (isEdit) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const openEdit = (course: Course) => {
        setSelectedCourse(course);
        setFormData({
            name: course.name,
            price: course.price.toString(),
            description: course.description || "",
            teacher_id: course.teacher_id?.toString() || "none",
            days_of_week: course.days_of_week || ""
        });
        setIsEditOpen(true);
    };

    const openDelete = (course: Course) => {
        setSelectedCourse(course);
        setIsDeleteOpen(true);
    };

    return (
        <MainLayout>
            <div className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Cursos</h1>
                        <p className="text-muted-foreground mt-1 text-lg">
                            Gerencie o catálogo de modalidades e disciplinas da escola.
                        </p>
                    </div>
                    <Button onClick={() => { setFormData({ name: "", price: "", description: "", teacher_id: "none", days_of_week: "" }); setIsAddOpen(true); }} className="gap-2 shadow-lg shadow-primary/20 h-11 px-6">
                        <Plus className="w-5 h-5" />
                        Novo Curso
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50 backdrop-blur-sm"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar curso por nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary"
                        />
                    </div>
                </motion.div>

                {/* Grid of Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-[280px] bg-card rounded-[24px] border border-border/50 animate-pulse" />
                        ))
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredCourses.map((course, i) => (
                                <motion.div
                                    key={course.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-card rounded-[24px] shadow-sm hover:shadow-lg transition-all border border-border/40 overflow-hidden relative flex flex-col group h-full"
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
                                                <DropdownMenuItem onClick={() => openEdit(course)}>
                                                    <Edit2 className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => openDelete(course)}>
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
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110 duration-300">
                                                    <BookOpen className="h-6 w-6" />
                                                </div>
                                                <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
                                                    <h3 className="font-bold text-foreground leading-tight truncate w-full pr-6 text-lg" title={course.name}>
                                                        {course.name}
                                                    </h3>
                                                    {course.description && (
                                                        <p className="text-xs text-muted-foreground line-clamp-1 w-full" title={course.description}>
                                                            {course.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Body Information */}
                                        <div className="space-y-3 mt-2">
                                            {/* Professor Padrão */}
                                            <div className="bg-muted/30 rounded-full px-4 py-2.5 flex items-center gap-3 text-sm text-foreground/70">
                                                <User className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                                                <span className="truncate text-xs font-medium">
                                                    {course.teacher_name || "Sem prof. padrão"}
                                                </span>
                                            </div>

                                            {/* Dias Sugeridos */}
                                            <div className="bg-muted/30 rounded-full px-4 py-2.5 flex items-center gap-3 text-sm text-foreground/70">
                                                <Calendar className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                                                <span className="truncate text-xs">
                                                    {course.days_of_week || "Horário livre"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 space-y-4">
                                            {/* Divider */}
                                            <div className="h-px w-full bg-border/40" />

                                            {/* Footer: Price */}
                                            <div className="flex items-center justify-end px-2">
                                                <div className="text-right">
                                                    <span className="font-bold text-foreground text-lg">
                                                        {new Intl.NumberFormat("pt-BR", {
                                                            style: "currency",
                                                            currency: "BRL",
                                                        }).format(course.price)}
                                                    </span>
                                                    <span className="text-xs font-medium text-muted-foreground ml-1">/mês</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {!isLoading && filteredCourses.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-16 text-center flex flex-col items-center gap-4 bg-card/50 border border-dashed border-border rounded-xl"
                    >
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground opacity-50">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-foreground">Catálogo vazio</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                                Utilize o botão "Novo Curso" para adicionar modalidades.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Add Modal */}
            <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto" side="right">
                    <SheetHeader className="pb-6">
                        <SheetTitle className="text-2xl font-bold">Novo Curso / Matéria</SheetTitle>
                        <SheetDescription>Defina as características básicas desta disciplina.</SheetDescription>
                    </SheetHeader>
                    <form onSubmit={(e) => handleSubmit(e, false)}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome da Matéria</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Violão, Piano, Canto Kids"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Mensalidade (R$/mês)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="days">Dias Sugeridos</Label>
                                    <Input
                                        id="days"
                                        placeholder="Ex: Seg, Qua"
                                        value={formData.days_of_week}
                                        onChange={(e) => setFormData({ ...formData, days_of_week: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="teacher">Professor Sugerido</Label>
                                <Select
                                    value={formData.teacher_id}
                                    onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                                >
                                    <SelectTrigger id="teacher">
                                        <SelectValue placeholder="Selecione um professor padrão" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Nenhum (Livre)</SelectItem>
                                        {teachers.map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                {teacher.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc">Descrição / Requisitos (Opcional)</Label>
                                <Input
                                    id="desc"
                                    placeholder="Ex: Necessário instrumento próprio"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <SheetFooter className="pt-6 border-t border-border mt-6 flex justify-end gap-2">
                            <Button variant="outline" type="button" className="h-11 px-6" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="h-11 px-8 font-bold" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Salvar Curso
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Edit Modal */}
            <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto" side="right">
                    <SheetHeader className="pb-6">
                        <SheetTitle className="text-2xl font-bold">Editar Matéria</SheetTitle>
                    </SheetHeader>
                    <form onSubmit={(e) => handleSubmit(e, true)}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Nome da Matéria</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-price">Mensalidade (R$/mês)</Label>
                                    <Input
                                        id="edit-price"
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-days">Dias Sugeridos</Label>
                                    <Input
                                        id="edit-days"
                                        placeholder="Ex: Seg, Qua"
                                        value={formData.days_of_week}
                                        onChange={(e) => setFormData({ ...formData, days_of_week: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-teacher">Professor Sugerido</Label>
                                <Select
                                    value={formData.teacher_id}
                                    onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                                >
                                    <SelectTrigger id="edit-teacher">
                                        <SelectValue placeholder="Selecione um professor padrão" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Nenhum (Livre)</SelectItem>
                                        {teachers.map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                {teacher.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-desc">Descrição</Label>
                                <Input
                                    id="edit-desc"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <SheetFooter className="pt-6 border-t border-border mt-6 flex justify-end gap-2">
                            <Button variant="outline" type="button" className="h-11 px-6" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="h-11 px-8 font-bold" disabled={updateMutation.isPending}>
                                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Salvar Alterações
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Delete Dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir do Catálogo?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Isso removerá a matéria do catálogo de ofertas. Alunos já vinculados continuarão matriculados, mas não será possível criar novas execuções (Turmas/Agenda) para este curso.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirmar Exclusão
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </MainLayout >
    );
}
