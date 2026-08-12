# 🧠 MEMÓRIA ESTRATÉGICA — AnuncIA

> O cérebro externo do projeto. Toda decisão tomada em "reunião aberta" mora aqui.
> **Regras do arquivo:** nunca deletar histórico (só arquivar em "Decisões antigas") · atualizado sempre que uma decisão nasce · o GPS (`011_CURRENT_MISSION`) diz O QUE fazer hoje; ESTE arquivo diz O QUE FOI DECIDIDO e POR QUÊ.

**Última atualização:** 12 ago 2026 (fechamento da Sprint 016 + reunião relâmpago "Sem internet & Agente no Zap")

---

## 🧭 Visão sistêmica travada

AnuncIA cresce em **ANDARES de um prédio só** (nunca produtos separados):

- **Andar 1 — Fábrica criativa** (production OS): briefings → comerciais → mídias → IA que escreve. **= v2.0 ✅ NO AR (9 ago 2026) · VERDADE TOTAL desde 12 ago (Sprint 016)** · ganha em breve a **Sala de Páginas** (Sprint 017)
- **Andar 2 — Inteligência de tráfego** ("Waze do tráfego"): vê as métricas, diz o que fazer em PT-BR de gente, maximiza vendas até pra quem não sabe tráfego. **= v3.0** (🧠 Cérebro MVP já vivo: Diretor de Tráfego nas Campanhas)

---

## 🏆 Decisões ativas (mais novas no topo)

### 12 ago 2026 — 🏆 Sprint 016 "Verdade total + Celular" NO AR

- **016a Dashboard real** ✅ (KPIs/canais/funil/atividades tudo calculado do banco; "Trajetória" cenográfica aposentada) · **016b Modo celular** ✅ (viewport oficial, régua 17px, kanban trilho-com-ímã, tabelas que rolam) · **016c Foto de perfil** ✅ (bucket `avatars`; aparece nos 3 pontos; USER_UPDATED reflete sozinho) · **016d Varredura** ✅.
- **Sentenças da varredura:** seletor de workspace e sininho SAÍRAM DE CENA (voltam reais: workspace com os planos no lançamento · sininho como central de novidades lendo o banco, sprint futura) · selo "Operacional" agora honesto (🟢 real / 🟠 demo) · Mídias e IA Studio APROVADAS sem retoque. **Cenográficos no app: ZERO.**
- **Porteiros trabalharam de verdade:** pegaram 2 bombas antes da vitrine — ① `AvatarUsuario` declarado dentro do AppShell (lei nova do ESLint `react-hooks/static-components`: componente dentro de componente é proibido — mora no módulo, recebe props) ② `crm-view.tsx` TRUNCADO na linha 384 por fissura de colagem da 016b (metade de baixo nunca existiu no disco) → metade inferior reconstruída pelo copiloto; desvio declarado: EmptyState/Tooltip saíram (API incerta às cegas), dica vira `title` nativo.
- **Regra nova da cola longa:** depois de colar, conferir se a ÚLTIMA linha entregue existe no arquivo. O lint pegou o corte — mas a prova de fim-de-arquivo pega na hora.
- 🐕 **Dogfooding aberto 12 → 26 ago:** Cliente Zero opera de verdade todo dia dentro do AnuncIA · atrito/bug = anota no diário de bordo e chama o copiloto, NUNCA conserta sozinho · 26 ago = reunião de balanço → abre a 017 com dados reais.

### 12 ago 2026 — Reunião relâmpago "Sem internet & Agente no Zap" (TRAVADA)

- **Offline real 100% = DESCARTADO PRA SEMPRE.** A nuvem É o produto: mesma verdade no PC e no celular, backup automático, multi-dispositivo. Sem internet o app degrada com dignidade (proxy blindado + modo demonstração) — já está no ar e é o bastante. (Resposta ao "por que localhost:3000 pede internet": casca roda local; cofre/login/IA/fotos moram na nuvem de propósito.)
- **Agente de vendas no WhatsApp: SIM — 100% nuvem, R$ 0/mês, PC desligado.** Arquitetura travada: cliente chama → **Meta WhatsApp Cloud API** (oficial) → **webhook na Vercel** → **Gemini** (a Mesa de Motores da 017 empresta a cadeia de reserva) → **Supabase** guarda memória do lead → resposta volta pelo mesmo caminho. Custo: R$ 0/mês + chip pré-pago ~R$ 15 uma vez (ou número de teste grátis da Meta pra desenvolver).
- **Pegadinhas mapeadas:** o número vira da API (não dá pra usar o WhatsApp pessoal — chip separado) · janela de 24h (responder quem chamou = grátis; disparar propaganda ativa = pago por mensagem) · handoff humano obrigatório ("chama humano" quando o lead esquenta) · **Evolution API / Baileys PROIBIDO** (fere os termos = risco de banimento do número + precisa de servidor ligado 24h — justamente o que queremos evitar).
- **Justificativa de fila:** já é promessa visível no app (Configurações → Integrações: "WhatsApp Cloud API — Em breve") → construí-la DEPOIS do lançamento também cumpre a tela. **Candidata #1 a sprint pós-lançamento.**

