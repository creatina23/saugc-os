# ANUNCIA — HANDOFF
# Instruções para Próximo Agente — RECRIAR Fase 12-13

Você está assumindo um projeto existente. Não reconstrua a AnuncIA do zero.

Leia na ordem:
1. ANUNCIA_MASTER_CONTEXT.md — visão identidade princípios leis barreiras modo operacional formato entrega gatilhos stack Mesa IA Studio schema envs arquitetura inteligência estratégia
2. ANUNCIA_PROJECT_STATE.md — estado técnico congelado 25 ago noite: estrutura diretórios real páginas componentes serviços APIs rotas banco tabelas auth storage integrações existentes/planejadas geração texto/imagem/vídeo biblioteca mídias clientes campanhas criativos tráfego cobrança assinatura deploy config dependências verificação build verde não verificados + classificação FUNCIONANDO/PARCIAL/EM DESENVOLVIMENTO/PLANEJADA/QUEBRADA/NAO VERIFICADA
3. ANUNCIA_AGENT_ROSTER.md — agentes existentes 5 no array + 1 tecido + futuros 6 — para cada nome função personalidade especialidades prompt atual entradas saídas serviços status limitações dependências + constituição 20 regras + meta-cognição + excelência sem limite
4. ANUNCIA_DECISION_LOG.md — decisões com DECISÃO/MOTIVO/IMPACTO/DEPENDÊNCIAS/NÃO ALTERAR — inclui Premium Supremo lei suprema, Sem Limite Palavras resalva, 7ª Barreira Previsão Merda, Roadmap após cada etapa, Fix Formato Esticando, Fix Congruência morango vermelho, Fix EN Elite, Elite Todos Agentes, Reunião 2, Copiloto Implacável, Realocação Gerador Imagem, Sprint 019, Protocolo Linguagem, Sprint 017, Recebimento, Sprint 016, v2.0
5. ANUNCIA_ROADMAP.md — JÁ CONCLUÍDO (v2.0, 010-016, 017 Leva 1, 019 Fase 1-4 + fixes v3.5/v3.6/v3.8/v3.9/v12.3, papelada 100%, auditoria, plano 020-A, princípio premium), EM ANDAMENTO (019 Fase 4 + fix v3.9 aguardando colar+push + 018 Levas 2-5), PRÓXIMO (020-A MVP 7 sub-etapas + 020-B/C + Fechar 018 + Balanço dogfooding 26 ago + Ativar caça), FUTURO (pós-1º-cliente Checkout/Assinatura + WhatsApp + v3.0 Waze tráfego + geração vídeos + Meta/Instagram/TikTok/Google/WhatsApp + CRM + automações), VISÃO LONGO PRAZO (ecossistema conectado)
6. Este ANUNCIA_HANDOFF.md

REGRAS PRESERVAÇÃO:
NÃO recriar banco sem necessidade, NÃO criar mock quando existe infraestrutura real, NÃO substituir Supabase GitHub Vercel, NÃO destruir funcionalidades existentes, NÃO reescrever sistema inteiro pra corrigir problema localizado, NÃO alterar arquitetura sem justificativa, NÃO implementar grandes mudanças sem autorização, PRESERVAR→CORRIGIR→APRIMORAR→EXPANDIR, se pode quebrar auth/banco/rotas/agentes/geração/biblioteca/mídias/clientes/campanhas/produção/deploy → PARE explique O QUE/POR QUE/RISCO/COMO PRESERVAR/COMO TESTAR peça autorização, nunca inventar métricas integrações funcionalidades APIs resultados clientes vendas conexões dados — se não existe dizer claramente se planejado dizer planejado se parcial dizer parcialmente implementado se não possível gratuitamente explicar — nunca mascarar ausência com interface bonita, Free-first GRÁTIS→HÍBRIDO→PROFISSIONAL→PREMIUM→AUTOMAÇÃO TOTAL mas não sacrificar arquitetura ou segurança

