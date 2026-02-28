import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    MessageCircle,
    ExternalLink,
    Smartphone,
    Settings,
    Users,
    Clock,
    CheckCircle2,
    Info
} from "lucide-react";

export default function WhatsApp() {
    const openWhatsApp = () => {
        // Abre o WhatsApp Web em uma nova janela popup centralizada
        const width = 1000;
        const height = 800;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        window.open(
            "https://web.whatsapp.com",
            "WhatsAppWeb",
            `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no,scrollbars=yes,resizable=yes`
        );
    };

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                    <div>
                        <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-2xl">
                                <MessageCircle className="w-10 h-10 text-emerald-500" />
                            </div>
                            Central WhatsApp
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
                            Gerencie a comunicação com seus alunos e responsáveis de forma rápida e eficiente.
                        </p>
                    </div>

                    <Button
                        onClick={openWhatsApp}
                        size="lg"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-7 px-8 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 flex items-center gap-3 text-lg"
                    >
                        <ExternalLink className="w-6 h-6" />
                        Abrir WhatsApp Web
                    </Button>
                </motion.div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="h-full border-none shadow-soft hover:shadow-card transition-all bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background">
                            <CardHeader>
                                <Smartphone className="w-8 h-8 text-emerald-500 mb-2" />
                                <CardTitle>Conexão Ativa</CardTitle>
                                <CardDescription>Mantenha seu celular conectado à internet para garantir o recebimento das mensagens.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Bateria carregada
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Wi-fi estável
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="h-full border-none shadow-soft hover:shadow-card transition-all">
                            <CardHeader>
                                <Clock className="w-8 h-8 text-blue-500 mb-2" />
                                <CardTitle>Resposta Rápida</CardTitle>
                                <CardDescription>O tempo médio de resposta impacta diretamente na satisfação dos alunos.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Dica: Use atalhos do teclado no WhatsApp Web para agilizar o atendimento.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="h-full border-none shadow-soft hover:shadow-card transition-all">
                            <CardHeader>
                                <Settings className="w-8 h-8 text-orange-500 mb-2" />
                                <CardTitle>Configurações</CardTitle>
                                <CardDescription>Ative as notificações do navegador para nunca perder um chamado.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3">
                                <Button variant="outline" className="w-full justify-start gap-2 rounded-xl">
                                    <Info className="w-4 h-4" />
                                    Como ativar notificações
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Contacts (Mockup) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="border-none shadow-soft overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/50">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Contatos Recentes da Escola
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border/50">
                                    {[
                                        { name: "Maria Silva (Mãe de João)", status: "Ativa", last: "Hoje 10:30" },
                                        { name: "Pedro Oliveira", status: "Aluno", last: "Ontem 18:00" },
                                        { name: "Ana Costa", status: "Inscrição", last: "Hoje 08:15" },
                                    ].map((contact, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-all cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {contact.name.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground group-hover:text-primary transition-colors">{contact.name}</p>
                                                    <p className="text-xs text-muted-foreground">{contact.status}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">{contact.last}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-bold text-xs gap-1"
                                                    onClick={() => window.open(`https://web.whatsapp.com/send?phone=`, "_blank")}
                                                >
                                                    Conversar
                                                    <ExternalLink className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-muted/10 text-center">
                                    <p className="text-xs text-muted-foreground">Para falar com um aluno específico, vá até a tela de <span className="font-bold underline cursor-pointer" onClick={() => window.location.href = '/alunos'}>Alunos</span>.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Guidelines Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-6"
                    >
                        <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-primary mb-4">Mantenha-se Conectado!</h3>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    Para que o WhatsApp continue logado no sistema, ao ler o QR Code pela primeira vez, certifique-se de marcar a opção <b>"Mantenha-me conectado"</b> (ou apenas não saia da conta).
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">1</div>
                                        <p className="text-sm">Abra a janela dedicada no botão acima.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">2</div>
                                        <p className="text-sm">Aponte o celular para o QR Code.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">3</div>
                                        <p className="text-sm">Pronto! Suas conversas estarão disponíveis sempre que clicar no botão.</p>
                                    </li>
                                </ul>
                            </div>
                            <MessageCircle className="absolute -bottom-10 -right-10 w-48 h-48 text-primary/10 -rotate-12" />
                        </div>

                        <Card className="border-none shadow-soft bg-emerald-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <Smartphone className="w-10 h-10 opacity-80" />
                                    <div>
                                        <p className="font-bold text-lg">App Desktop</p>
                                        <p className="text-emerald-100 text-sm italic">Como recomendação adicional, o WhatsApp também possui um aplicativo oficial para Windows que é mais estável para longos períodos de uso.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </MainLayout>
    );
}
