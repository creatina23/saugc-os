# 🔍 AUDITORIA DE ESTADO — DIRETOR-MESTRE ANUNCIA
# Comando: Diretor-Mestre de Produto, Arquitetura, IA, UX, Marketing, Performance e Evolução
# Data: 25 ago 2026 noite — NÃO ALTERAR CÓDIGO AINDA, SÓ AUDITORIA
# Regra: PRESERVAR → CORRIGIR → APRIMORAR → EXPANDIR (não apagar e refazer)

================================================================
1. O QUE ENTENDI SOBRE A ANUNCIA
================================================================

AnuncIA = Sistema Operacional de Crescimento com IA, conceito COMANDO EM EXPANSÃO.

NÃO deve parecer curso, ferramenta genérica, chatbot, gerador de texto, painel admin, coleção de prompts, playground.

DEVE parecer CENTRO DE COMANDO INTELIGENTE PARA CRESCIMENTO.

Usuário entra para: entender negócio, criar estratégias, campanhas, criativos, produzir anúncios, analisar criativos, direcionar tráfego, organizar clientes, distribuir resultados, tomar decisões, otimizar, escalar.

Percepção desejada: "Não estou usando várias IAs separadas. Estou comandando uma operação de crescimento."

Visão longo prazo (ecossistema conectado):
ORQUESTRADOR → ESTRATÉGIA → OFERTA → COPY → CRIATIVO → ROTEIRO → PRODUÇÃO VISUAL → TRÁFEGO → DADOS → ANÁLISE → OTIMIZAÇÃO → ESCALA
Futuro: geração imagens/vídeos/narração/personagens/UGC/influenciadores virtuais/cenas publicitárias + Meta/Instagram/TikTok/Google/WhatsApp distribuição + gestão campanhas + análise métricas + CRM + automações + assinatura/cobrança + inteligência mercado/consumidor/performance

Quando integração não puder ser imediata: NÃO inventar, NÃO simular, NÃO criar mock — preparar arquitetura, interfaces, contratos e terreno técnico para futuro.

Princípio Premium Supremo (lei suprema decretada 25 ago noite): produto tem que ser premium, top, disruptivo, diferente, atraente, hiper inteligente — cliente tem que querer pagar pra usar. Filtro 7 perguntas antes de entregar.

Modo Operacional: Piloto de Missão + Tradutor Técnico + Filtro de Complexidade, TDAH-friendly, 1 prioridade por vez, progresso visível, anti-dispersão.

================================================================
2. O QUE JÁ EXISTE (infraestrutura real — patrimônio)
================================================================

- Repo: github.com/creatina23/saugc-os (main) → anuncia-three.vercel.app (deploy ~2 min)
- Site LP: repo privado lp-anuncia → lp-anunc-ia.vercel.app (quase no ar, 0,31s, 11 imagens 200)
- Stack: Next.js 16.12 Turbopack, TypeScript, Tailwind 4, Supabase, Vercel, GitHub
- Supabase: ugaessoebkqfqezmuwhc, sa-east-1, Free — 2 contas, app na principal — ping semanal
- Banco real: clients(12), campaigns(16), briefings(10), commercials(10), library_items(8, cat EN), deals(9), assets(10), prompts(9), profiles, ai_generations, ai_usage, ai_feedback + RLS dono total + grants + notify pgrst reload
- Storage: midias (privado) + avatars (público-leitura, dono-escreve, até 2MB, upsert, ?v= anti-cache)
- Auth: Supabase Auth + proxy.ts porteiro blindado + CADASTRO_ABERTO=false (CTA público = demo no zap)
- Módulos reais: Clientes (com Excluir), CRM kanban (trilho snap no celular), IA Studio, Mídias (upload real + preview URLs assinadas 60min + baixar via âncora invisível + lixeira confirma no banco), Campanhas, Briefings (com Ponte do Vídeo → comandos pro Flow cena a cena), Comerciais (original limpo, geração mora no Studio), Biblioteca, Prompts, Configurações (perfil/foto), Dashboard real (KPIs calculados do banco: Receita mês = soma MRR, Conversões = soma campanhas, Campanhas ativas = contagem real, ROI = receita÷investido, barras receita por cliente top 6, canais por plataforma, funil CRM, atividades recentes), Laboratório (fora do menu), Guia Vivo (11 guias, guia.tsx + guia-data.ts)
- IA tecida: Roteirista no Briefing → commercials, Diretor de Tráfego nas Campanhas → library_items
- Marca vidro gelo 🧊: logo-anuncia.png + icon.png, fundo #0B0D12, violeta #8B5CF6, wordmark Anunc + IA gradiente
- Docs vivos: 010_CHANGELOG.md reconstruído 32KB v1.1→v1.8 (do contexto 000-030 + bloco v1.8), 011_CURRENT_MISSION_v2.9.md (GPS), 012_MEMORIA_ESTRATEGICA_v2.1.md, 013_MAPA_DE_CACA.md (contém seção 9 D+1→D+14 que é 014 provisório), 015_CONTRATO_IMPLANTACAO.md, 016_TRIAGEM_COMANDO_MESTRE.md, 017_TRIAGEM_PROTOCOLO_LINGUAGEM.md, 018_SISTEMA_DE_LINGUAGEM.md, VERSOES.md v3.8, ARQUITETURA_COMPLETA_VERBATIM 18.9KB, MODO_OPERACIONAL, COMANDO_RE_CRIACAO_v4/v5, 000-030_contexto_completo.txt 152KB, etc.
- Papelada organizada: /anuncia/papelada/ + /anuncia/comandos/ + /anuncia/bancata-repo/docs/ + ARQUIVO_MESTRE_ORGANIZADO_v3.4.md + INVENTARIO_FINAL.md + ROADMAP_ATUAL_POS_ETAPA.md + PRINCIPIO_PREMIUM_SUPREMO + EVOLUCAO_CONTINUA + MEMORIA_TRANSFERIVEL v4

