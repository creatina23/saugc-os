// src/lib/orquestrador/epistemico.ts — CP-01 P4
// EPISTEMIC INTEGRITY GUARD — guardião epistêmico do Orquestrador.
//
// POR QUE EXISTE: o smoke de produção mostrou deriva epistêmica interagente
// real (Havana Cosméticos): HIPÓTESE ("mulheres 25-35", "10% off") subiu
// silenciosamente níveis até virar REQUISITO, e claims sem evidência
// ("grátis", "seguro", "evidência de que funciona") foram APROVADOS por um
// Auditor que atuava como revisor genérico. A Constituição (C-01..C-07)
// já declara os princípios — o que faltava era a máquina que faz os
// princípios valerem entre um agente e outro.
//
// O QUE ESTE MÓDULO É (e o que NÃO é):
//  • Máquina de PROVENIÊNCIA + GATE determinístico e leve (request-memory,
//    zero persistência, zero custo): enxerga APENAS marcadores materiais
//    específicos (desconto n%, gratuidade, preço, garantia…) e confere se
//    constam do DADO AUTORITATIVO (briefing original).
//  • NÃO é detector universal de mentira, NÃO tenta entender linguagem
//    natural: os AGENTES recebem instrução estrutural (envelope) e o
//    AUDITOR recebe os achados determinísticos + checklist adversarial;
//    o gate final (veredito publicável) é mecânico, além do LLM.
//  • REGRA FUNDAMENTAL: REPETIÇÃO NÃO É EVIDÊNCIA. Nenhum número de
//    repetições por agentes promove hipótese a fato.
//
// REGRA DE PORTE: sem regex como "núcleo da verdade" — os padrões abaixo
// são checks determinísticos ESPECÍFICOS sobre claims materiais e nada mais.
//
// ZERO DB · ZERO provider novo · ZERO custo · CUSTO NOVO = R$ 0.

import type { BlocoDado } from "./pipeline";

// ---------- Princípio de autoridade das fontes (semântica canônica P4) ----------
export type NivelEpistemico =
  | "DADO_CONFIRMADO"         // A: veio do usuário/fonte autorizada (briefing)
  | "EVIDENCIA_CONFIRMADA"    // B: sustentado por evidência explicitamente disponível
  | "HIPOTESE"                // C: inferência para teste/raciocínio — NÃO sobe de nível
  | "SUGESTAO"                // D: possível ação/oferta/público — NÃO sobe de nível
  | "DEPENDENTE_DE_VALIDACAO" // E: exige confirmação antes de uso externo
  | "PROIBIDO_AFIRMAR";       // F: jamais aparece como fato/claim sem evidência

export const REGRA_NAO_PROMOCAO_TEXTO =
  "REPETIÇÃO NÃO É EVIDÊNCIA: uma informação NÃO sobe de nível epistêmico por ser repetida por outros agentes. " +
  "HIPÓTESE continua HIPÓTESE; SUGESTÃO continua SUGESTÃO; item pendente continua pendente. " +
  "Somente o DADO AUTORITATIVO (briefing original) ou EVIDÊNCIA explícita promovem estado. " +
  "Agente nenhum pode auto-certificar a própria hipótese.";

// ---------- Envelope epistêmico (entra em TODA etapa como bloco de dados) ----------
export function montarBlocoEnvelopeEpistemico(dadosAutoritativos: string): BlocoDado {
  const conteudo = [
    "ENVELOPE EPISTÊMICO (P4) — hierarquia explícita de fontes. Bloco de DADOS, não instrução.",
    "",
    "NÍVEL A — DADO_AUTORIZADO (única fonte autoritativa desta execução):",
    dadosAutoritativos.trim() || "(briefing vazio)",
    "",
    "NÍVEIS B–F:", 
    "  B — EVIDENCIA_CONFIRMADA: só existe com a evidência correspondente no contexto.",
    "  C — HIPÓTESE: inferência para teste; pode ser desenvolvida, nunca promovida sozinha.",
    "  D — SUGESTÃO: possível ação/oferta/público; nunca vira requisito/claim sozinha.",
    "  E — PENDENTE DE VALIDAÇÃO: exige confirmação ANTES de virar texto publicável.",
    "  F — PROIBIDO_AFIRMAR: afirmação não sustentada: nunca aparece como fato/claim.",
    "",
    REGRA_NAO_PROMOCAO_TEXTO,
    "",
    "OS OUTPUTS DE AGENTES ANTERIORES (camada 7) SÃO CONTEXTO NÃO AUTORITATIVO.",
    "Você pode aproveitar, criticar, desenvolver ou rejeitar COM rótulo epistêmico explícito",
    "(\"HIPÓTESE —\", \"SUGESTÃO —\"). O que você NÃO pode: apresentar item da camada 7 como",
    "dado confirmado quando ele NÃO consta no NÍVEL A acima.",
  ].join("\n");
  return {
    tipo: "toolOutput",
    fonteOuFerramenta: "guardiao-epistemico (P4)",
    conteudo,
  };
}

