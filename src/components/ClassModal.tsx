import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ClassModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    classItem?: any;
    defaultCourseId?: string;
}

const initialFormData = {
    name: "",
    course_id: "",
    teacher_id: "",
    shift: "manha",
    start_time: "08:00",
    end_time: "12:00",
    days_of_week: "",
    max_students: 30,
    room: "",
    status: "ativo",
    student_ids: [],
};

export function ClassModal({ isOpen, onOpenChange, classItem, defaultCourseId }: ClassModalProps) {
    const queryClient = useQueryClient();
    const isEditing = !!classItem && classItem.id !== undefined;
    const [formData, setFormData] = useState<any>(initialFormData);

    useEffect(() => {
        if (classItem) {
            setFormData({
                name: classItem.name,
                course_id: classItem.course_id.toString(),
                teacher_id: classItem.teacher_id?.toString() || "",
                shift: classItem.shift,
                start_time: classItem.start_time,
                end_time: classItem.end_time,
                days_of_week: classItem.days_of_week,
                max_students: classItem.max_students,
                room: classItem.room || "",
                status: classItem.status,
                student_ids: classItem.student_ids || [],
            });
        } else {
            setFormData({
                ...initialFormData,
                course_id: defaultCourseId || "",
            });
        }
    }, [classItem, defaultCourseId, isOpen]);

    const { data: courses = [] } = useQuery({
        queryKey: ['courses'],
        queryFn: () => apiFetch<any[]>('/courses'),
        enabled: isOpen,
    });

    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: () => apiFetch<any[]>('/employees'),
        enabled: isOpen,
    });

    const { data: students = [] } = useQuery({
        queryKey: ['students'],
        queryFn: () => apiFetch<any[]>('/students'),
        enabled: isOpen,
    });

    const teachers = employees.filter(emp => emp.is_teacher && emp.status === 'ativo');

    const mutation = useMutation({
        mutationFn: (data: any) => {
            const url = isEditing ? `/classes/${classItem.id}` : "/classes";
            const method = isEditing ? "PUT" : "POST";
            return apiFetch(url, {
                method,
                body: JSON.stringify(data),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            toast.success(isEditing ? "Turma atualizada!" : "Turma criada!");
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(error.message || "Erro ao salvar turma");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            ...formData,
            max_students: parseInt(formData.max_students.toString())
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Turma" : "Nova Turma"}</DialogTitle>
                    <DialogDescription>Configure os detalhes da aula coletiva.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome da Turma</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Teoria Musical I"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Instrumento / Matéria</Label>
                                <Select
                                    value={formData.course_id}
                                    onValueChange={(value) => {
                                        const course = courses.find(c => c.id.toString() === value);
                                        const filteredStudents = students.filter(s => s.course === course?.name);
                                        setFormData({
                                            ...formData,
                                            course_id: value,
                                            student_ids: filteredStudents.map(s => s.id)
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o curso" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id} value={course.id.toString()}>{course.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Professor Responsável</Label>
                                <Select
                                    value={formData.teacher_id}
                                    onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o professor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.id.toString()}>{teacher.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Turno</Label>
                                    <Select
                                        value={formData.shift}
                                        onValueChange={(value) => setFormData({ ...formData, shift: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manha">Manhã</SelectItem>
                                            <SelectItem value="tarde">Tarde</SelectItem>
                                            <SelectItem value="noite">Noite</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Capacidade</Label>
                                    <Input
                                        type="number"
                                        value={formData.max_students}
                                        onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Alunos Integrantes</Label>
                                <div className="h-[200px] p-3 rounded-xl bg-muted/10 border border-border flex flex-col gap-2 overflow-y-auto">
                                    <div className="flex flex-wrap gap-1.5">
                                        <AnimatePresence>
                                            {formData.student_ids.map((id: number) => {
                                                const student = students.find(s => s.id === id);
                                                return (
                                                    <motion.div
                                                        key={id}
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.9, opacity: 0 }}
                                                        className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold"
                                                    >
                                                        {student?.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({
                                                                ...formData,
                                                                student_ids: formData.student_ids.filter((sid: number) => sid !== id)
                                                            })}
                                                            className="hover:bg-primary/20 rounded-full p-0.5"
                                                        >
                                                            <Trash2 className="w-2.5 h-2.5" />
                                                        </button>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                        {formData.student_ids.length === 0 && (
                                            <p className="text-muted-foreground/50 text-xs italic">Lista vazia.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Dias e Sala</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        placeholder="Dias: Seg, Qua"
                                        value={formData.days_of_week}
                                        onChange={(e) => setFormData({ ...formData, days_of_week: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Sala"
                                        value={formData.room}
                                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Horário</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="time"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    />
                                    <Input
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Salvar Turma
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
