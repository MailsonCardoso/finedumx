import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Receipt as ReceiptIcon } from "lucide-react";
import { receipts } from "@/data/mockData";
import { toast } from "sonner";

export default function Receipts() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const handleDownload = (receiptNumber: string) => {
    toast.success(`Baixando recibo ${receiptNumber}...`);
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
                    {receipt.number}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">{receipt.studentName}</p>
                    <p className="text-sm text-muted-foreground">{receipt.reference}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground">Valor</p>
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(receipt.amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Emitido em</p>
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(receipt.issueDate)}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full mt-2 gap-2"
                    onClick={() => handleDownload(receipt.number)}
                  >
                    <Download className="w-4 h-4" />
                    Baixar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
