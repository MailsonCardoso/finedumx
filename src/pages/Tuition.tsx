import { MainLayout } from "@/components/layout/MainLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell, Printer, Plus } from "lucide-react";
import { tuitions } from "@/data/mockData";
import { toast } from "sonner";

export default function Tuition() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pago":
        return <StatusBadge status="success">Pago</StatusBadge>;
      case "pendente":
        return <StatusBadge status="warning">Pendente</StatusBadge>;
      case "atrasado":
        return <StatusBadge status="danger">Atrasado</StatusBadge>;
      default:
        return null;
    }
  };

  const handleSendReminder = (studentName: string) => {
    toast.success(`Cobrança enviada para ${studentName}`);
  };

  const handlePrint = (reference: string, studentName: string) => {
    toast.info(`Imprimindo boleto ${reference} - ${studentName}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mensalidades</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as cobranças geradas
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Gerar Mensalidades
          </Button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Referência</TableHead>
                  <TableHead className="font-semibold">Aluno</TableHead>
                  <TableHead className="font-semibold">Vencimento</TableHead>
                  <TableHead className="font-semibold">Valor</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tuitions.map((tuition) => (
                  <TableRow 
                    key={tuition.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium">{tuition.reference}</TableCell>
                    <TableCell>{tuition.studentName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(tuition.dueDate)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(tuition.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(tuition.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSendReminder(tuition.studentName)}
                          title="Enviar cobrança"
                        >
                          <Bell className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handlePrint(tuition.reference, tuition.studentName)}
                          title="Imprimir"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
