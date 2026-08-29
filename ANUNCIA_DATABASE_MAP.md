# ANUNCIA — DATABASE MAP
# Mapa do Banco e Relacionamentos — REBIRTH 1.0 — 25 ago 2026 noite

## SUPABASE
Projeto: ugaessoebkqfqezmuwhc, sa-east-1, Free — 2 contas, app na principal 5972616a-... — ping 1×/semana — duas contas Supabase regra de bolso Perfil mostra logado — .env.local + Vercel Production e Preview — segredo no chat = revogar

## TABELAS CANÔNICAS (8 + extras) — com colunas reais verificadas no código

### clients(12) — [FUNCIONANDO]
- id (uuid pk)
- user_id (uuid fk auth.users, dono total RLS)
- name, company, email, phone, tier (Enterprise/Growth/Starter), status (Ativo/Inativo/Em onboarding), mrr (numeric → numero()), logoInitials, since, created_at, etc.
- RLS: dono total user_id = auth.uid()
- Uso: Clientes CRUD real com Excluir confirmação — lista todos assets por cliente — workspace?

### campaigns(16) — [FUNCIONANDO]
- id, user_id, name, client (company), platform (Meta Ads/Google Ads/TikTok), status (Ativa/Pausada/Rascunho), budget (numeric), spend, impressions, ctr, stage, created_at, etc. + fóssil results coluna (pendência faxina)
- RLS dono total
- Uso: Campanhas CRUD real — Diretor de Tráfego IA tecida lê métricas formulário (investido, impressões, ctr) → library_items

### briefings(10) — [FUNCIONANDO]
- id, user_id, title, client, creator, status (Em Aprovação/Aprovado/Rascunho), deadline, tags, created_at, etc. + detalhes?
- RLS dono total
- Uso: Briefings CRUD real — Roteirista IA tecida lê pedido inteiro título cliente criador tags prazo detalhes → roteiro editável → Salvar como criativo no quadro grava em commercials (status Rascunho) — Ponte do Vídeo roteiro → comandos Flow cena a cena

### commercials(10) — [FUNCIONANDO]
- id, user_id, title, client, format (Reels/TikTok/Shorts/Feed), script, creator, status (Rascunho/Produção/Revisão/Aprovado), dueDate, thumbnailTone (blue/violet/emerald/amber/pink), created_at
- RLS dono total
- Uso: Comerciais Kanban/Pipeline 4 colunas Qualificação/Proposta Enviada/Negociação/Contrato Fechado? Na verdade comerciais é produção, deals é CRM — original limpo realocação geração mora só IA Studio — gestão produção

### library_items(8, cat EN) — [FUNCIONANDO]
- id, user_id, title, category (LibraryCategory EN: UGC Script Templates, Ad Copy Hooks, Criador Guidelines, Strategy Guides), author, description, content, created_at, updated_at
- RLS dono total
- Categorias valores cofre EN, rótulos tela PT-BR Lei da Língua tela PT motor EN — Lei L6 rótulo ≠ chave nunca encostar chave banco/stage/rota
- Uso: Biblioteca real — Knowledge vault playbook templates — IA Studio salva texto e imagem Fase 4 (title, category Criador Guidelines, author motor, description com motor+formato+prompt, content com prompt original+EN+motor+formato+arquivo) — Campanhas Diretor Tráfego IA tecida grava lá

### deals(9) — [FUNCIONANDO]
- id, user_id, title, company, value, stage (DealStage: Qualificação/Proposta Enviada/Negociação/Contrato Fechado), owner, probability, created_at
- RLS dono total
- Uso: CRM kanban real deals pipeline — 4 colunas — otimista erro desfaz + confessa — total pipeline value

### assets(10) — [FUNCIONANDO]
- id, user_id, name, category (AssetCategory EN: Video Ads, Hook Clips, B-Roll, Product Photos), client_name, format (AssetFormat MP4/MOV/PNG/JPG/GIF), size_bytes, tags, storage_path, created_at
- RLS dono total — COLUNAS id name client_name category format size_bytes tags storage_path created_at — midiaDaLinha + demoParaMidia
- Storage: midias bucket privado — storage_path user_id/timestamp-nome sanitizado — URLs assinadas 60min prévias imagem + 600 baixar âncora invisível + remove lixeira — tamanho formatado, formato por extensão, etiquetas, cliente — modo demo mock com selo se sem banco — Fase 4 imagem gerada base64→Blob→upload mesmo fluxo categoria Product Photos tags [motor, formato, ia-studio, gerada]
- Uso: Mídias real — Digital asset management gallery — resolução badges, formato tags, download mock buttons viraram reais, filtros categoria + cliente + busca livre nome/cliente/etiqueta

### prompts(9) — [FUNCIONANDO]
- id, user_id, title, description, content, tags, models, parameters (Record<string,string|number>), created_at
- RLS dono total
- Uso: AI Prompt library — prompt cards com variáveis {nicho} {publico} target LLMs GPT-4o Claude Midjourney copy button tags — biblioteca prompts reais + baú IA

### profiles — [FUNCIONANDO]
- id (uuid pk fk auth.users), avatar_url, etc. — bucket avatars público-leitura dono-escreve — foto perfil real upload Configurações Perfil PNG/JPG/WebP até 2MB upsert ?v= anti-cache — aparece 3 pontos lateral aberta/recolhida/topo via USER_UPDATED

