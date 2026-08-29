# ANUNCIA — INTEGRATIONS
# Integrações e Estado — REBIRTH 1.0 — 25 ago 2026 noite

## EXISTENTES REAIS [FUNCIONANDO]

### Supabase — [FUNCIONANDO]
- Projeto: ugaessoebkqfqezmuwhc, sa-east-1, Free — 2 contas, app na principal 5972616a-... — ping 1×/semana
- Auth: Supabase Auth — getSupabaseBrowser() client + getSupabaseServer() server — auth.getUser() — RLS dono total user_id=auth.uid() — grants authenticated — notify pgrst reload
- Banco: PostgreSQL — tabelas clients(12), campaigns(16), briefings(10), commercials(10), library_items(8), deals(9), assets(10), prompts(9), profiles, ai_generations, ai_usage, ai_feedback, perfis_psicologicos proposta 020-A — padrão provado 10× + foto: insert .select().single() → prepend, delete confirmação, kanban otimista
- Storage: midias (privado, por user_id, até 50MB free, upload File/Blob Fase 4 data URL→Blob, signedUrls 3600 prévias, signedUrl 600 baixar âncora invisível, remove lixeira) + avatars (público-leitura dono-escreve até 2MB upsert ?v= anti-cache avatar_url profiles USER_UPDATED)
- Variáveis: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY — .env.local + Vercel Production e Preview server-only — segredo no chat = revogar
- Status: [FUNCIONANDO] — real, não mock, patrimônio — NÃO substituir sem necessidade

### Vercel — [FUNCIONANDO]
- Hospedagem: Vercel Hobby — deploy auto push main → anuncia-three.vercel.app + lp-anunc-ia.vercel.app — ~2 min — maxDuration 60 pra /api/imagem (Hobby corta 10s padrão, imagem pede fôlego) — envs Production e Preview — só valem no deploy seguinte — NODE_OPTIONS ipv4first no dev script package.json "set NODE_OPTIONS=--dns-result-order=ipv4first && next dev" — pendência cravar NODE_OPTIONS no build
- Status: [FUNCIONANDO] — NÃO substituir

### GitHub — [FUNCIONANDO]
- Repositório: github.com/creatina23/saugc-os (main) — branch principal main — último commit a046534 feat: mesa v6 GitHub Models RIP auto-descoberta — .gitignore com .env.local — repo completo clonado na bancata /home/user/anuncia/bancata-repo/ seguro por construção .env.local nunca vai pro GitHub — + repo privado lp-anuncia (lp-anunc-ia.vercel.app)
- Status: [FUNCIONANDO] — NÃO substituir

### Mesa de Texto /api/ia v6 — [FUNCIONANDO]
- Rota server: src/app/api/ia/route.ts 707 linhas — auto-descoberta todas camadas, nenhum modelo cravado (slug cravado = lenda, lição 9), hall reprovados, cache modelos compatíveis, skip gracioso sem chave (só log), espelho GET /api/ia = {motores:[{id,armado}]} com auth booleanos zero segredo alimenta cartões vivos IA Studio, resposta sucesso carrega motor quem respondeu, só atende logado protege cotas, logs [motor-ia] só terminal servidor, verdade na tela erros com resumo fila inteira "(fila: Gemini→429 | Groq→404 | ...)", temperatura 0-1 + maxTokens 256-4096 com limites saudáveis protege cota e bolso
- Cadeia: Gemini titular autodescoberta (lista /v1beta/models, filtra flash+generateContent, ordena por versão, fixa após 200 real, hall reprovados 404) → Groq auto (pergunta /openai/v1/models prefere llama-4/gpt-oss/llama-3.3/qwen/mistral) → OpenRouter auto (lista /api/v1/models filtra :free prefere deepseek/llama/gemma/qwen/gpt-oss/mistral/nemotron, cache 3 vivos, hall reprovados) → Cerebras auto opcional ultra-rápido (CEREBRAS_API_KEY grátis cloud.cerebras.ai) — GitHub Models FALECEU 30 jul 2026 410 removido com honras
- Chaves server-only: GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, CEREBRAS_API_KEY opcional — .env.local + Vercel Production e Preview
- Service: ia-service.ts v3 gerarTexto(prompt, {temperatura, maxTokens}) → {ok, texto, erro, motor} + statusMotores() → [{id,armado}]|null — única porta IA das telas nunca fala direto com provider
- Status: [FUNCIONANDO] — patrimônio, auto-descoberta, build verde — NÃO substituir, só adicionar OpenAI paga futura quando quiser no final da fila

