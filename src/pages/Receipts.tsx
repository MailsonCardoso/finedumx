import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Receipt as ReceiptIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

interface Payment {
  id: number;
  student: {
    name: string;
  };
  type: string;
  amount: number;
  payment_date: string;
  status: string;
}

export default function Receipts() {
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: () => apiFetch('/payments'),
  });

  const receipts = payments.filter(p => p.status === 'confirmado');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString + 'T12:00:00').toLocaleDateString("pt-BR");
  };

  const handleDownload = (receiptNumber: string) => {
    toast.info(`Funcionalidade de download para recibo ${receiptNumber} em breve.`);
    // In future: Reuse the print logic from Tuition or generate PDF here
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recibos</h1>
          <p className="text-muted-foreground mt-1">
            Recibos emitidos para pagamentos confirmados
          </p>
        </div>

        {/* Receipts Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando recibos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {receipts.map((receipt) => (
              <Card
                key={receipt.id}
                className="shadow-card border-border/50 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ReceiptIcon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                      #{receipt.id.toString().padStart(6, '0')}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-foreground">{receipt.student?.name}</p>
                      <p className="text-sm text-muted-foreground">{receipt.type}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground">Valor</p>
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(Number(receipt.amount))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Emitido em</p>
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(receipt.payment_date)}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-2 gap-2"
                      onClick={() => handleDownload('#' + receipt.id.toString().padStart(6, '0'))}
                    >
                      <Download className="w-4 h-4" />
                      Baixar PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {receipts.length === 0 && (
              <div className="col-span-full h-48 flex items-center justify-center flex-col text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                <ReceiptIcon className="w-8 h-8 mb-2 opacity-50" />
                <p>Nenhum recibo emitido ainda.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
