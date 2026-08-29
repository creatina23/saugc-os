# 🗺️ ROADMAP — AnuncIA — Após Etapa v1.9 NO AR (deu certo)
**Gerado: 25 ago 2026 noite — Após fix build Google Fonts ipv4first + v3.9 sem listar perguntas + v12.3 morango vermelho — deu certo**
**Lei nova do dono: roadmap após cada etapa (registrado na memória v4)**

---

## ETAPA ATUAL: Sprint 019 Fase 4 + Fix Premium v3.9/v12.3/v12.4 NO AR
**PROGRESSO:** 100% da Sprint 019
**STATUS:** 🟢 NO AR — Build verde 9.0s com ipv4first — Dono colou 2 arquivos + push + teste deu certo

### CONCLUÍDO (nesta etapa — 25 ago noite):
- ✅ 019 Fase 4: Salvar imagem em Mídias (bucket midias privado + assets Product Photos) + Biblioteca (library_items Criador Guidelines) — botão "Salvar em Mídias + Biblioteca" — dataUrlParaBlob atob → Blob → upload — build verde
- ✅ Fix Formato Esticando: handleFormatoChange limpa imagem antiga ao mudar formato + preview object-contain overflow-hidden — não estica mais 1:1→9:16, gera nova no formato certo
- ✅ Fix Engenheiro sem listar perguntas: quando "escova dental lutando contra caries" listava 15 perguntas, agora entrega só prompt final EN denso "A heroic toothbrush character battling cavity villain..." — método interno responde internamente NÃO mostra na saída
- ✅ Fix Sem Limite Excelência: sem limite palavras quanto necessário pra excelência (resalva do dono) — removido limite 80-120 e 120-200 que piorou — Engenheiro 120-200+ palavras pode ser 300
- ✅ Elite Todos Agentes v3.6/v3.8/v3.9: todos os 5 agentes ELITE PAPEL→CONTEXTO→MÉTODO→FORMATO→AUTO-REVISÃO→LEIS 10/10 + 15 perguntas internas Engenheiro + 10 perguntas auto-revisão + exemplo bom/ruim + multimodal completo
- ✅ Fix Congruência Morango Vermelho v12.3: SDXL Lightning primeiro (fotorealista) → klein-9b → klein-4b → schnell → HF → Pollinations → Gemini paga desligada — detector elite já bom mantém 100% original sem diminuir + suffix anti-pintura/amarelo — morango vermelho bonito não amarelo pintado quadro
- ✅ Fix Build Google Fonts v12.4: package.json build com ipv4first "set NODE_OPTIONS=--dns-result-order=ipv4first && next build" — fix Turbopack build failed Failed to fetch Geist Mono/Inter from Google Fonts — pendência antiga QUITADA
- ✅ Papelada 100% organizada: 010_CHANGELOG.md reconstruído 32KB v1.1→v1.9 + 011 GPS v3.0 + 012 Memória v2.2 + 013 Mapa Caça + 015 Contrato + 016 + 017 + 018 + VERSOES.md v3.9 + ARQUIVO_MESTRE_ORGANIZADO_v3.4.md + INVENTARIO_FINAL.md + PRINCIPIO_PREMIUM_SUPREMO + EVOLUCAO_CONTINUA + MEMORIA_TRANSFERIVEL v4 + AUDITORIA_DIRETOR_MESTRE_15_PONTOS 33KB + pacote REBIRTH 1.0 10 docs ANUNCIA_* + Commander Handoff 14KB + COMANDO_RE_CRIACAO_v6 48KB
- ✅ Auditoria Diretor-Mestre 15 pontos + Plano Orquestrador 020-A 7 etapas + Princípio Premium Supremo (lei suprema) + Evolução Contínua + 7ª Barreira Previsão de Merda + Roadmap após cada etapa

### RESTANTE (desta sprint):
- [x] Tudo concluído — Sprint 019 100% NO AR

---

## PRÓXIMO PASSO ÚNICO (1 ação — fila aprovada Reunião 2):

**020-A Orquestrador MVP — pipeline fixa "Produção Completa" + Base Excelência na rota + Comportamento + Sala Missão**

O QUE É: 1 botão "Produção Completa" que transforma objetivo em campanha completa, com 5-6 agentes cooperativos compartilhando Perfil Psicológico (hoje 5 isolados 1:1)

POR QUE IMPORTA: é o que faz virar premium, top, disruptivo, diferente, atraente, hiper inteligente que cliente quer pagar — sem Orquestrador, Engenheiro não sabe o que Estrategista fez, por isso imagem sai feia/nada a ver mesmo com prompt 10/10

O QUE VAI MUDAR (sem quebrar nada, só arquivos novos):
- Nova rota /api/orquestrador (não mexe em /api/ia e /api/imagem)
- Base Excelência: src/lib/base-excelencia.ts (arquétipos Jung, Cialdini, Kahneman, PNL, etc.) muda da tela pra rota /api/ia e /api/orquestrador (decisão Reunião 2)
- Comportamento: persona elite + tabela perfis_psicologicos (Perfil Psicológico salvo no banco como ativo reutilizável)
- Diretor Criativo: decide O QUE criar (falta hoje motivo imagem feia)
- Service orquestrador-service.ts no barrel
- Página /orquestrador com Sala de Missão UX cards acendem (Comportamento 🟢 → Estrategista 🟡 → Copywriter → Diretor Criativo → Engenheiro → Analista)

