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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-2 border-b">
                    <DialogTitle className="text-xl font-bold">{isEditing ? "Editar Turma" : "Nova Turma"}</DialogTitle>
                    <DialogDescription>Configure os detalhes e horários da aula coletiva.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-4">
                        {/* Coluna da Esquerda: Informações Básicas e Horário (7 colunas) */}
                        <div className="md:col-span-7 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome da Turma</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Teoria Musical I"
                                        className="h-9"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Instrumento / Matéria</Label>
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
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Selecione o curso" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((course) => (
                                                <SelectItem key={course.id} value={course.id.toString()}>{course.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Professor Responsável</Label>
                                    <Select
                                        value={formData.teacher_id}
                                        onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Selecione o professor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.id.toString()}>{teacher.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Turno</Label>
                                        <Select
                                            value={formData.shift}
                                            onValueChange={(value) => setFormData({ ...formData, shift: value })}
                                        >
                                            <SelectTrigger className="h-9 px-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="manha">Manhã</SelectItem>
                                                <SelectItem value="tarde">Tarde</SelectItem>
                                                <SelectItem value="noite">Noite</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capacidade</Label>
                                        <Input
                                            type="number"
                                            value={formData.max_students}
                                            onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-xl space-y-4 border border-border/50">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-bold flex items-center gap-2">
                                        <CalendarRange className="w-4 h-4 text-primary" />
                                        Agenda e Horário
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="time"
                                                value={formData.start_time}
                                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                                className="h-8 w-24 text-center text-xs p-1"
                                            />
                                            <span className="text-muted-foreground">às</span>
                                            <Input
                                                type="time"
                                                value={formData.end_time}
                                                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                                className="h-8 w-24 text-center text-xs p-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-1">
                                    {[
                                        { full: 'Segunda', short: 'Seg' },
                                        { full: 'Terça', short: 'Ter' },
                                        { full: 'Quarta', short: 'Qua' },
                                        { full: 'Quinta', short: 'Qui' },
                                        { full: 'Sexta', short: 'Sex' },
                                        { full: 'Sábado', short: 'Sab' },
                                        { full: 'Domingo', short: 'Dom' }
                                    ].map((day) => {
                                        const days = formData.days_of_week ? formData.days_of_week.split(', ') : [];
                                        const isChecked = days.includes(day.full);
                                        return (
                                            <button
                                                key={day.full}
                                                type="button"
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
                                                    flex-1 h-8 rounded-md flex items-center justify-center text-[11px] font-bold transition-all duration-200 border
                                                    ${isChecked
                                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                        : "bg-background text-muted-foreground border-input hover:border-primary/50"
                                                    }
                                                `}
                                            >
                                                {day.short}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {!isEditing ? (
                                <div className="flex items-center gap-3 bg-primary/5 p-3 rounded-xl border border-primary/10">
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
                                            Cria as aulas na agenda para todos os selecionados até 31/12/2026.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 bg-muted/20 p-3 rounded-xl border border-border/50">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="generate_appointments"
                                            checked={formData.generate_appointments}
                                            onCheckedChange={(checked) => setFormData({ ...formData, generate_appointments: !!checked })}
                                        />
                                        <Label htmlFor="generate_appointments" className="text-xs font-bold cursor-pointer">
                                            Sincronizar e Replicar para Agenda
                                        </Label>
                                    </div>

                                    {formData.generate_appointments && (
                                        <div className="pl-6 space-y-2 pt-1">
                                            <RadioGroup
                                                value={formData.generate_type}
                                                onValueChange={(val) => setFormData({ ...formData, generate_type: val })}
                                                className="flex gap-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="future" id="r-future" />
                                                    <Label htmlFor="r-future" className="text-[10px] font-medium cursor-pointer flex items-center gap-1.5">
                                                        Somente Futuras
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="all" id="r-all" />
                                                    <Label htmlFor="r-all" className="text-[10px] font-medium cursor-pointer flex items-center gap-1.5 text-destructive">
                                                        Refazer Tudo
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    )}
                                </div>
                            )}

                            {conflictData?.has_conflicts && (
                                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive py-2 px-3">
                                    <AlertTriangle className="h-3 w-3" />
                                    <AlertTitle className="text-[10px] font-bold">Conflito detectado!</AlertTitle>
                                    <AlertDescription className="text-[9px] leading-tight opacity-90">
                                        {conflictData.conflicts.map((c: any, i: number) => (
                                            <div key={i}>• Já possui a turma <b>{c.class_name}</b> às <b>{c.time}</b>.</div>
                                        ))}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Coluna da Direita: Alunos (5 colunas) */}
                        <div className="md:col-span-5 flex flex-col h-full">
                            <div className="space-y-4 flex flex-col h-full">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Alunos Integrantes ({formData.student_ids.length})
                                    </Label>
                                    {formData.course_id && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-[10px] h-6 px-2 text-primary hover:bg-primary/10"
                                            onClick={() => {
                                                const courseStudents = students.filter(s => s.course_id?.toString() === formData.course_id);
                                                const allIds = courseStudents.map(s => s.id);
                                                const newIds = Array.from(new Set([...formData.student_ids, ...allIds]));
                                                setFormData({ ...formData, student_ids: newIds });
                                            }}
                                        >
                                            + Todos
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
            </DialogContent>
        </DialogContent>
        </Dialog >
    );
}