### 9 ago 2026 — 🏁 v2.0 "100% UTILIZÁVEL" NO AR

- Push final da Sprint 015 confirmado + vitrine aprovada: Configurações reais · IA tecida (Roteirista no Briefing → Comerciais · Diretor de Tráfego nas Campanhas → Biblioteca) · Excluir cliente · proxy blindado · língua polida.
- **Marca oficial TRAVADA: "vidro gelo"** 🧊 — A 3D com olho de IA, degradê azul→violeta, escolhida e refinada pelo dono (minimalista no login; "tire comando em expansão"; "+40% login / +30% lateral"; 1 quadrado só). Arquivo em `public/logo-anuncia.png` + `src/app/icon.png`. SVG "A-com-raio" aposentado · conceito "Saturno" estacionado.
- **Voz da marca travada:** "central de comando" (barra lateral) · "Abra as portas do seu centro de comando." (login) · rodapé "Acesso restrito · Dados protegidos por criptografia".
- **Regra de Ouro v2** nasceu do bug do "U" de UGC: arquivo COMPLETO sempre; Replace All só texto puro; "0 resultados = pula e anota".
- **Duas contas no Supabase**: o app mora na conta principal (4 clientes). Regra de bolso: Configurações → Perfil mostra o e-mail logado. Limpeza da secundária = estacionada.

### 9 ago 2026 — Reunião "Páginas & Motores" (TRAVADA)

- **Arquiteto de Páginas (Sprint 017):** AnuncIA NÃO hospeda — ela gera. Entregável DUPLO travado: (a) **Prompt Mestre** de alta conversão (colar em builder tipo Lovable) + (b) **`index.html` pronto** pra subir em hospedagem tradicional (Hostinger/Hostgator/LocalWeb). Fase "publicar/hospedar" **APOSENTADA** → substituída pelo **Guia de Subida** (3 passos por hospedagem, texto no app). Mata o fosso caro do Lovable.
- **Campos do agente:** base (oferta+público puxados do briefing · botão WhatsApp/checkout · cor da marca · Pixel da Meta opcional) + acréscimos aprovados pra escolha na 017: objetivo da página (⭐ vender direto/levar pro WhatsApp/captar contato) · preço âncora+parcela (⭐ BR decide por parcela) · garantia (selo automático) · depoimentos · urgência c/ contador · VSL YouTube · tom de voz (4 botões). Filosofia: cada pergunta a menos = um cliente a mais terminando.
- **Monetização:** cota de páginas por plano (Starter/Pro/Enterprise) = alavanca de upgrade.
- **Mesa de Motores (Sprint 017):** cadeia de reserva Gemini → GitHub Models ("GPT-4o grátis", 50–150 req/dia) → Groq (~14,4 mil req/dia) → OpenRouter (~28 modelos free). **Fato 2026: Claude e OpenAI direto NÃO têm cota grátis de API** (só ~US$5 de trial) — sem orçamento pago, ficam fora.
- **Fila travada na mesa:** push v2.0 ✅ → Sprint 016 ✅ (12 ago) → dogfooding 2 semanas (EM CURSO) → Sprint 017 → lançamento.

### 5 ago 2026 — Tráfego inteligente: SIM, dentro do AnuncIA, faseado

