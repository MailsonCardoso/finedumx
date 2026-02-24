import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Save, Palette, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { AlertConfirm } from "@/components/AlertConfirm";

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
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

  const themes = [
    {
      name: "Vem Cantar (Original)",
      primary: "262 83% 58%",
      sidebar: "266 45% 15%",
      description: "Identidade Visual Original (Violeta)"
    },
    {
      name: "Confiança Corporativa",
      primary: "221 83% 53%",
      sidebar: "222 47% 11%",
      description: "Segurança e Estabilidade (Azul Royal)"
    },
    {
      name: "Fintech Moderna",
      primary: "239 84% 67%",
      sidebar: "215 25% 17%",
      description: "Tecnologia e Inovação (Índigo)"
    },
    {
      name: "Crescimento & Riqueza",
      primary: "161 84% 39%",
      sidebar: "164 86% 16%",
      description: "Lucratividade e Foco (Esmeralda)"
    },
    {
      name: "Premium & Ouro",
      primary: "32 95% 44%",
      sidebar: "0 0% 9%",
      description: "Luxo e Exclusividade (Preto e Ouro)"
    }
  ];

  const applyTheme = (theme: any) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--ring', theme.primary);
    root.style.setProperty('--sidebar-background', theme.sidebar);
    root.style.setProperty('--sidebar-foreground', '0 0% 100%');
    root.style.setProperty('--sidebar-primary', theme.primary);
    root.style.setProperty('--sidebar-accent', 'hsl(' + theme.sidebar + ' / 0.8)');
    root.style.setProperty('--sidebar-accent-foreground', '0 0% 100%');

    localStorage.setItem('vem-cantar-theme', JSON.stringify(theme));
    toast.success(`Tema ${theme.name} aplicado!`);
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-5xl pb-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-1 text-lg">Personalize sua experiência.</p>
        </motion.div>

        {/* Themes Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="shadow-soft border-border/50 bg-card overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm"><Palette className="w-5 h-5" /></div>
                <div>
                  <CardTitle className="text-xl">Aparência e Temas</CardTitle>
                  <CardDescription>Escolha a paleta de cores para o sistema altamente profissional.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => applyTheme(theme)}
                    className="p-5 rounded-[2rem] border-2 transition-all flex flex-col items-center text-center gap-4 border-border/50 bg-background/50 hover:border-primary/50 hover:bg-muted/50 group relative overflow-hidden"
                  >
                    <div className="flex -space-x-4">
                      <div className="w-14 h-14 rounded-full shadow-lg border-4 border-background z-10" style={{ backgroundColor: `hsl(${theme.primary})` }} />
                      <div className="w-14 h-14 rounded-full shadow-lg border-4 border-background" style={{ backgroundColor: `hsl(${theme.sidebar})` }} />
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-sm block leading-tight">{theme.name}</span>
                      <span className="text-[10px] text-muted-foreground leading-tight block">{theme.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Institution Data */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-soft border-border/50 bg-card overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-sm"><Building2 className="w-5 h-5" /></div>
                <div>
                  <CardTitle className="text-xl">Dados da Instituição</CardTitle>
                  <CardDescription>Informações para documentos e recibos.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nome</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>CNPJ</Label><Input value={formData.cnpj} onChange={e => setFormData({ ...formData, cnpj: e.target.value })} /></div>
                <div className="space-y-2"><Label>Telefone</Label><Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                <div className="space-y-2"><Label>E-mail</Label><Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                <div className="space-y-2"><Label>Chave PIX</Label><Input value={formData.pix_key} onChange={e => setFormData({ ...formData, pix_key: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Endereço</Label><Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex justify-end"><Button onClick={handleSave} className="h-12 px-8 font-bold" disabled={updateMutation.isPending}>{updateMutation.isPending ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />} Salvar Configurações</Button></div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-red-100 bg-red-50/20 mt-12 overflow-hidden rounded-[2rem]">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="font-bold text-red-600">Limpar toda a Agenda</p>
                <p className="text-sm text-red-500/70">Ação irreversível para preparação de produção.</p>
              </div>
              <Button variant="destructive" className="h-12 px-8 font-bold" onClick={() => setIsConfirmOpen(true)}>Apagar Tudo</Button>
            </CardContent>
          </Card>
        </motion.div>

        <AlertConfirm
          isOpen={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
          title="Apagar Agenda?"
          description="Todos os agendamentos serão removidos permanentemente."
          confirmLabel="Sim, Apagar Agora"
          onConfirm={async () => {
            try {
              await apiFetch('/dangerzone/clear-agenda');
              toast.success("Agenda limpa!");
              queryClient.invalidateQueries({ queryKey: ['appointments'] });
            } catch (e) { toast.error("Erro ao limpar."); }
          }}
        />
      </div>
    </MainLayout>
  );
}