RISCO: 1 objetivo = 5-6 chamadas na Mesa (cota casa ~230/dia compartilhada aperta) — mitigado com cache Perfil + medição por usuário URGENTE

RECOMENDAÇÃO: "les go 020-A" — começo agora, com roadmap após cada sub-etapa, arquivo inteiro no chat, passo a passo completo, commit simples, build verde na bancada

---

## ROADMAP COMPLETO (visão sistêmica)

Andar 1 — Fábrica Criativa: v2.0 ✅ · Verdade Total ✅ · Mesa Motores + Ponte Vídeo + Guia Vivo ✅ · Sprint 019 Fase 4 + Fix Premium v3.9/v12.3/v12.4 ✅ NO AR (25 ago noite) — 100% · Sprint 018 linguagem 20% em curso
Andar 2 — Inteligência Tráfego: v3.0 Cérebro MVP vivo Diretor Tráfego

### FILA DE BATALHA APROVADA (Reunião 2 + soma reconstrução + diretor-mestre + premium):

| Ordem | Sprint | O que | Status | Progresso |
|---|---|---|---|---|
| 1 | **019 Fase 4 + Fix Premium** | Salvar em Mídias + Biblioteca + Fix qualidade morango vermelho + formato não estica + sem listar perguntas + sem limite excelência + elite todos + build ipv4first | 🟢 NO AR (deu certo) | 100% |
| 2 | **020-A** | Orquestrador MVP pipeline fixa Produção Completa + Base Excelência na rota + Comportamento Perfil Psicológico + Sala Missão UX | 🟡 Auditoria 15 pontos feita, Plano 7 etapas pronto, Aguardando les go 020-A | 0% |
| 3 | **020-B/C** | Seleção dinâmica com aprovação humana + auto-crítica + Performance + Oferta & Vendas + Diretor Criativo completo | 🔴 | 0% |
| 4 | **Fechar 018** | Linguagem Levas 2-5 login/shell Central menu/títulos estados vazios IA Studio/guias LP | 🟡 20% | 20% |
| 5 | **Balanço dogfooding** | 26 ago Sala de Páginas × caça ampliada | 🟡 Agendado | - |
| 6 | **Ativar modo caça** | 10 contatos/dia demo WOW 60s meta 1 cliente R$4.998,50 PIX | 🔴 Pausada | - |
| 7 | **Pós-1º-cliente** | Checkout/Assinatura webhook idempotente → subscriptions + gate + planos 397/497/597 + anual 10×12 + WhatsApp Meta Cloud API R$0 chip separado Evolution/Baileys proibido + v3.0 Waze tráfego | 🔴 Estacionado | - |

### ESTACIONAMENTO (pendências sem sprint dona):

1. Domínio useanuncia.com.br R$40/ano
2. Ping semanal Supabase
3. Oferta Cliente-Fundador estacionada
4. Fase EDUCAÇÃO E LANÇAMENTO aguardando gatilho
5. Limpar conta secundária Supabase
6. Zona de perigo excluir conta
7. Coluna fóssil results campaigns
8. Logo Saturno não escolhido
9. Claude/OpenAI na Mesa só com orçamento — 1 IA paga aceita desde já (só dono) gpt-4o-mini US$0,15/1M imagem Gemini US$0,03-0,13 GEMINI_IMAGEM_ATIVA=true
10. Agente WhatsApp candidata #1 pós-lançamento
11. Offline 100% descartado
12. Faxina Badge dashboard-view:32
13. Sininho/workspace reais pós-lançamento
14. Faxina algo2() api/ia/route.ts
15. 014 original não existe seção 9 MAPA_DE_CACA é oficial
16. LP: chips Mesa GitHub→Cerebras, vídeo 40s, prints, foto/bio, Pixel/GA4

---

## MÉTRICA PREMIUM (Lei Suprema):

Premium? Top? Disruptivo? Diferente? Atraente? Hiper inteligente? Cliente quer pagar? Se qualquer NÃO → refaz até ser SIM.

Produto tem que ser premium que cliente queira pagar pra usar.

---

## PRÓXIMOS GATILHOS:

- "deu certo" → já foi, fechei 019 v1.9 + GPS v3.0 + Memória v2.2 + comando v6/v7
- "les go 020-A" → começo Orquestrador MVP com roadmap após cada sub-etapa (7 etapas)
- "reunião aberta" → Modo Soberano pra ajustar roadmap
- "me passa o comando mestre" → entrego COMANDO_RE_CRIACAO_v6 COMPLETO (48KB, 414 linhas, 14 erros) + Memória v4 + Arquivo Mestre + Roadmap + tudo pra renascer mais completo e aprimorado (nunca v4 antigo)
- "RECRIAR" → protocolo renascimento 10 docs + Commander Handoff 14KB

---

**FIM DO ROADMAP PÓS-ETAPA v1.9 NO AR — 25 ago 2026 noite — PRÓXIMO: les go 020-A Orquestrador MVP**
