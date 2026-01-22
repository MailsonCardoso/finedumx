# 💼 Exemplos Práticos de Adaptação do Sistema FinEdu

Este documento mostra exemplos concretos de como adaptar o sistema FinEdu para diferentes tipos de negócio.

---

## 🏋️ Exemplo 1: Academia/Ginásio

### Mapeamento de Conceitos

| FinEdu (Original) | Academia |
|-------------------|----------|
| Aluno | Membro/Cliente |
| Mensalidade | Plano Mensal |
| Matrícula | Taxa de Adesão |
| Rematrícula | Renovação Anual |
| Turma | Modalidade |

### Adaptações Necessárias

#### 1. Tipos de Pagamento Customizados

```typescript
// src/pages/Billing.tsx (renomeado de Tuition.tsx)
interface Billing {
  id: number;
  member_id: number; // era student_id
  reference: string;
  due_date: string;
  amount: number;
  status: 'pago' | 'pendente' | 'atrasado';
  type?: 'plano_mensal' | 'adesao' | 'personal' | 'avaliacao'; // customizado
  member: Member;
  last_notification_at?: string;
}
```

#### 2. Mensagem WhatsApp Customizada

```typescript
const buildWhatsAppUrl = (billing: Billing, paymentLink?: string) => {
  const gymName = "ACADEMIA STRONG FIT";
  const pix = "99999999999";
  
  let message = "";
  
  if (isOverdue) {
    message = `Olá *${billing.member.name}*! 💪\n\n` +
      `Identificamos que seu *${getServiceLabel(billing.type)}* de *${billing.reference}* ` +
      `está em aberto há *${daysOverdue} dias*.\n\n` +
      `Para continuar aproveitando todos os benefícios da ${gymName}, ` +
      `regularize sua situação:\n\n`;
      
    if (paymentLink) {
      message += `🔗 *Link de Pagamento*\n${paymentLink}\n\n_Aceita Pix, Cartão e Boleto_\n\n`;
    } else {
      message += `💰 *PIX*: ${pix}\n\n`;
    }
    
    message += `Qualquer dúvida, estamos à disposição!\n\n` +
      `#FiqueForte #NuncaDesista`;
  }
  
  return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
};

const getServiceLabel = (type: string) => {
  switch (type) {
    case 'plano_mensal': return 'Plano Mensal';
    case 'adesao': return 'Taxa de Adesão';
    case 'personal': return 'Personal Trainer';
    case 'avaliacao': return 'Avaliação Física';
    default: return type;
  }
};
```

#### 3. KPIs Específicos para Academia

```tsx
// Dashboard.tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
  <KPICard
    title="Membros Ativos"
    value={String(data?.kpis.activeMembers || 0)}
    trend={{ value: data?.kpis.membersTrend, direction: "up" }}
    icon={<Users className="w-5 h-5" />}
  />
  
  <KPICard
    title="Receita Mensal"
    value={formatCurrency(data?.kpis.monthlyRevenue || 0)}
    trend={{ value: data?.kpis.revenueTrend, direction: "up" }}
    icon={<DollarSign className="w-5 h-5" />}
  />
  
  <KPICard
    title="Taxa de Retenção"
    value={`${data?.kpis.retentionRate || 0}%`}
    trend={{ value: data?.kpis.retentionTrend, direction: "up" }}
    icon={<TrendingUp className="w-5 h-5" />}
  />
  
  <KPICard
    title="Inadimplência"
    value={formatCurrency(data?.kpis.overdueAmount || 0)}
    trend={{ value: data?.kpis.overdueTrend, direction: "down" }}
    icon={<AlertTriangle className="w-5 h-5" />}
  />
  
  <KPICard
    title="Novos Membros (Mês)"
    value={String(data?.kpis.newMembers || 0)}
    trend={{ value: "Este mês", direction: "neutral" }}
    icon={<UserPlus className="w-5 h-5" />}
  />
