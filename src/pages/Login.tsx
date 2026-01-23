import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { apiFetch, setAuthToken } from "@/lib/api-client";
import { toast } from "sonner";

export default function Login() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    // Simple CPF mask: 000.000.000-00
    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{3})/, "$1.$2");
    }

    setCpf(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiFetch<{ access_token: string; user: any }>('/login', {
        method: 'POST',
        body: JSON.stringify({
          cpf: cpf.replace(/\D/g, ""), // Enviar CPF limpo
          password: password,
        }),
      });

      setAuthToken(response.access_token);
      toast.success("Login realizado com sucesso!");

      if (response.user?.role === 'student') {
        navigate("/portal");
      } else if (response.user?.role === 'teacher') {
        navigate("/professor");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Falha na autenticação. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background p-4">
      {/* Animated Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -45, 0],
            x: [0, -30, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]"
        />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex justify-center mb-10"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl group-hover:bg-primary/30 transition-colors" />
            <div className="relative w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-2xl transition-transform hover:scale-105 duration-300">
              <GraduationCap className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card/70 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-border/50 p-10 relative"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">FinEdu</h1>
            <p className="text-muted-foreground mt-2 font-medium">
              Gestão Financeira
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2.5"
            >
              <Label htmlFor="cpf" className="text-sm font-semibold ml-1">
                Usuário
              </Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                className="h-12 rounded-xl bg-background/50 border-border/50 focus:border-primary transition-all px-4"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2.5"
            >
              <div className="flex justify-between items-center ml-1">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Senha
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-background/50 border-border/50 focus:border-primary transition-all px-4"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                type="submit"
                className="w-full h-12 font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  "Entrar agora"
                )}
              </Button>
            </motion.div>
          </form>

        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-center text-muted-foreground mt-10 font-medium"
        >
          © 2026 FinEdu • Software de Alto Desempenho
        </motion.p>
      </div>
    </div>
  );
}
