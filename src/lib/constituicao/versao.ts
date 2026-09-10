// src/lib/constituicao/versao.ts — CORE-01 (P0.2C)
// Fonte de verdade única da versão da Constituição Cognitiva ANUNCIA.
// Conforme contrato P0.2B §8: compositionVersion pertence ao compositor
// (CORE-02); promptVersion/agentVersion pertencem às integrações (CORE-03/04).
// Nenhuma delas é criada nesta unidade.

export const CONSTITUICAO_VERSAO = "1.0.0" as const;

export type ConstituicaoVersao = typeof CONSTITUICAO_VERSAO;