================================================================
3. O QUE ESTÁ FUNCIONANDO (verdade na tela)
================================================================

- ✅ Mesa de Texto /api/ia v6: Gemini autodescoberta+hall reprovados → Groq auto (pergunta /openai/v1/models, prefere llama-4/gpt-oss) → OpenRouter auto (lista :free, prefere deepseek/llama/gemma/qwen/gpt-oss) → Cerebras auto opcional — GitHub Models faleceu 30 jul 2026 (410) — todas camadas com auto-descoberta, sem slug cravado — skip gracioso sem chave — espelho GET /api/ia = {motores:[{id,armado}]} com auth — erros com resumo fila inteira "(fila: Gemini→429 | Groq→404 | ...)" — logs [motor-ia] só no terminal servidor — só atende logado
- ✅ Mesa de Imagens /api/imagem v12.3 FIX Congruência: SDXL Lightning primeiro (melhor pra produto fotorealista) → klein-9b → klein-4b → schnell → HF SDXL (HF_TOKEN, cota separada ~80/mês) → Pollinations flux/turbo (pública, sem chave, sem cota) → Gemini imagem paga desligada (liga com GEMINI_IMAGEM_ATIVA=true) — tradutor PT→EN elite v2 (80-120 palavras antes, agora sem limite quanto necessário pra excelência, com detector prompt elite já bom que mantém 100% original + suffix anti-pintura/amarelo) — referência input_image_0 ≤512 navegador reduz — anti-texto "no visible text" — maxDuration 60 — só logado — cota casa ~230/dia — medição por usuário URGENTE
- ✅ IA Studio v3.8 SEM LIMITE EXCELÊNCIA: 5 agentes ELITE com estrutura PAPEL→CONTEXTO→MÉTODO→FORMATO→AUTO-REVISÃO→LEIS + 15 perguntas internas Engenheiro (NÃO lista na saída) + exemplo bom/ruim + sem limite palavras quanto necessário pra excelência + gerador de imagem com prompt editável + referência + formato + prévia object-contain overflow-hidden + handleFormatoChange limpa imagem antiga pra não esticar + diagnóstico honesto + botão Fase 4 Salvar em Mídias (bucket midias + assets Product Photos + library_items Criador Guidelines) — build verde 9.0s, lint 1 warning antigo Badge
- ✅ IA Studio funciona mesmo sem Orquestrador — Orquestrador é adição, não substituição
- ✅ Mídias real: upload File → bucket privado midias + insert assets com user_id + tamanho formatado + formato por extensão + etiquetas + cliente + URLs assinadas 60min + baixar via âncora invisível + lixeira confirma no banco
- ✅ Dashboard real, Clientes, Campanhas, Briefings com Ponte do Vídeo, Comerciais limpo, CRM kanban trilho snap, Biblioteca, Prompts, Configurações com foto perfil real bucket avatars
- ✅ Recebimento travado: PIX primeiro (R$4.998,50 entrada) + 12× via InfinitePay/PagBank — MP BLOQUEADO (nome sujo Mateus) — nunca propor MP
- ✅ Pricing travado: 397/497/597 intocados, Enterprise 597 = lançamento 5 primeiros travam, depois sobe 697-897, anual 10×12 (2 meses grátis), nunca desconto (L13)
- ✅ 1 IA paga aceita desde já (só dono) — com clientes evolui gradual custo-benefício

