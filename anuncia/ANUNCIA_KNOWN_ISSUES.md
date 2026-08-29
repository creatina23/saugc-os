# ANUNCIA — KNOWN ISSUES
# Problemas Conhecidos — REBIRTH 1.0 — 25 ago 2026 noite

## CLASSIFICAÇÃO: [QUEBRADA] ou [PARCIAL] — com evidência

### 🔴 [QUEBRADA] mas fixada na bancada (build verde), aguardando colar+push do dono — por isso dono ainda vê erro

#### 1. Imagem feia / amarela pintada em pedestal tipo quadro — nada a ver com prompt 10/10
- Evidência: dono escreveu "morango premium" no Engenheiro, gerou prompt 10/10 perfeito "A single extra-large perfectly ripe luxury strawberry with glossy ruby-red skin..." (120 palavras, EN elite, 85mm macro f/2.8, photorealistic, 8k) e imagem gerada foi fruta amarela em pedestal tipo quadro, nada a ver
- Causa raiz: klein-9b free rápido mas burro pra produto + "golden seeds" confundia modelo pra yellow fruit + tradutor re-traduzia prompt já bom (60 palavras antes) + ordem modelos errada klein antes de SDXL Lightning
- Status: [QUEBRADA] no app do dono (v3.3 antigo ainda), [FUNCIONANDO] na bancada v12.3 FIX Congruência
- Fix aplicado bancada: ordem SDXL Lightning primeiro (melhor pra produto fotorealista) + detector ehPromptEliteJaBom mantém 100% original sem diminuir + suffix anti-pintura/amarelo "photorealistic photo not painting not illustration not yellow fruit red strawberry" + log prompt final
- Arquivos: src/app/api/imagem/route.ts v12.3 607 linhas build verde
- Próximo teste: dono colar v12.3 + testar morango premium → deve sair vermelho fotorealista bonito

#### 2. Formato esticando 1:1 → 9:16 ao invés de gerar nova imagem no formato
- Evidência: dono mudou formato de quadrado 1:1 pra vertical 9:16 e imagem esticou ao invés de gerar nova no formato
- Causa: preview mostrava mesma imagem 1:1 em container 9:16 com w-auto sem object-contain + não limpava imagem antiga ao mudar formato + Select onValueChange setImagemFormatoF direto sem limpar
- Status: [QUEBRADA] no app dono, [FUNCIONANDO] na bancada v3.6/v3.9
- Fix bancada: handleFormatoChange limpa imagemGerada, motor, promptUsado, notas, erro/sucesso ao mudar formato + preview class object-contain overflow-hidden + Select onValueChange handleFormatoChange
- Arquivos: src/app/ia-studio/ia-studio-view.tsx v3.9 1492 linhas build verde

#### 3. Engenheiro listando as 15 perguntas na saída ao invés de prompt final
- Evidência: dono colocou "escova dental lutando contra caries" no Engenheiro e apareceu lista "1. O que precisa aparecer? 2. Quem aparece?..." em vez de prompt final
- Causa: persona tinha MÉTODO com 15 perguntas listadas e modelo interpretou como formato de saída
- Status: [QUEBRADA] no app dono, [FUNCIONANDO] na bancada v3.9 FIX sem listar perguntas
- Fix bancada: MÉTODO INTERNO responde internamente NÃO mostra na saída + FORMATO OBRIGATÓRIO APENAS 1 parágrafo denso em INGLÊS pronto pra colar + exemplo escova dental herói vs vilão "A heroic toothbrush character battling monstrous cavity villain..." + exemplo 0/10 NUNCA listar perguntas
- Arquivos: ia-studio-view.tsx v3.9

#### 4. Engenheiros com prompts mal estruturados (1 linha genérica) + imagens continuam uma merda
- Evidência: dono "a ia de imagem continua uma merda gerando imagem nada haver como prompt do engenheiro que por sua vez esta gerando prompt ptbr. o engenheiro tem que ser capaz de gerar qualquer prompt 10/10 e gerador gerar imagens congruentes. todos agentes tem que ser perfeitos congruentes cooperativos nao é o que esta acontecendo" + "as imagens continuam uma merda o engenheiro criava prompts mais completos esse negocio de diminuir caracteres nao ficou legal estou frustrado estava bom tentei melhorar e agora esta pior" + "vc esta estragando meu projeto"
- Causa: antes v3.3 personas simples 1 linha genérica PT-BR "Crie prompts detalhados para geradores de imagem e vídeo em português" + limite 80-120 palavras diminuiu e piorou + agentes isolados 1:1 não cooperativos não compartilham contexto
- Status: [QUEBRADA] no app dono, [FUNCIONANDO] na bancada v3.8/v3.9 SEM LIMITE EXCELÊNCIA
- Fix bancada: todos 5 agentes ELITE com estrutura PAPEL→CONTEXTO→MÉTODO→FORMATO→AUTO-REVISÃO→LEIS + 15 perguntas internas Engenheiro + 10 perguntas auto-revisão + sem limite palavras quanto for necessário pra excelência (resalva do dono) + exemplo bom/ruim + multimodal completo + sem listar perguntas + ENGLISH ALWAYS quanto necessário sem limite
- Arquivos: ia-studio-view.tsx v3.9 1492 linhas build verde
- Próximo: Diretor Criativo decide O QUE criar (falta hoje) + Orquestrador 020-A pipeline fixa Comportamento→Estrategista→Copywriter→Diretor Criativo→Engenheiro→Analista compartilhando Perfil Psicológico → imagem congruente premium

