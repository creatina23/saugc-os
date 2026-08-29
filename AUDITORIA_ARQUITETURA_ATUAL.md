# 🔍 AUDITORIA DA ARQUITETURA ATUAL — ANUNCIA
**Data: 25 ago 2026 · Comando: Expansão da Arquitetura de Inteligência (verbatim completo)**
**Regra Absoluta: PRESERVAR O QUE JÁ FUNCIONA**

---

## 1. AGENTES EXISTENTES (5)

| # | Agente | Onde vive | Persona | Status |
|---|---|---|---|---|
| 1 | Estrategista IA | ia-studio-view.tsx agents[0] | "especialista em marketing de resposta direta e mídia paga no Brasil. Ângulos de venda, posicionamentos e big ideas" | ✅ Vivo, com selo motor real |
| 2 | Copywriter IA | agents[1] | "direct response. hooks, headlines e CTAs curtos, específicos" | ✅ |
| 3 | Roteirista UGC IA | agents[2] | "Roteiros UGC em cenas (Hook 0-3s, dor, demonstração, prova, oferta+CTA)" | ✅ + Ponte do Vídeo (comandos pro Flow) |
| 4 | Engenheiro de Prompts IA | agents[3] | "Prompts detalhados para geradores de imagem e vídeo (estilo, luz, enquadramento, câmera, clima)" | ✅ Multimodal (produto/pessoa/publicidade/mundo visual/vídeo) |
| 5 | Analista Criativo IA | agents[4] | "Avalie material com nota 0-10, justificativa, 3 pontos fortes e 3 melhorias" | ✅ |

**Falta:** Diretor de Tráfego não está no IA Studio, está em `campanhas-view.tsx` como IA tecida (lê formulário → grava em library_items)

---

## 2. ARQUITETURA ATUAL

```
TELAS (views) → SERVICES (ia-service + imagem-service) → ROTAS (/api/ia + /api/imagem) → MESA DE MOTORES → Supabase
```

- **Frontend:** Next.js 16.12, TS, Tailwind 4, Shadcn
- **Mesa de Texto (/api/ia v6):** Gemini (autodescoberta) → Groq (auto) → OpenRouter (auto :free) → Cerebras (opcional). GitHub Models morto 30 jul 2026. Chaves server-only. Espelho GET /api/ia = {motores:[{id,armado}]}
- **Mesa de Imagem (/api/imagem v12.1):** klein-9b → klein-4b → SDXL Lightning → schnell → HF → Pollinations flux/turbo → Gemini paga desligada. Formatos quadrado/retrato/vertical/paisagem. Referência ≤512.
- **IA Studio v3.4 Fase 4:** 5 agentes + gerador de imagem + salvar em Mídias (bucket midias + assets) + Biblioteca (library_items)
- **IA tecida:** Roteirista no Briefing → commercials, Diretor de Tráfego nas Campanhas → library_items
- **Banco:** Supabase ugaessoebkqfqezmuwhc, sa-east-1, Free. Tabelas: clients(12), campaigns(16), briefings(10), commercials(10), library_items(8), deals(9), assets(10), prompts(9) + RLS dono. Storage: midias (privado), avatars (público-leitura)

---

## 3. COMO OS AGENTES SÃO CHAMADOS

```tsx
// IA Studio
const agente = agents.find(item => item.name === selectedAgent)
const promptFinal = [agente.instrucao, "", `Tarefa: ${promptText}`, "", "Responda em PT-BR direto..."].join("\n")
const resultado = await iaService.gerarTexto(promptFinal, {temperatura, maxTokens})

// ia-service.ts
fetch("/api/ia", {method:"POST", body: {acao:"gerar-texto", prompt, temperatura, maxTokens}})
→ retorna {ok, texto, erro, motor}

// Imagem
imagemService.gerarImagem(prompt, {formato, referencia}) → POST /api/imagem
```

**Fluxo atual é 1:1** — usuário escolhe 1 agente, 1 chamada, 1 resposta. Não há orquestração.

---

## 4. ONDE OS PROMPTS ESTÃO ARMAZENADOS

- **Personas:** hardcoded em `src/app/ia-studio/ia-studio-view.tsx` const agents[] (instrucao)
- **Guia Vivo:** `src/lib/guia-data.ts` — textos de ajuda por página (11 guias)
- **Prompts salvos:** tabela `prompts` (9 col) + `library_items` (conteúdo gerado)
- **Base de Excelência:** ainda está na tela (ia-studio-view) — deveria ir pra rota /api/ia (decisão Reunião 23 ago)

---

## 5. COMO O CONTEXTO É COMPARTILHADO

- **Hoje:** quase não é. Cada geração é isolada: `agente.instrucao + tarefa do usuário`
- **Histórico:** só local na sessão (useState historico[]), não vai pro banco automaticamente (só se clicar "Salvar na biblioteca")
- **Entre agentes:** não há. Engenheiro de Prompts não vê o que Estrategista gerou, exceto via botão "Usar no gerador de imagem" (copia output pra imagemPromptF)

**Limitação:** sem memória entre agentes, sem Perfil Psicológico compartilhado.

---

## 6. COMO AS RESPOSTAS SÃO PROCESSADAS

