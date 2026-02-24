import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, UserX, Loader2, Pencil, Trash2, Eye, DollarSign, User, Mail, FileText, Phone, Users, Calendar, GraduationCap, MoreVertical } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { StudentSheet } from "@/components/StudentSheet";

interface Student {
  id: number;
  name: string;
  active_responsible?: string;
  email: string;
  cpf?: string;
  phone: string;
  course?: { name: string } | string;
  course_id?: number;
  due_day: number;
  monthly_fee: number;
  status: string;
}

interface StudentFormData {
  name: string;
  active_responsible: string;
  email: string;
  cpf?: string;
  phone: string;
  course_id: string;
  due_day: number;
  monthly_fee: number | string;
  status: string;
  generate_matricula?: boolean;
  matricula_value?: number;
  generate_tuition?: boolean;
}

const initialFormData: StudentFormData = {
  name: "",
  active_responsible: "",
  email: "",
  cpf: "",
  phone: "",
  course_id: "",
  due_day: 10,
  monthly_fee: "",
  status: "ativo",
  generate_matricula: false,
  matricula_value: 100,
  generate_tuition: true,
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

  const { data: classesData = [] } = useQuery<any[]>({
    queryKey: ['classes'],
    queryFn: () => apiFetch('/classes'),
  });

  // Helper to get shifts for a selected course
  const getCourseShifts = (courseId: string) => {
    if (!courseId) return [];
    const courseClasses = classesData.filter((c) => c.course_id.toString() === courseId);
    const shifts = [...new Set(courseClasses.map((c) => c.shift))];
    return shifts;
  };

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
      cpf: student.cpf || "",
      phone: student.phone,
      course_id: student.course_id?.toString() || "",
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
            onClick={() => {
              setFormData(initialFormData);
              setIsEditOpen(false);
              setIsAddOpen(true);
            }}
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
          className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-2xl border border-border/50 shadow-soft"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno por nome..."
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
              <SelectItem value="em_dia">Em dia</SelectItem>
              <SelectItem value="a_vencer">A vencer</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
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
              {sortedStudents.map((student, i) => (
                <motion.div
                  key={student.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-[24px] shadow-sm hover:shadow-lg transition-all border border-border/40 overflow-hidden relative flex flex-col group h-full"
                >
                  {/* Top Accent based on status */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${student.status === 'ativo' ? 'bg-gradient-to-r from-primary to-primary/40' : 'bg-muted-foreground/30'}`} />

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
                        <DropdownMenuItem onClick={() => { setSheetStudentId(student.id); setIsSheetOpen(true); }}>
                          <Eye className="mr-2 h-4 w-4" />
                          Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(student)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteClick(student)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="p-6 flex flex-col gap-6 h-full pt-8">
                    {/* Header: Avatar, Name & Status */}
                    <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { setSheetStudentId(student.id); setIsSheetOpen(true); }}>
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shrink-0 shadow-sm border border-primary/10">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col items-start gap-1.5 min-w-0 flex-1">
                        <h3 className="font-bold text-foreground text-lg leading-tight truncate w-full pr-6" title={student.name}>
                          {student.name}
                        </h3>
                        <div className="scale-90 origin-left">
                          {getStatusBadge(student.status)}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Pills */}
                    <div className="space-y-3">
                      <div className="bg-muted/30 rounded-2xl px-4 py-2.5 flex items-center gap-3 text-sm text-foreground/80 border border-border/20">
                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate text-xs font-medium">{student.email}</span>
                      </div>

                      <div className="bg-muted/30 rounded-2xl px-4 py-2.5 flex items-center gap-3 text-sm text-foreground/80 border border-border/20">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate text-xs font-medium">{student.phone || "(00) 00000-0000"}</span>
                      </div>
                    </div>

                    {/* Courses Section */}
                    <div className="mt-auto space-y-3">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                        Cursos Matriculados
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-background px-3 py-1.5 rounded-xl border-border/50 text-foreground/80 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 mr-2 text-primary/70" />
                          {typeof student.course === 'object' ? student.course?.name : (student.course || "Sem curso")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {!isLoading && sortedStudents.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-16 text-center flex flex-col items-center gap-4 bg-card/50 border border-dashed border-border rounded-xl"
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

        {/* Add/Edit Modal */}
        <Sheet open={isAddOpen || isEditOpen} onOpenChange={(open) => { if (!open) { setIsAddOpen(false); setIsEditOpen(false); } }}>
          <SheetContent className="max-w-4xl sm:max-w-2xl overflow-y-auto" side="right">
            <SheetHeader className="pb-6">
              <SheetTitle className="text-2xl font-bold">{isEditOpen ? "Editar Aluno" : "Novo Aluno"}</SheetTitle>
              <SheetDescription>
                Preencha os dados abaixo para {isEditOpen ? "atualizar" : "cadastrar"} o aluno.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Coluna Esquerda: Dados Pessoais */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold text-foreground">Dados Pessoais</h4>
                  </div>

                  <div className="space-y-4">
                    {/* Nome */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ex: João da Silva"
                          required
                          className="pl-9 h-11"
                        />
                      </div>
                    </div>

                    {/* Responsável */}
                    <div className="space-y-2">
                      <Label htmlFor="responsible">Responsável (opcional)</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="responsible"
                          value={formData.active_responsible}
                          onChange={(e) => setFormData({ ...formData, active_responsible: e.target.value })}
                          placeholder="Nome do pai/mãe"
                          className="pl-9 h-11"
                        />
                      </div>
                    </div>

                    {/* CPF e Telefone (agora em linha na coluna) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="cpf"
                            value={formData.cpf || ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              let masked = value;
                              if (value.length > 0) masked = value.substring(0, 3);
                              if (value.length >= 4) masked += '.' + value.substring(3, 6);
                              if (value.length >= 7) masked += '.' + value.substring(6, 9);
                              if (value.length >= 10) masked += '-' + value.substring(9, 11);
                              setFormData({ ...formData, cpf: masked });
                            }}
                            placeholder="000.000..."
                            maxLength={14}
                            className="pl-9 h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
                            placeholder="(00) 00..."
                            maxLength={15}
                            className="pl-9 h-11"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="joao@email.com"
                          required
                          className="pl-9 h-11"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coluna Direita: Financeiro */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <h4 className="font-semibold text-foreground">Financeiro</h4>
                  </div>

                  <div className="space-y-4">
                    {/* Curso e Status */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="course">Curso / Modalidade</Label>
                        <Select
                          value={formData.course_id}
                          onValueChange={(value) => {
                            const course = coursesData?.find((c: any) => c.id.toString() === value);
                            setFormData({
                              ...formData,
                              course_id: value,
                              monthly_fee: course ? course.price : formData.monthly_fee
                            });
                          }}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {coursesData?.map((course: any) => (
                              <SelectItem key={course.id} value={course.id.toString()}>{course.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.course_id && (
                          <div className="mt-1 text-[11px] text-muted-foreground px-2 py-1 bg-muted/30 rounded border border-border/30">
                            {getCourseShifts(formData.course_id).length > 0 ? (
                              <p><span className="font-semibold text-primary">Turnos:</span> {getCourseShifts(formData.course_id).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}</p>
                            ) : (
                              <p className="italic opacity-70">Sem turmas cadastradas.</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 col-span-2 sm:col-span-1">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status || "ativo"}
                          onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Valor e Vencimento */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="monthly_fee">Mensalidade (R$/mês)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-sm font-bold text-muted-foreground">R$</span>
                          <Input
                            id="monthly_fee"
                            type="number"
                            step="0.01"
                            value={formData.monthly_fee}
                            onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                            placeholder="0.00"
                            required
                            className="pl-9 h-11 font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="due_day">Vencimento (Dia)</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="due_day"
                            type="number"
                            min="1"
                            max="31"
                            value={formData.due_day}
                            onChange={(e) => setFormData({ ...formData, due_day: parseInt(e.target.value) })}
                            required
                            className="pl-9 h-11"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cobranças Iniciais (Apenas na Criação) */}
                    {isAddOpen && (
                      <div className="bg-muted/30 border border-border/50 p-4 rounded-xl space-y-3 mt-2">
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cobranças Iniciais</h5>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id="gen_mat"
                              checked={formData.generate_matricula}
                              onCheckedChange={(checked) => setFormData({ ...formData, generate_matricula: checked as boolean })}
                            />
                            <div className="flex-1">
                              <Label htmlFor="gen_mat" className="text-sm font-medium cursor-pointer block">Taxa de Matrícula</Label>
                              <span className="text-[10px] text-muted-foreground block">Gera cobrança pra hoje.</span>
                            </div>
                            {formData.generate_matricula && (
                              <Input
                                type="number"
                                value={formData.matricula_value}
                                onChange={(e) => setFormData({ ...formData, matricula_value: parseFloat(e.target.value) })}
                                className="h-8 w-20 text-right"
                                placeholder="Valor"
                              />
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <Checkbox
                              id="gen_tui"
                              checked={formData.generate_tuition}
                              onCheckedChange={(checked) => setFormData({ ...formData, generate_tuition: checked as boolean })}
                            />
                            <div>
                              <Label htmlFor="gen_tui" className="text-sm font-medium cursor-pointer block">1ª Mensalidade</Label>
                              <span className="text-[10px] text-muted-foreground block">Para o mês que vem.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>



              <SheetFooter className="pt-6 border-t border-border mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" className="h-11 px-6" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Cancelar</Button>
                <Button type="submit" className="h-11 px-8 font-bold" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Aluno
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
      </div >
    </MainLayout >
  );
}
