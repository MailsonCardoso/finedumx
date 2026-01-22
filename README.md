# 💰 FinEdu - Sistema de Gestão Financeira Educacional

Sistema completo de gestão financeira desenvolvido com React, TypeScript, Laravel e MySQL, facilmente adaptável para diferentes tipos de negócios com cobranças recorrentes.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)
![Laravel](https://img.shields.io/badge/laravel-11.x-red.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)

---

## 🎯 Visão Geral

O **FinEdu** é um sistema profissional de gestão financeira com foco em:

✅ **Dashboard Analítico** com KPIs e métricas de negócio  
✅ **Gestão de Cobranças** recorrentes (mensalidades, assinaturas)  
✅ **Integração WhatsApp** para notificações automatizadas  
✅ **Integração Mercado Pago** para pagamentos online  
✅ **Emissão de Recibos** profissionais  
✅ **Histórico de Pagamentos** completo  

### 🎥 Demo

![Dashboard Preview](./docs/images/dashboard-preview.png)

---

## 📚 Documentação Completa

Este projeto possui documentação extensiva para facilitar a adaptação para seu negócio:

| Documento | Descrição | Quando Usar |
|-----------|-----------|-------------|
| **[📚 ÍNDICE](./INDICE.md)** | Navegação completa da documentação | Início |
| **[📊 RESUMO EXECUTIVO](./RESUMO_EXECUTIVO.md)** | Visão geral, arquitetura e funcionalidades | Primeira leitura |
| **[📋 GUIA DE ADAPTAÇÃO](./GUIA_ADAPTACAO_SISTEMA.md)** | Guia técnico completo passo a passo | Implementação |
| **[💼 EXEMPLOS PRÁTICOS](./EXEMPLOS_ADAPTACAO.md)** | Adaptações para 5 tipos de negócio | Inspiração |
| **[⚡ REFERÊNCIA RÁPIDA](./REFERENCIA_RAPIDA.md)** | Consulta rápida e troubleshooting | Durante desenvolvimento |

**👉 Comece pelo [ÍNDICE.md](./INDICE.md) para navegação facilitada!**

---

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js** 18+ e npm
- **PHP** 8.2+
- **Composer**
- **MySQL** 8.x

### Instalação

#### 1. Frontend (React + Vite)

```bash
# Clone o repositório
git clone <YOUR_GIT_URL>
cd finedumx

# Instale as dependências
npm install

# Configure o arquivo .env
cp .env.example .env
# Edite VITE_API_URL apontando para seu backend

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: `http://localhost:5173`

#### 2. Backend (Laravel)

```bash
# Entre na pasta do backend
cd finedumx_beck

# Instale as dependências
composer install

# Configure o arquivo .env
cp .env.example .env
# Edite as configurações de banco de dados

# Gere a chave da aplicação
php artisan key:generate

# Execute as migrations
php artisan migrate

# (Opcional) Popule com dados de teste
php artisan db:seed

# Inicie o servidor
php artisan serve
```

Acesse: `http://localhost:8000`

---

## 🛠️ Stack Tecnológico

### Frontend
- ⚛️ **React** 18.3.1
- 📘 **TypeScript** 5.x
- ⚡ **Vite** 5.x
- 🎨 **Tailwind CSS** 3.x
- 🧩 **Shadcn/UI** - Componentes
- 🔄 **TanStack Query** - Estado e cache
- 🎭 **Framer Motion** - Animações
- 📊 **Recharts** - Gráficos
- 🎨 **Lucide React** - Ícones

### Backend
- 🐘 **PHP** 8.2+
- 🎯 **Laravel** 11.x
- 🗄️ **MySQL** 8.x
- 🔐 **Laravel Sanctum** - Autenticação
- 💳 **Mercado Pago SDK** - Pagamentos

---

## 📁 Estrutura do Projeto

```
finedumx/
├── src/                          # Frontend React
│   ├── pages/
│   │   ├── Dashboard.tsx         # Dashboard com KPIs
│   │   ├── Tuition.tsx           # Gestão de mensalidades
│   │   ├── Receipts.tsx          # Recibos
│   │   └── Payments.tsx          # Histórico de pagamentos
│   ├── components/               # Componentes reutilizáveis
│   └── lib/                      # Utilidades
│
├── finedumx_beck/                # Backend Laravel
│   ├── app/
│   │   ├── Http/Controllers/     # Controllers da API
│   │   └── Models/               # Eloquent Models
│   ├── database/
│   │   └── migrations/           # Migrations do banco
│   └── routes/
│       └── api.php               # Rotas da API
│
└── docs/                         # Documentação
    ├── INDICE.md
    ├── RESUMO_EXECUTIVO.md
    ├── GUIA_ADAPTACAO_SISTEMA.md
    ├── EXEMPLOS_ADAPTACAO.md
    └── REFERENCIA_RAPIDA.md
```

---

## 🎯 Funcionalidades Principais

### 1. Dashboard Financeiro
- 📊 5 KPIs principais com tendências
- 🚨 Pendências prioritárias ordenadas
- 💰 Pagamentos recentes
- 👁️ Visualização detalhada de clientes

### 2. Gestão de Cobranças
- ✅ Geração em lote de mensalidades
- ✅ Cobranças individuais e avulsas
- ✅ Filtros por status e busca
- ✅ Confirmação de pagamento
- ✅ Exclusão de cobranças

### 3. Integração WhatsApp
- 📱 Envio automático de cobranças
- 🔗 Link de pagamento incluído
- 💬 Mensagens contextualizadas
- 🛡️ Sistema anti-spam
- 📢 Notificação em massa

### 4. Recibos Profissionais
- 🖨️ Layout pronto para impressão
- 📄 Numeração automática
- 🏢 Dados personalizáveis
- 📅 Validação e assinatura

### 5. Histórico de Pagamentos
- 📊 Resumo financeiro
- 📋 Tabela completa
- 🎨 Ícones por método
- 🏷️ Badges de status

---

## 🔧 Configuração

### Variáveis de Ambiente

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8000
```

#### Backend (.env)
```bash
APP_NAME="FinEdu"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=finedumx
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha

# Opcional - Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu_token
MERCADOPAGO_PUBLIC_KEY=sua_chave_publica
```

---

## 📖 Adaptando para Seu Negócio

Este sistema pode ser facilmente adaptado para:

- 🏋️ **Academias** - Gestão de planos e mensalidades
- 🏥 **Clínicas** - Cobrança de consultas e procedimentos
- 💻 **SaaS** - Assinaturas e planos recorrentes
- 🎓 **Escolas** - Mensalidades e taxas escolares
- 🏠 **Condomínios** - Taxas condominiais

**Veja exemplos completos em**: [EXEMPLOS_ADAPTACAO.md](./EXEMPLOS_ADAPTACAO.md)

### Processo de Adaptação

1. **Leia o Resumo Executivo** (30 min)
2. **Escolha seu exemplo** (10 min)
3. **Siga o Guia de Adaptação** (4-8 horas)
4. **Use a Referência Rápida** quando necessário

**Tempo total estimado**: 14-30 horas (dependendo da complexidade)

---

## 🎨 Customização Visual

### Tema de Cores

Edite `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        // Adicione suas cores aqui
      }
    }
  }
}
```

### Logo e Marca

1. Substitua o logo em `public/logo.png`
2. Atualize o nome em `.env`:
   ```bash
   VITE_APP_NAME="Minha Empresa"
   ```

---

## 🚀 Deploy

### Frontend (Vercel/Netlify)

```bash
# Build de produção
npm run build

