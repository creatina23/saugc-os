# 🧠 ANUNCIA — ARQUIVO MESTRE ORGANIZADO v3.4
**Data: 25 ago 2026 · Fase 4 Mídias + Biblioteca · BUILD VERDE**
**Dono: Mateus Almeida · Copiloto: a postos · Caça: pausada**

> Este arquivo organiza e atualiza TODOS os arquivos do projeto que você tem. É a verdade única.

---

## 1. VISÃO GERAL (onde estamos)

- **Produto:** AnuncIA v2.0 + Sprint 016 + Sprint 017 Leva 1 + Sprint 019 Fase 1-3 no ar + **Fase 4 pronta pra colar**
- **Repo:** github.com/creatina23/saugc-os → anuncia-three.vercel.app
- **Stack:** Next.js 16.12 (Turbopack), TS, Tailwind 4, Supabase, Vercel
- **Mesa de Texto:** v6 — Gemini (autodescoberta) → Groq (auto) → OpenRouter (auto :free) → Cerebras (opcional)
- **Mesa de Imagem:** v12.1 — klein-9b → klein-4b → SDXL Lightning → schnell → HF → Pollinations flux/turbo → Gemini paga (desligada)
- **Fase atual:** 019 Fase 4 — salvar imagem em Mídias (bucket + assets) + Biblioteca (library_items)
- **Próxima:** 020-A Orquestrador MVP (pipeline fixa "Produção Completa")

---

## 2. INVENTÁRIO COMPLETO — 26 ARQUIVOS ORGANIZADOS

### 📁 GRUPO A — Papelada Bloco A+B (8 arquivos) — 100% COMPLETA

| # | Arquivo Original | Local no Repo | Versão | Prova | Status |
|---|---|---|---|---|---|
| 1 | 010_CHANGELOG.md | docs/010_CHANGELOG.md | **v1.8 RECONSTRUÍDO** | `[v1.8]`=1, `[v1.7]`=1 | ✅ 32KB, 488 linhas, v1.1→v1.8. Reconstruído do contexto 000-030 + bloco v1.8 |
| 2 | 011_CURRENT_MISSION_v2.9.md | docs/011_CURRENT_MISSION.md | v2.9 | `MISSÃO ATUAL (v2.9)`=1 | ✅ GPS — Sprint 018 aberta, caça pausada |
| 3 | 012_MEMORIA_ESTRATEGICA_v2.1.md | docs/012_MEMORIA_ESTRATEGICA.md | v2.1 | `Protocolo de Linguagem incorporado`=1 | ✅ Cérebro externo — 6 Barreiras, 2 Reuniões Soberanas |
| 4 | 013_MAPA_DE_CACA.md | docs/013_MAPA_DE_CACA.md | v1 | `MAPA DE CAÇA DO PRIMEIRO CLIENTE`=1 | ✅ Contém seção 9 D+1→D+14 (014 provisório) |
| 5 | 015_CONTRATO_IMPLANTACAO.md | docs/015_CONTRATO_IMPLANTACAO.md | v1 | `CONTRATO DE IMPLANTAÇÃO`=1 | ✅ Minuta 1 página |
| 6 | 016_TRIAGEM_COMANDO_MESTRE.md | docs/016_TRIAGEM_COMANDO_MESTRE.md | v1 | `TRIAGEM SOBERANA`=1 | ✅ |
| 7 | 017_TRIAGEM_PROTOCOLO_LINGUAGEM.md | docs/017_TRIAGEM_PROTOCOLO_LINGUAGEM.md | v1 | `PROTOCOLO DE LINGUAGEM`=1 | ✅ |
| 8 | 018_SISTEMA_DE_LINGUAGEM.md | docs/018_SISTEMA_DE_LINGUAGEM.md | v1 | `SISTEMA DE LINGUAGEM`=1 | ✅ Lei da Linguagem |

### 📁 GRUPO B — Comandos Soberanos v4 (Reunião 23 ago noite)