================================================================
4. O QUE ESTÁ QUEBRADO (abaixo do padrão premium)
================================================================

- 🔴 Imagem feia / amarela pintada em pedestal: mesmo com prompt 10/10 EN elite "single extra-large perfectly ripe luxury RED strawberry..." gerava fruta amarela tipo quadro — causa: klein-9b free burro pra produto + golden seeds confundia + tradutor re-traduzia prompt já bom + ordem modelos errada (klein antes de SDXL) — fix v12.3 aplicado na bancada (SDXL primeiro + detector elite já bom mantém 100% + suffix anti-pintura/amarelo), mas dono ainda não colou no VS Code local (por isso ainda vê feio) — status: 🟢 fixado na bancada build verde, 🟡 aguardando colar+push
- 🔴 Formato esticando 1:1→9:16: imagem estica ao invés de gerar nova no formato — causa: preview mostrava mesma imagem 1:1 em container 9:16 com w-auto sem object-contain + não limpava imagem ao mudar formato — fix v3.6/v3.8 aplicado (handleFormatoChange limpa + object-contain overflow-hidden), mas dono ainda não colou
- 🟡 Engenheiro listando as 15 perguntas na saída: quando colocou "escova dental lutando contra cárie" apareceu lista "1. O que precisa aparecer? 2. Quem aparece?..." em vez de prompt final — causa: persona tinha MÉTODO com 15 perguntas listadas e modelo interpretou como formato de saída — fix v3.9 aplicado (MÉTODO INTERNO responde internamente NÃO mostra na saída + FORMATO OBRIGATÓRIO APENAS 1 parágrafo denso em INGLÊS) — build verde, mas dono ainda não colou
- 🟡 Engenheiros com prompts mal estruturados (antes v3.3): personas simples 1 linha genérica, não elite — fix v3.6/v3.8 aplicado (todos 5 viraram ELITE com PAPEL→CONTEXTO→MÉTODO→FORMATO→AUTO-REVISÃO→LEIS + 15 perguntas Engenheiro + 10 perguntas auto-revisão + sem limite palavras quanto necessário pra excelência) — build verde
- 🟡 Entrega confusa: present_file viewer + md confuso + pedaços search/replace — dono disse "quero arquivo inteiro no chat Ctrl+A Ctrl+V, nada de arquivo aberto, commit simples" — fix aplicado v3.5+ (arquivo inteiro no chat 1511 linhas + 607 linhas + commit 6 linhas PowerShell + passo a passo 13 passos numerados)
- 🟠 Imagem ainda feia mesmo com prompt 10/10 completo: klein-9b free é limitado, mesmo com prompt perfeito não vira Midjourney — para 10/10 real precisa modelo melhor (SDXL Lightning já melhor que klein, mas ainda free) ou Gemini imagem paga US$0,03-0,13/img quando puder — já está no código desligado
- 🟠 Agentes isolados 1:1, não cooperativos, não congruentes: Engenheiro não sabe o que Estrategista/Copywriter fizeram — causa: sem Orquestrador, sem Perfil Psicológico compartilhado, sem Diretor Criativo que decide O QUE criar — fix é Orquestrador 020-A

================================================================
5. O QUE PARECE TER REGREDIDO (feedback do dono)
================================================================

Dono disse 3 vezes:
- "preciso que sua inteligencia e capacidade evolua constantemente. parece que esta regredindo, vc tem que prever as merdas que pode acontecer e evitar"
- "se eu teria que fazer, vc teria que me dizer. tudo tem que ser passo a passo. nao espere que eu adivinhe, sou leigo, tenho tdah, vc deveria saber disso. estou ficando irritado vc esta vacilando muito"
- "vc esta estragando meu projeto" (quando Engenheiro listou 15 perguntas)
- "as imagens continuam uma merda, o engenheiro criava prompts mais completos. esse negocio de diminuir caracteres nao ficou legal. estou frustrado, estava bom, tentei melhorar e agora esta pior"

Regressões identificadas:
1. Entrega via viewer após dono dizer "quero no chat" — viola preferência suprema
2. Commit md confuso após "quer simples" — viola TDAH-friendly
3. Código em pedaços após "arquivo inteiro" — viola Lei L2 + preferência
4. Sem passo a passo, esperei adivinhar lint/build/push — viola Modo Operacional Piloto de Missão
5. Diminuir caracteres (80-120) piorou — viola resalva "quanto for necessário pra excelência, sem limite"
6. Engenheiro listando perguntas — viola "NUNCA liste as 15 perguntas, entregue APENAS prompt final"
7. Imagem: golden seeds → amarela pintada + ordem klein antes de SDXL — viola Premium (imagem feia = crime)

