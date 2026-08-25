🧠 MEMÓRIA ESTRATÉGICA — AnuncIA
O cérebro externo do projeto. Toda decisão tomada em "reunião aberta" mora aqui.
Regras do arquivo: nunca deletar histórico (só arquivar em "Decisões antigas") · atualizado sempre que uma decisão nasce · o GPS (011_CURRENT_MISSION) diz O QUE fazer hoje; ESTE arquivo diz O QUE FOI DECIDIDO e POR QUÊ.

Última atualização: 20 ago 2026 — Protocolo de Linguagem incorporado + Sprint 018 aberta (papelada Bloco A+B no mesmo dia)

🧭 Visão sistêmica travada
AnuncIA cresce em ANDARES de um prédio só (nunca produtos separados):

Andar 1 — Fábrica criativa (production OS): briefings → comerciais → mídias → IA que escreve. = v2.0 ✅ (9 ago) · VERDADE TOTAL (12 ago) · Mesa de Motores + Ponte do Vídeo + Guia Vivo (13 ago) · Sprint 018 (linguagem) EM CURSO
Andar 2 — Inteligência de tráfego ("Waze do tráfego"): métricas → diagnóstico em PT-BR de gente → ação. = v3.0 (🧠 Cérebro MVP vivo: Diretor de Tráfego)
🏆 Decisões ativas (mais novas no topo)
23 ago 2026 — DIRETIVA "COPILOTO IMPLACÁVEL" + PROGRAMA ESPECIALISTAS DE ELITE
Dono decreta: copiloto sempre no máximo da inteligência, ativando qualquer habilidade necessária; as IAs por trás dos serviços do AnuncIA têm que ter SUPER HABILIDADES — sempre o melhor resultado possível.
Verdade do copiloto (registrada com franqueza): não existe auto-upgrade mágico do modelo — o modo implacável é DISCIPLINA + FERRAMENTAS + FATO, todos já em lei: ① compilação obrigatória na bancata ② provas de máquina ③ fact-check de web antes de prometer ④ análise do pedido antes de fazer ⑤ zero rascunho ⑥ verificação de produção pós-deploy.
PROGRAMA "ESPECIALISTAS DE ELITE" (a parte REAL da diretiva): upgrade dos prompts/personas de TODOS os agentes da casa (Roteirista, Diretor de Tráfego, Estrategista, Copywriter, Analista Criativo, Engenheiro de Prompts, enriquecedor de imagem → "Diretor de Arte") com arquitetura de prompt elite: PAPEL → CONTEXTO → MÉTODO → FORMATO DE SAÍDA → AUTO-REVISÃO → LEIS DA CASA (PT-BR, zero clichê da lista 018, zero promessa de renda) + laço executor→revisor nas entregas críticas + rubrica numérica do Analista turbinada. Fundação direta pro Orquestrador (020). Abre com a cola dos arquivos de agentes do ia-studio/briefings/campanhas.
↳ REALOCAÇÃO DECIDIDA PELO DONO (23 ago): o gerador de imagem SAI do Comercial e mora SÓ no IA Studio ("no comercial tá desconectado" — decisão acatada e registrada: Comercial = gestão da produção; IA Studio = bancada de criação). Fluxo travado: Engenheiro de Prompts cria o prompt → usuário cola/edita no Gerador de Imagem → gera (formato, referência ≤512, diagnóstico). Comerciais-view revertido ao estado original.
20 ago 2026 (noite) — REUNIÃO SOBERANA nº 1: Sprint 019 "FÁBRICA DE ESTÁTICO" aprovada e DESATRAVANCADA (entra ANTES de terminar a 018)
Decisão: geração de imagem/post NATIVA no produto (não só prompts) — escolha (b) "quero antes": a 019 pula a fila; as levas de linguagem da 018 terminam depois.
Fatos 2026 verificados: Gemini/Nano Banana API free NÃO gera imagem (app consumidor dá ~20/dia; API = 429; pago ~US$ 0,03–0,13/img) · Cloudflare Workers AI (FLUX) = campeão grátis: 10.000 neurônios/dia ≈ 230 imagens/dia, reset 00:00 UTC, conta free · Hugging Face fraco (~83 img/MÊS) · Pollinations = hobby (marca d'água, sem SLA).
Arquitetura travada (padrão da casa): rota server /api/imagem (espelho da /api/ia) · Mesa de Imagens: Cloudflare FLUX titular → reserva Gemini paga DESLIGADA por padrão (liga quando cliente pagar) · chaves novas nos 2 cofres: CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN (nunca no chat — L8) · botão "Gerar imagem" no Comercial/Briefing → preview → salva em Mídias + Biblioteca · formatos 1:1, 4:5, 9:16.
Cotas: as "gerações/mês" dos planos passam a contar texto + imagem. ⚠️ A cota free é da CASA (~230/dia totais), não por usuário — com 5 clientes ativos aperta: medição real (Sprint de assinatura) sobe de importante pra URGENTE.
Escopo honesto: GERAR = sim · PUBLICAR direto (Meta/Instagram API) continua estacionado (revisão de app, semanas — decisão de 5 ago).
Sequência da sprint: espelhar padrão da /api/ia → service no barrel → UI nos Comerciais/Briefings → Storage Mídias → porteiros → LP ganha "gera aqui dentro" SÓ depois de no ar (regra 30).
🛡️ 5ª BARREIRA (23 ago, decretada pelo dono): LEI DA ENTREGA CASADA — visão de águia, astúcia de raposa, zero erro-cascata no tempo do dono. Nenhum arquivo viaja sozinho quando depende de outro. Toda entrega é PACOTE: ① lista completa de arquivos do passe ② prova de dependência de 10s (Ctrl+F) ANTES do build de 96s — se falha, baixa o combo ③ previsão de cascata declarada (quem mais importa isso? que env precisa? e se aplicar PELA METADE?) ④ bancata compila os arquivos REAIS juntos (stubs só pro que não temos) ⑤ anuncia/codigo/VERSOES.md = mapa de versões + cartão de sincronia (7 Ctrl+F) pra matar skew de versão antes que o build descubra. Padrão: o build do dono é cerimônia de vitória, nunca descoberta de erro. ➕ Formato de entrega (23 ago, decisão do dono): SEM ZIP — cada arquivo é entregue INDIVIDUALMENTE na tela (download direto, um por vez).
🛡️ 6ª BARREIRA (23 ago, após "vc está vacilando muito — resolva isso"): A BANCATA EXECUTA OS PORTEIROS. O repo COMPLETO do app mora na bancata (ZIP do GitHub — seguro por construção: .env.local nunca vai pro GitHub). Toda entrega de código passa por npm install + npm run lint + npm run build REAIS na bancata ANTES de ir pro dono. Erros de tipo/build/execução morrem AQUI. Runtime com chaves continua protegido pelos painéis de diagnóstico ("Detalhe técnico" + resumo da fila). Localhost do dono = opcional, nunca dever de QA. Toda informação e toda instrução sai do copiloto revisada por máquina — 4 barreiras obrigatórias: ① código compila na bancata (tsc strict) · ② provas de Ctrl+F geradas por CONTAGEM EXATA de script (nunca de memória; shell com aspas frágeis não serve — usar Python) · ③ instrução revisada antes de pedir (caminho, nome de arquivo, comando conferidos) · ④ zero rascunho — se não passou nas barreiras, não chega ao dono.
Reunião: LP no ar (lp-anunc-ia.vercel.app) · caça em pausa ("ativar modo caça") · dogfooding balanço 26 ago segue.
➕ POLÍTICA DE PREÇOS TRAVADA (mesma reunião, decisão do dono): 397/497/597 intocados · **Enterprise R
597
=
P
R
E
C
\c
O
D
E
L
A
N
C
\c
A
M
E
N
T
O
d
e
c
l
a
r
a
d
o
∗
∗
—
o
s
5
p
r
i
m
e
i
r
o
s
c
l
i
e
n
t
e
s
t
r
a
v
a
m
p
r
a
s
e
m
p
r
e
;
d
e
p
o
i
s
s
o
b
e
p
r
a
R
597=PRE 
C
\c
​
 ODELAN 
C
\c
​
 AMENTOdeclarado∗∗—os5primeirosclientestravamprasempre;depoissobepraR 697–897 · PLANO ANUAL criado: pague 10, use 12 (2 meses grátis, preço travado, válido pros 3 planos) · nunca desconto (L13) · LP já atualizada (selo ⚡ + faixa anual), pendente git push do dono.
➕ DECISÃO EM SEQUÊNCIA (mesma reunião): SPRINT 020 — "ORQUESTRADOR" na fila, logo após a 019. O articulador central das IAs (interpreta → planeja → [usuário aprova] → executa especialistas → revisa → consolida). Arquitetura: texto orquestrando texto na mesma Mesa, R$ 0/mês. Nasce em fases: A) pipeline fixa "Produção Completa" (1 botão, determinística) · B) planejador dinâmico com aprovação humana · C) revisor + memória de contexto. ⚠️ Avisos em ata: orquestração ingênula quebra (fases são obrigatórias) · 1 objetivo = 5-10 chamadas (cotas/medição ainda mais urgentes) · recomendação do copiloto: 019 → 020-A → fechar 018 → 020-B/C. Lei v3.0 mantida: recomenda, nunca decide pelo dono. LP só vende "Um comando, várias inteligências" como orquestrador real DEPOIS de existir (regra 30).
20 ago 2026 — PROTOCOLO DE LINGUAGEM incorporado + Sprint 018 "COMANDO EM EXPANSÃO" aberta (TRAVADO)
Protocolo externo de comunicação triado (docs/017): ~80% já era a alma da casa (L0/L9, voz "central de comando" de 9 ago). 6 conflitos mapeados e sentenciados pelo dono:
Timing: APLICAR TUDO AGORA (contra recomendação do copiloto). ⚠️ Aviso em ata: a caça segue com ritual mínimo de 45 min/dia e o balanço do dogfooding em 26 ago continua de pé — se a copy comer a caça, o copiloto cobra. ↳ ATUALIZADO (20 ago, noite): dono PAUSOU a caça — cobrança só no gatilho "ativar modo caça" (ou pergunta eventual do copiloto em reunião). Balanço do dogfooding 26 ago segue de pé.
Hero híbrido: LP vende na DOR ("briefing → anúncio pronto em 10 min"); "Comando em expansão / SO de crescimento com IA" reina DENTRO do app e nas seções de contexto da LP.
💰 PLANOS REABERTOS pelo dono: a LP terá Implantação + 3 modelos de assinatura (Start R
397
/
M
a
x
P
r
e
m
i
u
m
R
397/MaxPremiumR 497 / Enterprise R$ 597 — nomes do dono, desvio da Lei da Língua aceito). Semântica travada (20 ago, noite): DUAS PORTAS — COMPRA (implantação personalizada pra empresa, sob medida, 5 vagas/mês) × ASSINATURA (pacotes prontos, sem fidelidade). Assinou, usa direto — implantação é opcional. Regras: preços definidos pelo dono ANTES de publicar (regra 30); checkout automático continua pós-1º-cliente (venda manual no começo); cotas reais nascem na Sprint de assinatura.
Orquestrador: não existe no código — na tela só entra o que existe (Roteirista, Diretor de Tráfego, IA Studio, Mesa); "cérebro que coordena" = visão futura rotulada.
CTA público: "Começar a expandir" não vira cadastro (CADASTRO_ABERTO=false) — CTA público = demo no zap.
Nomenclatura: muda rótulo de tela, NUNCA chave de código/banco/rota (L6).
Sistema de Linguagem v1 = docs/018 — governa toda copy daqui pra frente (vocabulário, nomenclatura de módulos, CTAs, fórmulas de microcopy, hierarquia por tela).
Fluxo de código travado (reafirmado pelo dono): copiloto pede o arquivo → dono cola no chat → copiloto devolve COMPLETO → dono cola no VS Code. Nunca pedaços. (L2)
🗺️ MAPA DE MERCADO — 8 grupos (20 ago, noite): ① Agências (todos os tipos) · ② Profissionais de marketing · ③ Criadores/conteúdo · ④ Vendas & aquisição · ⑤ Empresários/negócios locais · ⑥ E-commerce · ⑦ Infoprodutores/especialistas · ⑧ Multi-cliente ⭐ (nicho comercial nº 1: "uma central pra operar seus clientes"). Posicionamento travado: hero FOCADO (agências + gestores + multi-cliente), amplitude mora na seção "pra quem é" — "serve pra todo mundo" no hero mata valor. Frase oficial: "Feito para quem transforma marketing em operação." Conceito "modos de operação" (AGÊNCIA/MARKETING/CRIATIVO/TRÁFEGO/EMPRESA/E-COMMERCE) = um núcleo, vários mercados — candidato a feature real (seletor de modo no onboarding) quando os planos existirem.
Sprint 018 em 6 levas: login/shell → Central → menu/títulos → estados vazios → IA Studio/guias → LP (com os 3 planos).
13 ago 2026 — Sprint 017 Leva 1 NO AR + Opção C + caça aberta
Mesa de Motores 4/4 ARMADA: Gemini → GitHub Models → Groq → OpenRouter · chaves nos 2 cofres (server-only) · espelho GET /api/ia confessando.
IA Studio vivo (selos reais, motor no histórico) + Ponte do Vídeo (roteiro → comandos pro Flow, cena a cena) + Guia Vivo (11 guias no app).
🏆 OPÇÃO C — Sala de Páginas DESLIZADA pro pós-1º-cliente (L13). Não reabrir sem reunião soberana.
Caça ao 1º cliente ABERTA (D+1→D+14): 10 contatos/dia, demo 15 min com WOW de 60s, meta 1 cliente. Sem disparo em massa. Mapa = docs/013.
Fila pós-017: lançamento → checkout (pós-1ª venda) → pós-lançamento (agente zap #1) → v3.0.
13 ago 2026 — Recebimento, kit de venda e continuidade (TRAVADO)
PIX primeiro (entrada R$ 4.998,50 na call) · 12× via InfinitePay/PagBank · ⚠️ Mercado Pago BLOQUEADO pra Mateus (nome sujo) — nunca propor. MEI depois do 1º cliente.
Contrato de implantação 1 pág. ✅ (v2 redigida → docs/015) · depoimento falso PROIBIDO (piloto-de-depoimento + prova de mecanismo + garantia cobrindo ausência de prova).
Pricing: cliente recorrente ≈ +R$ 45–72 mil de valuation. Continuidade: comando de re-criação do copiloto criado (o projeto não depende da memória de UM agente).
13 ago 2026 — Comando Mestre externo TRIADO
60% já era lei · 25% absorvido em docs (decisão: 5 docs vivos > 35 mortos) · 15% conflito resolvido (mock selado mantém; sem tiers na época — ⚠️ superado em parte em 20 ago: o dono reabriu 3 planos de assinatura pra LP; tiers de PRODUTO/entitlements continuam pós-lançamento). Triagem completa = docs/016.

12 ago 2026 — 🏆 Sprint 016 "Verdade total + Celular" NO AR
Dashboard real · modo celular · foto de perfil · varredura honesta (selo 🟢/🟠, cenográficos ZERO) · cicatrizes: AvatarUsuario no módulo (ESLint), crm-view truncado na 384 (prova de fim-de-arquivo nasceu) · dogfooding 12→26 ago aberto.

12 ago 2026 — Reunião relâmpago "Sem internet & Agente no Zap" (TRAVADA)
Offline 100% descartado pra sempre (a nuvem É o produto) · Agente WhatsApp: Meta Cloud API + webhook Vercel + Gemini + Supabase, R$ 0/mês, chip separado, Evolution/Baileys PROIBIDO · candidata #1 pós-lançamento.

9 ago 2026 — 🏁 v2.0 NO AR + marca travada
Marca "vidro gelo" 🧊 + voz "central de comando" (lateral) + login "Abra as portas do seu centro de comando." · Regra de Ouro v2 (bug do "U" de UGC) · duas contas Supabase (regra de bolso: Perfil mostra o logado).

9 ago 2026 — Reunião "Páginas & Motores" (TRAVADA — parcialmente superada pela Opção C)
Arquiteto de Páginas: gera, não hospeda (deslizado) · Mesa de Motores: ENTREGUE 13 ago · Fato 2026: Claude/OpenAI sem tier grátis de API.

5 ago 2026 — Tráfego inteligente (v3.0 faseado)
"Waze do tráfego": 👁️ Olho → 🧠 Cérebro (MVP vivo) → ✋ Mão (sempre com confirmação) · API do Meta só após vendas · autopilot que erra = morte reputacional.

Decisões anteriores (vivas, registradas no GPS e CHANGELOG)
Oferta travada (R
9.997
o
u
12
×
R
9.997ou12×R 997 + R$ 497/mês) · Cliente-Fundador estacionada · modelo IA autodescoberto · PT-BR da tela = contrato · Verdade na tela · Modo Soberano

🎛️ Gatilhos de comando
Gatilho	Efeito
les go	começa a sprint
deu certo	missão confirmada
segue o baile	retoma do ponto exato
só se for agora	Modo Sexta-Feira
abre o roadmap	o que fazer hoje
papelada	docs pendentes (CHANGELOG/GPS/Memória)
organiza o comando	triagem de comando externo
reunião aberta	Modo Soberano
re	recap 3 linhas
ativar modo caça	dono retoma a caça — copiloto volta a cobrar placar diário
fim de trampo	encerra o dia: relatório completo + comando de re-criação do copiloto (continuidade em qualquer IA)
iniciar trampo	retoma: atualização de tudo que falta + próximo passo único
NO AR (caça)	CLIENTE FECHOU — comemorar + Sprint de implantação
📍 Ponto de retomada (atualizado sempre que pausamos)
20 ago 2026 — Sprint 018 "COMANDO EM EXPANSÃO" ABERTA (decisão soberana: aplicação FULL da nova linguagem; caça em paralelo de 45 min/dia; 26 ago = balanço). Ação imediata: Leva 1 — pedir a cola de src/app/login/page.tsx e devolver completo. Papelada Bloco A+B + docs 017/018 prontos pra colar (PASSE_DE_ENTREGA atualizado). Preços dos 3 planos: definir antes da Leva 6 (LP).

🅿️ Estacionamento (pendências sem sprint dona, do mais antigo pro mais novo)
Domínio useanuncia.com.br — R$ 40/ano fixo (verificado 20 ago) · compra adiada
iaService no barrel ✅ QUITADO (017)
Cravar NODE_OPTIONS ipv4first no "build"
Ping semanal Supabase
Oferta Cliente-Fundador — estacionada
Fase EDUCAÇÃO E LANÇAMENTO — aguardando gatilho
Limpar conta secundária Supabase
"Zona de perigo" (excluir conta) nas Configurações
Coluna fóssil results em campaigns
Logo "Saturno" — não escolhido
Claude/OpenAI na Mesa — só com orçamento
Agente WhatsApp — candidata #1 pós-lançamento
Offline 100% — descartado
Faxina Badge (dashboard-view:32)
Sininho/workspace reais — pós-lançamento
docs/014_PLANO_D1_D14 — aguardando original (copiloto lembra no próximo relatório)
Original do Comando Mestre — upload veio vazio; reenviar só se quiser arquivar
Faxina algo2() em api/ia/route.ts
Preços dos 3 planos ✅ DEFINIDOS 20 ago: **Start R
397
⋅
M
a
x
P
r
e
m
i
u
m
R
397⋅MaxPremiumR 497 · Enterprise R
597
∗
∗
+
I
m
p
l
a
n
t
a
c
\c
a
~
o
R
597∗∗+Implanta 
c
\c
​
  
a
~
 oR 9.997/12× R$ 997 (nomes dos planos: confirmação pendente — Lei da Língua)
🤝 Como a memória funciona (compromissos do copiloto)
Toda decisão nova → este arquivo atualizado na hora (versão completa, nunca micro-edição)
Todo "re" → recap 3 linhas antes de continuar
Fechamento de sprint → GPS + Memória commitados juntos
"abre o roadmap" → resposta puxada DESTE arquivo