# Os arquivos estarão em /dist
```

### Backend (VPS/Cloud)

```bash
# No servidor
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**Checklist completo em**: [REFERENCIA_RAPIDA.md](./REFERENCIA_RAPIDA.md#-checklist-de-deploy)

---

## 📊 Estatísticas do Código

| Métrica | Valor |
|---------|-------|
| Total de Linhas (Frontend) | ~1.939 |
| Total de Componentes React | 4 principais + 10+ reutilizáveis |
| Endpoints API | 15+ |
| Tabelas no Banco | 4 principais |
| Tempo de Leitura da Doc | ~4 horas |

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Se você adaptou o sistema para um novo tipo de negócio:

1. Documente seu caso de uso
2. Compartilhe adaptações específicas
3. Envie PRs com melhorias
4. Relate bugs e sugestões

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

## 🆘 Suporte

### Documentação
- 📚 [Índice Geral](./INDICE.md)
- 📊 [Resumo Executivo](./RESUMO_EXECUTIVO.md)
- 📋 [Guia de Adaptação](./GUIA_ADAPTACAO_SISTEMA.md)
- 💼 [Exemplos Práticos](./EXEMPLOS_ADAPTACAO.md)
- ⚡ [Referência Rápida](./REFERENCIA_RAPIDA.md)

### Links Úteis
- [Documentação Laravel](https://laravel.com/docs)
- [Documentação React Query](https://tanstack.com/query/latest)
- [Documentação Mercado Pago](https://www.mercadopago.com.br/developers)
- [Shadcn/UI Components](https://ui.shadcn.com)

---

## 🎉 Começando

1. **Leia o [ÍNDICE.md](./INDICE.md)** para navegação
2. **Explore o [RESUMO_EXECUTIVO.md](./RESUMO_EXECUTIVO.md)** para visão geral
3. **Siga o [GUIA_ADAPTACAO_SISTEMA.md](./GUIA_ADAPTACAO_SISTEMA.md)** passo a passo
4. **Consulte [REFERENCIA_RAPIDA.md](./REFERENCIA_RAPIDA.md)** quando necessário

**Invista algumas horas na adaptação e economize centenas em desenvolvimento!** 🚀

---

**Sistema FinEdu**  
Desenvolvido com ❤️ para facilitar a gestão financeira  
v1.0 | Janeiro 2026
