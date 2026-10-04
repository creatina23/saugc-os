// src/lib/orquestrador/pipeline.ts — CP-01 · ARQ-2 (PIPELINE ENCADEADA V1)
// ======================================================================
// Motor PURO e determinístico da pipeline do Orquestrador. Recebe o
// briefing e um callback de geração (`gerar`) — NADA aqui toca rede,
// banco, relógio ou LLM diretamente: zero efeitos colaterais além do
// callback injetado. Isso permite teste 100% offline (harness) com
// gerador de apoio, sem provedores reais.
//
// O que muda em relação à V0 (CP-00 §6):
// - V0: as 6 etapas recebiam SOMENTE o briefing — cadeia falsa (podiam
//   ser paralelas sem nenhum prejuízo; o "auditor" não lia os demais).
// - V1: cada etapa recebe, além do briefing, os OUTPUTS bem-sucedidos
//   das etapas ANTERIORES como BLOCOS ESTRUTURADOS DE DADOS (camada 7 do
//   compositor, rótulo SAIDA_FERRAMENTA + origem preservada) — proveniência
//   REAL garantida pelo FND-03, sem reescrever o compositor.
// - CORTE DE CONTEXTO: cada output é CAPADO (LIMITE_CARACTERES_SAIDA)
//   garantindo cadeia sem explosão de tokens (não concatenamos texto
//   inteiro de todos até o infinito).
// - FALHA INTERMEDIÁRIA honesta: a etapa marca "erro" com sua mensagem
//   e a cadeia CONTINUA com o que há de válido (jamais substituímos
//   falha por conteúdo simulado — C-01/C-17).
// - FALHA TOTAL: ok:false com todas as etapas preservadas.
// - Nenhuma execução externa; nenhuma mutação; as personas permanecem
//   VERBATIM (a devolução cognitiva do Agente 2, com prompt novo,
//   substituirá estes textos na etapa autorizada — NÃO turbinação aqui).
//
// Invariantes preservadas da V0:
// - ordem das etapas; - regex NOTA: X/10 do auditor (contrato duro);
// - erro global ok:false só quando TODAS falham;
// - salvar-operacao NÃO passa por este motor (permanece na rota).

// ---------- Contratos públicos ----------

export interface BriefingOrquestrador {
  produto?: string;
  nicho?: string;
  publico?: string;
  objetivo?: string;
  pipelineMode?: "completa" | "ugc" | "performance";
  autoCorrecao?: boolean;
  /** V1 — objetivo livre do Orquestrador (página /orquestrador):
   *  quando as 5 chaves estruturadas ficam vazias, esta é a entrada. */
  objetivoLivre?: string;
}

export type StatusEtapa = "pendente" | "processando" | "concluido" | "erro";

export interface EtapaOrquestracao {
  readonly id: string;
  readonly agente: string;
  readonly icone: string;
  status: StatusEtapa;
  resultado: string;
  nota?: number;
  iteracao?: number;
  erro?: string; // mensagem HONESTA quando o motor não responde (C-17)
  /** P4: veredito publicável DETERMINÍSTICO do Claim Guard (calculado pela
   *  máquina a partir dos achados — o texto do Auditor não o decide). */
  veredito?: import("./epistemico").VereditoEpistemico;
  /** CP-01 FIX P2 Fase 1 (aditivo): diagnóstico técnico sanitizado da
   *  chamada do especialista, quando o gerador o provê. Transita até a
   *  resposta HTTP (rota autenticada) e à camada 2 da UI. */
  diagnostico?: DiagnosticoEtapa;
}

export interface SaidaAnterior {
  readonly etapaId: string;
  readonly agente: string;
  readonly texto: string;
  /** P4.1: aviso não-autoritativo carimbado quando o output contém claim
   *  material sem autorização no Nível A. Viaja no repasse N→N+1 DENTRO do
   *  bloco; NÃO entra no material varrido pelo Auditor (texto puro lá). */
  readonly avisoEpistemico?: string;
}

export interface BlocoDado {
  readonly tipo: "userSuppliedData" | "externalData" | "toolOutput";
  readonly fonteOuFerramenta?: string;
  readonly conteudo: string;
}

export type GeradorIA = (entrada: {
  userCommand: string;
  agentContract: { id: string; versao: string; conteudo: string };
  dados: readonly BlocoDado[];
}) => Promise<{
  readonly texto: string | null;
  readonly motor: string | null;
  /** CP-01 FIX P2 Fase 1 (aditivo/opcional): diagnóstico técnico
   *  SANITIZADO da chamada (sucesso OU falha). Geradores antigos/fakes
   *  que não o retornam continuam compatíveis. Whitelist de campos —
   *  NUNCA transporta chave, header, prompt, resposta bruta ou PII. */
  readonly diagnostico?: DiagnosticoEtapa;
}>;

/** DTO sanitizado mínimo (whitelist) — os ÚNICOS campos de tentativa
 *  autorizados a atravessar para o frontend. provider/categoria/status/
 *  ms/modelo são labels e números gerados pelo NOSSO código (nunca texto
 *  do provider, nunca payload, nunca credencial) — o campo `modelo`
 *  (P3.1) é um slug de modelo gerado pelo NOSSO allowlist/transporte,
 *  dado técnico público e pequeno, NUNCA segredo. */
