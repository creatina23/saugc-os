# 📋 PLANO DE IMPLEMENTAÇÃO — ORQUESTRADOR 020-A MVP
**Data: 25 ago 2026 · Baseado no comando verbatim completo que você enviou**
**Regra: PRESERVAR O QUE JÁ FUNCIONA · 1 IA paga aceita desde já (decisão Reunião 2)**

---

## ETAPA ATUAL: AUDITORIA CONCLUÍDA
**TOTAL DE ETAPAS:** 7
**RESTANTES:** 6
**STATUS:** 🟢 Auditoria concluída · 🟡 Plano apresentado · 🔴 Aguardando sua permissão

---

## O QUE VOU IMPLEMENTAR NA 020-A (MVP — PIPELINE FIXA)

### Visão da Reunião 2 (travada):
> Orquestrador nasce em fases A→B→C
> A) pipeline fixa "Produção Completa" (1 botão, determinística)
> B) planejador dinâmico com aprovação humana
> C) revisor + memória de contexto

**Esta entrega é só a Fase A.**

### O QUE É (simples):
Um botão "Produção Completa" no IA Studio (ou nova página /orquestrador) que, com 1 objetivo do usuário, chama 5 agentes em sequência fixa, sem o usuário precisar escolher.

### POR QUE IMPORTA:
Hoje o usuário tem que saber qual agente chamar e em que ordem. Com Orquestrador, ele fala o objetivo e a operação trabalha.

### O QUE VAI MUDAR (técnico, mas sem quebrar nada):

#### 1. Nova rota `/api/orquestrador` (NÃO mexe em /api/ia e /api/imagem)
- Arquivo: `src/app/api/orquestrador/route.ts`
- Função: recebe {objetivo, contexto} → orquestra chamadas internas pra Mesa de Texto (usa mesma lógica da /api/ia, mas com pipeline)
- Preserva: Mesa v6 continua igual, só é chamada 5x em sequência
- Retorna: {perfilPsicologico, estrategia, copy, conceitoCriativo, promptImagem, analise, motorUsado, notas}

#### 2. Base de Excelência muda da tela pra rota (decisão Reunião 2 — item 4)
- Hoje está em `ia-studio-view.tsx` (hardcoded)
- Vai pra `src/lib/base-excelencia.ts` + injetada em TODAS as gerações na rota /api/ia e /api/orquestrador
- Conteúdo: arquétipos Jung, neuromarketing, Cialdini, Kahneman System 1/2, PNL, psicologia do consumidor, etc.
- Risco: baixo — só move de lugar, não altera lógica

#### 3. Novo agente Comportamento Humano como pré-processador
- Arquivo: persona em `src/lib/agentes/comportamento.ts`
- Prompt elite: PAPEL → CONTEXTO → MÉTODO → FORMATO → AUTO-REVISÃO → LEIS (PT-BR, zero clichê)
- Repertório: psicologia comportamental, cognitiva, social, neurociência, vieses, etc. (lista completa do seu comando)
- Saída: "Perfil Psicológico do Público" (JSON estruturado: quem é, o que quer, o que teme, objeções, gatilhos, etc.)
- Salva no banco: nova tabela `perfis_psicologicos` (id, user_id, briefing_id?, perfil JSON, created_at) OU campo JSON em briefings — recomendo tabela nova pra reutilização
- É pré-processador: alimenta todos os outros agentes

#### 4. Novo service `orquestrador-service.ts`
- Arquivo: `src/lib/services/orquestrador-service.ts`
- No barrel `index.ts`: `export * from "./orquestrador-service"`
- Métodos: `producaoCompleta(objetivo, contexto?)` → chama POST /api/orquestrador
- Prova: `producaoCompleta` = 1

#### 5. Sala de Missão UX (cards que acendem)
- Nova página: `src/app/orquestrador/orquestrador-view.tsx` + `page.tsx`
- Ou aba nova no IA Studio (recomendo página separada pra não poluir)
- UX: usuário digita objetivo → clica "Produção Completa" → cards acendem: [Comportamento 🟢] → [Estrategista 🟡] → [Copywriter ⚪] → etc.
- Cada card mostra output parcial + motor que respondeu
- Final: resultado consolidado + botão "Salvar tudo em Biblioteca + Mídias"

#### 6. Preservar IA Studio atual
- IA Studio v3.4 continua funcionando 100% igual
- Orquestrador é ADIÇÃO em `/orquestrador`, não substituição

---

## ARQUITETURA FINAL 020-A

