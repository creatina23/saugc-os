// TR-04.8D.2c-2 (Correção 2) — agrupamento APRESENTACIONAL de sinais.
// ---------------------------------------------------------------------
// Puro (sem React/Supabase), separado do painel para ser testável.
// IDENTIDADE: estrutural — `sinal.id` tem o formato estável
// `${regraId}:${entityId}` (contrato do motor) e a chave de grupo é
// `fonte:entityId`. O titulo NUNCA é usado para descobrir identidade —
// apenas para rótulo/fato na apresentação. Assim:
// - duas campanhas com o MESMO NOME nunca são agrupadas (ids distintos);
// - mudar o texto formatado não afeta o agrupamento;
// - R1+R2 da mesma campanha viram um bloco só, preservando os dois
//   regraId, as duas evidências, os dois fatos e o destino.
// Nenhuma regra do motor é alterada; nada é fundido ou removido.

import type { DestinoAcao, NivelAtencao, SinalAtencao } from "@/lib/attention";

export interface GrupoSinais {
  chave: string;
  /** Rótulo da entidade para exibição (ex.: «Campanha X»); null = bloco sem
   *  entidade (R6). Derivado do titulo — SOMENTE apresentação. */
  entidade: string | null;
  nivel: NivelAtencao;
  /** Fatos factuais — um por sinal do grupo (nenhum fato é fundido/removido). */
  fatos: string[];
  /** Sinais originais preservados (regraId + evidência intactos p/ auditoria). */
  sinais: SinalAtencao[];
  destino: DestinoAcao | null;
}

export function agruparSinaisPorEntidade(sinais: SinalAtencao[]): GrupoSinais[] {
  const grupos: GrupoSinais[] = [];
  const porChave = new Map<string, GrupoSinais>();
  for (const sinal of sinais) {
    // Apresentação: rótulo e fato saem do titulo (convenção " — " do motor).
    const separador = sinal.titulo.indexOf(" — ");
    const rotulo = separador > 0 ? sinal.titulo.slice(0, separador) : sinal.titulo;
    const fato = separador > 0 ? sinal.titulo.slice(separador + 3) : sinal.titulo;

    // R6 é sinal de sistema (id = "R6:<fonte>"): bloco independente, sem
    // entidade — nunca agrupado com nada.
    if (sinal.regraId === "R6") {
      grupos.push({
        chave: sinal.id,
        entidade: null,
        nivel: sinal.nivel,
        fatos: [sinal.titulo],
        sinais: [sinal],
        destino: sinal.destino,
      });
      continue;
    }

    // IDENTIDADE ESTRUTURAL: entityId extraído do id estável do motor.
    const doisPontos = sinal.id.indexOf(":");
    const entityId = doisPontos >= 0 ? sinal.id.slice(doisPontos + 1) : sinal.id;
    const chave = `${sinal.fonte}:${entityId}`;

    const existente = porChave.get(chave);
    if (existente) {
      existente.fatos.push(fato);
      existente.sinais.push(sinal);
      continue;
    }
    const grupo: GrupoSinais = {
      chave,
      entidade: rotulo,
      // Ordem do motor é por nível — o primeiro membro carrega o nível
      // mais forte do grupo (R1+R2 são ambos "Acompanhar").
      nivel: sinal.nivel,
      fatos: [fato],
      sinais: [sinal],
      destino: sinal.destino,
    };
    porChave.set(chave, grupo);
    grupos.push(grupo);
  }
  return grupos;
}