Todas registradas como Erros 1-13 na memória transferível v4 + 7ª Barreira Previsão de Merda + Princípio Premium Supremo + Evolução Contínua criados para não repetir.

================================================================
6. QUAIS AGENTES EXISTEM (5 vivos no array agents)
================================================================

1. Estrategista IA — ELITE EXCELÊNCIA v3.8 — PAPEL cérebro estratégico, pensa causa e efeito, 5 por quês, método OBSERVAR→ENTENDER→DIAGNOSTICAR→HIPÓTESES→PRIORIZAR→EXECUTAR→CRITICAR→REFINAR, formato DIAGNÓSTICO/HIPÓTESES/OPORTUNIDADES/ÂNGULOS/ESTRATÉGIA VENCEDORA/RECOMENDAÇÃO/PRÓXIMO PASSO, auto-revisão 10 perguntas, leis PT-BR direto zero clichê nunca inventar
2. Copywriter IA — ELITE EXCELÊNCIA v3.8 — direct response obsessão atenção, começa pelo diagnóstico QUEM/QUER O QUÊ/POR QUÊ/O QUE IMPEDE, método 5 hooks com frameworks, formato DIAGNÓSTICO/HOOKS/HEADLINES/CTAS/MAIS FORTE, auto-revisão, leis
3. Roteirista UGC IA — ELITE EXCELÊNCIA v3.8 — diretor narrativa audiovisual, pensa visual FALA+AÇÃO+EXPRESSÃO+CÂMERA+AMBIENTE+LUZ+MOVIMENTO+TEXTO+SOM+RITMO+TRANSIÇÃO, adapta pra influencer/pessoa comum/especialista/fundador, formato cena a cena com dicas gravação + variações
4. Engenheiro de Prompts IA — ELITE EXCELÊNCIA SEM LIMITE v3.9 — diretor técnico-criativo multimídia, multimodal (produtos, pessoas, influencers, modelos, creators, UGC, personagens, avatares, animais, ambientes, arquitetura, gastronomia, moda, beleza, veículos, tecnologia, cenas cinematográficas, mundos fantásticos, conceitos abstratos, thumbnails, editoriais, comerciais, storyboards, vídeos, narração), método interno 15 perguntas (O QUE? QUEM? O QUE acontece? ONDE? Contexto? Emoção? Intenção comercial? Estética? Câmera? Luz? Composição? Formato? Motor? O que preservar? O que NÃO pode aparecer?) — responde INTERNAMENTE, NÃO lista na saída — formato APENAS 1 parágrafo denso em INGLÊS quanto necessário pra excelência SEM LIMITE (120-200+ palavras), exemplo morango premium 120 palavras + exemplo escova dental lutando contra cárie metáfora herói vs vilão, auto-revisão 10 perguntas, leis ENGLISH ALWAYS sem limite
5. Analista Criativo IA — ELITE EXCELÊNCIA v3.8 — crítico exigente, sistema diagnóstico criativo, analisa HOOK/ATENÇÃO/CLARZA/IDENTIFICAÇÃO/PROMESSA/MECANISMO/PROVA/OFERTA/CTA/DESIGN/HIERARQUIA/CONGRUÊNCIA/EMOÇÃO/PERSUASÃO/LEGIBILIDADE/DIFERENCIAÇÃO/ADEQUAÇÃO, separa FATO/HIPÓTESE/INFERÊNCIA/RECOMENDAÇÃO, formato NOTA/DIAGNÓSTICO/PONTOS FORTES/MELHORIAS/PROMPT MELHORADO/HIPÓTESE PERFORMANCE, auto-revisão

Diretor de Tráfego: NÃO está no array agents, está como IA tecida em campanhas-view.tsx (lê formulário métricas → library_items) — preservar, não recriar sem autorização (como manda comando novo)

================================================================
7. QUAIS AGENTES AINDA FALTAM (pelo comando expansão + reconstrução + diretor-mestre)
================================================================

Faltam 6 agentes para ecossistema premium completo:

Prioridade 1 (020-A):
- Comportamento Humano & Persuasão — pré-processador Perfil Psicológico (quem é, o que quer, o que teme, o que impede, o que chama atenção, o que aumenta confiança, o que reduz fricção, o que influencia) — psicologia comportamental, cognitiva, social, neurociência, neuromarketing, consumidor, economia comportamental, decisão, vieses, atenção, memória, motivação, emoção, hábitos, persuasão, arquétipos, antropologia, semiótica, linguística, UX Psychology, behavioral design, framing, confiança, identidade — salvo no banco como ativo reutilizável (tabela perfis_psicologicos proposta)
- Orquestrador — cérebro central, não agente do Studio, mora em /orquestrador com Sala de Missão — interpreta objetivo → contexto → problema → competências → agentes → sequência → execução → crítica → refinamento → resultado final — sabe QUEM NÃO chamar

