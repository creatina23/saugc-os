# ANUNCIA — ARCHITECTURE
# Arquitetura e Dependências — REBIRTH 1.0 — 25 ago 2026 noite
# Protocolo: RECRIAR evolução — camada superior de memória estruturada

## STACK
Frontend: Next.js 16.12 Turbopack, React 19.2.4, TypeScript 5, Tailwind CSS 4, Shadcn UI (Radix Avatar/Dialog/Select/Slot/Tabs), framer-motion 12.42.2, lucide-react 1.27.0, clsx, tailwind-merge, class-variance-authority
Backend: Supabase (PostgreSQL + Auth + Storage + Realtime)
Hospedagem: Vercel Hobby (deploy auto main, maxDuration 60 pra imagem)
Repositório: GitHub github.com/creatina23/saugc-os (main) + lp-anuncia privado (lp-anunc-ia.vercel.app)
Linguagem: TypeScript + TSX
Framework: Next.js App Router (src/app/layout.tsx com AppShell, proxy.ts middleware)

## MAPA ARQUITETURA
```
FRONTEND (Next.js App Router)
  ↓
LAYOUT (app-shell: sidebar + header + page-header + command-palette + guia)
  ↓
PÁGINAS (10 módulos + IA Studio + Laboratório + Login)
  Dashboard real, Clientes, Campanhas, Briefings, Comerciais, Mídias, Biblioteca, Prompts, CRM, Configurações, IA Studio, Laboratório, Login
  ↓
SERVIÇOS (lib/services/ barrel index.ts v2)
  ia-service.ts v3: gerarTexto(prompt, {temperatura, maxTokens}) → {ok, texto, erro, motor} + statusMotores() → [{id,armado}]|null
  imagem-service.ts v3: gerarImagem(prompt, {formato quadrado/retrato/vertical/paisagem, referencia? data URL ≤512, negativo?}) → {ok, imagem data URL, erro, motor, formato, promptUsado, notas[]}
  orquestrador-service.ts PLANEJADO 020-A: producaoCompleta(objetivo) → POST /api/orquestrador
  Outros: assets.service.ts, biblioteca.service.ts, briefings.service.ts, campanhas.service.ts, clientes.service.ts, comerciais.service.ts, configuracoes.service.ts, crm.service.ts, dashboard.service.ts, prompts.service.ts (mocks antigos, telas usam Supabase direto — padrão provado 10×)
  ↓
APIs / ROTAS (app/api/ — server-only, chaves nunca vão pro navegador)
  /api/ia v6: POST gerar-texto + GET espelho {motores:[{id,armado}]} — cadeia Gemini (autodescoberta+hall reprovados) → Groq (auto /openai/v1/models prefere llama-4/gpt-oss) → OpenRouter (auto lista :free prefere deepseek/llama/gemma/qwen/gpt-oss) → Cerebras (auto opcional) — GitHub Models FALECEU 30 jul 2026 410 — skip gracioso sem chave — só logado — logs [motor-ia] terminal — resumo fila nos erros "(fila: Gemini→429 | Groq→404 | ...)" — temperatura 0-1 + maxTokens 256-4096 com limites
  /api/imagem v12.3 FIX Congruência: POST gerar-imagem + GET espelho — cadeia SDXL Lightning primeiro (fotorealista) → klein-9b → klein-4b → schnell → HF SDXL (HF_TOKEN cota ~80/mês) → Pollinations flux/turbo (pública sem chave sem cota) → Gemini imagem paga desligada (liga com GEMINI_IMAGEM_ATIVA=true) — tradutor PT→EN elite v2 detector elite já bom mantém 100% original sem diminuir + suffix anti-pintura/amarelo — referência input_image_0 ≤512 navegador reduz via canvas — anti-texto no visible text — maxDuration 60 — só logado — cota casa 10k neurônios/dia ≈230/dia — medição URGENTE
  /api/orquestrador PLANEJADA 020-A: pipeline fixa Produção Completa Comportamento→Estrategista→Copywriter→Diretor Criativo→Engenheiro→Analista → consolidado — não mexe em /api/ia e /api/imagem
  ↓
IA (Mesa de Motores)
  Texto: Gemini Flash (Google) titular autodescoberta + Groq (ultra rápido) + OpenRouter free auto + Cerebras opcional ultra-rápido + futura OpenAI paga gpt-4o-mini + Claude Haiku — todas com auto-descoberta, hall reprovados, cache modelos compatíveis, skip gracioso
  Imagem: Cloudflare Workers AI FLUX.2 klein-9b/4b + SDXL Lightning + schnell + HF SDXL + Pollinations flux/turbo + Gemini imagem paga — auto-descoberta, skip gracioso
  ↓
BANCO (Supabase PostgreSQL)
  Tabelas canônicas 8 + extras: clients(12), campaigns(16), briefings(10), commercials(10), library_items(8 cat EN UGC Script Templates/Ad Copy Hooks/Criador Guidelines/Strategy Guides + title description author content user_id), deals(9), assets(10 category EN Video Ads/Hook Clips/B-Roll/Product Photos client_name format size_bytes tags storage_path), prompts(9), profiles (avatar_url), ai_generations, ai_usage, ai_feedback, perfis_psicologicos proposta 020-A (id user_id briefing_id? perfil JSON created_at) + subscriptions futura (webhook idempotente → gate) — RLS dono total user_id=auth.uid() — grants authenticated — notify pgrst reload schema — blindagem SQL create if not exists → add column → drops not null → RLS + policy → grant → notify — padrão provado 10× + foto: getSupabaseBrowser null → demo com selo, setState SÓ .then() com let ativo, snake→camel, numeric→numero(), insert .select().single() → prepend, delete confirmação, kanban otimista
  ↓
STORAGE (Supabase Storage)
  midias: privado, por user_id pasta, até 50MB por arquivo free, upload File ou Blob (Fase 4 data URL→Blob), createSignedUrls 3600 prévias imagem, createSignedUrl 600 baixar via âncora invisível, remove lixeira — assets tabela registra storage_path
  avatars: público-leitura dono-escreve, PNG/JPG/WebP até 2MB, upsert, ?v= anti-cache, avatar_url no profiles, USER_UPDATED event troca em todas telas
  ↓
INTEGRAÇÕES
  Existentes reais: Supabase, Vercel, GitHub, Mesa Texto, Mesa Imagem, IA Studio 5 agentes ELITE v3.9, Ponte Vídeo Flow, Guia Vivo 11 guias, Mídias real, Biblioteca real, marca vidro gelo 🧊
  Planejadas: geração vídeo direta /api/video (Runway/Veo/Flow), Meta/Instagram/TikTok/Google Ads API só após vendas autopilot com confirmação, WhatsApp Meta Cloud API + webhook Vercel + Gemini + Supabase R$0 chip separado Evolution/Baileys proibido candidata #1 pós-lançamento, distribuição anúncios, gestão campanhas, análise métricas, CRM, automações, assinatura/cobrança webhook idempotente, inteligência mercado/consumidor/performance — preparar terreno não mock
```

