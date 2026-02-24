import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader2, Trash2, Calendar, Clock, User, BookOpen, GraduationCap, FileText, Pencil, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

const appointmentSchema = z.object({
    type: z.enum(["individual", "grupo"]),
    student_id: z.string().optional(),
    school_class_id: z.string().optional(),
    course_id: z.string().optional(),
    date: z.string().min(1, "Data é obrigatória"),
    start_time: z.string().min(1, "Horário de início é obrigatório"),
    duration: z.string().min(1, "Duração é obrigatória"),
    status: z.enum(["agendado", "realizado", "falta"]),
    notes: z.string().optional(),
}).refine((data) => {
    if (data.type === "individual" && !data.student_id) return false;
    if (data.type === "grupo" && !data.school_class_id) return false;
    return true;
}, {
    message: "Selecione o aluno ou a turma conforme o tipo",
    path: ["student_id"],
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    appointment?: any; // Para edição
}

export function AppointmentModal({ isOpen, onOpenChange, appointment }: AppointmentModalProps) {
    const queryClient = useQueryClient();
    const isEditing = !!appointment && appointment.id !== undefined;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Default to view mode if editing an existing appointment, otherwise edit mode
    const [isViewMode, setIsViewMode] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<AppointmentFormValues>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            type: "individual",
            status: "agendado",
            duration: "60",
            date: new Date().toISOString().split('T')[0],
        },
    });

    const selectedType = watch("type");

    useEffect(() => {
        if (appointment) {
            // Se appointment existe, é visualização
            if (appointment.id) setIsViewMode(true);
            else setIsViewMode(false); // Novo agendamento (clique na data vazia)

            reset({
                type: appointment.type,
                student_id: appointment.student_id?.toString(),
                school_class_id: appointment.school_class_id?.toString(),
                course_id: appointment.course_id?.toString(),
                date: appointment.date,
                start_time: appointment.start_time,
                duration: appointment.duration,
                status: appointment.status,
                notes: appointment.notes || "",
            });
        } else {
            setIsViewMode(false);
            reset({
                type: "individual",
                status: "agendado",
                duration: "60",
                date: new Date().toISOString().split('T')[0],
            });
        }
    }, [appointment, reset, isOpen]);

    // Queries para os seletores
    const { data: students = [] } = useQuery({
        queryKey: ["students"],
        queryFn: () => apiFetch<any[]>("/students"),
        enabled: isOpen,
    });

    const { data: classes = [] } = useQuery({
        queryKey: ["classes"],
        queryFn: () => apiFetch<any[]>("/classes"),
        enabled: isOpen,
    });

    const { data: courses = [] } = useQuery({
        queryKey: ["courses"],
        queryFn: () => apiFetch<any[]>("/courses"),
        enabled: isOpen,
    });

    const mutation = useMutation({
        mutationFn: (data: AppointmentFormValues) => {
            const url = isEditing ? `/appointments/${appointment.id}` : "/appointments";
            const method = isEditing ? "PUT" : "POST";
            return apiFetch(url, {
                method,
                body: JSON.stringify(data),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast.success(isEditing ? "Agendamento atualizado!" : "Agendamento criado!");
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(error.message || "Erro ao salvar agendamento");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => apiFetch(`/appointments/${appointment.id}`, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast.success("Agendamento excluído com sucesso!");
            setIsDeleteDialogOpen(false);
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(error.message || "Erro ao excluir agendamento");
        },
    });

    const onSubmit = (data: AppointmentFormValues) => {
        mutation.mutate(data);
    };

    // Helper functions for view mode
    const getStudentName = () => {
        const id = watch("student_id");
        return students.find(s => s.id.toString() === id)?.name || "N/A";
    };

    const getClassName = () => {
        const id = watch("school_class_id");
        return classes.find(c => c.id.toString() === id)?.name || "N/A";
    };

    const getCourseName = () => {
        const id = watch("course_id");
        return courses.find(c => c.id.toString() === id)?.name || "N/A";
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto" side="right">
                <SheetHeader className="pb-6">
                    <SheetTitle className="text-2xl font-bold">
                        {isViewMode ? "Detalhes do Agendamento" : (isEditing ? "Editar Agendamento" : "Novo Agendamento")}
                    </SheetTitle>
                    <SheetDescription>
                        {isViewMode ? "Visualize as informações abaixo." : "Preencha os detalhes da aula ou reunião abaixo."}
                    </SheetDescription>
                </SheetHeader>

                {isViewMode ? (
                    // VIEW MODE
                    <div className="space-y-6 py-2">
                        <div className="flex items-center justify-between">
                            <Badge
                                variant={watch("status") === "realizado" ? "default" : (watch("status") === "falta" ? "destructive" : "secondary")}
                                className="px-3 py-1 capitalize"
                            >
                                {watch("status")}
                            </Badge>
                            <Badge variant="outline" className="capitalize">{watch("type")}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> Data
                                </Label>
                                <p className="font-medium text-sm">
                                    {new Date(watch("date")).toLocaleDateString('pt-BR', { dateStyle: 'long' })}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> Horário
                                </Label>
                                <p className="font-medium text-sm">
                                    {watch("start_time")} ({watch("duration")} min)
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border/50">
                            {watch("type") === "individual" ? (
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" /> Aluno
                                    </Label>
                                    <p className="font-medium">{getStudentName()}</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <GraduationCap className="w-3.5 h-3.5" /> Turma
                                    </Label>
                                    <p className="font-medium">{getClassName()}</p>
                                </div>
                            )}

                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5" /> Matéria
                                </Label>
                                <p className="font-medium">{getCourseName()}</p>
                            </div>

                            {watch("notes") && (
                                <div className="space-y-1 bg-muted/20 p-3 rounded-md">
                                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                                        <FileText className="w-3.5 h-3.5" /> Observações
                                    </Label>
                                    <p className="text-sm italic text-foreground/80">{watch("notes")}</p>
                                </div>
                            )}
                        </div>

                        <SheetFooter className="flex-col sm:flex-row gap-2 pt-6 border-t border-border mt-6">
                            <Button
                                variant="outline"
                                className="w-full sm:flex-1 text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5 h-11"
                                onClick={() => setIsDeleteDialogOpen(true)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                            </Button>

                            <div className="flex gap-2 w-full sm:flex-1">
                                <Button variant="ghost" className="flex-1 h-11" onClick={() => onOpenChange(false)}>
                                    Fechar
                                </Button>
                                <Button className="flex-2 h-11 px-6" onClick={() => setIsViewMode(false)}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Editar
                                </Button>
                            </div>
                        </SheetFooter>
                    </div>
                ) : (
                    // EDIT MODE (Original Form)
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select
                                    value={selectedType}
                                    onValueChange={(val: any) => setValue("type", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="individual">Individual</SelectItem>
                                        <SelectItem value="grupo">Em Grupo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {selectedType === "individual" ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Aluno</Label>
                                    <Select
                                        value={watch("student_id")}
                                        onValueChange={(val) => {
                                            setValue("student_id", val);
                                            const student = students.find(s => s.id.toString() === val);
                                            if (student && student.course_id) {
                                                setValue("course_id", student.course_id.toString());
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o aluno" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((student) => (
                                                <SelectItem key={student.id} value={student.id.toString()}>
                                                    {student.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.student_id && (
                                        <p className="text-xs text-destructive">{errors.student_id.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Matéria / Disciplina</Label>
                                    <Select
                                        value={watch("course_id")}
                                        onValueChange={(val) => setValue("course_id", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a matéria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((course) => (
                                                <SelectItem key={course.id} value={course.id.toString()}>
                                                    {course.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Turma</Label>
                                    <Select
                                        value={watch("school_class_id")}
                                        onValueChange={(val) => {
                                            setValue("school_class_id", val);
                                            const cls = classes.find(c => c.id.toString() === val);
                                            if (cls && cls.course_id) {
                                                setValue("course_id", cls.course_id.toString());
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a turma" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map((cls) => (
                                                <SelectItem key={cls.id} value={cls.id.toString()}>
                                                    {cls.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Matéria (Vinculada à Turma)</Label>
                                    <Select
                                        value={watch("course_id")}
                                        disabled={true}
                                    >
                                        <SelectTrigger className="bg-muted">
                                            <SelectValue placeholder="Matéria da turma" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((course) => (
                                                <SelectItem key={course.id} value={course.id.toString()}>
                                                    {course.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Data</Label>
                                <Input type="date" {...register("date")} />
                                {errors.date && (
                                    <p className="text-xs text-destructive">{errors.date.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Hora Início</Label>
                                <Input type="time" {...register("start_time")} />
                                {errors.start_time && (
                                    <p className="text-xs text-destructive">{errors.start_time.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Duração (minutos)</Label>
                                <Input type="number" {...register("duration")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={watch("status")}
                                    onValueChange={(val: any) => setValue("status", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="agendado">Agendado</SelectItem>
                                        <SelectItem value="realizado">Realizado</SelectItem>
                                        <SelectItem value="falta">Falta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Notas/Observações</Label>
                            <Textarea
                                placeholder="Detalhes adicionais..."
                                {...register("notes")}
                                className="resize-none"
                            />
                        </div>

                        <SheetFooter className="flex-row justify-end items-center gap-2 pt-6 border-t border-border mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 px-6"
                                onClick={() => {
                                    if (appointment?.id) {
                                        setIsViewMode(true); // Return to view mode
                                    } else {
                                        onOpenChange(false); // Close
                                    }
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" className="h-11 px-8 font-bold" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? "Salvar Alterações" : "Agendar"}
                            </Button>
                        </SheetFooter>
                    </form>
                )}
            </SheetContent>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Agendamento?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                deleteMutation.mutate();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? "Excluindo..." : "Confirmar Exclusão"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Sheet>
    );
}
