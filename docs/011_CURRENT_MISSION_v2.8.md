# 🧭 GPS — MISSÃO ATUAL (v2.8)

> Memória viva do projeto. Este arquivo é SUBSTITUÍDO POR INTEIRO a cada fechamento de sprint.
> Última atualização: 20 ago 2026 — papelada do Bloco A+B (Sprint 017 Leva 1 fechada em 13 ago).

## 1. ONDE ESTAMOS

- Produto: **AnuncIA v2.0 + Sprint 016 + Sprint 017 Leva 1** · 🚀 NO AR (v2.0 em 9 ago · 016 em 12 ago · 017 L1 em 13 ago 2026)
- Sprint ativa: **nenhuma aberta** (017 Leva 1 ✅ FECHADA — Sala de Páginas deslizada por decisão Opção C)
- 🎯 **CAÇA AO 1º CLIENTE EM CURSO (D+1→D+14)** — placar com o dono (contatos/conversas/demos; cobrar números antes de decidir qualquer coisa)
- 🐕 **DOGFOODING 12 → 26 ago** — Cliente Zero operando de verdade; atrito = diário de bordo + chamar o copiloto, NUNCA consertar sozinho
- **26 ago: reunião de balanço** → decidir Sala de Páginas vs caça ampliada
- LP: **quase no ar** (gerada no Lovable → ajustes VS Code → deploy Vercel → logo gelo + zap real + vídeo de 40s)

## 2. ESTADO DO PRODUTO (o que já é real)

- Login premium minimalista ✅ + `src/proxy.ts` porteiro BLINDADO (Supabase fora = modo degradado, nunca tela 500) · Cadastro público TRANCADO
- Banco por usuário: 13 tabelas com `user_id` + RLS "dono total" · Storage: buckets `midias` (privado) + `avatars` (leitura pública, escrita do dono)
- Módulos reais: Clientes (com Excluir) · CRM (kanban) · IA Studio · Mídias · Campanhas · Briefings (com **Ponte do Vídeo**) · Comerciais · Biblioteca · Prompts · Configurações (perfil/foto) · Dashboard 100% real · Laboratório (fora do menu)
- **Mesa de Motores (017a)**: cadeia Gemini → GitHub Models → Groq → OpenRouter · sem chave = motor pulado em silêncio · espelho `GET /api/ia` = `{motores:[{id,armado}]}` com auth, zero segredo exposto
- **IA Studio vivo (017b)**: selos Conectado/Sem chave REAIS · rótulo do motor no histórico · dívidas 016d pagas
- **Ponte do Vídeo (017c)**: Briefing → roteiro → **comandos prontos pro Flow cena a cena** (Caminho A: copiar → colar no gerador de vídeo)
- **Guia Vivo**: tutorial dentro do app (11 guias + atalhos, `guia.tsx` + `lib/guia-data.ts`)
- **Modo celular (016b)**: viewport oficial + régua 17px ≤640px · kanban trilho com ímã · tabelas rolam
- **Verdade total (016d)**: selo honesto 🟢 Operacional / 🟠 Modo demonstração · cenográficos: ZERO
- **IA tecida no fluxo (015)**: ✨ Roteirista no Briefing (→ `commercials`) · 🧠 Diretor de Tráfego nas Campanhas (→ `library_items`)
- **Marca "vidro gelo" 🧊**: `public/logo-anuncia.png` (lateral 47px · login 78px) + `src/app/icon.png` · fundo #0B0D12 · violeta #8B5CF6 · voz "central de comando" · wordmark "Anunc" claro + "IA" gradiente violeta→ciano
- Docs vivos: `010_CHANGELOG` · `011_CURRENT_MISSION` (este) · `012_MEMORIA_ESTRATEGICA` · caça: `013` `015` `016` (`014` pendente do arquivo original)

## 3. INFRA (cola rápida)

- Repo: `github.com/creatina23/saugc-os` (main) · Local: `C:\Projetos\BKp\saugc-os`
- Produção: `anuncia-three.vercel.app` (push na main = deploy ~2 min)
- Supabase: projeto `ugaessoebkqfqezmuwhc` · sa-east-1 · Free (**pingar 1×/semana** — quinta no cronograma)
- ⚠️ Duas contas Supabase: app mora na principal (5972616a-…) — regra de bolso: Perfil mostra o e-mail logado
- Env (`.env.local` + Vercel Production **e** Preview): `NEXT_PUBLIC_SUPABASE_URL` (sem `/rest/v1`) · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `GEMINI_API_KEY` · `GITHUB_MODELS_TOKEN` · `GROQ_API_KEY` · `OPENROUTER_API_KEY` (as 4 de IA = server-only, JAMAIS em NEXT_PUBLIC_)
- Segredo no chat = revogar sem discutir · env nova na Vercel só vale no deploy seguinte
- Sem internet: app degrada com dignidade (modo demonstração / proxy blindado) — offline real descartado pra sempre
- Domínio `useanuncia.com.br`: pendente — **.com.br custa R$ 40/ano fixo no Registro.br (verificado 20 ago 2026)**

## 4. ARQUITETURA DE DADOS REAIS (padrão provado 10× + foto)

- `getSupabaseBrowser()` null → modo demonstração com selo, sem quebrar
- Carga: `coletarX()` module-level + `.then()` no `useEffect` com `let ativo` — setState SÓ em `.then()`
- snake (banco) → camel (tela) · `numeric` chega string → helper `numero()`
- Insert `.select().single()` → prepend · update → troca no lugar · delete: confirmação "não tem volta" → delete real
- Kanban otimista: muda na tela → grava → erro = desfaz + confessa
- Erros confessam "Detalhe técnico:" — nunca falha silenciosa
- Blindagem SQL: create if not exists → add column if not exists → drops not null dos opcionais → RLS + policy → **grant authenticated** → `notify pgrst, 'reload schema'` → select de prova
- SCHEMA CANÔNICO: clients(12) · campaigns(16, +name) · briefings(10) · commercials(10) · library_items(8, categorias EN) · deals(9, stages Qualificação/Proposta Enviada/Negociação/Contrato Fechado) · assets(10) · prompts(9) · profiles · ai_generations · ai_usage · ai_feedback · activity_log(na Sprint de assinatura)
- Storage: `midias` (privado) · `avatars` (público-leitura/dono-escreve)

