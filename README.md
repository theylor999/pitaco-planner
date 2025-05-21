
md
# Pitaco Planner

Pitaco Planner é um organizador de tarefas pessoais com um toque esportivo, permitindo que você gerencie suas atividades diárias enquanto se mantém atualizado sobre os jogos da FURIA e outros times!

## Funcionalidades

- **Gerenciamento de Tarefas**: Crie, edite, exclua e marque tarefas como concluídas. As tarefas são salvas localmente no seu navegador. Permite adicionar data e hora (opcional) para cada tarefa, além de um ícone personalizado.
- **Visualização em Calendário**: Visualize suas tarefas e os jogos (ex: FURIA, América-RN) em visualizações de dia, semana e mês, com filtros por prioridade.
- **Destaques de Jogos**: Veja os próximos jogos de times selecionados (ex: FURIA CS2, América-RN Futebol) diretamente no calendário.
- **Botão "Dar Pitaco"**: Em dias de jogo com link de aposta disponível (ex: FURIA, América-RN), um botão direciona para o [Rei do Pitaco](https://reidopitaco.bet.br/betting) para você dar seus palpites.
- **Modo Escuro**: Alterne entre temas claro e escuro para melhor conforto visual.
- **Configurações de Dados**: Permite adicionar tarefas de exemplo, resetar tarefas mantendo jogos, ou limpar todos os dados (tarefas e jogos).
- **Responsividade**: Design adaptado para desktops, tablets e dispositivos móveis.

## Design e Estilo

O Pitaco Planner adota um estilo esportivo e moderno:
- **Cores**: Paleta baseada em tons escuros (azul marinho profundo ou cinza escuro), com o verde vibrante característico do Rei do Pitaco como cor primária e um amarelo/dourado como cor de destaque para eventos com aposta.
- **Tipografia**: Fontes sans-serif modernas e fortes para títulos, e fontes limpas e legíveis para o corpo do texto.
- **Iconografia**: Ícones com tema esportivo e relacionados a produtividade.

## Stack Tecnológica

- **Next.JS (React)**: Framework principal para a construção da interface.
- **Tailwind CSS**: Para estilização rápida e responsiva.
- **ShadCN/UI**: Coleção de componentes de UI reutilizáveis.
- **TypeScript**: Para tipagem estática e maior robustez do código.
- **Lucide Icons**: Para iconografia.
- **date-fns**: Para manipulação de datas.
- **Local Storage**: Para persistência de dados das tarefas no navegador.
- **Framer Motion**: Para animações sutis.

## Como Rodar o Projeto

Siga os passos abaixo para configurar e rodar o Pitaco Planner localmente:

### Pré-requisitos

- Node.js (versão 18.x ou superior)
- npm ou yarn

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio>
    cd pitaco-planner
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    yarn install
    ```

### Rodando a Aplicação

1.  **Inicie o servidor de desenvolvimento Next.js:**
    ```bash
    npm run dev
    # ou
    yarn dev
    ```
    Por padrão, a aplicação estará disponível em `http://localhost:9002`.

2.  Abra seu navegador e acesse `http://localhost:9002`.

### Build para Produção

Para criar uma build otimizada para produção:
```bash
npm run build
npm run start
```

## Estrutura do Projeto (Principais Pastas)

```
pitaco-planner/
├── public/                   # Arquivos estáticos
├── src/
│   ├── app/                  # Rotas e layout principal do Next.js App Router
│   │   ├── globals.css       # Estilos globais e tema Tailwind/ShadCN
│   │   ├── layout.tsx        # Layout raiz da aplicação
│   │   └── page.tsx          # Página principal do Pitaco Planner
│   ├── components/
│   │   ├── pitaco-planner/   # Componentes específicos do Pitaco Planner
│   │   └── ui/               # Componentes ShadCN/UI
│   ├── hooks/                # Hooks customizados (ex: useTasks, useTheme)
│   ├── lib/                  # Utilitários, tipos, dados mockados, ícones
│   └── ...
├── next.config.js            # Configurações do Next.js
├── package.json
├── tailwind.config.ts        # Configurações do Tailwind CSS
└── tsconfig.json             # Configurações do TypeScript
```

## Telas (Exemplos de UI)

1.  **Tela Principal (Tarefas) - Modo Escuro**:
    - Header com o logo "Pitaco Planner", menu de configurações, botão de portfólio e seletor de tema (lua).
    - Aba "Tarefas" selecionada.
    - À esquerda, um formulário para adicionar nova tarefa com campos para título, descrição, data da tarefa, hora (opcional), prioridade e seleção de ícone.
    - À direita, uma lista de "Tarefas Pendentes (Hoje)" e "Tarefas Concluídas". Cards de tarefas com ícones, prioridades coloridas. Botão para "Mostrar todos os itens pendentes (inclui jogos)".

2.  **Visualização do Calendário (Mês) - Modo Claro**:
    - Header igual ao anterior.
    - Aba "Calendário" selecionada.
    - Controles para navegar entre meses, selecionar visualização Dia/Semana/Mês, filtrar por prioridade e ver tarefas concluídas.
    - Uma grade mensal exibida.
    - Dias com jogos (FURIA, América-RN com link de aposta) destacados em amarelo/dourado com um pequeno ícone e um botão "Dar Pitaco" visível ao clicar no evento (levando à visualização diária).
    - Tarefas indicadas com cores baseadas na prioridade.
    - Ao clicar em um dia, as tarefas e jogos daquele dia são exibidas na visualização diária.

Aproveite o Pitaco Planner para organizar sua vida e não perder nenhum lance!
"# pitaco-planner" 
"# pitaco-planner" 
