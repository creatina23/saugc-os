# 🧭 GPS — MISSÃO ATUAL (v2.9)

> Memória viva do projeto. Este arquivo é SUBSTITUÍDO POR INTEIRO a cada fechamento de sprint.
> Última atualização: 20 ago 2026 — Sprint 018 "COMANDO EM EXPANSÃO" (linguagem) ABERTA por decisão soberana.

## 1. ONDE ESTAMOS

- Produto: **AnuncIA v2.0 + Sprint 016 + Sprint 017 Leva 1** · 🚀 NO AR (anuncia-three.vercel.app)
- 🎨 **SPRINT 018 ATIVA — "COMANDO EM EXPANSÃO"** (nova linguagem do produto, protocolo triado em `docs/017`, sistema de linguagem em `docs/018`) — decisão soberana do dono em 20 ago: aplicação FULL agora
- ⚠️ **Caça PAUSADA por decisão do dono (20 ago, noite)** — cobrança só no gatilho **"ativar modo caça"** · **balanço do dogfooding em 26 ago** segue de pé
- LP: quase no ar · será a última leva da 018 (com Implantação + 3 modelos de assinatura — preços a definir pelo dono antes de publicar)

## 2. ESTADO DO PRODUTO (o que já é real)

- Login premium minimalista ✅ + `src/proxy.ts` porteiro BLINDADO · Cadastro público TRANCADO (`CADASTRO_ABERTO = false`)
- Banco por usuário: 13 tabelas com `user_id` + RLS "dono total" · Storage: `midias` (privado) + `avatars` (público-leitura)
- Módulos reais: Clientes (com Excluir) · CRM (kanban) · IA Studio · Mídias · Campanhas · Briefings (com **Ponte do Vídeo** → comandos pro Flow) · Comerciais · Biblioteca · Prompts · Configurações (perfil/foto) · Dashboard real · Laboratório (fora do menu)
- **Mesa de Motores**: Gemini → GitHub Models → Groq → OpenRouter · sem chave = pulado em silêncio · espelho `GET /api/ia` = `{motores:[{id,armado}]}` com auth
- **IA Studio vivo**: selos reais · rótulo do motor no histórico · **Guia Vivo** (11 guias, `guia.tsx` + `lib/guia-data.ts`)
- **Modo celular** (viewport + régua 17px, kanban trilho) · **Verdade total** (selo 🟢/🟠, cenográficos: ZERO)
- **IA tecida**: ✨ Roteirista no Briefing → `commercials` · 🧠 Diretor de Tráfego nas Campanhas → `library_items`
- **Marca "vidro gelo" 🧊**: `public/logo-anuncia.png` + `src/app/icon.png` · fundo #0B0D12 · violeta #8B5CF6 · wordmark "Anunc" + "IA" gradiente
- Docs vivos: `010` · `011` (este) · `012` · caça: `013` `015` `016` · linguagem: `017` `018` (`014` pendente do original)

## 3. INFRA (cola rápida)

- Repo: `github.com/creatina23/saugc-os` (main) · Local: `C:\Projetos\BKp\saugc-os`
- Produção: `anuncia-three.vercel.app` (push na main = deploy ~2 min)
- Supabase: `ugaessoebkqfqezmuwhc` · sa-east-1 · Free (**ping 1×/semana**) · duas contas: app mora na principal (5972616a-…)
- Env (`.env.local` + Vercel Prod/Preview): `NEXT_PUBLIC_SUPABASE_URL` (sem /rest/v1) · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `GEMINI_API_KEY` · `GITHUB_MODELS_TOKEN` · `GROQ_API_KEY` · `OPENROUTER_API_KEY` (4 de IA = server-only)
- Segredo no chat = revogar sem discutir · env nova só vale no deploy seguinte
- Domínio `useanuncia.com.br`: pendente — .com.br = **R$ 40/ano fixo** no Registro.br (verificado 20 ago)

## 4. ARQUITETURA DE DADOS REAIS (padrão provado 10× + foto)

- `getSupabaseBrowser()` null → modo demonstração com selo · setState SÓ em `.then()` (`let ativo`) · snake→camel · `numeric`→`numero()`
- Insert `.select().single()` → prepend · delete com confirmação · kanban otimista (erro = desfaz + confessa)
- Erros confessam "Detalhe técnico:" · blindagem SQL: create if not exists → add column → drops not null → RLS + policy → grant authenticated → `notify pgrst, 'reload schema'` → prova
- SCHEMA CANÔNICO: clients(12) · campaigns(16) · briefings(10) · commercials(10) · library_items(8, cat. EN) · deals(9) · assets(10) · prompts(9) · profiles · ai_generations · ai_usage · ai_feedback
- Storage: `midias` (privado) · `avatars` (público-leitura/dono-escreve)

## 5. ARQUITETURA DE IA (Mesa de Motores — viva desde 13 ago)