| Arquivo | Local | Versão | Status |
|---|---|---|---|
| COMANDO_RE_CRIACAO_v4.md | docs/COMANDO_RE_CRIACAO_v4.md + comandos/ | v4 (23 ago noite) | ✅ Ativação do copiloto — 9 partes, 6 Barreiras, fila de batalha |
| ARQUITETURA_INTELIGENCIA_EXPANSAO.md | docs/ARQUITETURA_INTELIGENCIA_EXPANSAO.md | v1 (23 ago) | ✅ Orquestrador + 5 novos agentes (Comportamento, Oferta, Diretor Criativo, Performance, CRM) |
| MODO_OPERACIONAL_USUARIO.md | docs/MODO_OPERACIONAL_USUARIO.md | v1 (23 ago) | ✅ Piloto de Missão + TDAH-friendly + 1 prioridade |

### 📁 GRUPO C — Contexto e Backups

| Arquivo | Tamanho | Status |
|---|---|---|
| 000-030_contexto_completo.txt | 152KB | ✅ Backup histórico 000-030 — continha v1.1→v1.7, usado pra reconstruir changelog |
| 031_MASTER_CONTEXT.md.txt | 4.6KB | ✅ Master Context v1.0 |
| PROTOCOLO_DE_LINGUAGEM.md | 17KB | ✅ Verbatim original |
| ANALISE_COMANDO_MESTRE_TRIAGEM.md | 8KB | ✅ |

### 📁 GRUPO D — Operação e Venda

| Arquivo | Status |
|---|---|
| MANUAL_DE_USO.md | ✅ |
| GUIA_DE_OPERACAO.md | ✅ |
| CHECKLIST_COMERCIAL.md | ✅ |
| 013_MAPA_DE_CACA_PRIMEIRO_CLIENTE.md | ✅ Duplicata do Mapa (mesmo conteúdo) |
| RELATORIO_DE_STATUS_13ago2026.md | ✅ |
| RELATORIO_FIM_DE_TRAMPO_20ago.md | ✅ |
| PASSE_DE_ENTREGA.md | ✅ Papelada A+B + Linguagem v2 (8 arquivos) |
| VERSOES.md | ✅ Atualizado v3.4 Fase 4 (antes v3.3) |

### 📁 GRUPO E — Código (Sprint 019)

| Arquivo no repo | Arquivo na bancata | Versão | Prova | Status |
|---|---|---|---|---|
| src/app/api/imagem/route.ts | codigo/019_api_imagem_route.ts | v12.1 | gerarViaHuggingFace=2 | ✅ Mesa de Imagens |
| src/app/api/ia/route.ts | codigo/019_api_ia_route.ts | v6 | DeepSeek V3=1 | ✅ Mesa de Texto |
| src/lib/services/imagem-service.ts | codigo/019_imagem_service.ts | v3 | referencia?=1 | ✅ |
| src/lib/services/index.ts | codigo/019_index_barrel.ts | v2 | from "./imagem-service"=1 | ✅ |
| src/app/ia-studio/ia-studio-view.tsx | codigo/019_ia_studio_view.tsx | **v3.4 Fase 4** | handleSalvarImagemEmMidias=2 | ✅ NOVO — Salvar em Mídias + Biblioteca |

---

## 3. O QUE FOI ATUALIZADO HOJE (25 ago)

### 🔧 Código
- **ia-studio-view.tsx v3.3 → v3.4 Fase 4:**
  - Novo estado: salvandoImagemMidia, erroSalvarImagem, sucessoSalvarImagem
  - Nova função: dataUrlParaBlob() — converte base64 pra Blob
  - Nova função: handleSalvarImagemEmMidias() — upload bucket `midias` + insert `assets` + insert `library_items`
  - Nova UI: botão "Salvar em Mídias + Biblioteca" ao lado de "Baixar"
  - Build: verde (9.6s, 0 erros)

### 📄 Documentação
- **010_CHANGELOG.md:** reconstruído de 0 → 32KB completo (v1.1→v1.8)
- **VERSOES.md:** v3.3 (23 ago) → v3.4 Fase 4 (25 ago) — nova prova handleSalvarImagemEmMidias
- **docs/:** adicionados COMANDO_RE_CRIACAO_v4, ARQUITETURA_EXPANSAO, MODO_OPERACIONAL (antes só em uploads)

