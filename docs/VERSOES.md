# 📦 VERSÕES DA BANCATA — mapa de sincronia (atualizado Fase 4 + Fix EN Elite)
**Atualizado: 25 ago 2026 · v3.5 EN Elite · BUILD VERDE 9.0s**

## ESTADO ATUAL

| Arquivo no repo | Arquivo na bancata | Versão | Prova Ctrl+F |
|---|---|---|---|
| `src/app/api/imagem/route.ts` | `codigo/019_api_imagem_route_v12.2_EN_ELITE_COMPLETO.ts` | **v12.2 EN Elite** | `expert image prompt translator` = 1 |
| `src/app/api/ia/route.ts` | `codigo/019_api_ia_route.ts` | v6 | `DeepSeek V3` = 1 |
| `src/lib/services/imagem-service.ts` | `codigo/019_imagem_service.ts` | v3 | `referencia?: string;` = 1 |
| `src/lib/services/index.ts` | `codigo/019_index_barrel.ts` | v2 | `from "./imagem-service"` = 1 |
| `src/app/ia-studio/ia-studio-view.tsx` | `codigo/019_ia_studio_view_v3.5_EN_ELITE_COMPLETO.tsx` | **v3.5 EN Elite** | `Prompt Engineer AI of AnuncIA — ELITE` = 1 |

## CARTÃO DE SINCRONIA

1. `api/imagem/route.ts` → `expert image prompt translator` → 1 (NOVO FIX)
2. `ia-studio-view.tsx` → `Prompt Engineer AI of AnuncIA — ELITE` → 1 (NOVO FIX)
3. `ia-studio-view.tsx` → `handleSalvarImagemEmMidias` → 2 (Fase 4)
4. `api/imagem/route.ts` → `gerarViaHuggingFace` → 2

**Build verde garantido.**
