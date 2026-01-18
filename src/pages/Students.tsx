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
import { Plus, Search, Filter, UserX, Loader2, Pencil, Trash2, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { StudentSheet } from "@/components/StudentSheet";

interface Student {
  id: number;
  name: string;
  active_responsible?: string;
  email: string;
  phone: string;
  course: string;
  due_day: number;
  monthly_fee: number;
  status: string;
}

interface StudentFormData {
  name: string;
  active_responsible: string;
  email: string;
  phone: string;
  course: string;
  due_day: number;
  monthly_fee: number | string;
  status: string;
}

const initialFormData: StudentFormData = {
  name: "",
  active_responsible: "",
  email: "",
  phone: "",
  course: "",
  due_day: 10,
  monthly_fee: "",
  status: "ativo",
};


export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const queryClient = useQueryClient();

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetStudentId, setSheetStudentId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);

  // Queries
  const { data: studentsData = [], isLoading } = useQuery<Student[]>({
    queryKey: ['students', searchTerm, statusFilter],
    queryFn: () => apiFetch(`/students?search=${searchTerm}&status=${statusFilter}`),
  });

  // Sort: Active students first
  const sortedStudents = [...studentsData].sort((a, b) => {
    if (a.status === 'ativo' && b.status !== 'ativo') return -1;
    if (a.status !== 'ativo' && b.status === 'ativo') return 1;
    return 0;
  });

  const { data: coursesData = [] } = useQuery<any[]>({
    queryKey: ['courses'],
    queryFn: () => apiFetch('/courses'),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: StudentFormData) =>
      apiFetch('/students', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success("Aluno cadastrado com sucesso!");
      setIsAddOpen(false);
      setFormData(initialFormData);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao cadastrar aluno");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: StudentFormData }) =>
      apiFetch(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success("Aluno atualizado com sucesso!");
      setIsEditOpen(false);
      setSelectedStudent(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar aluno");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/students/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success("Aluno removido com sucesso!");
      setIsDeleteOpen(false);
      setSelectedStudent(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao remover aluno");
    }
  });

  // Handlers
  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      active_responsible: student.active_responsible || "",
      email: student.email,
      phone: student.phone,
      course: student.course,
      due_day: student.due_day,
      monthly_fee: student.monthly_fee,
      status: student.status,
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditOpen && selectedStudent) {
      updateMutation.mutate({
        id: selectedStudent.id,
        data: {
          ...formData,
          monthly_fee: formData.monthly_fee === "" ? 0 : parseFloat(formData.monthly_fee.toString())
        }
      });
    } else {
      createMutation.mutate({
        ...formData,
        monthly_fee: formData.monthly_fee === "" ? 0 : parseFloat(formData.monthly_fee.toString())
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <StatusBadge status="success">Ativo</StatusBadge>;
      case "inativo":
        return <StatusBadge status="neutral">Inativo</StatusBadge>;
      case "em_dia":
        return <StatusBadge status="success">Em dia</StatusBadge>;
      case "a_vencer":
        return <StatusBadge status="warning">A vencer</StatusBadge>;
      case "atrasado":
        return <StatusBadge status="danger">Atrasado</StatusBadge>;
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
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Alunos</h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Gerencie a base de alunos e acompanhe o status financeiro de cada um.
            </p>
          </div>
          <Button
            onClick={() => { setFormData(initialFormData); setIsAddOpen(true); }}
            className="gap-2 shadow-lg shadow-primary/20 h-11 px-6"
          >
            <Plus className="w-5 h-5" />
            Novo Aluno
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50 backdrop-blur-sm"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary transition-all"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-11 bg-background/50">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Filtrar status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="em_dia">Em dia</SelectItem>
              <SelectItem value="a_vencer">A vencer</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Table */}
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
                  <TableHead className="font-bold h-14 text-foreground">Nome</TableHead>
                  <TableHead className="font-bold h-14 text-foreground">Curso</TableHead>
                  <TableHead className="font-bold h-14 text-foreground text-center">Dia Venc.</TableHead>
                  <TableHead className="font-bold h-14 text-foreground">Mensalidade</TableHead>
                  <TableHead className="font-bold h-14 text-foreground">Status</TableHead>
                  <TableHead className="font-bold h-14 text-foreground text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Carregando alunos...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {sortedStudents.map((student, i) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: i * 0.05 }}
                        className="group border-b border-border/40 hover:bg-primary/5 transition-colors"
                      >
                        <TableCell className="py-4 font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer" onClick={() => { setSheetStudentId(student.id); setIsSheetOpen(true); }}>
                          <div className="flex flex-col">
                            <span className="flex items-center gap-2">
                              {student.name}
                              <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                            </span>
                            {student.active_responsible && (
                              <span className="text-[10px] text-primary/70 font-medium uppercase tracking-wider mt-0.5">
                                Resp: {student.active_responsible}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground font-normal">{student.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-muted-foreground">
                          {student.course}
                        </TableCell>
                        <TableCell className="py-4 text-center text-muted-foreground whitespace-nowrap">
                          <span className="bg-muted px-2 py-1 rounded text-xs font-medium">Dia {student.due_day}</span>
                        </TableCell>
                        <TableCell className="py-4 font-bold text-foreground">
                          {formatCurrency(student.monthly_fee)}
                        </TableCell>
                        <TableCell className="py-4">{getStatusBadge(student.status)}</TableCell>
                        <TableCell className="py-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditClick(student)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteClick(student)}>
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

          {!isLoading && sortedStudents.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-16 text-center flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <UserX className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Nenhum aluno encontrado</h3>
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEditOpen ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para {isEditOpen ? "atualizar" : "cadastrar"} o aluno.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Aluno</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: João da Silva"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsible">Responsável</Label>
                    <Input
                      id="responsible"
                      value={formData.active_responsible}
                      onChange={(e) => setFormData({ ...formData, active_responsible: e.target.value })}
                      placeholder="Nome do pai/mãe"
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
                      placeholder="joao@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Curso</Label>
                    <Select
                      value={formData.course}
                      onValueChange={(value) => {
                        const course = coursesData?.find((c: any) => c.name === value);
                        setFormData({
                          ...formData,
                          course: value,
                          monthly_fee: course ? course.price : formData.monthly_fee
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {coursesData?.map((course: any) => (
                          <SelectItem key={course.id} value={course.name}>{course.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due_day">Dia Vencimento</Label>
                    <Input
                      id="due_day"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.due_day}
                      onChange={(e) => setFormData({ ...formData, due_day: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthly_fee">Valor da Mensalidade (R$)</Label>
                    <Input
                      id="monthly_fee"
                      type="number"
                      step="0.01"
                      value={formData.monthly_fee}
                      onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                      placeholder="0.00"
                      required
                    />
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
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
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o aluno
                <span className="font-bold text-foreground"> {selectedStudent?.name} </span>
                e todos os seus dados associados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedStudent && deleteMutation.mutate(selectedStudent.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <StudentSheet
          studentId={sheetStudentId}
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
        />
      </div>
    </MainLayout>
  );
}
