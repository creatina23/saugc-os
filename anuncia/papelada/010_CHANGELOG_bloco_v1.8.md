# 📋 BLOCO v1.8 — para o TOPO do docs/010_CHANGELOG.md

> **COMO COLAR (Lei L12 — append-only):**

> 1. Abre 

`C:\Projetos\BKp\saugc-os\docs\010_CHANGELOG.md`

> 2. Acha a linha do título: 

`SAUGC OS — Histórico de Alterações`

> 3. Cola o bloco abaixo LOGO 

DEPOIS do título (ou seja, ACIMA da linha `## [v1.7]`)

> 4. Nada mais muda no arquivo. 

As versões antigas ficam onde estão.
>

> **PROVAS (Lei L3):**

> - Ctrl+F `[v1.8]` → **1 

resultado**

> - Ctrl+F `[v1.7]` → **1 resultado** (continua existindo, logo abaixo do bloco novo)

> - Última linha do arquivo continua sendo a de sempre: 

`**Próximo:** Sprint 010 — banco real por usuário (schema oficial + RLS + services migrando do mock).`

---

## [v1.8] — 13 ago 2026 — Sprint 017 Leva 1: 🚀 "Mesa de Motores + Ponte do Vídeo + Guia Vivo"

### Adicionado
- **Mesa de Motores (017a) — 4 motores em cadeia ARMADOS** na rota server `/api/ia`: **Gemini** (titular, autodescoberta `gemini-3.6-flash`, reserva `gemini-2.0-flash`) → **GitHub Models** (`openai/gpt-4o`) → **Groq** (`llama-3.3-70b-versatile`) → **OpenRouter** (`llama-3.3-70b :free`). Motor sem chave = pulado em silêncio. Chaves plantadas nos 2 cofres (`.env.local` + Vercel Production **e** Preview, todas server-only): `GEMINI_API_KEY` · `GITHUB_MODELS_TOKEN` · `GROQ_API_KEY` · `OPENROUTER_API_KEY`.
- **Espelho da Mesa**: `GET /api/ia` responde `{motores:[{id,armado}]}` com autenticação — mostra a verdade dos motores sem expor segredo nenhum.
- **IA Studio vivo (017b)**: selos "Conectado"/"Sem chave" agora REAIS (lidos do espelho) · rótulo do motor que atendeu em cada item do histórico · dívidas 📌 da auditoria 016d pagas (card de custo fixo e texto "35+ modelos" resolvidos com a Mesa real).
- **Ponte do Vídeo no Briefing (017c)**: roteiro gerado → **comandos prontos pro Flow, cena a cena** (Caminho A documentado: copiar → colar no gerador de vídeo) — o briefing entra, o vídeo sai.
- **Guia Vivo**: tutorial completo DENTRO do app, página a página — `guia.tsx` + `lib/guia-data.ts`, 11 guias + atalhos, no app-shell.
- **`ia-service` v3 no barrel `@/lib/services`**: `gerarTexto()` → `{ok, texto, erro, motor}` · `statusMotores()` → `[{id, armado}]` | null. (Pendência antiga do estacionamento — QUITADA.)

### Corrigido
- **Incidente Vercel-envs** no dia da plantação das chaves: envs novas só valem no deploy seguinte (lição nº 10 reforçada em carne viva) — resolvido no mesmo dia, com Production e Preview plantadas juntas.
- Faxinas de código da leva (polimento geral entregue junto).

### Lições operacionais
- Motor sem chave pula em silêncio — e o espelho confessa na tela. Segredo nunca sai da rota server.
- Chave nova na Vercel = lembrar dos DOIS ambientes (Production e Preview) e de que ela só acorda no próximo deploy.

### Marcos
- 🚀 **Sprint 017 Leva 1 NO AR (13 ago 2026)** — a Mesa de Motores 4/4 armada é o fim da dependência de um motor só.
- 📜 **Opção C (decisão soberana, 13 ago):** Sala de Páginas DESLIZADA pro pós-1º-cliente — nada de feature nova antes da venda (Lei L13).
- 🎯 **Caça ao 1º cliente aberta** (D+1→D+14) · Comando Mestre externo triado (vira `docs/016`) · recebimento travado (PIX primeiro; 12× via InfinitePay/PagBank).