</div>
```

#### 4. Backend - Controller Customizado

```php
<?php
// app/Http/Controllers/BillingController.php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\Member;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    public function generateBatch(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required|string',
            'year' => 'required|integer',
            'month' => 'required|integer'
        ]);
        
        $members = Member::where('status', 'ativo')
            ->whereHas('plan') // Somente membros com plano ativo
            ->get();
        
        $count = 0;
        
        foreach ($members as $member) {
            // Evita duplicatas
            $exists = Billing::where('member_id', $member->id)
                ->where('reference', $validated['reference'])
                ->exists();
                
            if (!$exists) {
                Billing::create([
                    'member_id' => $member->id,
                    'reference' => $validated['reference'],
                    'due_date' => Carbon::create($validated['year'], $validated['month'], 10),
                    'amount' => $member->plan->price ?? 99.90,
                    'status' => 'pendente',
                    'type' => 'plano_mensal'
                ]);
                $count++;
            }
        }
        
        return response()->json([
            'message' => "{$count} cobranças geradas com sucesso!",
            'count' => $count
        ]);
    }
}
```

---

## 🏥 Exemplo 2: Clínica Médica/Odontológica

### Mapeamento de Conceitos

| FinEdu (Original) | Clínica |
|-------------------|---------|
| Aluno | Paciente |
| Mensalidade | Consulta/Procedimento |
| Turma | Especialidade |
| Professor | Profissional |

### Adaptações Necessárias

#### 1. Tipos de Serviços

```typescript
interface Appointment {
  id: number;
  patient_id: number;
  reference: string; // Ex: "Consulta - Dr. João - 15/01/2024"
  appointment_date: string;
  amount: number;
  status: 'pago' | 'pendente' | 'atrasado' | 'cancelado';
  type: 'consulta' | 'exame' | 'procedimento' | 'retorno';
  professional: string; // Nome do médico/dentista
  patient: Patient;
}
```

#### 2. Dashboard Customizado para Clínica

```tsx
// src/pages/ClinicDashboard.tsx

