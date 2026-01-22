# 📋 Guia de Adaptação do Sistema FinEdu

## 📖 Sumário
1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Componentes Principais](#componentes-principais)
3. [Preparação para Adaptação](#preparação-para-adaptação)
4. [Adaptação do Dashboard](#adaptação-do-dashboard)
5. [Adaptação de Mensalidades](#adaptação-de-mensalidades)
6. [Adaptação de Recibos](#adaptação-de-recibos)
7. [Adaptação de Pagamentos](#adaptação-de-pagamentos)
8. [Backend Laravel - Rotas e Controllers](#backend-laravel)
9. [Banco de Dados](#banco-de-dados)
10. [Customizações e Extensões](#customizações-e-extensões)

---

## 🎯 Visão Geral do Sistema

O **FinEdu** é um sistema completo de gestão financeira educacional com os seguintes componentes:

### Frontend (React + TypeScript + Vite)
- **Dashboard**: Visão geral com KPIs, pendências prioritárias e pagamentos recentes
- **Mensalidades (Tuition)**: Gestão completa de mensalidades, com geração em lote, cobranças via WhatsApp e integração com Mercado Pago
- **Recibos (Receipts)**: Visualização e impressão de recibos de pagamentos confirmados
- **Pagamentos (Payments)**: Histórico detalhado de todos os pagamentos recebidos

### Backend (Laravel 11)
- API RESTful completa
- Sistema de autenticação com Sanctum
- Integração com Mercado Pago
- Envio de notificações via WhatsApp
- Geração de recibos

---

## 🧩 Componentes Principais

### 1. **Dashboard** (`src/pages/Dashboard.tsx`)
**Funcionalidades:**
- 📊 **5 KPIs principais:**
  - Caixa Total Acumulado
  - Recebido no Mês (com breakdown de matrículas/rematrículas)
  - Mensalidades Vencendo
  - Inadimplência Total
  - Alunos Ativos
- 🚨 **Pendências Prioritárias**: Lista de mensalidades atrasadas ordenadas por prioridade
- 💰 **Pagamentos Recentes**: Últimos pagamentos confirmados
- 👁️ **StudentSheet**: Modal lateral com informações completas do aluno ao clicar no nome

**Dependências:**
```typescript
- React Query (@tanstack/react-query)
- Framer Motion (animações)
- Recharts (gráficos - preparado mas não utilizado no código atual)
- API endpoint: GET /api/dashboard/stats
```

**Interfaces TypeScript:**
```typescript
interface DashboardData {
  kpis: {
    totalRevenue: number;
    monthlyRevenue: number;
    matriculaRevenue: number;
    rematriculaRevenue: number;
    revenueTrend: string;
    overdueAmount: number;
    overdueTrend: string;
    pendingAmount: number;
    pendingTrend: string;
    activeStudents: number;
    studentsTrend: string;
  };
  priority: {
    totalAmount: number;
    count: number;
    details: Array<{
      id: number;
      student_id: number;
      studentName: string;
      due_date: string;
      amount: number;
      reference: string;
      daysOverdue: number;
    }>;
  };
  recentPayments: Array<{
    id: string;
    student_id: number;
    studentName: string;
    type: string;
    amount: number;
    status: string;
  }>;
}
```

---

### 2. **Mensalidades** (`src/pages/Tuition.tsx`)
**Funcionalidades:**
- 📝 **Gestão de Mensalidades:**
  - Visualização em tabela com ordenação inteligente (atrasadas → pendentes → pagas)
  - Filtros por status e busca por nome/referência
  - Badges visuais de status (Pago/Pendente/Atrasado)
  
- 💵 **Geração de Mensalidades:**
  - Geração em lote para todos os alunos ativos
  - Especificação de mês/ano
  - Criação de cobranças avulsas (matrículas, rematrículas, mensalidades individuais)

- 📱 **Integração WhatsApp:**
  - Envio automático de cobranças com link de pagamento do Mercado Pago
  - Mensagens contextualizadas (responsável vs aluno, atrasado vs pendente)
  - Anti-spam: Evita envios múltiplos em menos de 5 dias
  - "Mutirão de Cobrança": Notificação em massa de todos os inadimplentes

- 💳 **Integração Mercado Pago:**
  - Geração de link de pagamento seguro
  - Suporte a Pix, Cartão e Boleto
  - Inclusão automática do link na mensagem do WhatsApp

- 🧾 **Confirmação de Pagamento:**
  - Modal de confirmação com detalhes da mensalidade
  - Seleção de forma de pagamento (Pix, Dinheiro, Cartão, Transferência)
  - Registro automático do pagamento

**API Endpoints Utilizados:**
```
GET  /api/tuitions?search=&status=
POST /api/tuitions/generate-batch
POST /api/tuitions (cobrança individual)
POST /api/tuitions/{id}/notify
POST /api/tuitions/{id}/payment-link
POST /api/payments
DELETE /api/tuitions/{id}
GET  /api/students
GET  /api/settings
```

**Interfaces TypeScript:**
```typescript
interface Tuition {
  id: number;
  student_id: number;
  reference: string;
  due_date: string;
  amount: number;
  status: 'pago' | 'pendente' | 'atrasado';
  type?: 'mensalidade' | 'matricula' | 'rematricula';
  student: Student;
  last_notification_at?: string;
}

interface Student {
  id: number;
  name: string;
  phone: string;
  active_responsible?: string;
  status: string;
}
```

---

### 3. **Recibos** (`src/pages/Receipts.tsx`)
**Funcionalidades:**
- 📄 **Visualização de Recibos:**
  - Grid responsivo com cards de recibos
  - Somente pagamentos confirmados
  - Numeração sequencial automática

- 🖨️ **Impressão de Recibos:**
  - Modal com preview do recibo
  - Layout profissional pronto para impressão
  - CSS específico para @media print
  - Dados da escola (nome, endereço, CNPJ, telefone)

**API Endpoints Utilizados:**
```
GET /api/payments
GET /api/settings
```

**Estrutura do Recibo:**
```
- Cabeçalho com dados da escola
- Número do recibo
- Valor pago
- Nome do aluno
- Tipo de pagamento
- Data de emissão
- Assinatura da escola
```

---

### 4. **Pagamentos** (`src/pages/Payments.tsx`)
**Funcionalidades:**
- 📊 **Resumo Financeiro:**
  - Total recebido hoje
  - Total recebido no mês (até dia 30)
  
- 📋 **Histórico Completo:**
  - Tabela com todos os pagamentos
  - Informações: Aluno, Tipo, Método, Data, Hora, Valor, Status
  - Ícones visuais para cada método de pagamento
  - Badges de status coloridos

**API Endpoints Utilizados:**
```
GET /api/payments
GET /api/tuitions
```

**Métodos de Pagamento Suportados:**
- PIX
- Boleto
- Cartão de Crédito
- Cartão de Débito
- Dinheiro
- Transferência Bancária

---

## 🔧 Preparação para Adaptação

### Passo 1: Identificar o Que Você Precisa

Antes de começar, responda:

1. **Qual é o domínio do seu sistema?**
   - Escola/Curso → Use como está
   - Outro negócio → Adapte terminologia (aluno → cliente, mensalidade → cobrança, etc.)

2. **Quais componentes você precisa?**
   - [ ] Dashboard com KPIs
   - [ ] Gestão de mensalidades/cobranças
   - [ ] Recibos
   - [ ] Histórico de pagamentos
   - [ ] Integração WhatsApp
   - [ ] Integração Mercado Pago

3. **Você já tem um backend?**
   - ✅ Sim → Adapte apenas o frontend
   - ❌ Não → Use o backend Laravel fornecido

### Passo 2: Estrutura de Pastas Recomendada

```
seu-projeto/
├── src/
│   ├── pages/              # Páginas principais
│   │   ├── Dashboard.tsx
│   │   ├── Tuition.tsx     # ou Billing.tsx
│   │   ├── Receipts.tsx
│   │   └── Payments.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   └── MainLayout.tsx
│   │   ├── ui/            # Shadcn/UI components
│   │   │   ├── kpi-card.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   └── table.tsx
│   │   └── StudentSheet.tsx  # ou ClientSheet.tsx
│   └── lib/
│       └── api-client.ts
└── finedumx_beck/         # Backend Laravel (opcional)
```

### Passo 3: Dependências Necessárias

**Frontend:**
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.x",
    "@tanstack/react-query": "^5.x",
    "framer-motion": "^11.x",
    "recharts": "^2.x",
    "lucide-react": "latest",
    "sonner": "^1.x"
  }
}
```

**Backend (se usar Laravel):**
```json
{
  "require": {
    "php": "^8.2",
    "laravel/framework": "^11.0",
    "laravel/sanctum": "^4.0",
    "mercadopago/dx-php": "^3.0"
  }
}
```

---

## 📊 Adaptação do Dashboard

### 1. Copiar o Arquivo Base
```bash
cp src/pages/Dashboard.tsx seu-projeto/src/pages/Dashboard.tsx
```

### 2. Adaptar Terminologia

**Se for uma escola/curso:**
- Manter como está ✅

**Se for outro negócio (ex: gym, clínica, SaaS):**

| Original | Adaptação |
|----------|-----------|
| Alunos Ativos | Clientes Ativos / Membros Ativos |
| Mensalidades | Cobranças / Assinaturas |
| Inadimplência | Atrasos / Pendências |
| Matrícula/Rematrícula | Taxa de Adesão / Renovação |

### 3. Configurar API Endpoint

No seu backend, crie um endpoint que retorne dados no formato:

```php
// Laravel Example: app/Http/Controllers/DashboardController.php
public function stats()
{
    return response()->json([
        'kpis' => [
            'totalRevenue' => $this->getTotalRevenue(),
            'monthlyRevenue' => $this->getMonthlyRevenue(),
            'matriculaRevenue' => $this->getMatriculaRevenue(),
            'rematriculaRevenue' => $this->getRematriculaRevenue(),
            'revenueTrend' => '+12%',
            'overdueAmount' => $this->getOverdueAmount(),
            'overdueTrend' => '-5%',
            'pendingAmount' => $this->getPendingAmount(),
            'pendingTrend' => '3 pendentes',
            'activeStudents' => $this->getActiveStudents(),
            'studentsTrend' => '+2 este mês',
        ],
        'priority' => [
            'totalAmount' => $this->getPriorityTotal(),
            'count' => $this->getPriorityCount(),
            'details' => $this->getPriorityDetails(), // Array de mensalidades atrasadas
        ],
        'recentPayments' => $this->getRecentPayments(), // Últimos 5 pagamentos
        'analysis' => [] // Opcional: dados para gráficos
    ]);
}
```

### 4. Personalizar KPIs

Se você quiser adicionar/remover KPIs, modifique a seção:

```tsx
{/* KPI Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
  <KPICard
    index={0}
    title="Seu Título Aqui"
    value={formatCurrency(data?.kpis.seuValor || 0)}
    trend={{ value: "Tendência", direction: "up" }}
    icon={<SeuIcone className="w-5 h-5" />}
  />
  {/* Adicione mais KPIs conforme necessário */}
</div>
```

---

## 💰 Adaptação de Mensalidades

### 1. Renomear para Seu Contexto

**Para um negócio genérico:**
```bash
mv src/pages/Tuition.tsx src/pages/Billing.tsx
```

Então, faça busca e substituição:
- `Tuition` → `Billing` ou `Charge`
- `Mensalidade` → `Cobrança` ou `Assinatura`
- `Aluno` → `Cliente`

### 2. Configurar Tipos de Cobrança

Modifique o tipo `type` para refletir seu negócio:

```typescript
// Original
type?: 'mensalidade' | 'matricula' | 'rematricula'

// Exemplo para academia
type?: 'mensalidade' | 'plano_anual' | 'personal'

// Exemplo para clínica
type?: 'consulta' | 'exame' | 'procedimento'

// Exemplo para SaaS
type?: 'assinatura' | 'upgrade' | 'one_time'
```

### 3. Customizar Mensagens WhatsApp

A função `buildWhatsAppUrl` é altamente customizável. Adapte as mensagens em:

```tsx
const buildWhatsAppUrl = (tuition: Tuition, paymentLink?: string) => {
  // ... código existente ...
  
  // Adapte estas mensagens:
  if (isOverdue) {
    if (hasResp) {
      message = `Olá *${respName}*! responsável de *${studentName}*.\\n\\nNotamos que a ${chargeLabel} de *${tuition.reference}* ${overduePhrase}.`;
      // Altere para: "Olá *${clientName}*! Sua assinatura referente a *${period}* está em atraso..."
    }
  }
  
  // ... resto do código
};
```

### 4. Desativar Funcionalidades Opcionais

**Se você NÃO precisa de integração com Mercado Pago:**

Remova ou comente:
```tsx
// Remova esta linha
const paymentLinkMutation = useMutation({...});

// E simplifique handleWhatsAppClick:
const handleWhatsAppClick = (tuition: Tuition) => {
  const whatsappUrl = buildWhatsAppUrl(tuition); // Sem paymentLink
  window.open(whatsappUrl, '_blank');
};
```

**Se você NÃO precisa do "Mutirão de Cobrança":**

Remova:
```tsx
// Remova o botão:
<Button onClick={handleStartBulk} ...>
  Mutirão de Cobrança
</Button>

// E os estados relacionados:
const [isBulkNotifyOpen, setIsBulkNotifyOpen] = useState(false);
const [bulkNotifyIndex, setBulkNotifyIndex] = useState(0);
const [bulkQueue, setBulkQueue] = useState<Tuition[]>([]);
```

### 5. Backend - Rotas Necessárias

**Laravel Routes (routes/api.php):**
```php
Route::middleware('auth:sanctum')->group(function () {
    // Mensalidades
    Route::get('/tuitions', [TuitionController::class, 'index']);
    Route::post('/tuitions', [TuitionController::class, 'store']);
    Route::delete('/tuitions/{id}', [TuitionController::class, 'destroy']);
    Route::post('/tuitions/generate-batch', [TuitionController::class, 'generateBatch']);
    Route::post('/tuitions/{id}/notify', [TuitionController::class, 'notify']);
    Route::post('/tuitions/{id}/payment-link', [TuitionController::class, 'generatePaymentLink']);
    
    // Pagamentos
    Route::post('/payments', [PaymentController::class, 'store']);
    
    // Alunos/Clientes
    Route::get('/students', [StudentController::class, 'index']);
    
    // Configurações
    Route::get('/settings', [SettingsController::class, 'show']);
});
```

---

## 🧾 Adaptação de Recibos

### 1. Copiar e Adaptar

```bash
cp src/pages/Receipts.tsx seu-projeto/src/pages/Receipts.tsx
```

### 2. Personalizar Layout do Recibo

Modifique a seção `<div id="receipt-area">`:

```tsx
<div className="text-center border-b-2 border-black pb-6 mb-6">
  <h1 className="text-3xl font-bold uppercase tracking-wider">
    {schoolData?.name || "SUA EMPRESA AQUI"}
  </h1>
  <p className="text-sm text-gray-600 mt-2">
    {schoolData?.address || "Endereço Completo"}
  </p>
  <p className="text-sm text-gray-600">
    CNPJ: {schoolData?.cnpj || "00.000.000/0000-00"} | 
    Tel: {schoolData?.phone || "(00) 00000-0000"}
  </p>
</div>
```

### 3. Adicionar Campos Personalizados

Se você precisa de informações adicionais no recibo:

```tsx
<div className="space-y-6 text-lg leading-relaxed">
  <p>
    Recebemos de <span className="font-bold">{selectedReceipt?.student?.name}</span>
  </p>
  <p>
    A importância de <span className="font-bold">{formatCurrency(...)}</span>
  </p>
  <p>
    Referente à <span className="font-bold">{selectedReceipt?.type}</span>.
  </p>
  
  {/* ADICIONE AQUI */}
  <p>
    Método de Pagamento: <span className="font-bold">{selectedReceipt?.method}</span>
  </p>
  <p>
    Vencimento: <span className="font-bold">{formatDate(selectedReceipt?.due_date)}</span>
  </p>
</div>
```

---

## 💳 Adaptação de Pagamentos

### 1. Copiar Arquivo

```bash
cp src/pages/Payments.tsx seu-projeto/src/pages/Payments.tsx
```

### 2. Adicionar/Remover Métodos de Pagamento

Modifique as funções `getMethodIcon` e `getMethodLabel`:

```tsx
// Adicionar novo método (ex: "vale_refeicao")
const getMethodIcon = (method: string) => {
  switch (method) {
    // ... métodos existentes ...
    case "vale_refeicao": return <Ticket className="w-4 h-4 text-orange-500" />;
    default: return null;
  }
};

const getMethodLabel = (method: string) => {
  switch (method) {
    // ... métodos existentes ...
    case "vale_refeicao": return "Vale Refeição";
    default: return method;
  }
};
```

### 3. Customizar KPIs de Pagamento

Adicione novos KPIs se necessário:

```tsx
// Exemplo: Adicionar "Média de Ticket"
const averageTicket = payments.length > 0
  ? payments.reduce((sum, p) => sum + Number(p.amount), 0) / payments.length
  : 0;

<Card className="shadow-soft border-border/50 bg-card">
  <CardContent className="p-4 flex items-center gap-4">
    <div className="p-3 rounded-lg bg-blue-500/10">
      <TrendingUp className="w-5 h-5 text-blue-500" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground font-medium">Ticket Médio</p>
      <p className="text-2xl font-bold text-blue-600">{formatCurrency(averageTicket)}</p>
    </div>
  </CardContent>
</Card>
```

---

## 🗄️ Backend Laravel

### Estrutura Completa do Backend

```
finedumx_beck/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── DashboardController.php
│   │       ├── TuitionController.php
│   │       ├── PaymentController.php
│   │       ├── StudentController.php
│   │       └── SettingsController.php
│   └── Models/
│       ├── Tuition.php
│       ├── Payment.php
│       ├── Student.php
│       └── Setting.php
├── database/
│   └── migrations/
│       ├── xxxx_create_students_table.php
│       ├── xxxx_create_tuitions_table.php
│       ├── xxxx_create_payments_table.php
│       └── xxxx_create_settings_table.php
└── routes/
    └── api.php
```

### Exemplo de Controller Completo

**TuitionController.php**
```php
<?php

namespace App\Http\Controllers;

use App\Models\Tuition;
use App\Models\Student;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TuitionController extends Controller
{
    public function index(Request $request)
    {
        $query = Tuition::with('student')->orderBy('due_date', 'desc');
        
        // Filtro por status
        if ($request->has('status') && $request->status !== 'todos') {
            $query->where('status', $request->status);
        }
        
        // Busca por nome do aluno ou referência
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->whereHas('student', function($sq) use ($request) {
                    $sq->where('name', 'like', '%' . $request->search . '%');
                })->orWhere('reference', 'like', '%' . $request->search . '%');
            });
        }
        
        return $query->get();
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'reference' => 'required|string',
            'due_date' => 'required|date',
            'amount' => 'required|numeric',
            'type' => 'required|in:mensalidade,matricula,rematricula'
        ]);
        
        $tuition = Tuition::create($validated);
        return response()->json($tuition->load('student'), 201);
    }
    
    public function generateBatch(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required|string',
            'year' => 'required|integer',
            'month' => 'required|integer|min:1|max:12'
        ]);
        
        $students = Student::where('status', 'ativo')->get();
        $count = 0;
        
        foreach ($students as $student) {
            // Evita duplicatas
            $exists = Tuition::where('student_id', $student->id)
                ->where('reference', $validated['reference'])
                ->exists();
                
            if (!$exists) {
                Tuition::create([
                    'student_id' => $student->id,
                    'reference' => $validated['reference'],
                    'due_date' => Carbon::create($validated['year'], $validated['month'], 10),
                    'amount' => $student->monthly_fee ?? 150.00,
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
    
    public function notify($id)
    {
        $tuition = Tuition::findOrFail($id);
        $tuition->update(['last_notification_at' => now()]);
        
        return response()->json(['message' => 'Notificação registrada']);
    }
    
    public function generatePaymentLink($id)
    {
        $tuition = Tuition::with('student')->findOrFail($id);
        
        // Integração com Mercado Pago
        try {
            $mp = new \MercadoPago\SDK(env('MERCADOPAGO_ACCESS_TOKEN'));
            
            $preference = new \MercadoPago\Preference();
            $item = new \MercadoPago\Item();
            $item->title = "Mensalidade - " . $tuition->reference;
            $item->quantity = 1;
            $item->unit_price = (float) $tuition->amount;
            
            $preference->items = [$item];
            $preference->payer = [
                'name' => $tuition->student->name,
                'email' => $tuition->student->email ?? 'noemail@example.com',
                'phone' => [
                    'number' => $tuition->student->phone
                ]
            ];
            
            $preference->save();
            
            return response()->json([
                'url' => $preference->init_point,
                'preference_id' => $preference->id
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao gerar link de pagamento',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    public function destroy($id)
    {
        $tuition = Tuition::findOrFail($id);
        $tuition->delete();
        
        return response()->json(['message' => 'Mensalidade excluída com sucesso']);
    }
}
```

---

## 💾 Banco de Dados

### Migrations Necessárias

**1. Students Table**
```php
Schema::create('students', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->nullable();
    $table->string('phone');
    $table->string('cpf')->nullable();
    $table->string('active_responsible')->nullable();
    $table->decimal('monthly_fee', 10, 2)->default(150.00);
    $table->enum('status', ['ativo', 'inativo'])->default('ativo');
    $table->timestamps();
});
```

**2. Tuitions Table**
```php
Schema::create('tuitions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('student_id')->constrained()->onDelete('cascade');
    $table->string('reference'); // Ex: "Jan/2024"
    $table->date('due_date');
    $table->decimal('amount', 10, 2);
    $table->enum('status', ['pago', 'pendente', 'atrasado'])->default('pendente');
    $table->enum('type', ['mensalidade', 'matricula', 'rematricula'])->default('mensalidade');
    $table->timestamp('last_notification_at')->nullable();
    $table->timestamps();
    
    $table->index(['student_id', 'reference']);
    $table->index('status');
});
```

**3. Payments Table**
```php
Schema::create('payments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('student_id')->constrained()->onDelete('cascade');
    $table->foreignId('tuition_id')->nullable()->constrained()->onDelete('set null');
    $table->string('type'); // Ex: "Mensalidade Jan/2024"
    $table->decimal('amount', 10, 2);
    $table->enum('method', ['pix', 'dinheiro', 'cartao_credito', 'cartao_debito', 'transferencia', 'boleto']);
    $table->date('payment_date');
    $table->enum('status', ['confirmado', 'processando', 'falha'])->default('confirmado');
    $table->timestamps();
    
    $table->index('payment_date');
    $table->index('status');
});
```

**4. Settings Table**
```php
Schema::create('settings', function (Blueprint $table) {
    $table->id();
    $table->string('name')->default('Minha Empresa');
    $table->string('address')->nullable();
    $table->string('cnpj')->nullable();
    $table->string('phone')->nullable();
    $table->string('pix_key')->nullable();
    $table->string('email')->nullable();
    $table->timestamps();
});
```

---

## 🎨 Customizações e Extensões

### 1. Alterar Tema de Cores

No `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // Adicione suas cores customizadas
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ... etc
        }
      }
    }
  }
}
```

### 2. Adicionar Novos KPIs

No `Dashboard.tsx`:

```tsx
// Adicione novo campo na interface
interface DashboardData {
  kpis: {
    // ... existentes
    newMetric: number;
  };
}

// Adicione novo KPICard
<KPICard
  index={5}
  title="Nova Métrica"
  value={data?.kpis.newMetric || 0}
  trend={{ value: "+10%", direction: "up" }}
  icon={<YourIcon className="w-5 h-5" />}
/>
```

### 3. Criar Relatórios Customizados

Crie um novo componente `Reports.tsx`:

```tsx
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export default function Reports() {
  const { data: reportData } = useQuery({
    queryKey: ['reports'],
    queryFn: () => apiFetch('/reports/monthly'),
  });
  
  return (
    <MainLayout>
      {/* Seu conteúdo de relatórios */}
    </MainLayout>
  );
}
```

### 4. Integrar com Outros Gateways de Pagamento

Se quiser usar **Stripe** ao invés de Mercado Pago:

**Backend (Laravel):**
```php
use Stripe\Stripe;
use Stripe\Checkout\Session;

public function generatePaymentLink($id)
{
    Stripe::setApiKey(env('STRIPE_SECRET'));
    
    $tuition = Tuition::with('student')->findOrFail($id);
    
    $session = Session::create([
        'payment_method_types' => ['card'],
        'line_items' => [[
            'price_data' => [
                'currency' => 'brl',
                'product_data' => [
                    'name' => "Mensalidade - {$tuition->reference}",
                ],
                'unit_amount' => $tuition->amount * 100,
            ],
            'quantity' => 1,
        ]],
        'mode' => 'payment',
        'success_url' => route('payment.success'),
        'cancel_url' => route('payment.cancel'),
    ]);
    
    return response()->json(['url' => $session->url]);
}
```

---

## 📝 Checklist de Adaptação

### ✅ Frontend

- [ ] Copiar componentes necessários (`Dashboard`, `Tuition`, `Receipts`, `Payments`)
- [ ] Adaptar terminologia para seu negócio
- [ ] Configurar rotas no `App.tsx` ou equivalente
- [ ] Instalar dependências (`@tanstack/react-query`, `framer-motion`, etc.)
- [ ] Configurar `api-client.ts` com URL do seu backend
- [ ] Customizar mensagens do WhatsApp (se aplicável)
- [ ] Ajustar tema de cores no Tailwind
- [ ] Testar responsividade em mobile

### ✅ Backend (Laravel)

- [ ] Criar migrations para tabelas (`students`, `tuitions`, `payments`, `settings`)
- [ ] Criar Models com relacionamentos
- [ ] Criar Controllers com métodos CRUD
- [ ] Definir rotas em `api.php`
- [ ] Configurar CORS
- [ ] Configurar Sanctum para autenticação
- [ ] (Opcional) Configurar Mercado Pago ou outro gateway
- [ ] Criar seeders para dados de teste

### ✅ Integrações

- [ ] Configurar credenciais do Mercado Pago (se usar)
- [ ] Testar envio de mensagens WhatsApp
- [ ] Configurar geração de recibos em PDF (opcional)
- [ ] Implementar notificações por email (opcional)

### ✅ Deploy

- [ ] Configurar variáveis de ambiente (`.env`)
- [ ] Build do frontend (`npm run build`)
- [ ] Deploy do backend Laravel
- [ ] Configurar domínio e SSL
- [ ] Testar em produção

---

## 🆘 Suporte e Troubleshooting

### Problema 1: "CORS Error" ao chamar API

**Solução:** Configure CORS no Laravel (`config/cors.php`):
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:5173', 'https://seu-dominio.com'],
'supports_credentials' => true,
```

### Problema 2: React Query não atualiza dados

**Solução:** Certifique-se de invalidar queries após mutações:
```tsx
const mutation = useMutation({
  mutationFn: ...,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tuitions'] });
  }
});
```

### Problema 3: WhatsApp não abre em mobile

**Solução:** Use `wa.me` ao invés de `web.whatsapp.com`:
```tsx
return `https://wa.me/55${phone}?text=${encodedMessage}`;
```

### Problema 4: Mercado Pago retorna erro 401

**Solução:** Verifique se o `ACCESS_TOKEN` está correto no `.env`:
```
MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui
```

---

## 📚 Recursos Adicionais

### Documentação Oficial

- **React Query**: https://tanstack.com/query/latest
- **Framer Motion**: https://www.framer.com/motion/
- **Laravel**: https://laravel.com/docs
- **Mercado Pago**: https://www.mercadopago.com.br/developers
- **Shadcn/UI**: https://ui.shadcn.com/

### Exemplos de Uso

**Adicionar novo tipo de cobrança:**
```tsx
// Em Tuition.tsx, adicione na interface
type?: 'mensalidade' | 'matricula' | 'rematricula' | 'material_didatico'

// No backend (migration)
$table->enum('type', ['mensalidade', 'matricula', 'rematricula', 'material_didatico']);
```

**Criar filtro por data:**
```tsx
const [dateFilter, setDateFilter] = useState('');

const { data: tuitions } = useQuery({
  queryKey: ['tuitions', searchTerm, statusFilter, dateFilter],
  queryFn: () => apiFetch(`/tuitions?search=${searchTerm}&status=${statusFilter}&date=${dateFilter}`),
});
```

---

## 🎉 Conclusão

Este guia fornece tudo que você precisa para adaptar o sistema FinEdu para qualquer tipo de negócio que precise de:
- Gestão de cobranças recorrentes
- Dashboard financeiro
- Histórico de pagamentos
- Emissão de recibos
- Integração com gateways de pagamento
- Comunicação via WhatsApp

**Dica Final**: Comece adaptando um componente por vez, teste bem antes de passar para o próximo!

Bom desenvolvimento! 🚀

---

**Criado por**: Sistema FinEdu  
**Versão**: 1.0  
**Data**: Janeiro 2026  
**Licença**: MIT