#### 5. Entrega confusa: arquivo aberto no viewer, md confuso, pedaços, sem passo a passo
- Evidência: dono "nao quero os codigos a por 1 sem ser em md quero copiar direto do chat COMANDO_COMMIT_FASE4.md me deixou confuso" + "quando me passar o codigo tem que ser inteiro vc me passa inteiro eu vou no vs code seleciono tudo e substituo nao quero ficar procurando nada ctrl c + ctrl a + ctrl v e depois ctrl s" + "nao quero as informações em arquivo quero no chat eu copio e colo nada de arquivo aberto" + "tenho que fazer o lint git add push etc no vs code?" + "se eu teria que fazer vc teria que me dizer tudo tem que ser passo a passo nao espere que eu adivinhe sou leigo tenho tdah vc deveria saber disso estou ficando irritado vc esta vacilando muito" + "preciso que sua inteligencia e capacidade evolua constantemente parece que esta regredindo vc tem que prever as merdas que pode acontecer e evitar"
- Causa: violei Modo Operacional Piloto de Missão + Formato Entrega + TDAH-friendly + 6 Barreiras instrução revisada
- Status: [QUEBRADA] processo entrega, [FUNCIONANDO] após fix
- Fix: regra suprema ARQUIVO INTEIRO NO CHAT (não viewer) + commit simples 6 linhas PowerShell puras 1 linha por vez + passo a passo numerado completo 13 passos com o que esperar + roadmap após cada etapa lei nova + 7ª Barreira Previsão de Merda pre-mortem obrigatório 3 perguntas + Princípio Premium Supremo + Evolução Contínua + Memória Transferível v4 com 13 erros
- Arquivos: COMANDO_RE_CRIACAO_v5/v6 com formato entrega atualizado + MEMORIA_TRANSFERIVEL v4 + EVOLUCAO_CONTINUA_v1 + ROADMAP_ATUAL_POS_ETAPA

### 🟡 [PARCIAL] — funciona mas abaixo do padrão premium

#### 6. Imagem ainda feia mesmo com prompt 10/10 completo sem limite
- Evidência: dono "deu certo entre aspas a imagem gerada foi de fato um morango mais bem feio"
- Causa: klein-9b free limitado mesmo com prompt perfeito não vira Midjourney — SDXL Lightning já melhor que klein mas ainda free — para 10/10 real precisa modelo melhor ou Gemini imagem paga US$0,03-0,13/img quando puder — já está no código desligado GEMINI_IMAGEM_ATIVA=true
- Status: [PARCIAL] — gera morango vermelho agora (não amarela) mas feio
- Fix futuro: Diretor Criativo decide O QUE criar + Orquestrador faz Engenheiro receber contexto completo + quando puder ligar Gemini imagem paga + HF_TOKEN com SDXL base melhor
- Mitigação atual: v12.3 SDXL primeiro + prompt completo sem limite + anti-pintura

#### 7. Agentes isolados 1:1 não cooperativos não congruentes
- Evidência: dono "todos os agentes do anuncia tem que ser perfeitos congruentes cooperativos nao é o que esta acontecendo sera que melhora com o orquestrador ou vai ficar essa bosta mesmo?"
- Causa: sem Orquestrador, sem Perfil Psicológico compartilhado, sem Diretor Criativo que decide O QUE criar
- Status: [PARCIAL] — 5 agentes elite 10/10 mas isolados
- Fix: Orquestrador 020-A MVP pipeline fixa Produção Completa Comportamento→Estrategista→Copywriter→Diretor Criativo→Engenheiro→Analista compartilhando contexto — transforma isolados em operação cooperativa premium disruptiva hiper inteligente — auditoria feita plano 7 etapas aguardando les go 020-A

### 🟢 [FUNCIONANDO] — mas com pendências

- Dashboard real, Clientes, Campanhas, Briefings Ponte Vídeo, Comerciais limpo, Mídias real, Biblioteca real, Prompts real, CRM kanban, Configurações perfil/foto, IA Studio 5 agentes, Mesa Texto v6, Mesa Imagens v12.3, Salvar Mídias Fase 4 — tudo funcionando mas com fixes v3.9/v12.3 ainda não colados no VS Code do dono (por isso dono vê quebrado)

### 📋 [PLANEJADA] — não existe ainda, preparar terreno não mock

- Orquestrador, Comportamento, Diretor Criativo, Performance, Oferta & Vendas, CRM & Relacionamento, WhatsApp, Checkout/Assinatura, v3.0 Waze tráfego, geração vídeo direta, Meta/Instagram/TikTok/Google Ads API, etc.

### [NAO VERIFICADA]

- LP repo privado lp-anuncia, Supabase produção, Vercel envs, 014 original não existe seção 9 MAPA_DE_CACA é oficial
