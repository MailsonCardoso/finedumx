// Mock Data for FinEdu System

export interface Student {
  id: string;
  name: string;
  course: string;
  dueDay: number;
  monthlyFee: number;
  status: "em_dia" | "a_vencer" | "atrasado";
  email: string;
  phone: string;
}

export interface Tuition {
  id: string;
  reference: string;
  studentId: string;
  studentName: string;
  dueDate: string;
  amount: number;
  status: "pago" | "pendente" | "atrasado";
}

export interface Payment {
  id: string;
  studentName: string;
  type: string;
  method: "pix" | "boleto" | "cartao";
  date: string;
  amount: number;
  status: "confirmado" | "processando" | "falha";
}

export interface Receipt {
  id: string;
  number: string;
  studentName: string;
  reference: string;
  amount: number;
  issueDate: string;
}

export const students: Student[] = [
  { id: "1", name: "Ana Silva", course: "Ensino Fundamental", dueDay: 10, monthlyFee: 850, status: "em_dia", email: "ana@email.com", phone: "(11) 99999-0001" },
  { id: "2", name: "Bruno Costa", course: "Ensino Médio", dueDay: 15, monthlyFee: 1200, status: "a_vencer", email: "bruno@email.com", phone: "(11) 99999-0002" },
  { id: "3", name: "Carla Mendes", course: "Educação Infantil", dueDay: 5, monthlyFee: 650, status: "atrasado", email: "carla@email.com", phone: "(11) 99999-0003" },
  { id: "4", name: "Daniel Oliveira", course: "Ensino Fundamental", dueDay: 10, monthlyFee: 850, status: "em_dia", email: "daniel@email.com", phone: "(11) 99999-0004" },
  { id: "5", name: "Elena Ferreira", course: "Ensino Médio", dueDay: 20, monthlyFee: 1200, status: "em_dia", email: "elena@email.com", phone: "(11) 99999-0005" },
  { id: "6", name: "Felipe Santos", course: "Educação Infantil", dueDay: 5, monthlyFee: 650, status: "atrasado", email: "felipe@email.com", phone: "(11) 99999-0006" },
  { id: "7", name: "Gabriela Lima", course: "Ensino Fundamental", dueDay: 15, monthlyFee: 850, status: "a_vencer", email: "gabriela@email.com", phone: "(11) 99999-0007" },
  { id: "8", name: "Henrique Rocha", course: "Ensino Médio", dueDay: 10, monthlyFee: 1200, status: "em_dia", email: "henrique@email.com", phone: "(11) 99999-0008" },
];

export const tuitions: Tuition[] = [
  { id: "1", reference: "Jan/2025", studentId: "1", studentName: "Ana Silva", dueDate: "2025-01-10", amount: 850, status: "pago" },
  { id: "2", reference: "Jan/2025", studentId: "2", studentName: "Bruno Costa", dueDate: "2025-01-15", amount: 1200, status: "pendente" },
  { id: "3", reference: "Jan/2025", studentId: "3", studentName: "Carla Mendes", dueDate: "2025-01-05", amount: 650, status: "atrasado" },
  { id: "4", reference: "Jan/2025", studentId: "4", studentName: "Daniel Oliveira", dueDate: "2025-01-10", amount: 850, status: "pago" },
  { id: "5", reference: "Jan/2025", studentId: "5", studentName: "Elena Ferreira", dueDate: "2025-01-20", amount: 1200, status: "pendente" },
  { id: "6", reference: "Dez/2024", studentId: "6", studentName: "Felipe Santos", dueDate: "2024-12-05", amount: 650, status: "atrasado" },
  { id: "7", reference: "Jan/2025", studentId: "7", studentName: "Gabriela Lima", dueDate: "2025-01-15", amount: 850, status: "pendente" },
  { id: "8", reference: "Jan/2025", studentId: "8", studentName: "Henrique Rocha", dueDate: "2025-01-10", amount: 1200, status: "pago" },
];

export const payments: Payment[] = [
  { id: "1", studentName: "Ana Silva", type: "Mensalidade Jan/2025", method: "pix", date: "2025-01-08", amount: 850, status: "confirmado" },
  { id: "2", studentName: "Daniel Oliveira", type: "Mensalidade Jan/2025", method: "boleto", date: "2025-01-09", amount: 850, status: "confirmado" },
  { id: "3", studentName: "Henrique Rocha", type: "Mensalidade Jan/2025", method: "cartao", date: "2025-01-10", amount: 1200, status: "confirmado" },
  { id: "4", studentName: "Bruno Costa", type: "Mensalidade Jan/2025", method: "pix", date: "2025-01-15", amount: 1200, status: "processando" },
  { id: "5", studentName: "Elena Ferreira", type: "Mensalidade Dez/2024", method: "cartao", date: "2024-12-20", amount: 1200, status: "confirmado" },
  { id: "6", studentName: "Gabriela Lima", type: "Mensalidade Dez/2024", method: "boleto", date: "2024-12-15", amount: 850, status: "confirmado" },
];

export const receipts: Receipt[] = [
  { id: "1", number: "REC-2025-0001", studentName: "Ana Silva", reference: "Mensalidade Jan/2025", amount: 850, issueDate: "2025-01-08" },
  { id: "2", number: "REC-2025-0002", studentName: "Daniel Oliveira", reference: "Mensalidade Jan/2025", amount: 850, issueDate: "2025-01-09" },
  { id: "3", number: "REC-2025-0003", studentName: "Henrique Rocha", reference: "Mensalidade Jan/2025", amount: 1200, issueDate: "2025-01-10" },
  { id: "4", number: "REC-2024-0089", studentName: "Elena Ferreira", reference: "Mensalidade Dez/2024", amount: 1200, issueDate: "2024-12-20" },
  { id: "5", number: "REC-2024-0088", studentName: "Gabriela Lima", reference: "Mensalidade Dez/2024", amount: 850, issueDate: "2024-12-15" },
];

export const cashFlowData = [
  { month: "Ago", receita: 45000, despesas: 32000 },
  { month: "Set", receita: 48000, despesas: 35000 },
  { month: "Out", receita: 52000, despesas: 33000 },
  { month: "Nov", receita: 47000, despesas: 34000 },
  { month: "Dez", receita: 55000, despesas: 38000 },
  { month: "Jan", receita: 58000, despesas: 36000 },
];

export const schoolSettings = {
  name: "Colégio FinEdu",
  cnpj: "12.345.678/0001-90",
  phone: "(11) 3456-7890",
  email: "contato@finedu.edu.br",
  address: "Rua da Educação, 123 - São Paulo, SP",
};
