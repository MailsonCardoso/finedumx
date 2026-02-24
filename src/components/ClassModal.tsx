import React, { useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
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
import { Loader2, Trash2, AlertTriangle, GraduationCap, CalendarDays, Users, CheckCircle2 } from "lucide-react";
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
                generate_appointments: false,
                generate_type: "future",
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

    const { data: conflictData } = useQuery({
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
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-3xl overflow-y-auto" side="right">
                <SheetHeader className="pb-8">
                    <SheetTitle className="text-2xl font-bold">{isEditing ? "Editar Turma" : "Nova Turma"}</SheetTitle>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Coluna 1: Dados da Turma */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                                <GraduationCap className="h-4 w-4 text-blue-600" />
                                Dados da Turma
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-muted-foreground">Nome da Turma</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Teclado Manhã"
                                        className="h-10 bg-muted/20 border-border/50"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-muted-foreground">Instrumento / Matéria</Label>
                                        <Select
                                            value={formData.course_id}
                                            onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                                        >
                                            <SelectTrigger className="h-10 bg-muted/20 border-border/50">
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courses.map((course: any) => (
                                                    <SelectItem key={course.id} value={course.id.toString()}>{course.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-muted-foreground">Professor</Label>
                                        <Select
                                            value={formData.teacher_id}
                                            onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                                        >
                                            <SelectTrigger className="h-10 bg-muted/20 border-border/50">
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teachers.map((teacher: any) => (
                                                    <SelectItem key={teacher.id} value={teacher.id.toString()}>{teacher.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-muted-foreground">Turno</Label>
                                        <Select
                                            value={formData.shift}
                                            onValueChange={(value) => setFormData({ ...formData, shift: value })}
                                        >
                                            <SelectTrigger className="h-10 bg-muted/20 border-border/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="manha">Manhã</SelectItem>
                                                <SelectItem value="tarde">Tarde</SelectItem>
                                                <SelectItem value="noite">Noite</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-muted-foreground">Capacidade</Label>
                                        <Input
                                            type="number"
                                            value={formData.max_students}
                                            onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                                            className="h-10 bg-muted/20 border-border/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-border/30 space-y-3">
                                <Label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" />
                                    Alunos Integrantes ({formData.student_ids.length})
                                </Label>

                                <Select
                                    onValueChange={(val) => {
                                        const id = parseInt(val);
                                        if (!formData.student_ids.includes(id)) {
                                            setFormData({ ...formData, student_ids: [...formData.student_ids, id] });
                                        }
                                    }}
                                    disabled={!formData.course_id}
                                >
                                    <SelectTrigger className="h-9 bg-muted/10 border-border/50">
                                        <SelectValue placeholder={formData.course_id ? "Adicionar aluno..." : "Selecione o instrumento"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students
                                            .filter((s: any) => s.course_id?.toString() === formData.course_id && !formData.student_ids.includes(s.id))
                                            .map((s: any) => (
                                                <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>

                                <div className="h-24 p-2 rounded-lg bg-muted/5 border border-border/30 overflow-y-auto">
                                    <div className="flex flex-wrap gap-1.5">
                                        <AnimatePresence>
                                            {formData.student_ids.map((id: number) => {
                                                const student = students.find((s: any) => s.id === id);
                                                return (
                                                    <motion.div
                                                        key={id}
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.9, opacity: 0 }}
                                                        className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold"
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
                                                            <Trash2 className="w-2.5 h-2.5" />
                                                        </button>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                        {formData.student_ids.length === 0 && (
                                            <p className="text-muted-foreground/30 text-[10px] italic p-1">Nenhum aluno no grupo.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Coluna 2: Agenda */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                                <CalendarDays className="h-4 w-4 text-emerald-600" />
                                Agenda e Horário
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground italic">Dias de Aula</Label>
                                    <div className="flex flex-wrap gap-1.5">
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
                                                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                                        ${isChecked
                                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                                                            : "bg-muted/10 text-muted-foreground border-2 border-dashed border-border"
                                                        }
                                                    `}
                                                >
                                                    {day.short}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-muted-foreground">Horário de Início</Label>
                                        <Input
                                            type="time"
                                            value={formData.start_time}
                                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                            className="h-10 bg-muted/20 border-border/50"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold text-muted-foreground">Horário de Término</Label>
                                        <Input
                                            type="time"
                                            value={formData.end_time}
                                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                            className="h-10 bg-muted/20 border-border/50"
                                        />
                                    </div>
                                </div>

                                {/* Sync Block Styled like the reference image */}
                                <div className="bg-primary/[0.03] p-4 rounded-2xl border border-primary/10 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-0.5 rounded-full bg-primary/10">
                                            <CheckCircle2 className="h-5 w-5 text-primary" />
                                        </div>
                                        <Label className="font-bold text-sm text-primary">
                                            Sincronizar e Replicar para Agenda
                                        </Label>
                                    </div>

                                    <RadioGroup
                                        value={formData.generate_type}
                                        onValueChange={(val) => {
                                            setFormData({
                                                ...formData,
                                                generate_type: val,
                                                generate_appointments: true // Check it automatically if user clicks options
                                            });
                                        }}
                                        className="pl-8 flex flex-col gap-3"
                                    >
                                        <div className="flex items-center space-x-2.5">
                                            <RadioGroupItem value="future" id="r-future" className="text-primary border-primary/50" />
                                            <Label htmlFor="r-future" className="text-xs font-medium cursor-pointer text-foreground/80">Hoje em diante</Label>
                                        </div>
                                        <div className="flex items-center space-x-2.5">
                                            <RadioGroupItem value="all" id="r-all" className="text-destructive border-destructive/50" />
                                            <Label htmlFor="r-all" className="text-xs font-medium cursor-pointer text-destructive">Refazer tudo</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {conflictData?.has_conflicts && (
                                    <Alert variant="destructive" className="bg-destructive/5 text-[10px] py-1.5 h-auto">
                                        <AlertTriangle className="h-3 w-3" />
                                        <AlertDescription className="font-medium leading-none">
                                            Conflitos de horário detectados para este professor.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-10 px-6 text-sm font-medium">Cancelar</Button>
                        <Button type="submit" disabled={mutation.isPending} className="h-10 px-8 font-bold shadow-lg shadow-primary/20 bg-primary text-primary-foreground">
                            {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Salvar Turma
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