### Mesa de Imagens /api/imagem v12.3 FIX Congruência — [FUNCIONANDO] mas com quebra recente
- Rota server: src/app/api/imagem/route.ts 607 linhas v12.3 — auto-descoberta? Não, modelos Cloudflare fixos mas com skip gracioso, tradutor PT→EN elite v2 com auto-descoberta Gemini flash + hall reprovados — espelho GET /api/imagem = {motores:[{id,armado}]} booleanos zero segredo — resposta sucesso {imagem data:image/png;base64,..., motor, formato 768x960, promptUsado, notas[] diagnóstico} — só logado protege cota casa ~230/dia — maxDuration 60 — logs [motor-imagem] terminal — cota casa compartilhada não por usuário medição URGENTE
- Cadeia: SDXL Lightning primeiro (melhor pra produto fotorealista) → klein-9b → klein-4b → schnell → HF SDXL (HF_TOKEN cota separada ~80/mês) → Pollinations flux/turbo (pública sem chave sem cota sem SLA marca d'água possível) → Gemini imagem paga desligada (liga com GEMINI_IMAGEM_ATIVA=true + GEMINI_API_KEY, modelo GEMINI_IMAGEM_MODELO gemini-2.0-flash-preview-image-generation, decide enquadramento sozinho não recebe width/height) — skip gracioso sem chave — TODOS os geradores falham → confessa PT-BR com notas + Detalhe técnico
- Formatos: quadrado 768x768 1:1 feed, retrato 768x960 4:5 feed, vertical 704x1216 9:16 stories/reels, paisagem 960x768 5:4 banner — evita queimar neurônios com tamanho maluco — pegarFormato() com fallback quadrado
- Referência: input_image_0 ≤512, navegador reduz via canvas antes (FileReader → Image → canvas escala Math.min(1,512/max(width,height)) → toDataURL image/png) — decodificarDataUrl atob → Uint8Array → ArrayBuffer puro BlobPart válido (não Buffer) — klein aceita até 4 input_image_0..3
- Anti-texto: "no visible text" nos prompts — engenheiro nunca incluir texto letras palavras na imagem texto adicionado depois no design
- Tradutor: enriquecerPrompt PT solto → EN denso — Mesa Texto trabalha pra Mesa Imagem — Gemini flash transforma descrição PT em prompt curto denso EN (image models entendem EN muito melhor) — se tradutor falhar ou sem chave segue original — enriquecimento NUNCA derruba geração — modelo tradutor aprovado fixado só após 200 real + tradutores reprovados hall — listarFlashes ordena mais novo pro mais velho fora reprovados — chamarTradutor instrução elite v2 (80-120 palavras antes, agora 90-130 + quality boosters + anti-confusão RED strawberry not yellow not painting) — ehPromptEliteJaBom detecta se já é elite completo (photorealistic + 30+ palavras) mantém 100% original sem diminuir (fix v12.3 sem limite) — antes tinha suffix anti-pintura/amarelo que poluía, agora mantém original 100% se já é bom
- Chaves: CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN (nunca no chat L8) — conta free 10k neurônios/dia ≈230 schnell ou 20-50 klein reset 00:00 UTC billing US$0,011/mil excedentes — HF_TOKEN opcional — GEMINI_API_KEY + GEMINI_IMAGEM_ATIVA=true para paga — tudo .env.local + Vercel Production e Preview server-only
- Service: imagem-service.ts v3 gerarImagem(prompt, {formato, referencia?, negativo?}) → {ok, imagem data URL, erro, motor, formato, promptUsado, notas[]}
- Status: [FUNCIONANDO] mas com quebra recente: imagem feia amarela pintada mesmo com prompt 10/10 (fix v12.3 SDXL primeiro + elite já bom 100% na bancada build verde mas dono ainda não colou por isso vê feio), formato esticando (fix v3.6/v3.9 limpa+object-contain na bancada mas não colado) — [FUNCIONANDO] na bancada, [QUEBRADA] no app dono até colar+push
- NÃO substituir, só melhorar qualidade com Diretor Criativo + Orquestrador + Gemini paga quando puder

### IA Studio — [FUNCIONANDO]
- Página: src/app/ia-studio/page.tsx casca + ia-studio-view.tsx v3.9 FIX sem listar perguntas + sem limite excelência 1492 linhas — playground agentes ligado Mesa Motores /api/ia — cada agente persona real prefixo enviado junto tarefa — Temperatura e Max tokens controles REAIS chegam ao modelo — Cartões motores VIVOS espelho — Cadeia verdade Gemini→GitHub Models→Groq→OpenRouter quem sem chave pulado silêncio histórico grava quem respondeu — v3.1 Salvar na biblioteca reconectado library_items categoria sugerida — v3.2 motores vivos + rótulo real quem respondeu + aposenta Custo R$0 fixo e 35+ modelos Verdade na tela — v3.3 GERADOR DE IMAGEM dentro Studio Engenheiro cria você edita cola referência ≤512 auto e gera Mesa Imagens /api/imagem com painel diagnóstico honesto — v3.4 Fase 4 Salvar em Mídias bucket + Biblioteca — v3.5 EN Elite Engenheiro INGLÊS — v3.6 Elite Todos Agentes PAPEL→CONTEXTO→MÉTODO→FORMATO→AUTO-REVISÃO→LEIS 10/10 — v3.6 Fix Formato Esticando handleFormatoChange limpa imagem + object-contain — v3.7 Sem Limite Excelência 120-200+ palavras quanto necessário — v3.8/v3.9 FIX Sem Listar Perguntas método interno responde internamente NÃO mostra saída APENAS 1 parágrafo denso EN exemplo morango premium + escova dental herói vs vilão toothbrush battling cavity villain exemplo 0/10 NUNCA listar perguntas — build verde 9.0s
- Status: [FUNCIONANDO] — patrimônio — NÃO reescrever estrutura, só elevar personas (array agents)

### Mídias (Assets) — [FUNCIONANDO]
- assets-view.tsx 958 linhas real Supabase Storage + tabela assets — v2 dedo-duro confesso: upload grava user_id explícito + erros mostram detalhe técnico, baixar abre via âncora invisível não tromba bloqueador pop-up e confessa erro se link falhar, lixeira confirma no banco ANTES de tirar da tela confessa se falhar, categorias valores cofre EN AssetCategory Video Ads/Hook Clips/B-Roll/Product Photos rótulos tela PT-BR Lei da Língua tela PT motor EN, sem banco → modo demonstração mock com selo visível — BALDE midias privado TAMANHO_MAX_MB 50 limite free — sanitizarNome remove acentos/espaços — coletaTudo + coletaUrlsAssinadas 3600 — MidiaReal + LinhaMidia COLUNAS id name client_name category format size_bytes tags storage_path created_at — demoParaMidia — handleEnviar upload storage + insert assets + URLs assinadas + reset form — handleBaixar createSignedUrl 600 + âncora invisível — handleExcluir remove storage + delete banco
- Status: [FUNCIONANDO] — real, patrimônio

### Biblioteca — [FUNCIONANDO]
- library_items tabela real 8 col + CRUD + categorias EN PT-BR tela — IA Studio salva texto e imagem Fase 4
- Status: [FUNCIONANDO]

### Ponte do Vídeo — [FUNCIONANDO]
- Briefings: roteiro gerado → comandos prontos pro Flow cena a cena (Caminho A copiar→colar no gerador de vídeo) — briefing entra vídeo sai — não gera vídeo dentro do app ainda, só comandos
- Status: [FUNCIONANDO] — preparar rota /api/video futura

### Guia Vivo — [FUNCIONANDO]
- guia.tsx + guia-data.ts 11 guias no app-shell — tutorial completo dentro do app página a página — conteúdo 100% PT-BR Lei da Língua — cada rota resumo 1 linha + passos numerados ordem real uso — só textos quem desenha painel é guia.tsx
- Status: [FUNCIONANDO]

## PLANEJADAS [PLANEJADA] — preparar terreno, não mock, não simular

### Geração Vídeo Direta — [PLANEJADA]
- Rota /api/video futura — Runway, Veo, Flow — quando tiver orçamento — preparar interfaces contratos terreno técnico — Engenheiro já multimodal pra isso (PRODUTOS, PESSOAS, PUBLICIDADE, MUNDO VISUAL, VÍDEO com direção câmera movimento iluminação expressão personagem continuidade cenário ação narrativa ritmo composição transições — campanha pode envolver pessoas influencers UGC personagens situações metáforas conceitos mundos histórias)

### Meta/Instagram/TikTok/Google Ads — [PLANEJADA] — escopo honesto
- API Meta só após vendas (decisão 5 ago) — autopilot que erra = morte reputacional — preparar service não implementar agora — escopo: GERAR = sim PUBLICAR direto continua estacionado (revisão app semanas decisão 5 ago) — LP só vende "gera aqui dentro" SÓ depois de no ar regra 30

### WhatsApp — [PLANEJADA] — candidata #1 pós-lançamento
- Meta Cloud API + webhook Vercel + Gemini + Supabase R$0/mês chip separado Evolution/Baileys PROIBIDO — preparar arquitetura — funções futuras leads histórico segmentação follow-up WhatsApp oportunidades relacionamento retenção reativação jornada automações — conversa banco clientes

### Checkout/Assinatura — [PLANEJADA] pós-1º-cliente
- Webhook idempotente → subscriptions → gate + planos reais Start 397/Max Premium 497/Enterprise 597 lançamento 5 primeiros travam pra sempre depois sobe 697-897 + anual 10×12 2 meses grátis nunca desconto L13 — venda manual no começo checkout automático pós-1ª-venda — PIX primeiro + InfinitePay/PagBank MP BLOQUEADO nome sujo Mateus nunca propor MP

### Orquestrador + Comportamento + Diretor Criativo + Performance + Oferta & Vendas + CRM — [EM DESENVOLVIMENTO] ou [PLANEJADA]
- Orquestrador: [EM DESENVOLVIMENTO] auditoria feita plano 020-A 7 etapas aguardando les go 020-A — pipeline fixa Produção Completa Fase A: Comportamento→Estrategista→Copywriter→Diretor Criativo→Engenheiro→Analista → consolidado Sala Missão cards acendem — 5-6 chamadas Mesa por objetivo cota casa compartilhada ~230/dia medição URGENTE
- Comportamento: [PLANEJADA] Prioridade 1 020-A pré-processador Perfil Psicológico salvo banco tabela perfis_psicologicos ativo reutilizável
- Diretor Criativo: [PLANEJADA] Prioridade 2 020-B decide O QUE criar falta hoje motivo imagem feia
- Performance: [PLANEJADA] Prioridade 2 CTR CPC CPM CPA ROAS CAC LTV funil atribuição próximo movimento
- Oferta & Vendas: [PLANEJADA] Prioridade 2 engenharia oferta pricing CRO Como transformamos atenção em receita?
- CRM & Relacionamento: [PLANEJADA] Prioridade 3 leads follow-up retenção reativação jornada automações

### Outras Planejadas
- Edição adaptação criativos, distribuição anúncios, gestão campanhas, análise métricas, automações, inteligência mercado/consumidor/performance — preparar arquitetura não mock

## [NAO VERIFICADA]
- LP repo privado lp-anuncia não clonado, Supabase produção não acessado, Vercel envs não acessado, 014 original não existe seção 9 MAPA_DE_CACA é oficial
