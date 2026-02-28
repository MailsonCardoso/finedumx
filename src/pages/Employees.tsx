import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetDescription,
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
import { Plus, Search, Filter, UserX, Loader2, Pencil, Trash2, Users, Briefcase, UserPlus, Phone, Mail, DollarSign, CalendarDays, User, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

interface Employee {
    id: number;
    name: string;
    email: string;
    cpf?: string;
    phone: string;
    role: string; // cargo
    department: string; // departamento
    hire_date: string; // data de admissão
    salary: number;
    status: string;
    payment_day?: number;
    is_teacher?: boolean;
}

interface EmployeeFormData {
    name: string;
    email: string;
    cpf?: string;
    phone: string;
    role: string;
    department: string;
    hire_date: string;
    salary: number | string;
    status: string;
    payment_day: number | string;
    is_teacher: boolean;
}

const initialFormData: EmployeeFormData = {
    name: "",
    email: "",
    cpf: "",
    phone: "",
    role: "",
    department: "",
    hire_date: new Date().toISOString().split('T')[0],
    salary: "",
    status: "ativo",
    payment_day: 5,
    is_teacher: false,
};

export default function Employees() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");
    const queryClient = useQueryClient();

    // Modal States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // Form State
    const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);

    // Queries
    const { data: employeesData = [], isLoading } = useQuery<Employee[]>({
        queryKey: ['employees', searchTerm, statusFilter],
        queryFn: () => apiFetch(`/employees?search=${searchTerm}&status=${statusFilter}`),
    });

    // Sort: Active employees first
    const sortedEmployees = [...employeesData].sort((a, b) => {
        if (a.status === 'ativo' && b.status !== 'ativo') return -1;
        if (a.status !== 'ativo' && b.status === 'ativo') return 1;
        return 0;
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: EmployeeFormData) =>
            apiFetch('/employees', {
                method: 'POST',
                body: JSON.stringify(data)
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success("Funcionário cadastrado com sucesso!");
            setIsAddOpen(false);
            setFormData(initialFormData);
        },
        onError: (error: any) => {
            toast.error(error.message || "Erro ao cadastrar funcionário");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: EmployeeFormData }) =>
            apiFetch(`/employees/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success("Funcionário atualizado com sucesso!");
            setIsEditOpen(false);
            setSelectedEmployee(null);
        },
        onError: (error: any) => {
            toast.error(error.message || "Erro ao atualizar funcionário");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) =>
            apiFetch(`/employees/${id}`, {
                method: 'DELETE'
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success("Funcionário removido com sucesso!");
            setIsDeleteOpen(false);
            setSelectedEmployee(null);
        },
        onError: (error: any) => {
            toast.error(error.message || "Erro ao remover funcionário");
        }
    });

    // Handlers
    const handleEditClick = (employee: Employee) => {
        setSelectedEmployee(employee);
        setFormData({
            name: employee.name,
            email: employee.email,
            cpf: employee.cpf || "",
            phone: employee.phone,
            role: employee.role,
            department: employee.department,
            hire_date: employee.hire_date,
            salary: employee.salary,
            status: employee.status,
            payment_day: employee.payment_day || 5,
            is_teacher: employee.is_teacher || false,
        });
        setIsEditOpen(true);
    };

    const handleDeleteClick = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsDeleteOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditOpen && selectedEmployee) {
            updateMutation.mutate({
                id: selectedEmployee.id,
                data: {
                    ...formData,
                    salary: formData.salary === "" ? 0 : parseFloat(formData.salary.toString())
                }
            });
        } else {
            createMutation.mutate({
                ...formData,
                salary: formData.salary === "" ? 0 : parseFloat(formData.salary.toString()),
                payment_day: formData.payment_day === "" ? 5 : parseInt(formData.payment_day.toString())
            });
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString + 'T12:00:00').toLocaleDateString('pt-BR');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ativo":
                return <StatusBadge status="success">Ativo</StatusBadge>;
            case "inativo":
                return <StatusBadge status="neutral">Inativo</StatusBadge>;
            case "ferias":
                return <StatusBadge status="warning">Férias</StatusBadge>;
            case "afastado":
                return <StatusBadge status="danger">Afastado</StatusBadge>;
            default:
                return <StatusBadge status="neutral">{status}</StatusBadge>;
        }
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
                            <Briefcase className="w-8 h-8 text-primary" />
                            Funcionários
                        </h1>
                        <p className="text-muted-foreground mt-1 text-lg">
                            Gerencie a equipe de funcionários e colaboradores da escola.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setFormData(initialFormData);
                            setIsEditOpen(false);
                            setIsAddOpen(true);
                        }}
                        className="gap-2 shadow-lg shadow-primary/20 h-11 px-6"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Funcionário
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
                            placeholder="Buscar funcionário por nome..."
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
                            <SelectItem value="ferias">Férias</SelectItem>
                            <SelectItem value="afastado">Afastado</SelectItem>
                        </SelectContent>
                    </Select>
                </motion.div>

                {/* Table */}
                {/* Grid of Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-[320px] bg-card rounded-[24px] border border-border/50 animate-pulse" />
                        ))
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {sortedEmployees.map((employee, i) => (
                                <motion.div
                                    key={employee.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-card rounded-[24px] shadow-sm hover:shadow-lg transition-all border border-border/40 overflow-hidden relative flex flex-col group"
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
                                                <DropdownMenuItem onClick={() => handleEditClick(employee)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteClick(employee)}>
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
                                                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-lg font-bold text-primary-foreground shrink-0 shadow-lg shadow-primary/20">
                                                    {employee.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
                                                    <h3 className="font-bold text-foreground leading-tight truncate w-full pr-6" title={employee.name}>
                                                        {employee.name}
                                                    </h3>
                                                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground hover:bg-muted px-2 py-0.5 h-auto">
                                                        {employee.role}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Body Information */}
                                        <div className="space-y-3 mt-2">
                                            {/* Email */}
                                            <div className="bg-muted/30 rounded-full px-4 py-2.5 flex items-center gap-3 text-sm text-foreground/70">
                                                <Mail className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                                                <span className="truncate text-xs">{employee.email}</span>
                                            </div>

                                            {/* Phone */}
                                            <div className="bg-muted/30 rounded-full px-4 py-2.5 flex items-center gap-3 text-sm text-foreground/70">
                                                <Phone className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                                                <span className="truncate text-xs">{employee.phone}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 space-y-4">
                                            {/* Footer: Date & Status */}
                                            <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                                                {/* Status Badge Customization to fit card */}
                                                <div className="scale-90 origin-left">
                                                    {getStatusBadge(employee.status)}
                                                </div>
                                                <div className="flex items-center gap-1.5 opacity-70">
                                                    <CalendarDays className="w-3.5 h-3.5" />
                                                    <span>Admissão: {formatDate(employee.hire_date)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {!isLoading && sortedEmployees.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-16 text-center flex flex-col items-center gap-4 border border-dashed border-border rounded-xl bg-card/50"
                    >
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            <UserX className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-foreground">Nenhum funcionário encontrado</h3>
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

                {/* Add/Edit Modal */}
                <Sheet open={isAddOpen || isEditOpen} onOpenChange={(open) => { if (!open) { setIsAddOpen(false); setIsEditOpen(false); } }}>
                    <SheetContent className="w-full sm:max-w-2xl overflow-y-auto" side="right">
                        <SheetHeader className="pb-8">
                            <SheetTitle className="text-2xl font-bold">{isEditOpen ? "Editar Funcionário" : "Novo Funcionário"}</SheetTitle>
                            <SheetDescription>Preencha os dados profissionais e de contato abaixo.</SheetDescription>
                        </SheetHeader>


                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                {/* Nome e Status */}
                                <div className="space-y-2 col-span-1">
                                    <Label htmlFor="name" className="text-sm font-medium">Nome Completo</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Nome do funcionário"
                                            className="h-10 pl-9 bg-background focus:ring-1 focus:ring-primary transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 col-span-1">
                                    <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                                    <Select
                                        value={formData.status || "ativo"}
                                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                                    >
                                        <SelectTrigger className="h-10 bg-background focus:ring-1 focus:ring-primary transition-all">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ativo">Ativo</SelectItem>
                                            <SelectItem value="inativo">Inativo</SelectItem>
                                            <SelectItem value="ferias">Férias</SelectItem>
                                            <SelectItem value="afastado">Afastado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* CPF, Contato */}
                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cpf" className="text-sm font-medium">CPF</Label>
                                        <Input
                                            id="cpf"
                                            value={formData.cpf}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                let masked = value;
                                                if (value.length > 0) masked = value.substring(0, 3);
                                                if (value.length >= 4) masked += '.' + value.substring(3, 6);
                                                if (value.length >= 7) masked += '.' + value.substring(6, 9);
                                                if (value.length >= 10) masked += '-' + value.substring(9, 11);
                                                setFormData({ ...formData, cpf: masked });
                                            }}
                                            placeholder="000.000.000-00"
                                            className="h-10 bg-background focus:ring-1 focus:ring-primary transition-all"
                                            maxLength={14}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-medium">Contato</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    let masked = value;
                                                    if (value.length > 0) masked = '(' + value.substring(0, 2);
                                                    if (value.length >= 3) masked += ') ' + value.substring(2, 7);
                                                    if (value.length >= 8) masked += '-' + value.substring(7, 11);
                                                    setFormData({ ...formData, phone: masked });
                                                }}
                                                placeholder="(00) 00000-0000"
                                                className="h-10 pl-8 bg-background focus:ring-1 focus:ring-primary transition-all"
                                                maxLength={15}
                                            />
                                        </div>
                                    </div>
                                    {/* Campos Ocultos para os valores defaults */}
                                    <input type="hidden" name="salary" value={formData.salary} />
                                    <input type="hidden" name="payment_day" value={formData.payment_day} />
                                </div>

                                {/* Email e Disponibilidade */}
                                <div className="col-span-1 space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">Email Acadêmico / Acesso</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="email@escola.com"
                                            className="h-10 pl-9 bg-background focus:ring-1 focus:ring-primary transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-span-1">
                                    <div className="bg-muted/30 border border-border rounded-xl p-3 flex items-center justify-between h-[74px] mt-6">
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">Disponível para dar aulas</p>
                                            <p className="text-[10px] text-muted-foreground leading-tight">Habilita aparecimento na lista de professores.</p>
                                        </div>
                                        <Checkbox
                                            id="is_teacher"
                                            checked={formData.is_teacher}
                                            onCheckedChange={(checked) => setFormData({ ...formData, is_teacher: !!checked })}
                                            className="w-5 h-5 rounded-full border-2"
                                        />
                                    </div>
                                </div>

                                {/* Cargo */}
                                <div className="col-span-1 space-y-2 -mt-2">
                                    <Label htmlFor="role" className="text-sm font-medium">Cargo</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                                    >
                                        <SelectTrigger className="h-10 bg-background focus:ring-1 focus:ring-primary transition-all">
                                            <SelectValue placeholder="Selecione o cargo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Administrativo">Administrativo</SelectItem>
                                            <SelectItem value="Financeiro">Financeiro</SelectItem>
                                            <SelectItem value="Secretaria">Secretaria</SelectItem>
                                            <SelectItem value="Professor">Professor</SelectItem>
                                            <SelectItem value="Professora">Professora</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <SheetFooter className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-8">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                                    className="h-11 px-6 font-medium"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="h-11 px-8 font-bold"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isEditOpen ? "Salvar Alterações" : "Cadastrar"}
                                </Button>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>

                {/* Delete Alert */}
                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o funcionário
                                <span className="font-bold text-foreground"> {selectedEmployee?.name} </span>
                                e todos os seus dados associados.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => selectedEmployee && deleteMutation.mutate(selectedEmployee.id)}
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
