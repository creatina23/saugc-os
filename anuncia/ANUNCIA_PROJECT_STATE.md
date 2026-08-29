# ANUNCIA — PROJECT STATE
# Estado Técnico Atual — Congelado 25 ago 2026 noite — Protocolo RECRIAR

## ESTRUTURA DIRETÓRIOS (real verificada)
```
src/app/api/ia/route.ts v6 Mesa Texto 707 linhas auto-descoberta build verde
src/app/api/imagem/route.ts v12.3 FIX Congruência morango vermelho 607 linhas SDXL primeiro elite já bom 100% build verde
src/app/ia-studio/ia-studio-view.tsx v3.9 FIX sem listar perguntas + sem limite excelência 1492 linhas 5 agentes ELITE PAPEL→CONTEXTO→MÉTODO→FORMATO→AUTO-REVISÃO→LEIS + handleFormatoChange limpa imagem + object-contain + Fase 4 Salvar Mídias build verde 9.0s
src/app/assets/ assets-view.tsx 958 linhas real Storage midias privado
src/app/biblioteca/ real library_items
src/app/briefings/ com Ponte do Vídeo
src/app/campanhas/ com Diretor Tráfego IA tecida
src/app/clientes/ com Excluir
src/app/comerciais/ original limpo
src/app/crm/ kanban trilho snap celular
src/app/configuracoes/ perfil/foto bucket avatars
src/app/dashboard-view.tsx real KPIs banco
src/app/login/ hero Comando em expansão
src/lib/services/ ia-service.ts v3 + imagem-service.ts v3 + index.ts barrel v2 + outros mocks antigos mas telas usam Supabase direto
src/lib/supabase/ client.ts + server.ts
src/lib/guia-data.ts 11 guias
src/components/layout/ sidebar, header, page-header, app-shell, command-palette, guia
src/components/ui/ button, card, badge, dialog, select, input, textarea, avatar, tabs
src/types/ Client, Campaign, Briefing, Deal, Asset, LibraryItem, PromptItem, Commercial
docs/ 010_CHANGELOG.md 32KB v1.1→v1.8 reconstruído + 011 v2.9 + 012 v2.1 + 013 Mapa Caça (seção 9 = 014) + 015 Contrato + 016 + 017 + 018 + VERSOES.md v3.9 + ARQUITETURA_COMPLETA 18.9KB + MODO_OPERACIONAL + COMANDO_RE_CRIACAO v4/v5 + 000-030_contexto_completo.txt 152KB
public/ logo-anuncia.png + icon.png vidro gelo
package.json Next 16.12 Turbopack React 19.2.4 Supabase Radix Tailwind 4 scripts dev NODE_OPTIONS ipv4first + build + lint
```

## PÁGINAS
/ dashboard real KPIs banco, /clientes CRUD + Excluir, /campanhas CRUD + Diretor Tráfego IA tecida, /briefings CRUD + Roteirista tecida + Ponte Vídeo Flow, /comerciais original limpo, /assets Mídias real Storage privado + assets + upload + URLs assinadas 60min + baixar âncora invisível + lixeira, /biblioteca real library_items, /prompts real, /crm kanban real, /configuracoes perfil/foto avatars, /ia-studio playground 5 agentes ELITE v3.9 + gerador imagem + salvar Mídias Fase 4, /laboratorio fora menu, /login hero, /orquestrador PLANEJADA 020-A

## APIS
/api/ia v6 POST gerar-texto + GET espelho motores armado booleanos — cadeia Gemini auto → Groq auto → OpenRouter free auto → Cerebras opcional — GitHub Models faleceu 30 jul 2026 — skip gracioso sem chave — só logado — resumo fila nos erros — maxDuration?
/api/imagem v12.3 POST gerar-imagem formato quadrado/retrato/vertical/paisagem + GET espelho — cadeia SDXL Lightning primeiro → klein-9b → klein-4b → schnell → HF → Pollinations flux/turbo → Gemini paga desligada — tradutor PT→EN elite v2 detector elite já bom mantém 100% sem diminuir + suffix anti-pintura/amarelo — referência input_image_0 ≤512 — anti-texto no visible text — maxDuration 60 — só logado — cota casa ~230/dia — medição URGENTE
/api/orquestrador PLANEJADA 020-A pipeline fixa Produção Completa

## BANCO
Supabase ugaessoebkqfqezmuwhc sa-east-1 Free 2 contas app principal 5972616a — ping semanal
Tabelas: clients(12), campaigns(16), briefings(10), commercials(10), library_items(8 cat EN), deals(9), assets(10), prompts(9), profiles, ai_generations, ai_usage, ai_feedback, perfis_psicologicos proposta 020-A — RLS dono total user_id=auth.uid() — Storage midias privado por user_id até 50MB + avatars público até 2MB — Padrão provado 10× + foto: getSupabaseBrowser null → demo com selo, setState SÓ .then() com let ativo, snake→camel, insert .select().single() → prepend, delete confirmação, kanban otimista, erros "Detalhe técnico:"

## AUTENTICAÇÃO
Supabase Auth + proxy.ts porteiro blindado + CADASTRO_ABERTO=false CTA demo zap wa.me/5521965102326

