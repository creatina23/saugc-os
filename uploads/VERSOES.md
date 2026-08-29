# 📦 VERSÕES DA BANCATA — o mapa de sincronia com o seu repo
**Última atualização: 23 ago 2026 (noite) · LEI DA ENTREGA CASADA em vigor**

> Regra nova da casa (5ª barreira): **nenhum arquivo viaja sozinho quando depende de outro.**
> Toda entrega agora é um PACOTE: lista os arquivos do passe + prova rápida de dependência
> (Ctrl+F de 10 segundos) ANTES do build de 96s. Se a prova falha, baixa o combo inteiro.

---

## 🗺️ MAPA DE DEPENDÊNCIAS (quem puxa quem)

```
TELAS (views) ──importam──▶ SERVICES (lib/services/*) ──fetch──▶ ROTAS (app/api/*)
   ia-studio-view ─────────▶ ia-service + imagem-service ──────▶ /api/ia + /api/imagem
   comerciais-view (limpo) ▶ (nada de IA)                       ▶ /api/ia só via services
   barrel index.ts ─────────▶ TODOS os *.service.ts + ia-service + imagem-service
```

**Regra da raposa:** mudou INTERFACE de service (campo novo em OpcoesImagem etc.)?
→ Todo consumidor da interface viaja NO MESMO PASSE, ou a prova de dependência
avisa antes do build.

---

## 📋 ESTADO ATUAL DOS ARQUIVOS DA BANCATA (o que DEVE estar no seu repo)

| Arquivo no repo | Arquivo na bancata | Versão | Prova Ctrl+F (valor esperado) |
|---|---|---|---|
| `src/app/api/imagem/route.ts` | `codigo/019_api_imagem_route.ts` | **v12** | `gerarViaHuggingFace` = 2 |
| `src/app/api/ia/route.ts` | `codigo/019_api_ia_route.ts` | **v3** | `DeepSeek V3 (free)` = 1 |
| `src/lib/services/imagem-service.ts` | `codigo/019_imagem_service.ts` | **v3** | `referencia?: string;` = 1 |
| `src/lib/services/ia-service.ts` | (original do repo — não mexi) | repo | `statusMotores` = 2 |
| `src/lib/services/index.ts` (barrel) | `codigo/019_index_barrel.ts` | v2 | `from "./imagem-service"` = 1 |
| `src/app/ia-studio/ia-studio-view.tsx` | `codigo/019_ia_studio_view.tsx` | **v3.3** | `handleUsarNoGeradorImagem` = 2 |
| `src/app/comerciais/comerciais-view.tsx` | `codigo/019_comerciais_view.tsx` | **original** | `(Sprint 019)` = 0 |

---

## 🩺 CARTÃO DE SINCRONIA (rodar quando quiser checar a saúde — 60 segundos)

Abra cada arquivo no VS Code e confira o Ctrl+F (qualquer divergência = baixe o arquivo da bancata correspondente):

1. `api\imagem\route.ts` → busca `gerarViaHuggingFace` → **2**
2. `api\ia\route.ts` → busca `DeepSeek V3 (free)` → **1**
3. `services\imagem-service.ts` → busca `referencia?: string;` → **1**
4. `services\index.ts` → busca `from "./imagem-service"` → **1**
5. `ia-studio\ia-studio-view.tsx` → busca `handleUsarNoGeradorImagem` → **2**
6. `comerciais\comerciais-view.tsx` → busca `(Sprint 019)` → **0**
7. (bônus) `services\` NÃO deve conter `ia.service.ts` (fóssil enterrado na fase 2)

**Tudo batendo = repo e bancata são a mesma verdade. Build verde garantido.**
