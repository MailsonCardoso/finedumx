import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, Filter, UserX, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

interface Student {
  id: number;
  name: string;
  course: string;
  due_day: number;
  monthly_fee: number;
  status: 'em_dia' | 'a_vencer' | 'atrasado';
}

export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const { data: studentsData = [], isLoading } = useQuery<Student[]>({
    queryKey: ['students', searchTerm, statusFilter],
    queryFn: () => apiFetch(`/students?search=${searchTerm}&status=${statusFilter}`),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "em_dia":
        return <StatusBadge status="success">Em dia</StatusBadge>;
      case "a_vencer":
        return <StatusBadge status="warning">A vencer</StatusBadge>;
      case "atrasado":
        return <StatusBadge status="danger">Atrasado</StatusBadge>;
      default:
        return null;
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
          <Button className="gap-2 shadow-lg shadow-primary/20 h-11 px-6">
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Carregando alunos...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {studentsData.map((student, i) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: i * 0.05 }}
                        className="group border-b border-border/40 hover:bg-primary/5 cursor-pointer transition-colors"
                      >
                        <TableCell className="py-4 font-semibold text-foreground group-hover:text-primary transition-colors">
                          {student.name}
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
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>

          {!isLoading && studentsData.length === 0 && (
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
      </div>
    </MainLayout>
  );
}