export default function ClinicDashboard() {
  const { data } = useQuery<ClinicDashboardData>({
    queryKey: ['clinic-dashboard'],
    queryFn: () => apiFetch('/dashboard/clinic-stats'),
  });

  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Painel Clínico</h1>
        
        {/* KPIs Específicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Consultas Hoje"
            value={String(data?.kpis.appointmentsToday || 0)}
            icon={<Calendar className="w-5 h-5" />}
          />
          
          <KPICard
            title="Receita do Mês"
            value={formatCurrency(data?.kpis.monthlyRevenue || 0)}
            icon={<DollarSign className="w-5 h-5" />}
          />
          
          <KPICard
            title="Pacientes Ativos"
            value={String(data?.kpis.activePatients || 0)}
            icon={<Users className="w-5 h-5" />}
          />
          
          <KPICard
            title="Pendências Financeiras"
            value={formatCurrency(data?.kpis.pendingAmount || 0)}
            icon={<AlertCircle className="w-5 h-5" />}
          />
        </div>
        
        {/* Próximas Consultas */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Horário</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status Pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.upcomingAppointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell>{formatTime(apt.appointment_date)}</TableCell>
                    <TableCell>{apt.patient.name}</TableCell>
                    <TableCell>{apt.professional}</TableCell>
                    <TableCell>{apt.type}</TableCell>
                    <TableCell>{getStatusBadge(apt.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
```

#### 3. Recibo Médico Customizado

```tsx
// src/pages/MedicalReceipts.tsx

const handlePrintReceipt = () => {
  window.print();
};

return (
  <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
    <DialogContent className="max-w-3xl">
      <div id="receipt-area" className="p-8 bg-white text-black">
        {/* Cabeçalho */}
        <div className="text-center border-b-2 border-black pb-6 mb-6">
          <h1 className="text-3xl font-bold">CLÍNICA MÉDICA SAÚDE TOTAL</h1>
          <p className="text-sm mt-2">CRM: 12345-SP | CNPJ: 12.345.678/0001-90</p>
          <p className="text-sm">Av. Paulista, 1000 - São Paulo - SP | Tel: (11) 3333-3333</p>
        </div>
        
        {/* Tipo de Documento */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">RECIBO DE PAGAMENTO</h2>
          <p className="text-sm text-gray-600">Nº {selectedReceipt?.id.toString().padStart(6, '0')}</p>
        </div>
        
        {/* Dados do Paciente */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Paciente:</span>
            <span>{selectedReceipt?.patient.name}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">CPF:</span>
            <span>{selectedReceipt?.patient.cpf}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Data do Procedimento:</span>
            <span>{formatDate(selectedReceipt?.appointment_date)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold">Profissional:</span>
            <span>{selectedReceipt?.professional}</span>
          </div>
        </div>
        
        {/* Descrição do Serviço */}
        <div className="mb-6">
          <h3 className="font-bold mb-2">Descrição do Serviço:</h3>
          <p className="bg-gray-100 p-4 rounded">
            {selectedReceipt?.type === 'consulta' && 'Consulta Médica'}
            {selectedReceipt?.type === 'exame' && 'Exame'}
            {selectedReceipt?.type === 'procedimento' && 'Procedimento'}
          </p>
        </div>
        
        {/* Valor */}
        <div className="text-right mb-8">
          <p className="text-lg font-semibold">VALOR TOTAL:</p>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(selectedReceipt?.amount || 0)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Forma de Pagamento: {selectedReceipt?.method}
          </p>
        </div>
        
        {/* Assinatura */}
        <div className="mt-16 text-center">
          <div className="w-64 border-t border-black mx-auto mb-2"></div>
          <p className="font-semibold">CLÍNICA MÉDICA SAÚDE TOTAL</p>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        
        {/* Observações */}
        <div className="mt-8 text-xs text-gray-500 text-center">
          <p>Este documento comprova o pagamento do serviço prestado.</p>
          <p>Guarde-o para fins de reembolso ou declaração de imposto de renda.</p>
        </div>
      </div>
      
      <DialogFooter>
        <Button onClick={handlePrintReceipt}>
          <Printer className="w-4 h-4 mr-2" /> Imprimir
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
```

---

## 💻 Exemplo 3: Sistema SaaS (Software como Serviço)

### Mapeamento de Conceitos

| FinEdu (Original) | SaaS |
|-------------------|------|
| Aluno | Usuário/Conta |
| Mensalidade | Assinatura |
| Matrícula | Ativação |
| Turma | Plano (Básico/Pro/Enterprise) |

### Adaptações Necessárias

#### 1. Interface de Assinatura

```typescript
interface Subscription {
  id: number;
  account_id: number;
  plan: 'basic' | 'pro' | 'enterprise';
  billing_cycle: 'monthly' | 'yearly';
  amount: number;
  status: 'active' | 'past_due' | 'canceled' | 'trial';
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  account: {
    id: number;
    company_name: string;
    email: string;
    plan_seats: number; // Quantidade de usuários
  };
}
```

#### 2. Dashboard SaaS com Métricas de Negócio

```tsx
// src/pages/SaaSDashboard.tsx

export default function SaaSDashboard() {
  const { data } = useQuery<SaaSDashboardData>({
    queryKey: ['saas-dashboard'],
    queryFn: () => apiFetch('/dashboard/saas-stats'),
  });

  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Dashboard SaaS</h1>
        
        {/* Métricas de Crescimento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="MRR (Receita Mensal Recorrente)"
            value={formatCurrency(data?.kpis.mrr || 0)}
            trend={{ value: data?.kpis.mrrGrowth, direction: "up" }}
            icon={<TrendingUp className="w-5 h-5" />}
            className="border-primary/20 bg-primary/5"
          />
          
          <KPICard
            title="Contas Ativas"
            value={String(data?.kpis.activeAccounts || 0)}
            trend={{ value: `+${data?.kpis.newAccounts} este mês`, direction: "up" }}
            icon={<Users className="w-5 h-5" />}
          />
          
          <KPICard
            title="Churn Rate"
            value={`${data?.kpis.churnRate || 0}%`}
            trend={{ value: data?.kpis.churnTrend, direction: "down" }}
            icon={<UserMinus className="w-5 h-5" />}
          />
          
          <KPICard
            title="LTV/CAC Ratio"
            value={`${data?.kpis.ltvCacRatio || 0}x`}
            trend={{ value: "Saudável acima de 3x", direction: "neutral" }}
            icon={<BarChart3 className="w-5 h-5" />}
          />
        </div>
        
        {/* Breakdown por Plano */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {data?.planBreakdown.map((plan) => (
                <div key={plan.name} className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{plan.name}</p>
                  <p className="text-2xl font-bold">{plan.accounts}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(plan.mrr)}/mês
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Assinaturas com Problemas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Assinaturas em Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Próxima Cobrança</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.atRiskSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.account.company_name}</TableCell>
                    <TableCell>{sub.plan}</TableCell>
                    <TableCell>
                      <StatusBadge status={sub.status === 'past_due' ? 'danger' : 'warning'}>
                        {sub.status === 'past_due' ? 'Vencido' : 'Cancelando'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{formatDate(sub.current_period_end)}</TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(sub.amount)}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4 mr-2" />
                        Contatar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
```

#### 3. Gestão de Assinaturas

```tsx
// src/pages/Subscriptions.tsx

export default function Subscriptions() {
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('all');
  
  const { data: subscriptions = [] } = useQuery<Subscription[]>({
    queryKey: ['subscriptions', selectedPlanFilter],
    queryFn: () => apiFetch(`/subscriptions?plan=${selectedPlanFilter}`),
  });
  
  const handleUpgradePlan = (subscriptionId: number, newPlan: string) => {
    // Lógica para upgrade de plano
  };
  
  const handleCancelSubscription = (subscriptionId: number) => {
    // Lógica para cancelamento
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Assinaturas</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todas as assinaturas ativas
            </p>
          </div>
          
          <Select value={selectedPlanFilter} onValueChange={setSelectedPlanFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Planos</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-4">
          {subscriptions.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{sub.account.company_name}</h3>
                      <Badge variant={sub.plan === 'enterprise' ? 'default' : 'secondary'}>
                        {sub.plan.toUpperCase()}
                      </Badge>
                      {sub.status === 'trial' && (
                        <Badge variant="outline">
                          Trial até {formatDate(sub.trial_end!)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Ciclo</p>
                        <p className="font-medium">
                          {sub.billing_cycle === 'monthly' ? 'Mensal' : 'Anual'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor</p>
                        <p className="font-bold text-lg">{formatCurrency(sub.amount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Usuários</p>
                        <p className="font-medium">{sub.account.plan_seats}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Renovação</p>
                        <p className="font-medium">{formatDate(sub.current_period_end)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {sub.plan !== 'enterprise' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpgradePlan(sub.id, 'pro')}
                      >
                        <ArrowUp className="w-4 h-4 mr-2" />
                        Upgrade
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCancelSubscription(sub.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
```

#### 4. Backend - Webhook do Stripe/Mercado Pago

```php
<?php
// app/Http/Controllers/WebhookController.php

namespace App\Http\Controllers;

use App\Models\Subscription;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    public function handleStripeWebhook(Request $request)
    {
        $payload = $request->all();
        
        switch ($payload['type']) {
            case 'invoice.payment_succeeded':
                $this->handlePaymentSucceeded($payload['data']['object']);
                break;
                
            case 'invoice.payment_failed':
                $this->handlePaymentFailed($payload['data']['object']);
                break;
                
            case 'customer.subscription.deleted':
                $this->handleSubscriptionCanceled($payload['data']['object']);
                break;
        }
        
        return response()->json(['status' => 'success']);
    }
    
    private function handlePaymentSucceeded($invoice)
    {
        $subscription = Subscription::where('stripe_subscription_id', $invoice['subscription'])->first();
        
        if ($subscription) {
            $subscription->update([
                'status' => 'active',
                'current_period_start' => date('Y-m-d', $invoice['period_start']),
                'current_period_end' => date('Y-m-d', $invoice['period_end']),
            ]);
            
            // Registrar pagamento
            Payment::create([
                'account_id' => $subscription->account_id,
                'subscription_id' => $subscription->id,
                'amount' => $invoice['amount_paid'] / 100,
                'status' => 'confirmado',
                'payment_date' => now(),
                'method' => 'cartao_credito',
                'type' => 'Assinatura ' . ucfirst($subscription->plan)
            ]);
        }
    }
    
    private function handlePaymentFailed($invoice)
    {
        $subscription = Subscription::where('stripe_subscription_id', $invoice['subscription'])->first();
        
        if ($subscription) {
            $subscription->update(['status' => 'past_due']);
            
            // Enviar email de alerta
            // Mail::to($subscription->account->email)->send(new PaymentFailedMail($subscription));
        }
    }
}
```

---

## 🎓 Exemplo 4: Escola de Idiomas

### Adaptações Específicas

#### 1. Múltiplos Cursos por Aluno

```typescript
interface StudentEnrollment {
  id: number;
  student_id: number;
  course: {
    id: number;
    name: string; // "Inglês Básico", "Espanhol Intermediário"
    level: string;
    monthly_fee: number;
  };
  start_date: string;
  status: 'ativo' | 'concluido' | 'pausado';
}

interface Tuition {
  id: number;
  student_id: number;
  enrollment_id: number; // Vínculo com matrícula específica
  reference: string;
  due_date: string;
  amount: number;
  status: 'pago' | 'pendente' | 'atrasado';
  student: Student;
  enrollment: StudentEnrollment;
}
```

#### 2. Geração de Mensalidades por Curso

```tsx
// src/pages/Tuition.tsx - método adaptado

const handleGenerateClick = () => {
  const reference = `${monthName}/${generateYear}`;
  
  // Adicionar seletor de curso
  generateMutation.mutate({
    reference,
    year: parseInt(generateYear),
    month: parseInt(generateMonth),
    course_id: selectedCourseId, // NOVO
  });
};

// Componente de seleção
<div className="space-y-2">
  <Label htmlFor="course_filter">Curso</Label>
  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
    <SelectTrigger id="course_filter">
      <SelectValue placeholder="Todos os cursos" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Todos os Cursos</SelectItem>
      {courses.map(course => (
        <SelectItem key={course.id} value={course.id.toString()}>
          {course.name} - {course.level}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

#### 3. Backend com Lógica de Múltiplos Cursos

```php
<?php
// app/Http/Controllers/TuitionController.php

public function generateBatch(Request $request)
{
    $validated = $request->validate([
        'reference' => 'required|string',
        'year' => 'required|integer',
        'month' => 'required|integer',
        'course_id' => 'nullable|exists:courses,id'
    ]);
    
    // Buscar matrículas ativas
    $enrollmentsQuery = StudentEnrollment::where('status', 'ativo');
    
    if ($request->filled('course_id') && $request->course_id !== 'all') {
        $enrollmentsQuery->where('course_id', $request->course_id);
    }
    
    $enrollments = $enrollmentsQuery->with(['student', 'course'])->get();
    $count = 0;
    
    foreach ($enrollments as $enrollment) {
        // Evita duplicatas
        $exists = Tuition::where('enrollment_id', $enrollment->id)
            ->where('reference', $validated['reference'])
            ->exists();
            
        if (!$exists) {
            Tuition::create([
                'student_id' => $enrollment->student_id,
                'enrollment_id' => $enrollment->id,
                'reference' => $validated['reference'],
                'due_date' => Carbon::create($validated['year'], $validated['month'], 10),
                'amount' => $enrollment->course->monthly_fee,
                'status' => 'pendente',
                'type' => 'mensalidade'
            ]);
            $count++;
        }
    }
    
    return response()->json([
        'message' => "{$count} mensalidades geradas com sucesso!",
        'count' => $count
    ]);
}
```

---

## 🏠 Exemplo 5: Condomínio

### Adaptações Necessárias

#### 1. Interface de Cobrança Condominial

```typescript
interface CondoCharge {
  id: number;
  unit_id: number; // Unidade (apartamento/casa)
  reference: string; // "Jan/2024"
  due_date: string;
  amount: number;
  status: 'pago' | 'pendente' | 'atrasado';
  type: 'condominio' | 'agua' | 'multa' | 'extraordinaria';
  unit: {
    id: number;
    number: string; // "Apto 101"
    owner_name: string;
    phone: string;
    email: string;
  };
  breakdown?: {
    base_fee: number;
    water: number;
    extra_charges: number;
    penalties: number;
  };
}
```

#### 2. Dashboard para Síndico

```tsx
export default function CondoDashboard() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Painel do Condomínio</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Taxa de Inadimplência"
            value={`${data?.kpis.defaultRate || 0}%`}
            trend={{ value: data?.kpis.defaultTrend, direction: "down" }}
            icon={<AlertTriangle className="w-5 h-5" />}
          />
          
          <KPICard
            title="Arrecadação do Mês"
            value={formatCurrency(data?.kpis.monthlyCollection || 0)}
            icon={<DollarSign className="w-5 h-5" />}
          />
          
          <KPICard
            title="Unidades Inadimplentes"
            value={String(data?.kpis.defaultUnits || 0)}
            icon={<Home className="w-5 h-5" />}
          />
          
          <KPICard
            title="Saldo em Caixa"
            value={formatCurrency(data?.kpis.balance || 0)}
            icon={<Wallet className="w-5 h-5" />}
          />
        </div>
        
        {/* Detalhamento por Torre/Bloco */}
        <Card>
          <CardHeader>
            <CardTitle>Arrecadação por Bloco</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.blockBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="block" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="collected" fill="#10b981" name="Arrecadado" />
                <Bar dataKey="pending" fill="#f59e0b" name="Pendente" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
```

---

## 📝 Checklist de Escolha de Exemplo

Use este checklist para identificar qual exemplo se aproxima mais do seu caso:

### Seu negócio é recorrente (mensalidades)?
- ✅ Sim → Use estrutura base de Mensalidades
- ❌ Não → Adapte para transações pontuais

### Tem múltiplos tipos de serviços?
- ✅ Sim → Exemplo Clínica ou Escola de Idiomas
- ❌ Não → Estrutura mais simples (Academia)

### Precisa de métricas avançadas (MRR, Churn, LTV)?
- ✅ Sim → Exemplo SaaS
- ❌ Não → Dashboard básico com KPIs financeiros

### Tem integração com gateways de pagamento?
- ✅ Sim → Mantenha integração Mercado Pago/Stripe
- ❌ Não → Simplifique para registro manual

### Precisa de notificações automatizadas?
- ✅ Sim → Mantenha sistema de WhatsApp
- ❌ Não → Remova funcionalidade de notificações

---

## 🎯 Próximos Passos

1. **Escolha o exemplo** mais próximo do seu negócio
2. **Faça um fork/clone** do repositório FinEdu
3. **Aplique as adaptações** sugeridas neste guia
4. **Teste localmente** antes de colocar em produção
5. **Customize** conforme necessidades específicas

Boa sorte com seu projeto! 🚀
