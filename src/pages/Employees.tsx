import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
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
import { Plus, Search, Filter, UserX, Loader2, Pencil, Trash2, Users, Briefcase } from "lucide-react";
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
                salary: formData.salary === "" ? 0 : parseFloat(formData.salary.toString())
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border/50">
                                    <TableHead className="font-bold h-14 text-foreground">Nome</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground">Cargo</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground">Departamento</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground">Admissão</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground">Salário</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground">Status</TableHead>
                                    <TableHead className="font-bold h-14 text-foreground text-right pr-6">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="text-muted-foreground">Carregando funcionários...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <AnimatePresence mode="popLayout">
                                        {sortedEmployees.map((employee, i) => (
                                            <motion.tr
                                                key={employee.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="group border-b border-border/40 hover:bg-primary/5 transition-colors"
                                            >
                                                <TableCell className="py-4 font-semibold text-foreground">
                                                    <div className="flex flex-col">
                                                        <span>{employee.name}</span>
                                                        <span className="text-xs text-muted-foreground font-normal">{employee.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 text-muted-foreground">
                                                    {employee.role}
                                                </TableCell>
                                                <TableCell className="py-4 text-muted-foreground">
                                                    {employee.department}
                                                </TableCell>
                                                <TableCell className="py-4 text-muted-foreground">
                                                    {formatDate(employee.hire_date)}
                                                </TableCell>
                                                <TableCell className="py-4 font-bold text-foreground">
                                                    {formatCurrency(employee.salary)}
                                                </TableCell>
                                                <TableCell className="py-4">{getStatusBadge(employee.status)}</TableCell>
                                                <TableCell className="py-4 text-right pr-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditClick(employee)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteClick(employee)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {!isLoading && sortedEmployees.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-16 text-center flex flex-col items-center gap-4"
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
                </motion.div>

                {/* Add/Edit Modal */}
                <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => { if (!open) { setIsAddOpen(false); setIsEditOpen(false); } }}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{isEditOpen ? "Editar Funcionário" : "Novo Funcionário"}</DialogTitle>
                            <DialogDescription>
                                Preencha os dados abaixo para {isEditOpen ? "atualizar" : "cadastrar"} o funcionário.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Tabs defaultValue="pessoal" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
                                    <TabsTrigger value="profissional">Dados Profissionais</TabsTrigger>
                                </TabsList>

                                {/* Aba 1: Dados Pessoais */}
                                <TabsContent value="pessoal" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <Label htmlFor="name">Nome Completo</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Ex: Maria Silva Santos"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">E-mail</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="maria@escola.com"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cpf">CPF</Label>
                                            <Input
                                                id="cpf"
                                                value={formData.cpf || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    let masked = value;

                                                    if (value.length > 0) {
                                                        masked = value.substring(0, 3);
                                                    }
                                                    if (value.length >= 4) {
                                                        masked += '.' + value.substring(3, 6);
                                                    }
                                                    if (value.length >= 7) {
                                                        masked += '.' + value.substring(6, 9);
                                                    }
                                                    if (value.length >= 10) {
                                                        masked += '-' + value.substring(9, 11);
                                                    }

                                                    setFormData({ ...formData, cpf: masked });
                                                }}
                                                placeholder="000.000.000-00"
                                                maxLength={14}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Telefone</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                let masked = value;

                                                if (value.length > 0) {
                                                    masked = '(' + value.substring(0, 2);
                                                }
                                                if (value.length >= 3) {
                                                    masked += ') ' + value.substring(2, 7);
                                                }
                                                if (value.length >= 8) {
                                                    masked += '-' + value.substring(7, 11);
                                                }

                                                setFormData({ ...formData, phone: masked });
                                            }}
                                            placeholder="(00) 00000-0000"
                                            maxLength={15}
                                        />
                                    </div>
                                </TabsContent>

                                {/* Aba 2: Dados Profissionais */}
                                <TabsContent value="profissional" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Cargo</Label>
                                            <Input
                                                id="role"
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                placeholder="Ex: Professor, Coordenador..."
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="department">Departamento</Label>
                                            <Input
                                                id="department"
                                                value={formData.department}
                                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                                placeholder="Ex: Pedagógico, Administrativo..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="hire_date">Data de Admissão</Label>
                                            <Input
                                                id="hire_date"
                                                type="date"
                                                value={formData.hire_date}
                                                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="salary">Salário (R$)</Label>
                                            <Input
                                                id="salary"
                                                type="number"
                                                step="0.01"
                                                value={formData.salary}
                                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={formData.status || "ativo"}
                                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ativo">Ativo</SelectItem>
                                                <SelectItem value="inativo">Inativo</SelectItem>
                                                <SelectItem value="ferias">Férias</SelectItem>
                                                <SelectItem value="afastado">Afastado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Cancelar</Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Salvar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

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
