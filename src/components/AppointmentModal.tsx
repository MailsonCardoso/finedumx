import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
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

const appointmentSchema = z.object({
    type: z.enum(["individual", "grupo"]),
    student_id: z.string().optional(),
    school_class_id: z.string().optional(),
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
            reset({
                type: appointment.type,
                student_id: appointment.student_id?.toString(),
                school_class_id: appointment.school_class_id?.toString(),
                date: appointment.date,
                start_time: appointment.start_time,
                duration: appointment.duration,
                status: appointment.status,
                notes: appointment.notes || "",
            });
        } else {
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

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes da aula ou reunião abaixo.
                    </DialogDescription>
                </DialogHeader>

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
                        <div className="space-y-2">
                            <Label>Aluno</Label>
                            <Select
                                value={watch("student_id")}
                                onValueChange={(val) => setValue("student_id", val)}
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
                    ) : (
                        <div className="space-y-2">
                            <Label>Turma</Label>
                            <Select
                                value={watch("school_class_id")}
                                onValueChange={(val) => setValue("school_class_id", val)}
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

                    <DialogFooter className="flex-row justify-between items-center sm:justify-between">
                        {isEditing ? (
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 px-2"
                                onClick={() => setIsDeleteDialogOpen(true)}
                                disabled={deleteMutation.isPending}
                            >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                            </Button>
                        ) : (
                            <div /> /* Spacer */
                        )}
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? "Salvar Alterações" : "Agendar"}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Agendamento?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O agendamento será removido permanentemente da agenda.
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
        </Dialog>
    );
}
