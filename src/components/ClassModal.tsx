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
import { Checkbox } from "@/components/ui/checkbox";

interface ClassModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    classItem?: any;
    defaultCourseId?: string;
}

const initialFormData = {
    name: "",
    course_id: "",
    teacher_id: undefined as string | undefined,
    shift: "manha",
    start_time: "08:00",
    end_time: "12:00",
    days_of_week: "",
    max_students: 30,
    room: "",
    status: "ativo",
    student_ids: [],
    generate_appointments: false,
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
                teacher_id: classItem.teacher_id ? classItem.teacher_id.toString() : undefined,
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
                                        const filteredStudents = students.filter(s => s.course_id?.toString() === value);
                                        const newStudentIds = formData.student_ids.filter((id: number) =>
                                            filteredStudents.some(s => s.id === id)
                                        );
                                        setFormData({
                                            ...formData,
                                            course_id: value,
                                            student_ids: newStudentIds
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
                                <div className="space-y-3">
                                    <Select
                                        onValueChange={(val) => {
                                            const id = parseInt(val);
                                            if (!formData.student_ids.includes(id)) {
                                                setFormData({ ...formData, student_ids: [...formData.student_ids, id] });
                                            }
                                        }}
                                        disabled={!formData.course_id}
                                    >
                                        <SelectTrigger className="bg-background">
                                            <SelectValue placeholder={formData.course_id ? "Adicionar aluno matriculado..." : "Selecione um curso primeiro"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students
                                                .filter(s => s.course_id?.toString() === formData.course_id && !formData.student_ids.includes(s.id))
                                                .map(s => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                                ))
                                            }
                                            {students.filter(s => s.course_id?.toString() === formData.course_id && !formData.student_ids.includes(s.id)).length === 0 && (
                                                <div className="p-2 text-xs text-muted-foreground text-center">Nenhum aluno disponível para este curso.</div>
                                            )}
                                        </SelectContent>
                                    </Select>

                                    {formData.course_id && (
                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs h-7 text-primary hover:text-primary hover:bg-primary/10"
                                                onClick={() => {
                                                    const courseStudents = students.filter(s => s.course_id?.toString() === formData.course_id);
                                                    const allIds = courseStudents.map(s => s.id);
                                                    // Merge unique IDs
                                                    const newIds = Array.from(new Set([...formData.student_ids, ...allIds]));
                                                    setFormData({ ...formData, student_ids: newIds });
                                                }}
                                            >
                                                + Adicionar todos os {students.filter(s => s.course_id?.toString() === formData.course_id).length} alunos
                                            </Button>
                                        </div>
                                    )}

                                    <div className="h-[140px] p-3 rounded-xl bg-muted/10 border border-border flex flex-col gap-2 overflow-y-auto">
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
                                                <p className="text-muted-foreground/50 text-xs italic">Nenhum integrante selecionado.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Dias da Semana</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
                                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day) => {
                                        const days = formData.days_of_week ? formData.days_of_week.split(', ') : [];
                                        const isChecked = days.includes(day);
                                        return (
                                            <div key={day} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`day-${day}`}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => {
                                                        let newDays;
                                                        if (checked) {
                                                            newDays = [...days, day];
                                                        } else {
                                                            newDays = days.filter(d => d !== day);
                                                        }
                                                        // Sort by typical week order
                                                        const weekOrder = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
                                                        newDays.sort((a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b));
                                                        setFormData({ ...formData, days_of_week: newDays.join(', ') });
                                                    }}
                                                />
                                                <Label htmlFor={`day-${day}`} className="text-xs font-medium cursor-pointer">{day}</Label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Sala</Label>
                                <Input
                                    placeholder="Ex: Sala 01, Auditório..."
                                    value={formData.room}
                                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                />
                            </div>

                            {!isEditing && (
                                <div className="flex items-center gap-2 bg-primary/5 p-3 rounded-xl border border-primary/10">
                                    <Checkbox
                                        id="generate_appointments"
                                        checked={formData.generate_appointments}
                                        onCheckedChange={(checked) => setFormData({ ...formData, generate_appointments: !!checked })}
                                    />
                                    <div className="grid gap-1 leading-none">
                                        <Label htmlFor="generate_appointments" className="text-xs font-bold text-primary cursor-pointer">
                                            Gerar agenda automaticamente
                                        </Label>
                                        <p className="text-[10px] text-muted-foreground">
                                            Cria as aulas na agenda para todos os dias selecionados até 31/12/2026.
                                        </p>
                                    </div>
                                </div>
                            )}

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
