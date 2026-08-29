# 🧭 GPS — MISSÃO ATUAL (v3.0)
> Memória viva do projeto. SUBSTITUÍDO POR INTEIRO a cada fechamento de sprint.
> Última atualização: 25 ago 2026 noite — Sprint 019 Fase 4 + Fix Premium v3.9/v12.3 NO AR (deu certo) — Build verde com ipv4first

## 1. ONDE ESTAMOS

- Produto: **AnuncIA v3.9 + Mesa v6/v12.3** 🚀 NO AR (anuncia-three.vercel.app) — Build verde 9.0s com ipv4first
- ✅ **Sprint 019 Fase 4 + Fixes Premium NO AR (25 ago noite):** salvar imagem em Mídias + Biblioteca + fix imagem feia/amarela pintada + fix formato esticando + fix engenheiro listando perguntas + sem limite palavras quanto necessário pra excelência + elite todos agentes 10/10
- 🎨 **Sprint 018 COMANDO EM EXPANSÃO (linguagem) EM CURSO** — Leva 1 feita, Levas 2-5 pendentes — decisão soberana APLICAR TUDO AGORA
- ⚠️ **Caça PAUSADA** — gatilho "ativar modo caça" — balanço dogfooding 26 ago segue de pé
- 📦 **Protocolo RECRIAR REBIRTH 1.0 executado** — 10 docs ANUNCIA_* + Commander Handoff 14KB — AnuncIA portátil
- 👑 **Princípio Premium Supremo como Lei Suprema:** premium, top, disruptivo, diferente, atraente, hiper inteligente, cliente quer pagar — filtro 7 perguntas
- 🧬 **Evolução Contínua + 7ª Barreira Previsão de Merda:** pre-mortem obrigatório 3 perguntas antes de entregar
- 🗺️ **Roadmap após cada etapa:** lei nova TDAH-friendly

## 2. ESTADO DO PRODUTO (o que já é real)

- Login premium minimalista ✅ + proxy.ts porteiro blindado · Cadastro público TRANCADO (CADASTRO_ABERTO=false) · CTA público = demo no zap
- Banco por usuário: 13 tabelas com user_id + RLS dono total · Storage: midias (privado) + avatars (público-leitura) — Fase 4: imagem gerada base64→Blob→upload bucket midias + assets Product Photos + library_items Criador Guidelines
- Módulos reais: Clientes (com Excluir) · CRM kanban trilho snap celular · IA Studio v3.9 ELITE SEM LIMITE sem listar perguntas (1492 linhas) · Mídias real · Campanhas (Diretor Tráfego IA tecida) · Briefings (Ponte do Vídeo Flow) · Comerciais original limpo · Biblioteca · Prompts · Configurações perfil/foto real · Dashboard real KPIs banco · Laboratório · Guia Vivo 11 guias
- **Mesa Texto /api/ia v6:** auto-descoberta todas camadas: Gemini (autodescoberta+hall) → Groq (auto) → OpenRouter (auto free) → Cerebras (opcional) — GitHub Models FALECEU 30 jul 2026 — erros com resumo fila inteira — só logado — logs terminal
- **Mesa Imagens /api/imagem v12.3 FIX Congruência:** SDXL Lightning primeiro (fotorealista) → klein-9b → klein-4b → schnell → HF → Pollinations flux/turbo → Gemini paga desligada — tradutor PT→EN elite v2 detector elite já bom mantém 100% original sem diminuir (quanto necessário pra excelência SEM LIMITE) + suffix anti-pintura/amarelo — referência ≤512 navegador reduz — formatos 1:1/4:5/9:16 — cota casa ~230/dia — medição URGENTE — maxDuration 60 — só logado
- **IA Studio v3.9:** 5 agentes ELITE com estrutura PAPEL→CONTEXTO→MÉTODO→FORMATO→AUTO-REVISÃO→LEIS + 15 perguntas internas Engenheiro NÃO lista na saída + exemplo morango premium + escova dental herói vs vilão + sem limite palavras + handleFormatoChange limpa imagem antiga + preview object-contain (não estica) + botão Fase 4 Salvar em Mídias — build verde 9.0s com ipv4first — lint 1 warning Badge antigo
- **Build fix:** package.json build com ipv4first (set NODE_OPTIONS=--dns-result-order=ipv4first && next build) — fix Google Fonts Failed to fetch Geist Mono/Inter — pendência antiga QUITADA
- Docs vivos: 010 v1.9 + 011 v3.0 (este) + 012 v2.2 + 013 Mapa Caça + 015 Contrato + 016 + 017 + 018 + VERSOES.md v3.9 + ARQUITETURA_COMPLETA 18.9KB + MODO_OPERACIONAL + COMANDO_RE_CRIACAO_v6 48KB + REBIRTH 1.0 10 docs + PRINCIPIO_PREMIUM + EVOLUCAO_CONTINUA + ROADMAP_POS_ETAPA + MEMORIA_TRANSFERIVEL v4