## GERAÇÃO TEXTO/IMAGEM/VÍDEO/BIBLIOTECA/MÍDIAS
ia-service → /api/ia → Mesa v6 → texto+motor → IA Studio output+motor+histórico+salvar biblioteca — Temperatura e maxTokens REAIS — Base Excelência ainda na tela, deveria ir pra rota 020-A
imagem-service → /api/imagem → enriquecerPrompt elite já bom mantém 100% sem diminuir senão traduz EN elite 120w → fila SDXL primeiro → data URL + motor + formato + promptUsado + notas → preview object-contain + handleFormatoChange limpa + Salvar Mídias Fase 4 data URL→Blob→upload bucket+assets+library_items — Formatos quadrado 768x768 retrato 768x960 vertical 704x1216 paisagem 960x768 — Referência ≤512 canvas — anti-texto no visible text — Cota 10k neurônios/dia ~230/dia casa compartilhada — Problemas: imagem feia mesmo 10/10 (klein burro precisa SDXL/Gemini paga), formato esticando fix v3.6, engenheiro listando perguntas fix v3.9
Ponte Vídeo: Briefing roteiro → comandos Flow cena a cena — não gera vídeo dentro ainda
Biblioteca: library_items real 8 col + CRUD + categorias EN PT-BR tela
Mídias: assets real 10 col + bucket midias privado + upload + preview signedUrls 3600 + baixar signedUrl 600 âncora invisível + lixeira remove storage+delete banco

## CLIENTES/CAMPANHAS/CRIATIVOS/TRÁFEGO/COBRANÇA/ASSINATURA/DEPLOY/CONFIG/DEPENDÊNCIAS
Clientes CRUD real 12 col tier Enterprise/Growth/Starter status Ativo/Inativo/Em onboarding MRR Excluir confirmação
Campanhas CRUD real 16 col platform Meta/Google/TikTok status Ativa/Pausada/Rascunho budget spend impressions ctr stage Diretor Tráfego IA tecida
Briefings CRUD 10 col status Em Aprovação/Aprovado/Rascunho deadline tags creator Roteirista tecida + Ponte Vídeo
Comerciais CRUD 10 col status Rascunho/Produção/Revisão/Aprovado format Reels/TikTok/Shorts/Feed original limpo gestão produção
Deals CRM kanban real 9 col stage Qualificação/Proposta/Negociação/Fechado
Tráfego v3.0 faseado Olho→Cérebro MVP vivo Diretor Tráfego→Mão sempre confirmação API Meta só após vendas autopilot erra = morte
Cobrança/Assinatura PLANEJADA pós-1º-cliente webhook idempotente → subscriptions → gate + planos Start 397/Max 497/Enterprise 597 lançamento 5 primeiros travam + anual 10×12 nunca desconto L13 PIX primeiro + InfinitePay/PagBank MP BLOQUEADO nome sujo Mateus nunca propor MP contrato 1 pág minuta depoimento falso proibido garantia 14 dias
Deploy Vercel Hobby push main = deploy ~2 min NODE_OPTIONS ipv4first dev pendência cravar no build
Configurações perfil/foto avatars RLS USER_UPDATED
Dependências Next 16.2.12 React 19.2.4 Supabase Radix Tailwind 4 TS 5 eslint 9 6 high severity vulnerabilities

## VERIFICAÇÃO
Build verde 9.0s bancada 25 ago noite lint 1 warning Badge dashboard-view:32 TypeScript strict provas Ctrl+F Python exata
[NAO VERIFICADO]: LP repo privado lp-anuncia não clonado, Supabase produção não acessado, Vercel envs não acessado, 014 original não existe seção 9 MAPA_DE_CACA é oficial, 012_MASTER_COMMAND vazio

## CLASSIFICAÇÃO REALIDADE vs PLANEJAMENTO
[FUNCIONANDO]: Login, proxy porteiro, Dashboard real, Clientes, Campanhas, Briefings, Comerciais, Mídias real, Biblioteca real, Prompts real, CRM kanban, Configurações perfil/foto, IA Studio 5 agentes elite v3.9, Gerador imagem, Salvar Mídias Fase 4, Mesa Texto v6, Mesa Imagens v12.3, Ponte Vídeo comandos Flow, Guia Vivo 11 guias, marca vidro gelo
[PARCIAL]: Sprint 018 linguagem Leva 1 feita resto pendente, LP quase no ar 0,31s
[EM DESENVOLVIMENTO]: 019 Fase 4 + fixes v3.9 aguardando colar+push dono
[PLANEJADA]: Orquestrador 020-A MVP pipeline fixa + Base na rota + Comportamento Perfil Psicológico + Sala Missão, Diretor Criativo, Performance, Oferta & Vendas, CRM & Relacionamento, WhatsApp Meta Cloud API, Checkout/Assinatura, v3.0 Waze tráfego, geração vídeo direta
[QUEBRADA]: Imagem feia amarela pintada (fix v12.3 na bancada mas não colada), Formato esticando (fix v3.6/v3.9 na bancada mas não colado), Engenheiro listando 15 perguntas (fix v3.9 na bancada mas não colado) — tudo 🟢 fixado na bancada build verde 🟡 aguardando colar+push
[NAO VERIFICADA]: LP privada, Supabase produção, Vercel envs
