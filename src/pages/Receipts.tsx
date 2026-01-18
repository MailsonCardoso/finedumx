import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Receipt as ReceiptIcon, Loader2, Printer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";

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
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: () => apiFetch('/payments'),
  });

  const { data: schoolData } = useQuery({
    queryKey: ['school-settings'],
    queryFn: () => apiFetch<any>('/settings'),
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

  const handleViewReceipt = (receipt: Payment) => {
    setSelectedReceipt(receipt);
    setIsReceiptOpen(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="no-print">
          <h1 className="text-2xl font-bold text-foreground">Recibos</h1>
          <p className="text-muted-foreground mt-1">
            Recibos emitidos para pagamentos confirmados
          </p>
        </div>

        {/* Receipts Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 no-print">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando recibos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 no-print">
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
                      onClick={() => handleViewReceipt(receipt)}
                    >
                      <Printer className="w-4 h-4" />
                      Visualizar / Imprimir
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

        {/* Receipt Modal */}
        <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
          <DialogContent className="max-w-3xl">
            <div id="receipt-area" className="p-8 bg-white text-black border-2 border-dashed border-gray-300 rounded-lg">
              <style>
                {`
                    @media print {
                      body * {
                        visibility: hidden;
                      }
                      #receipt-area, #receipt-area * {
                        visibility: visible;
                      }
                      #receipt-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        border: none !important;
                      }
                      .no-print {
                        display: none !important;
                      }
                    }
                  `}
              </style>

              <div className="text-center border-b-2 border-black pb-6 mb-6">
                <h1 className="text-3xl font-bold uppercase tracking-wider">{schoolData?.name || "ESCOLA DE MUSICA VEM CANTAR"}</h1>
                <p className="text-sm text-gray-600 mt-2">{schoolData?.address || "Rua da Música, 123 - Centro, São Paulo - SP"}</p>
                <p className="text-sm text-gray-600">CNPJ: {schoolData?.cnpj || "12.345.678/0001-90"} | Tel: {schoolData?.phone || "(11) 99999-9999"}</p>
              </div>

              <div className="flex justify-between items-center mb-8">
                <div className="text-xl font-bold border-2 border-black p-2 px-4 rounded">
                  RECIBO Nº {selectedReceipt?.id.toString().padStart(6, '0')}
                </div>
                <div className="text-xl font-bold">
                  VALOR: {selectedReceipt && formatCurrency(Number(selectedReceipt.amount))}
                </div>
              </div>

              <div className="space-y-6 text-lg leading-relaxed">
                <p>
                  Recebemos de <span className="font-bold underline decoration-dotted underline-offset-4">{selectedReceipt?.student?.name}</span>
                </p>
                <p>
                  A importância de <span className="font-bold">{selectedReceipt && formatCurrency(Number(selectedReceipt.amount))}</span>
                </p>
                <p>
                  Referente à <span className="font-bold">{selectedReceipt?.type}</span>.
                </p>
                <p>
                  Para clareza e verdade, firmamos o presente.
                </p>
              </div>

              <div className="mt-16 text-center flex flex-col items-center justify-center">
                <div className="w-64 border-b border-black mb-2"></div>
                <p className="font-bold">{schoolData?.name || "ESCOLA DE MUSICA VEM CANTAR"}</p>
                <p className="text-sm text-gray-500">{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <DialogFooter className="no-print">
              <Button variant="outline" onClick={() => setIsReceiptOpen(false)}>Fechar</Button>
              <Button onClick={handlePrintReceipt} className="gap-2">
                <Printer className="w-4 h-4" /> Imprimir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