### ai_generations, ai_usage, ai_feedback — [FUNCIONANDO]? [PARCIAL]?
- ai_generations: histórico gerações? — IA Studio histórico grava quem respondeu motor no histórico
- ai_usage: medição uso? — cota gerações/mês contam texto+imagem — cota free é da CASA (~230/dia totais) não por usuário com 5 clientes ativos aperta medição real Sprint assinatura sobe de importante pra URGENTE
- ai_feedback: feedback gerações?
- Status: [PARCIAL] ou [FUNCIONANDO] — schema canônico inclui, mas medição por usuário ainda não — será Sprint assinatura

### perfis_psicologicos — [PLANEJADA] — proposta 020-A
- id, user_id, briefing_id? (fk briefings), perfil JSON (quem é essa pessoa? o que ela quer? o que ela teme? o que impede decisão? o que chama atenção? o que aumenta confiança? o que reduz fricção? o que influencia decisão? o que pode fazer agir? + psicologia comportamental cognitiva social neurociência neuromarketing consumidor economia comportamental decisão vieses atenção memória motivação emoção hábitos persuasão arquétipos antropologia semiótica linguística UX Psychology behavioral design framing confiança identidade), created_at
- RLS dono total
- Uso: Comportamento Humano & Persuasão pré-processador gera Perfil Psicológico que alimenta todos os outros agentes — salvo no banco como ativo reutilizável — é pré-processador — alimenta Estrategista, Copywriter, Diretor Criativo, Engenheiro, Analista — é patrimônio — será 020-A — arquitetura preparada não mock

### subscriptions — [PLANEJADA] — futura pós-1º-cliente
- id, user_id, plan (Start/Max Premium/Enterprise), status, mrr, created_at, etc. — webhook idempotente → gate + planos reais — será Sprint Checkout/Assinatura — [PLANEJADA]

## RELACIONAMENTOS

- auth.users 1:N clients (user_id)
- auth.users 1:N campaigns (user_id) — campaigns.client = clients.company (nome, não fk) — lista assets de um cliente pelo nome
- auth.users 1:N briefings (user_id) — briefings.client = clients.company
- auth.users 1:N commercials (user_id) — commercials.client = clients.company — briefings → commercials via Roteirista IA tecida (briefing entra roteiro sai salva como criativo no quadro)
- auth.users 1:N library_items (user_id) — library_items salvo por IA Studio (texto e imagem) + Diretor Tráfego IA tecida
- auth.users 1:N deals (user_id) — deals.company = clients.company — CRM kanban
- auth.users 1:N assets (user_id) — assets.client_name = clients.company? Ou null Sem cliente — assets.storage_path = midias bucket user_id/timestamp-nome — Mídias real
- auth.users 1:N prompts (user_id) — prompts library
- auth.users 1:1 profiles (id = auth.users.id) — avatar_url → avatars bucket
- briefings 1:N perfis_psicologicos (briefing_id) — proposta 020-A — Comportamento pré-processador
- clients 1:N assets (por nome) — assets.getByClient(clientName) filtra por nome
- campaigns 1:N ? — não tem fk direta, mas dashboard agrupa por plataforma real
- library_items N:1 clients? Não, só texto, mas description pode ter cliente

## PADRÃO PROVADO 10× + FOTO (lei do código real)

- getSupabaseBrowser() null → modo demonstração com selo warning visível — modo demo mock com selo
- setState SÓ em .then() com let ativo (lei ESLint) — evita setState em componente desmontado
- snake→camel (name → nome) — midiaDaLinha converte
- numeric→numero() (mrr, budget, spend, etc. numeric → Number)
- Insert .select().single() → prepend (nova linha no topo da lista)
- Delete com confirmação — lixeira confirma no banco ANTES de tirar da tela
- Kanban otimista (erro = desfaz + confessa)
- Erros confessam "Detalhe técnico:" + detalhe sanitizado sem segredo — dedo-duro confesso — verdade na tela
- Blindagem SQL: create if not exists → add column → drops not null → RLS + policy → grant authenticated → notify pgrst, 'reload schema' → prova
- COLUNAS const com lista colunas reais pra select
- SanitizarNome remove acentos/espaços/símbolos → lowercase normalize NFD replace [̀-ͯ] replace [^a-z0-9.\-_] por - replace -+ por -
- ExtensaoDe + ehImagem + formatarTamanho + dataCurta

## O QUE NÃO ALTERAR (preservação)

- Não recriar banco sem necessidade
- Não criar mock quando existe infraestrutura real (já tem banco real, não voltar pra mock-data)
- Não substituir Supabase, não apagar tabelas existentes, não substituir Vercel/GitHub
- Não reescrever sistema inteiro pra corrigir problema localizado (ex: imagem feia → corrigir /api/imagem e persona Engenheiro, não reescrever IA Studio inteiro)
- Não alterar arquitetura sem justificativa — se pode gerar conflito PARE explique risco solução peça permissão
- Preservar o que já funciona (patrimônio, não preferência estética)
- Rótulo tela ≠ chave código/banco/rota (L6) — mudar rótulo menu nunca pode encostar chave banco/stage/rota

## MIGRATIONS PENDENTES

- perfis_psicologicos tabela nova para 020-A (Comportamento pré-processador) — criar migration com user_id, briefing_id?, perfil JSONB, created_at + RLS dono total
- subscriptions tabela para Checkout/Assinatura pós-1º-cliente
- Faxinas: coluna fóssil results em campaigns, Badge dashboard-view:32, algo2() em api/ia/route.ts, NODE_OPTIONS ipv4first no build

## [NAO VERIFICADO]

- Supabase produção tabelas reais (não acessado direto, só via código)
- 014 original não existe seção 9 MAPA_DE_CACA é oficial
- 012_MASTER_COMMAND vazio