## 3. INFRA (cola rápida)

- Repo: github.com/creatina23/saugc-os (main) · Local: C:\Projetos\BKp\saugc-os
- Produção: anuncia-three.vercel.app (push main = deploy ~2 min) + lp-anunc-ia.vercel.app
- Supabase: ugaessoebkqfqezmuwhc · sa-east-1 · Free (ping 1×/semana) · duas contas: app principal 5972616a-…
- Env (.env.local + Vercel Prod/Preview): NEXT_PUBLIC_SUPABASE_URL + _ANON_KEY + GEMINI_API_KEY + GROQ_API_KEY + OPENROUTER_API_KEY + CEREBRAS_API_KEY opcional + CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN + HF_TOKEN opcional + OPENAI_API_KEY futura paga + GEMINI_IMAGEM_ATIVA futura paga — todas server-only — segredo no chat = revogar — env nova só vale no deploy seguinte
- Domínio useanuncia.com.br: pendente R$40/ano fixo Registro.br

## 4. ARQUITETURA DE DADOS REAIS (padrão provado 10× + foto)

- getSupabaseBrowser() null → demo com selo · setState SÓ .then() com let ativo · snake→camel · numeric→numero()
- Insert .select().single() → prepend · delete com confirmação · kanban otimista erro desfaz + confessa
- Erros confessam "Detalhe técnico:" · blindagem SQL: create if not exists → add column → drops not null → RLS + policy → grant authenticated → notify pgrst reload schema → prova
- SCHEMA CANÔNICO: clients(12) · campaigns(16) · briefings(10) · commercials(10) · library_items(8 cat EN) · deals(9) · assets(10) · prompts(9) · profiles · ai_generations · ai_usage · ai_feedback + perfis_psicologicos proposta 020-A + RLS dono
- Storage: midias (privado) · avatars (público-leitura/dono-escreve)
- Fase 4: dataUrlParaBlob atob → Uint8Array → Blob → upload bucket midias + insert assets + library_items

## 5. ARQUITETURA DE IA (Mesa de Motores — viva desde 13 ago + fix 25 ago)

- Telas → services barrel → POST /api/ia + /api/imagem + futuro /api/orquestrador
- Mesa Texto v6: auto-descoberta todas camadas, nenhum modelo cravado, hall reprovados, skip gracioso, espelho GET /api/ia, resumo fila nos erros
- Mesa Imagens v12.3: SDXL Lightning primeiro → klein-9b → klein-4b → schnell → HF → Pollinations → Gemini paga desligada, tradutor elite v2 detector elite já bom mantém 100% sem diminuir (sem limite quanto necessário pra excelência), referência input_image_0 ≤512, anti-texto no visible text
- Agentes = persona elite + tarefa + PT-BR direto (texto) + EN elite sem limite (imagem) + auto-revisão 10 perguntas + leis casa
- IA tecida lê FORMULÁRIO e grava no banco
- Base de Excelência ainda na tela, deveria ir pra rota /api/ia (será 020-A) — decisão Reunião 2

## 6. LEIS VIGENTES

Constituição = comando inicialização Copiloto v6 (14 leis + 7 barreiras + formato entrega atualizado + princípio premium + evolução contínua + roadmap após cada etapa)

Destaques: L0 PT-BR na tela, L1 uma ação por vez, L2 arquivo COMPLETO com prova Ctrl+F + fim-de-arquivo, L3 provas por máquina Python exata, L5 PowerShell 1 linha, L7 porteiros lint+build, L8 segredo = revogar, L9 verdade na tela selo 🟢/🟠 ZERO cenográficos, L11 sem fonte não edita, L12 docs vivos CHANGELOG/GPS/Memória, L13 venda primeiro/escopo/sem desconto, L6 rótulo ≠ chave