Prioridade 2 (020-B/C):
- Diretor Criativo — decide O QUE criar (conceito criativo, direção visual, estética, storytelling, ângulos, identidade visual, narrativa, composição, referências, continuidade, direção fotografia, linguagem audiovisual, emoção, ritmo, contraste, metáforas) — Engenheiro decide COMO traduzir, Analista avalia O QUE FUNCIONOU — falta hoje, motivo imagem feia
- Performance — Inteligência de Performance: CTR, CPC, CPM, CPA, ROAS, CAC, LTV, frequência, funil, atribuição, tendências, anomalias, oportunidades, otimização — pergunta "Qual próximo movimento recomendado?"
- Oferta & Vendas — engenharia oferta, proposta valor, posicionamento, pricing, ancoragem, pacotes, funil, aquisição, qualificação, objeções, vendas consultivas, copy comercial, scripts, WhatsApp, follow-up, CRO, CAC, LTV, upsell, cross-sell, retenção, reativação — "Como transformamos atenção em receita?" — trabalha com Estrategista+Comportamento+Copywriter+CRM

Prioridade 3 (futuro, arquitetura preparada):
- CRM & Relacionamento — leads, histórico, segmentação, follow-up, WhatsApp, oportunidades, relacionamento, retenção, reativação, jornada, automações — conversa com banco clientes

Todos com estrutura ELITE PAPEL→CONTEXTO→MÉTODO→FORMATO→AUTO-REVISÃO→LEIS + camada transversal inteligência humana + sem limite palavras quanto necessário pra excelência

================================================================
8. COMO OS AGENTES ATUALMENTE SE COMUNICAM
================================================================

Hoje: NÃO se comunicam — são isolados 1:1

Fluxo atual:
Usuário escolhe 1 agente no IA Studio → digita tarefa → promptFinal = [agente.instrucao + tarefa + "Responda em PT-BR direto..."] → iaService.gerarTexto(promptFinal) → POST /api/ia → Mesa Texto → retorna texto + motor → setOutput + setHistorico local sessão (não vai pro banco auto, só se salvar) → se Engenheiro, botão "Usar no gerador de imagem" copia output pra imagemPromptF → usuário edita → imagemService.gerarImagem → POST /api/imagem → Mesa Imagens → retorna data URL + motor + notas + promptUsado → preview + botão Salvar em Mídias

Entre agentes: zero. Engenheiro não vê o que Estrategista gerou, exceto via botão manual. Não há Perfil Psicológico compartilhado, não há memória entre gerações, não há registro de resultados de criativos.

Isso viola: "todos os agentes têm que ser perfeitos, congruentes, cooperativos" + "1+1+1 não resulta em 3 — coordenação produz superior à soma"

================================================================
9. COMO DEVERIA FUNCIONAR O ORQUESTRADOR (pelo comando expansão verbatim completo)
================================================================

Orquestrador = cérebro operacional, não simples encaminhador.

Deve pensar:
OBJETIVO → CONTEXTO → PROBLEMA → COMPETÊNCIAS NECESSÁRIAS → AGENTES NECESSÁRIOS → SEQUÊNCIA → EXECUÇÃO → CRÍTICA → REFINAMENTO → RESULTADO FINAL

Deve:
- interpretar objetivo usuário
- entender contexto
- decompor problemas
- identificar competências necessárias
- selecionar especialistas adequados (saber QUEM NÃO chamar — inteligência é também saber quem não chamar)
- definir sequência execução
- fornecer contexto aos agentes
- receber resultados
- comparar resultados
- identificar inconsistências
- solicitar revisão quando necessário
- combinar resultados
- produzir resposta final coerente
- registrar decisões importantes
- aprender com resultados disponíveis

Exemplo ideal (do comando):
Usuário: "Quero criar anúncio para vender X"
Orquestrador:
1. identifica objetivo
2. identifica produto
3. identifica público
4. identifica canal
5. chama Comportamento → Perfil Psicológico (salva no banco)
6. chama Estrategista (usa perfil)
7. chama Oferta quando necessário
8. chama Copywriter (usa perfil+estratégia)
9. chama Diretor Criativo (decide O QUE criar)
10. chama Engenheiro de Prompt (decide COMO traduzir, recebe conceito + perfil + estratégia + copy)
11. chama Analista de Criativo (avalia)
12. consolida
13. revisa
14. entrega solução integrada (não "resposta A + resposta B")