## 5. ARQUITETURA DE IA (Mesa de Motores — viva desde 13 ago)

- Telas → `ia-service` v3 (barrel `@/lib/services`) → POST `/api/ia` · `gerarTexto()` → `{ok, texto, erro, motor}` · `statusMotores()` → `[{id, armado}]`|null
- **Cadeia de reserva:** Gemini (autodescoberta, reserva gemini-2.0-flash) → GitHub Models (openai/gpt-4o) → Groq (llama-3.3-70b-versatile) → OpenRouter (llama-3.3-70b :free). Sem chave = motor pulado em silêncio. Fato 2026: Claude/OpenAI direto NÃO têm cota grátis de API.
- Autodescoberta de modelo: `/v1beta/models` → filtra especialidades → hall dos reprovados → fixa o 1º 200
- `temperatura`/`maxTokens` com clamp · logs `[motor-ia]` no terminal
- Agentes = persona (prefixo) + tarefa + "pt-BR direto, sem cercas de código" · IA tecida lê o FORMULÁRIO real e grava no banco

## 6. LEIS VIGENTES

**Constituição completa = comando de inicialização do Copiloto (14 leis).** As que mais pegam no dia a dia:

- **L1 Uma ação por vez** · **L2 Código = arquivo completo** · **L3 Provas Ctrl+F + fim-de-arquivo** · **L5 PowerShell 1 linha por vez** · **L7 Porteiros antes do carteiro** · **L8 Segredo no chat = revogar** · **L9 Verdade na tela (mock só com selo)** · **L11 Sem o arquivo atual não se edita** · **L12 Docs: CHANGELOG append-only · GPS full-replace · Memória por decisão** · **L13 Venda primeiro · 50% entrada · escopo fechado · sem desconto**
- Lei da Língua: tela = zero jargão (banidos: UGC, MRR, pipeline, providers, creator) · PT-BR entregue é CONTRATO
- Regra de Ouro v2: arquivo completo + prova de fim-de-arquivo (cicatriz crm-view/384) · Replace All só texto puro de tela
- Código da casa: setState só em `.then()` · aspas tipográficas em JSX · componente nunca dentro de componente · botão sem variant confirmada = `<button>` raiz · comentários PT-BR com marca de sprint
- Componentes: Badge (default/secondary/destructive/outline/success/warning/info/violet) · Button (default/outline/ghost/ai; sm/icon; asChild) · PageHeader · Dialog/Select family · empty-state e tooltip EXISTEM mas API não confirmada — NÃO USAR (`title` nativo)

## 7. PRÓXIMOS MOVIMENTOS (ordem de batalha)

0. 🎯 **CAÇA D+1→D+14** — 10 contatos/dia, follow-ups D+1/D+3/D+7, demos 15 min, meta 1 cliente. **Placar com o dono — cobrar.** "NO AR" (caça) = cliente fechou → comemorar + Sprint de implantação
1. **Papelada Bloco A+B** (este passe) → commit junto com GPS + Memória
2. **LP final**: ajustes VS Code (`lp-anuncia`, repo separado) → deploy Vercel → logo gelo + zap real + vídeo de 40s
3. **Guia do link de pagamento** (InfinitePay) — quando o dono pedir
4. **26 ago: balanço do dogfooding** → Sala de Páginas vs caça ampliada (decisão soberana)
5. **1º cliente fechado** → Sprint Checkout/Assinatura (webhook idempotente → `subscriptions` → gate + `activity_log` + consumo de IA) → pós-lançamento (agente zap 🥇, vídeo nativo pago, integrações) → **v3.0 "Waze do tráfego"** (Cérebro → Olho → Mão)
- Pendências pequenas: ping semanal Supabase · cravar NODE_OPTIONS no build · coluna fóssil `results` · faxina `Badge` ocioso (dashboard-view:32) · `algo2()` em api/ia/route.ts · domínio R$ 40/ano
- Paralelo diário: **caça comercial** (ritual de 45 min do mapa)

## 8. LIÇÕES OPERACIONAIS (cicatrizes que viraram regra)

1–26. *(mantidas — ver CHANGELOG v1.7 e versões anteriores: arquivo completo · porteiros · cola cortada · RLS ≠ grants · notify pgrst · jaula NOT NULL · Replace All só texto puro · aspas tipográficas · Test-Path em imagem · componente fora de componente · prova de fim-de-arquivo · nunca adivinhar API)*

27. **Motor sem chave pula em silêncio — o espelho confessa na tela** (Mesa, 13 ago): a verdade dos motores se lê no `GET /api/ia`, segredo nunca sai do server
28. **Chave nova na Vercel = os DOIS ambientes (Production e Preview) + só vale no deploy seguinte** (incidente Vercel-envs, 13 ago)

## 9. GATILHOS DO DONO

- "les go" = começa sprint · "deu certo" = confirmado · "segue o baile" = retoma · "só se for agora" = Modo Sexta-Feira · "abre o roadmap" = o que fazer hoje · "re" = recap 3 linhas · "reunião aberta" = Modo Soberano · "papelada" = docs pendentes · "organiza o comando" = triagem de comando externo · "NO AR" (caça) = **CLIENTE FECHOU**
