# SAUGC OS — Histórico de Alterações

## [v1.8] — 13 ago 2026 — Sprint 017 Leva 1: 🚀 "Mesa de Motores + Ponte do Vídeo + Guia Vivo"

### Adicionado
- **Mesa de Motores (017a) — 4 motores em cadeia ARMADOS** na rota server `/api/ia`: **Gemini** (titular, autodescoberta `gemini-3.6-flash`, reserva `gemini-2.0-flash`) → **GitHub Models** (`openai/gpt-4o`) → **Groq** (`llama-3.3-70b-versatile`) → **OpenRouter** (`llama-3.3-70b :free`). Motor sem chave = pulado em silêncio. Chaves plantadas nos 2 cofres (`.env.local` + Vercel Production **e** Preview, todas server-only): `GEMINI_API_KEY` · `GITHUB_MODELS_TOKEN` · `GROQ_API_KEY` · `OPENROUTER_API_KEY`.
- **Espelho da Mesa**: `GET /api/ia` responde `{motores:[{id,armado}]}` com autenticação — mostra a verdade dos motores sem expor segredo nenhum.
- **IA Studio vivo (017b)**: selos "Conectado"/"Sem chave" agora REAIS (lidos do espelho) · rótulo do motor que atendeu em cada item do histórico · dívidas 📌 da auditoria 016d pagas (card de custo fixo e texto "35+ modelos" resolvidos com a Mesa real).
- **Ponte do Vídeo no Briefing (017c)**: roteiro gerado → **comandos prontos pro Flow, cena a cena** (Caminho A documentado: copiar → colar no gerador de vídeo) — o briefing entra, o vídeo sai.
- **Guia Vivo**: tutorial completo DENTRO do app, página a página — `guia.tsx` + `lib/guia-data.ts`, 11 guias + atalhos, no app-shell.
- **`ia-service` v3 no barrel `@/lib/services`**: `gerarTexto()` → `{ok, texto, erro, motor}` · `statusMotores()` → `[{id, armado}]` | null. (Pendência antiga do estacionamento — QUITADA.)

### Corrigido
- **Incidente Vercel-envs** no dia da plantação das chaves: envs novas só valem no deploy seguinte (lição nº 10 reforçada em carne viva) — resolvido no mesmo dia, com Production e Preview plantadas juntas.
- Faxinas de código da leva (polimento geral entregue junto).

### Lições operacionais
- Motor sem chave pula em silêncio — e o espelho confessa na tela. Segredo nunca sai da rota server.
- Chave nova na Vercel = lembrar dos DOIS ambientes (Production e Preview) e de que ela só acorda no próximo deploy.

### Marcos
- 🚀 **Sprint 017 Leva 1 NO AR (13 ago 2026)** — a Mesa de Motores 4/4 armada é o fim da dependência de um motor só.
- 📜 **Opção C (decisão soberana, 13 ago):** Sala de Páginas DESLIZADA pro pós-1º-cliente — nada de feature nova antes da venda (Lei L13).
- 🎯 **Caça ao 1º cliente aberta** (D+1→D+14) · Comando Mestre externo triado (vira `docs/016`) · recebimento travado (PIX primeiro; 12× via InfinitePay/PagBank).

## [v1.7] — 12 ago 2026 — Sprint 016 FINAL: 🏆 "Verdade total + Celular" NO AR

