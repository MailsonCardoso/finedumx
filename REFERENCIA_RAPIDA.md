# ⚡ Referência Rápida - Sistema FinEdu

Guia de consulta rápida para adaptar o sistema em seu projeto.

---

## 🔍 Mapeamento de Terminologia

### Para Academia/Ginásio
| Original | Academia |
|----------|----------|
| Aluno | Membro/Cliente |
| Mensalidade | Plano Mensal |
| Matrícula | Taxa de Adesão |
| Rematrícula | Renovação Anual |
| Turma | Modalidade (Musculação, Yoga, etc.) |

### Para Clínica/Consultório
| Original | Clínica |
|----------|---------|
| Aluno | Paciente |
| Mensalidade | Consulta/Procedimento |
| Matrícula | Cadastro Inicial |
| Turma | Especialidade |

### Para SaaS
| Original | SaaS |
|----------|------|
| Aluno | Conta/Usuário |
| Mensalidade | Assinatura |
| Matrícula | Ativação |
| Rematrícula | Upgrade/Renovação |
| Turma | Plano (Basic/Pro/Enterprise) |

### Para Escola de Idiomas
| Original | Escola de Idiomas |
|----------|-------------------|
| Aluno | Aluno (manter) |
| Mensalidade | Mensalidade (manter) |
| Matrícula | Matrícula no Curso |
| Turma | Curso + Nível |

### Para Condomínio
| Original | Condomínio |
|----------|------------|
| Aluno | Unidade/Proprietário |
| Mensalidade | Taxa Condominial |
| Matrícula | - |
| Rematrícula | Taxa Extraordinária |

---

## 📂 Arquivos Principais para Adaptar

| Arquivo | Localização | Prioridade | O Que Adaptar |
|---------|-------------|------------|---------------|
| **Dashboard.tsx** | `src/pages/` | 🔴 Alta | KPIs, textos, métricas |
| **Tuition.tsx** | `src/pages/` | 🔴 Alta | Terminologia, tipos de cobrança, mensagens WhatsApp |
| **Receipts.tsx** | `src/pages/` | 🟡 Média | Layout do recibo, dados da empresa |
| **Payments.tsx** | `src/pages/` | 🟢 Baixa | Métodos de pagamento (opcional) |
| **TuitionController.php** | `finedumx_beck/app/Http/Controllers/` | 🔴 Alta | Lógica de geração, validações |
| **Migrations** | `finedumx_beck/database/migrations/` | 🔴 Alta | Estrutura de tabelas |

---

## 🎨 Renomeação de Componentes

### Frontend (React)

```bash
# Se for um negócio genérico (não educacional):

# 1. Renomear arquivos
mv src/pages/Tuition.tsx src/pages/Billing.tsx

# 2. Buscar e substituir no código
# Substituir "Tuition" por "Billing"
# Substituir "student" por "customer" ou "client"
# Substituir "Aluno" por "Cliente"
# Substituir "Mensalidade" por "Cobrança"
```

### Backend (Laravel)

```bash
# 1. Renomear controllers e models
mv app/Http/Controllers/TuitionController.php app/Http/Controllers/BillingController.php
mv app/Models/Tuition.php app/Models/Billing.php
mv app/Models/Student.php app/Models/Customer.php

# 2. Atualizar migrations
# Renomear tabelas: tuitions → billings, students → customers

# 3. Atualizar rotas (routes/api.php)
Route::get('/billings', [BillingController::class, 'index']);
```

---

## 🔧 Principais Customizações

### 1. Tipos de Cobrança

**Localização**: `src/pages/Tuition.tsx` (ou renomeado)

```typescript
// ANTES (educacional)
type?: 'mensalidade' | 'matricula' | 'rematricula'

// DEPOIS - Academia
type?: 'plano_mensal' | 'adesao' | 'personal' | 'avaliacao'

// DEPOIS - Clínica
type?: 'consulta' | 'exame' | 'procedimento' | 'retorno'

// DEPOIS - SaaS
type?: 'assinatura' | 'upgrade' | 'one_time'

// DEPOIS - Condomínio
type?: 'condominio' | 'agua' | 'multa' | 'extraordinaria'
```

**Backend**: Atualizar migration

```php
$table->enum('type', ['seu', 'novo', 'tipo']);
```

### 2. Mensagens WhatsApp