PREFERÊNCIAS DONO (crítico aprendido com erros 1-13):
- ARQUIVO INTEIRO NO CHAT regra suprema: quando pedir código tem que ser INTEIRO no chat Ctrl+A Ctrl+V Ctrl+S não pedaços não arquivo aberto no viewer não md confuso — formato ```tsx ou ```ts com arquivo completo 1 arquivo por mensagem se grande
- COMMIT SIMPLIFICADO: 6 linhas PowerShell puras direto no chat 1 linha por vez sem md confuso: cd C:\Projetos\BKp\saugc-os, Remove-Item -Recurse -Force .next, npm run lint, npm run build, git add -A, git commit -m "...", git push
- PASSO A PASSO NUMERADO COMPLETO SEMPRE: dono leigo código TDAH não pode adivinhar — dizer o que fazer onde clicar o que esperar o que fazer se falhar — 13 passos numerados
- ROADMAP APÓS CADA ETAPA lei nova 25 ago noite: ETAPA ATUAL/PROGRESSO/CONCLUÍDO/RESTANTE/PRÓXIMO/STATUS + FILA + ESTACIONAMENTO + FILTRO PREMIUM
- IMAGEM: EN elite completo sem limite quanto necessário pra excelência SDXL Lightning primeiro fotorealista + detector prompt elite já bom mantém 100% original sem diminuir + suffix anti-pintura/amarelo mas sem poluir + handleFormatoChange limpa imagem antiga + preview object-contain overflow-hidden não estica 1:1→9:16 + Engenheiro NUNCA lista 15 perguntas na saída APENAS 1 parágrafo denso EN
- AGENTES: todos ELITE 10/10 PAPEL→CONTEXTO→MÉTODO→FORMATO→AUTO-REVISÃO→LEIS + 15 perguntas internas Engenheiro + 10 perguntas auto-revisão + sem limite palavras quanto necessário pra excelência + exemplo bom/ruim + leis nunca inventar
- IA PAGA: agora não deixar preparado — 1 IA paga aceita desde já só dono texto gpt-4o-mini US$0,15/1M imagem Gemini US$0,03-0,13 GEMINI_IMAGEM_ATIVA=true — nunca chave no chat server-only 2 cofres .env.local + Vercel Production e Preview
- MEMÓRIA: registrar tudo roadmap após cada etapa aprender com erros 13 erros já registrados evoluir constantemente prever merdas 7ª Barreira pre-mortem obrigatório 3 perguntas ficar cada vez mais completo próxima versão comando mais completa que anterior
- PREMIUM: produto tem que ser premium top disruptivo diferente atraente hiper inteligente cliente tem que querer pagar — filtro 7 perguntas antes de entregar

PRIMEIRA AÇÃO SUCESSOR:
1. Ler pacote completo 6 arquivos
2. Auditar projeto real estrutura código banco APIs agentes prompts orquestração
3. Validar estado comparar docs com código priorizar código real registrar divergências
4. Identificar divergências ex: docs dizem VERSOES v3.8 mas código ainda v3.3 se dono não colou
5. Apresentar diagnóstico o que entendeu o que existe o que funciona o que quebrado o que regrediu agentes existentes/faltantes como se comunicam como deveria Orquestrador integrações existentes/planejadas riscos melhorias o que não alterar
6. Listar riscos com previsão de merda
7. Apresentar plano evolução em etapas com roadmap após cada etapa
8. Pedir autorização O QUÊ/POR QUÊ/BENEFÍCIO/RISCO/COMO PRESERVAR/"Posso prosseguir?"
9. Somente então implementar menor alteração necessária arquivo inteiro no chat passo a passo completo commit simples build verde na bancada antes

CHECKSUM HUMANO:
- Novo agente conseguiria entender AnuncIA sem esta conversa? SIM — pacote inclui visão identidade princípios leis 6+7 barreiras modo operacional formato entrega gatilhos stack Mesa v6/v12.3 IA Studio v3.9 schema envs sem secrets arquitetura inteligência agentes existentes/futuros com personas completas decisões log roadmap estacionamento filtro premium auditoria 15 pontos plano 020-A princípio premium evolução contínua memória transferível v4 com 13 erros bancada estrutura fluxo código atualizado poderes
- Conseguiria continuar sem reconstruir projeto? SIM — inclui estrutura diretórios real páginas componentes serviços APIs rotas tipos exemplos banco tabelas colunas RLS storage auth proxy porteiro padrão provado 10× build verde provas Ctrl+F comandos PowerShell
- Saberia diferenciar o que existe do que está planejado? SIM — classifica FUNCIONANDO/PARCIAL/EM DESENVOLVIMENTO/PLANEJADA/QUEBRADA/NAO VERIFICADA nunca trata planejada como existente nunca mock como real

SAÍDA FINAL quando disser RECRIAR:
1. Resumo estado atual
2. O que foi capturado
3. O que não foi possível verificar
4. Riscos
5. Documentos de renascimento 6 arquivos
6. Commander Handoff prompt único pra colar em outra IA
7. Primeiro passo recomendado para novo agente
NÃO continuar desenvolvimento depois — objetivo RECRIAR é preservar memória do projeto e permitir renascimento em qualquer outro agente.