### Adicionado
- **Dashboard 100% real (016a)**: `src/app/dashboard-view.tsx` novo — KPIs calculados do banco (Receita do mês = soma do MRR dos clientes · Conversões = soma das campanhas · Campanhas ativas = contagem real · ROI médio = receita ÷ investido, com "—" quando não há investido) · "Receita do mês por cliente" (barras reais, top 6) aposentando a "Trajetória de Receita" cenográfica · canais agrupados por plataforma real, cor por rede · funil real (negócios fora de "Contrato Fechado" + ticket médio) · atividades recentes = clientes + campanhas recém-criados do banco · `page.tsx` virou casca magra · modo demonstração com banner warning visível
- **Modo celular (016b)**: `viewport` oficial do Next no layout (device-width, viewportFit cover, themeColor #0B0D12) · régua tipográfica 17px em telas ≤640px (ajuste fino num lugar só, no globals.css) · Kanban do CRM vira trilho com ímã (snap) no celular e volta ao grid a partir do tablet · tabela de Clientes rola pro lado sem espremer (min-w 600px)
- **Foto de perfil real (016c)**: bucket `avatars` no Storage (leitura pública, escrita só pelo dono) · upload em Configurações → Perfil (PNG/JPG/WebP até 2 MB, upsert, `?v=` anti-cache) · `avatar_url` gravado no crachá do usuário · aparece nos 3 pontos (lateral aberta, lateral recolhida, topo) · troca sozinha em todas as telas via USER_UPDATED

### Corrigido
- **Varredura de cenográficos (016d)**: seletor de workspace "Plano Pro/Enterprise" REMOVIDO (não existia plano por trás — volta real no lançamento) · sininho de notificações inventadas REMOVIDO (volta real como central de novidades lendo o banco, em sprint futura) · selo "Operacional" agora honesto (🟢 pulsa só com sessão real / 🟠 "Modo demonstração" sem banco)
- **CRM reerguido**: `crm-view.tsx` estava truncado na linha 384 no disco (fissura de colagem da 016b — a metade de baixo nunca existiu) → metade inferior reconstruída (fim do esqueleto + kanban completo + modal Novo Negócio) · imports `EmptyState`/`Tooltip` retirados (API não confirmada na reconstrução às cegas) — dica dos KPIs virou `title` nativo e o estado vazio virou Card simples
- `AvatarUsuario` declarado FORA do AppShell — lei nova do ESLint (`react-hooks/static-components`): componente criado dentro de outro renasce a cada render e perde estado
- Metadata do app sem "UGC" (Lei da Língua)

### Lições operacionais
- Componente NUNCA dentro de componente (`react-hooks/static-components`) — declarar no nível do módulo e passar dados por props (caso AvatarUsuario)
- Cola longa pode chegar CORTADA: depois de colar, conferir se a ÚLTIMA linha entregue existe no arquivo (o lint pega, mas a prova de fim-de-arquivo pega na hora) — caso crm-view/384
- `Remove-Item .next` respondendo "caminho não existe" = galpão já estava limpo, não é erro
- Warning amarelo isolado passa nos porteiros — faxina do `Badge` ocioso (dashboard-view) agendada

### Marcos
- 🏁 **Sprint 016 NO AR (12 ago 2026)** — verdade total na tela: **zero controle cenográfico** no app
- 🐕 **Dogfooding aberto**: Cliente Zero rodando a operação real por 2 semanas (12 → 26 ago)
- Reunião relâmpago (12 ago): offline real 100% descartado pra sempre (a nuvem É o produto; degradação digna já no ar) · Agente de vendas WhatsApp aprovado como candidata #1 pós-lançamento (Meta Cloud API + webhook Vercel + Gemini + Supabase, R$ 0/mês + chip; Evolution/Baileys proibido) — decisões completas na Memória

### Varredura 016d — tabela de sentenças
| Suspeito | Sentença |
|---|---|
| Seletor de workspace "Plano Pro" | ✂️ saiu de cena (volta real com os planos, no lançamento) |
| Sininho de notificações fake | ✂️ saiu de cena (volta real lendo o banco, sprint futura) |
| Selo "Operacional" que mentia | 🔧 honesto agora (🟢 real / 🟠 demo) |
| Mídias "Arquivos seguros" | 🏆 verdade provada (bucket privado + links assinados vencendo) |
| IA Studio "Agentes / Motor de IA" | 🏆 verdade provada · 📌 pra 017: card "Custo de IA hoje R$ 0" é fixo (ligar medição real ou aposentar) · conferir o "35+ modelos" do OpenRouter ao conectar de verdade |

## [v1.6] — 9 ago 2026 — Sprint 015 FINAL: 🏁 v2.0 "100% UTILIZÁVEL" NO AR

### Adicionado
- **Configurações reais (015a)**: perfil e conta gravam no banco de verdade — último mock "de ação" morto
- **Roteirista IA tecido no Briefing (015b)**: lê o pedido inteiro (título, cliente, criador, tags, prazo, detalhes) → roteiro editável → "Salvar como criativo no quadro" grava em `commercials` (status Rascunho)
- **Diretor de Tráfego IA nas Campanhas (015c)**: lê as métricas do formulário (investido, impressões, cliques, conversões, receita, meta de ROAS) → relatório 🩺 diagnóstico + 🚦 semáforo + 🎯 3 ações → "Salvar relatório na Biblioteca" grava em `library_items` (autor "Diretor de Tráfego IA")
- **Excluir cliente (015)**: lixeira por linha → confirmação "não tem volta" → delete real → some da tela na hora · botão-raiz `<button>` com classes (sem variant não confirmada)
- **Marca oficial "vidro gelo" 🧊**: logo nova (A 3D + olho de IA, degradê azul→violeta) EM ARQUIVO — `public/logo-anuncia.png` vive na barra lateral (47px) e no login (78px); `src/app/icon.png` = ícone da aba do navegador (convenção do Next, grátis) · SVG "A-com-raio" aposentado
- **Login premium minimalista (015e)**: só marca + cartão de vidro · subtítulo "Abra as portas do seu centro de comando." · `traduzErro` ganhou "Invalid API key" → PT-BR
- **Proxy blindado**: `getUser()` com try/catch — Supabase fora do ar = app segue em modo degradado (era tela 500 muda)
- **Tagline da barra lateral: "central de comando"** — voz da marca travada

### Corrigido
- Coluna `name` de `campaigns` restaurada (dropada por engano no lote anti-fóssil da Sprint 014 — derrubava o select da página em silêncio e o insert com "schema cache") — `add column if not exists` + reload
- Polimento da língua (015d): tela zero jargão — MRR→Receita do mês, "Pipeline Comercial"→Negociações em andamento, Providers→Motor de IA, creator→criador · botões do Dashboard ligados (Nova Campanha/Gerar com IA)
- Dedo-duro confesso padronizado em Clientes/Campanhas/Briefings ("Detalhe técnico:" em todo erro de ação)
- Aspas retas em texto JSX → tipográficas “ ” (lint `react/no-unescaped-entities`)

### Lições operacionais
- **Regra de Ouro v2**: entrega de código = arquivo COMPLETO; Ctrl+Shift+F só pra TEXTO PURO de tela ("0 resultados = pula e anota"; node_modules fora); NUNCA "UGC" sozinho no Replace All (é chave do banco) — nasceu do bug do "U" sumido
- Rótulo que também é CHAVE de código não se troca por busca global (caso kpiConfig: `Receita do mês:` sem aspas quebrou o build — chave com espaço precisa de aspas, case-sensível)
- Imagem quebrada = caminho/nome errado (clássico `logo.png.png` do Windows), nunca formato — raio-X: `Test-Path` / `Get-ChildItem -Name`
- Logo em arquivo `public/` + `app/icon.png` troca a marca inteira sem componente SVG

### Marcos
- 🏁 **AnuncIA v2.0 "100% UTILIZÁVEL" publicada** (9 ago 2026) em `anuncia-three.vercel.app`
- Verdade na tela registrada (não escondida): **números do Dashboard seguem cenográficos** → agregação real = prioridade 1 da Sprint 016

## [v1.5] — 5 ago 2026 — Sprint 014: Biblioteca + Prompts reais + baú da IA

### Adicionado
- **Biblioteca real** (`library_items`, 8 col): CRUD completo, abas por categoria, rótulos PT-BR com valores EN no cofre, campo "Conteúdo completo" + botão Copiar de verdade
- **Prompts real** (`prompts`, 9 col): CRUD + Editar no cartão, variáveis {chaves} destacadas, filtro por modelo, opção "Gemini", copiar com feedback
- **IA Studio v3.1**: "Salvar na biblioteca" reconectado — qualquer saída (atual ou do histórico) vira item permanente, com categoria sugerida pelo agente e autor = agente

### Corrigido
- Extinção em massa do fóssil `name` nas 5 tabelas novas (era do mock × canônico `title`) — Prompts e Biblioteca destravaram
- Mocks restantes caíram de 3 → 1 (Configurações) — v2.0 à vista

### Lições operacionais
- Coluna `name` NOT NULL herdada ao lado do `title` novo = gêmeo fóssil — `drop column if exists` em lote resolve nas 5 tabelas de uma vez

## [v1.4] — 5 ago 2026 — Sprint 013: Trio CRUD real (Campanhas, Briefings, Comerciais)

### Adicionado
- **Campanhas real**: CRUD completo, plataforma/status/estágio, métricas no DNA (investido, impressões, cliques, conversões, receita, meta de ROAS) — CTR calculado sozinho e ROAS com semáforo contra a meta (casa do v3.0)
- **Briefings real**: CRUD + código BRF-XXXX + prazo-data exibido "12 ago 2026" + campo "Detalhes do pedido" (base pra IA da Sprint 015)
- **Comerciais real**: Kanban com setas ‹ › que gravam a etapa no banco (otimista + desfaz/confessa), edição clicando no cartão, tons em rodízio
- Schemas novos: campaigns (16 colunas), briefings (10), commercials (10) — todos com policy "dono total", grants e reload de cache na blindagem

### Corrigido
- Jaulas NOT NULL herdadas abertas (client_name/goal/roas_meta e campos opcionais) — "Sem cliente"/campos em branco passaram a valer
- Mocks restantes caíram de 6 → 3 (Biblioteca, Prompts, Configurações)

### Lições operacionais
- Coluna NOT NULL do schema velho trava insert com null — blindagem já abre as jaulas dos campos opcionais de fábrica
- `next build` + `next dev` juntos corrompem `.next` (validator "Cannot find name 'TCH'") — cozinha vazia: parar dev + limpar cache antes do build
- localhost ≠ vitrine: produção só muda depois do push + ~2 min

## [v1.3] — 5 ago 2026 — Sprint 012: Mídias 100% real + Memória Estratégica

### Adicionado
- Mídias real: upload → bucket privado `midias` (pasta do dono) + registro na tabela `assets`
- Prévia real de imagens via URLs assinadas (60 min); rótulos de categoria em PT-BR com valores EN no cofre
- Baixar com link assinado (10 min) via âncora invisível — imune ao bloqueador de pop-up; botão mostra "Abrindo…"
- Lixeira real: apaga arquivo do Storage + linha do banco (confirma antes de sumir da tela)
- Campos reais na tela: tamanho formatado, formato por extensão, etiquetas, cliente
- `docs/012_MEMORIA_ESTRATEGICA.md` — cérebro externo do projeto (decisões, gatilhos, estacionamento, ponto de retomada)
- Gatilhos novos: "reunião aberta" / "re"

### Corrigido
- Erros agora confessam "Detalhe técnico:" (upload, registro, Baixar, excluir) — Verdade na tela
- Registro grava `user_id` explícito (cinto + suspensório)
- Banco: 3 colunas fósseis da era mock removidas (`type`, `size`, `url`) — assets com 10 colunas canônicas
- Banco: grants de select/insert/update/delete para `authenticated` em `assets` (era o bloqueio real do registro)
- Cache da API recarregada após os ALTERs (`notify pgrst, 'reload schema'`)

### Lições operacionais
- Storage e tabela são portas separadas: **RLS (política) ≠ grants (chave de operação)** — registro falhando com política certa → checar grants
- Depois de ALTER TABLE no SQL Editor: `notify pgrst, 'reload schema'`
- `window.open` após `await` é engolido pelo bloqueador de pop-up — usar âncora invisível

## [v1.2] — 2 ago 2026

### Sprint 011 — IA real ✅ FECHADA

- **Motor de IA** (`src/app/api/ia/route.ts`, server-side): chave `GEMINI_API_KEY` só no servidor, acesso só para usuário logado, erros traduzidos
- **Autodescoberta de modelo:** o motor pergunta à API do Google quais modelos a chave pode usar, ordena por versão e fixa o primeiro que responde (hoje: `gemini-3.6-flash`); modelo aposentado pelo Google = auto-cura, zero manutenção ("hall dos reprovados")
- **`iaService`** — fachada única das telas, com parâmetros reais (temperatura, maxTokens com limites saudáveis)
- **Laboratório de IA** (`/laboratorio`) — bancada secreta de testes, fora do menu
- **IA Studio ligado no motor real:** 5 agentes em PT-BR (Estrategista, Copywriter, Roteirista UGC, Engenheiro de Prompts, Analista Criativo), temperatura/tokens como controles verdadeiros, histórico real da sessão, providers honestos (Gemini Conectado; Groq/GitHub Models/OpenRouter "Em breve")
- **Remédio IPv6 permanente** no script de dev (`NODE_OPTIONS=--dns-result-order=ipv4first`)
- **Chave de IA plantada na Vercel** (Production/Preview) → IA também em produção
- Lei reforçada: segredo colado no chat = revogar sem discutir · Lei nova: controle sem efeito real = bug de produto (verdade na tela)

## [v1.1] — 2 ago 2026

### Sprint 010 — Banco real por usuário ✅ FECHADA

- **Schema canônico no Supabase:** 8 tabelas (clients, deals, campaigns, briefings, commercials, assets, library_items, prompts), todas com `user_id` do dono + `created_at`
- **RLS "dono total"** nas 8 tabelas: cada usuário só vê e edita os próprios dados (verificado 8/8)
- **App-shell com usuário real:** nome e iniciais a partir do e-mail, menu do usuário com "Sair da conta"
- **Clientes real:** lista vem do Supabase, cadastro grava no banco, migração automática do localStorage, esqueleto de carregamento
- **CRM real ("Funil de Vendas"):** negócios persistem no banco, setas ← → mudam de etapa com update, lixeira por card, migração automática do localStorage, estado vazio e esqueleto
- **Coluna `owner`** adicionada à tabela `deals`
- **Lei da Língua:** na tela, zero inglês (Funil de Vendas, Novo Negócio…); no motor, inglês padrão. PT-BR entregue é contrato — mudança só com aviso prévio
- **Cadastro público trancado:** "Allow new users to sign up" OFF no Supabase + login sem "Criar conta" (interruptor `CADASTRO_ABERTO` no código, religável na fase pública)
Versão 1.0
OBJETIVO
Este documento registra todas as alterações importantes realizadas no SAUGC OS.
O objetivo é manter:
histórico do desenvolvimento;
controle de versões;
rastreabilidade;
continuidade entre equipes e IAs.
2. PADRÃO DE REGISTRO
Toda alteração deve informar:
Versão
Data
Alteração
Motivo
Impacto
Status
3. HISTÓRICO DO PROJETO
Versão 0.1 — Fundação MVP
Data
26/07/2026
Status
✅ Concluído
Alterações realizadas
Criação do projeto
Nome:
SAUGC OS MVP 0.1
Banco de dados criado
Supabase:
SAUGC OS SISTEMA DE ANÚNCIO UGC
Estrutura inicial criada:
Tabelas:

clients
campaigns
commercials
briefings
assets
prompts
Segurança
Implementado:
Row Level Security
Autenticação
Usuário inicial confirmado:
connectcv23@gmail.com
Versão 0.2 — Documentação da Arquitetura
Data
26/07/2026
Status
✅ Concluído
Documentos criados:
000_RULES.md
001_README.md
002_PROJECT_BIBLE.md
003_ROADMAP.md
004_ARCHITECTURE.md
005_DATABASE.md
006_FRONTEND.md
007_BACKEND.md
008_AI_SYSTEM.md
009_DESIGN_SYSTEM.md
4. DECISÕES IMPORTANTES REGISTRADAS
Banco oficial definido
Não utilizar novos bancos paralelos.
Banco oficial:
Supabase SAUGC OS
Código oficial
Controle:
GitHub
Desenvolvimento
Ambiente:
VS Code
IA como ferramenta auxiliar
As IAs devem:
acelerar desenvolvimento;
gerar código;
auxiliar decisões.
Não devem:
criar arquiteturas paralelas;
substituir documentação;
alterar banco sem autorização.
5. ESTADO ATUAL DO SISTEMA
Backend
Status:
🟨 Estruturado
Possui:
✅ Supabase conectado
✅ Banco criado
✅ Tabelas MVP
✅ RLS configurado
Frontend
Status:
🟨 Estrutura planejada
Possui:
✅ Arquitetura definida
✅ Design System definido
Inteligência Artificial
Status:
🟨 Planejada
Possui:
✅ Arquitetura dos agentes definida
PRÓXIMAS ALTERAÇÕES ESPERADAS
Próximos marcos:
## Versão 0.3 — Sprint 001: Core Visual Completo
Data: 28/07/2026
Status: ✅ Concluído

Entregas:
- Design system: 11 componentes (Button, Card, Badge c/ 8 variantes oficiais,
  Input, Textarea, Avatar, Dialog, Select, Tabs, Table, Switch)
- Tokens oficiais em Tailwind 4 CSS-first (sem tailwind.config.ts, sem
  @apply com opacidades arbitrárias)
- AppShell: sidebar 280/88 colapsável, drawer mobile, workspace switcher,
  header com Cmd+K (visual), notificações, ações rápidas, avatar
- 10 rotas PT-BR renderizando com dados mockados reais
- Dashboard: KPIs, receita 6 meses, performance por canal, pipeline, atividades
- Clientes e Campanhas: busca, filtros, stats, modais de criação
- Briefings: cards com status/creator/prazo/tags
- Comerciais: Kanban de produção UGC (Rascunho→Produção→Revisão→Aprovado)
- Assets: galeria filtrável; Biblioteca: tabs por categoria
- Prompts: variáveis {chave} destacadas, copiar, parâmetros
- IA Studio: 6 modelos, 5 agentes, playground mock, histórico
- Configurações: 6 abas com settingsTabs
- Mock store expandido: commercials, notifications, aiModels, aiHistory
  (+ 4 novos tipos correspondentes)
- lib/format.ts (BRL, compact, percent em pt-BR)

Decisões registradas:
- Paleta híbrida oficial em vigor; rotas PT-BR; Comerciais ≠ CRM
- 100% frontend, zero persistência (conforme escopo da sprint)

Gates: npm run build ✅ · npm run lint ✅ · TypeScript 100%

## v0.4 — Sprint 002: UX Avançado (29/07/2026)

**Status:** ✅ Concluída (lint ✅ · build ✅ · testes manuais ✅)

**Criados:**
- `src/lib/icon-map.ts` — mapa compartilhado string → LucideIcon (fonte única de ícones da navegação)
- `src/lib/toast.ts` — store externo minimalista: toast(), dismissToast(), getToasts(), subscribeToasts(); tipos success/error/info/warning; auto-dismiss 4s
- `src/components/layout/toaster.tsx` — container fixo bottom-right (z-[80], aria-live)
- `src/components/layout/command-palette.tsx` — busca global Ctrl+K: navegação + clientes + campanhas + briefings + comerciais + assets + biblioteca + prompts; setas/Enter/ESC; z-[70]
- `src/components/ui/skeleton.tsx` — componente base Skeleton
- `src/app/loading.tsx` — tela de carregamento global em formato de dashboard
- `src/app/not-found.tsx` — página 404 premium com CTA "Voltar ao Dashboard"

**Alterados:**
- `src/components/layout/app-shell.tsx` — Ctrl+K global, <CommandPalette>, <Toaster/>, toast ao trocar workspace, import do iconMap

**Decisões:**
- Skeletons sem dependência de tokens novos (bg-white/10 em JSX, permitido no Tailwind 4)
- loading.tsx e not-found.tsx renderizam dentro do AppShell (layout persiste)

## v0.5 — Sprint 003: Services Layer (29/07/2026)

**Status:** ✅ Concluída (lint ✅ · build ✅)

**Criados:**
- `src/lib/services/_utils.ts` — normalize/matches para buscas
- `src/lib/services/clientes.service.ts` — list, getById, filterByStatus, filterByTier, search
- `src/lib/services/campanhas.service.ts` — list, getById, filterByStatus, filterByPlatform, getByClient, search
- `src/lib/services/briefings.service.ts` — list, getById, filterByStatus, getByClient, filterByCreator, search
- `src/lib/services/comerciais.service.ts` — list, getById, filterByStatus, filterByFormat, groupByStatus (Kanban), search + commercialStatusOrder
- `src/lib/services/assets.service.ts` — list, getById, filterByCategory, filterByFormat, getByClient, search
- `src/lib/services/biblioteca.service.ts` — list, getById, filterByCategory, search
- `src/lib/services/prompts.service.ts` — list, getById, filterByModel, search, extractVariables ({chave})
- `src/lib/services/ia.service.ts` — listModels, getModelById, filterModelsByCategory, searchModels, listHistory, getHistoryByAgent
- `src/lib/services/configuracoes.service.ts` — getWorkspaces, getWorkspaceById, getSettingsTabs, getNavItems
- `src/lib/services/dashboard.service.ts` — getMetrics, getRevenueTrajectory, getActivityLog, getCampaignPerformance
- `src/lib/services/crm.service.ts` — listDeals, getDealById, filterDealsByStage, groupDealsByStage, getPipelineValueByStage, getTotalPipelineValue, searchDeals + dealStageOrder
- `src/lib/services/notificacoes.service.ts` — list, getUnread, getUnreadCount
- `src/lib/services/index.ts` — barrel oficial (@/lib/services)

**Decisões:**
- Camada 100% read-only: escrita só quando o backend existir
- Pipeline (pipelineValueByStage) é propriedade do crm.service — dashboard.service não duplica
- Telas continuam lendo dos mocks nesta fase; migração para os services acontece módulo a módulo (Sprint 004 já usa crm.service)
- Zero arquivos existentes alterados nesta sprint
## v0.6 — Sprint 004: CRM & Pipeline (30/07/2026)

**Status:** ✅ Concluída (lint ✅ · build ✅ · testes manuais ✅)

**Criados:**
- `src/app/crm/page.tsx` — rota /crm (server component, metadata)
- `src/app/crm/crm-view.tsx` — funil completo: 4 KPIs (total do pipeline, pipeline ponderado, deals em aberto, ticket médio), barra de distribuição por etapa (CSS puro), busca, Kanban 4 etapas com badge por fase, modal "Novo Deal" (em memória, sem persistência)

**Alterados:**
- `src/lib/icon-map.ts` — adicionado ícone Handshake
- `src/lib/mock-data.ts` — navItems ganha entrada CRM (/crm) entre Comerciais e Assets

**Marcos:**
- Primeira tela 100% servida pela camada de serviços (crmService + dealStageOrder)
- Sidebar e Command Palette (Ctrl+K) passam a ter 11 itens
- Sidebar agora supera o critério de qualidade "10 páginas" ✅

**Governança (COMANDO MESTRE DEFINITIVO registrado):**
- Sprint 005 (Landing + Pricing) movida para a fase futura (lançamento)
- Sprint 007 (Polish Profissional) e Sprint 008 (Prontidão de Venda) entram no cronograma
- Gatilhos: "deu certo segue o baile" (retomar) · "les go" (iniciar sprint) · "só se for agora" (modo sexta-feira)
- Lembrete travado: decisão de nome da marca ANTES do deploy (última janela = abertura da Sprint 006)
- Pricing âncora registrado: Freelancer R$ 97 · Growth R$ 197–297 · Scale R$ 397–597 · Enterprise R$ 997+ · setup R$ 497–1.997 · anual 10x12

## v0.7 — Sprint 006: Deploy + Documentação (30/07/2026)

**Status:** ✅ Concluída (1 pendência registrada: domínio)

**Marcos:**
- 🏷️ Marca oficial definida: **AnuncIA** (decidido pelo usuário; candidatos: ComercIA, CriativOS, Fluux)
- 🌍 Sistema publicado: https://anuncia-three.vercel.app (Vercel, plano Hobby)
- 🔄 CI/CD ativo: todo push na main publica nova versão automaticamente

**Criados:**
- `docs/MANUAL_DE_USO.md` — manual do usuário leigo (11 módulos, Ctrl+K, fase de demonstração)
- `docs/GUIA_DE_OPERACAO.md` — operação completa: ligar, atualizar, GitHub, Vercel/rollback, backup, troubleshooting, checklist diário

**Alterados:**
- Strings de marca em `src/` (SAUGC OS → AnuncIA, via substituição global case-sensitive)

**Decisões:**
- `anuncia.com.br` ocupado → escolhido `useanuncia.com.br` (mapa final: apex = site futuro, `app.` = sistema)
- Pasta local, repo GitHub e package.json seguem "saugc-os" como codinome interno (rename operacional fica para a 008 se desejado)
- IA real entra na fase Supabase logo após auth (protege a chave de API)

**⏸️ Pendência registrada:**
- Domínio `useanuncia.com.br`: estava livre em 30/07; compra adiada (recurso financeiro). Instruções no GUIA_DE_OPERACAO seção 7 + pedir "Parte 2" ao comprar

**Novos itens registrados na fase futura:** e-book ilustrado de boas-vindas (onboarding pós-venda) + videoaulas (roteiros/storyboard/narração)
## v0.8 — Sprint 007: Polish Profissional (30/07/2026)

**Status:** ✅ Concluída (lint ✅ · build ✅ · testes manuais ✅)

**Criados:**
- `src/components/ui/tooltip.tsx` — dica contextual em CSS puro (hover + teclado, acessível, sem libs)
- `src/components/ui/empty-state.tsx` — padrão oficial de "sem dados" (ícone + título + próximo passo + ação)
- `src/components/layout/onboarding.tsx` — tour de boas-vindas em 3 telas (1x por navegador, localStorage, ESC/backdrop pula, trava scroll, dots de progresso)

**Alterados:**
- `src/app/crm/crm-view.tsx` — deals do usuário agora PERSISTEM no navegador (mini-store localStorage via useSyncExternalStore, padrão hidratação-segura); tooltips nos 4 KPIs e na barra de probabilidade; EmptyState na busca sem resultado; microinterações (hover lift nos cards, transições suaves nas barras)
- `src/app/globals.css` — :focus-visible AA (anel azul no TAB), prefers-reduced-motion, scroll-behavior smooth, tap highlight transparente
- `src/components/layout/app-shell.tsx` — +2 linhas: import e <Onboarding />

**Decisões:**
- Persistência local (navegador) = ponte entre mock e Supabase; telas não mudam quando o banco chegar
- Tooltip/EmptyState sem dependências novas (zero libs — regra de performance)
- Política: Sprint 007 = zero features novas, só acabamento

**Checklist 007 cumprido:** empty states ✅ · tooltips ✅ · toasts (já existiam) ✅ · onboarding visual ✅ · acessibilidade (foco AA, reduced-motion) ✅ · microinterações ✅

### v0.8.1 — Bônus: persistência em Clientes (30/07/2026)

**Status:** ✅ (lint ✅ · build ✅)
**Alterados:** `src/app/clientes/clientes-view.tsx` — clientes cadastrados agora PERSISTEM no navegador (mesmo padrão localStorage do CRM); toast de confirmação; tooltips nos 4 stats; EmptyState oficial na busca; "Limpar meus clientes"; view migrada de mock direto para `clientesService`
**Motivo:** critério "persistência mockada coerente" do Comando Mestre + demo de venda mais forte

---

## v0.9 — Sprint 008: Prontidão de Venda (30/07/2026)

Sprint final de engenharia. Foco: transformar o projeto em produto apresentável, operável e vendável.

**Criado**
- `README.md` profissional na raiz: pitch do produto, stack, como rodar, estrutura, links dos docs, licença proprietária.
- `docs/CHECKLIST_COMERCIAL.md`: 4 partes — roteiro de demo ao vivo (10 min, minuto a minuto, com frases-matadoras e perguntas de fechamento), checklist de entrega ao cliente (dia 1), pós-venda (dias 1/3/7/15/30) e objeções com respostas prontas.

**Alterado**
- Polish comercial: "Agência Demo" → "Agência Modelo" (workspaces); textos da interface sem jargão demo/mock ("Sincronização de integrações concluída"); README "Demo ao vivo" → "Acesse ao vivo".
- Rename de rótulo: item de menu "Assets" → "Mídias" (rota `/assets` e pasta mantidas de propósito). Em consequência, `assets-view.tsx` foi migrado para `@/lib/services` (assetsService + clientesService) e textos ficaram 100% PT-BR ("Enviar Mídia", "Nenhuma mídia encontrada").
- GitHub: About preenchido (description, website https://anuncia-three.vercel.app, topics: nextjs, react, typescript, tailwindcss, saas, ugc, marketing).

**Validação final (carimbo do Comando Mestre)**
- `npm run lint` ✅ · `npm run build` ✅ (0 erros)
- 11 rotas no ar ✅ · menu "Mídias" ✅ · CRM persiste deal no navegador ✅ · Ctrl+K ✅ · 404 ✅ · menu mobile ☰ ✅ · foco por TAB (AA) ✅
- Deploy automático na Vercel verde: https://anuncia-three.vercel.app
- Critérios da Sprint 008: GitHub organizado ✅ · Vercel publicado ✅ · README profissional ✅ · manual de uso ✅ · checklist de operação ✅ · checklists comerciais (demo, entrega, pós-venda) ✅

**Resultado:** AnuncIA v0.9 está PRONTA PARA VENDA no modelo B2B assistido (demo ao vivo = trial, cobrança manual). Próximo degrau técnico: Fase Supabase (auth → banco → IA real → storage), somente com pedido explícito.


---

## v1.0 — Sprint 009: Login Real (31/07/2026)

Marco MAJOR: o produto sai do "modo demo" e ganha autenticação real. Ponte 1/4 da Fase Supabase.

**Criado**
- `src/lib/supabase/client.ts` + `server.ts` — clientes browser/servidor tolerantes a chave ausente: sem chave, o app segue em modo mock (build e deploy nunca quebram).
- `src/app/login/page.tsx` — tela de login premium (design AnuncIA, modo Entrar/Cadastrar, erros traduzidos p/ PT-BR, loading states).
- `src/proxy.ts` — o "porteiro" (Next 16 renomeou `middleware` → `proxy`; migramos já). Sem login → `/login`; logado no `/login` → `/`; sem chaves no ambiente → não bloqueia nada.
- `ROTAS_SEM_SHELL` no app-shell — páginas "de fora" (login) renderizam SEM painel. Corrige a tela em branco na causa raiz (o overlay do login ficava engolido pelas camadas do shell).
- Env: `.env.local` (não comitado) + variáveis cadastradas na Vercel (Production/Preview).

**Configurado**
- Projeto Supabase reaproveitado (`ugaessoebkqfqezmuwhc`, org anuncia, região São Paulo/sa-east-1); usuário admin criado com Auto Confirm; "Confirm email" OFF em dev (religar na fase pública).
- Produção https://anuncia-three.vercel.app → **exige login** ✅

**Testes (todos ✅):** porteiro (redirect → entrar → voltar), login local, login na Vercel.

**Aprendizados registrados:** 1 terminal = 1 servidor (terminal "node" engole comandos; usar só quando "powershell") · zumbi de porta: `taskkill /PID n /F` · cache travado: `Remove-Item -Recurse -Force .next` · URL do projeto ≠ URL `/rest/v1` · chave `sb_publishable` é pública por design; `service_role`/`sb_secret` = NUNCA · cadeado em "Development" na Vercel é normal (local usa .env.local) · as 6 tabelas antigas (vazias) serão substituídas pelo schema canônico na Sprint 010.

**Próximo:** Sprint 010 — banco real por usuário (schema oficial + RLS + services migrando do mock).




011_CURRENT_MISSION
Definir a missão técnica atual.
012_PROMPT_MASTER
Criar o prompt central para qualquer IA assumir o projeto.
013_API
Documentar integrações e endpoints.
014_SECURITY
Documentar segurança completa.
REGRA DE ATUALIZAÇÃO
Nenhuma alteração importante entra no projeto sem atualizar este arquivo.
Exemplo:

Nova funcionalidade:
AI Script Generator
↓
Atualizar:
010_CHANGELOG.md
↓
Criar documentação
↓
Implementar