- **Não será produto novo.** Mesmo ICP, mesma infra (Next + Supabase + Gemini já integrada e paga).
- **Conceito:** "Waze do tráfego" — não ensina engenharia de trânsito; diz *"vire aqui, radar à frente"* em PT-BR de gente.
- **3 motores:** 👁️ Olho (APIs Meta/Google/TikTok + conversões Hotmart/Logzz via webhook) · 🧠 Cérebro (Gemini + regras fixas → diagnóstico + "3 ações de hoje") · ✋ Mão (executa ações — só no fim, sempre com confirmação antes de tocar no dinheiro).
- **Sequência travada:** Cérebro primeiro (manual) → Olho depois (API) → Mão por último. **🧠 MVP do Cérebro = Diretor de Tráfego — ✅ VIVO desde a Sprint 015c.**
- **Burocracia adiada de propósito:** API do Meta exige revisão de app (semanas) → só depois das primeiras vendas bancarem.
- ⚠️ Risco lembrado: autopilot que erra queima dinheiro do cliente = morte reputacional. Fases da Mão: sugere → sugere com botão de confirmar → age sozinho.

### Decisões anteriores (vivas, registradas no GPS e CHANGELOG)

Oferta full travada (R$ 9.997 ou 12× R$ 997 + R$ 497/mês) · Cliente-Fundador estacionado · dogfooding: usuário = Cliente Zero · modelo de IA fixado gemini-3.6-flash · IPv6 cravado no dev · PT-BR da tela = contrato · Verdade na tela · Modo Soberano

---

## 🎛️ Gatilhos de comando

| Gatilho | Efeito |
|---|---|
| les go | começa a sprint |
| deu certo | missão confirmada |
| segue o baile | retoma do ponto exato |
| só se for agora | Modo Sexta-Feira |
| abre o roadmap | o que fazer hoje |
| INICIAR FASE EDUCAÇÃO E LANÇAMENTO | fase futura de curso |
| reunião aberta / começar reunião | pausa o código → estratégia (Modo Soberano) |
| re | volta pro projeto com recapitulação de 3 linhas |

---

## 📍 Ponto de retomada (atualizado sempre que pausamos)

**12 ago 2026** — 🏆 Sprint 016 NO AR + papelada fechada (CHANGELOG v1.7 / GPS v2.7 / esta Memória). **AGORA É DOGFOODING**: até 26 ago, a operação real roda dentro do AnuncIA (Cliente Zero). Ciclo diário: usar de verdade → anotar atrito no diário de bordo → chamar o copiloto quando doer. Dia 26 ago: reunião de balanço → "les go" na Sprint 017 "PODER TOTAL".

---

## 🅿️ Estacionamento (pendências sem sprint dona, do mais antigo pro mais novo)

1. Domínio `useanuncia.com.br` (livre em 30/07; compra adiada — instruções no GUIA_DE_OPERACAO §7)
2. `iaService`: ligar no barrel `@/lib/services`
3. Cravar `NODE_OPTIONS=--dns-result-order=ipv4first` no script "build" do package.json
4. Ping semanal no Supabase (hibernação do plano Free)
5. Oferta Cliente-Fundador (5 vagas, R$ 297/mês) — estacionada até o sistema completo
6. Fase EDUCAÇÃO E LANÇAMENTO — aguardando gatilho
7. Limpar dados/conta secundária no Supabase (Authentication → Users → Delete user; query de limpeza ofertada)
8. "Zona de perigo" real nas Configurações (excluir conta) — desenhar com cuidado
9. Coluna fóssil `results` em `campaigns` (morta, sem dono — apagar em qualquer blindagem futura)
10. Conceito de logo "Saturno" (anel) — variante mostrada, não escolhida; vidro gelo venceu
11. Claude/OpenAI direto na Mesa de Motores — só se um dia houver orçamento pago (sem tier grátis de API)
12. **Agente de vendas WhatsApp — candidata #1 pós-lançamento** (arquitetura travada na decisão de 12 ago acima)
13. **Offline real 100% — descartado definitivamente** (a nuvem É o produto; degradação digna já no ar cobre o caso)
14. Faxina do warning `Badge` ocioso em `dashboard-view.tsx` (resolve em qualquer toque futuro no arquivo)
15. Retorno REAL do sininho (central de novidades lendo clientes/campanhas/negócios recentes) e do seletor de workspace (quando existirem planos de verdade) — pós-lançamento

---

## 🤝 Como a memória funciona (compromissos do copiloto)

1. **Toda decisão nova** → este arquivo atualizado na hora (versão completa pra colar, nunca micro-edição)
2. **Todo "re"** → recapitulação de 3 linhas antes de continuar qualquer missão
3. **Fechamento de sprint** → GPS + Memória commitados juntos
4. **"abre o roadmap"** → resposta puxada DESTE arquivo, não da memória solta