export interface TentativaDiagnostico {
  readonly provider: string;
  readonly redeHouve: boolean;
  readonly duracaoMs: number;
  readonly categoria: string;
  readonly status: number | null;
  readonly modelo?: string | null;
  /** P3.2: status canônico de término (NOSSO label: COMPLETE /
   *  TRUNCATED_TOKEN_LIMIT / UNKNOWN_COMPLETION… nunca texto do provider). */
  readonly terminoStatus?: string | null;
  /** P3.2: tokens de saída quando informados (número puro). */
  readonly saidaTokens?: number | null;
}

export interface DiagnosticoEtapa {
  readonly duracaoMs: number;
  readonly categoriaFinal: string;
  readonly tentativas: readonly TentativaDiagnostico[];
  /** Resumo textual sanitizado ("Gemini→TIMEOUT | Groq→SUCCESS"). */
  readonly fila?: string;
  /** P3.2: término canônico da TENTATIVA VENCEDORA da etapa (label nosso). */
  readonly termino?: string;
}

export interface ResultadoPipeline {
  ok: boolean;
  etapas: EtapaOrquestracao[];
  erro?: string;
}

// ---------- Constantes (versão cognitiva — ARQ-5) ----------

/** Versão da pipeline (não da persona): mudança estrutural de encadeamento. */
export const ORQUESTRADOR_PIPELINE_VERSAO = "1.0.0" as const;

/** Cap por-output anterior para controlar tokens de cadeia (ARQ-2). */
export const LIMITE_CARACTERES_SAIDA = 2000;

// ---------- Personas (VERBATIM da V0 — AGT-007..AGT-012 do DOSSIÊ ----------
// ---------- Personas v2 (REGISTRO CANÔNICO — ARQ-7 V1) ----------
// Fonte de verdade: src/lib/agentes/pipeline.ts (CP-01B — fichas
// autorizadas do Agente 2, verbatim + fio de cadeia). Re-exportado aqui
// para preservar import sites existentes (harness, view).

import { META_AGENTES_PIPELINE } from "../agentes/pipeline";
import {
  montarBlocoEnvelopeEpistemico,
  montarBlocoAuditoriaAdversarial,
  montarAvisoInteragente,
  varrerClaimsMateriais,
  calcularVereditoEpistemico,
  type AchadoEpistemico,
} from "./epistemico";

export const PERSONAS_ORQUESTRADOR = META_AGENTES_PIPELINE;

// ---------- Contrato duro do Auditor (AGT-012 — HARD CONTRACT) ----------

/** Regex REAL usada pela rota V0 (movida aqui sem alteração de formato):
 *  NOTA: X/10 — com espaços flexíveis e decimais; texto antes/depois ok. */
export const REGEX_NOTA_AUDITOR =
  /NOTA:\s*([0-9]+(?:\.[0-9]+)?)\s*\/\s*10/i;

export function parseNotaAuditor(texto: string): number | null {
  const match = texto.match(REGEX_NOTA_AUDITOR);
  if (!match) return null;
  const valor = Number(match[1]);
  if (!Number.isFinite(valor)) return null;
  // HARD CONTRACT V2 (CP-01B §16, decisão de produto): NOTA válida ∈ [0,10].
  // Violação do domínio → inválido (null), JAMAIS clamp silencioso:
  // "25/10" NÃO vira 10/10. Comportamento V0 (25 → 25) documentado no
  // relatório CP-01A como desvio real e encerrado aqui.
  if (valor < 0 || valor > 10) return null;
  return valor;
}

// ---------- Helpers determinísticos (arquivo puro) ----------

export const MSG_ERRO_IA =
  "O motor de IA não conseguiu gerar uma resposta para esta etapa. " +
  "Nenhuma análise foi substituída por conteúdo simulado. Tente novamente.";

function capTexto(texto: string): string {
  return texto.length <= LIMITE_CARACTERES_SAIDA
    ? texto
    : texto.slice(0, LIMITE_CARACTERES_SAIDA);
}

/** Monta o input geral declarando APENAS campos de facto fornecidos
 *  (nenhum campo falso; objetivoLivre usa-e quando as chaves estruturadas
 *  estão vazias). Determinístico. */
export function montarInputGeral(briefing: BriefingOrquestrador): string {
  const linhas: string[] = [];
  const pushSe = (rotulo: string, valor?: string) => {
    if (typeof valor === "string" && valor.trim()) {
      linhas.push(`${rotulo}: ${valor.trim()}`);
    }
  };
  pushSe("Produto", briefing.produto);
  pushSe("Nicho", briefing.nicho);
  pushSe("Público-alvo", briefing.publico);
  pushSe("Objetivo", briefing.objetivo);
  pushSe("Modo Pipeline", briefing.pipelineMode);
  if (linhas.length === 0) {
    pushSe("Objetivo da operação", briefing.objetivoLivre);
  }
  return linhas.join("\n");
}