Hierarquia:
ORQUESTRADOR (contexto, sequência, seleção, integração, revisão)
→ AGENTES ESPECIALISTAS (excelência, colaboração, crítica, entrega estruturada)
→ USUÁRIO (objetivo, decisões estratégicas, aprovação, direção final)

Nasce em fases A→B→C (decisão Reunião 2):
A) pipeline fixa "Produção Completa" (1 botão, determinística) — MVP
B) planejador dinâmico com aprovação humana
C) revisor + memória de contexto

UX: Sala de Missão (cards acendem conforme agentes trabalham, como central de comando)

================================================================
10. QUAIS INTEGRAÇÕES EXISTEM (reais, funcionando)
================================================================

- Supabase: auth, banco real com RLS, storage midias privado com URLs assinadas 60min + avatars público, insert .select().single() → prepend, delete com confirmação, kanban otimista
- Vercel: deploy automático main → anuncia-three.vercel.app + lp-anunc-ia.vercel.app, envs Production e Preview, maxDuration 60 pra imagem
- GitHub: github.com/creatina23/saugc-os (main) + lp-anuncia privado
- Mesa Texto: Gemini, Groq, OpenRouter free, Cerebras opcional — auto-descoberta, skip gracioso, espelho GET /api/ia
- Mesa Imagens: Cloudflare Workers AI (klein-9b, klein-4b, SDXL Lightning, schnell) + HF SDXL + Pollinations flux/turbo + Gemini imagem paga desligada — espelho GET /api/imagem
- IA Studio: 5 agentes vivos + gerador imagem + salvar Mídias+Biblioteca (Fase 4)
- Ponte do Vídeo: Briefing roteiro → comandos Flow cena a cena (Caminho A)
- Guia Vivo: 11 guias no app (guia.tsx + guia-data.ts)
- Mídias: upload real, preview, baixar via âncora invisível, lixeira real

================================================================
11. QUAIS INTEGRAÇÕES ESTÃO PLANEJADAS (futuro, preparar terreno, não mock)
================================================================

Visão longo prazo do comando Diretor-Mestre:

- Geração imagens: ✅ já existe (Mesa v12.3), mas precisa melhorar qualidade (SDXL primeiro, prompt completo sem limite)
- Geração vídeos: Ponte do Vídeo já existe (comandos pro Flow) — futuro: gerar direto via API (Runway, Veo, Flow) quando tiver orçamento — preparar rota /api/video
- Narração, personagens, UGC, influenciadores virtuais, cenas publicitárias: preparar arquitetura, não mock — Engenheiro já multimodal pra isso
- Edição e adaptação de criativos: futuro
- Meta/Instagram/TikTok/Google Ads: API Meta só após vendas (decisão 5 ago) — autopilot que erra = morte reputacional — preparar service, não implementar agora — escopo honesto: GERAR = sim, PUBLICAR direto continua estacionado (revisão app semanas)
- WhatsApp: Meta Cloud API + webhook Vercel + Gemini + Supabase, R$0/mês, chip separado, Evolution/Baileys PROIBIDO — candidata #1 pós-lançamento — preparar arquitetura
- Distribuição anúncios, gestão campanhas, análise métricas, CRM, automações: preparar terreno
- Assinatura/cobrança: Sprint Checkout/Assinatura pós-1º-cliente (webhook idempotente → subscriptions → gate + planos reais Start 397/Max 497/Enterprise 597 + anual 10×12)
- Inteligência mercado, consumidor, performance: Comportamento + Performance + Oferta agentes

Quando não puder implementar imediatamente: NÃO inventar, NÃO simular, NÃO criar mock — preparar interfaces, contratos e terreno técnico.

================================================================
12. QUAIS RISCOS ENCONTREI (com previsão de merda — 7ª Barreira)
================================================================

