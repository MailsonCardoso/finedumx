# Changelog - FinEdu

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [0.8.0] - 2026-01-25

### ✨ Adicionado
- **✅ Confirmação de Presença pelo Aluno**: Estudantes agora podem "Confirmar" ou marcar que "Não vão" direto do portal.
- **📅 Agenda Inteligente**: 
  - Datas passadas agora são ocultadas automaticamente da lista de horários.
  - Alunos veem botões de interação apenas para aulas futuras.
- **👨‍🏫 Visão do Professor Otimizada**:
  - O professor visualiza em tempo real quantos alunos confirmaram e quem não vem.
  - Destaque em cores (Verde/Vermelho) para facilitar a conferência rápida.

### 📦 Build
- Build de produção gerado com o novo sistema de check-in (v0.8.0).

---

## [0.7.0] - 2026-01-25

### ✨ Adicionado
- **🚨 Verificação de Conflitos**: Sistema agora avisa se o professor já possui outra turma no mesmo dia e horário.
- **🔄 Gestão Flexível de Agenda**: Ao editar uma turma, você pode escolher:
  - "Apenas aulas futuras": Altera a agenda de hoje em diante, preservando o histórico passado.
  - "Refazer tudo": Limpa toda a agenda desta turma no ano e gera novamente (Opção B solicitada).
- **🛠️ Refinamento de Interface**: Inclusão de alertas visuais e seletores de rádio para controle de replicação na agenda.

### 📦 Build
- Build de produção gerado com as melhorias de inteligência de agenda (v0.7.0).

---

## [0.6.0] - 2026-01-25

### ✨ Adicionado
- **📅 Automação de Agenda**: Implementada geração automática de aulas para turmas.
  - Seleção de dias da semana via Checkboxes (Segunda a Domingo).
  - Opção "Gerar agenda automaticamente" ao criar ou editar uma turma.
  - O sistema gera automaticamente todos os compromissos na agenda até 31/12/2026 para os dias selecionados.
  - Cálculo automático de duração baseado no horário de início e fim.

### 🔧 Melhorado
- Substituído campo de texto livre de "Dias da Semana" por seletores fixos para evitar erros humanos.

### 📦 Build
- Build de produção gerado com as melhorias de automação (v0.6.0).

---

## [0.5.0] - 2026-01-25

### ✨ Adicionado
- **🔐 Portal do Professor/Funcionário**: Implementada criação automática de usuários de acesso.
  - Ao cadastrar um funcionário com CPF, um usuário é criado automaticamente.
  - Login e Senha padrão baseados no CPF (apenas números).
  - Atribuição automática de perfis (`teacher` ou `staff`).

### 🐛 Corrigido
- Falha no login de novos professores/funcionários por falta de conta de usuário vinculada.

### 📦 Build
- Build de produção gerado com as correções de acesso (v0.5.0).

---

## [0.4.0] - 2026-01-22

### ✨ Adicionado
- **🎓 Expansão Escolar**: Duas novas telas completas para gestão escolar
  - **👔 Funcionários** (`/funcionarios`):
    - CRUD completo de funcionários
    - Formulário com abas (Dados Pessoais + Dados Profissionais)
    - Campos: Nome, Email, CPF, Telefone, Cargo, Departamento, Admissão, Salário
    - Status: Ativo, Inativo, Férias, Afastado
    - Busca e filtros por status
  - **🎓 Turmas** (`/turmas`):
    - CRUD completo de turmas
    - Formulário com abas (Informações Gerais + Horário e Capacidade)
    - Campos: Nome, Curso, Professor, Turno, Horário, Dias, Sala, Capacidade
    - Badges coloridos de turno (Manhã, Tarde, Noite, Integral)
    - Barra de progresso de ocupação de alunos
    - Status: Ativo, Inativo, Completo
- **Menu Lateral Atualizado**: Adicionados ícones e links para as novas seções

### 🔧 Melhorado
- Sistema agora possui gestão completa: Financeira + Acadêmica
- Padrão consistente de design em todas as telas
- Navegação intuitiva expandida

### 📚 Documentação
- Criado `EXPANSAO_ESCOLAR_v0.4.0.md` com documentação completa
- Incluídas estruturas de banco de dados sugeridas
- Endpoints de API documentados

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

**Versão Atual**: 0.8.0  
**Data**: 25 de Janeiro de 2026