## DEPENDÊNCIAS ENTRE COMPONENTES

- TELAS → SERVICES (barrel) → ROTAS (server) → MESA → SUPABASE
- ia-studio-view v3.9 → ia-service + imagem-service → /api/ia v6 + /api/imagem v12.3 → Supabase (library_items + assets + midias bucket)
- assets-view (Mídias) → Supabase Storage midias + assets tabela (direto, não via service mock) — padrão real
- campanhas-view → Diretor Tráfego IA tecida → ia-service → library_items
- briefings-view → Roteirista IA tecida → commercials + Ponte do Vídeo
- dashboard-view → Supabase clients+campaigns+deals → KPIs reais
- proxy.ts → protege /api/ia e /api/imagem → só logado
- guia-data.ts → guia.tsx → AppShell
- VERSOES.md → mapa sincronia + cartão 7 Ctrl+F → garante repo e bancada mesma verdade
- Base Excelência ainda na tela ia-studio-view, deveria ir pra rota /api/ia e /api/orquestrador (decisão Reunião 2) — será 020-A
- Orquestrador futuro: /orquestrador view → orquestrador-service → /api/orquestrador → chama Mesa Texto 5-6 vezes com contexto compartilhado Perfil Psicológico → Biblioteca+Mídias

## VARIÁVEIS NECESSÁRIAS (sem secrets, só nomes e onde configurar)

Server-only (nunca no navegador, nunca no chat L8):
- NEXT_PUBLIC_SUPABASE_URL (sem /rest/v1) + NEXT_PUBLIC_SUPABASE_ANON_KEY — .env.local + Vercel Production e Preview
- GEMINI_API_KEY — Mesa Texto titular + tradutor imagem
- GROQ_API_KEY — Mesa Texto reserva 1
- OPENROUTER_API_KEY — Mesa Texto reserva 2 free auto
- CEREBRAS_API_KEY (opcional) — Mesa Texto reserva 3 opcional ultra-rápido — grátis cloud.cerebras.ai
- CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN — Mesa Imagens titular — conta free 10k neurônios/dia — nunca no chat
- HF_TOKEN (opcional) — Hugging Face SDXL cota separada ~80/mês — hf.co/settings/tokens
- OPENAI_API_KEY (futura paga) — 1 IA paga aceita desde já — gpt-4o-mini US$0,15/1M — quando quiser
- GEMINI_IMAGEM_ATIVA (futura paga) — true + GEMINI_API_KEY — ativa reserva paga Gemini imagem US$0,03-0,13/img — desligada por padrão custo
- GEMINI_IMAGEM_MODELO (opcional) — gemini-2.0-flash-preview-image-generation

Todas em .env.local (local) + Vercel Settings → Environment Variables Production e Preview — só valem no deploy seguinte — segredo no chat = revogar sem discutir

## O QUE NÃO ALTERAR (preservação)

Supabase, Vercel, GitHub, Mesa Texto v6, Mesa Imagens v12.3, IA Studio v3.9, tabelas, services barrel, rotas /api/ia e /api/imagem (criar nova /api/orquestrador separada), Ponte Vídeo, Guia Vivo, Dashboard real — patrimônio — não criar mocks/demos/dados fictícios — não alterar auth/RLS/storage sem necessidade e sem autorização