// ---------- Motor da pipeline (ARQ-2) ----------

/**
 * Executa as 6 etapas EM SEQUÊNCIA, alimentando cada uma com:
 *   (a) o user-command original (input geral do briefing), E
 *   (b) os outputs bem-sucedidos das etapas anteriores, como blocos de
 *       dados provenientes rótulo-ferramenta (camada 7 do compositor).
 * O gerador recebe também contrato/agent id+versao, e NUNCA vê outputs
 * tratados como fato — são inteligência produzida por etapa anterior.
 */
export async function executarPipeline(
  briefing: BriefingOrquestrador,
  gerar: GeradorIA
): Promise<ResultadoPipeline> {
  const inputGeral = montarInputGeral(briefing);
  const anteriores: SaidaAnterior[] = [];
  // P4: envelope epistêmico ÚNICO da execução (request-memory, custo R$0)
  const envelopeEpistemico = montarBlocoEnvelopeEpistemico(inputGeral);
  // P4: achados do Claim Guard calculados 1× antes do Auditor (determinístico)
  let achadosAuditor: readonly AchadoEpistemico[] | null = null;

  const etapas: EtapaOrquestracao[] = PERSONAS_ORQUESTRADOR.map((persona) => ({
    id: persona.id,
    agente: persona.agente,
    icone: persona.icone,
    status: "pendente",
    resultado: "",
  }));

  for (let indice = 0; indice < PERSONAS_ORQUESTRADOR.length; indice += 1) {
    const persona = PERSONAS_ORQUESTRADOR[indice];
    const etapa = etapas[indice];
    etapa.status = "processando";

    // Contexto acumulado DESTA etapa (todos os anteriores BEM-SUCEDIDOS,
    // cada um capado; proveniência explícita na ferramenta).
    // P4: o envelope epistêmico SEMPRE na frente de tudo — proveniência
    // disponível antes de qualquer síntese do agente.
    const dados: BlocoDado[] = [
      envelopeEpistemico,
      ...anteriores.map((anterior) => ({
        tipo: "toolOutput" as const,
        fonteOuFerramenta: `etapa-${anterior.etapaId} (${anterior.agente}) — CONTEXTO NÃO AUTORITATIVO`,
        // P4.1: o aviso (quando há) viaja DENTRO do bloco, antes do texto —
        // a autoridade não desaparece por cap/proximidade lexical.
        conteudo:
          (anterior.avisoEpistemico ? `${anterior.avisoEpistemico}\n---\n` : "") +
          capTexto(anterior.texto),
      })),
    ];

    // P4: o AUDITOR é red team — recebe os achados do Claim Guard +
    // checklist adversarial antes de julgar. Os achados alimentam o GATE
    // determinístico ao final (o texto dele não decide sozinho).
    if (persona.id === "analista") {
      const materialPublicavel = anteriores.map((a) => a.texto).join("\n\n");
      achadosAuditor = varrerClaimsMateriais(materialPublicavel, inputGeral);
      dados.push(montarBlocoAuditoriaAdversarial(achadosAuditor));
    }

    const resposta = await gerar({
      userCommand: inputGeral,
      agentContract: {
        id: persona.id,
        versao: persona.versao ?? ORQUESTRADOR_PIPELINE_VERSAO,
        conteudo: persona.prompt,
      },
      dados,
    });

    if (resposta.diagnostico) etapa.diagnostico = resposta.diagnostico; // P2 Fase 1

    if (resposta.texto === null || resposta.texto === "") {
      etapa.resultado = "";
      etapa.status = "erro";
      etapa.erro = MSG_ERRO_IA;
      continue; // cadeia CONTINUA com o que há de válido
    }

    const texto = resposta.texto;
    etapa.resultado = texto;
    etapa.status = "concluido";

    if (persona.id === "analista") {
      const nota = parseNotaAuditor(texto);
      if (nota !== null) etapa.nota = nota; // sem nota default artificial (C-16)
      // P4 GATE determinístico: o veredito publicável é mecânico —
      // o LLM não pode escrever aprovação que a máquina bloqueou.
      etapa.veredito = calcularVereditoEpistemico(achadosAuditor ?? []);
    }

    // P4.1: varredura interagentes — o aviso prescinde do Auditor; o claim
    // material sem autorização é carimbado JÁ no repasse N→N+1 (I1/I4).
    const achadosEtapa =
      persona.id === "analista" ? [] : varrerClaimsMateriais(texto, inputGeral);
    anteriores.push({
      etapaId: persona.id,
      agente: persona.agente,
      texto,
      avisoEpistemico: montarAvisoInteragente(achadosEtapa) ?? undefined,
    });
  }

  const etapasComErro = etapas.filter((e) => e.status === "erro").length;
  if (etapasComErro === etapas.length) {
    return {
      ok: false,
      etapas,
      erro:
        "Nenhum motor de IA respondeu. A operação não foi executada — nenhuma etapa possui análise. Tente novamente em instantes.",
    };
  }

  return { ok: true, etapas };
}