### 🗂️ Organização
- Tudo copiado para `/anuncia/papelada/`, `/anuncia/comandos/`, `/anuncia/bancata-repo/docs/`
- Inventários: INVENTARIO_PAPELADA.md + INVENTARIO_FINAL.md + este arquivo mestre

---

## 4. MAPA DE DEPENDÊNCIAS (Lei da Entrega Casada)

```
TELAS (views) ──importam──▶ SERVICES (lib/services/*) ──fetch──▶ ROTAS (app/api/*)
   ia-studio-view v3.4 ───▶ ia-service + imagem-service ──────▶ /api/ia v6 + /api/imagem v12.1
   ├── handleGerarImagem() → imagemService.gerarImagem() → POST /api/imagem
   ├── handleSalvarImagemEmMidias() → Supabase Storage midias + assets + library_items (NOVO)
   └── handleUsarNoGeradorImagem() → cola prompt no gerador

   barrel index.ts v2 ─────▶ TODOS os services + ia-service + imagem-service
```

**Regra da raposa:** mudou interface OpcoesImagem? → todo consumidor viaja no mesmo passe.

---

## 5. PROVA DE DEPENDÊNCIA 10s (rodada hoje)

```
src/app/ia-studio/ia-studio-view.tsx → handleSalvarImagemEmMidias = 2 → OK
src/app/ia-studio/ia-studio-view.tsx → handleUsarNoGeradorImagem = 2 → OK
src/app/api/imagem/route.ts → gerarViaHuggingFace = 2 → OK
src/lib/services/imagem-service.ts → referencia?: string; = 1 → OK
src/lib/services/index.ts → from "./imagem-service" = 1 → OK
```

**Build:** `npm run lint` → 1 warning antigo (Badge) / `npm run build` → verde 9.6s

---

## 6. O QUE FALTA (de verdade)

- **014_PLANO_D1_D14.md:** nunca existiu arquivo separado. Oficial é seção 9 do MAPA_DE_CACA (D+1→D+14). Não procurar mais.
- **012_MASTER_COMMAND.md.txt:** veio vazio (0 bytes) — ignorar.
- **LP assets:** vídeo 40s, foto/bio — pendência pós-Fase 4, não bloqueia.

---

## 7. PRÓXIMA SPRINT — 020-A ORQUESTRADOR MVP

**O QUE É:** 1 botão "Produção Completa" que orquestra: Comportamento (pré-processador) → Estrategista → Diretor Criativo → Eng. Prompts → Analista → Performance
**POR QUE IMPORTA:** transforma objetivo em campanha completa, não só texto solto
**O QUE MUDA:** Base de Excelência sai da tela e vai pra rota `/api/ia` (injetada em todos), Sala de Missão (cards acendem)
**RISCO:** 1 objetivo = 5-10 chamadas na Mesa (cotas). Medição vira urgente.
**RECOMENDAÇÃO:** fechar 019 Fase 4 hoje, abrir 020-A amanhã.

Fila aprovada em Reunião Soberana nº2:
1. 019 Fase 4 ✅ PRONTA (este arquivo)
2. 020-A Orquestrador MVP + Base na rota + Comportamento + Sala de Missão
3. 020-B/C + 018 (linguagem)
4. Diretor Criativo + Oferta + Performance
5. CRM/WhatsApp

---

## 8. GATILHOS ATIVOS

les go · deu certo · segue o baile · só se for agora · abre o roadmap · papelada · organiza o comando · reunião aberta · re · ativar modo caça · fim de trampo · iniciar trampo · NO AR = CLIENTE FECHOU

Caça: PAUSADA (gatilho "ativar modo caça" pra voltar) · Dogfooding balanço: 26 ago

---

**FIM DO ARQUIVO MESTRE v3.4 — BUILD VERDE — PRONTO PRA COMMIT**