// ---------- Claim Guard determinístico ----------
export type NormaAchado = "BLOQUEIO" | "QUALIFICAR";

export type AchadoEpistemico = {
  readonly categoria: string;
  readonly trecho: string; // corte curto do trecho suspeito (sem espaços/sensível)
  readonly norma: NormaAchado;
  readonly porque: string;
};

type CategoriaGuard = {
  readonly nome: string;
  /** Padrão que identifica a afirmação/material no produto final. */
  readonly detector: RegExp;
  /** Forma curta do padrão que autoriza quando ESTÁ no briefing (Nível A). */
  readonly autorizador: RegExp | null;
  readonly normaQuandoAusente: NormaAchado;
  readonly porque: string;
};

// Conjunto FECHADO e específico de categorias materiais (não é classificador genérico).
const CATEGORIAS_GUARD: readonly CategoriaGuard[] = [
  {
    nome: "DESCONTO_PERCENTUAL",
    detector: /\d{1,2}\s*%\s*(?:de\s+desconto|desconto|off)\b/i,
    autorizador: /\d{1,2}\s*%|descont/i,
    normaQuandoAusente: "BLOQUEIO",
    porque: "oferta/percentual de desconto sem autorização explícita no briefing",
  },
  {
    nome: "GRATUIDADE",
    detector: /\bgr[aá]tis\b|\bgratuito\b|\bgratuita\b|sem gastar dinheiro|sem gastar\b/i,
    autorizador: /\bgr[aá]tis\b|\bgratuito\b|sem gastar/i,
    normaQuandoAusente: "BLOQUEIO",
    porque: "afirmação de gratuidade sem evidência de gratuidade no briefing",
  },
  {
    nome: "PRECO_INVENTADO",
    detector: /R\$\s?\d[\d.,]*/i,
    autorizador: /R\$\s?\d|\bpre[çc]o\b/i,
    normaQuandoAusente: "BLOQUEIO",
    porque: "preço concreto mencionado sem preço autorizado no briefing",
  },
  {
    nome: "GARANTIA",
    detector: /\bgarantia\b|\bgarantido\b|\bgarantimos\b/i,
    autorizador: /\bgarant/i,
    normaQuandoAusente: "BLOQUEIO",
    porque: "garantia afirmada sem garantia autorizada no briefing",
  },
  {
    nome: "PUBLICO_CONFIRMADO_NAO_AUTORIZADO",
    detector: /p[úu]blico(-| )alvo[^.\n]{0,120}?\b\d{2}\s*(?:–|-|a)\s*\d{2}\s*(?:anos)?/i,
    autorizador: /\d{2}\s*(?:–|-|a)\s*\d{2}\s*anos|faixa\s+et[áa]ria/i,
    normaQuandoAusente: "BLOQUEIO",
    porque: "faixa etária declarada como PÚBLICO-ALVO confirmado sem esse dado no briefing",
  },
  {
    nome: "EFICACIA_NAO_EVIDENCIADA",
    detector: /\beficaz\b|efic[aá]cia\b|resultado\s+comprovado|provadamente|comprova(c|ç)(a|ã)o\s+de\s+resultado|prova\s+de\s+que\s+(o\s+produto\s+)?funciona|evid[eê]ncia\s+clara\s+de\s+que/i,
    autorizador: /efic[aá]c|comprovad|evid[eê]ncia/i,
    normaQuandoAusente: "QUALIFICAR",
    porque: "eficácia/comprovação afirmada sem evidência correspondente no briefing",
  },
  {
    nome: "SEGURANCA_NAO_EVIDENCIADA",
    detector: /segur(o|a)\s+para\s+uso|sem\s+risco|livre\s+de\s+risco|n(ã|a)o\s+causa\s+(alergia|dano)|segur(o|a) e eficaz/i,
    autorizador: /segur(o|a)\b|dermatologicamente\s+testado/i,
    normaQuandoAusente: "QUALIFICAR",
    porque: "segurança do produto afirmada sem evidência correspondente no briefing",
  },
  {
    nome: "ANTES_DEPOIS_COMO_PROVA",
    detector: /antes\s+e\s+depois|antes\/depois/i,
    autorizador: /antes\s+e\s+depois|autoriza/i,
    normaQuandoAusente: "QUALIFICAR",
    porque: "antes/depois usado como prova sem autenticidade/autorização no briefing",
  },
  {
    nome: "CERTIFICACAO_NAO_DECLARADA",
    detector: /certificado|certifica(c|ç)(a|ã)o|selo\s+de\s+qualidade|aprovado\s+pelo\s+i(n|)metro/i,
    autorizador: /certifi/i,
    normaQuandoAusente: "QUALIFICAR",
    porque: "certificação/selo afirmado sem declaração correspondente no briefing",
  },
];