- **Texto:** `resultado.texto` → setOutput + setHistorico (prepend) + selo motorReal via rotuloMotor()
- **Imagem:** `resposta.imagem` (data URL) → setImagemGerada + setImagemMotor + diagnóstico notas[]
- **Erros:** confessam "Detalhe técnico:" + código status da fila (ex: "fila: Gemini→429 | Groq→404")
- **Salvamento:** 
  - Texto → library_items (title, category, author, description, content)
  - Imagem Fase 4 → bucket midias + assets + library_items (novo)

---

## 7. FUNCIONALIDADES JÁ FUNCIONANDO (PRESERVAR)

- ✅ Login + proxy porteiro blindado + CADASTRO_ABERTO=false
- ✅ Dashboard real (KPIs do banco, não mock)
- ✅ Clientes CRUD + Mídias real (upload bucket privado + assets)
- ✅ Campanhas, Briefings, Comerciais, CRM kanban, Biblioteca, Prompts, Configurações
- ✅ IA Studio com 5 agentes + Mesa de Motores viva (selos reais)
- ✅ Ponte do Vídeo (roteiro → comandos Flow)
- ✅ Gerador de imagem no IA Studio (prompt editável + referência ≤512 + formatos + diagnóstico)
- ✅ Salvar em Mídias + Biblioteca (Fase 4, build verde)
- ✅ Mesa v6/v12.1 com auto-descoberta (GitHub Models RIP tratado)

---

## 8. LIMITAÇÕES ATUAIS

- ❌ Sem Orquestrador — usuário tem que saber qual agente chamar e em que ordem
- ❌ Sem Perfil Psicológico do Público (Comportamento como pré-processador)
- ❌ Sem Base de Excelência na rota (ainda na tela)
- ❌ Sem Sala de Missão (UX do Orquestrador)
- ❌ Sem memória entre gerações (cada chamada isolada)
- ❌ Sem registro de resultados de criativos (operação não aprende)
- ❌ Sem seleção dinâmica de especialistas (hoje é manual)
- ❌ Sem Diretor Criativo, Oferta/Vendas, Performance, CRM/WhatsApp

---

## 9. PARTES QUE PRECISAM SER PRESERVADAS (REGRA ABSOLUTA)

- NÃO mexer em: Supabase, autenticação, RLS, rotas /api/ia e /api/imagem, services barrel, storage midias/avatars
- NÃO recriar: tabelas assets, library_items, prompts, etc.
- NÃO substituir: Mesa de Motores (v6/v12.1) — está funcionando e com auto-descoberta
- NÃO quebrar: IA Studio atual — deve continuar funcionando mesmo com Orquestrador
- NÃO criar: mocks, demos, dados fictícios

---

## 10. MUDANÇAS NECESSÁRIAS PARA EXPANSÃO

### Para Orquestrador MVP (020-A) — SEM QUEBRAR NADA:

1. **Criar nova rota** `/api/orquestrador` OU expandir `/api/ia` com ação `orquestrar` (recomendado: nova rota pra não poluir Mesa)
2. **Base de Excelência** muda da tela pra rota `/api/ia` (injetada em TODOS os prompts) — decisão Reunião 2
3. **Novo agente Comportamento** como pré-processador: gera "Perfil Psicológico" → salva no banco (nova tabela ou campo em briefings/campaigns) → alimenta todos os outros
4. **Orquestrador Fase A:** pipeline fixa "Produção Completa" (determinística): Comportamento → Estrategista → Copywriter → Diretor Criativo (novo, mas pode começar como prompt do Engenheiro) → Eng. Prompt → Analista
5. **Sala de Missão UX:** cards que acendem conforme agentes trabalham (sem quebrar IA Studio atual — nova página `/orquestrador` ou aba no IA Studio)
6. **Preservar IA Studio atual** — Orquestrador é ADIÇÃO, não substituição

### Riscos identificados:

- **Risco 1:** 1 objetivo = 5-10 chamadas na Mesa (cotas). Com 230 img/dia + texto, 5 clientes ativos apertam. **Mitigação:** medição real (Sprint assinatura) vira URGENTE + cache de Perfil Psicológico.
- **Risco 2:** Orquestração ingênua quebra (chamar todos sempre). **Mitigação:** Fase A pipeline fixa, Fase B seleção dinâmica com aprovação humana (decisão em ata).
- **Risco 3:** Quebrar IA Studio existente. **Mitigação:** criar `/api/orquestrador` separado, não alterar `ia-service` nem `imagem-service` — adicionar `orquestrador-service.ts` no barrel.

---

## CONCLUSÃO DA AUDITORIA

**Arquitetura atual está SÓLIDA e PRESERVÁVEL.** Mesa v6/v12.1 com auto-descoberta é patrimônio. IA Studio v3.4 Fase 4 com build verde é base firme.

**Pode expandir de forma incremental SEM quebrar nada**, desde que:
- Nova rota `/api/orquestrador` (não mexer em `/api/ia` e `/api/imagem`)
- Novo service `orquestrador-service.ts` no barrel
- Nova tabela `perfis_psicologicos` ou campo JSON em `briefings`
- Nova página `/orquestrador` com Sala de Missão (não alterar `/ia-studio`)

**Próximo passo:** apresentar plano detalhado 020-A e pedir permissão.
