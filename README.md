# FlowDesk 2.0: gestão de chamados em React + TypeScript

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-instal%C3%A1vel-5A0FC8?logo=pwa&logoColor=white)
![Testes](https://img.shields.io/badge/testes-Vitest-6E9F18?logo=vitest&logoColor=white)
![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-39c595)

Painel de atendimento de suporte com lista, quadro kanban arrastável, gráficos e histórico de cada chamado. Funciona no computador e no celular, e pode ser **instalado como app** (PWA), inclusive offline.

**[▶ Abrir a demonstração](https://dev-elbert.github.io/flowdesk-react/)**

<!-- Para mostrar a tela aqui: tire um print, salve como docs/screenshot.png e descomente a linha abaixo. -->
<!-- ![Tela do FlowDesk](docs/screenshot.png) -->

> Esta é a versão 2. A versão 1, em HTML, CSS e JavaScript puro, está em [dev-elbert/helpdesk-flow](https://github.com/dev-elbert/helpdesk-flow). Quem já usou a v1 no mesmo navegador vê os próprios chamados aqui, migrados automaticamente.

## Funcionalidades

**Painel**
- Indicadores animados (total, abertos, em andamento, resolvidos). Clicar num indicador abre a lista já filtrada.
- Gráfico dos últimos 7 dias, com chamados abertos e resolvidos por dia.
- Gráfico de rosca por status e barras por prioridade, ambos clicáveis.
- Atividade recente de todos os chamados.

**Chamados**
- Lista com busca que ignora acento e maiúscula ("cobranca" acha "Cobrança"), filtros e ordenação por coluna.
- No celular, a tabela vira cartões.
- Exportação CSV do que está filtrado, pronta para o Excel em português.

**Quadro kanban**
- Arraste os cartões entre Aberto, Em andamento e Resolvido, com mouse ou com o dedo.
- Botões de seta em cada cartão como alternativa ao arraste (teclado e leitor de tela).

**Detalhe do chamado**
- Painel lateral (no celular, uma folha que sobe de baixo) com troca rápida de status, comentários e linha do tempo de tudo que mudou.

**Experiência**
- Tema claro e escuro: segue o do sistema até você escolher, e lembra a escolha.
- Excluir e mudar status oferecem **Desfazer**, sem caixa de "tem certeza?".
- Atalhos: <kbd>N</kbd> abre um chamado novo e <kbd>/</kbd> vai para a busca.
- Ícones [Lucide](https://lucide.dev) e animações que respeitam quem desativa movimento no sistema.

## Instalar como app

- **Android / Chrome / Edge:** abra a demonstração e toque em **Instalar app**, na barra de cima ou no menu do navegador.
- **iPhone (Safari):** toque em **Compartilhar** e depois em **Adicionar à Tela de Início**.

O app abre em tela cheia, com ícone próprio, e continua funcionando sem internet.

## Como rodar no seu computador

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
npm install
npm run dev        # abre em http://localhost:5173/flowdesk-react/
```

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento com recarga automática |
| `npm test` | Roda os testes (Vitest) |
| `npm run typecheck` | Confere os tipos do TypeScript |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Serve a versão de produção localmente |
| `npm run generate-pwa-assets` | Recria os ícones do app a partir de `public/favicon.svg` |

> Os dados ficam **só no navegador e no aparelho atual** (`localStorage`). Não há servidor, login nem sincronização. **Não use dados pessoais reais.**

## Estrutura

```text
src/
├── App.tsx               # Monta a tela e liga as ações
├── types.ts              # Tipos: Ticket, HistoryEvent, Filters...
├── lib/                  # Regras puras, sem React, todas testáveis
│   ├── tickets.ts        #   validação, histórico, busca, ordenação, números do painel
│   ├── csv.ts            #   exportação CSV
│   ├── storage.ts        #   leitura e gravação no localStorage (com migração da v1)
│   ├── history.ts        #   texto de cada evento da linha do tempo
│   └── format.ts         #   datas, "há 2 horas", nomes de classe
├── hooks/                # useTickets (reducer), useTheme, useHashView, useInstallPrompt...
├── components/           # Dashboard, Charts, TicketList, KanbanBoard, TicketDrawer...
├── data/examples.ts      # Chamados fictícios com datas relativas a hoje
└── styles/global.css     # Tema claro/escuro com variáveis CSS
```

## Decisões técnicas

| Decisão | Por quê |
| --- | --- |
| Estado com `useReducer` e funções puras em `lib/` | A regra de negócio não depende de React e é testada isoladamente. |
| Todo chamado tem um histórico de eventos | A linha do tempo, o gráfico de resolvidos e a atividade recente saem da mesma fonte. |
| Validação ao ler o `localStorage` | Dado corrompido, editado à mão ou da v1 é corrigido ou descartado, nunca quebra a tela. |
| Gráficos em SVG e CSS, sem biblioteca | Menos de 80 KB de JavaScript compactado no total, com animação e acessibilidade sob controle. |
| `@dnd-kit` com sensores de mouse e toque | No celular, segurar 200 ms antes de arrastar mantém a rolagem da tela funcionando. |
| `<dialog>` nativo para modais | Foco preso, tecla Esc e fundo escuro sem biblioteca. |
| Avisos com a Popover API | O aviso aparece por cima até de um modal aberto. |
| Rotas por `#` (`#/lista`, `#/quadro`) | Funciona no GitHub Pages sem configurar servidor, e o "voltar" do navegador funciona. |
| Textos com `textContent`/JSX, nunca `innerHTML` | Nada que a pessoa digita vira HTML, o que evita XSS. |
| CSV com `;`, BOM UTF-8 e proteção contra fórmula | Abre certo no Excel em português e evita *CSV injection*. |

## Publicação

Cada envio para a branch `main` roda o GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)): instala as dependências, roda os testes, gera o build e publica no GitHub Pages. Se um teste falhar, o site não é atualizado.

## Próximos passos

- [ ] API REST (Node.js + Express) e banco PostgreSQL no lugar do `localStorage`.
- [ ] Login, permissões e sincronização entre aparelhos.
- [ ] Testes de componentes com Testing Library e testes de ponta a ponta com Playwright.
- [ ] Anexos e menções a pessoas nos comentários.

## Licença

MIT. Veja o arquivo [LICENSE](LICENSE).
