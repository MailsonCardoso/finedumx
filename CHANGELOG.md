# Changelog - FinEdu

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [0.3.0] - 2026-01-22

### ✨ Adicionado
- **Formulário de Alunos com Abas**: Reorganização completa do formulário de cadastro/edição de alunos em duas abas
  - **Aba 1 - Dados do Aluno**: Nome, Responsável, E-mail, CPF, Telefone
  - **Aba 2 - Informações Financeiras**: Curso, Dia Vencimento, Valor Mensalidade, Status, Opções Financeiras Iniciais
- Documentação completa da alteração em `ALTERACAO_FORMULARIO_ALUNOS.md`

### 🔧 Melhorado
- UX aprimorada com separação lógica de informações pessoais e financeiras
- Interface mais limpa e profissional
- Melhor navegação contextual no formulário
- Redução de sobrecarga visual

### 📦 Build
- Build de produção realizado com sucesso (v0.3.0)
- Tamanho do bundle otimizado

---

## [0.2.1] - Anterior

### Funcionalidades Principais
- Dashboard com KPIs financeiros
- Gestão de Mensalidades
  - Geração em lote
  - Cobranças individuais
  - Integração WhatsApp com Mercado Pago
  - Anti-spam (5 dias)
  - Mutirão de Cobrança
- Gestão de Alunos
  - CRUD completo
  - Busca e filtros
  - Visualização detalhada (StudentSheet)
- Recibos Profissionais
  - Visualização e impressão
  - Layout profissional
- Histórico de Pagamentos
  - Resumo financeiro
  - Métodos de pagamento
  - Badges de status

### Stack Tecnológico
- React 18.3.1
- TypeScript 5.8.3
- Vite 5.4.19
- Tailwind CSS 3.4.17
- Shadcn/UI
- TanStack Query 5.83.0
- Framer Motion 12.26.2
- Recharts 2.15.4

---

## Tipos de Mudanças

- `✨ Adicionado` - Para novas funcionalidades
- `🔧 Melhorado` - Para mudanças em funcionalidades existentes
- `🐛 Corrigido` - Para correção de bugs
- `🔒 Segurança` - Para vulnerabilidades corrigidas
- `⚠️ Descontinuado` - Para funcionalidades que serão removidas
- `🗑️ Removido` - Para funcionalidades removidas
- `📦 Build` - Para mudanças no processo de build
- `📚 Documentação` - Para mudanças na documentação

---

**Versão Atual**: 0.3.0  
**Data**: 22 de Janeiro de 2026