7 Barreiras: 1 código só depois de compilar na bancada, 2 prova por máquina nunca memória, 3 instrução revisada antes de pedir, 4 zero rascunho, 5 entrega casada (pacote + prova 10s + previsão cascata + VERSOES.md + cartão sincronia, SEM ZIP individual), 6 bancata executa porteiros (repo completo clonado npm install+lint+build REAIS, build do dono cerimônia vitória), 7 previsão de merda (pre-mortem obrigatório 3 perguntas: Que merda pode acontecer? Como evito agora? O que deixo de considerar? TDAH leigo tempo)

Modo Operacional: Piloto de Missão + Tradutor Técnico + Filtro Complexidade, simples na fala sofisticado na engenharia, uma prioridade um próximo passo sempre, ideia nova → backlog 🔴🟡🟢 não descarrilha, progresso visível ETAPA/%/CONCLUÍDO/RESTANTE/PRÓXIMO/🟢🟡🔴, não avançar sem concluir salvo autorização, antes de alteração importante O QUÊ/POR QUÊ/BENEFÍCIO/RISCO/COMO PRESERVAR/"Posso prosseguir?", preservar o que funciona, anti-perfeccionismo, sempre próximo movimento, não deixar usuário se perder, TDAH-friendly

Formato entrega atualizado (25 ago — preferência suprema do dono + aprendizados erros 1-13): ARQUIVO INTEIRO NO CHAT Ctrl+A Ctrl+V Ctrl+S (não viewer), commit simplificado 6 linhas PowerShell 1 linha por vez sem md confuso, código completo nunca pedaços, roadmap após cada etapa obrigatório

Princípio Premium Supremo (Lei Suprema 25 ago noite): premium, top, disruptivo, diferente, atraente, hiper inteligente, cliente quer pagar — filtro 7 perguntas antes de entregar se qualquer NÃO → refaz

Evolução Contínua (25 ago noite): inteligência e capacidade evoluir constantemente não regredir prever merdas e evitar — sistema meta-cognição + registro resultados operação aprende + agentes perfeitos congruentes cooperativos + cada versão mais completa

Lei da Língua (L0) + Regra Ouro v2 (arquivo completo + prova EOF) + Lei L6 (rótulo ≠ chave) + código da casa (setState em .then(), aspas tipográficas, componente fora de componente, <button> raiz sem variant confirmada)

## 7. PRÓXIMOS MOVIMENTOS — ROADMAP

**Fila aprovada Reunião 2 + somada com reconstrução + diretor-mestre + premium:**

1. **019 Fase 4 + Fix Premium v3.9/v12.3/v12.4 NO AR (25 ago noite)** ✅ — deu certo — build verde com ipv4first — morango vermelho bonito não feio, formato não estica, engenheiro não lista perguntas, sem limite excelência, todos agentes elite 10/10
2. **020-A MVP — Orquestrador + Comportamento + Base na rota + Sala Missão** — 7 sub-etapas — Próxima — Precisa "les go 020-A" — Prioridade 1 do comando expansão verbatim completo + reconstrução + diretor-mestre + premium — Auditoria 15 pontos feita em AUDITORIA_DIRETOR_MESTRE_15_PONTOS.md 33KB + Plano em PLANO_IMPLEMENTACAO_ORQUESTRADOR_020A.md 7 etapas
   - 2.1 Base Excelência → src/lib/base-excelencia.ts + injetar em /api/ia e /api/orquestrador
   - 2.2 Comportamento → src/lib/agentes/comportamento.ts + migration perfis_psicologicos
   - 2.3 Rota /api/orquestrador pipeline fixa Produção Completa
   - 2.4 Service orquestrador-service.ts + barrel
   - 2.5 Página /orquestrador com Sala Missão UX cards acendem
   - 2.6 Teste morango premium + escova dental herói vs vilão campanha completa congruente premium
   - 2.7 Roadmap após cada sub-etapa