**Localização**: `src/pages/Tuition.tsx` → função `buildWhatsAppUrl`

```typescript
// Linha ~356-409
const buildWhatsAppUrl = (tuition: Tuition, paymentLink?: string) => {
  // CUSTOMIZE AQUI
  let message = "Sua mensagem customizada...";
  // ...
};
```

**Exemplo Rápido**:
```typescript
message = `Olá *${customerName}*! 🌟\n\n` +
  `Sua ${serviceType} de ${reference} vence em ${dueDate}.\n\n` +
  `Pague agora: ${paymentLink}`;
```

### 3. KPIs do Dashboard

**Localização**: `src/pages/Dashboard.tsx` → linhas 150-200

```tsx
// ADICIONAR NOVO KPI
<KPICard
  index={5} // Próximo índice
  title="Seu Novo KPI"
  value={formatCurrency(data?.kpis.seuNovoValor || 0)}
  trend={{ value: "+10%", direction: "up" }}
  icon={<SeuIcone className="w-5 h-5" />}
/>
```

**Backend**: Adicionar cálculo no `DashboardController.php`

```php
public function stats() {
    return [
        'kpis' => [
            // ... existentes
            'seuNovoValor' => $this->calcularNovoKPI(),
        ]
    ];
}
```

### 4. Layout do Recibo

**Localização**: `src/pages/Receipts.tsx` → linhas 168-202

```tsx
// Customizar dados da empresa
<h1 className="text-3xl font-bold">
  {schoolData?.name || "SUA EMPRESA AQUI"}
</h1>
<p className="text-sm text-gray-600">
  {schoolData?.address || "Seu Endereço"}
</p>
```

### 5. Métodos de Pagamento

**Localização**: `src/pages/Payments.tsx` → funções `getMethodIcon` e `getMethodLabel`

```typescript
// ADICIONAR NOVO MÉTODO
const getMethodIcon = (method: string) => {
  switch (method) {
    // ... existentes
    case "crypto": return <Bitcoin className="w-4 h-4 text-orange-500" />;
    default: return null;
  }
};
```

---

## 🗄️ Schema do Banco de Dados

### Tabela: students (ou customers)

```sql
CREATE TABLE students (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(20) NOT NULL,
  cpf VARCHAR(14) NULL,
  active_responsible VARCHAR(255) NULL,
  monthly_fee DECIMAL(10,2) DEFAULT 150.00,
  status ENUM('ativo', 'inativo') DEFAULT 'ativo',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Tabela: tuitions (ou billings)

```sql
CREATE TABLE tuitions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED,
  reference VARCHAR(100) NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pago', 'pendente', 'atrasado') DEFAULT 'pendente',
  type ENUM('mensalidade', 'matricula', 'rematricula') DEFAULT 'mensalidade',
  last_notification_at TIMESTAMP NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_student_reference (student_id, reference),
  INDEX idx_status (status)
);
```

### Tabela: payments

```sql
CREATE TABLE payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED,
  tuition_id BIGINT UNSIGNED NULL,
  type VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('pix', 'dinheiro', 'cartao_credito', 'cartao_debito', 'transferencia', 'boleto'),
  payment_date DATE NOT NULL,
  status ENUM('confirmado', 'processando', 'falha') DEFAULT 'confirmado',
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (tuition_id) REFERENCES tuitions(id) ON DELETE SET NULL,
  INDEX idx_payment_date (payment_date),
  INDEX idx_status (status)
);
```

---

## 🔌 Endpoints da API

### Autenticação
```
POST   /api/login           - Login
POST   /api/logout          - Logout
GET    /api/me              - Usuário autenticado
```

### Dashboard
```
GET    /api/dashboard/stats - KPIs e dados do dashboard
```

### Mensalidades/Cobranças
```
GET    /api/tuitions                      - Listar todas
GET    /api/tuitions?search=João&status=pendente
POST   /api/tuitions                      - Criar individual
POST   /api/tuitions/generate-batch       - Gerar em lote
POST   /api/tuitions/{id}/notify          - Marcar como notificado
POST   /api/tuitions/{id}/payment-link    - Gerar link MP
DELETE /api/tuitions/{id}                 - Excluir
```

### Pagamentos
```
GET    /api/payments        - Listar todos
POST   /api/payments        - Registrar pagamento
```

### Alunos/Clientes
```
GET    /api/students        - Listar todos
GET    /api/students/{id}   - Detalhes
```

### Configurações
```
GET    /api/settings        - Dados da escola/empresa
PUT    /api/settings        - Atualizar configurações
```

---

## ⚙️ Variáveis de Ambiente

### Frontend (.env)

```bash
# API Backend
VITE_API_URL=http://localhost:8000