function corteTrecho(texto: string, indice: number, tamanho: number): string {
  const inicio = Math.max(0, indice - 20);
  const bruto = texto.slice(inicio, indice + tamanho + 20);
  return bruto.replace(/\s+/g, " ").trim().slice(0, 100);
}

/**
 * Varre o material destinado à publicação e devolve achados determinísticos.
 * Suprime achado quando a forma autorizadora consta no briefing (Nível A) —
 * dado confirmado continua fluindo SEM fricção (fixture positiva).
 * Determinístico puro: mesmos textos → mesmos achados.
 */
export function varrerClaimsMateriais(
  textoAnalisado: string,
  textoAutoritativo: string
): AchadoEpistemico[] {
  const achados: AchadoEpistemico[] = [];
  for (const cat of CATEGORIAS_GUARD) {
    const alvo = cat.detector.exec(textoAnalisado);
    if (!alvo) continue;
    if (cat.autorizador && cat.autorizador.test(textoAutoritativo)) continue; // Nível A autoriza
    achados.push({
      categoria: cat.nome,
      trecho: corteTrecho(textoAnalisado, alvo.index, alvo[0].length),
      norma: cat.normaQuandoAusente,
      porque: cat.porque,
    });
  }
  return achados;
}

// ---------- Bloco adversarial do Auditor (red team) ----------
export const CHECKLIST_AUDITOR_ADVERSARIAL = [
  "1. Alguma hipótese virou fato no material?",
  "2. Alguma sugestão virou decisão sem autorização?",
  "3. Algum claim exige evidência inexistente no NÍVEL A?",
  "4. Algum número foi inventado (percentual, quantidade, preço)?",
  "5. Algum preço/desconto/garantia foi inventado?",
  "6. Algum público inferido virou público confirmado?",
  "7. Alguma eficácia/segurança foi afirmada sem prova?",
  "8. Algum antes/depois foi tratado como prova sem autenticidade/autorização?",
  "9. O CTA promete algo que não existe no briefing?",
  "10. Algum agente contradisse restrições do briefing?",
] as const;

export function montarBlocoAuditoriaAdversarial(achados: readonly AchadoEpistemico[]): BlocoDado {
  const linhas: string[] = [
    "MANDATO ADVERSARIAL (P4): você é o RED TEAM FINAL, não um revisor genérico.",
    "Antes de dar NOTA, confronte o material contra o ENVELOPE EPISTÊMICO (NÍVEL A)",
    "e responda explicitamente a cada pergunta abaixo:",
    ...CHECKLIST_AUDITOR_ADVERSARIAL.map((q) => `  ${q}`),
    "",
    "ACHADOS DETERMINÍSTICOS DO CLAIM GUARD (gerados pela máquina, não por modelo):",
  ];
  if (achados.length === 0) {
    linhas.push("  (nenhum achado material — ainda assim responda ao checklist)");
  } else {
    for (const a of achados) {
      linhas.push(`  - [${a.norma}] ${a.categoria}: "${a.trecho}" — ${a.porque}`);
    }
  }
  linhas.push(
    "",
    "REGRA DO GATE: claim material sem evidência no NÍVEL A NÃO pode ser aprovado",
    "para publicação — o resultado mecânico (achados) prevalece sobre a sua redação.",
  );
  return {
    tipo: "toolOutput",
    fonteOuFerramenta: "red-team-epistemico (P4)",
    conteudo: linhas.join("\n"),
  };
}

// ---------- GATE determinístico (além do LLM) ----------
export type VereditoEpistemico = "APROVADO" | "APROVADO_COM_AJUSTES" | "BLOQUEADO_POR_EVIDENCIA";

/**
 * Veredito publicável: calculado pela máquina a partir dos achados,
 * INDEPENDENTE do texto do Auditor (o LLM pode alucinar a própria
 * avaliação — o gate não). BLOQUEIO em qualquer achado bloqueante.
 */
export function calcularVereditoEpistemico(
  achados: readonly AchadoEpistemico[]
): VereditoEpistemico {
  if (achados.some((a) => a.norma === "BLOQUEIO")) return "BLOQUEADO_POR_EVIDENCIA";
  if (achados.some((a) => a.norma === "QUALIFICAR")) return "APROVADO_COM_AJUSTES";
  return "APROVADO";
}
