import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Building2, Save } from "lucide-react";
import { schoolSettings } from "@/data/mockData";
import { toast } from "sonner";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    emailReminder: true,
    smsReminder: false,
    overdueAlert: true,
    paymentConfirmation: true,
  });

  const [schoolData, setSchoolData] = useState(schoolSettings);

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as configurações do sistema
          </p>
        </div>

        {/* Notifications */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Notificações Automáticas</CardTitle>
                <CardDescription>
                  Configure os alertas e lembretes do sistema
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <Label htmlFor="emailReminder" className="font-medium">
                  Lembrete por E-mail
                </Label>
                <p className="text-sm text-muted-foreground">
                  Envia lembrete 3 dias antes do vencimento
                </p>
              </div>
              <Switch
                id="emailReminder"
                checked={notifications.emailReminder}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, emailReminder: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-3">
              <div>
                <Label htmlFor="smsReminder" className="font-medium">
                  Lembrete por SMS
                </Label>
                <p className="text-sm text-muted-foreground">
                  Envia SMS no dia do vencimento
                </p>
              </div>
              <Switch
                id="smsReminder"
                checked={notifications.smsReminder}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, smsReminder: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-3">
              <div>
                <Label htmlFor="overdueAlert" className="font-medium">
                  Alerta de Atraso
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notifica quando há mensalidades atrasadas
                </p>
              </div>
              <Switch
                id="overdueAlert"
                checked={notifications.overdueAlert}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, overdueAlert: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-3">
              <div>
                <Label htmlFor="paymentConfirmation" className="font-medium">
                  Confirmação de Pagamento
                </Label>
                <p className="text-sm text-muted-foreground">
                  Envia comprovante ao confirmar pagamento
                </p>
              </div>
              <Switch
                id="paymentConfirmation"
                checked={notifications.paymentConfirmation}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, paymentConfirmation: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* School Data */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Dados da Escola</CardTitle>
                <CardDescription>
                  Informações que aparecem nos recibos e boletos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">Nome da Escola</Label>
                <Input
                  id="schoolName"
                  value={schoolData.name}
                  onChange={(e) =>
                    setSchoolData({ ...schoolData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={schoolData.cnpj}
                  onChange={(e) =>
                    setSchoolData({ ...schoolData, cnpj: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={schoolData.phone}
                  onChange={(e) =>
                    setSchoolData({ ...schoolData, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={schoolData.email}
                  onChange={(e) =>
                    setSchoolData({ ...schoolData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={schoolData.address}
                onChange={(e) =>
                  setSchoolData({ ...schoolData, address: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
