import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Employees from "./pages/Employees";
import Classes from "./pages/Classes";
import Courses from "./pages/Courses";
import Tuition from "./pages/Tuition";
import Payments from "./pages/Payments";
import Receipts from "./pages/Receipts";
import Settings from "./pages/Settings";
import Agenda from "./pages/Agenda";
import StudentPortal from "./pages/StudentPortal";
import TeacherPortal from "./pages/TeacherPortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider forcedTheme="light" attribute="class">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alunos" element={<Students />} />
            <Route path="/funcionarios" element={<Employees />} />
            <Route path="/turmas" element={<Classes />} />
            <Route path="/cursos" element={<Courses />} />
            <Route path="/mensalidades" element={<Tuition />} />
            <Route path="/pagamentos" element={<Payments />} />
            <Route path="/recibos" element={<Receipts />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/portal" element={<StudentPortal />} />
            <Route path="/professor" element={<TeacherPortal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