| Risco | Probabilidade | Impacto | Como evitar |
|---|---|---|---|
| Cota Mesa acaba com Orquestrador (1 objetivo = 5-10 chamadas, 230 img/dia casa compartilhada) | Alta | Alto | Cache Perfil Psicológico (não gerar toda vez) + medição real por usuário na Sprint assinatura (URGENTE) + avisar usuário "cota casa compartilhada" |
| Quebrar IA Studio ao implementar Orquestrador | Média | Alto | Nova rota /api/orquestrador separada, não alterar /api/ia e /api/imagem, novo service orquestrador-service.ts no barrel, nova página /orquestrador (não alterar /ia-studio) |
| Orquestração ingênua quebra (chamar todos sempre) | Média | Médio | Fase A pipeline fixa determinística, não dinâmica — Fase B dinâmica com aprovação humana (decisão em ata) |
| Imagem feia mesmo com prompt 10/10 completo | Alta | Alto | SDXL Lightning primeiro (fotorealista) + detector prompt elite já bom mantém 100% sem diminuir + suffix anti-pintura/amarelo mas sem poluir + Engenheiro sem limite quanto necessário pra excelência + Diretor Criativo decide O QUE criar (falta hoje) |
| Formato esticando 1:1→9:16 | Média | Médio | handleFormatoChange limpa imagem antiga + preview object-contain overflow-hidden + gerar nova no formato certo, nunca esticar |
| Engenheiro listando 15 perguntas na saída | Média | Alto | Método interno responde internamente NÃO mostra na saída + formato APENAS 1 parágrafo denso em INGLÊS |
| Diminuir caracteres piora (80-120 limite) | Alta | Alto | SEM LIMITE — quanto for necessário pra excelência (resalva do dono) |
| Entrega via viewer confunde, commit md confuso, código em pedaços | Alta | Médio | Arquivo inteiro no chat Ctrl+A Ctrl+V + commit 6 linhas PowerShell puras + passo a passo numerado completo 13 passos |
| Segredo no chat = revogar | Baixa | Alto | Nunca pedir chave no chat, server-only, 2 cofres .env.local + Vercel Production e Preview |
| Autopilot tráfego erra = morte reputacional | Baixa | Alto | Waze do tráfego: Olho → Cérebro (MVP vivo) → Mão sempre com confirmação, API Meta só após vendas |

================================================================
13. QUAIS MELHORIAS RECOMENDO (para produto premium que cliente quer pagar)
================================================================

Imediatas (sem estrutural, só personas — pode fazer agora, autorizado com resalva sem limite):

1. **Aplicar v3.9 FIX Engenheiro sem listar perguntas + sem limite excelência** (1492 linhas, build verde) — já está na bancada, 2 arquivos inteiros no chat entregues (ia-studio-view v3.9 + api/imagem v12.3) — dono precisa colar + push + teste morango vermelho bonito + escova dental lutando contra cárie metáfora herói vs vilão

2. **Elevar todos os 5 agentes para ELITE com estrutura do comando novo de reconstrução de personas** — já feito v3.8: PAPEL→CONTEXTO→MÉTODO→FORMATO→AUTO-REVISÃO→LEIS + 15 perguntas internas Engenheiro + 10 perguntas auto-revisão + sem limite palavras quanto necessário pra excelência + exemplo bom/ruim + leis nunca inventar

Próximas (com autorização, com estrutural mínima, para premium disruptivo):

3. **020-A Orquestrador MVP (pipeline fixa Produção Completa)** — 7 etapas:
   - Base de Excelência: src/lib/base-excelencia.ts (arquétipos Jung, Cialdini, Kahneman System 1/2, PNL, psicologia consumidor, etc.) muda da tela pra rota /api/ia e /api/orquestrador (decisão Reunião 2)
   - Comportamento: persona elite + tabela perfis_psicologicos (id, user_id, briefing_id?, perfil JSON, created_at) — pré-processador Perfil Psicológico salvo no banco como ativo reutilizável
   - Rota /api/orquestrador (pipeline fixa determinística, não mexe em /api/ia e /api/imagem)
   - Service orquestrador-service.ts no barrel
   - Página /orquestrador com Sala de Missão UX (cards acendem: Comportamento 🟢 → Estrategista 🟡 → Copywriter → Diretor Criativo → Engenheiro → Analista → consolidado)
   - Preservar IA Studio v3.8 atual (adição, não substituição)
   - Build verde + prova Ctrl+F + passo a passo + roadmap após cada etapa

4. **Diretor Criativo** — entra junto com 020-A ou logo depois (decide O QUE criar, falta hoje, motivo imagem feia mesmo com prompt 10/10)

5. **Oferta & Vendas + Performance** — 020-B/C — tornam operação completa: estratégia + oferta + copy + criativo + tráfego + dados + análise + otimização + escala

6. **Medição real por usuário** — Sprint assinatura URGENTE (cota casa compartilhada ~230/dia aperta com 5 clientes)

7. **Operação Aprende** — registro de resultados de criativos → histórico consultado antes de gerar próximo — fosso competitivo real

8. **Demo WOW 60s** — gravar vídeo briefing → Produção Completa → 5 cards acendendo → imagem real em Mídias — métrica premium: cliente fala "quanto custa pra usar agora?"

================================================================
14. O QUE NÃO DEVE SER ALTERADO (patrimônio — regra absoluta)
================================================================