# Outras (opcional)
VITE_APP_NAME="Meu Sistema"
```

### Backend (.env)

```bash
# Laravel
APP_NAME="FinEdu"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://seu-dominio.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=finedumx
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha

# Mercado Pago (opcional)
MERCADOPAGO_ACCESS_TOKEN=seu_token_aqui
MERCADOPAGO_PUBLIC_KEY=sua_public_key

# Email (opcional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu_email@gmail.com
MAIL_PASSWORD=sua_senha_app
```

---

## 🚀 Comandos Úteis

### Instalação Inicial

```bash
# Frontend
npm install
npm run dev            # Desenvolvimento
npm run build          # Produção

# Backend
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed    # Dados de teste
php artisan serve      # Servidor local
```

### Desenvolvimento

```bash
# Frontend - Hot reload
npm run dev

# Backend - Watch logs
tail -f storage/logs/laravel.log

# Limpar cache Laravel
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Banco de Dados

```bash
# Criar nova migration
php artisan make:migration create_nova_tabela

# Rodar migrations
php artisan migrate

# Rollback
php artisan migrate:rollback

# Refresh (CUIDADO: apaga dados)
php artisan migrate:refresh --seed
```

---

## 🐛 Troubleshooting Rápido

### Problema: CORS Error
**Solução**:
```php
// config/cors.php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173', 'https://seu-dominio.com'],
'supports_credentials' => true,
```

### Problema: 401 Unauthorized
**Solução**:
```typescript
// Verificar se token está sendo enviado
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Problema: React Query não atualiza
**Solução**:
```typescript
queryClient.invalidateQueries({ queryKey: ['tuitions'] });
```

### Problema: WhatsApp não abre
**Solução**:
```typescript
// Usar wa.me ao invés de web.whatsapp.com
return `https://wa.me/55${phone}?text=${encodedMessage}`;
```

### Problema: Mercado Pago erro 401
**Solução**:
```bash
# Verificar .env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
# Token deve começar com APP_USR-
```

---

## 📞 Checklist de Deploy

### Frontend
- [ ] Build de produção (`npm run build`)
- [ ] Configurar variáveis de ambiente
- [ ] Upload para servidor/Vercel/Netlify
- [ ] Configurar domínio
- [ ] SSL (HTTPS)

### Backend
- [ ] Upload do código Laravel
- [ ] Configurar `.env` de produção
- [ ] `composer install --optimize-autoloader --no-dev`
- [ ] `php artisan migrate --force`
- [ ] Configurar permissões (storage, bootstrap/cache)
- [ ] Configurar cron jobs
- [ ] SSL (HTTPS)

### Pós-Deploy
- [ ] Testar login
- [ ] Testar criação de cobrança
- [ ] Testar WhatsApp
- [ ] Testar Mercado Pago (se usar)
- [ ] Testar impressão de recibo
- [ ] Verificar logs de erro

---

## 📚 Links Úteis

| Recurso | URL |
|---------|-----|
| React Query | https://tanstack.com/query/latest |
| Laravel Docs | https://laravel.com/docs |
| Tailwind CSS | https://tailwindcss.com |
| Shadcn/UI | https://ui.shadcn.com |
| Mercado Pago | https://www.mercadopago.com.br/developers |
| Framer Motion | https://www.framer.com/motion |

---

## 💡 Dicas Finais

1. **Comece Simples**: Adapte um componente por vez
2. **Teste Localmente**: Sempre teste antes de deploy
3. **Use TypeScript**: Evita muitos bugs
4. **Documente Mudanças**: Facilita manutenção futura
5. **Versionamento**: Use Git para controle de versão
6. **Backup**: Sempre faça backup do banco antes de migrations

---

**Boa sorte com seu projeto! 🚀**

Se precisar de ajuda, consulte:
- `GUIA_ADAPTACAO_SISTEMA.md` - Guia técnico completo
- `EXEMPLOS_ADAPTACAO.md` - Exemplos práticos
- `RESUMO_EXECUTIVO.md` - Visão geral do sistema