3. **020-B/C — Seleção dinâmica + auto-crítica + Performance + Oferta & Vendas + Diretor Criativo completo** — Diretor Criativo decide O QUE criar (falta hoje motivo imagem feia), Performance CTR CPC CPA ROAS, Oferta engenharia oferta pricing CRO
4. **Fechar 018 — Linguagem** — Levas 2-5 (login/shell, Central, menu/títulos, estados vazios, IA Studio/guias, LP com 3 planos) — 20% feito — a cada leva porteiros L7 + commit — fechamento 018 CHANGELOG+GPS+Memória juntos
5. **Balanço dogfooding 26 ago** — Sala de Páginas × caça ampliada — decisão soberana
6. **Ativar modo caça** — gatilho do dono — 10 contatos/dia demo 15 min WOW 60s meta 1 cliente R$4.998,50 PIX — caça pausada até gatilho "ativar modo caça"
7. **Pós-1º-cliente — Checkout/Assinatura + WhatsApp + v3.0 Waze tráfego** — webhook idempotente → subscriptions → gate + planos reais + anual 10×12 + agente WhatsApp Meta Cloud API R$0 chip separado Evolution/Baileys proibido candidata #1 pós-lançamento

Cada etapa: 7ª Barreira pre-mortem 3 merdas + prova Ctrl+F + lint + build reais na bancada + arquivo inteiro no chat + passo a passo numerado completo + commit simples 6 linhas + roadmap após etapa + registro erro/aprendizado memória transferível + filtro premium 7 perguntas

## 8. LIÇÕES OPERACIONAIS (cicatrizes que viraram regra)

1–26 (ver CHANGELOG v1.9 — arquivo completo, porteiros, cola cortada, RLS ≠ grants, notify pgrst, jaula NOT NULL, Replace All texto puro, aspas tipográficas, Test-Path, componente fora de componente, prova fim-de-arquivo, nunca adivinhar API)
27. Motor sem chave pula em silêncio — espelho confessa (13 ago)
28. Chave nova na Vercel = Production E Preview + só no deploy seguinte (13 ago)
29. Rótulo tela ≠ chave código — renomear menu nunca pode encostar chave banco/stage/rota (L6, reforçada Sprint 018)
30. Build Google Fonts falha sem ipv4first — dev já tinha ipv4first mas build não — fix package.json build com ipv4first (25 ago noite) — pendência antiga QUITADA
31. Formato imagem esticando 1:1→9:16 porque preview w-auto sem object-contain + não limpava imagem antiga — fix handleFormatoChange limpa + object-contain overflow-hidden (25 ago noite)
32. Engenheiro listando 15 perguntas na saída em vez de prompt final — fix método interno responde internamente NÃO mostra na saída + formato APENAS 1 parágrafo denso EN (25 ago noite) — exemplo escova dental herói vs vilão
33. Diminuir caracteres 80-120 piorou, estava bom ficou pior — fix sem limite quanto necessário pra excelência (resalva do dono) — 25 ago noite
34. Entrega via viewer confunde, commit md confuso, código em pedaços, sem passo a passo — fix arquivo inteiro no chat Ctrl+A Ctrl+V + commit simples 6 linhas + passo a passo 13 passos numerados + roadmap após cada etapa — 25 ago noite
35. Inteligência regredindo, não previu merdas — fix 7ª Barreira Previsão de Merda pre-mortem obrigatório 3 perguntas + Evolução Contínua + Princípio Premium Supremo — 25 ago noite
36. Produto tem que ser premium top disruptivo diferente atraente hiper inteligente cliente quer pagar — filtro 7 perguntas antes de entregar — 25 ago noite — lei suprema

## 9. GATILHOS DO DONO

"les go" · "deu certo" · "segue o baile" · "só se for agora" · "abre o roadmap" · "re" (recap 3 linhas) · "reunião aberta" (Modo Soberano) · "papelada" · "organiza o comando" · "NO AR" (caça) = CLIENTE FECHOU · "ATIVAR MODO CAÇA" = caça acorda (hoje PAUSADA) · "FIM DE TRAMPO" = relatório + comando de re-criação novo · "INICIAR TRAMPO" = atualização + próximo passo único · "manda o proximo" = próximo arquivo inteiro no chat · "les go 020-A" = autoriza Orquestrador · "me passa o comando mestre" = entrega COMANDO_RE_CRIACAO_v6 COMPLETO + memória transferível + tudo pra renascer mais completo · "RECRIAR" = protocolo renascimento 10 docs + Commander Handoff
