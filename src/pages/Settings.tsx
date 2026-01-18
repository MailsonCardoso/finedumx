import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Building2, Save, Palette, Monitor, Moon, Sun, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

interface SchoolData {
  id?: number;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
  pix_key: string;
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const [notifications, setNotifications] = useState({
    emailReminder: true,
    smsReminder: false,
    overdueAlert: true,
    paymentConfirmation: true,
  });

  const { data: schoolData, isLoading } = useQuery<SchoolData>({
    queryKey: ['school-settings'],
    queryFn: () => apiFetch('/settings'),
  });

  const [formData, setFormData] = useState<SchoolData>({
    name: "",
    cnpj: "",
    phone: "",
    email: "",
    address: "",
    pix_key: "",
  });

  useEffect(() => {
    if (schoolData) {
      setFormData(schoolData);
    }
  }, [schoolData]);

  const updateMutation = useMutation({
    mutationFn: (newData: SchoolData) =>
      apiFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify(newData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-settings'] });
      toast.success("Configurações salvas com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao salvar configurações.");
    }
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8 max-w-4xl pb-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Personalize sua experiência e gerencie os dados da instituição.
          </p>
        </motion.div>

        {/* Interface Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-soft border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Interface e Visual</CardTitle>
                  <CardDescription>
                    Escolha como o FinEdu deve aparecer para você
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${theme === "light"
                    ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                    : "border-border/50 bg-background/50 hover:border-border hover:bg-muted/50"
                    }`}
                >
                  <div className={`p-3 rounded-full ${theme === "light" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Sun className="w-6 h-6" />
                  </div>
                  <span className="font-semibold">Claro</span>
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${theme === "dark"
                    ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                    : "border-border/50 bg-background/50 hover:border-border hover:bg-muted/50"
                    }`}
                >
                  <div className={`p-3 rounded-full ${theme === "dark" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Moon className="w-6 h-6" />
                  </div>
                  <span className="font-semibold">Escuro</span>
                </button>

                <button
                  onClick={() => setTheme("system")}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${theme === "system"
                    ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                    : "border-border/50 bg-background/50 hover:border-border hover:bg-muted/50"
                    }`}
                >
                  <div className={`p-3 rounded-full ${theme === "system" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Monitor className="w-6 h-6" />
                  </div>
                  <span className="font-semibold">Sistema</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-soft border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Notificações Automáticas</CardTitle>
                  <CardDescription>
                    Configure os alertas e lembretes enviados pelo sistema
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
        </motion.div>

        {/* School Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-soft border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">Dados da Instituição</CardTitle>
                  <CardDescription>
                    Informações oficiais que aparecem nos recibos e documentos
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
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) =>
                      setFormData({ ...formData, cnpj: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pix">Chave PIX</Label>
                  <Input
                    id="pix"
                    value={formData.pix_key}
                    onChange={(e) =>
                      setFormData({ ...formData, pix_key: e.target.value })
                    }
                    placeholder="E-mail, CPF, CNPJ ou Aleatória"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end pt-4"
        >
          <Button
            onClick={handleSave}
            className="gap-2 h-12 px-8 shadow-lg shadow-primary/20"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Salvar Configurações
          </Button>
        </motion.div>
      </div>
    </MainLayout>
  );
}
