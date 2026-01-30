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
import { Loader2, Trash2, AlertTriangle, CalendarRange } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import {
    RadioGroup,
    RadioGroupItem
} from "@/components/ui/radio-group";

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
    generate_type: "future", // 'all' or 'future'
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

    // Conflict Check
    const { data: conflictData, isFetching: isCheckingConflicts } = useQuery({
        queryKey: ['conflicts', formData.teacher_id, formData.days_of_week, formData.start_time, formData.end_time],
        queryFn: () => apiFetch<any>('/classes/check-conflicts', {
            method: 'POST',
            body: JSON.stringify({
                teacher_id: formData.teacher_id,
                days_of_week: formData.days_of_week,
                start_time: formData.start_time,
                end_time: formData.end_time,
                exclude_class_id: isEditing ? classItem.id : undefined
            })
        }),
        enabled: !!(formData.teacher_id && formData.days_of_week && formData.start_time && formData.end_time) && isOpen,
        staleTime: 5000
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
            <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 border-none shadow-2xl">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-bold text-foreground">{isEditing ? "Editar Turma" : "Nova Turma"}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">Preencha os dados abaixo para configurar a turma.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Coluna 1: Dados da Turma */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-foreground">Dados da Turma</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">Nome da Turma</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Teclado Manhã"
                                        className="h-11 bg-muted/20 border-border/50 focus:ring-primary/20 transition-all"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Instrumento / Matéria</Label>
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
                                            <SelectTrigger className="h-11 bg-muted/20 border-border/50">
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courses.map((course) => (
                                                    <SelectItem key={course.id} value={course.id.toString()}>{course.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Professor</Label>
                                        <Select
                                            value={formData.teacher_id}
                                            onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                                        >
                                            <SelectTrigger className="h-11 bg-muted/20 border-border/50">
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teachers.map((teacher) => (
                                                    <SelectItem key={teacher.id} value={teacher.id.toString()}>{teacher.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Turno</Label>
                                        <Select
                                            value={formData.shift}
                                            onValueChange={(value) => setFormData({ ...formData, shift: value })}
                                        >
                                            <SelectTrigger className="h-11 bg-muted/20 border-border/50">
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
                                        <Label className="text-sm font-medium text-muted-foreground">Capacidade</Label>
                                        <Input
                                            type="number"
                                            value={formData.max_students}
                                            onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                                            className="h-11 bg-muted/20 border-border/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/50">
                                <Label className="text-sm font-medium text-muted-foreground mb-3 block">Alunos Integrantes ({formData.student_ids.length})</Label>
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
                                        <SelectTrigger className="h-11 bg-muted/20 border-border/50">
                                            <SelectValue placeholder={formData.course_id ? "Adicionar aluno..." : "Selecione o curso"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students
                                                .filter(s => s.course_id?.toString() === formData.course_id && !formData.student_ids.includes(s.id))
                                                .map(s => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>

                                    <div className="h-[120px] p-3 rounded-xl bg-muted/10 border border-border/50 overflow-y-auto">
                                        <div className="flex flex-wrap gap-2">
                                            <AnimatePresence>
                                                {formData.student_ids.map((id: number) => {
                                                    const student = students.find(s => s.id === id);
                                                    return (
                                                        <motion.div
                                                            key={id}
                                                            initial={{ scale: 0.9, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            exit={{ scale: 0.9, opacity: 0 }}
                                                            className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full flex items-center gap-2 text-xs font-semibold"
                                                        >
                                                            {student?.name}
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({
                                                                    ...formData,
                                                                    student_ids: formData.student_ids.filter((sid: number) => sid !== id)
                                                                })}
                                                                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                            {formData.student_ids.length === 0 && (
                                                <p className="text-muted-foreground/40 text-xs italic py-2">Nenhum aluno selecionado.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coluna 2: Agenda e Sincronização */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <CalendarDays className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-foreground">Agenda e Horário</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium text-muted-foreground italic">Dias de Aula</Label>
                                    <div className="flex flex-wrap gap-2 py-1">
                                        {[
                                            { full: 'Segunda', short: 'S' },
                                            { full: 'Terça', short: 'T' },
                                            { full: 'Quarta', short: 'Q' },
                                            { full: 'Quinta', short: 'Q' },
                                            { full: 'Sexta', short: 'S' },
                                            { full: 'Sábado', short: 'S' },
                                            { full: 'Domingo', short: 'D' }
                                        ].map((day) => {
                                            const days = formData.days_of_week ? formData.days_of_week.split(', ') : [];
                                            const isChecked = days.includes(day.full);
                                            return (
                                                <button
                                                    key={day.full}
                                                    type="button"
                                                    title={day.full}
                                                    onClick={() => {
                                                        let newDays;
                                                        if (!isChecked) {
                                                            newDays = [...days, day.full];
                                                        } else {
                                                            newDays = days.filter(d => d !== day.full);
                                                        }
                                                        const weekOrder = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
                                                        newDays.sort((a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b));
                                                        setFormData({ ...formData, days_of_week: newDays.join(', ') });
                                                    }}
                                                    className={`
                                                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200
                                                        ${isChecked
                                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105 border-transparent"
                                                            : "bg-muted/10 text-muted-foreground border-2 border-dashed border-border/50 hover:border-primary/50 hover:text-primary"
                                                        }
                                                    `}
                                                >
                                                    {day.short}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Início</Label>
                                        <Input
                                            type="time"
                                            value={formData.start_time}
                                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                            className="h-11 bg-muted/20 border-border/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Fim</Label>
                                        <Input
                                            type="time"
                                            value={formData.end_time}
                                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                            className="h-11 bg-muted/20 border-border/50"
                                        />
                                    </div>
                                </div>

                                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            id="generate_appointments"
                                            checked={formData.generate_appointments}
                                            onCheckedChange={(checked) => setFormData({ ...formData, generate_appointments: !!checked })}
                                            className="h-5 w-5 data-[state=checked]:bg-primary"
                                        />
                                        <Label htmlFor="generate_appointments" className="font-bold text-sm text-primary cursor-pointer">
                                            Sincronizar e Replicar para Agenda
                                        </Label>
                                    </div>

                                    {formData.generate_appointments && (
                                        <div className="pl-8 space-y-3">
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Opções de Atualização</p>
                                            <RadioGroup
                                                value={formData.generate_type}
                                                onValueChange={(val) => setFormData({ ...formData, generate_type: val })}
                                                className="flex flex-col gap-3"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="future" id="r-future" />
                                                    <Label htmlFor="r-future" className="text-xs font-semibold cursor-pointer text-foreground/80">
                                                        Hoje em diante (Preserva realizados)
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <RadioGroupItem value="all" id="r-all" className="border-destructive text-destructive" />
                                                    <Label htmlFor="r-all" className="text-xs font-semibold cursor-pointer text-destructive/80">
                                                        Refazer tudo (Apaga e gera novas)
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    )}
                                </div>
                            </Button>
                                    )}
                        </div>

                        <Select
                            onValueChange={(val) => {
                                const id = parseInt(val);
                                if (!formData.student_ids.includes(id)) {
                                    setFormData({ ...formData, student_ids: [...formData.student_ids, id] });
                                }
                            }}
                            disabled={!formData.course_id}
                        >
                            <SelectTrigger className="h-9 bg-background">
                                <SelectValue placeholder={formData.course_id ? "Adicionar aluno..." : "Selecione o curso"} />
                            </SelectTrigger>
                            <SelectContent>
                                {students
                                    .filter(s => s.course_id?.toString() === formData.course_id && !formData.student_ids.includes(s.id))
                                    .map(s => (
                                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>

                        <div className="flex-1 min-h-[180px] md:min-h-0 md:h-[calc(100%-80px)] p-3 rounded-xl bg-muted/20 border border-border/50 overflow-y-auto">
                            <div className="grid grid-cols-1 gap-2">
                                <AnimatePresence>
                                    {formData.student_ids.map((id: number) => {
                                        const student = students.find(s => s.id === id);
                                        return (
                                            <motion.div
                                                key={id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="group bg-background border border-border/50 px-3 py-1.5 rounded-lg flex items-center justify-between text-xs"
                                            >
                                                <span className="font-medium truncate pr-2">{student?.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({
                                                        ...formData,
                                                        student_ids: formData.student_ids.filter((sid: number) => sid !== id)
                                                    })}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                {formData.student_ids.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center py-8 text-muted-foreground/40 italic text-[11px] gap-2">
                                        <Users className="w-8 h-8 opacity-20" />
                                        Nenhum aluno selecionado
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-2">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-9">Cancelar</Button>
                <Button type="submit" disabled={mutation.isPending} className="h-9 px-8 shadow-sm">
                    {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isEditing ? "Salvar Alterações" : "Criar Turma"}
                </Button>
            </div>
        </form>
            </DialogContent >
        </DialogContent >
        </Dialog >
    );
}
