import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit2, Trash2, Loader2, BookOpen, User } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";

interface Course {
    id: number;
    name: string;
    price: number;
    description?: string;
    teacher_id?: number | string;
    teacher_name?: string;
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
    const [formData, setFormData] = useState({ name: "", price: "", description: "", teacher_id: "" });

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
            setFormData({ name: "", price: "", description: "", teacher_id: "" });
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
            price: formData.price === "" ? 0 : parseFloat(formData.price)
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
            teacher_id: course.teacher_id?.toString() || ""
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
                            Gerencie as opções de cursos e modalidades.
                        </p>
                    </div>
                    <Button onClick={() => setIsAddOpen(true)} className="gap-2 shadow-lg shadow-primary/20 h-11 px-6">
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
                            placeholder="Buscar curso..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary"
                        />
                    </div>
                </motion.div>

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
                                    <TableHead className="font-bold h-14 text-foreground">Nome do Curso</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground">Professor Responsável</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground text-right">Valor Padrão</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground text-right pr-6">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="text-muted-foreground">Carregando cursos...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <AnimatePresence mode="popLayout">
                                        {filteredCourses.map((course, i) => (
                                            <motion.tr
                                                key={course.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="group border-b border-border/40 hover:bg-primary/5 transition-colors"
                                            >
                                                <TableCell className="py-4 font-medium text-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-primary/70" />
                                                        {course.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 text-muted-foreground">
                                                    {course.teacher_name ? (
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-3.5 h-3.5" />
                                                            {course.teacher_name}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground/50 italic">Não associado</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-4 text-right">
                                                    {new Intl.NumberFormat("pt-BR", {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    }).format(course.price)}
                                                </TableCell>
                                                <TableCell className="py-4 text-right pr-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openEdit(course)}>
                                                            <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => openDelete(course)}>
                                                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                        {!isLoading && filteredCourses.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={2} className="h-32 text-center text-muted-foreground">
                                                    Nenhum curso encontrado.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </AnimatePresence>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </motion.div>

                {/* Add Modal */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Novo Curso</DialogTitle>
                            <DialogDescription>Adicione uma nova modalidade ou curso.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => handleSubmit(e, false)}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome do Curso</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Valor Padrão</Label>
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
                                    <Label htmlFor="desc">Descrição (Opcional)</Label>
                                    <Input
                                        id="desc"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="teacher">Professor Responsável</Label>
                                    <Select
                                        value={formData.teacher_id}
                                        onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                                    >
                                        <SelectTrigger id="teacher">
                                            <SelectValue placeholder="Selecione um professor (opcional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Nenhum</SelectItem>
                                            {teachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                    {teacher.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground">Apenas funcionários habilitados para dar aula aparecem aqui.</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => { setIsAddOpen(false); setFormData({ name: "", price: "", description: "", teacher_id: "" }); }}>Cancelar</Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Salvar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Modal */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Curso</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => handleSubmit(e, true)}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Nome do Curso</Label>
                                    <Input
                                        id="edit-name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-price">Valor Padrão</Label>
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
                                    <Label htmlFor="edit-desc">Descrição</Label>
                                    <Input
                                        id="edit-desc"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-teacher">Professor Responsável</Label>
                                    <Select
                                        value={formData.teacher_id}
                                        onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                                    >
                                        <SelectTrigger id="edit-teacher">
                                            <SelectValue placeholder="Selecione um professor (opcional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Nenhum</SelectItem>
                                            {teachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                    {teacher.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Salvar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Dialog */}
                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o curso <b>{selectedCourse?.name}</b>.
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
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </MainLayout>
    );
}
