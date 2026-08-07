# 🧠 MEMÓRIA ESTRATÉGICA — AnuncIA

> O cérebro externo do projeto. Toda decisão tomada em "reunião aberta" mora aqui.
> **Regras do arquivo:** nunca deletar histórico (só arquivar) · atualizado sempre que uma decisão nasce · o GPS (`011_CURRENT_MISSION`) diz O QUE fazer hoje; ESTE arquivo diz O QUE FOI DECIDIDO e POR QUÊ.

**Última atualização:** 5 ago 2026 (fechamento da Sprint 014)

---

## 🧭 Visão sistêmica travada

AnuncIA cresce em **ANDARES de um prédio só** (nunca produtos separados):

- **Andar 1 — Fábrica criativa** (production OS): briefings → comerciais → mídias → IA que escreve. **= v2.0 (resta 1 mock: Configurações)**
- **Andar 2 — Inteligência de tráfego** ("Waze do tráfego"): vê as métricas, diz o que fazer em PT-BR de gente, maximiza vendas até pra quem não sabe tráfego. **= v3.0**

---

## 🏆 Decisões ativas (mais novas no topo)

### 5 ago 2026 — Tráfego inteligente: SIM, dentro do AnuncIA, faseado

- **Não será produto novo.** Mesmo ICP, mesma infra (Next + Supabase + Gemini já integrada).
- **Conceito:** "Waze do tráfego" — não ensina engenharia de trânsito; diz *"vire aqui, radar à frente"* em PT-BR de gente.
- **3 motores:** 👁️ Olho (APIs Meta/Google/TikTok + conversões) · 🧠 Cérebro (Gemini + regras fixas → "3 ações de hoje") · ✋ Mão (ações — só no fim, sempre com confirmação antes de tocar no dinheiro)
- **Sequência travada:** Cérebro primeiro (manual) → Olho depois (API) → Mão por último.
- **MVP do Cérebro:** agente **"Diretor de Tráfego"** — usuário cola métricas do Gerenciador, IA devolve o relatório do gestor sênior. Alvo: Sprint 015 / v2.5.
- **Semente plantada:** tabela `campaigns` nasceu com métricas no DNA (investimento, impressões, cliques, conversões, receita, meta de ROAS).
- ⚠️ Autopilot que erra queima dinheiro do cliente = morte reputacional.

### Decisões anteriores (vivas, no GPS e CHANGELOG)

Oferta full travada (R$ 9.997 ou 12× R$ 997 + R$ 497/mês) · Cliente-Fundador estacionada · dogfooding: usuário = Cliente Zero · gemini-3.6-flash · IPv6 · PT-BR da tela = contrato · Verdade na tela · Modo Soberano

---

## 🎛️ Gatilhos de comando

| Gatilho | Efeito |
|---|---|
| les go | começa a sprint |
| deu certo | missão confirmada |
| só se for agora | Modo Sexta-Feira |
| abre o roadmap | o que fazer hoje |
| INICIAR FASE EDUCAÇÃO E LANÇAMENTO | fase futura de curso |
| **reunião aberta** (5 ago 2026) | pausa o código → estratégia, dúvidas, decisões (Modo Soberano) |
| **re** (5 ago 2026) | volta pro projeto no ponto exato |

---

## 📍 Ponto de retomada

**5 ago 2026 (noite)** — Sprint 014 FECHADA (Biblioteca + Prompts reais, baú da IA reconectado). Mocks restantes: **1 (Configurações)**. Próximo: Sprint 015 — IA tecida ("Gerar a partir do briefing", agente Diretor de Tráfego) + Configurações real → 🏁 v2.0.

---

## 🅿️ Estacionamento (pendências sem sprint dona)

1. login `traduzErro`: mapear "Invalid API key" → PT-BR
2. `proxy.ts`: try/catch em `getUser()`
3. `iaService`: ligar no barrel `@/lib/services`
4. Cravar NODE_OPTIONS no script "build"
5. Fiapo `erroAcao` sem uso em campanhas-view (remover na próxima edição)
6. Providers de IA sob demanda: Groq / GitHub Models / OpenRouter / Pollinations (~30 min cada, só route)
7. Ping semanal no Supabase (hibernação do plano Free)
8. Oferta Cliente-Fundador (5 vagas, R$ 297/mês) — estacionada
9. Fase EDUCAÇÃO E LANÇAMENTO — aguardando gatilho

---

## 🤝 Como a memória funciona (compromissos do copiloto)

1. **Toda decisão nova** → este arquivo atualizado na hora (versão completa pra colar, nunca micro-edição)
2. **Todo "re"** → recapitulação de 3 linhas antes de continuar qualquer missão
3. **Fechamento de sprint** → GPS + Memória commitados juntos
4. **"abre o roadmap"** → resposta puxada DESTE arquivo, não da memória solta