- Telas → `ia-service` v3 (barrel) → POST `/api/ia` · `gerarTexto()` → `{ok, texto, erro, motor}` · `statusMotores()` → `[{id, armado}]`|null
- Cadeia: Gemini (autodescoberta) → GitHub Models → Groq → OpenRouter · Claude/OpenAI direto não têm tier grátis (fato 2026)
- Agentes = persona + tarefa + "pt-BR direto" · IA tecida lê o FORMULÁRIO e grava no banco

## 6. LEIS VIGENTES

**Constituição = comando de inicialização do Copiloto (14 leis).** Destaques: L1 uma ação por vez · L2 arquivo completo · L3 provas Ctrl+F + fim-de-arquivo · L5 PowerShell 1 linha · L7 porteiros · L8 segredo = revogar · L9 verdade na tela · L11 sem fonte não se edita · L12 docs · L13 venda primeiro/escopo/sem desconto.

**NOVO (20 ago) — Lei da Linguagem (`docs/018`):** toda copy de tela obedece ao sistema de linguagem: posicionamento "Comando em expansão" (no app) + hero na dor (LP/menus de venda), vocabulário preferido/proibido, nomenclatura de módulos (rótulo muda, chave NUNCA), CTAs = ação real, estados vazios com CONTEXTO+EXPLICAÇÃO+CTA, erros humanos com "Detalhe técnico:" no fim, orquestrador só como visão futura rotulada (regra 30).

Lei da Língua (L0) · Regra de Ouro v2 (arquivo completo + prova EOF; Replace All só texto puro) · Lei L6 (rótulo ≠ chave) · código da casa (setState em .then(), aspas tipográficas, componente fora de componente, `<button>` raiz sem variant confirmada).

## 7. PRÓXIMOS MOVIMENTOS — SPRINT 018 EM LEVAS (uma por vez)

- **Leva 1 — A porta do comando:** `login/page.tsx` (hero "Comando em expansão" + CTA "Entrar no comando") + app-shell (lateral/rodapé) → **fluxo: copiloto pede a cola → dono cola → copiloto devolve arquivo COMPLETO → dono cola no VS Code**
- **Leva 2 — Central:** `dashboard-view.tsx` (títulos orientados a decisão: "Como está sua operação" etc.)
- **Leva 3 — Menu e títulos dos módulos:** navItems/mock-data + PageHeaders (tabela do 018 §5 — só rótulo, L6)
- **Leva 4 — Estados vazios + microcopy:** telas de produção (fórmulas do 018 §8)
- **Leva 5 — IA Studio + Guia Vivo:** `guia-data.ts` e textos dos especialistas (018 §6)
- **Leva 6 — LP/SITE OFICIAL** ✅ **NO AR em 20 ago: https://lp-anunc-ia.vercel.app** (repo privado `creatina23/lp-anuncia` · QA de produção aprovado: página 0,31s, 11 imagens 200, 10 botões de zap) → pendências de conteúdo: vídeo 40s, depoimentos, foto/bio, links sociais, Pixel/GA4 (pós-deploy)
- A cada leva: porteiros (L7) + commit · Fechamento da 018: CHANGELOG + GPS + Memória juntos
- **Paralelo:** caça em pausa até o gatilho "ativar modo caça" (decisão do dono, 20 ago) · **26 ago:** balanço do dogfooding (Sala de Páginas vs caça ampliada — decisão soberana)
- Depois: 1º cliente → Sprint Checkout/Assinatura (webhook idempotente → `subscriptions` → gate + planos reais) → pós-lançamento (agente zap 🥇) → v3.0 "Waze do tráfego"
- Pendências pequenas: ping Supabase · NODE_OPTIONS no build · fóssil `results` · faxina Badge/`algo2()` · 014 aguardando original

## 8. LIÇÕES OPERACIONAIS (cicatrizes que viraram regra)

1–26 *(ver CHANGELOG — arquivo completo · porteiros · cola cortada · RLS ≠ grants · notify pgrst · jaula NOT NULL · Replace All texto puro · aspas tipográficas · Test-Path · componente fora de componente · prova de fim-de-arquivo · nunca adivinhar API)*
27. Motor sem chave pula em silêncio — o espelho confessa (13 ago)
28. Chave nova na Vercel = Production E Preview + só no deploy seguinte (13 ago)
29. **Rótulo de tela ≠ chave de código** — renomear menu nunca pode encostar em chave de banco/stage/rota (L6, reforçada pela Sprint 018)

## 9. GATILHOS DO DONO

"les go" · "deu certo" · "segue o baile" · "só se for agora" · "abre o roadmap" · "re" (recap 3 linhas) · "reunião aberta" (Modo Soberano) · "papelada" · "organiza o comando" · **"NO AR" (caça) = CLIENTE FECHOU**