- Supabase (banco real, auth, RLS, storage midias privado + avatars público)
- Vercel (deploy)
- GitHub (repo)
- Mesa Texto v6 e Mesa Imagens v12.3 (auto-descoberta, skip gracioso, espelho, resumo fila) — funcionando, patrimônio
- IA Studio v3.8/v3.9 atual (5 agentes elite, gerador imagem, salvar Mídias+Biblioteca Fase 4) — preservar, Orquestrador é adição
- Tabelas: clients, campaigns, briefings, commercials, library_items, deals, assets, prompts, profiles, etc. — não recriar, não apagar
- Serviços: ia-service, imagem-service, barrel index.ts — não recriar, só adicionar orquestrador-service
- Rotas: /api/ia, /api/imagem — não alterar, criar nova /api/orquestrador separada
- Ponte do Vídeo, Guia Vivo, Dashboard real, Mídias real, etc. — tudo que já funciona
- Não criar mocks, demos, dados fictícios — nunca
- Não alterar autenticação, APIs, storage, persistência sem necessidade e sem autorização

================================================================
15. PLANO DE EVOLUÇÃO EM ETAPAS (com roadmap após cada etapa — lei nova do dono)
================================================================

ETAPA ATUAL: 019 Fase 4 + Fix v3.9 Sem Listar Perguntas + Sem Limite Excelência
PROGRESSO: 98% Sprint 019
STATUS: 🟢 Pronta na bancada build verde — 🟡 Aguardando colar+push do dono

FILA DE BATALHA (aprovada Reunião 2 + somada com comando reconstrução + diretor-mestre + princípio premium):

1. **HOJE — Aplicar v3.9 + v12.3** (autorizado com resalva sem limite)
   - Arquivos: ia-studio-view.tsx v3.9 (1492 linhas, Engenheiro sem listar perguntas, sem limite excelência, todos elite) + api/imagem/route.ts v12.3 (SDXL primeiro, elite já bom mantido 100%, anti-pintura/amarelo)
   - Ação: dono Ctrl+A Ctrl+V Ctrl+S nos 2 arquivos + porteiros + push
   - Roadmap após: entregar ROADMAP_ATUAL_POS_ETAPA.md atualizado

2. **020-A MVP — Orquestrador + Comportamento + Base na rota + Sala Missão** (7 sub-etapas, precisa "les go 020-A")
   - 2.1 Base Excelência → src/lib/base-excelencia.ts + injetar em /api/ia
   - 2.2 Comportamento → src/lib/agentes/comportamento.ts + migration perfis_psicologicos
   - 2.3 Rota /api/orquestrador (pipeline fixa Produção Completa)
   - 2.4 Service orquestrador-service.ts + barrel
   - 2.5 Página /orquestrador com Sala de Missão UX
   - 2.6 Teste: objetivo "morango premium" → 5 agentes cooperativos → imagem congruente bonita não feia
   - 2.7 Roadmap após cada sub-etapa

3. **020-B/C — Seleção dinâmica + auto-crítica + Performance + Oferta & Vendas + Diretor Criativo completo**
   - Diretor Criativo decide O QUE criar (conceito), Engenheiro COMO, Analista avalia O QUE FUNCIONOU
   - Performance: CTR, CPC, CPA, ROAS, próximo movimento
   - Oferta: engenharia oferta, pricing, CRO

4. **Fechar 018 — Linguagem** (Levas 2-5: login, central, menu, estados vazios, guia) — 20% feito

5. **Balanço dogfooding 26 ago** — Sala de Páginas × caça ampliada — decisão soberana

6. **Ativar modo caça** — gatilho do dono — 10 contatos/dia, demo WOW 60s, meta 1 cliente R$4.998,50 PIX

7. **Pós-1º-cliente** — Checkout/Assinatura (webhook idempotente → subscriptions → gate) + Agente WhatsApp (Meta Cloud API, R$0, chip separado, Evolution/Baileys proibido) + v3.0 Waze do tráfego

Cada etapa: 7ª Barreira Previsão de Merda (3 merdas previstas e evitadas) + prova Ctrl+F + lint + build reais na bancada + arquivo inteiro no chat + passo a passo numerado completo + commit simples 6 linhas + roadmap após etapa + registro erro/aprendizado na memória transferível v4/v5/v6 para ficar cada vez mais completo + filtro premium 7 perguntas (premium? top? disruptivo? diferente? atraente? hiper inteligente? cliente quer pagar?)

================================================================
FIM DA AUDITORIA DE ESTADO — 15 PONTOS — DIRETOR-MESTRE
Não implementei nada nesta auditoria, como mandado.
Aguardando sua autorização para próxima etapa.
================================================================