```
Usuário → /orquestrador → orquestrador-service → POST /api/orquestrador
                                      ↓
                              Base de Excelência (injetada)
                                      ↓
                    Comportamento (Perfil Psicológico) → salva no banco
                                      ↓
                    Estrategista (ângulos) → usa perfil
                                      ↓
                    Copywriter (hooks) → usa perfil + estratégia
                                      ↓
                    Diretor Criativo (conceito O QUE criar) → usa tudo anterior
                                      ↓
                    Eng. Prompt (COMO traduzir) → usa conceito
                                      ↓
                    Analista Criativo (nota + melhorias)
                                      ↓
                              Resultado consolidado → Biblioteca + Mídias
```

**5-6 chamadas na Mesa por objetivo** (cota: ~230 img/dia + texto ilimitado free). Com 5 clientes, aperta — medição vira urgente (já anotado em ata).

---

## CONSTITUIÇÃO DOS AGENTES (20 regras — do seu comando)

Todos os agentes seguirão:
1. Não é genérico 2. Especialidade + camadas 3. Compreenda objetivo 4. Considere contexto 5. Identifique restrições 6. Saiba conhecimentos relevantes 7. Não use irrelevante 8-11. Não invente info/funcionalidade/dados/resultados 12-14. Critique-se, ache pontos fracos, gere melhor 15-16. Saiba quando pedir/não pedir ajuda 17-18. Estruture pro próximo, preserve contexto 19. Não descarte decisões sem motivo 20. Resultado real > aparência

+ Meta-cognição: "Estou resolvendo? Existe algo melhor? O que estou deixando de considerar?"

---

## O QUE NÃO VOU FAZER NESTA FASE (preservação)

- ❌ Não vou mexer em /api/ia, /api/imagem, ia-service, imagem-service (só vou CHAMAR eles)
- ❌ Não vou recriar banco, não vou criar mocks/demos
- ❌ Não vou alterar autenticação, RLS, storage
- ❌ Não vou remover IA Studio atual
- ❌ Não vou implementar Diretor Criativo completo, Performance, Oferta, CRM (são 020-B/C e depois)

---

## PLANO DE EXECUÇÃO (7 etapas)

| Etapa | O que | Arquivos | Status |
|---|---|---|---|
| 1 | Auditoria | AUDITORIA_ARQUITETURA_ATUAL.md | 🟢 Concluída |
| 2 | Plano | Este arquivo | 🟡 Aguardando sua permissão |
| 3 | Base de Excelência → rota | `src/lib/base-excelencia.ts` + injetar em `/api/ia/route.ts` | 🔴 |
| 4 | Agente Comportamento | `src/lib/agentes/comportamento.ts` + tabela `perfis_psicologicos` (migration) | 🔴 |
| 5 | Rota Orquestrador | `src/app/api/orquestrador/route.ts` (pipeline fixa) | 🔴 |
| 6 | Service Orquestrador | `src/lib/services/orquestrador-service.ts` + barrel | 🔴 |
| 7 | Sala de Missão UX | `src/app/orquestrador/page.tsx` + `orquestrador-view.tsx` | 🔴 |

**Cada etapa:** prova Ctrl+F + lint + build reais na bancada antes de entregar (6 Barreiras).

---

## RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Cota da Mesa (5-10 chamadas/objetivo) | Alta | Alto | Cache Perfil Psicológico + medição por usuário vira URGENTE + avisar usuário |
| Quebrar IA Studio | Baixa | Alto | Nova rota separada, não alterar ia-service |
| Orquestração ingênua (chamar todos sempre) | Média | Médio | Fase A pipeline fixa determinística, não dinâmica |

---

## PERGUNTA SOBERANA (preciso da sua permissão)

**O QUÊ:** Implementar Orquestrador 020-A MVP com pipeline fixa "Produção Completa" + Comportamento como pré-processador + Base de Excelência na rota + Sala de Missão

**POR QUÊ:** É a Prioridade 1 do seu comando verbatim + decisão da Reunião Soberana nº2 (Orquestrador nasce em fases A→B→C) + fila de batalha aprovada (019 Fase 4 → 020-A)

**BENEFÍCIO:** 1 objetivo → 5 especialistas trabalhando sob mesmo comando → resultado superior à soma (1+1+1 ≠ 3)

**RISCO:** 5-10 chamadas na Mesa por objetivo (cota) — mitigado com cache + medição

**COMO PRESERVAR:** Nova rota /api/orquestrador, novo service, nova página /orquestrador, nova tabela perfis_psicologicos — zero alteração em /api/ia, /api/imagem, IA Studio atual

**POSSO PROSSEGUIR com a 020-A?**

Responda: "les go 020-A" ou "reunião aberta" se quiser ajustar.
