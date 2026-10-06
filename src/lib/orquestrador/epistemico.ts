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
    "AUTORIDADE NÃO É HEREDITÁRIA (I1): uma claim derivada NÃO herda o NÍVEL A da frase",
    "que a inspirou. As distinções abaixo NÃO são equivalentes:",
    "  FATO: \"Produto declara duração de até 90 dias.\"",
    "  DERIVAÇÃO PERMITIDA: \"O briefing informa duração de até 90 dias.\"",
    "  DERIVAÇÃO NÃO AUTORIZADA: \"Você tem garantia de 90 dias.\"",
    "  HIPÓTESE: \"Talvez desconto aumente conversão.\"",
    "  SUGESTÃO: \"Testar desconto de 10%, sujeito à aprovação.\"",
    "  OFERTA CONFIRMADA: \"Ganhe 10% de desconto.\" — só com essa oferta no NÍVEL A.",
    "",
    "E.TIQUETAR NÃO PROMOVE (I7): escrever \"CONFIRMADO\", \"GARANTIDO\", \"SEGURO\",",
    "\"COMPROVADO\" ou \"EFICAZ\" NÃO muda a proveniência — só o NÍVEL A confirma.",
    "Rascunho interno pode usar hipótese/sugestão SOMENTE com o rótulo NA PRÓPRIA LINHA",
    "(comece com HIPÓTESE —, SUGESTÃO —, PENDENTE — ou CONDICIONAL —). Linha NÃO rotulada",
    "com claim material é tratada como peça final e BLOQUEADA se não constar no NÍVEL A.",
    "NEGAÇÃO NO NÍVEL A NUNCA É AUTORIZAÇÃO: \"não existe desconto autorizado\" NÃO autoriza",
    "desconto — é restrição explícita. Mencionar a restrição (\"sem desconto\") NÃO é oferecer",
    "a condição comercial. LINEAGE: proposição repetida, parafraseada, resumida, traduzida,",
    "recomendada, priorizada ou escolhida CONTINUA com a autoridade da sua fonte mais forte —",
    "mudança lexical NÃO promove. Só o NÍVEL A promove.",
    "",
    "NON_EXPANSION_OF_AUTHORITY (I10): autorização ESTREITA autoriza apenas o próprio escopo.",
    "  \"Não possui odor forte e sufocante característico\" NÃO autoriza \"sem odor\";",
    "  \"não provoca ardência nos olhos\" NÃO autoriza \"sem irritação\"; \"até 90 dias\" NÃO",
    "  autoriza \"dura 90 dias garantidos\"; \"aproximadamente 8 a 10 aplicações\" NÃO autoriza",
    "  \"rende 10 aplicações\"; \"hipoalergênica\" NÃO autoriza \"não causa alergia\";",
    "  \"alta compatibilidade mediante avaliação/teste\" NÃO autoriza \"compatível com qualquer",
    "  química\". QUALIFICADOR MATERIAL removido (até, aproximadamente, pode, mediante,",
    "  característico, forte, sufocante, nos olhos, auxilia, dependendo de, dentro do",
    "  protocolo, avaliação profissional, teste de mecha) transforma a afirmação em tese",
    "  materialmente MAIS AMPLA/absoluta — NÃO apresente sem a forma absoluta equivalente",
    "  literal no NÍVEL A. Classifique rótulos: FATO / INFERÊNCIA / HIPÓTESE / RECOMENDAÇÃO /",
    "  PENDÊNCIA — hipótese e recomendação de teste SEGUEM permitidas, sempre rotuladas.",
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
  /** P4.1 (I8 — autorização PRÓPRIA): autorização VALOR-ESPECÍFICA para
   *  categorias onde o VALOR importa (dinheiro, percentual). Recebe o trecho
   *  detectado na peça e o Nível A; retorna true apenas quando o MESMO valor
   *  consta autorizado no briefing. "desconto de 5%" NÃO autoriza "10% off". */
  readonly autorizacaoContextual?: (
    claimDetectado: string,
    textoAutoritativo: string
  ) => boolean;
  /** P4.1.1: quando true, matches dentro de sentença NEGADA na peça
   *  ("o briefing não autoriza desconto") são respeito ao briefing, NÃO
   *  claim — ignorados. Desligado por padrão (fail-closed). */
  readonly ignorarNegacaoNaPeca?: boolean;
  /** R4 (CP-07 RC-4): quando definido, o tema só autoriza com ÂMBITO
   *  semântico compartilhado — tema Rx acha a menção no Nível A e o
   *  escopo precisa preservar ao menos um stem não-tema do claim. */
  readonly autorizacaoComAmbito?: RegExp;
  readonly temaAmbito?: RegExp;
  readonly normaQuandoAusente: NormaAchado;
  readonly porque: string;
};

/** Extrai percentuais (números) de um texto: "10% de desconto" → [10] */
function percentuaisDe(texto: string): readonly number[] {
  const encontrados = texto.match(/\d{1,2}\s*%/g) ?? [];
  return encontrados.map((p) => parseInt(p, 10));
}

/** Extrai valores monetários R$ normalizados: "R$ 1.234,56" → 1234.56 */
function valoresMonetariosDe(texto: string): readonly number[] {
  const encontrados = texto.match(/R\$\s?\d[\d.,]*/gi) ?? [];
  return encontrados.map((v) => {
    const digitos = v.replace(/[^\d.,]/g, "").replace(/\./g, "").replace(",", ".");
    return parseFloat(digitos);
  });
}

// ---------- P4.1.1 · Negação NUNCA é autorização (Authority Lineage) ----------
const NEGACAO = /\bn[ãa]o\b|\bsem\b|\bnunca\b|\bjamais\b|\bnenhum\w*\b|\bproibi\w*|\bvedad\w*/i;

/** A unidade de decisão que contém `indice` é negada? (determinístico).
 *  Herda a polaridade de LISTA (cabeçalho negado → itens negados) — ver
 *  unidadesDecisao. Semântica idêntica à sentença isolada quando não há lista. */
function sentencaNegada(texto: string, indice: number): boolean {
  for (const u of unidadesDecisao(texto)) {
    if (indice >= u.inicio && indice < u.inicio + u.texto.length) {
      return u.negada;
    }
  }
  return false;
}

// P4.1.3-R · LINEAGE v2 — negação em MODO LISTA (bug reproduzido no smoke
// pós-P4.1.3): "NÃO inventar:\n- preço;\n- desconto;" quebrava a sentença
// em itens autônomos SEM negação própria, e o desconto passava a contar como
// "autorização". A negação do CABEÇALHO de lista herda aos seus ITENS até
// linha em branco ou novo cabeçalho — a semântica do briefing NÃO depende
// da pontuação/formato. Determinístico.
interface UnidadeDecisao {
  readonly texto: string;
  readonly negada: boolean;
  readonly inicio: number;
}
/** RED TEAM FIX (V04, mínimo): herança de polaridade com INDENTAÇÃO — a
 *  pilha de cabeçalhos (:) rastreia escopo. Sub-cabeçalho negado aninha; o
 *  retorno ao indent do PAI recompõe a polaridade positiva ("diferenciais"
 *  após "NÃO inventar:" aninhado NÃO herda a negação — over-block corrigido
 *  sem perder "preço permanece proibido"). Determinístico; mesma semântica
 *  para frase única e lista simples (indent 0, comportamento anterior). */
function unidadesDecisao(texto: string): readonly UnidadeDecisao[] {
  const out: UnidadeDecisao[] = [];
  const pilha: { indent: number; negada: boolean }[] = [];
  let cursor = 0;
  // B1 (CP-06): preserva linhas em branco REAIS — o split anterior colapsava
  // e deixava a polaridade negativa do cabeçalho vazar além do encerramento
  // estrutural do bloco (apoio: "negação + blank + claim" PASSAVA).
  for (const linhaBruta of texto.split("\n")) {
    const offset = texto.indexOf(linhaBruta, cursor);
    cursor = offset + linhaBruta.length;
    const linha = linhaBruta.trim();
    if (linha === "") {
      // encerramento estrutural: negação do cabeçalho NÃO atravessa blank
      pilha.length = 0;
      continue;
    }
    // B1 (CP-06): heading Markdown abre NOVA SEÇÃO mesmo sem ":" — fecha
    // o escopo anterior (mesma regra para textos "Tudo sobre X:").
    if (/^#{1,6}\s/.test(linha)) {
      pilha.length = 0;
    }
    const indent = linhaBruta.length - linhaBruta.trimStart().length;
    const eCabecalho = /[:：]\s*$/.test(linhaBruta);
    // pop estrito: só sai do escopo quando volta ACIMA da indentação do
    // sub-cabeçalho; itens no MESMO nível do cabeçalho continuam herdando.
    while (pilha.length > 0 && indent < pilha[pilha.length - 1].indent && !eCabecalho) {
      pilha.pop();
    }
    // R6 (CP-09 RC-OB): polaridade por UNIDADE DE FRASE, não por LINHA.
    // A negação vale para a unidade onde ocorre (split [.!?;]) e para os
    // DESCENDENTES de cabeçalho na pilha — NÃO para frases positivas
    // anteriores da mesma linha ("Progressiva Havana: até 90 dias; …;
    // … . Não existe desconto autorizado." — a cláusula final negada não
    // pode retroagir e ANULAR a autoridade legítima dos itens anteriores;
    // bug que zerava a autorização de TODA a fixture Havana). Cabeçalho
    // com negação própria segue herdando aos itens via pilha (B1 intacto).
    const negadaNaLinha = NEGACAO.test(linhaBruta);
    const negadaContexto = pilha.some((p) => p.negada);
    // ';' separa unidades de autoridade na MESMA linha/parágrafo —
    // "Não dizer preços; desconto de 10% permitido." (O1-class).
    let local = 0;
    for (const s of linhaBruta.split(/[.!?;]+/)) {
      const ini = offset + linhaBruta.indexOf(s, local);
      local = linhaBruta.indexOf(s, local) + s.length;
      if (!s.trim()) continue;
      out.push({ texto: s, negada: negadaContexto || NEGACAO.test(s), inicio: ini });
    }
    if (eCabecalho) {
      // cabeçalho entra NA pilha no PRÓPRIO indent: itens mais profundos herdam
      while (pilha.length > 0 && pilha[pilha.length - 1].indent >= indent) pilha.pop();
      pilha.push({ indent, negada: negadaNaLinha });
    }
  }
  return out;
}

/** O termo aparece em ALGUMA unidade NÃO negada? Presença ≠ autorização:
 *  "Não existe desconto autorizado" NÃO autoriza desconto (bug provado P4.1.1);
 *  "NÃO inventar:\n- desconto" TAMBÉM não (bug P4.1.3-R reproduzido). */
function mencaoPositiva(texto: string, termo: RegExp): boolean {
  const g = new RegExp(termo.source, termo.flags);
  return unidadesDecisao(texto).some(
    (u) => g.test(u.texto) && !u.negada
  );
}


/** R4 (CP-07 RC-4): autorização por TEMA não é autorização por ÂMBITO.
 *  Uma menção do tema ("certificação ISO") só autoriza o claim se o ÂMBITO
 *  semântico é preservado: a fala do suporte precisa compartilhar ao menos
 *  um stem SIGNIFICATIVO não-tema com o claim (âmbito do objeto alvo).
 *  Termos genéricos de entidade (produto/marca/loja...) não contam — âmbito
 *  é o predicado específico ("dermatologicamente", "ISO", "transporte"). */
const GENERICOS_AMBITO = new Set([
  "produto","produtos","marca","marcas","empresa","loja","lojas","linha",
  "linhas","campanha","campanhas","oferta","ofertas","servico","servicos",
  "projeto","modelo","modelos","forma","formas","diferente","melhor","novos",
  "nova","novo","novas","nosso","nossa","nossos","nossas","nossas","meu",
  "minha","proprio","propria","mel","alta","reais","fato","caso",
  // intensidade da oferta não é âmbito do objeto ("especial" não une
  // "oferta especial em todo o catálogo" com "...em selecionados")
  "especial","exclusiv","exclusiva","exclusivo","premium","top","super"]);
function ambitoPreservado(suporteSentenca: string, claimSentenca: string, temaRx: RegExp): boolean {
  const escopo = (texto: string) =>
    new Set(
      stemsSignificativos(texto)
        .map((s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase())
        .filter((s) => !GENERICOS_AMBITO.has(s) && !temaRx.test(s))
    );
  const claim = escopo(claimSentenca);
  const sup = escopo(suporteSentenca);
  // R6 (CP-09 RC-OB): claim PURAMENTE TEMÁTICA (só contém o próprio tema —
  // "Hipoalergênico.", "Vegano.") tem escopo vazio e NUNCA era autorizada,
  // nem quando o tema estava literalmente presente no Nível A. A autoridade
  // exigida passa a ser PRESENÇA DO MESMO TEMA no suporte (por raiz) —
  // literalidade/semântica equivalente; elevação de força/estatuto segue
  // vetada nos estágios próprios ("hipoalergênico" NÃO autoriza "zero risco").
  if (claim.size === 0) {
    const temasClaim = new Set(
      stemsSignificativos(claimSentenca)
        .map((s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase())
        .filter((s) => !GENERICOS_AMBITO.has(s))
    );
    if (temasClaim.size === 0) return false;
    const supStems = new Set(
      stemsSignificativos(suporteSentenca)
        .map((s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase())
        .filter((s) => !GENERICOS_AMBITO.has(s))
    );
    for (const c of temasClaim) for (const s of supStems) if (stemMatch(c, s)) return true;
    return false;
  }
  if (sup.size === 0) return false;
  for (const c of claim) for (const s of sup) if (stemMatch(c, s)) return true;
  return false;
}

/** Âmbito em QUALQUER sentença do Nível A que cite o tema (não-negada). */
export function autorizacaoComAmbito(
  briefing: string,
  claimSentenca: string,
  temaRx: RegExp,
  temaFiltro: RegExp = temaRx
): boolean {
  // temaRx ENCONTRA a menção no Nível A; temaFiltro é o que NÃO conta como
  // âmbito no escopo (ex.: "iso" encontra suporte, mas o filtro de escopo
  // é só "certific" — ISO é o ÂMBITO, não a palavra-tema).
  const rx = new RegExp(temaRx.source, temaRx.flags.includes("g") ? temaRx.flags : temaRx.flags + "g");
  for (const u of unidadesDecisao(briefing)) {
    if (u.negada) continue;
    rx.lastIndex = 0;
    if (!rx.test(u.texto)) continue;
    if (ambitoPreservado(u.texto, claimSentenca, temaFiltro)) return true;
  }
  return false;
}

// Conjunto FECHADO e específico de categorias materiais (não é classificador genérico).
const CATEGORIAS_GUARD: readonly CategoriaGuard[] = [
  {
    nome: "DESCONTO_PERCENTUAL",
    // R4 (CP-07 RC-5): a relação VALOR+RELAÇÃO COMERCIAL é insensível à ORDEM
    // superficial ("5% de desconto" ≡ "desconto de 5%" ≡ "desconto: 5%" ≡
    // "economize 5%") — regra de CLASSE, não enumeração das frases do CP-07.
    detector:
      /\d{1,2}\s*%\s*(?:de\s+desconto|desconto|off)\b|\bdesconto\s*(?:[:=]\s*|de\s+|de\s+at[ée]\s+)?\d{1,2}\s*%|\boff\s*[:=]?\s*\d{1,2}\s*%|\beconomi[sz][\wÀ-ÿ]*\s+(?:at[ée]\s+)?\d{1,2}\s*%|(?:pagu\w*|economi\w*|cobr\w*|tax\w*|tarif\w*)\s+\d{1,3}\s*%|\d{1,3}\s+por\s+cento\b|(?:\w+cento\b|\w+enta\b)\s+por\s+cento\b|\bmenos\s+\d{1,3}\s+por\s+cento/i,
    autorizador: null,
    // P4.1 (I8) + P4.1.1 (negação): só autorizado se o briefing AUTORIZA
    // desconto em sentença NÃO negada E o MESMO percentual consta do Nível A.
    // "Não existe desconto autorizado" NUNCA autoriza (bug provado P4.1.1).
    autorizacaoContextual: (claim, briefing) => {
      if (!mencaoPositiva(briefing, /descont|discount/i)) return false;
      const alvo = percentuaisDe(claim);
      const autorizados = percentuaisDe(briefing);
      return alvo.length > 0 && alvo.some((p) => autorizados.includes(p));
    },
    normaQuandoAusente: "BLOQUEIO",
    porque: "oferta/percentual de desconto sem autorização explícita no briefing (valor-específica)",
  },
  {
    // P4.1.1 · incidente real: desconto GENÉRICO (sem %) também é condição
    // comercial material — hipótese ("testar desconto") é permitida ROTULADA,
    // mas paráfrase diretiva comercial ("deve incluir oferecer um desconto",
    // "include a discount") NÃO herda autoridade por mudança lexical.
    nome: "DESCONTO_COMERCIAL",
    // [\wÀ-ÿ]* — cauda acento-segura: JS \w NÃO cobre letras acentuadas
    // ("Ofereça" pararia no "ç"), o que reproduziria o false negative.
    detector:
      /\b(?:ofere[\wÀ-ÿ]*|ganh[\wÀ-ÿ]*|aproveit[\wÀ-ÿ]*|inclu[\wÀ-ÿ]*|adicio[\wÀ-ÿ]*|aplic[\wÀ-ÿ]*|conced[\wÀ-ÿ]*|disponibiliz[\wÀ-ÿ]*|offer[\wÀ-ÿ]*|feature[\wÀ-ÿ]*|add[\wÀ-ÿ]*)\s+[^.!?\n]{0,40}?\b(?:descont[\wÀ-ÿ]*|discount)\b/i,
    autorizador: null,
    autorizacaoContextual: (_claim, briefing) =>
      mencaoPositiva(briefing, /descont|discount/i),
    ignorarNegacaoNaPeca: true, // "o briefing não autoriza desconto" é respeito, não claim
    normaQuandoAusente: "BLOQUEIO",
    porque:
      "condição comercial de desconto sem autorização positiva no Nível A (lineage: hipótese não vira oferta)",
  },
  {
    // Marcadores de falsa certeza ancorados: "CONFIRMADO: desconto" NÃO
    // certifica (I7) — cobre desconto nu sem verbo comercial.
    nome: "DESCONTO_COMERCIAL_AUTOCERT",
    detector:
      /(?:^|[\n\r])\s*(?:CONFIRMADO|APROVADO|GARANTIDO|VERIFICADO|CONFIRMED)\s*[:—–-]\s*[^.!?\n]{0,40}?\b(?:descont[\wÀ-ÿ]*|discount)\b/i,
    autorizador: null,
    autorizacaoContextual: (_claim, briefing) =>
      mencaoPositiva(briefing, /descont|discount/i),
    normaQuandoAusente: "BLOQUEIO",
    porque: "autocertificação de desconto sem autorização no Nível A (I7)",
  },
  {
    nome: "GRATUIDADE",
    detector: /\bgr[aá]tis\b|\bgratuito\b|\bgratuita\b|sem gastar dinheiro|sem gastar\b/i,
    autorizador: null,
    // R4 RC-4: "enviamos catálogo grátis" NÃO autoriza "primeira aplicação grátis" —
    // âmbito compartilhado é exigido (P4.1.1 negação preservada via unidades).
    autorizacaoComAmbito: /\bgr[aá]tis\b|\bgratuit[oa]\b|sem gastar/i,
    temaAmbito: /gr[aá]tis|gratuit[oa]|sem gastar/i,
    normaQuandoAusente: "BLOQUEIO",
    porque: "afirmação de gratuidade sem evidência de gratuidade no briefing",
  },
  {
    nome: "PRECO_INVENTADO",
    detector: /R\$\s?\d[\d.,]*/i,
    autorizador: null,
    // P4.1 (I8): só autorizado se o MESMO valor monetário consta do Nível A —
    // "preço R$ 89,90" NÃO autoriza "campanha custará R$ 10.000,00".
    autorizacaoContextual: (claim, briefing) => {
      const alvo = valoresMonetariosDe(claim);
      const autorizados = valoresMonetariosDe(briefing);
      return alvo.length > 0 && alvo.every((v) => autorizados.includes(v));
    },
    normaQuandoAusente: "BLOQUEIO",
    porque: "preço/custo concreto mencionado sem o mesmo valor autorizado no briefing",
  },
  {
    nome: "GARANTIA",
    detector: /\bgarantia\b|\bgarantido\b|\bgarantimos\b/i,
    autorizador: null,
    // R4 RC-4: âmbito compartilhado exigido (garantia da fábrica ≠ garantia ao cliente).
    autorizacaoComAmbito: /\bgarant\w*/i,
    temaAmbito: /garant/i,
    normaQuandoAusente: "BLOQUEIO",
    porque: "garantia afirmada sem garantia autorizada no briefing",
  },
  {
    // P4.1.3-R · §11 — instrução/afirmação que PRESSUPÕE existência de preço
    // específico jamais fornecido ("mostrar o preço", "preço do produto",
    // "por apenas"). Material comercial mesmo sem valor numérico.
    nome: "PRECO_EXISTENCIA_NAO_SUPORTADA",
    detector:
      /\b(?:mostrar|exibir|destacar|revelar|apresentar|anunciar)\s+(?:o\s+)?pre[cç]o\b|\bpre[cç]o\s+(?:do\s+produto|especial|exclusivo|promocional|competitiv[\wÀ-ÿ]*|imbat[ií]vel|de\s+lan[cç]amento)|\bpre[cç]o\s+que\s+cabe|por\s+apenas\b|\b(?:metade|dobro|triplo)\s+d[oa]?\s+pre[cç]o\b|\bleve\s+\d+\s*,\s*pague\s+\d+|\bsem\s+taxas?\s+de\s+(?:ades[ãa]o|entrada)|\ba\s+partir\s+de\s+R\$|\d+\s+x\s+de\s+R\$/i,
    autorizador: null,
    autorizacaoContextual: (_claim, briefing) =>
      mencaoPositiva(briefing, /pre[cç]o|R\$/i),
    ignorarNegacaoNaPeca: true, // "não mencionar preço" é respeito
    normaQuandoAusente: "BLOQUEIO",
    porque:
      "existência/destaque de preço específico afirmado sem informação de preço no Nível A",
  },
  {
    // P4.1.3-R · §11 — forma/condição de PAGAMENTO factual não informada
    // ("cartão de crédito ou débito", "parcelado em 12x", "pix", "boleto").
    nome: "PAGAMENTO_NAO_INFORMADO",
    detector:
      /\b(?:cart[ãa]o(?:es)?\s+de\s+(?:cr[ée]dito|d[ée]bito)|cart[ãa]o(?:es)?\b(?:\s+de)?\s+(?:cr[ée]dito|d[ée]bito)|\bpix\b|\bboleto\b|\bparcel\w*\s+em\s+\d+\s*x|em\s+\d+\s*x\s+(?:no cart[ãa]o|sem juros|no cr[ée]dito)|(?:no|seu|o)\s+cart[ãa]o\b|\bsem juros\b|no debito\b|no cr[ée]dito\b|no d[ée]bito\b|forma\s+de\s+pagamento|d[ée]bito\s+autom[áa]tico|em\s+at[ée]\s+(?:\d+|\w+ente|\w+enta)\s+(?:parcelas|vezes)\b|\d+\s+x\s+de\s+R\$|\bleve\s+\d+\s*,\s*pague\s+\d+|\bsem\s+taxas?|a\s+partir\s+de\s+R\$)/i,
    autorizador: null,
    autorizacaoContextual: (_claim, briefing) =>
      mencaoPositiva(briefing, /cart[ãa]o|pagament|\bpix\b|\bboleto\b|parcelad/i),
    ignorarNegacaoNaPeca: true,
    normaQuandoAusente: "BLOQUEIO",
    porque:
      "forma/condição de pagamento afirmada sem informação de pagamento no Nível A",
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
    // R4: "resultados demonstram/provam/comprovam" também é afirmação de eficácia.
    detector: /\beficaz\b|efic[aá]cia\b|resultado\s+comprovado|provadamente|comprova(c|ç)(a|ã)o\s+de\s+resultado|prova\s+de\s+que\s+(o\s+produto\s+)?funciona|evid[eê]ncia\s+clara\s+de\s+que|resultados?\s+(?:(?:que\s+)?demonstra\w*|provam?|comprovam?|garantem?)/i,
    autorizador: null,
    // R4 RC-4: "evidência de aceitação comercial" NÃO autoriza "evidência de eficácia".
    autorizacaoComAmbito: /efic[aá]c|comprovad|evid[eê]ncia|funciona/i,
    temaAmbito: /efic[aá]c|comprovad|evid[eê]ncia|funciona/i,
    normaQuandoAusente: "QUALIFICAR",
    porque: "eficácia/comprovação afirmada sem evidência correspondente no briefing",
  },
  {
    nome: "SEGURANCA_NAO_EVIDENCIADA",
    // P4.1: família "sem químicos tóxicos" entra — característica específica
    // ("livre de formol") NÃO autoriza o absoluto mais amplo por proximidade.
    // R4: "seguro para <ALVO/USO>" é claim de segurança por destino —\
    // o âmbito do alvo é verificado (transporte ≠ gestante ≠ pele).
    detector: /segur(o|a)\s+para\s+uso|segur(o|a)\s+para\s+(?:[aeo]\s+)?\w{4,}([\wÀ-ÿ\s-]{0,36})?|sem\s+risco|livre\s+de\s+risco|n(ã|a)o\s+causa\s+(alergia|dano)|segur(o|a) e eficaz|sem\s+qu[ií]micos?\s+t[oó]xicos?|livre\s+de\s+qu[ií]mic\w*|livre\s+de\s+toxinas?/i,
    autorizador: null,
    // R4 RC-4: "seguro para transporte aéreo" NÃO autoriza "seguro para gestantes".
    autorizacaoComAmbito: /segur(o|a)\b|dermatologicamente\s+testado|sem\s+qu[ií]mic|livre\s+de\s+(qu[ií]mic\w*|toxinas?)/i,
    temaAmbito: /segur(o|a)\b|dermatol|risco|qu[ií]mic|toxinas?/i,
    normaQuandoAusente: "QUALIFICAR",
    porque: "segurança do produto afirmada sem evidência de MESMO ÂMBITO no briefing",
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
    // R4 RC-4: tema "certifi/selo" só autoriza com ÂMBITO compartilhado.
    autorizador: null,
    autorizacaoComAmbito: /certifi|selo|inmetro/i,
    temaAmbito: /certifi|selo|inmetro/i,
    normaQuandoAusente: "QUALIFICAR",
    porque: "certificação/selo afirmado sem declaração correspondente no briefing",
  },
];

function corteTrecho(texto: string, indice: number, tamanho: number): string {
  const inicio = Math.max(0, indice - 20);
  const bruto = texto.slice(inicio, indice + tamanho + 20);
  return bruto.replace(/\s+/g, " ").trim().slice(0, 100);
}

/** P4.1 (I9): linha explicitamente ROTULADA como trabalho interno não é
 *  peça final — é hipótese/sugestão declarada. O rótulo NÃO autoriza o claim
 *  para publicação; apenas impede tratá-lo como afirmação pública. */
const ROTULO_LINHA_INTERNA =
  /^\s*(?:[-–•*·]\s*)?(sugest[aã]o|hip[óo]tese|pendente(\s+de\s+valida[cç][aã]o)?|condicional)\b|^\s*\[(?:hip[óo]tese|sugest[aã]o|rascunho|pendente|condicional|interno)\b[^\]]{0,60}\]?|^\s*(?:[-–•*·]\s*)?nota\s*[:=]?\s*\d{1,2}(?:[.,]\d{1,2})?\s*\/\s*10\b/i;

/** CP-01 OB-C10: rótulo interno (I9) e trabalho-interno só silenciam
 *  sentença SEM linguagem material — "SUGESTÃO: prazo médio doze usos"
 *  continua claim apesar do rótulo (P-estatuto/P2). */
function semMaterialComercialCP01(t: string): boolean {
  if (sinalDeApenasArtefatoCP01(t) || sentencaEhTrabalhoInternoDeclarado(t)) return true;
  if (temVetoComercialDuroCP01(t) || temVetoDuroHardCP01(t) ||
      conteudoAssertivoEmbutido(t) || nucleoHardNaoNegado(t)) return false;
  // detector-echo: família CATEGORIA reconhece o token mesmo sob rótulo
  // ("HIPÓTESE: tesão garantido") — a etiqueta não apaga o material.
  const u = textoSemRotuloCP01(t);
  for (const cat of CATEGORIAS_GUARD) {
    const d = new RegExp(cat.detector.source, cat.detector.flags.includes("g") ? cat.detector.flags : cat.detector.flags + "g");
    if (d.test(t) || (u !== t && d.test(u))) return false;
  }
  return true;
}

function linhaRotuladaInterna(texto: string, indice: number): boolean {
  // P4.1.3R3 (CP-06 B2/I9): o rótulo interno tem ESCOPO DE SENTENÇA —
  // termina no primeiro .!? (ou fim da linha), o que chegar antes.
  // O rótulo que abre a linha NUNCA cobre a sentença/claim seguinte.
  return ROTULO_LINHA_INTERNA.test(sentencaAoRedor(texto, indice));
}

// ======================================================================
// P4.1.3R3 · CLAIM AUTHORITY CONTRACT + CLAIM LEDGER (CP-06 — CAMADA B)
// ----------------------------------------------------------------------
// Princípio: CLAIM MATERIAL PRECISA FONTE DE AUTORIDADE VERIFICÁVEL, e a
// FORÇA da afirmação nunca pode exceder a força verificável do Nível A.
// Ressoa a LÍNGUA ABERTA (não-enumeração): não são frases do CP-06 que
// viram regra — são RELAÇÕES determinísticas de força + conceito.
// ======================================================================

/** Stopwords (não-conceito) para alinhamento por conceito. */
/** CP-01: numeral extenso normalizado para valor — usado por stemsValor
 *  para que "oito" e "8" sejam o mesmo token semântico (P7). */
function numeralExtensoParaValor(t: string): string | null {
  const tabela: Record<string, string> = {
    dois: "2", duas: "2", tres: "3", quatro: "4", cinco: "5", seis: "6",
    sete: "7", oito: "8", nove: "9", dez: "10", onze: "11", doze: "12",
    treze: "13", quatorze: "14", quinze: "15", dezesseis: "16",
    dezessete: "17", dezoito: "18", dezenove: "19", vinte: "20",
    trinta: "30", quarenta: "40", cinquenta: "50", sessenta: "60",
    setenta: "70", oitenta: "80", noventa: "90", cem: "100", cento: "100",
    duzentos: "200", trezentos: "300", mil: "1000" };
  return tabela[t] ?? null;
}

/** CP-01: stems + numerais-por-valor (extensos ≡ dígitos). */
function stemsSignificativosComValor(texto: string): readonly string[] {
  const norm = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const out: string[] = [];
  const rx = /[a-z][a-z0-9]{3,}|\d{1,5}/gi;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(norm)) !== null) {
    const s = m[0].toLowerCase();
    if (/^\d{1,5}$/.test(s)) { out.push(String(parseInt(s, 10))); continue; }
    const v = numeralExtensoParaValor(s);
    if (v != null) { out.push(v); continue; }
    if (!STOPWORDS.has(s) && s.length >= 4) out.push(s);
  }
  const rxCaps = /\b[A-ZÀ-Þ]{2,}\b/g;
  while ((m = rxCaps.exec(texto)) !== null) out.push(m[0].toLowerCase());
  return out;
}

const STOPWORDS = new Set([
  "para","com","que","como","mais","muito","muita","dos","das","nos","nas",
  "pela","pelo","pelas","pelos","sobre","entre","ate","apos","antes","este",
  "esta","isto","essa","esse","isso","sua","seu","suas","seus","com"]);

/** Stems (≥5 chars alfabéticas após normalização) não-stopword do texto. */
function stemsSignificativos(texto: string): readonly string[] {
  const out: string[] = [];
  const rx = /[a-z][a-z\d]{3,}/gi;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(texto.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) !== null) {
    const s = m[0].toLowerCase();
    if (!STOPWORDS.has(s) && s.length >= 4) out.push(s);
  }
  // R4: acrônimos TÉCNICOS (ISO, UV, FDA, CDC...) são stems semânticos de
  // âmbito mesmo abaixo de 4 chars — regra estrutural (todas-maiúsculas),
  // não enumeração de destinos.
  const rxCaps = /\b[A-ZÀ-Þ]{2,}\b/g;
  while ((m = rxCaps.exec(texto)) !== null) {
    out.push(m[0].toLowerCase());
  }
  return out;
}

/** Dois stems são relação de mesma raiz (prefixo-5 ou igualdade). */
function stemMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const n = Math.min(5, Math.min(a.length, b.length));
  return n >= 4 && a.slice(0, n) === b.slice(0, n);
}

/** Habilitadores de possibilidade FORMA FRACA (conjugações comuns) — usado
 *  APENAS no contrato de força (não altera o RX compartilhado do V16). */
const RX_MODAL_FRACO =
  /\bpode\b|\bpodem\b|ajud\w*(?:\s+a\b|\s+em\b)?|tend\w*\s+a\b|contribu\w*\s+(?:a\b|para\b)|auxili\w*\s+a\b|possivelmente\b|em\s+alguns\s+casos\b|talvez\b|provavelmente\b/i;

/** Atenuadores de FORÇA (grau/escopo/limite) — reduzem a força de QUALQUER
 *  afirmação; base exclusiva do contrato de força. */
const RX_ATENUADOR_FORCA =
  /\bbaix[oa]s?\b|moderad\w*|leve\b|parcial\w*|apenas\b|somente\b|limitad\w*|restring\w*|dentro\s+de\b|por\s+at[ée]\b|no\s+m[áa]ximo\b|em\s+alguns\s+casos\b/i;


/** R4 (CP-07 RC-3): ESTATUTO EPISTÊMICO — dimensão paralela à INTENSIDADE.
 *  Escala pequena de categorias (não ontologia; não sinônimos por frase):
 *    0 relato/anedótico · 1 observação/hábito · 2 possibilidade/hipótese
 *    3 evidência/apresentação factual direta · 4 fato/comprovação
 *    5 promessa · 6 garantia/determinismo absoluto.
 *  Elevação de estatuto sobre conceito alinhado = não-prova determinística
 *  de equivalência → REVISÃO (fail-closed). */
function estatutoEpistemico(sentenca: string): number {
  // R5 (CP-08 §14): estrutura condicional "Se X, então Y" não eleva o fato
  if (/^[\s"'“”‘’]*(?:quando\s+(?:não\s+)?for|se\s+[^,]{4,40},|apenas\s+se\b|caso\s+(?:mais\s+)?)/i.test(sentenca)) return 2;
  if (/\bgarant\w*\b|\binevit[áa]vel\b|\bgarante\b|\bgarantido\b|\bgarantem\b/i.test(sentenca)) return 6;
  if (/\bpromete\w*\b|\bcomprometem\w*\b|\basseguram\w*\b|\bprote\w*\s+sempre\b/i.test(sentenca)) return 5;
  if (/\bfato\b|\bcomprovad\w*\b|\bprovad\w*\b|\bcerteza\s+de\b|\bverdade\s+de\b|\bestudos?\s+prova\w*|\bestabelecid\w*\b/i.test(sentenca)) return 4;
  if (/\bevid[êe]nci\w*\b|\bestudos?\b|\bpesquis\w*\b|\bdados\s+(?:indicam|mostram|revelam)\b|\bdemonstrad\w*\b|\bobservad\w*\s+resultado/i.test(sentenca)) return 3;
  const temPossibilidade =
    RX_MODAL_HABILITADOR.test(sentenca) ||
    RX_MODAL_FRACO.test(sentenca) ||
    /\bhip[óo]tese\b|\bcostuma\w*\b|\beventualmente\b|\bpor\s+vezes\b|\bocasionalmente\b|\b[ée]\s+poss[íi]vel\b|\bpossivelmente\b/i.test(sentenca);
  if (temPossibilidade) return 2;
  if (/\bobserv\w+\b|\bnotamos\b|\bperceb\w+\b|\bregistramos\b|\brece(?:be|bem|bemos)\s+(?:feedbacks?|avalia[\wÀ-ÿ]*)\b/i.test(sentenca)) return 1;
  if (/\brelatos?\b|\balguns?\s+relatos?\b|\buser.?testimonials?\b|\baned\w+\b|\bdepoiment\w*\b/i.test(sentenca)) return 0;
  return 3; // default: apresentação factual (equivalente a evidência-afirmada)
}

/** R4 (CP-07 RC-2): segmento modificador-governante — não possui tema
 *  próprio (sem stems de entidade fora do alinhamento/bucket de hedges,
 *  sem numeral). Heurística de CAUSALIDADE LINGUÍSTICA em lugares
 *  onde remover-se-ia modal/condição se cortado da janela. */
const HEDGE_STEMS = new Set([
  "tese","principio","principi","regra","caso","geral","avaliacao","condicao",
  "cenario","possibilidade","eventualidade","razao","certo","certa",
  "aspecto","aspectos","termos","medida",
  "mediante","conforme","segundo","dependendo","dependente","respeito","relacao"]);
function stemDe(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function ehSegmentoModificador(seg: string, stemsClaim: ReadonlySet<string>): boolean {
  if (/\d/.test(seg)) return false;                    // numeral = novo tópico
  // modal/aproximador em qualquer lugar do segmento = modificador puro
  if (RX_MODAL_HABILITADOR.test(seg) || RX_MODAL_FRACO.test(seg) || RX_APROXIMADOR.test(seg)) return true;
  const stems = stemsSignificativos(seg).map(stemDe);
  for (const st of stems) {
    if (HEDGE_STEMS.has(st)) continue;                  // hedge/condicional lexical
    let alinh = false;
    for (const sc of stemsClaim) if (stemMatch(st, sc)) { alinh = true; break; }
    if (!alinh) return false;                           // outro tema com stem próprio
  }
  return true;
}

/** Janela governante: segmentos alinhados + walk back/forward SOMENTE sobre
 *  segmentos modificadores (nunca perde modal/condição/qualificador que
 *  governa o suporte analisado). */
function suporteJanelaGovernante(sentencia: string, stemsClaim: ReadonlySet<string>): string {
  const segs = sentencia.split(/[;,]/).map((s) => s.trim()).filter((s) => s.length > 0);
  if (segs.length <= 1) return sentencia;
  const idxAlinhados = new Set<number>();
  for (let i = 0; i < segs.length; i += 1) {
    const st = stemsSignificativos(segs[i]).map(stemDe);
    let alinh = false;
    for (const a of st) for (const b of stemsClaim) if (stemMatch(a, b)) { alinh = true; break; }
    if (alinh) idxAlinhados.add(i);
  }
  if (idxAlinhados.size === 0) return sentencia;
  const colher = new Set<number>(idxAlinhados);
  const minA = Math.min(...idxAlinhados);
  // walk back: inclui apenas segmentos modificadores em sequência
  for (let j = minA - 1; j >= 0; j -= 1) {
    if (ehSegmentoModificador(segs[j], stemsClaim)) colher.add(j);
    else break;
  }
  // walk forward: mantém apenas alinhados (mesmo predicado), não outros temas
  const partes = segs.filter((_, i) => colher.has(i));
  return partes.join(", ");
}

/** FORÇA semântica determinística de uma sentença (CLAIM-side).
 *  Escala inteira; quanto MAIOR, mais absoluta/garantida a afirmação.
 *  Valores propositalmente esparsos: tolereença de ±1 não mata equivalência. */
function forcaSemantica(sentenca: string): number {
  let forca = 0;
  // absolutos marcados (+3): maximalist/eimination/fixed-claims
  if (/\b(?:elimin\w*|garante\w?|garantem|garantid\w*|zera\b|zeram\w*|sempre\b|jamais\b|nunca\b|absolut\w*|100%\b|totalmente\b|completamente\b|definitiv\w*|permanent\w*)\b/i.test(sentenca)) forca += 3;
  // negação ausencial sobre a noção (+3) — operadores curados OU negação
  // direta "não X" (éstate-declarado absoluto; B7: "não irrita" é não
  // mais fraca que "não provoca", pelo contrário). Sem stacking: máx +3.
  const negacaoAbsoluta =
    new RegExp(RX_OPERADOR_AUSENCIA.source, "i").test(sentenca) ||
    /\bn[ãa]o\s+\w[a-zà-ÿ]{3,}\b/i.test(sentenca);
  if (negacaoAbsoluta) forca += 3;
  // forma DIRETA (+2): sem habilitador modal (forma forte OU fraca)
  const temModal =
    RX_MODAL_HABILITADOR.test(sentenca) || RX_MODAL_FRACO.test(sentenca);
  if (!temModal && !RX_APROXIMADOR.test(sentenca)) forca += 2;
  // quantificador escalado (+nivel) — SÓ sobre população (mesmo gate do
  // V16): "todos os dias" (frequência idiomática) não é força de claim.
  // "por todos"/"é para todos" (universal de sujeito) CONTA, exceto se
  // seguido de unidade TEMPORAL idiomática (todos os dias/semanas/...).
  const nq = nivelQuantificador(sentenca);
  const temPopulacao =
    RX_TERMOS_POPULACAO.test(sentenca) ||
    /\btod(?:os|as)\b(?!\s+os?\s+(?:dias?|semanas?|mes(?:es)?|anos?|horas?|minutos?|tempos?)\b)/i.test(sentenca);
  if (nq > 0 && temPopulacao) forca += nq;
  // atenuadores (-2): manter força fraca quando atenuada
  if (RX_QUALIFICADOR_MATERIAL.test(sentenca)) forca -= 2;
  if (RX_ATENUADOR_FORCA.test(sentenca)) forca -= 2;
  if (temModal) forca -= 2;
  if (RX_APROXIMADOR.test(sentenca)) forca -= 2;
  return forca;
}

/** Par alinhado: sentença da peça × melhor suporte conceitual do Nível A.
 *  BLOQUEIO se: existe alinhamento forte (≥1 stem compartilhado relevante)
 *  E força(peça) excede força(qualquer suporte alinhado). */
function expansaoForcaSemantica(
  textoPeca: string,
  nivelA: string
): { inicio: number; sentenca: string; suporte: string; forcaP: number; forcaS: number; estadP: number; estadS: number; overlap: number }[] {
  const out: { inicio: number; sentenca: string; suporte: string; forcaP: number; forcaS: number; estadP: number; estadS: number; overlap: number }[] = [];
  const sentA = sentencasDe(nivelA);
  if (sentA.length === 0) return out;
  const stemsA = sentA.map((s) => new Set(stemsSignificativos(s)));
  const sentencas = sentencasDe(textoPeca);
  let cursor = 0;
  for (const sentenca of sentencas) {
    const iniS = textoPeca.indexOf(sentenca, cursor);
    cursor = iniS + sentenca.length;
    const stemsP = new Set(stemsSignificativos(sentenca));
    if (stemsP.size === 0) continue;
    // melhor alinhamento: sentença do Nível A com maior interseção de stems
    let melhor: { idx: number; overlap: number } = { idx: -1, overlap: 0 };
    for (let i = 0; i < sentA.length; i += 1) {
      let ov = 0;
      for (const st of stemsP) {
        for (const sa of stemsA[i]) if (stemMatch(st, sa)) { ov += 1; break; }
      }
      if (ov > melhor.overlap) melhor = { idx: i, overlap: ov };
    }
    // alinhamento mínimo: 1 stem significativo (senão não há contrato a
    // comparar); FALLBACK populacional: ambos os lados falam de POPULAÇÃO
    // quantificada (tema compartilhado mesmo sem léxico em comum — e.g.
    // "usável por todos" × "adequado para a maioria das pessoas").
    if (melhor.idx === -1 || melhor.overlap < 1) {
      const nqP = nivelQuantificador(sentenca);
      let bestIdx = -1, bestNq = -1;
      for (let i = 0; i < sentA.length; i += 1) {
        const nqA = nivelQuantificador(sentA[i]);
        if (nqA > bestNq && RX_TERMOS_POPULACAO.test(sentA[i])) {
          bestNq = nqA; bestIdx = i;
        }
      }
      if (nqP < 4 || bestIdx === -1) continue;
      melhor = { idx: bestIdx, overlap: 0 };
    }
    // R4 (CP-07 RC-2): janela GOVERNANTE — inclui apenas segmentos
    // alinhados + modificadores adjacentes (modal/condição/qualificador
    // que governa o suporte nunca é removido). Outros temas da sentença
    // longa NÃO derrubam fS, portanto fS também NÃO se infla.
    const suporte = sentA[melhor.idx];
    const janela = suporteJanelaGovernante(suporte, stemsP);
    const fP = forcaSemantica(sentenca);
    const fS = forcaSemantica(janela);
    const estadP = estatutoEpistemico(sentenca);
    const estadS = estatutoEpistemico(janela);
    if (fP > fS || estadP > estadS) {
      out.push({ inicio: iniS, sentenca, suporte: janela, forcaP: fP, forcaS: fS, estadP, estadS, overlap: melhor.overlap });
    }
  }
  return out;
}

// ----------------------------------------------------------------------
// CLAIM LEDGER — bloco estrutural opcional (BLOCO:CLAIM_LEDGER), removível
// do público como transporte interno. NEVERIAL: o ledger do agente é DADO
// NÃO-CONFIÁVEL; o Gate só verifica evidência LITERAL + força. Nunca uma
// entrada de ledger AUTORIZA por conta própria.
// ----------------------------------------------------------------------

interface EntradaLedger {
  readonly claim: string;
  readonly suporte: string;
  readonly classe: string | null; // informativa apenas
}

/** Extrai entradas do BLOCO:CLAIM_LEDGER (multi-linha, determinístico). */
export function extrairClaimLedger(raw: string): readonly EntradaLedger[] {
  const rx = /---\[BLOCO:CLAIM_LEDGER[^\]\r\n]*\]---\r?\n?([\s\S]*?)(?=\n?---\[FIM:BLOCO:CLAIM_LEDGER[^\]\r\n]*\]---|$)/gi;
  const out: EntradaLedger[] = [];
  let bloco: RegExpExecArray | null;
  while ((bloco = rx.exec(raw)) !== null) {
    const corpo = bloco[1];
    let claim = "", suporte = "", classe: string | null = null;
    const flush = () => {
      if (claim.trim() || suporte.trim()) {
        out.push({ claim: claim.trim(), suporte: suporte.trim(), classe });
      }
      claim = ""; suporte = ""; classe = null;
    };
    for (const linha of corpo.split(/\n+/)) {
      const mC = linha.match(/^\s*(?:[-*•]\s*)?CLAIM\s*[:=]\s*(.+)$/i);
      const mS = linha.match(/^\s*(?:[-*•]\s*)?SUPORTE(?:_NIVEL_A)?\s*[:=]\s*(.+)$/i);
      const mK = linha.match(/^\s*(?:[-*•]\s*)?CLASSE\s*[:=]\s*(.+)$/i);
      if (mC) { if (claim || suporte) flush(); claim = mC[1]; continue; }
      if (mS) { suporte = mS[1]; continue; }
      if (mK) { classe = mK[1].trim().toUpperCase(); continue; }
      if (linha.trim().match(/^[“"](.*)["”]\s*$/)) {
        const inner = linha.trim().replace(/^[“"]|["”]$/g, "");
        if (claim && !suporte) { suporte = inner; }
      }
    }
    flush();
  }
  return out;
}

/** Citação literal existe no Nível A? Normaliza whitespace/case/diacríticos. */
function citacaoLiteral(textoCitacao: string, nivelA: string): boolean {
  const norm = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  // R5 (CP-08 §17): tolerância superficial a pontuação — mas os TOKENS da
  // citação aparecem na SEQUÊNCIA EXATA no Nível A; falidor salância falha.
  const citS = norm(textoCitacao).replace(/^[“\"]|"|[”]$/g, "");
  const tokens = citS.replace(/[/"'“”«»()\[\]\-]/g, " ").split(/[^\wÀ-ÿ0-9%]+/).filter(Boolean);
  if (tokens.length === 0) return false;
  const base = norm(nivelA).replace(/[/"'“”«»()\[\]\-]/g, " ").split(/[^\wÀ-ÿ0-9%]+/).filter(Boolean);
  top:
  for (let i2 = 0; i2 + tokens.length <= base.length; i2++) {
    for (let j = 0; j < tokens.length; j++) {
      if (base[i2 + j] !== tokens[j]) continue top;
    }
    return true;
  }
  return false;
}

/** Verifica o ledger: citações inexistentes BLOQUEIAM; suporte FRACO com
 *  claim FORTE BLOQUEIA mesmo se a citação é literal. */
function verificarClaimLedger(
  rawPeca: string,
  nivelA: string
): AchadoEpistemico[] {
  const achados: AchadoEpistemico[] = [];
  const entradas = extrairClaimLedger(rawPeca);
  for (const ent of entradas) {
    // uma entrada segura NUNCA autoriza outra claim fora dela
    // (validação é POR ENTRY, e achados AUTÔNOMOS não são suprimidos)
    if (ent.suporte && ent.claim) {
      if (!citacaoLiteral(ent.suporte, nivelA)) {
        achados.push({
          categoria: "LEDGER_CITACAO_INEXISTENTE",
          trecho: corteTrecho(rawPeca, 0, 60),
          norma: "BLOQUEIO",
          porque:
            "CLAIM LEDGER cita suporte que NÃO consta literalmente no Nível A — citação fabricada/erro. CLASSE declarada pelo agente é dado não confiável.",
        });
        continue;
      }
      const fc = forcaSemantica(ent.claim);
      const fs = forcaSemantica(ent.suporte);
      if (fc > fs) {
        achados.push({
          categoria: "LEDGER_SUPORTE_FRACO",
          trecho: corteTrecho(rawPeca, 0, 60),
          norma: "BLOQUEIO",
          porque:
            `suporte citado (${fs}) é mais FRACO que o claim (${fc}) — mesma relação semântica insuficiente. Fail-closed.`,
        });
      }
    } else if (ent.claim && !ent.suporte) {
      achados.push({
        categoria: "LEDGER_SEM_SUPORTE",
        trecho: corteTrecho(rawPeca, 0, 60),
        norma: "BLOQUEIO",
        porque:
          "CLAIM LEDGER apresenta claim material SEM suporte verificável — ausência de suporte não recebe APROVADO silencioso.",
      });
    }
  }
  return achados;
}


// ======================================================================
// P4.1.3R4 · CLOSED CLAIM AUTHORITY CONTRACT (CP-07 — FAIL-CLOSED)
// ----------------------------------------------------------------------
// Invariante: TODA AFIRMAÇÃO MATERIAL PUBLICÁVEL precisa possuir autoridade
// verificável no NÍVEL A. Ausência de suporte identificável NÃO significa
// aprovação — vira SEM_SUPORTE_IDENTIFICADO (REVISÃO mínima). Liberdade
// criativa NÃO-MATERIAL continua livre: a rede só é ancorada em famílias
// explicitamente factuais (credibilidade externa, superlativo, compromisso
// de serviço, entrega-prazo, reembolso, escassez, proteção específica,
// resultado temporal) — não existe "motor genérico de fato".
// ======================================================================

/** RX dos âncoras MATERIAIS PUBLICÁVEIS (categorias, não frases). */
const FAMILIAS_ANCORA: readonly {
  nome: string;
  rx: RegExp;          // detector de âncora
  temaRx: RegExp;      // termo-tema p/ ENCONTRAR menção no Nível A
  temaFiltro?: RegExp; // termo-tema que NÃO conta como âmbito (default temaRx)
  witness: boolean;    // exige representação coberta no Ledger
  norma: "BLOQUEIO" | "QUALIFICAR";
}[] = [
  { nome: "AUTORIDADE_EXTERNA", rx: /\b(?:anvisa|inmetro|minist[ée]rio\w*|conselho|sindicato\w*)\b|\baprovad\w*\s+(?:pel[oa]s?\b|por\b)|\baprova[çc][ãa]o\s+(?:pel[oa]s?\b|por\b|de\b)|\bindicad\w*\s+por\b/i,
    temaRx: /anvisa|inmetro|minist[ée]rio|aprovad|aprova[çc]|indicad/i, witness: true, norma: "BLOQUEIO" },
  { nome: "CERTIFICACAO_PATENTE", rx: /\bcertific\w*\b|\bselo\b|\bpatente\w*\b|\bpatentea\w*\b|\bis\s*\d{4}\b|\biso\b/i,
    temaRx: /certific|selo|patente|iso\b/i,
    temaFiltro: /certific|selo|patente/i, // ISO é ÂMBITO, não palavra-tema
    witness: true, norma: "BLOQUEIO" },
  { nome: "REGISTRO_OFICIAL", rx: /\bregistr\w*\s+(?:no|na|perante)\b|\bpropriedade\s+registrada|\binscrit\w*\s+no\b/i,
    temaRx: /registr|inscrit/i, witness: true, norma: "BLOQUEIO" },
  { nome: "RANKING_SUPERLATIVO", rx: /\bmais\s+vendid\w*\b|\bn[úu]mero\s+1\b|\bnumero\s+um\b|\bl[íi]der\w*\b|\bl[íi]deres\b|\bmaior\s+do\s+(?:brasil|pa[íi]s|mercado|nicho)\b|\bmelhor\s+do\s+(?:brasil|pa[íi]s|mercado)\b|\b(?:maior|melhor)\s+(?:rede|cadeia|fabricante|marca|produto|vendedor\w*|plataforma|empresa|grupo|clube|centro)\b[^.!?\n]{0,30}?\bdo\s+(?:brasil|pa[íi]s|mercado|nicho)\b/i,
    temaRx: /vendid|l[íi]der|maior|melhor|ranking|n[úu]mero/i, witness: true, norma: "BLOQUEIO" },
  { nome: "PREMIACAO", rx: /\bpremiad\w*\b|\bvencedor\w*\b|\bpr[êe]mio\s+(?:nacional|internacional|de\s+\w{4,})/i,
    temaRx: /premi|venc/i, witness: true, norma: "BLOQUEIO" },
  // Score público afirmado ("4,9 estrelas", "nota 9,5") = credibilidade
  // externa: precisa estar verificável no Nível A (âmbito) OU registro ledger.
  { nome: "EFICACIA_PUBLICA", rx: /\befic[aá]z\b|efic[aá]cia\b|\bfunciona\s+(?:sempre|de\s+verdade|mesmo)\b|\bresultados?\s+(?:demonstram?|provam?|comprovam?|garantem?)/i,
    temaRx: /efic|funciona|demonstr|resultado/i, witness: false, norma: "QUALIFICAR" },
  { nome: "AVALIACAO_SCORE", rx: /\b\d{1}(?:[.,]\d)?\s+estrel\w*\b|\bnota\s+\d{1,2}(?:[.,]\d)?\b|\b\d{1,2}(?:[.,]\d)?\s+de\s+avalia[\wÀ-ÿ]*\b/i,
    temaRx: /estrel|nota|avalia/i, witness: true, norma: "BLOQUEIO" },
  { nome: "COMPROMISSO_SERVICO", rx: /\b(?:\d{2}\s*horas?|24\s*h)\s*(?:por\s+dia|ao\s+dia|por\s+semana)?\b|\bsuporte\s+(?:24|integral|tempo\s+inteiro)\b|\batendimento\s+24\b|\bsuporte\s+em\s+tempo\s+real\b/i,
    temaRx: /suporte|atendimento|horas?\b/i, witness: false, norma: "QUALIFICAR" },
  { nome: "ENTREGA_PRAZO", rx: /\bentrega\w*\s+(?:em\s+at[ée]\s+|em\s+)?\d+\s*(?:dia(?:s)?|semanas?|horas?)\b|\bprazo\s+de\s+entrega\s+(?:de\s+|em\s+)?\d+\s*(?:dias?|semanas?)\b|\benvio\s+(?:em\s+|at[ée]\s+)?\d+\s*(?:dias?|horas?)\b/i,
    temaRx: /entrega|envio|prazo/i, witness: false, norma: "QUALIFICAR" },
  { nome: "REEMBOLSO_DEVOLUCAO", rx: /\bdevolu[\wÀ-ÿ]+\s+(?:do\s+)?(?:dinheiro|valor|pagamento)\b|\breembolso\b|\bdinheiro\s+de\s+volta\b|\breembolsamos\b/i,
    temaRx: /devolu|reembols|dinheiro\s+de\s+volta/i, witness: false, norma: "BLOQUEIO" },
  { nome: "ESCASSEZ_URGENCIA", rx: /(?:^|[^\wÀ-ÿ])[úu]ltimas?\s+unidades\b|\bestoque\s+(?:limitado|acabando|esgotando)|\bacaba\s+em\s+breve\b|(?:^|[^\wÀ-ÿ])[úu]ltim\w+\s+dispon[íi]veis\b/i,
    temaRx: /estoque|unidades|acaba/i, witness: false, norma: "QUALIFICAR" },
  { nome: "PROVA_EXTERNA", rx: /\blaborat[óo]ri\w*\b|\btestad[\wÀ-ÿ]*\s+e\s+aprovad\w*|\b(?:testes?\s+)?(?:em\s+|de\s+)laborat[óo]ri\w*|\btestes?\s+cl[íi]nicos\b|\bavaliad[\wÀ-ÿ]*\s+por\s+(?:especialistas?|profissionais?)\b/i,
    temaRx: /laborat|clinic|especialist|teste/i, witness: true, norma: "BLOQUEIO" },
  { nome: "PROVA_VERIFICACAO", rx: /\btestad\w*\s+(?:dermatologicamente|clinicamente|por\s+especialistas?)\b|\bverificad\w*\s+(?:por|pelo)|\banalisad\w*\s+por\s+laborat/i,
    temaRx: /teste|dermatol|clinic|verific|analis/i, witness: true, norma: "BLOQUEIO" },
  { nome: "PROTECAO_ESPECIFICA", rx: /\bprote\w*\s+contra\s+(?:raios?\s*(?:uv)?|uv|sol\b|frizz\s*(?:extremo)?|chuva)\b|\bfator\s+de\s+prote[\wÀ-ÿ]+\s*\d*\b|\bfps\s*\d+\b/i,
    temaRx: /prote|raios|fps/i, witness: false, norma: "BLOQUEIO" },
  { nome: "ATRIBUTO_ESPECIFICO", rx: /\bvegan[ao]\w*\b|\bcruelty\s*free\b|\bhipoalerg[êe]nic\w*\b|\bsem\s+gl[úu]ten\b|\bzero\s+(?:a[çc][úu]car|lactose)\b|\bdermatologicamente\s+testad\w*\b/i,
    temaRx: /vegan|cruelty|hipoalerg|gl[úu]ten|a[çc][úu]car|lactose|dermatologicamente/i, witness: false, norma: "QUALIFICAR" },
  { nome: "OFERTA_AMPLA", rx: /\boferta\w*[^.!?\n]{0,30}\btod[oa]s?\b/i,
    temaRx: /oferta/i, witness: false, norma: "QUALIFICAR" },
  { nome: "RECOMENDACAO_USO", rx: /\bindicad\w*\s+(?:para|pelo|pela|por)\b|\bindicad[\ ]?pela\b|\brecomendad\w*\s+(?:por|pelo|pela|para)\b|\brecomendam\s+[oa]?\b|\bindicam\b/i,
    temaRx: /indicad|gestant|pele|uso|recomend/i, witness: false, norma: "QUALIFICAR" },
  { nome: "RESULTADO_TEMPORAL", rx: /\bresultado\s+(?:vis[íi]vel|imediat\w*)\b|\bna\s+(?:primeira|segunda|terceira)\s+(?:aplica[\wÀ-ÿ]*|semana|dose)\b|\bem\s+\d+\s+(?:dias?|semanas?)\s+de\s+uso\b/i,
    temaRx: /resultado|dias?|semanas?|aplica/i, witness: false, norma: "QUALIFICAR" },
];

/** Comp rted de verificação — a âncora constitui um claim factual publicável
 *  unânimo; tenta autoridade por TEMA + ÂMBITO. Não-suficiente → SEM_SU. */
export interface AncoraMaterial {
  familia: string;
  witness: boolean;
  norma: "BLOQUEIO" | "QUALIFICAR";
  sentenca: string;
  inicio: number;
  temaRx: RegExp;
  temaFiltro?: RegExp;
}

export function ancorasMateriais(texto: string): AncoraMaterial[] {
  const out: AncoraMaterial[] = [];
  const sentencas = sentencasDe(texto);
  let cursor = 0;
  for (const sentenca of sentencas) {
    const ini = texto.indexOf(sentenca, cursor);
    cursor = ini + sentenca.length;
    for (const fam of FAMILIAS_ANCORA) {
      const rx = new RegExp(fam.rx.source, fam.rx.flags);
      if (rx.test(sentenca)) {
        out.push({ familia: fam.nome, witness: fam.witness, norma: fam.norma, sentenca, inicio: ini, temaRx: fam.temaRx, temaFiltro: fam.temaFiltro });
      }
    }
  }
  return out;
}

// ======================================================================
// P4.1.3R5 — OPEN-WORLD MATERIAL ASSERTION GATE + SAFE HARBOR (CP-08)
// ------------------------------------------------------------------
// Diagnóstico CP-08: RECONHECIMENTO era enumerativo — sem âncora, sem
// guarda (12/12 unknown-family APROVADO). Inversão do portão: qualquer
// predicação factual plausível sobre entidade comercial que NÃO esteja
// comprovadamente em safe-harbor determinístico → INCERTEZA MATERIAL
// → REVISÃO. Safe harbor nunca deriva de label autodeclarado pelo agente.
// ======================================================================

/** Entidades comerciais por CONCEITO (não payload): substantivos no núcleo
 *  do claim — POSSE OU estrutura ENTIDADE+VERBO factual. */
const RX_ENTIDADE_COMERCIAL =
  /\b(?:marca|produt\w*|servi[çc]\w*|empresa\w*|equipe\w*|f[óo]rmula\w*|oferta\w*|profission\w*|sal[ãa]o\w*|loja\w*|site\w*|aplicativ\w*|app\b|plan[oa]\w*|suporte\w*|entrega\w*|garantia\w*|tratamento\w*|cosm[ée]tic\w*|sistema\w*|plataforma\w*|cl[ií]nica\w*|consult[óo]ri\w*|est[úu]dio\w*|consultoria\w*|escola\w*|curso\w*|assinatura\w*|protocolo\w*|fornecedor\w*|dado\w*|programa\w*|conv[êe]nio\w*|log[ií]stica\w*|marketplace\w*|e[- ]?commerce\w*|cat[áa]logo\w*|estoque\w*|banco\s+de\s+dados|pol[íi]tica\s+(?:de\s+)?privacidade|demonstra[çc][ãa]o\w*|estoque\w*|store\w*|hist[óo]ric\w*|dados?\b|arquiv\w*|prefer[êe]nci\w*|configura[çc][õo]\w*|agenda\w*|sal\w*|time\w*|carta\w*\s+de\s+servi[çc]os|hot[ée]\w*|resort\w*|pousada\w*|f[áa]bric\w*|armaz[ée]m\w*|funcion[áa]ri\w*|usu[áa]ri\w*|paciente\w*|alun[oi]\w*|estudante\w*|assinante\w*|doador\w*|participante\w*)/i;

/** Verbo factual nominal (forma base). Cobre as DECISOES CP-08 estruturais
 *  sem regex-por-payload: cópula ou lexical comercial/factual. */
const RX_VERBO_FACTUAL =
  // Borda PT-BR: JS \b não casa antes de 'é/ã/ç' — usa-se classe explícita.
  /(?:^|[^\wÀ-ÿ])(?:[ée](?:ramos|ram|ra)?(?![\wÀ-ÿ])|s[ãa]o|est[áa]\w*|est[ãa]o|foi\w*|foram|ser[áa]\w*|ser[ãa]o|vai\s|vamos\s|t[êe]m\w*|temos\w*|faz\w*|oferec\w*|inclu\w*|aceit\w*|atend\w*|usa\w*|utiliz\w*|produz\w*|permite\w*|funciona\w*|vem\b|v[êe]m\b|possu\w*|mant[ée]m\w*|mantem\w*|segue\w*|pertenc\w*|participa\w*|garant\w*|entrega\w*|suporta\w*|treina\w*|integra\w*|armazen\w*|adota\w*|respeita\w*|cumpre\w*|emprega\w*|contrat\w*|fornece\w*|comercializ\w*|distribu\w*|opera\w*|compens\w*|carrega\w*|vale\b|cust\w*|dura\w*|alcança\w*|atinge\w*|rende\w*|gera\w*|devolve\w*|reembolsa\w*|beneficia\w*|protege\w*|analis\w*|convers\w*|conecta\w*|fabrica\w*|resist\w*|administra\w*|gerencia\w*|desenha\w*|valida\w*|respond\w*|facilita\w*|ocup\w*|orient\w*|consiste\w*|prepar\w*|dura|fabric\w*|formad\w*|demonstr\w*|gradua\w*|capacita\w*|domina\w*|aprend\w*|ating\w*|espera\w*\s+(?:o|a)\s+\w+\s+de\s+|segura\w*\s+(?:a|o)|chama\w*|tira\w*|encerra\w*|redefine\w*|conta\w*\s+(?:com|de)?sediada?\w*|fundada?\w*|existe\w*|cobra\w*|recebe\w*|paga\w*|revel\w*|anunci\w*|ritmo?\w*\s+(?:de|com)|conta\s+com|trabalha\w*|trabalhamos\w*|lança\w*|lançado\w*|lançamento\w*|premi\w*|vence\w*|contém\w*|contem\w*|reage\w*|cura\w*|mitiga\w*|elimina\w*|trata\w*|hidrata\w*|limita\w*|suporta\w*|trava\w*|acelera\w*|otimiza\w*|calibra\w*|reduz\w*|trafeg\w*|resgat\w*|bloqueia\w*|monitora\w*|audita\w*|condiciona\w*|mape\w*|escaneia\w*|guarda\w*|grava\w*|sincroniz\w*|mobiliz\w*|fideliz\w*|premia\w*|dura\w*\s|mant[ée]m-se\b|mantem-se\b|atua\w*|atuam\b|opera\b|opera\w*\s)/i;

const RX_COPULA_FACTUAL =
  /(?:^|[^\wÀ-ÿ])(?:[ée](?:ramos|ram|ra)?(?![\wÀ-ÿ])|s[ãa]o|est[áa]\w*|est[ãa]o|foi\b|foram\b|ser[áa]\w*|ser[ãa]o)\b/i;

const RX_POSSE_COMERCIAL =
  /\b(?:noss[ao]s?|da\s+(?:empresa|marca|cl[ií]nica|equipe|rede|loja|tradi[çc][ãa]o)|(?:nosso|nossa)\s+(?:produto|servi[çc]o|tratamento|protocolo|cat[áa]logo|estoque|aplicativ\w*|hotel|plan[oa]\w*|atendimento)\b)\b/i;

const RX_SAFE_HARBOR_CINE =
  /\b(?:c[âa]mera?\b|lente\w*|zoom\b|dolly\w*|gimbal\w*|travelling\w*|steadicam\w*|trilha\s+(?:sonora\w*|musical)|spotlight\w*|ilumina[çc][ãa]o\b|contra[- ]?luz\w*|fade(?:\s+in|\s+out)?\w*|transi[çc][ãa]o\w*|corte\s+seco\w*|pov\b|take\b|claquete\w*|cr[ée]ditos?\b|voice[- ]?over\w*|di[áa]logo\s+interno|storyboard\w*|dire[çc][ãa]o\s+de\s+arte\w*|croma[-\s]?key\b|green[- ]?screen\w*|plano\s+(?:geral|sequ[êe]ncia|abrerto|fechado)|crash[- ]?zoom\w*|whip[- ]?pan\w*|tela\s+dividida\w*|split[- ]?screen\w*|color\s*grad\w*|lut\b|corta\w*\s+(?:seco|para)|contra[- ]?plon|contra[- ]?plong[ée]e|plong[ée]e\w*|sonora\w*|soundtrack\w*|fader\w*|fade(?:s)?\s+to|m[úu]sica\b|corte\b|montagem\b|trip[ée]\b|[áa]udio\s+ambiente|pacing\b|trilha\s+sonor|[áa]udio\b|filtro\s+(?:de\s+cor|quente|frio|neutro)|desfoque\w*|bokeh\w*|\bluz\s+(?:quente|fria|natural|ambiente|suave|dura\w*|dourad\w*|difusa|indireta|dram[áa]tica|neon\b|azulada|esfuma[çc]ada))/i;

const RX_NARRATIVA_PERSONAGEM =
  /^\s{0,20}(?!(?:quem|o|a|os|as|um|uma|de|da|do|das|dos|em|no|na|nos|nas|por|para|com|sem|sob|at[ée]|isso|isto|este|esta|esse|essa|aquilo|algu[ée]m|alguem|ningu[ée]m|ninguem|tudo|nada|algo|melhorias?|mudan[çc]as?|coisas?|pessoas?|todos|todas)\b\s)[A-ZÁÀÃÂÉÊÍÓÔÕÚÇ][\wÀ-Ö-ö-ÿ]+\s+(?:entra\w*|entr\w*|sa[ií]\w*|olh\w*|sorr\w*|caminh\w*|corr\w*|observ\w*|diz(?:em|iam|eu)?\b|pens\w*|record\w*|esper\w*|fech\w*|abr\w*|peg\w*|tom\w*|acord\w*|levant\w*|sent\w*|suspi\w*|ri(?:u|m|ndo)?\b|chor\w*|sussurr\w*|toc\w*|sent\w*|cruz\w*|pos\w*|repar\w*|surge\w*|aparec\w*|viv\w*|segur\w*|abra[çc]\w*|and\w*|descans\w*|cheg\w*|dorm\w*|fal\w*|volt\w*)/i;

/** Núcleo material nominal (se qualquer casa, NÃO é safe-harbor). */
const RX_NUCLEO_MATERIAL_HARD =
  /\b(?:roi\b|empreg\w{2,8}|funcion[áa]ri\w*|m[âa]xim\w+\s+de\s+\w+|premio\w+\s+nacional|fellowshipp?\w*|conformidade\s+ambiente|quanta\w+\s+dos|categoria\s+l\w+|conta\s+com\s+\w+\s+anos|(?:pre[çc]os?|pre[çc][áa]rio\w*|precifica\w*|pre[çc]inho)|descont\w*|cupom\w*|parcel\w*|pagamento\w*|reembols\w*|devolu[çc]\w*|aprovad\w*|certifica\w*|patente\w*|selo\w*|iso\s*\d+|anvisa\b|inmetro\b|fda\b|vigil[âa]ncia\s+sanit[áa]ria|registrad\w*|conformidade\w*|lgpd\w*|testad\w*|verificad\w*|comprovad\w*|demonstrad\w*|clinicamente|laborat[óo]ri\w*|homologad\w*|registro\w*|laudo\w*|\d+\s*%|\d+\s+por\s+cento|\d+\s*[x×]\b|\d+\s+vezes|leve\s+\d+|pague\s+\d+|metade\s+do\s+pre[çc]o|dobro\s+do\s+pre[çc]o|\d+\s+(?:anos|meses|dias|horas|vagas|clientes|sessões|parcelas+|aplicações|aplicacao)|100\s*%|sem\s+taxas?\w*|sem\s+custos?\b|\bfrete\w*|\beconômic\w*|\beconomic\w*|\blucrativ\w*|\bvale\s+a\s+pena\b|\bvital[íi]ci\w*|a\s+partir\s+de\s+R\$|shipping\w*|royalt\w*|franqu\w*|licenci\w*|certifica\w*|acompanhamento\s+de\s+\w+\s+anos|hist[óo]ria\s+de\s+\w+\s+anos|origem\b|proced[êe]ncia\w*|compartilhad\w+|terceiros\b)/i;

const RX_NUMERAL_EXTENSO =
  "(?:\\d{1,4}|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|quatorze|quinze|(?:dezenove|dezessete|dezesseis|dezoito)|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem|cento|duzent[ao]s|trezent[ao]s|quatrocent[ao]s|quinhent[ao]s|seiscent[ao]s|setecent[ao]s|oitocent[ao]s|novecent[ao]s|dezenas?|centenas?|milhares?|milh(?:ões|ão)|mil\\b)(?:\\s+e\\s+(?:um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove))?";
/** Quantificação factual comercial: numeral (extenso ou dígito, com até 2
 *  palavras medianas — "dezessete instrutores por mês", "quinhentas mil
 *  unidades") + unidade de oferta/escala. Classe determinística, não
 *  enumeração de payload: a unidade pertence ao domínio comercial. */
const RX_QUANTIFICACAO_MATERIAL = new RegExp(
  "\\b" + RX_NUMERAL_EXTENSO + "(?:\\s+[\\wÀ-ÿ%]+){0,2}\\s*(?:%|por\\s+cento|[x×]\\b|vezes|aplica[çc][õo]\\w*|sess[õo]\\w*|parcel\\w*|dose\\w*|m[eê]s(?:es)?\\b|anos?\\b|dias\\b|horas\\b|minutos?\\b|segundos?\\b|vagas\\b|clientes?\\b|unidades\\b|pontos?\\b|gb\\b|mb\\b|km\\b|kg\\b|g\\b|ml\\b|litros?\\b|cop\\w*|passos?\\b|etapas?\\b|semanas?\\b|pedidos?\\b|entregas?\\b|parcerias?\\b|pa[ií]ses\\b|estados?\\b|regi[õo]es\\b|cidades\\b|revis[õo]es\\b|equipes?\\b|pessoas?\\b|funcion[áa]rios?\\b|downloads?\\b|sistemas?\\b|bancos?\\b|m[ée]dicos?\\b|instrutores?\\b|professores?\\b|alunos?\\b|pe[çc]as?\\b|especialistas?\\b|dietas?\\b|lavagens?\\b|itens?\\b|vendas?\\b)",
  "i"
);

/** R5: filtro de genérico por RAIZ — GENERICOS guarda radicais curtos
 *  ("client", "result", "satisf"); um stem é genérico quando casa a raiz
 *  ou COMEÇA com ela ("clientes", "resultados", "satisfacao"). */
function stemEhGenericoAberta(st: string): boolean {
  for (const g of GENERICOS_ABERTA) {
    if (st === g) return true;
    // Prefixo só para radicais ≥5 — verbos curtos ("dura") não podem
    // engolir substantivos legítimos ("duração") do vocabulário material.
    if (g.length >= 5 && st.startsWith(g)) return true;
    if (st.length >= 4 && g.length >= 5 && stemMatch(st, g)) return true;
  }
  return false;
}

const GENERICOS_ABERTA: ReadonlySet<string> = new Set([
  "noss", "nosso", "nossa", "empresa", "marca", "produt", "servi", "equip", "ofert",
  "tratamento", "profission", "client", "formulae", "formul", "cosm", "sist", "plata",
  "loja", "site", "aplicativ", "app", "plan", "suporte", "entreg", "garanti", "curso",
  "clinic", "result", "qualidad", "satisf", "segur", "efic", "benef", "inova",
  "é", "são", "está", "tem", "temos", "faz", "fazer", "oferec", "inclui", "aceit", "usam", "func",
  "possu", "pertenc", "segue", "mant", "vem", "vale", "custa", "dura", "gera",
  "isso", "isto", "para", "com", "forma", "campanh", "voz", "imagem", "anunciad",
  "sendo", "proporc", "apresent", "trabalh", "relacion", "melh", "primeir", "grand",
]);

/** Safe-harbor puro-determinístico: a SENTENÇA ela mesma prova que não é
 *  factual sobre entidade comercial. NÃO depende de rótulo autodeclarado. */
/** Rótulo de METADADO DE PRODUÇÃO: canais de direção do operador
 *  ("Direcao criativa:", "Tom de voz:", "Publico:", "Entregavel:"…) —
 *  a forma prova a natureza não-publicável da sentença; o VALOR continua
 *  sujeito ao veto de conteúdo assertivo embutido (com exceção da negação
 *  operacional "nada de X"/"sem X" — instrução PARA não usar, não claim). */
const RX_ROTULO_METADADO =
  /^\s{0,24}(?:plano(?:[- ]detalhe)?|take\s*\d*|voz\s+off|cena\s*\d+|paleta\s+de\s+treino|gancho\s*\d+|fx|som|dire[çc][ãa]o\s+(?:criativa|de\s+arte|de\s+fotografia)|tom\s+de\s+voz|identidade(?:\s+visual)?|p[úu]blico(?:\s+alvo)?|refer[êe]ncia(?:s)?|entreg[áa]vel|entreg[áa]veis|personagens?|cen[áa]rio(?:s)?|trilha(?:\s+sonora)?|sonoplastia|pos[- ]?produ[çc][ãa]o|edi[çc][ãa]o(?:\s+de\s+v[íi]deo)?|paleta(?:\s*:\s*)?(?:de\s+cor(?:es)?)?|pergunta\s+genu[íi]na|foto(?:\s+fixa)?|fotografia(?:\s+fixa)?|roteiro|abordagem|narrativa|estrutura|formato|ritmo|estilo|figurino(?:s)?|loca[çc][ãa]o|ilumina[çc][ãa]o|enquadramento|composi[çc][ãa]o|cenografia|props?|casting|elenco|maquiagem|conceito(?:\s+visual)?|est[ée]tica|clima|atmosfera|textura(?:s)?|continuidade|instru[cç][ãa]o(?:\s+de\s+grava[cç][ãa]o)?|prompt(?:\s+de\s+imagem)?|legenda|hook|ganch(?:o|os)?|sketch|rascunho|lente(?:\s+\d+mm)?|corte|montagem|m[úu]sica)\s*:/i;
const RX_QUANT_MIDIA_PRODUCAO =
  /^\s{0,24}(?:\d{1,3}\s*mm\b|lente\s+\d{1,3}\s*mm\b|(?:entreg[áa]vel|entreg[áa]veis|dura[çc][ãa]o\s+(?:do\s+v[íi]deo|do\s+corte|total)|formato|take|corte(?:\s+final)?)\s*:)/i;

/** Há núcleo material NÃO NEGADO no valor? "nada de selo" e "sem selo" são
 *  instruções de exclusão (produção), não afirmação de selo. */
function nucleoHardNaoNegadoBase(t: string): boolean {
  const rx = new RegExp(RX_NUCLEO_MATERIAL_HARD.source, "ig");
  let m: RegExpExecArray | null;
  while ((m = rx.exec(t)) !== null) {
    const antes = t.slice(Math.max(0, m.index - 14), m.index);
    if (/\bnada\s+de\s*$|\bsem\s+$|\bzero\s+$|\bn[ãa]o\s+usar?\s*$|\bnunca\s+usar?\s*$|\bevitar?\s*$/i.test(antes)) continue;
    return true;
  }
  return false;
}
function nucleoHardNaoNegado(t: string): boolean {
  if (RX_INTERROGATIVA.test(t) && hipoteseCondicionalMarcada(t)) {
    const tS = textoSemRotuloCP01(t);
    if (tS !== t && nucleoHardNaoNegadoBase(tS)) return true;
    return false;
  }
  if (nucleoHardNaoNegadoBase(t)) return true;
  const tL = textoSemRotuloPontuacaoCP01(t);
  if (tL !== t && nucleoHardNaoNegadoBase(tL)) return true;
  return false;
}


function valorMetadadoComConteudoAssertivo(t: string): boolean {
  if (nucleoHardNaoNegado(t)) return true;
  if (RX_POSSE_COMERCIAL.test(t)) return true;
  if (RX_SATELITE_AVALIATIVO.test(t)) return true;
  if (RX_PARTICIPIO_COMPLEMENTO.test(t)) return true;
  if (RX_IDIOMA_PRAZO.test(t)) return true;
  if (RX_PROPORCAO_SOCIAL.test(t) || RX_PROPORCAO_SOCIAL2.test(t) || RX_MAIS_DE_NUMERICO.test(t)) return true;
  if (!RX_QUANT_MIDIA_PRODUCAO.test(t) && RX_QUANTIFICACAO_MATERIAL.test(t)) {
    // "um ponto de cor (quente)": o numeral indefinido quantifica a
    // UNIDADE DO ARTEFATO (ponto/cor/linha/toque), não escala de oferta.
    const m = RX_QUANTIFICACAO_MATERIAL.exec(t);
    const trechoQ = m ? t.slice(Math.max(0, m.index - 24), m.index + m[0].length + 24) : "";
    if (!/(?:^|[^\wÀ-ÿ])(?:um|uma) [\wÀ-ÿ]/i.test(trechoQ)) return true;
  }
  return false;
}

/** CP-01: conteúdo do rótulo interno é TRABALHO DE DESENVOLVIMENTO — ação da
 *  equipe sobre o material (testar/validar/criar) ou hipótese sobre métrica
 *  de campanha — não afirmação sobre o produto. */
function rotuloMarciaTrabalhoInterno(t: string): boolean {
  const alvo = t
    .replace(/^\s*\[[^\]]{0,40}\]\s*/i, "")
    .replace(/^(?:sugest[aã]o|hip[óo]tese|pendente(?:\s+de\s+valida[cç][ãa]o)?|condicional)\s*[—–\-:]\s*/i, "");
  const termoTrab = /\b(?:desconto\w*|oferta\w*|cta\b|hook\w*|ganch\w*|campanha\w*|p[úu]blico\w*|formato\w*|copy\w*|an[úu]ncio\w*|segmento\w*|persona\w*|criativo\w*|tr[áa]fego\w*|m[íi]dia\w*|tom\w*|verba\w*|funil\w*|canal\w*|canais\w*|branding\w*|landing\w*|personagem\w*|voz\s+da\s+marca|frete\w*|kit\w*|brinde\w*|sorteio\w*|amostra\w*|landing|persona|headline\w*|gatilho\w*|prova\s+social)\b/i.test(alvo);
  return /^(?:se\s+(?:aprovad\w+|validad\w+|necess[áa]ri\w+|aplic\w+|precis\w+|fizer\s+sentido)\s+[^,]{0,60},\s*)?(?:testar|avaliar|analisar|usar|medir|mensurar|experimentar|validar|comparar|criar|redigir|escrever|propor|sugerir|checar|fazer|montar|mapear|explorar|segmentar|priorizar|desenvolver|tentar|planejar|preparar|estudar|simular|otimizar|ajustar|revisar|variar|refinar|refor[çc]ar|ampliar)\b/i.test(alvo) && termoTrab ||
      (/\b(?:desconto\w*|oferta\w*|pre[çc]\w+|brinde\w*|b[óo]nus\w*|cupom\w*|cupons\w*|frete\w*|kits?\w*|amostra\w*|sorteio\w*|cashback\w*|upsell\w*|downsell\w*|p[úu]blico\w*|segmento\w*|formato\w*|hooks?\w*|ganch\w*|cta\b|headline\w*|criativo\w*|an[úu]ncio\w*|campanha\w*|canais?\w*|verba\w*|m[íi]dia\w*|tr[áa]fego\w*|tom\w*|urg[êe]ncia\w*|escassez\w*|prova\s+social|gatilho\w*|persona\w*|copy\w*|leads?\w*|funil\w*|p[áa]gin\w*|landing\w*|e-?mail\w*|branding\w*|posicionament\w*)\b/i.test(alvo) &&
       /\b(?:pode\w*|podem\w*|poderia\w*|tende\w*|deve\w*|deveria\w*|ajuda\w*|aumenta\w*|melhora\w*|engaja\w*|converte\w*|reduz\w*|eleva\w*|amplia\w*|gera\w*|funciona\w*|performa\w*|impacta\w*|consolida\w*|fortalece\w*|vai\s+\w+|traz\w*|otimiza\w*|desenvolve\w*|profissionaliza\w*|vale\w*|faz\s+sentido|compensa\w*|abre\s+espa[çc]\w*)\b/i.test(alvo)) ||
      // hipótese VALIDACIONAL: possibilidade mas com instrução de validação
      // ("pode ser 'sem irritação' para alguns perfis; validar dermato…")
      (/\b(?:pode|poderia|talvez|deveria|seria)\s+(?:ser|estar|ter)\b/i.test(alvo) &&
        /\b(?:validar\w*|verificar\w*|testar\w*|avaliar\w*|checar\w*|confirmar\w*|medir\w*|mensurar\w*|dermatolog\w*|laboratori\w*|farmac\w*|regulat\w*)\b/i.test(alvo));
}

function sentencaEhMetadadoProducao(t: string): boolean {
  if (!RX_ROTULO_METADADO.test(t)) return false;
  // CP-10 XR-3: rótulo/comentário não compra porto-seguro para claim embutido
  // (P2/P9): o veto material unificado vale TAMBÉM dentro do metadado.
  return !valorMetadadoComConteudoAssertivo(t) && !conteudoAssertivoEmbutido(t);
}

/** CP-01: menção de INSPIRAÇÃO/ORIGEM NARRATIVA ("inspirada no Borogodó
 *  de Sofia", "baseada na rua da infância", "homenagem à avó do fundador",
 *  "à la Hitchcock") — cânone criativo de referência; NÃO suprime veto
 *  assertivo embutido ("inspirada na precisão suíça, entrega em 24h" segue
 *  material pelo idioma de prazo). */
const RX_INSPIRACAO_NARRATIVA =
  /\b(?:inspirad\w+|basead\w+|homenagead\w+|releitura\w*|varia[çc][ãa]o\s+de|riff\b|uma\s+ode\b|no\s+estilo\s+de|[aà]\s+la\b|uma\s+vers[ãa]o\s+de|como\s+se\s+fosse)/i;

const RX_NOMINAL_SENSORIAL =
  /^\s{0,20}(?:um|uma|o|a)\s+(?:cheiro|aroma|toque|gosto|paladar|vis\w+|brisa|sopro|vapor|fuma[çc]a|fumaça|halo)\s+(?:de|d[aeo]\s?)\b/i;

// CP-01 CA-GH4: nível A corrente (injetação por varrerClaimsMateriais para
// checagem de ecos de restrição — renomeado p/ não colidir com parâmetros).
let nivelAFallbackCP01 = "";
function temSuporteBFNegCP01(t: string): boolean {
  return /\b(descont|cupom|promo[çc][ãa]o|oferta|brinde|pre[çc]o|percentual)\w*\b/i.test(t);
}
function sentencaEhSafeHarbor(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  // CP-01 CA-GH4: ECO DE RESTRIÇÃO PURO — ausência estrito-suportada no
  //  Nível A, forma absoluta sem marcador comercial próprio, e suporte
  //  BF_NEG explícito ("não existe ... autorizado") — o eco alinhado é
  //  porta de honra (R6 §16 fix T22: menção da restrição ≠ oferta).
  if (ecoDeAusenciaSuportada(t, nivelAFallbackCP01) && temSuporteBFNegCP01(t)) return true;
  // CP-01 CA-F03: supressão de marca canônica é instrução de arte
  //  ("Identidade: sem selo.","nada de selo") — NÃO é claim comercial.
  if ((/\bsem\s+(?:o|a)?\s*(?:nenhum\w*\s+)?(?:selo|logotipo\w*|marca\s+d[áa]gua|certificado\w*|carimbo\w*)\b/i.test(t) ||
       /\bnada\s+de\s+(?:selo|logotipo\w*|marca\s+d[áa]gua|certificado\w*|carimbo\w*)\b/i.test(t)) &&
      (RX_ROTULO_METADADO.test(t) || artefatoDominanteCP01(t)) &&
      !sinalAssercaoMaterialBaseCP01(textoSemRotuloCP01(t))) return true;
  // CP-01 CA-F05e: metadado-produção NÃO emancipa claim reconhecido por
  //  qualquer canal ("Paleta: temos o prazo mais rápido.").
  if (sentencaEhMetadadoProducao(t) &&
      !sinalAssercaoMaterialBaseCP01(textoSemRotuloCP01(t)) &&
      !temSinalMaterialCanalCP01(t)) return true;
  // quadro-de-produção presente e NENHUM conteúdo assertivo embutido —
  // porto-seguro por domínio fechado do cânone criativo CP-08.
  if ((quadroDominante(t) || sentencaEhStoryboard(t) || sentencaEmCanoneDiegeticoCP01(t)) &&
      !conteudoAssertivoEmbutido(t) &&
      !sinalAssercaoMaterialBaseCP01(textoSemRotuloCP01(t)) &&
      !temSinalMaterialCanalCP01(t)) return true; // CP-01 CA-F05f
  // veto MÍNIMO comum às demais formas: núcleo não-negado ou posse.
  if (nucleoHardNaoNegado(t) || RX_POSSE_COMERCIAL.test(t)) return false;
  // VETO ANTES DA CONCESSÃO (CP-10 XR-1/XR-3 + CP-01 OB-C9): conteúdo
  // assertivo embutido OU veto comercial duro (já normalizados quanto a
  // rótulo/pin e à pontuação interrogativa) cancelam QUALQUER porto-seguro
  // seguinte — exceto quando o próprio cânone criativo qualifica o sinal
  // (sinalDeApenasArtefato). Pergunta/rótulo/comentário NUNCA emancipam.
  if (conteudoAssertivoEmbutido(t) ||
      (temVetoComercialDuroCP01(t) && !sinalDeApenasArtefatoCP01(t))) return false;
  // pergunta genuína não é asserção — MAS pergunta com claim material
  //  embutido (forma afirmativa reconhecível) NÃO é emancipada (CP-01-H:
  //  a moldura interrogativa não compra a autoridade do conteúdo).
  if (RX_INTERROGATIVA.test(t)) {
    if (hipoteseCondicionalMarcada(t)) return true;
    const af = textoSemRotuloCP01(t).replace(/[?¿!¡]+\s*$/, ".");
    // CP-01 CA-F04b: pressuposição material com agente ("a gente garante ... todo?")
    //  não é pergunta genuína — o canal material cancela a emancipação.
    if (!sinalAssercaoMaterialBaseCP01(af) && !temSinalMaterialCanalCP01(af)) return true;
  }
  // CP-01 CA-F05c: cânone-cine NÃO emancipa claim com sinal de canal material
  //  ("Paleta: temos o prazo mais rápido." — a moldura não compra autoridade).
  if (RX_SAFE_HARBOR_CINE.test(t) && !temSinalMaterialCanalCP01(t)) return true;
  if (RX_NARRATIVA_PERSONAGEM.test(t)) return true;
  // frase nominal SENSORIAL ("Um cheiro de capim molhado.") — cânone
  // criativo de inventário de cena, sem conteúdo assertivo embutido.
  if (RX_NOMINAL_SENSORIAL.test(t)) return true;
  // ANÁFORA paralelística — figura de estilo determinística.
  if (/uma?\s+[\wÀ-ÿ]+\s+que\b[^.!?]{2,60}?[,;]\s*uma?\s+[\wÀ-ÿ]+\s+que\b/i.test(t)) return true;
  // CP-01: inspiração/origem narrativa é cânone criativo — o veto de
  // conteúdo assertivo embutido já correu na linha acima (XR-1).
  if (RX_INSPIRACAO_NARRATIVA.test(t)) return true;
  return false;
}

// ======================================================================

/** Asserção material aberta: predicado factual plausível, entidade
 *  comercial por POSSE explícita OU ENTIDADE+VERBO factual, ou
 *  quantificação factual comercial (reação de oferta/clientela). */
/** Asserção material aberta (R5): qualquer predicação factual plausível
 *  sobre entidade comercial. Ordem: NÚCLEO duro > QUANTIFICAÇÃO >
 *  ENTIDADE+VERBO — entidade é opcional quando o núcleo já contextualiza
 *  ("Duzentos bancos conectados", "Dezenove especialistas certificados"). */

// ======================================================================
// P4.1.3R6 — CLOSED-AUTHORITY STRUCTURAL GATE (CP-09 RC-1/RC-2)
// RECOGNITION ≠ AUTHORIZATION: classes MORFOLÓGICAS FECHADAS de predicação
// factual-comercial (satélite avaliativo, particípio agenciado, proporção
// social, comparativo, escopo exaustivo, verbo material suplementar) —
// a fronteira do Truth Gate sobe do SUJEITO para o PREDICADO.
// ======================================================================

// ======================================================================
// CP-01 FECHAMENTO (CP-10 XR-2/XR-5) — CLASSES FECHADAS FUNCIONAIS
// Não são vocabulário de produto: cada classe é uma FORMA de dimensão
// comercial (prazo, escopo, superlativo, defeito-negado, credencial,
// conveniência, origem, duração, medição, disponibilidade). Qualquer
// domínio as usa; nenhuma lista nominal de entidade é criada.
// ======================================================================

/** C-01 · prazo quantificado de desempenho/entrega ("em três minutos",
 *  "em um dia útil", "vinte e quatro horas"). */
const RX_PRAZO_QUANTIFICADO =
  /\b(?:em|dentro\s+de)\s+(?:\d+|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|quatorze|quinze|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem)\s+(?:segundos?|minutos?|horas?|dias?(?:\s+[úu]te(?:l|is))?|semanas?|mes|meses|anos?|lavage[mn]s?|aplica[çc][õo]es|aplica[çc][ãa]o|usos)\b|\b(?:vinte e quatro|quarenta e oito|setenta e duas)\s+horas\b/i;
/** C-02 · logística + amanhã ("receber em casa amanhã", "amanhã na sua porta"). */
const RX_LOGISTICA_AMANHA =
  /\b(?:receb\w*|cheg\w*|entreg\w*|peg\w+|retirad?\w*|lev\w*|busc\w*|envi\w*)\b[^.!?]{0,32}\bamanh[ãa]\b|\bamanh[ãa]\b[^.!?]{0,32}\b(?:na sua porta|em casa|com voc[êe]|na sua m[ãa]o|no seu endere[çc]o)\b|\b(?:em\s+casa|na\s+sua\s+porta|no\s+seu\s+endere[çc]o)\b[^.!?]{0,24}\bamanh[ãa]\b/i;
/** C-03 · escopo territorial declarado ("em todo o país", "capital inteira",
 *  "onde ninguém chega", "cobertura da cidade inteira"). */
const RX_ESCOPO_TERRITORIAL =
  /\bem\s+todo\s+o\s+(?:pa[íi]s\w*|estado\w*|brasil|mundo|territ[óo]rio\w*)|\bem\s+toda\s+a\s+(?:cidade|capital|regi[ãa]o|zona|baixada)|\b(?:capital|cidade|estado|regi[ãa]o|zona|pa[íi]s|brasil|mundo|bairro)\s+inteir[ao]\w*|tod[oa]\s+a?\s*(?:regi[ãa]o|cidade|zona|bairro)\b\s*inteir[ao]\w*\??|tod[oa]\s+a?\s*(?:regi[ãa]o|cidade|zona|bairro)\b|\bonde\s+ningu[ée]m\b/i;
/** C-04 · superlativo comercial com escopo ("o menor consumo do segmento",
 *  "a maior cobertura da região", "o mais rápido do mercado"). */
const RX_SUPERLATIVO_ESCOPO_COMERCIAL =
  /\b(?:o|a|os|as)\s+(?:maior|melhor|pior|menor|mais\s+[\wÀ-ÿ]+)\s+(?:do|da|de|no|na|dos|das|d')\s+(?:segmento|mercado|categoria|pa[íi]s|estado|regi[ãa]o|cidade|bairro|setor|nicho|vanguarda|brasil|portf[óo]lio)\b|\b(?:o|a|os|as)\s+(?:maior|melhor|pior|menor|mais\s+[\wÀ-ÿ]+)\s+(?:do|da|de|no|na|dos|das)\s+(?!(?:vida|fam[íi]lia|amig[oa]s?|trabalho|anos?|jogos?|[ée]poca|vez|noite|manh[ãa]|semana|m[êe]s|hist[óo]ria|equipe|time|turma|classe|lado|op[cç][ãa]o|volta\s+ao|mundo)\b)[\wÀ-ÿ]{3,}(?:\s+[\wÀ-ÿ]{2,})?\b/i;
const RX_SUPERLATIVO_COMERCIAL =
  /\b(?:o|a|os|as)\s+(?:menor|maior|melhor|pior|primeir\w+|[úu]ltim\w+|mais\s+(?:r[áa]pid\w+|barat\w+|complet\w+|avan[çc]ad\w+|resistent\w*|dur[áa]vel\w*|eficient\w*|potente\w*|leve\w*|compact\w*|silencios\w*|segur\w+))\s+[\wÀ-ÿ]+\s+(?:do|da|de|no|na|dos|das|entre)\s+[\wÀ-ÿ]+/i;
/** C-05 · defeito negado por verbo de falha inerente ("não irrita", "não
 *  amarela", "não escorre", "não empedra", "não altera", "não degrada"). */
const RX_DEFEITO_NEGADO =
  /\bn[ãa]o\s+(?:se\s+)?(?:vai\s+)?(?:irrit\w*|agred\w*|alter\w*|degrad\w*|escorr\w*|ping\w*|empedr\w*|amarel\w*|desbot\w*|oxid\w*|enferruj\w*|descol\w*|escam\w*|empen\w*|deform\w*|encolh\w*|estic\w*|murch\w*|ran[çc]\w*|azed\w*|borr\w*|grud\w*|ressec\w*|embol\w*|lasc\w*|despeda[çc]\w*|desfi\w*|embara[çc]\w*|descasc\w*|suad\w*|empoa?r\w*|embolor\w*|mof\w*|verdet\w*)\b/i;
/** C-06 · livre-de-falha funcional ("sem pingar", "sem resíduo", "sem cheiro"). */
const RX_SEM_DEFEITO =
  /\bsem\s+(?:ping\w*|vazar\w*|vazamento\w*|escorrer\w*|manch\w+|cheir\w+|odor\w*|res[íi]du\w*|grud\w*|borr\w+|rastro\w*|trinca\w*|rachadur\w*|bolha\w*|falha\w*)\b/i;
/** C-07 · ausência de restrição/exigência declarada ("não há restrição para",
 *  "não exige técnico", "não exige pedido mínimo"). */
const RX_NAO_EXIGENCIA =
  /\bn[ãa]o\s+(?:h[áa]|existe\w*|tem|requer\w*|exig\w*|demand\w*|pede\w*|precisan?\w*)\s+(?:de\s+|d[ao]\s+|com\s+|para\s+)?(?:restr[íi][çc][ãa]o\w*|restr\w*|contraindi?c\w*|limite\w*|impediment\w*|empecilh\w*)\b|\bn[ãa]o\s+(?:exig\w*|demanda\w*|requer\w*)\s+(?:t[ée]cnico\w*|especialista\w*|profissional\w*|ajuste\w*|calibra\w*|treinamento\w*|curso\w*|adapta\w*|pedido\s+m[íi]nimo|pedido|cadastro|fielatoria|comprovante|documentação\w*)\b|\bn[ãa]o\s+h[áa]\s+(?:restri\w+|limite\w+|pedido\s+m[íi]nimo)\b/i;
/** C-08 · disponibilidade permanente ("disponível o ano inteiro", "sempre
 *  tem na prateleira", "sem falta", "não sai de catálogo"). */
const RX_DISPONIBILIDADE_PERMANENTE =
  /\bdispon[íi]vel\w*\b[^.!?]{0,24}\b(?:o\s+ano\s+inteiro|sempre|todo\s+(?:dia|ano))|\bsempre\s+(?:tem|h[áa]|dispon\w*|encontr\w*|est[áa]\s+em\s+estoque)\b|\bsem\s+falta\b|\bnunca\s+falt\w+|\bn[ãa]o\s+sai\s+de\s+cat[áa]logo/i;
/** C-09 · histórico sem incidente ("nunca deu problema", "nunca deixou na mão"). */
const RX_HISTORICO_INCIDENTE =
  /\b(?:nunca|jamais|n[ãa]o)\s+(?:deu|d[êe]i|houve|teve|apresent\w*|registr\w*|caus\w*|ger\w*)\s+(?:nenhum\s+|nenhuma\s+|um\s+|uma\s+)?(?:problema\w*|falha\w*|defeito\w*|queixa\w*|reclama[çc][ãa]o\w*|sinistro\w*|acidente\w*|dor\s+de\s+cabe[çc]a)\b|\bnunca\s+deix\w*\s+na\s+m[ãa]o\b|\bnunca\s+(?:falh\w+|trav\w+|quebr\w+|romp\w+|decepcion\w+|paro\w+)\b/i;
/** C-10 · conveniência enunciada ao consumidor ("você passa aqui e leva",
 *  "a gente leva", "pode acertar depois", "dá pra dividir"). */
const RX_CONVENIENCIA_VOCATIVA =
  /\b(?:voc[êe]|c[êe])\s+(?:passa\w*|peg\w+|lev\w*|recebe\w*|receit?\w*|escolh\w*|acert\w*|paga\w*|divid\w*|parcel\w*|ganh\w*|aproveit\w*|resolve\w*|economiz\w*|sai\w*\s+(?:com|de\s+lá)|consegue\w*|fecha\w*)\b|\ba\s+gente\s+(?:lev\w*|entreg\w*|busca\w*|busc\w*|resolve\w*|cuid\w*|deixa\w+|instal\w*|mont\w*|consert\w*|acert\w*|lev\w*)\b|\bpode\s+acert\w+\s+depois\b|\bd[áa]\s+pra\s+(?:dividir|parcelar|acertar\s+depois)\b/i;
/** C-11 · agendamento livre ("o dia que quiser", "na hora que você quiser"). */
const RX_AGENDA_LIVRE =
  /\b(?:o\s+dia|a\s+data|o\s+hor[áa]rio|a\s+hora|quando)\s+(?:que\s+)?(?:voc[êe]\s+)?quiser\b|\bagenda\b[^.!?]{0,30}\b(?:voc[êe]\s+|o\s+cliente\s+)?(?:quiser|preferir|puder|decidir|escolher)\b|\bquando\s+(?:voc[êe]|o\s+cliente)\s+(?:quiser|preferir|puder|quiserem)\b|\b(?:flexibilidade|liberdade)\s+(?:total\s+)?(?:de\s+)?(?:agenda|hor[áa]rio|data|dia)\b/i;
/** C-12 · precisão idiomática coloquial ("acerta na mosca toda vez"). */
const RX_PRECISAO_COLOQUIAL =
  /\bna\s+mosca\b|\bacert\w+\b[^.!?]{0,16}\btoda\s+vez\b|\btoda\s+vez\s+sem\s+falta\b/i;
/** C-13 · credencial meritória sem instituição ("homologado", "laudo
 *  independente", "atestado por", "chancelado", "auditado"). */
const RX_CREDENCIAL_MERITORIA =
  /\b(?:homologad\w*|laudo\w*|atestad\w*|chancelad\w*|auditad\w*|licenciad\w*|revisad\w*\s+por|assinad\w*\s+por|verificad\w*)\b(?:[^.!?]{0,24}\b(?:independent\w*|terceir\w*|extern\w*|oficia(?:l|is)\b|certificad\w*|laborat[óo]rio\w*|t[ée]cnico\w*|especialista\w*|engenheir\w*|m[ée]dic\w*))?/i;
/** C-14 · exclusividade com escopo ("única no país", "só uma revenda por
 *  bairro", "exclusivo da região"). */
const RX_EXCLUSIVIDADE_ESCOPO =
  /\b[úu]nic[oa]\w*\s+(?:do|da|no|na|de)\s+(?:pa[íi]s|mercado|segmento|mundo|brasil|estado|cidade|regi[ãa]o|bairro|categoria|setor|n[íi]vel)\b|\bs[óo]\s+uma?\s+[\wÀ-ÿ]+\s+por\s+(?:bairro|cidade|regi[ãa]o|zona|estado|munic[íi]pio)\b|\bexclusiv\w+\s+(?:no|na|por|para|da|do|de)\s+(?:bairro|regi[ãa]o|cidade|estado|pa[íi]s|zona|mercado)\b/i;
/** C-15 · adequação declarada a uso/perfil ("o bastante para couro sensível",
 *  "ideal para", "indicado para", "próprio para", "feito para"). */
const RX_ADEQUACAO_USO =
  /\b(?:o\s+bastante|suficiente\w*|bom\s+o\s+bastante)\s+para\b|\bideal\s+para\b|\bindicad\w+\s+para\b|\bpr[óo]pri\w+\s+para\b|\bapt\w*\s+(?:a|para)\b|\bfeito\s+para\b/i;
/** C-16 · passiva sintética de prestação ("garante-se o resultado",
 *  "entrega-se em todo o estado"). */
const RX_PASSIVA_SINTETICA =
  /\b(?:garant\w*|entreg\w*|troca\w*|devolv\w*|reembols\w*|substitu\w*|instal\w*|env\w*|receit?\w*|vend\w*|fabric\w*)-se\s+(?:o|a|os|as|em|todo|toda|sem|com|no|na|por)\b/i;
/** C-17 · origem nominal declarada ("origem europeia", "veio de fora",
 *  "direto da fábrica", "da França vem cada lote"). */
const RX_ORIGEM_DECLARADA =
  /\borigem\s+(?:europeia?|importada|nacional|alem[ãa]|italiana|francesa|su[íi][çc]a|japonesa|americana)|\bveio\s+de\s+fora\b|\bdireto\s+da\s+f[áa]brica\b|\b(?:da|de|das|desde)\s+(?:fran[çc]a|it[áa]lia|alemanha|su[íi][çc]a|china|jap[ãa]o|eua|cor[ée]ia)\s+(?:vem|veio|cheg)\w*/i;
/** C-18 · duração de vida declarada ("dura cinco anos", "validade de cinco
 *  anos", "dura a vida toda"). */
const RX_DURACAO_VIDA =
  /\bdur\w*\s+(?:a\s+vida\s+toda|por\s+)?(?:\d+|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|vinte|trinta)\s+(?:anos?|mes|meses|semanas?|dias?)\b|\b(?:validade|dura[çc][ãa]o|vida\s+[úu]til)\s+de\s+(?:\d+|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|vinte|trinta|vinte e cinco|trinta e dois)\s+(?:anos?|mes|meses|semanas?|dias?)\b/i;
/** C-19 · reembolso/devolução ("dinheiro de volta", "seu dinheiro... de volta",
 *  "reembolso total"). */
/** CP-01 C-21 — cadência/turno operacional ("entrega em ritmo acelerado",
 *  "produção em cadência diária", "suporte 24/7") — logística sempre dura. */
/* CP-01 OB-C13: SUJEITO-OPERAÇÃO ancorado no contexto da cadência —
 *  impede que storyboards ('cena 3 em ritmo acelerado') caiam no resid. */
const RX_SUJEITO_OP_CAD =
  /\b(?:produ[çc][ãa]o\w*|fabrica[çc][ãa]o\w*|opera[çc][ãa]o\w*|entrega\w*|despach\w*|atendimento\w*|envio\w*|execu[çc][ãa]o\w*|reposi[çc][ãa]o\w*|fech\w+|inici[oa]\w*|come[çc][oa]\w*|termin\w+|acab\w+|concl[ui]\w*)\b/i;

const RX_CADENCIA_OPERACIONAL =
  /\bsempre\s+(?:no|na|em|no\s+mesmo|nesse|nesse\s+mesmo)\s+hor[áa]rio\w*\b|\b(?:entrega\w*|despacho\w*|envio\w*|expedi[cç][ãa]\w*|atendimento\w*|suporte\w*|instala[cç][ãa]\w*|fabrica[cç][ãa]\w*|produ[cç][ãa]\w*|execu[cç][ãa]\w*|montagem\w*|reposi[cç][ãa]\w*|opera[cç][ãa]\w*)\s+(?:em|com)\s+(?:ritmo|cad[êe]ncia|regime|turno|fluxo|escala|base)\s+\w+|\b(?:em|num)\s+(?:ritmo|cad[êe]ncia)\s+(?:acelerad\w*|batid\w*|constante|cont[íi]nu\w*|alto\w*|progressiv\w*|di[áa]ri\w*|semanal\w*|mensal\w*)|\b24\s*horas\s+por\s+dia|\b24\s*h\s*\/\s*7\b|\b7\s+dias\s+por\s+semana|\bfuncionamento\s+(?:24\s*horas|24h|continu[ao])\b/i;
const RX_REEMBOLSO =
  /\b(?:dinheiro|valor|pagamento|investimento)\s+de\s+volta\b|\bde\s+volta\b[^.!?]{0,24}\b(?:dinheiro|valor|pagamento)|\breembols\w*\b|\bdevol\w*\s+(?:o|seu|do)\s+(?:valor|dinheiro|pagamento)\b|\b(?:dinheiro|valor|pagamento)\s+devolvid[oa]\b|\bdevolvemos\s+(?:o|seu|todo)\s+(?:dinheiro|valor|pagamento)\b/i;
/** C-20 · resíduo zero declarado ("quase nada sobra", "nada escapa",
 *  "nada fica para trás"). */
const RX_NADA_RESIDUAL =
  /\bnada\s+(?:sobra\b|resta\b|escapa\b|fica\b|perde\b|vaza\b|falta\b|volta\b)|\bquase\s+nada\s+(?:sobra|resta|escapa|fica|perde|volta)\b/i;

/** CP-01 C-22 — declaração de zero-defeito/risco-zero ("zero defeitos",
 *  "risco zero de alergia", "zero erro na linha"). */
const RX_ZERO_DEFEITO =
  /\bzero\s+(?:defeito\w*|erro\w*|falha\w*|risco\w*|reclama[cç][aã]o\w*|viola[cç][aã]o\w*|acidente\w*|dano\w*|preju[íi]zo\w*|frustr\w*|penalidade\w*|multa\w*)|\brisco\s+zero\b|\bzero\s+(?:alergia\w*|irrita[cç][aã]o\w*|rea[cç][aã]o\w*)|\bnenhum\s+(?:defeito\w*|erro\w*|falha\w*)\b(?![^.!?]{0,24}(?:cena|take|corte|quadro|bloco|ato))/i;
/** CP-01 C-23 — conveniência transacional ("pode pagar quando der",
 *  "traz quando puder", "acerta depois com calma"). */
const RX_CONVENIENCIA_TRANSACIONAL =
  /\b(?:pode|podes|podem)\s+(?:pagar|acertar|resolver|combinar|fechar|parcelar|dividir|trazer|buscar|receber|pegar|solicitar|agendar|instalar|devolver|trocar|cancelar|retirar)\s+(?:quando\s+(?:der|quiser|puder|melhor)|depois|com\s+calma|na\s+seguinte|na\s+volta)|\b(?:pague|acerte|resolva|combine|traga|busque|pegue)\s+(?:quando|depois\s+que)\s+(?:der|quiser|puder)|\b(?:acert\w+|pag\w+)\s+(?:depois|na\s+semana\s+que\s+vem|com\s+calma)\b/i;
const _unused_marker = 0;

/** Unificador CP-01 (consolidação de TODAS as classes C-01..C-20). */
function temSinalFechamentoCP01(t: string, opcoes?: { tolerarCadenciaCriativa?: boolean }): boolean {
  // CP-01 OB-C14: QUEM mora no cânone criativo (storyboard/rotulo-cine)
  // não exige sujeito-operação para cadência — "montagem em ritmo lento". 
  const tolerarCadencia = !!opcoes?.tolerarCadenciaCriativa;
  return RX_PRAZO_QUANTIFICADO.test(t) || RX_LOGISTICA_AMANHA.test(t) ||
    RX_ESCOPO_TERRITORIAL.test(t) || RX_SUPERLATIVO_COMERCIAL.test(t) ||
    RX_DEFEITO_NEGADO.test(t) || RX_SEM_DEFEITO.test(t) ||
    RX_NAO_EXIGENCIA.test(t) || RX_DISPONIBILIDADE_PERMANENTE.test(t) ||
    RX_HISTORICO_INCIDENTE.test(t) || RX_CONVENIENCIA_VOCATIVA.test(t) ||
    RX_AGENDA_LIVRE.test(t) || RX_PRECISAO_COLOQUIAL.test(t) ||
    RX_CREDENCIAL_MERITORIA.test(t) || RX_EXCLUSIVIDADE_ESCOPO.test(t) ||
    RX_ADEQUACAO_USO.test(t) || RX_PASSIVA_SINTETICA.test(t) ||
    RX_ORIGEM_DECLARADA.test(t) || RX_DURACAO_VIDA.test(t) ||
    RX_REEMBOLSO.test(t) || RX_NADA_RESIDUAL.test(t) || (tolerarCadencia ? false : RX_CADENCIA_OPERACIONAL.test(t)) ||
    RX_ZERO_DEFEITO.test(t) || RX_CONVENIENCIA_TRANSACIONAL.test(t);
}

/** Sinais idiomáticos materiais R6 UNIFICADOS (única manutenção) — uso em
 *  INDET, veto de conteúdo embutido e isenção CTA. */
function temSinalIdiomaticoR6(t: string): boolean {
  return RX_IDIOMA_PRAZO.test(t) || RX_PROPORCAO_SOCIAL.test(t) || RX_PROPORCAO_SOCIAL2.test(t) || RX_MAIS_DE_NUMERICO.test(t) ||
    RX_NAO_PRECISA.test(t) || RX_FEITO_MANUFATURA.test(t) || gentilicoComOrigem(t) ||
    RX_IDIOMA_DESEMPENHO.test(t) || RX_TAXA_DESEMPENHO.test(t) || RX_TEMPO_ACAO_DESCRITOR.test(t) || RX_TEMPO_EFEITO.test(t) || RX_FAIXA_NUM_EXTENSO.test(t) || RX_A_PARTIR_DE_PRECO.test(t) || RX_COLOQUIAL_PRAZO.test(t) || RX_PASSIVA_MAT.test(t) || RX_DIRECAO_CITADA_MAT.test(t) || RX_DISPONIBILIDADE_FATO.test(t) ||
    RX_AUTONOMIA_IDIOM.test(t) ||
    RX_IDIOMA_CONFIABILIDADE.test(t) || RX_IDIOMA_PRAZO_COLOQUIAL.test(t) || RX_IDIOMA_PORTA.test(t) ||
    RX_IDIOMA_FISICA.test(t) || RX_IDIOMA_INSTSIGLA.test(t) || RX_IDIOMA_PRECISAO.test(t) ||
    RX_IDIOMA_COBERTURA.test(t) || RX_CARGA_FISICA.test(t) || RX_IDIOMA_FRETE_PRAZO.test(t) || RX_IDIOMA_CONTA.test(t) || RX_IDIOMA_FECHO.test(t) || RX_IDIOMA_VOZ.test(t) || RX_ABUNDANCIA_NEG.test(t) ||
    RX_IDIOMA_CONDICAO_OPERACIONAL.test(t) ||
    temSinalFechamentoCP01(t, { tolerarCadenciaCriativa: true });
}

/** Satélite avaliativo-comercial: grau/escopo/duração/certeza/exclusividade/
 *  medida/velocidade/facilidade/origem gentílica (classes fechadas). */
const RX_SATELITE_AVALIATIVO =
  /\b(?:absolut\w+|total(?:es)?\b|complet\w+|m[áa]xim\w+|m[í]nim\w*|minim(?:o|a|os|as)\b|naciona(?:l|is)\b|continental\w*|mundial\w*|internaciona(?:l|is)\b|universa(?:l|is)\b|extrem\w*|suprem\w*|alt[íi]ssim\w*|vital[íi]ci\w*|perp[ée]tu\w*|permanent\w+|ilimitad\w*|oficia(?:l|is)\b|certificad\w+|exclusiv\w+|dupl\w+|tripl\w+|instant[âa]ne\w*|imediata?\w*|simplificad\w+|pr[óo]pri\w+|importad\w+|domicili[áa]r\w*|trienal\w*|bienal\w*|premium\w*|espelhad\w*|profissional(?:izante)?\b)\b/i;

/** Gentílico com contexto de ORIGEM (±40 chars, qualquer direção) —
 *  "fabricacao francesa", "origem importada", "ORIGEM FRANCESA"; NÃO
 *  "estética japonesa" (predicado de estilo, não procedência). */
const RX_GENTILICO_ORIGEM =
  /(?:franc[êe]s\w*|italian\w*|alem[ãa]\w*|japon[êe]s\w*|brasileir\w*|europ[eé]\w*|american\w*|su[íi][çc]\w*|corean\w*|portugu[êe]s\w*|espanhol\w*|argentin\w*|chilen\w*|mexican\w*|belga\w*)/i;
const RX_ORIGEM_CONTEXTO =
  /orig\w+|proced[êe]ncia\w*|proced\w+|fabrica[çc]\w*|fabric\w+|produz\w*|manufatur\w*|feit[oa]s?\s+(?:em|de|na|no|por|pelo|com)|import\w*|export\w*|vem\s+de\b|vind[oa]s?\s+de\b|lacre\w*|etiqueta\w*|selo\s+de\s+origem|lote\w*|terroir\w*|conformidade\w*|padroniza[çc][ãa]o\w*|homologad\w*|certifica[çc][ãa]o\w*|reconhecid\w*|inspe[çc][ãa]o\w*|auditoria\w*|norma\w*|vigente\w*/i;
function gentilicoComOrigem(t: string): boolean {
  const m = RX_GENTILICO_ORIGEM.exec(t);
  if (!m) return false;
  const janela = t.slice(Math.max(0, m.index - 48), m.index + m[0].length + 48);
  return RX_ORIGEM_CONTEXTO.test(janela);
}

/** Escopo exaustivo idiomático ("todo o país", "toda versão") — exclui
 *  idiom temporal corriqueiro ("todo verão", "toda vez"). */
const RX_ESCOPO_EXAUSTIVO =
  /\btodo[as]?\s+(?![aà]s?\s|ano\b|vez\b|vezes\b|semana\b|hora\b|noite\b|manh[ãa]\b|tarde\b|dia\b|m[êe]s\b|ver[ãa]o\b|inverno\b|natal\b)(?:[oa]s?\s+)?[\wÀ-ÿ]{3,}|\bqualquer\b/i;

const RX_PARTICIPIO = /\b[a-zà-ÿ]{3,}(?:ad[oaie]s?|id[oaie]s?|ud[oaie]s?)\b/i;
const RX_PARTICIPIO_COMPLEMENTO =
  /\b[a-zà-ÿ]{3,}(?:ad[oaie]s?|id[oaie]s?|ud[oaie]s?)\s+(?:com|como|para|por|perante|em|sem|de|sob|ante|segundo|a)\b/i;
/** Auxiliar passiva copular IMEDIATA ao particípio ("foi desenhado para") —
 *  construção passiva material; cópula distante do particípio ("cada fio é
 *  um raio de sol aprendido") é cola metafórica, não predicação agentiva. */
const RX_COPULA_AUX_PASSIVA =
  /\b(?:[ée](?:ramos|ra)?|foi\w*|s[ãa]o|est[áa]\w*|ser[áa]\w*)\s+[\wÀ-ÿ]{3,}(?:ad[oaie]s?|id[oaie]s?|ud[oaie]s?)\b/i;
const LEXEMAS_NAO_PARTICIPIO = /^(?:lado|estado|grau|nada|fado|cuidado|mercado|pedido|pedida|sentido|conteudo|ouvido)s?$|^\w*(?:idade|udade|ndade)s?$/;
function temParticipioAgenciado(t: string): boolean {
  const m = t.match(RX_PARTICIPIO);
  if (!m) return false;
  if (LEXEMAS_NAO_PARTICIPIO.test(m[0])) return false;
  return true;
}

/** Proporção social ("nove em cada dez", "1 a cada 3"). */
const RX_PROPORCAO_SOCIAL =
  /\b(?:\d+|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez)\s+em\s+cada\s+(?:\d+|dois|duas|tr[eê]s|quatro|cinco|dez|dezenas?|centenas?|mil)\b/i;
/** CP-01 CA-F05: proporção social ECONOMIZADA ("9 em 10 clientes",
 *  "somos a escolha de 9 em 10") — sem o conector "cada". */
const RX_PROPORCAO_SOCIAL2 =
  /\b(?:[1-9]|\d{1,2})\s+em\s+(?:[1-9]|\d{1,2})(?:\s+(?:clientes?|consumidores?|especialistas?|dermatologistas?|m[ée]dicos?|usu[áa]rios?|pessoas?|donos?|respostas?|casos?|prefere\w*|preferem))?/i;


/** Quantificação comparativa de escala ("mais de duzentas", "menos de dez"). */
const RX_MAIS_DE_NUMERICO =
  /(?:^|\s)(?:mais|menos)\s+de\s+(?:\d+|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|vinte|trinta|quarenta|cinquenta|cem|cento|duzent[ao]s|mil)\b/i;

/** Comparativo material ("mais barato que", "menos doce que"). */
const RX_COMPARATIVO_MATERIAL = /(?:^|\s)(?:mais|menos)\s+(?:[\wÀ-ÿ]{3,}\s+)?que\b/i;

/** Idioma de prazo/velocidade/montagem ("um dia útil", "sem ferramenta"). */
const RX_FEITO_MANUFATURA = /\bfeit[oa]s?\s+(?:(?:a|à)\s+m[ãa]o|em|por|com|de|na|no|para|sob|en|até|ate)\b/i;
// ---- E15: classes idiomáticas de predicação factual (fechadas) ----
/** Idioma de DESEMPENHO operacional: "sem parar", "sem gotejo", "sem trinca",
 *  "sem romper", "sem esforço" — supressão idiomática de falha operacional. */
const RX_IDIOMA_DESEMPENHO =
  /\bsem\s+(?:parar|gotej[ao]\w*|trinca\w*|romper|falha\w*|escoamento|marca(?:r|s)?|esforço\w*|dificuldade\w*|atras\w*|lag\w*|trepida[çc][ãa]o\w*|trem\w+|chiado\w*|zumbido\w*|ru[íi]do\w*|risco\w*|descasca\w*|entupi\w*|oxida[çc][ãa]o\w*|desgaste\w*|mancha\w*|empena\w*|folga\w*|estour[ao]\w*|barulho\w*|reflex(?:o|os)\b|arranh\w*|estilha[çc]\w*|sujeira\w*|risca\w*|fugir\w*|erpelid\w*|respond\w*|escorreg\w*|escoamento)\b/i;
/** CP-01 SESS: TEMPO-DE-AÇÃO material — "seca em três minutos", "cura em
 *  12 horas", "fica pronto em cinco segundos". Predica desempenho material
 *  medido (R5 plano-detalhe) — irredutível a idioma qualquer. */
const RX_TEMPO_ACAO_DESCRITOR =
  /\b(?:secage\w|sec\w+|cura\w+|fixa[çc][ãa]o\w*|fix\w+|endurec\w*|desinfet\w*|esteriliz\w*|ating\w+|alcan[çc]\w+|chega\w*|fica\w*\s+pront\w+|pront\w+)\s+(?:completo\w*|completa\w*)?\s*em\s+(?:\d|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|quatorze|quinze|dezesseis|dezessete|dezoito|dezenove|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem|cento|mil)\w*\s*(?:segundos?|minutos?|horas?|dias?|meses?|anos?)\b/i;

/** CP-01 OB-C16: TEMPO-DE-EFEITO material ("melhora em sete dias"). */
const RX_TEMPO_EFEITO =
  /\b(?:melhor\w+|resolve\w*|sar\w+|cura\w*|apaga\w*|passa\w+|some\w+|desaparec\w*|alivia\w*|elimina\w+|reduz\w+|sec\w+|estabiliz\w+)\s+em\s+(?:\d{1,3}|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|quatorze|quinze|vinte|trinta|quarenta|cinquenta)\s+(?:dias?|horas?|minutos?|semanas?|meses?|anos?)\b/i;

// CP-01 CA-F07 — faixa/intervalo por extenso ("oito a dez aplicações"): faixa é quantidade.
/** CP-01 CA-F07b: preço-piso por anchor ("a partir de cem reais"). */
const RX_A_PARTIR_DE_PRECO = /\ba\s+partir\s+de\s+(?:\d|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|catorze|quinze|vinte|trinta|quarenta|cinquenta|cem|cento|mil|dois\s+mil|cinco\s+mil|dez\s+mil)/i;

/** CP-01 CA-F01: autodesignação tolerante a interjeição curta entre
 *  sujeito e núcleo ("somos, e quem conhece sabe: os primeiros") — a
 *  fragmentação retórica não dissolve o claim de primeiro lugar. */
const RX_AUTODESIGNACAO_TOL = /\b(?:somos|estamos|chegamos|permanecemos|continuamos)[\wÀ-ÿ]*[\s,;:\u2014\u2013\u2019]{1,3}(?:[\wÀ-ÿ]+[\s,;:\u2014\u2013\u2019]{1,3}){0,5}(?:os\s+|as\s+|o\s+|a\s+)?(?:primeiros?|maiores|l[íi]der(?:es)?|refer[êe]ncia(?:s)?|n[úu]mero\s+um)\b/i;

const RX_FAIXA_NUM_EXTENSO = /\bentre\s+(?:um|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|catorze|quinze|vinte|trinta|quarenta|cem|cento|mil)\s+e\s+(?:um|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|catorze|quinze|vinte|trinta|quarenta|cem|cento|mil)\b|\b(?:um|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|catorze|quinze|vinte|trinta|quarenta|cem|cento|mil)\s+a\s+(?:um|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|catorze|quinze|vinte|trinta|quarenta|cem|cento|mil)\b/i;

// CP-01 CA-F06 — coloquial de prazo/atendimento ("chega rapidinho","na hora","num piscar","sem espera").
const RX_COLOQUIAL_PRAZO = /(?:chega\w*|chegamos|entregamos|entrega\w*|atendemos|agend\w*|respondemos|sai|saiu)\s+(?:rapidinho|na hora|na mesma hora|num piscar|num instante|de boa)|(?:sem|nunca\s+(?:h[áa]|tem|fica\w*\s+com))\s+(?:espera|demora)\b/i;

// CP-01 CA-F12 — passiva material pelo verbo ser ("é feito à mão","é garantido de fábrica")
const RX_PASSIVA_MAT = /(?:^|[\s,;:.])(?:[ée]|s[ãa]o|foi|foram)\s+(?:feito[as]?|fabricados?|produzidos?|garantidos?|entregues?|atuados?|cumpridos?|pagos?|vendidos?|enviados?|aprovados?)(?:\s+(?:[àa]\s+m[ãa]o|comprovadamente|de\s+f[áa]brica|por\s+(?:n[óo]s|a\s+(?:empresa|equipe))))?/i;

// CP-01 CA-F09 — direção criativa mandando inserir claim citado entre aspas
const RX_DIRECAO_CITADA_MAT = /\b(?:diga|mencione|encerre\s+com|mostre|exiba|exibe|destaque|insira?|repete?|escreva?|inclua?|grite|prometa)\s+(?:que\s+)?['"“][^'"”]{4,120}['"”]/i;

// CP-01 CA-F02 — disponibilidade-fato ("agenda aberta amanhã","vagas abertas")
const RX_DISPONIBILIDADE_FATO = /\b(?:agenda|agendamento|vagas?|horarios?|hor[áa]rios?|atendimento|estoque|atendimentos?)\s+(?:est[áa]o?\s+|estao\s+)?(?:abert[oa]s?|dispon[ií]ve(?:l|is)|livres?)\s+(?:amanh[ãa]|hoje|j[áa]|agora|toda\s+semana|todos\s+os\s+dias|nesta\s+\w+|na\s+\w+|esta\s+\w+)(?=\W|$)/i;

/** Taxa de desempenho ("mil lances ao dia", "duzentos rótulos por hora"). */
const RX_TAXA_DESEMPENHO =
  /\b(?:\d+|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|vinte|trinta|quarenta|cinquenta|cem|cento|duzent[ao]s|mil(?:h[ãa]o|hões)?|[a-zà-ÿ]{3,}zenas?|[a-zà-ÿ]{3,}tenas?)\s+(?:[\wÀ-ÿ]+)\s+(?:por|cada|ao|por\s+a)\s+(?:hora|segundo|minuto|dia|m[êe]s|semana|ano|ciclo|ou shift|turno)\b/i;
/** Autonomia operacional ("liga sozinha", "atualiza sozinho", "acorda sozinha"). */
const RX_AUTONOMIA_IDIOM =
  /\b(?:liga\w*|desliga\w*|acorda\w*|atualiz\w*|instala\w*|sincroniz\w*|grava\w*|monitora\w*|captur\w*|abre\w*|fecha\w*|chama\w*|escuta\w*|responde\w*|reinicia\w*|registra\w*|agenda\w*|funciona\w*|roda\w*|audita\w*)\s+(?:sozinh[ao]s?\b|automaticamente\b|sem\s+(?:ajuda|interven[çc][ãa]o|supervis[ãa]o|ningu[ée]m\s+por\s+tr[áa]s))/i;
/** Confiabilidade idiomática ("nunca falha", "nunca chega atrasado", "nenhum parafuso escapa"). */
const RX_IDIOMA_CONFIABILIDADE =
  /\b(?:nunca|jamais|n[ãa]o)\s+(?:[\wÀ-ÿ]{2,}\s+)?(?:falha\w*|quebr\w*|vaza\w*|escoa\w*|para\w*|trav\w*|congel\w*|deslig\w*|apag\w*|atras\w*|entop\w*|verg\w*|amass\w*|dobr\w*|torc\w*|fur\w*|rach\w*|trinc\w*|romp\w*|derret\w*|descarr\w*|manch\w*|escap\w*|ced\w*|do[ée]r|cort\w*|rasg\w*|danific\w*|estraga\w*|amass\w*|murch\w*|porr\w*)\b|\bnenhum(?:a)?\s+[\wÀ-ÿ]{2,}\s+(?:escap\w*|fica\s+de\s+fora|falha\w*|falta\w*|vaza\w*|quebra\w*)\b/i;
/** Prazo coloquial de entrega ("hoje mesmo", "amanhã mesmo", "em doze"). */
const RX_IDIOMA_PRAZO_COLOQUIAL =
  /\bhoje\s+mesmo\b|\bhoje\s+ainda\b|\bainda\s+hoje\b|\bainda\s+esta\s+semana\b|\bna\s+mesma\s+semana\b|\bna\s+pr[óo]xima\s+semana\b|\bpara\s+ficar\s+pronto\b|\b(?:entrega|recebimento|despacho|instala[cç][aãa]o|suporte|atendimento|agendamento|retirada|coleta|prazo|envio)\w*\s+(?:[\wÀ-ÿ]{1,14}\s+){0,3}amanh[aã](?:\s+(?:mesmo|cedo))?\b|\bat[ée]\s+(?:as|às)\s+(?:\d{1,2}|uma?|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|meio-dia|meia-noite)(?:\s*horas?)?\b|\bem\s+(?:doze|onze|treze|quatorze|dezesseis|dezoito|dois|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez)\s*(?:(?:x|vezes|parcelas?|meses)\b|(?=\s*[.,!?]|$))/i;
const RX_IDIOMA_PORTA = /\bporta\s+a\s+porta\b|\b(?:na|at[ée])\s+a?s?\s*(?:sua\s+)?porta\b/i;
const RX_IDIOMA_FISICA =
  /\b(?:\d+|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|vinte|trinta|quarenta|cem|cento)\s*(?:bar\b|psi\b|watts?\b|w\b|kw\b|kwh\b|volts?\b|v\b|amp[ée]r\w+|ah\b|db\b|decib\w+|lux\w*|lumens\b|m(?:ega)?pascal\w*|mpa\b|barra\w*|atmosfera\w*)\b/i;
const RX_IDIOMA_INSTSIGLA =
  /\b[A-ZÀ-Þ]{2,}\s*[-–]\s*(?:certificad\w*|valid[áa]vel\w*|aprovad\w*|comprovad\w*|reconhecid\w*|homologad\w*|registrad\w*|licenciad\w*)\w*\b/i;
const RX_BOLSO_DIMENSAO = /\bde\s+bolso\b\s*,?\s*(?:,\s*)?(?:e\s+)?[^.!?]{0,48}?(?:cent[íi]metr\w*|cm\b|mm\b|metro\w*|fechado\w*|dobrad\w*|desliz\w+|cab\w+|entra\w+|lado\s*a\s*lado\w*)/i;
const RX_IDIOMA_PRECISAO = /\b(?:acerta\w*\s+na\s+mosca|nunca\s+erra|acerto\s+garantido|sem\s+errar|milim[ée]tr\w+|microm[ée]tr\w+|nanom[ée]tr\w+|cir[úu]rgic\w*|molecular\w*)\b/i;

const RX_DA_PRA = /\b(?:da|dá)\s+pra\s+[\wÀ-ÿ]{3,}(?:ar|er|ir)\b/i;
const RX_NAO_PRECISA = /\bn[ãa]o\s+(?:se\s+)?precisa\w*\s+(?:de|d[ae]|com|para)\b|\bn[ãa]o\s+requer\w*/i;
const RX_IDIOMA_FRETE_PRAZO =
  /\b(?:frete\w*|colet\w*|retirada\w*|devolu[çc][ãa]\w*|retorno\w*|reposi[çc][ãa]\w*)\s+(?:[\wÀ-ÿ]+\s+){0,4}(?:ano\w*|m[êe]ses|m[êe]s\w*|semanas?|municipio\w*|munic[íi]pio\w*|bairro\w*|cidade\w*|estado\w*|zona\w*|regi[ãa]o\w*|lugar\w*)/i;
const RX_IDIOMA_CONTA = /\b(?:por|de)\s+(?:nossa|minha)\s+conta\b/i;
/** Condição operacional de execução de serviço logístico — raiz de
 *  serviço (coleta/entrega/instalação/visita/retirada/montagem) + condição
 *  explícita de execução (sem aviso prévio, sem agendamento, sem hora
 *  marcada, mediante autorização). Classe fechada: o FATO operacional é
 *  afirmado ("Coleta na cozinha sem aviso prévio."). */
const RX_IDIOMA_CONDICAO_OPERACIONAL =
  /\b(?:colet\w*|entreg\w*|instal\w*|visita\w*|retirada\w*|montag\w*|assist[êe]ncia\w*)\b[^.!?]{0,40}?\bsem\s+(?:aviso\w*|agendamento\w*|hora\s+marcada|autoriza[çc][ãa]o\w*|combina[çc][ãa]o\w*)\b|\bsem\s+(?:aviso\w*|agendamento\w*|hora\s+marcada)\b[^.!?]{0,24}?\b(?:colet\w*|entreg\w*|instal\w*|visita\w*|retirada\w*|montag\w*)\b/i;
const RX_IDIOMA_FECHO = /\bcom\s+(?:um\s+)?(?:clique\w*|fecho\w*|toque\b)\b/i;
const RX_IDIOMA_VOZ = /\b(?:com|por)\s+(?:a\s+)?(?:sua\s+)?voz\b/i;
const RX_ABUNDANCIA_NEG =
  /\b(?:sobra|falta\w*)\s+[\wÀ-ÿ]+\s+(?:em\s+)?(?:ambiente\s+nenhum|lugar\s+nenhum|nenhum\w*|tod[oa]\w*|qualquer\w*)[\wÀ-ÿ]{0,}/i;

const RX_CARGA_FISICA = /\b(?:sob|com|mesmo\s+com|em)\s+(?:carga\w*|press[ãa]o\w*|peso\w*|chuva\w*|sol\w*|calor\w*|frio\w*|vento\w*)\b|\bcasa\s+cheia\b/i;
const RX_IDIOMA_COBERTURA = /\b\w*(?:cobre|cobr\w*|entend\w*|compreend\w*|fal\w*|atend\w*|alcan[çc]\w*|abra[çc]\w*|serve\w*|existe\w*)\s+[^.!?]{0,32}?(?:brasil\s+(?:intei\w+)|todo\s+o\s+\w+|toda\s+a\s+\w+|mundo\s+inteiro|pa[íi]s\s+inteiro)\b/i;

const RX_IDIOMA_PRAZO =
  /\b(?:um|1)\s+dia\s+[úu]til\b|\b24\s*horas\b|\bno\s+mesmo\s+dia\b|\bno\s+dia\s+seguinte\b|\bsem\s+ferramenta\w*\b|\bpronta?\s+entrega\b|\btempo\s+recorde\b|\binstalacao\s+gratuita\b|\binstala[çc][ãa]o\s+inclusa\b/i;

/** Verbo material suplementar — desempenho/resistência/logística/contrato
 *  implícito (classe verbal, não sujeito). */
const RX_VERBO_FACTUAL_EXTRA =
  /(?:^|[^\wÀ-ÿ])(?:aguent\w*|aguant\w*|resist\w*|migr\w*|export\w*|import\w*|volt\w*|serv\w+|cobr\w+|mand\w+|troc\w+|aprov\w+|endoss\w+|indic\w+|recomend\w*|conviv\w*|brig\w*|incomod\w*|talh\w*|rach\w*|escoa\w*|fix\w+|sec\w+a\b|imped\w*|repet\w+|repetim\w*|acompanh\w*|continu\w+|aprend\w*|atualiz\w*|reinstal\w*|arquiv\w*|registr\w*|peg\w+|sa[ií]\w*|rod\w+a\b|cabe\b|deix\w*|entr\w*|sec\w*a\b|rod\w*a\b|sa[ií]\w*|cabe\b|enviamos\b|quebr\w+|vaza(?:m|ndo|u)?\b)/i;

/** Sentença INTERROGATIVA genuína (termina em ?/¿) — pergunta não é asserção. */
const RX_INTERROGATIVA = /[?¿][\s"'”)]*$/;

/** Conteúdo ASSERTIVO embutido — veto compartilhado de qualquer porto-
 *  seguro criativo (RC-2): núcleo material, posse, quantificação, satélite,
 *  particípio agenciado, idioma de prazo, entidade×verbo factual listado.
 *  Se qualquer casa, a sentença TEM conteúdo factual e nenhuma forma de
 *  direção pode declará-la não-material. */
function conteudoAssertivoEmbutido(t: string): boolean {
  // CP-01/P1: pergunta hipotético-condicional MARCADA ("o que mudaria se a
  // escova DURASSE…?") enuncia POSSIBILIDADE — CP-09: pergunta de dúvida é
  // safe class. NÃO vale para pressuposições comerciais hígidas (preço,
  // núcleo hard, logística, credencial, disponibilidade, credencial, CTA).
  if (RX_INTERROGATIVA.test(t) && hipoteseCondicionalMarcada(t) &&
      !(RX_NUCLEO_MATERIAL_HARD.test(t) || RX_POSSE_COMERCIAL.test(t) ||
        RX_LOGISTICA_AMANHA.test(t) || RX_DISPONIBILIDADE_PERMANENTE.test(t) ||
        RX_CREDENCIAL_MERITORIA.test(t) || RX_IDIOMA_FRETE_PRAZO.test(t) ||
        RX_CONVENIENCIA_VOCATIVA.test(t) || RX_AGENDA_LIVRE.test(t) ||
        RX_EXCLUSIVIDADE_ESCOPO.test(t) || RX_PASSIVA_SINTETICA.test(t) ||
        RX_REEMBOLSO.test(t) || RX_SUPERLATIVO_COMERCIAL.test(t) ||
        RX_NAO_EXIGENCIA.test(t) || RX_HISTORICO_INCIDENTE.test(t) ||
        RX_ESCOPO_EXAUSTIVO.test(t) || RX_COMPARATIVO_MATERIAL.test(t) ||
        RX_ESCOPO_TERRITORIAL.test(t) || RX_ORIGEM_DECLARADA.test(t) ||
        RX_CADENCIA_OPERACIONAL.test(t) || RX_TEMPO_EFEITO.test(t) || RX_FAIXA_NUM_EXTENSO.test(t) || RX_A_PARTIR_DE_PRECO.test(t) || RX_COLOQUIAL_PRAZO.test(t) || RX_PASSIVA_MAT.test(t) || RX_DIRECAO_CITADA_MAT.test(t) || RX_DISPONIBILIDADE_FATO.test(t) || gentilicoComOrigem(t))) return false;
  // CP-01 XR-OB (P10/P11): veto comercial DURO nega safe-harbor SEMPRE;
  // sinais FRACOS só vetam quando não moram, exclusivamente, no artefato.
  if (temVetoComercialDuroCP01(t)) return true;
  if (sinalDeApenasArtefatoCP01(t)) return false;
  // pergunta hipotético-condicional MARCADA enuncia possibilidade — não claim.
  if (RX_INTERROGATIVA.test(t) && hipoteseCondicionalMarcada(t)) return false;
  if (RX_QUANTIFICACAO_MATERIAL.test(t) && !RX_QUANT_MIDIA_LOCAL.test(t) &&
      !quantMedeApenasArtefato(t)) return true;
  if (RX_SATELITE_AVALIATIVO.test(t)) return true;
  if (RX_PARTICIPIO_COMPLEMENTO.test(t)) return true;
  if (RX_ENTIDADE_COMERCIAL.test(t) &&
      (RX_VERBO_FACTUAL.test(t) || RX_COPULA_FACTUAL.test(t))) return true;
  // CP-01: o unificador É o veto — nenhum idioma material fraco atravessa
  // por embalagem sintática (interrogativa/rótulo/comentário/metadado).
  if (temSinalIdiomaticoR6(t)) return true;
  return false;
}

/** Stems do QUADRO presentes (domínio de produção/arte) — porto-seguro por
 *  DOMÍNIO FECHADO (cânone CP-08) quando NÃO há qualquer veto duro. */
/** Estrutura de storyboard/roteiro: ≥2 slots de produção ("gancho 3
 *  segundos — produto — CTA", "hook / cena / cta") — a própria forma de
 *  mapa estrutural prova a natureza operacional da menção. */
const RX_SLOT_STORY = /(?:^|[\s—–/|])(gancho|gatilho|hook|cta|pov|take|beat|viral|cena|abertura|final)\b/gi;
function sentencaEhStoryboard(t: string): boolean {
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = RX_SLOT_STORY.exec(t)) !== null) seen.add(m[1].toLowerCase());
  return seen.size >= 2;
}

function quadroDominante(t: string): boolean {
  const stems = stemsSignificativos(t).filter((x) => !stemEhGenericoAberta(x));
  if (stems.length === 0) return false;
  if (RX_ENTIDADE_COMERCIAL.test(t) && !RX_SAFE_HARBOR_CINE.test(t)) return false; // R6: entidade comercial não mora dentro do quadro
  const quadro = stemsDoQuadro(stems);
  const cine = RX_SAFE_HARBOR_CINE.test(t) ? 1 : 0;
  return quadro + cine > 0;
}
function vetoDuroParaQuadro(t: string): boolean {
  if (nucleoHardNaoNegado(t)) return true;
  if (RX_POSSE_COMERCIAL.test(t)) return true;
  if (RX_SATELITE_AVALIATIVO.test(t)) return true;
  if (RX_ESCOPO_EXAUSTIVO.test(t)) return true;
  if (RX_PROPORCAO_SOCIAL.test(t) || RX_PROPORCAO_SOCIAL2.test(t) || RX_MAIS_DE_NUMERICO.test(t)) return true;
  if (RX_COMPARATIVO_MATERIAL.test(t)) return true;
  if (RX_IDIOMA_PRAZO.test(t)) return true;
  if (RX_PARTICIPIO_COMPLEMENTO.test(t)) return true;
  return false;
}

// ======================================================================
// R6 — SUPRESSÕES ESTRUTURAIS DO GATE INDETERMINADO (creative freedom)
// O veredito "não-material" exige FORMA comprovável, nunca rótulo; as
// supressões abaixo são classes morfológicas/estruturais FECHADAS e
// documentáveis (não dicionário de conteúdo), alinhadas ao cânone criativo
// declarado pela própria missão CP-08 (câmera/lente/luz/cor/som/ritmo/
// transição/edição/composição/direção de arte/continuidade/UGC/humor).
// ======================================================================

/** Quantificação técnica DE MÍDIA (segundos/minutos/quadros/tomadas do
 *  artefato) — especificação da produção, não quantificação factual
 *  comercial ("gancho 3 segundos", "take de quinze segundos"). */
const RX_QUANT_MIDIA_LOCAL = new RegExp(
  "\\b" + RX_NUMERAL_EXTENSO + "(?:\\s+[\\wÀ-ÿ%]+){0,2}\\s*(?:segundos?\\b|minutos?\\b|quadros?\\b|tomadas?\\b|takes?\\b|fps\\b|frames?\\b)", "i");

/** Cópula VERDADEIRA (à prova de conjunção): "é/era/foi/será/está" como
 *  verbo de ligação, excluindo o "e" CONJUNÇÃO (aditiva/temporal/causal:
 *  "e quando", "e então", "e depois") que o regex compartilhado fagocita.
 *  Implementação por janela local — não depende do RX_COPULA global. */
const RX_COPULA_LOCAL =
  /(?:^|[\s,;:—–\-])((?:[ée]|era|eram|foi|foram|fosse|s[ãa]o|ser[áa]|seria|ser[ãa]o|est[áa]|est[ãa]o|estava\w*))\s+(?!(?:quando|porque|pois|se|depois|ent[ãa]o|que|mas|nem|ou|e|a[ií]|ainda)\b|[\wÀ-ÿ]{3,}(?:ar|er|ir)\b)/i;
function temCopulaVerdadeira(t: string): boolean {
  return RX_COPULA_LOCAL.test(t);
}

/** Cópula SOZINHA não é verbo factual para o gate INDETERMINADO — frases
 *  como "é só um brilho difícil de explicar" usam a cópula como cola
 *  nominal da metáfora; a cópula continua contando nos caminhos
 *  CONHECIDOS (núcleo/entidade/posse), como sempre. */
function matchVerboMaterial(t: string): boolean {
  for (const fonte of [RX_VERBO_FACTUAL.source, RX_VERBO_FACTUAL_EXTRA.source]) {
    const rx = new RegExp(fonte, "ig");
    let m: RegExpExecArray | null;
    let achou = false;
    let soParticipios = true;
    while ((m = rx.exec(t)) !== null) {
      const tok = m[0].replace(/^[^\wÀ-ÿ]+|[^\wÀ-ÿ]+$/g, "").toLowerCase();
      if (/^(?:[ée](?:ramos|ram|ra)?|s[ãa]o|est[áa]\w*|est[ãa]o|foi\w*|foram|ser[áa]\w*|ser[ãa]o)$/.test(tok)) continue;
      achou = true;
      if (!/^(?:entre|entrem|entrer)$/.test(tok) && !/(?:ad[oaie]s?|id[oaie]s?|ud[oaie]s?|eit[oa]s?)$/.test(tok)) soParticipios = false;
    }
    // apenas particípios de cola metafórica (("aprendido" em "cada fio é um
    // raio de sol aprendido") não contam como verbo factual assertivo
    if (achou && !soParticipios) return true;
  }
  return false;
}
function verboFAssertivo(t: string): boolean {
  return matchVerboMaterial(t) ||
    /\bvai\s+[\wÀ-ÿ]{3,}(?:ar|er|ir)\b|\bv[ãa]o\s+[\wÀ-ÿ]{3,}(?:ar|er|ir)\b|\bir[áa]\s+[\wÀ-ÿ]{3,}(?:ar|er|ir)\b|\bpodem\s+[\wÀ-ÿ]{3,}(?:ar|er|ir)\b/i.test(t);
}
/** Imperativo de CTA (mesma classe do estágio 11) — o verbo é endereço ao
 *  consumidor ("Garanta hoje o seu recorde"), não predicação factual. */
const RX_CTA_IMPERATIVO =
  /^\s*(?:vem|venha|gostou\b|aproveite|chame|ligue|compre|pe[çc]a|clique|saiba|descubra|fa[çc]a|experimente|garanta|corra|acesse|participe|assine|agende|visite|confira|aproveitem|comprem|garantam)\b/i;

/** Idioma de FACILIDADE por infinitivo ("é só abrir", "basta plugar",
 *  "e so conectar") — conveniência/montagem afirmada por forma fechada;
 *  substitui a dependência do perifrástico "vai" para essa classe. */
const RX_FACILIDADE_INFINITIVO =
  /\b(?:[ée]\s+)?(?:s[oó]|basta|bastam|simplesmente)\s+(?:[ée]\s+)?[\wÀ-ÿ]{3,}(?:ar|er|ir)\b/i;

/** Stems que pertencem ao QUADRO DE PRODUÇÃO (cânone criativo CP-08):
 *  ritmo/humor/câmera/cor/luz/som/edição/transição/movimento/direção de
 *  arte/estética — vocabulário DO ARTEFATO, nunca do objeto comercial.
 *  Conjunto fechado, declarado, com prefixo ≥4. */
const QUADRO_PRODUCAO: readonly string[] = [
  "ritmo", "humor", "aceler", "lentid", "convers", "palco", "cenar", "cenic",
  "textur", "palet", "atmosf", "estet", "minima", "brilh", "sinal", "wifi",
  "cor", "color", "camer", "c[âa]mera", "luz", "lente", "sonor", "som",
  "trilh", "edica", "edit", "transi", "movim", "enquadr", "fotogr", "cenogr",
  "figurin", "ritmic", "clima", "dourad", "acinzent", "gancho", "hook", "gatilh", "scrap", "cinem", "story", "estori"
];
function stemsDoQuadro(stems: readonly string[]): number {
  let n = 0;
  for (const s of stems) {
    for (const g of QUADRO_PRODUCAO) {
      if (s === g || (g.length >= 4 && s.startsWith(g))) { n += 1; break; }
    }
  }
  return n;
}

/** CP-01 (P4.1.1 I9 + ensaio): TRABALHO INTERNO DECLARADO — a própria
 *  sentença enuncia o estatuto de elaboração ("Priorizamos testar desconto
 *  como hipótese de trabalho", "Avaliar headset novo no mesmo teste
 *  interno") com VERBO de produção E âncora de estatuto (hipótese/teste/
 *  avaliação/interno). Não é peça publicável de produto: não é claim.
 *  Restrições: não silencia quando há núcleo ABSOLUTO de promoção já
 *  configurada (preço-fixo porque-decidido, credencial falsa declarada) —
 *  nesses casos verbo+âncora não bastam (injetável). */
const RX_VERBO_TRABALHO_INTERNO =
  /\b(?:prioriz(?:amos|o\b|ei\b|aram\b)|prefer(?:imos|i\b|o\b|iram\b)|test(?:ar|amos|ei\b|aram\b|aremos\b)|avalia(?:r|mos|ei\b|ram\b)|analisa(?:r|mos|ei\b|ram\b)|medi(?:r|mos|i\b|ram\b)|mensura(?:r|mos|ei\b|ram\b)|experimenta(?:r|mos|ei\b|ram\b)|valida(?:r|mos|ei\b|ram\b)|verifica(?:r|mos|quei\b|ram\b)|checa(?:r|mos|ei\b|ram\b)|monta(?:r|mos|ei\b|ram\b)|mapea(?:r|mos|ei\b|ram\b)|prop(?:omos|us\b|usei\b|useram\b|or\b)|sugeri(?:r|mos|u\b|ram\b)|cri(?:a(?:mos|ei\b|ram\b)|ar|amos)|redig(?:imos|i\b|iram\b|ir\b)|escre(?:vemos|vi\b|veram\b|ver\b)|refina(?:r|mos|ei\b|ram\b)|desenvol(?:vemos|veu\b|ver\b)|simul(?:amos|ei\b|aram\b|ar)|otimiza(?:r|mos|ei\b|ram\b)|revisa(?:r|mos|ei\b|ram\b)|compara(?:r|mos|ei\b|ram\b)|explor(?:amos|ei\b|aram\b|ar)|estuda(?:r|mos|ei\b|ram\b)|planeja(?:r|mos|ei\b|ram\b)|prepara(?:r|mos|ei\b|ram\b)|pesquis(?:amos|ei\b|aram\b|ar)|brainstorm)\b/i;
const RX_ANCORA_ESTATUTO_TRABALHO =
  /\b(?:sugest[aã]o|pendente|condicional|hip[óo]tese\w*|brainstorm\w*|avalia[cç][ãa]o|valida[cç][ãa]o|verifica[cç][ãa]o|preliminar(?:es)?\b|intern[ao]s?\b|piloto\b|simula[cç][ãa]o\w*|experimento\w+|roadmap\w*|pauta\b|abordage\w+\b)\b|\bteste\s+(?:de\s+trabalho|preliminar|interno|piloto|de\s+conceito)\b/i;
function sentencaEhTrabalhoInternoDeclarado(t: string): boolean {
  if (RX_INTERROGATIVA.test(t)) return false;
  // CP-01: apenas a FORMA COMPLETA do verbo de elaboração (1ª pessoa,
  // imperativo ou infinitivo) é reconhecida — o nominal derivado ("teste",
  // "avaliação") não é verbo, e a âncora precisa ser âncora de ESTATUTO
  // seletiva ("teste de queda" ≠ "teste de trabalho"): "Aprovado em teste
  // de queda." passiva-agenciada NÃO é declaração de trabalho interno.
  if (!RX_VERBO_TRABALHO_INTERNO.test(t)) return false;
  if (!RX_ANCORA_ESTATUTO_TRABALHO.test(t)) return false;
  if (sentencaTemPromocaoSobreFaixa(t, t)) return false;
  return true;
}

function detectarAssercaoMaterialAberta(
  s: string
): { motivo: "POSSE" | "PREDICADO" | "QUANTIFICACAO" | "INDETERMINADO" | "IDIOMA_MATERIAL" } | null {
  const t = s.trim();
  if (!t || sentencaEhSafeHarbor(t)) return null;
  // CP-01 XR-OB (P10, sem túnel P11): sinal residente apenas no artefato
  // (cânone de produção, sem veto comercial duro) não é claim aberto.
  if (sinalDeApenasArtefatoCP01(t)) return null;
  // CP-01: trabalho interno declarado (verbo de elaboração + âncora de
  // estatuto) não é publicável de produto — I9 forma completa, não é claim.
  if (sentencaEhTrabalhoInternoDeclarado(t)) return null;
  // CP-01 (ensaiador): veto DURO sem categoria clássica também é sinal
  // material — fail-closed ("não precisa bancar nada adiante".
  if (temVetoComercialDuroCP01(t)) return { motivo: "IDIOMA_MATERIAL" };
  // CP-01 CA-F05d: sinal material por canal idiomático/eco também fecha o
  //  gate aberto ("Agenda aberta amanhã.", "O resultado é garantido.").
  if (temSinalIdiomaticoR6(t) || temSinalMaterialCanalCP01(t)) return { motivo: "IDIOMA_MATERIAL" };
  const entidade = RX_ENTIDADE_COMERCIAL.test(t) || RX_POSSE_COMERCIAL.test(t);
  const verboFactual =
    RX_VERBO_FACTUAL.test(t) || RX_COPULA_FACTUAL.test(t) ||
    /\bvai\s+[\wÀ-ÿ]{3,}|\bv[ãa]o\s+[\wÀ-ÿ]{3,}|\bir[áa]\s+[\wÀ-ÿ]{3,}|\bpodem\s+[\wÀ-ÿ]{3,}/i.test(t) ||
    RX_VERBO_FACTUAL_EXTRA.test(t);
  if (RX_NUCLEO_MATERIAL_HARD.test(t)) {
    if (verboFactual || RX_POSSE_COMERCIAL.test(t) || entidade) {
      return { motivo: RX_POSSE_COMERCIAL.test(t) ? "POSSE" : "PREDICADO" };
    }
    if (RX_QUANTIFICACAO_MATERIAL.test(t)) return { motivo: "QUANTIFICACAO" };
    // R6: núcleo órfão pode ser predicativo por particípio/satélite/idioma
    // ("Aprovado em teste de queda.", "Testado em cem cabeles diferentes.",
    // "Devolucao simplificada.") — cai no gate indeterminado antes do null.
    const stemsN = stemsSignificativos(t).filter((x) => !stemEhGenericoAberta(x));
    if (sinalAssercaoPotencialIndeterminada(t, stemsN, verboFactual)) {
      return { motivo: "INDETERMINADO" };
    }
    return null;
  }
  if (RX_QUANTIFICACAO_MATERIAL.test(t)) return { motivo: "QUANTIFICACAO" };
  const stems = stemsSignificativos(t).filter((x) => !stemEhGenericoAberta(x));
  if (entidade && verboFactual && stems.length > 0) {
    return { motivo: RX_POSSE_COMERCIAL.test(t) ? "POSSE" : "PREDICADO" };
  }
  if (RX_POSSE_COMERCIAL.test(t) && /[0-9]/.test(t)) return { motivo: "QUANTIFICACAO" };
  // R6 (CP-09 RC-1): RECOGNITION ≠ AUTHORIZATION — esgotadas as classes
  // CONHECIDAS (núcleo/quantificação/posse/entidade×verbo), a sentença
  // declarativa com predicação factual plausível e SEM porto-seguro
  // comprovável não recebe silêncio-aprovado: UNKNOWN material-plausível
  // → INDETERMINADO (o chamador converte em QUALIFICAR/REVISÃO).
  if (sinalAssercaoPotencialIndeterminada(t, stems, verboFactual)) {
    return { motivo: "INDETERMINADO" };
  }
  return null;
}

/** Sinais estruturais de asserção material potencial quando NENHUMA classe
 *  conhecida casou: classes morfológicas fechadas de predicação factual —
 *  verbo factual com conteúdo, particípio agenciado, satélite avaliativo,
 *  escopo exaustivo, proporção social, comparativo, idioma de prazo. */
// ======================================================================
// CP-01 FECHAMENTO (CP-10 XR-OB) — PRECEDÊNCIA DO CÂNONE CRIATIVO
// DUAS camadas: veto comercial DURO (nunca suprimido) × sinais FRACOS
// (suprimidos quando dominados pelo artefato). P10 sem túnel P11.
// ======================================================================

/** Termos de formato/parâmetro do ARTEFATO (prefixo ≥4) — extensão do
 *  QUADRO_PRODUCAO para gêneros, estruturas e parâmetros de imagem/som. */
const RX_TERMO_ARTEFATO_EXT =
  /\b(?:personagem\w*|ironia\w*|ir[ôo]nic\w*|cta\b|takes?\b|cortes?\s+(?:de|do)|cenas?\b|atos?\b|quadros?\b|blocos?\b|hooks?\b|ganchos?\b|flashback\w*|storytel\w*|UGC\b|POV\b|founder[- ]led|document[áa]rio\w*|entrevista\w*|sketch\w*|tutorial\w*|meme\w*|satura[çc][ãa]\w*|gr[ãa]o\b|vinhet\w*|exposi[çc][ãa]o\w*|trilha\w*|som\s+(?:de|ambiente)|sombra\w*|persiana\w*|azulej\w*|embacad?[oa]\w*|jump\s+cut\w*|fus[ãa]o\b|preto\s+e\s+branco|plong[ée]e\w*|contra[- ]?luz|dolly\w*|rack\s+focus|foco\s+(?:rack|do|de)|segundo\s+trinta|primeir[ao]\s+(?:imagem|segundo|quadro)|[úu]ltimo\s+(?:quadro|take|corte)|antes\s+do\s+[úu]ltimo\s+quadro)/i;
/** Formas de instrução de direção (abertura/fecho de cena). */
const RX_INSTRUCAO_DIRECAO =
  /^\s{0,20}(?:abre|fecha|encerra|inicia|termina|congela|corta\w*)\s+(?:com|em|na|no|pelo|pela|de|do|da)\b|^\s{0,20}(?:nada\s+de|sem)\s+(?:satura[çc][ãa]\w*|gr[ãa]o\b|vinhet\w*|exagero\w*|efeito\w*|zoom|transi[çc][ãa]o\w*|narrador\w*|trilha\w*|teleprompter\w*)/i;
/** Unidade de artefato medida por quantificador ("três takes de trinta
 *  segundos", "quinze segundos de corte"). */
const RX_UNIDADE_ARTEFATO =
  /\b(?:takes?|cortes?|cenas?|atos?|quadros?|blocos?|frames?|shots?|ganchos?|hooks?|segundos?|minutos?)\b/i;
function quantMedeApenasArtefato(t: string): boolean {
  if (!RX_QUANTIFICACAO_MATERIAL.test(t)) return false;
  // qualquer unidade claramente comercial na frase desqualifica o carve
  if (/\b(?:aplica[çc][õo]es|lavagens?|anos?|meses|dias|semanas?|horas?(?:\s+[úu]tei?s?)?|dias?\s+[úu]te(?:l|is)|por\s+cento|%|reais|r\$|ml\b|litros?|gramas?|kg\b|watts?|volts?|graus?|kms?|metros?|bairros?|cidades?|estados?|pa[íi]ses|lojas?|revendas?|clientes|sal[õo]es)\b/i.test(t)) return false;
  // unidade ESTRUTURAL do artefato basta (take/corte/cena/ato/quadro/bloco);
  // unidade TEMPORAL pura (segundos/minutos) exige termo-estrutural na frase
  const estrutural = /\b(?:takes?|cortes?|cenas?|atos?|quadros?|blocos?|frames?|shots?|ganchos?|hooks?|partes?|cap[íi]tulos?|vinhetas?|tablatura\w*)\b/i.test(t);
  // CP-01 OB-C6: pin/rótulo narrativo de produção também qualifica a estrutura
  // do artefato para unidades fracas ("quinze minutos atrasada" na cena,
  // "muda de ideia três vezes") — unidades comerciais da lista continuam
  // vetadas acima (horas/dias/anos/aplicações).
  return estrutural || RX_TERMO_ARTEFATO_EXT.test(t) || RX_QUANT_MIDIA_PRODUCAO.test(t) ||
    RX_PIN_PRODUCAO_NARRATIVA.test(t) || RX_ROTULO_METADADO.test(t);
}
/** VETO COMERCIAL DURO — nunca suprimido pelo cânone (P11). Reúne os duros
 *  do R6 + os duros do CP-01 (C-02/03/07/08/09/10/11/13/14/16/17/18/19). */
/** CP-01 OB-C8: promessa de isenção total de custo/transbordo — "não precisa
 *  bancar/pagar nada (adiante)". Idiom material de conveniência transacional. */
const RX_IDIOMA_ADIANTADO =
  /\bn[aãã]o\s+(?:precis\w+\s+)?(?:bancar|pagar|bancando|pagando)\s+(?:nada|nenhum|nem)\b/i;
/** CP-01 OB-C9: TEXTO LÓGICO — rótulo/pin de prefixo ("CTA:", "Entregável:")
 *  e pontuação interrogativa/final NÃO emancipam conteúdo material (P1/P2/H).
 *  Os testes de MATERIALIDADE usam esta forma normalizada; os testes de
 *  SUPRESSÃO (cânone/pins/metadado) continuam vendo a frase integral. */
function textoSemRotuloPontuacaoCP01(t: string): string {
  const u = t.replace(/[?¿!¡]+\s*$/, ".");
  const v = u.replace(/^\s{0,24}(?:\/\/|#)\s*/, "");
  return v.replace(/^\s{0,24}(?:[A-ZÀ-Þ][\wÀ-ÿ ]{1,40}:\s*)+/, "");
}
function textoSemRotuloCP01(t: string): string {
  return t.replace(/^\s{0,24}(?:[A-ZÀ-Þ][\wÀ-ÿ ]{1,40}:\s*)+/, "");
}

function temVetoComercialDuroCP01Base(t: string): boolean {
  return RX_NUCLEO_MATERIAL_HARD.test(t) || RX_POSSE_COMERCIAL.test(t) ||
    gentilicoComOrigem(t) || RX_FEITO_MANUFATURA.test(t) ||
    RX_ESCOPO_EXAUSTIVO.test(t) || RX_PROPORCAO_SOCIAL.test(t) || RX_PROPORCAO_SOCIAL2.test(t) ||
    RX_MAIS_DE_NUMERICO.test(t) || RX_COMPARATIVO_MATERIAL.test(t) ||
    (RX_IDIOMA_PRAZO.test(t) && !quantMedeApenasArtefato(t)) || (RX_IDIOMA_PRAZO_COLOQUIAL.test(t) && !quantMedeApenasArtefato(t)) ||
    RX_IDIOMA_FRETE_PRAZO.test(t) || RX_IDIOMA_CONFIABILIDADE.test(t) ||
    RX_CARGA_FISICA.test(t) || RX_IDIOMA_CONTA.test(t) || RX_IDIOMA_FECHO.test(t) ||
    RX_IDIOMA_VOZ.test(t) || RX_ABUNDANCIA_NEG.test(t) || RX_IDIOMA_PORTA.test(t) ||
    RX_IDIOMA_FISICA.test(t) || RX_IDIOMA_INSTSIGLA.test(t) || RX_IDIOMA_PRECISAO.test(t) ||
    RX_IDIOMA_DESEMPENHO.test(t) || RX_TAXA_DESEMPENHO.test(t) || RX_TEMPO_ACAO_DESCRITOR.test(t) || RX_TEMPO_EFEITO.test(t) || RX_FAIXA_NUM_EXTENSO.test(t) || RX_A_PARTIR_DE_PRECO.test(t) || RX_COLOQUIAL_PRAZO.test(t) || RX_PASSIVA_MAT.test(t) || RX_DIRECAO_CITADA_MAT.test(t) || RX_DISPONIBILIDADE_FATO.test(t) ||
    RX_AUTONOMIA_IDIOM.test(t) ||
    RX_IDIOMA_COBERTURA.test(t) || RX_IDIOMA_CONDICAO_OPERACIONAL.test(t) ||
    RX_LOGISTICA_AMANHA.test(t) || RX_ESCOPO_TERRITORIAL.test(t) ||
    (RX_SUPERLATIVO_COMERCIAL.test(t) || RX_SUPERLATIVO_ESCOPO_COMERCIAL.test(t)) || RX_NAO_EXIGENCIA.test(t) ||
    RX_DISPONIBILIDADE_PERMANENTE.test(t) || RX_HISTORICO_INCIDENTE.test(t) ||
    RX_CONVENIENCIA_VOCATIVA.test(t) || RX_AGENDA_LIVRE.test(t) ||
    RX_CREDENCIAL_MERITORIA.test(t) || RX_EXCLUSIVIDADE_ESCOPO.test(t) ||
    RX_PASSIVA_SINTETICA.test(t) || RX_ORIGEM_DECLARADA.test(t) ||
    RX_DURACAO_VIDA.test(t) || RX_REEMBOLSO.test(t) || RX_CADENCIA_OPERACIONAL.test(t) ||
    RX_IDIOMA_ADIANTADO.test(t) || RX_ZERO_DEFEITO.test(t) || RX_CONVENIENCIA_TRANSACIONAL.test(t);
}
function temVetoComercialDuroCP01(t: string): boolean {
  if (RX_INTERROGATIVA.test(t) && hipoteseCondicionalMarcada(t)) {
    const tS = textoSemRotuloCP01(t);
    if (tS !== t && temVetoComercialDuroCP01Base(tS)) return true;
    return false;
  }
  if (temVetoComercialDuroCP01Base(t)) return true;
  const tL = textoSemRotuloPontuacaoCP01(t);
  if (tL !== t && temVetoComercialDuroCP01Base(tL)) return true;
  return false;
}

/** Artefato domina a sentença (rótulo de produção, quadro, formato/técnica,
 *  instrução de direção)? */
function artefatoDominanteCP01(t: string): boolean {
  const stems = stemsSignificativos(t).filter((x) => !stemEhGenericoAberta(x));
  const q = stemsDoQuadro(stems);
  const quadroTotal = stems.length > 0 && q > 0 && q === stems.length;
  return quadroTotal || sentencaEhStoryboard(t) || RX_ROTULO_METADADO.test(t) ||
    RX_TERMO_ARTEFATO_EXT.test(t) || RX_QUANT_MIDIA_PRODUCAO.test(t) ||
    RX_CANONE_CINE_LEAD.test(t) || RX_INSTRUCAO_DIRECAO.test(t) || quantMedeApenasArtefato(t);
}
/** CP-01 XR-OB: o sinal reside APENAS no artefato e não há veto duro? */
const RX_PIN_PRODUCAO_NARRATIVA = /^\s{0,24}(?:sketch|storytelling|personagem|personagens|cena|gancho|hook|tutorial|roteiro|v[ií]deo|reel\w*|anúncio|copy)\b\s*(?::|(?:do|da|de|com|em)\b)/i;
/** CP-01 OB-C12: rótulo-canônico de DIREÇÃO CRIATIVA — parâmetros de cena/
 *  mídia sem conteúdo de mercado ("Paleta:", "Take 2:", "Voz off:"). */
/** CP-01 OB-C12: a sentença vive no cânone diegético/direção (pin
 *  narrativo, rótulo-canônico, mídia, instrução de direção, quadro-cine,
 *  storyboard)? */
function sentencaEmCanoneDiegeticoCP01(t: string): boolean {
  return RX_PIN_PRODUCAO_NARRATIVA.test(t) || RX_QUANT_MIDIA_PRODUCAO.test(t) ||
    RX_INSTRUCAO_DIRECAO.test(t) || RX_ROTULO_CANONICO_DIRECAO.test(t) ||
    sentencaEhStoryboard(t) || RX_CANONE_CINE_LEAD.test(t);
}

const RX_ROTULO_CANONICO_DIRECAO = /^\s{0,24}(?:prompt\s+de\s+(?:imagem|foto|arte|ia)|met[áa]fora|p[úu]blico(?:\s+alvo)?|legenda|paleta(?:\s+de\s+treino)?|cena\s*\d*|take\s*\d*|voz\s+off|plano(?:[- ]detalhe)?|gancho\s*\d+(?:\s*[-–]\s*\d+s?)?|m[úu]sica|trilha(?:\s+sonora)?|som|fx)\s*:/i;
/** CP-01 OB-C4: NÚCLEO INSTITUCIONAL — selo/certificação/garantia/homologação
 *  continua hard mesmo dentro de pin de produção (diegese não rebaixa
 *  credencial regulamentar). */
const RX_NUCLEO_INSTITUCIONAL =
  /\b(?:selo\w*|badge\w*|certificad\w*|certifica[çc][aãã]o|garantia\w*|homologa\w*|patente\w*|iso\b|anvisa\b|inmetro\b|fda\b|laudo\w*|licen[çc]\w*|autoriza[çc][aãã]o)\b/i;
/** CP-01 OB-C4: veto "duro-hard" — único tier capaz de vencer o cânone de
 *  produção em linguagem rotulada/pinada de direção. Sombras idiomáticas de
 *  direção ("antes de", "até o meio") e escopo sobre elementos da cena
 *  ("qualquer imagem") ficam FORA — continuam sendo capturados fora do
 *  cânone, onde não há pin/rótulo/quadro de produção. */
function temVetoDuroHardCP01Base(t: string): boolean {
  return (RX_QUANTIFICACAO_MATERIAL.test(t) && !quantMedeApenasArtefato(t)) || RX_POSSE_COMERCIAL.test(t) ||
    RX_IDIOMA_PRAZO.test(t) || gentilicoComOrigem(t) || RX_PROPORCAO_SOCIAL.test(t) || RX_PROPORCAO_SOCIAL2.test(t) ||
    RX_MAIS_DE_NUMERICO.test(t) || RX_COMPARATIVO_MATERIAL.test(t) ||
    RX_REEMBOLSO.test(t) || RX_IDIOMA_FRETE_PRAZO.test(t) ||
    RX_CREDENCIAL_MERITORIA.test(t) || RX_SUPERLATIVO_COMERCIAL.test(t) ||
    RX_SUPERLATIVO_ESCOPO_COMERCIAL.test(t) || RX_NAO_EXIGENCIA.test(t) ||
    RX_DISPONIBILIDADE_PERMANENTE.test(t) || RX_HISTORICO_INCIDENTE.test(t) ||
    RX_ZERO_DEFEITO.test(t) || RX_ORIGEM_DECLARADA.test(t) ||
    RX_FEITO_MANUFATURA.test(t) || RX_EXCLUSIVIDADE_ESCOPO.test(t) ||
    RX_DURACAO_VIDA.test(t) || RX_IDIOMA_CONFIABILIDADE.test(t) ||
    RX_CARGA_FISICA.test(t) || RX_IDIOMA_FISICA.test(t) ||
    RX_IDIOMA_DESEMPENHO.test(t) || RX_TAXA_DESEMPENHO.test(t) ||
    RX_AUTONOMIA_IDIOM.test(t) || RX_IDIOMA_COBERTURA.test(t) ||
    RX_IDIOMA_CONDICAO_OPERACIONAL.test(t) || RX_LOGISTICA_AMANHA.test(t) ||
    (RX_CADENCIA_OPERACIONAL.test(t) && RX_SUJEITO_OP_CAD.test(t)) ||
    RX_ESCOPO_TERRITORIAL.test(t) ||
    RX_AGENDA_LIVRE.test(t) || RX_CONVENIENCIA_TRANSACIONAL.test(t) ||
    RX_CONVENIENCIA_VOCATIVA.test(t) || RX_IDIOMA_INSTSIGLA.test(t) ||
    RX_IDIOMA_PRECISAO.test(t);
}
function temVetoDuroHardCP01(t: string): boolean {
  // pontuação interrogativa não emancipa materialidade — exceto pergunta
  // hipotético-condicional marcada (classe safe documentada CP-09/P1).
  if (RX_INTERROGATIVA.test(t) && hipoteseCondicionalMarcada(t)) return false;
  if (temVetoDuroHardCP01Base(t)) return true;
  const tP = t.replace(/[?¿!¡]+\s*$/, ".");
  if (tP !== t && temVetoDuroHardCP01Base(tP)) return true;
  return false;
}

/** CP-01 OB-C4: frase GUIADA por termo de cinema/produção (CINE-led) sem
 *  pin nem rótulo — "Montagem em ritmo lento...", "A música entra...".
 *  O cânone CP-08 se estende à forma livre de direção quando não há dígito,
 *  núcleo institucional ou veto duro-hard. */
const RX_CANONE_CINE_LEAD =
  /^\s{0,24}(?:met[áa]fora\b|ritmo\s+(?:lento|acelerad\w*|cadenciad\w*)\b|(?:a\s+|o\s+|uma\s+|um\s+)?(?:m[úu]sica|corte\b|montagem\b|trilha(?:\s+sonora)?|[áa]udio\s+ambiente|pacing|desfoque|bokeh|filtro(?:\s+de\s+cor)?|take\b))/i;

/** CP-01 OB-C7: tier SOBRA-RESISTENTE — o veto duro inteiro EXCETO as três
 *  sombras de direção que o cânone diegético qualifica: escopo exaustivo
 *  sobre elementos da cena ("qualquer imagem"), cadência de edição
 *  ("montagem em ritmo lento") e núcleo econômico-fraco sem dígito
 *  ("pedindo desconto" num sketch — coberto separadamente pelos gates de
 *  institucional e de dígito+núcleo no sinal). Todo o resto — superlativo
 *  de escopo, conveniência, território, credencial, desempenho, idiomas —
 *  continua veto MESMO sob pin/rótulo de produção. */
/** CP-01 OB-C11: RECONHECIMENTO-BASE — a forma desrotulada/afirmativa é
 *  claim reconhecível SEM porto-seguro e sem cânone? Usado pelas concessões
 *  de metadado/pin/safe-harbor: se a forma nua é reconhecível, a etiqueta
 *  NÃO emancipa (P1/P2/H). Não consulta SH nem det (evita recursão): replica
 *  as classes de reconhecimento diretas. */
/** CP-01 OB-C11b: credencial-testemunho de especialista nomeado ("derma-
 *  tologistas aprovam") — mid-tier reconhecível sem porto-seguro. */
const RX_CREDENCIAL_TESTEMUNHO =
  /\b(?:dermatolog\w*|oftalmolog\w*|dentist\w*|farmac[eê]utic\w*|m[eé]dic\w*|especialist\w*|engenheir\w*|contador\w*|nutricionist\w*|veterin[áa]ri\w*)\w*\s+(?:aprov\w+|recomend\w+|endoss\w+|atest\w+|prescrev\w+|indic\w+)|\baprov\w+\s+por\s+\d{1,3}\s+em\s+cada\s+\d{1,3}\b/i;
let cp01BaseInterno = 0;
/** CP-01 CA-F05: sinal de material por QUALQUER canal de
 *  reconhecimento — eco de detector, veto-duro na forma nua e stems
 *  comparativos/fabricación/reputação avaliados após rótulo-strip. */
/** CP-01 CA-F05 emanc/Marc: rótulo/pin emancipa só quando (a) não há sinal
 *  de canal material na forma nua OU (b) a linha é trabalho-interno
 *  declarado (estatuto I9 — "SUGESTAO: testar desconto de 10%"). */
function emancipacaoRotuloResisteCP01(t: string): boolean {
  if (!temSinalMaterialCanalCP01(textoSemRotuloCP01(t))) return true;
  return sentencaEhTrabalhoInternoDeclarado(t);
}

function temSinalMaterialCanalCP01(t: string): boolean {
  const u = textoSemRotuloCP01(t);
  if (sinalAssercaoMaterialBaseCP01(u)) return true;
  if (/\b(?:prazo|servi[çc]o|entrega|suporte|atendimento|log[íi]stica)\s+mais\s+r[áa]pid\w*|\bmais\s+(?:r[áa]pid\w*|barat\w*|eficiente\w*|potente\w*|dur[áa]el\w*|dur[áa]vel\w*|complet\w*)\s+(?:do\s+que|que|da\s+regi[ãa]o|do\s+mercado)/i.test(u)) return true;
  if (/\b(?:fabricamos|produzimos|importamos|revendemos|montamos|fornecemos|exportamos)\s+\S/i.test(u)) return true;
  if (/\b(?:a\s+gente|n[óo]s(?:s\w*a\s+(?:empresa|equipe))?|eu)\s+garant[ei]m?\s/i.test(u)) return true; // CP-01 CA-F04
  if (/\b(?:somos|somos\s+(?:considerad\w+|vistos\s+como)|estamos|visto\s+como)\s+(?:a\s+)?(?:refer[êe]ncia|l[íi]der(?:an[çc]a)?)/i.test(u)) return true; // CP-01 CA-F12b
  if (/\b(?:somos|[ée]s?|atendemos|servimos)\s+(?:a\s+)?(?:escolha|refer[êe]ncia|l[íi]der(?:an[çc]a)?|primeira\s+escolha|n[úu]mero\s+um|marca\s+l[íi]der)/i.test(u)) return true;
  if (RX_AUTODESIGNACAO_TOL.test(u)) return true; // CP-01 CA-F01
  if (nucleoHardNaoNegado(u) && (RX_POSSE_COMERCIAL.test(u) || RX_ENTIDADE_COMERCIAL.test(u))) return true;
  for (const cat of CATEGORIAS_GUARD) {
    const d = new RegExp(cat.detector.source, cat.detector.flags.includes("g") ? cat.detector.flags : cat.detector.flags + "g");
    if (d.test(t) || (u !== t && d.test(u))) return true;
  }
  return false;
}

function sinalAssercaoMaterialBaseCP01(u: string): boolean {
  if (!u) return false;
  // RECONHECIMENTO-BASE ≡ o próprio detector de reconhecimento aberto, na
  // forma nua (sem etiqueta/comentário/pontuação): SH/cânone/trabalho-
  // interno já moram dentro dele, avaliados sobre u; obediência ao cânone
  // criativo é medida pelo CHAMADOR (escape diegético). Guarda de
  // profundidade: a trilha det→SH→base pode recair aqui — nesse caso
  // responde-se "não-reconhecido" e o gate externo decide (nunca silêncio).
  if (cp01BaseInterno > 0) return false;
  cp01BaseInterno++;
  try {
    // reconhecimento-tier na forma nua: mid-tier sombra-resistente,
    // credencial-testemunho e escopo exaustivo (rótulo estrutural IN-pt —
    // pins canônicos são desviados no chamador antes desta consulta).
    if (temVetoDuroSombraResistenteCP01(u)) return true;
    if (RX_CREDENCIAL_TESTEMUNHO.test(u)) return true;
    if (RX_ESCOPO_EXAUSTIVO.test(u)) {
      // CP-01 OB-C18: "qualquer <núcleo-de-artefato>" não é escopo de
      // mercado ("antes de qualquer imagem", "qualquer corte fica bom").
      // "qualquer a cidade/pedido/preço" continua material.
      const q = /\bqualquer\b\s+(?:[oa]s?\s+)?([\wÀ-ÿ]+)/i.exec(u);
      if (!q ||
          !/^(?:imagem|imagens|corte\w*|cena\w*|take\w*|frame\w*|arte\b|artes\b|filme\w*|v[íi]deo\w*|cor|cores|tom|tons|clima\w*|sombra\w*|sil[êe]ncio|trilha\w*|m[úu]sica\w*|texto\w*|copy|roteiro\w*|storyboard|layout\w*|design\w*|ilustra\w*|foto\w*|som|sons|estilo\w*|paleta\w*|efeito\w*|ângulo|enquadramento|lente\w*)s?$/i.test(q[1])) return true;
    }
    return false;
  } finally {
    cp01BaseInterno--;
  }
}

function temVetoDuroSombraResistenteCP01Base(t: string): boolean {
  return RX_POSSE_COMERCIAL.test(t) ||
    gentilicoComOrigem(t) || RX_FEITO_MANUFATURA.test(t) ||
    RX_PROPORCAO_SOCIAL.test(t) || RX_PROPORCAO_SOCIAL2.test(t) || RX_MAIS_DE_NUMERICO.test(t) ||
    RX_COMPARATIVO_MATERIAL.test(t) || RX_IDIOMA_FRETE_PRAZO.test(t) ||
    RX_IDIOMA_CONFIABILIDADE.test(t) || RX_CARGA_FISICA.test(t) ||
    RX_IDIOMA_CONTA.test(t) || RX_IDIOMA_FECHO.test(t) || RX_IDIOMA_VOZ.test(t) ||
    RX_ABUNDANCIA_NEG.test(t) || RX_IDIOMA_PORTA.test(t) || RX_IDIOMA_FISICA.test(t) ||
    RX_IDIOMA_ADIANTADO.test(t) ||
    RX_IDIOMA_INSTSIGLA.test(t) || RX_IDIOMA_PRECISAO.test(t) || RX_BOLSO_DIMENSAO.test(t) || RX_IDIOMA_DESEMPENHO.test(t) ||
    RX_TAXA_DESEMPENHO.test(t) || RX_TEMPO_ACAO_DESCRITOR.test(t) || RX_TEMPO_EFEITO.test(t) || RX_FAIXA_NUM_EXTENSO.test(t) || RX_A_PARTIR_DE_PRECO.test(t) || RX_COLOQUIAL_PRAZO.test(t) || RX_PASSIVA_MAT.test(t) || RX_DIRECAO_CITADA_MAT.test(t) || RX_DISPONIBILIDADE_FATO.test(t) ||
    RX_AUTONOMIA_IDIOM.test(t) || RX_IDIOMA_COBERTURA.test(t) ||
    RX_IDIOMA_CONDICAO_OPERACIONAL.test(t) || RX_LOGISTICA_AMANHA.test(t) ||
    RX_ESCOPO_TERRITORIAL.test(t) || RX_SUPERLATIVO_COMERCIAL.test(t) ||
    RX_SUPERLATIVO_ESCOPO_COMERCIAL.test(t) || RX_NAO_EXIGENCIA.test(t) ||
    RX_DISPONIBILIDADE_PERMANENTE.test(t) || RX_HISTORICO_INCIDENTE.test(t) ||
    RX_CONVENIENCIA_VOCATIVA.test(t) || RX_AGENDA_LIVRE.test(t) ||
    RX_CREDENCIAL_MERITORIA.test(t) || RX_EXCLUSIVIDADE_ESCOPO.test(t) ||
    RX_PASSIVA_SINTETICA.test(t) || RX_ORIGEM_DECLARADA.test(t) || RX_DURACAO_VIDA.test(t) ||
    RX_REEMBOLSO.test(t) || RX_ZERO_DEFEITO.test(t) || RX_CONVENIENCIA_TRANSACIONAL.test(t) ||
    RX_IDIOMA_PRAZO.test(t) || RX_IDIOMA_PRAZO_COLOQUIAL.test(t);
}
function temVetoDuroSombraResistenteCP01(t: string): boolean {
  if (RX_INTERROGATIVA.test(t) && hipoteseCondicionalMarcada(t)) {
    const tS = textoSemRotuloCP01(t);
    if (tS !== t && temVetoDuroSombraResistenteCP01Base(tS)) return true;
    return false;
  }
  if (temVetoDuroSombraResistenteCP01Base(t)) return true;
  const tL = textoSemRotuloPontuacaoCP01(t);
  if (tL !== t && temVetoDuroSombraResistenteCP01Base(tL)) return true;
  return false;
}

/** CP-01 OB-C4: o sinal reside APENAS no artefato e não há veto que o cânone
 *  não qualifique. Ordem: (1) duro-hard absoluto; (2) institucional-diegético
 *  e núcleo+dígito; (3) sem veto algum → cânone; (4) cânone diegético real
 *  (pin/cine/direção/quadro/mídia — rótulo estrutural SOZINHO não basta) e
 *  aí só as sombras de direção morrem; o mid-tier inteiro veta. */
function sinalDeApenasArtefatoCP01(t: string): boolean {
  if (!artefatoDominanteCP01(t)) return false;
  if (temVetoDuroHardCP01(t)) return false;
  if (RX_NUCLEO_INSTITUCIONAL.test(t) && !/\bn[aãã]o\b|\bnada\s+de\b|\bsem\b/i.test(t)) return false;
  if (/\d/.test(t) && nucleoHardNaoNegado(t)) return false;
  const canonDiegese = sentencaEmCanoneDiegeticoCP01(t);
  if (!temVetoComercialDuroCP01(t)) {
    // OB-C11: sem veto algum, rótulo ESTRUTURAL (não-diegético) ainda assim
    // não emancipa claim que a forma nua reconhece — cânone diegético/
    // direção escapa porque nele o reconhecimento é medido com os pins.
    const u = textoSemRotuloPontuacaoCP01(t);
    if (u !== t && temSinalMaterialCanalCP01(u)) return false; // CP-01 CA-F05b
    return true;
  }
  if (!canonDiegese) return false;
  // CP-01 OB-C17: mesmo no cânone, se a forma nua diz claim material
  // (escopo exaustivo, cadência-serviço, credencial, precisão), a linha
  // NÃO é só artefato — cânone diegético não compra asserção comercial.
  if (temSinalMaterialCanalCP01(t)) return false; // CP-01 CA-F05
  return !temVetoDuroSombraResistenteCP01(t);
}
/** Pergunta hipotético-condicional MARCADA: marcador "se/e se/caso" ou
 *  modo subjuntivo/condicional explícito — enuncia possibilidade, não fato. */
function hipoteseCondicionalMarcada(t: string): boolean {
  if (!/[?¿]/.test(t)) return false;
  return /(?<!-)\bse\b(?!\s*[,;])|\b caso\b|\be\s+se\b|[\wÀ-ÿ]{3,}(?:sse|ssem)\b|\b(?!(?:di[áa]ria?s?|prim[áa]ria?s?|secund[áa]ria?s?|necess[áa]ria?s?|contr[áa]ria?s?|funcion[áa]ria?s?|sal[áa]io?s?|sal[áa]rio?s?|dicion[áa]rio?s?|hist[óo]ria?s?|mem[óo]ria?s?|lend[áa]ria?s?|extraordin[áa]ria?s?|honor[áa]ria?s?|tempor[áa]ria?s?|anivers[áa]ria?s?|ordin[áa]ria?s?|arbitr[áa]ria?s?|emiss[áa]ria?s?|semin[áa]rio?s?|aqu[áa]rio?s?|avi[áa]rio?s?|propriet[áa]ria?s?|unit[áa]ria?s?|vetor[áa]ria?s?|summary\w*|superf[íi]cie\w*|maci[áa]ria?s?|plen[áa]ria?s?|sol[íi]ci?ta?ria?s?|regul[áa]ria?s?|manej[áa]ria?s?|folhet[áa]ria?s?)\b)[\wÀ-ÿ]{3,}(?:ria|rias|riam|riamos)\b/i.test(t);
}

function sinalAssercaoPotencialIndeterminada(
  t: string,
  stems: readonly string[],
  verboFactual: boolean
): boolean {
  // CP-01: stems vazios NÃO silenciam idioma material-fechado auto-suficiente
  // ("Garante-se o resultado." tem os dois stems no banco genérico e AINDA
  // é claim) — mas as supressões por forma (CTA/símile/cânone) valem antes.
  if (stems.length === 0 && !temSinalIdiomaticoR6(t)) return false;
  // supressões por forma (documentadas no bloco R6)
  // CTA imperativo suprime SÓ quando não há idioma material auto-suficiente —
  // "Clique e receba em um dia útil." começa em CTA mas afirma prazo.
  if (RX_CTA_IMPERATIVO.test(t) && !temSinalIdiomaticoR6(t)) return false;
  // símile explícito ("como um jardim", "parece"): figura de estilo do
  // cânone CP-08 (metáfora), nunca com veto duro presente
  if (/\bcomo\s+(?:um|uma|uns|umas|o|a|os|as)\s+[\wÀ-ÿ]{3,}\b|\bparecem?\s/i.test(t) &&
      !nucleoHardNaoNegado(t) && !conteudoAssertivoEmbutido(t) && !gentilicoComOrigem(t)) return false;
  // CP-01 XR-OB (P10): sinais FRACOS que moram no artefato (parâmetros de
  // produção CP-08) não são claim — o cânone precede o gate aberto, SEM
  // túnel: veto comercial duro continua intocado (P11).
  if (sinalDeApenasArtefatoCP01(t)) return false;
  if (temCopulaVerdadeira(t) && !verboFAssertivo(t) &&
      !RX_COPULA_AUX_PASSIVA.test(t) &&
      !RX_SATELITE_AVALIATIVO.test(t) && !temSinalIdiomaticoR6(t) &&
      !RX_ESCOPO_EXAUSTIVO.test(t)) return false;      // cópula sozinha = cola metafórica/nominal
  //   (não suprime quando há idioma material auto-suficiente — "Peça e
  //    retire hoje mesmo": a conjunção "e" é falso-positivo de cópula
  //    local, mas "hoje mesmo" é prazo coloquial factual)
  const quadro = stemsDoQuadro(stems);
  if (quadro > 0 && quadro === stems.length && !RX_SATELITE_AVALIATIVO.test(t) &&
      !RX_QUANTIFICACAO_MATERIAL.test(t) && !RX_IDIOMA_PRAZO.test(t)) return false; // só quadro/produção
  // pergunta hipotético-condicional MARCADA ("o que mudaria se durasse…?")
  // enuncia possibilidade, não fato — CP-09: pergunta de dúvida é safe class.
  if (RX_INTERROGATIVA.test(t) && hipoteseCondicionalMarcada(t)) return false;
  // idiomas materiais auto-suficientes (a forma material é o próprio sinal)
  if (temSinalIdiomaticoR6(t)) return true;
  if (RX_DA_PRA.test(t)) return true;
  if (RX_FACILIDADE_INFINITIVO.test(t)) return true;
  // S1 · verbo factual assertivo com conteúdo próprio (cópula sozinha não conta)
  if (verboFAssertivo(t)) return true;
  if (RX_COMPARATIVO_MATERIAL.test(t)) return true;
  // S2 · particípio passado agenciado — sujeito passivo explícito (auxiliar
  // copular imediato) OU particípio solto com conteúdo, exceto quando a
  // cópula presente é cola metafórica distante do particípio.
  if (temParticipioAgenciado(t)) {
    if (RX_COPULA_AUX_PASSIVA.test(t)) return true;
    if (!verboFAssertivo(t) && temCopulaVerdadeira(t)) return false;
    if (stems.length >= 2 || RX_PARTICIPIO_COMPLEMENTO.test(t)) return true;
  }
  // S3 · headline nominal material-plausível
  if (RX_SATELITE_AVALIATIVO.test(t) || (stems.length >= 2 && RX_ESCOPO_EXAUSTIVO.test(t))) return true;
  return false;
}

/** R6 (CP-09 RC-3): unidade do Nível A NÃO-FACTUAL não emite autoridade
 *  factual presente — condição, hipótese, intenção, futuro, análise,
 *  dependência, expectativa, processo em curso ("em estudo", "dependendo",
 *  "em avaliação", "previsto", "sujeito a", "aguardando"). Hipótese só
 *  autoriza hipótese (o mesmo estatuto), nunca o fato afirmado. */
const RX_SUPORTE_NAO_FATUAL =
  /\bse\b|\bcaso\b|\bquando\s+(?:for|estiver|tiver)|\bfutur\w*\b|\bplaneja\w*\b|\bpretende\w*\b|\bvamos\s+ter\b|\bteremos\b|\bseria\w*\b|\bhipoteticamente\b|\bem\s+estudo\b|\bem\s+an[áa]lise\b|\bem\s+avalia[çc][ãa]o\b|\bsend[oa]?\s+avaliad[oa]\b|\bdependend\w*|\baguardand\w*\b|\bsujeit[oa]s?\s+a\b|\bexpectativ\w*\b|\binten[çc][ãa]o\b|\bconsiderad[oa]\w*\b|\bprevist[oa]\w*\b|\bem\s+fase\s+(?:de|inicial|final)\b|\bem\s+processo\s+de\b|\bem\s+curso\b|\bhipotetic\w*|\bhip[óo]tese\b|\bsimulad\w*|\bteste\s+preliminar\b|\bpor\s+enquanto\b|\bpor\s+agora\b|\bsob\s+avalia[cç][ãa]o\b|\bainda\s+(?:sendo|est[áa]\s+sendo)\b|\bsendo\s+(?:avaliado|estudado|testado)\b/i;

/** Números e numerais extensos presentes no texto (guarda de EXATIDÃO
 *  numérica da autorização: "500 ml" não autoriza "700 ml"; faixa "8 a 10"
 *  cobre seus extremos; número ausente no suporte não cobre número algum). */
function tokensNumericos(texto: string): ReadonlySet<string> {
  const out = new Set<string>();
  for (const m of texto.matchAll(/\d{1,5}/g)) out.add(m[0]);
  const norm = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  for (const m of norm.matchAll(/\b(?:um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|quatorze|quinze|dezesseis|dezessete|dezoito|dezenove|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem|cento|mil|milhao|milhoes)\b/g)) out.add(m[0]);
  return out;
}


/** CP-01: tokens numéricos NORMALIZADOS por valor — extenso e dígito
 *  equivalentes (noventa ≡ 90), para a guarda de exatidão. */
function tokensNumericosValor(texto: string): ReadonlySet<string> {
  const out = new Set<string>();
  for (const m of texto.matchAll(/\d{1,5}/g)) out.add(String(parseInt(m[0], 10)));
  const norm = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  for (const m of norm.matchAll(/\b(?:um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|quatorze|quinze|dezesseis|dezessete|dezoito|dezenove|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem|cento|mil|milhao|milhoes)\b/g)) {
    const v = VALOR_NUM_EXTENSO[m[0].replace("ao", "")] ?? (m[0] === "milhao" || m[0] === "milhoes" ? 1000000 : undefined);
    if (v !== undefined) out.add(String(v));
  }
  return out;
}
/** Autorização aberta: stems materiais em comum com UNIDADE NÃO-NEGADA,
 *  FACTUAL e não-rotulada do Nível A (não por label, não por tema genérico).
 *  R6: thresholds proporcionais ao tamanho do claim (1 stem → 1 compartilhado;
 *  2 → 2; 3+ → 3) + guarda de exatidão numérica (subset). */
/** XR-5 · o suporte declara FAIXA numérica ("8 a 10", "oito a dez", "40 a
 *  60 minutos")?  Só numerais dos dois lados — "vai a campo" não conta. */
const RX_NUM_EXTENSO =
  "\\d+|\\b(?:um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|quatorze|quinze|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem)\\b";
function suporteTemFaixa(janela: string): boolean {
  const rx = new RegExp("(?:" + RX_NUM_EXTENSO + ")\\s+a\\s+(?:" + RX_NUM_EXTENSO + ")", "i");
  return rx.test(janela);
}
/** XR-5 · o próprio claim enuncia faixa ("8 a 10") ou teto ("até 90")? */
/** CP-01: o suporte declara TETO ("até 90 dias")? P7: teto ≠ exato
 *  ("Entrega em noventa dias" excede "entrega em até noventa dias"). */
/** CP-01: o claim vem com a forma de teto explícita ("até 90", "no máximo
 *  30", "em até 7 dias") — não o valor como exato absoluto. */
function temFormaTetoCanonica(sentenca: string): boolean {
  return /\bat[ée]\s+(?:\d|um\b|uma\b|dois\b|duas\b|tr[eê]s\b|quatro\b|cinco\b|seis\b|sete\b|oito\b|nove\b|dez\b|vinte\b|trinta\b|noventa\b|cem\b|mil\b)/i.test(sentenca) ||
         /\b(?:no\s+m[áa]ximo|de\s+at[ée])\s+(?:\d|[\wÀ-ÿ])/i.test(sentenca);
}

/** CP-01: valor numérico do teto declarado (dígito ou extenso) — null quando
 *  não há teto canônico na sentença. */
function tetoValor(sentenca: string): number | null {
  const m = sentenca.match(/\bat[ée]\s+(\d{1,9}|um\b|uma\b|dois\b|duas\b|tr[eê]s\b|quatro\b|cinco\b|seis\b|sete\b|oito\b|nove\b|dez\b|onze\b|doze\b|treze\b|quatorze\b|quinze\b|dezesseis\b|dezessete\b|dezoito\b|dezenove\b|vinte\b|trinta\b|quarenta\b|cinquenta\b|sessenta\b|setenta\b|oitenta\b|noventa\b|cem\b|cento\b|duzentos\b|trezentos\b|mil\b|milhao\b|milhoes\b)/i);
  if (!m) return null;
  const t = m[1].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  const v = valorNumerico(t) ?? (numeralExtensoParaValor(t) != null ? parseInt(numeralExtensoParaValor(t)!, 10) : null);
  return v ?? null;
}

function suporteTemTeto(janela: string): boolean {
  return /\bat[ée]\s+(?:\d+|um\b|uma\b|dois\b|duas\b|tr[eê]s\b|quatro\b|cinco\b|seis\b|sete\b|oito\b|nove\b|dez\b|onze\b|doze\b|treze\b|quatorze\b|quinze\b|vinte\b|trinta\b|quarenta\b|cinquenta\b|sessenta\b|setenta\b|oitenta\b|noventa\b|cem\b|cento\b|mil\b)/i.test(janela);
}

function temFormaFaixaOuTeto(sentenca: string): boolean {
  // CP-01: faixa explícita ("8 a 10", "entre oito e dez", "de 40 a 60") ou
  // teto explícito ("até 90 dias", "até 30", "no máximo 5") — a FORMA conta.
  if (/\bbetween\b/i.test(sentenca)) return true;
  if (/\bentre\s+(?:\d{1,9}|\w+)\s+e\s+(?:\d{1,9}|\w+)/i.test(sentenca)) return true;
  if (/\bat[ée]\s+(?:\d{1,9}|um\b|uma\b|dois\b|duas\b|tr[eê]s\b|quatro\b|cinco\b|seis\b|sete\b|oito\b|nove\b|dez\b|onze\b|doze\b|treze\b|quatorze\b|quinze\b|dezesseis\b|dezessete\b|dezoito\b|dezenove\b|vinte\b|trinta\b|quarenta\b|cinquenta\b|sessenta\b|setenta\b|oitenta\b|noventa\b|cem\b|cento\b|mil\b)/i.test(sentenca)) return true;
  if (/\b(?:no\s+m[áa]ximo|de\s+at[ée]|até\s+o\s+máximo\s+de)\s+\S+/i.test(sentenca)) return true;
  const rx = new RegExp("(?:" + RX_NUM_EXTENSO + ")\\s+a\\s+(?:" + RX_NUM_EXTENSO + ")", "i");
  return rx.test(sentenca);
}

/** CP-01: faixas numéricas normalizadas para valor (dígito OU numeral
 *  extenso): "entre oito e dez" ≡ "8 a 10" ≡ "40 a 60 minutos"→[40,60]. */
const VALOR_NUM_EXTENSO: Record<string, number> = {
  um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6,
  sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, treze: 13,
  quatorze: 14, catorze: 14, quinze: 15, dezesseis: 16, dezessete: 17,
  dezoito: 18, dezenove: 19, vinte: 20, trinta: 30, quarenta: 40,
  cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90,
  cem: 100, cento: 100, mil: 1000,
};
function valorNumerico(token: string): number | null {
  if (/^\d{1,5}$/.test(token)) return parseInt(token, 10);
  return VALOR_NUM_EXTENSO[token.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()] ?? null;
}
function faixasNormalizadas(t: string): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const rx = new RegExp("(?:(" + RX_NUM_EXTENSO + "))\\s+a\\s+(?:(" + RX_NUM_EXTENSO + "))", "gi");
  for (const m of t.matchAll(rx)) {
    const a = valorNumerico(String(m[1])), b = valorNumerico(String(m[2]));
    if (a != null && b != null) out.push([Math.min(a, b), Math.max(a, b)]);
  }
  const rxEntre = new RegExp("\\bentre\\s+(?:(" + RX_NUM_EXTENSO + "))\\s+e\\s+(?:(" + RX_NUM_EXTENSO + "))", "gi");
  for (const m of t.matchAll(rxEntre)) {
    const a = valorNumerico(String(m[1])), b = valorNumerico(String(m[2]));
    if (a != null && b != null && !out.some((x) => x[0] === Math.min(a, b) && x[1] === Math.max(a, b))) out.push([Math.min(a, b), Math.max(a, b)]);
  }
  return out;
}

/** CP-01 XR-5bis: o claim ecoa a faixa/teto do suporte MAS inclui
 *  também um predicado ABSOLUTO / de CERTEZA sobre um dos valores? */
function sentencaTemPromocaoSobreFaixa(sentenca: string, janela: string): boolean {
  const RX_PROMOV = /\bsempre\b|\bgarantid\w*\b|\bna\s+pr[áa]tica\b|\bcom\s+certeza\b|\bsem\s+falha\b|\btodas?\s+(?:as\s+)?|cada\s+(?:u(?:ma|ns)\s+)?|\bresultado\s+garantid\w*\b/i;
  const fJ = faixasNormalizadas(janela);
  const temTetoJ = suporteTemTeto(janela);
  if (fJ.length === 0 && !temTetoJ) return false;
  if (!RX_PROMOV.test(sentenca)) return false;
  // extremos do suporte citados no claim fora de contexto de faixa explícita?
  const normS = sentenca.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const semFaixa = normS
    .replace(/\bentre\s+\S+\s+e\s+\S+/g, " ")
    .replace(/\b(?:de\s+)?\S+\s+a\s+\S+/g, " ");
  const valores = new Set<string>();
  for (const [u, v] of fJ) { valores.add(String(u)); valores.add(String(v)); }
  if (temTetoJ) for (const t of tokensNumericosValor(janela)) valores.add(t);
  for (const m of semFaixa.matchAll(/[\wÀ-ÿ]+/g)) {
    const tv = String(valorNumerico(m[0]) ?? (numeralExtensoParaValor(m[0]) ?? ""));
    if (tv !== "" && valores.has(tv)) return true;
  }
  return false;
}

function autorizacaoAberta(sentenca: string, textoAutoritativo: string): boolean {
  const target = new Set(stemsSignificativosComValor(sentenca).filter((s) => !stemEhGenericoAberta(s)));
  if (target.size === 0) return false;
  const numsClaim = tokensNumericos(sentenca);
  let numsSup: ReadonlySet<string> = new Set<string>();
  let cursor = 0;
  for (const fr of sentencasDe(textoAutoritativo)) {
    const ini = textoAutoritativo.indexOf(fr, cursor);
    cursor = ini + fr.length;
    const t = fr.trim();
    if (!t) continue;
    if (sentencaNegada(textoAutoritativo, ini) || sentencaMetalinguistica(t)) continue;
    if (RX_SUPORTE_NAO_FATUAL.test(t)) continue; // R6 RC-3: hipótese não autoriza fato
    // R6: autoridade é por UNIDADE ALINHADA (janela governante), não pela
    // frase-mega do briefing — "500 ml" do item embalagem não pode contar
    // como suporte numérico para "60 dias" do item duração.
    const janela = suporteJanelaGovernante(t, target);
    const base = new Set(stemsSignificativosComValor(janela).filter((s) => !stemEhGenericoAberta(s)));
    if (!base.size) continue;
    let shared = 0;
    // R5: comparação por RAIZ (plural/flexão) — a unidade não-negada do
    // Nível A cobre a MESMA noção ("rápida" ≡ "rápidas"); igualdade exata
    // de string é enumerativa e deixa autoridade legítima de fora.
    for (const s of target) {
      for (const b of base) if (stemMatch(s, b)) { shared += 1; break; }
    }
    if (shared < Math.min(3, target.size)) {
      // CP-01: ECO de faixa autorizada — flexão/modal da MESMA faixa numérica,
      // sem número novo, com ≥1 palavra-conteúdo alinhada ("pode render
      // aproximadamente 8 a 10" ≡ "rende aproximadamente 8 a 10"; P7: faixa
      // continua faixa, nada foi elevado a extremo/absoluto).
      if (shared === 0) continue;
      if (!suporteTemFaixa(janela) && !suporteTemTeto(janela)) continue;
      if (!temFormaFaixaOuTeto(sentenca)) continue;
      // CP-01 RC-2: eco só vale sobre suporte FACTUAL percebido — modal/
      // condicional/hedge na janela não autoriza a forma direta.
      if (estatutoEpistemico(janela) < 3) continue;
      if (RX_MODAL_HABILITADOR.test(janela) || RX_MODAL_FRACO.test(janela)) continue;
      // CP-01: TETO canônico — o qualificador "até U" com o MESMO valor do
      // teto autorizado é eco do teto (P7: teto continua teto), não faixa.
      if (temFormaTetoCanonica(sentenca) && suporteTemTeto(janela)) {
        const vC = tetoValor(sentenca), vJ = tetoValor(janela);
        if (!(vC != null && vC === vJ)) continue;
        let exato = true;
        if (numsClaim.size > 0) {
          const numsValS = tokensNumericosValor(janela);
          for (const n of numsClaim) {
            const v = valorNumerico(n);
            if (!numsValS.has(String(v ?? n))) { exato = false; break; }
          }
        }
        if (!exato) continue;
        return true;
      }
      // mesma faixa por VALOR (dígito ou extenso): "entre oito e dez" ≡ "8 a 10"
      const fC = faixasNormalizadas(sentenca), fJ = faixasNormalizadas(janela);
      if (fC.length === 0 || fJ.length === 0) continue;
      if (!fC.every((f) => fJ.some((g) => g[0] === f[0] && g[1] === f[1]))) continue;
      // número solto que estiver fora de qualquer faixa precisa constar exato
      if (numsClaim.size > 0) {
        const numsValS = tokensNumericosValor(janela);
        let exato = true;
        for (const n of numsClaim) {
          const v = valorNumerico(n);
          if (!numsValS.has(String(v ?? n))) { exato = false; break; }
        }
        if (!exato) continue;
      }
      return true;
    }
    // R6: guarda de EXATIDÃO numérica — todo número/numeral do claim precisa
    // constar no suporte alinhado ("500 ml" ✓; "700 ml" ✗; "8 a 10" ∋ "10" ✓;
    // "12 aplicações" ∉ "8 a 10 aplicações" ✗).
    if (numsClaim.size > 0) {
      const numsValS = tokensNumericosValor(janela);
      let exato = true;
      for (const n of numsClaim) {
        const v = valorNumerico(n);
        if (!numsValS.has(String(v ?? n))) { exato = false; break; }
      }
      if (!exato) continue;
      // CP-10 XR-5: o suporte em FAIXA ou TETO ("8 a 10", "até 90") não
      // autoriza o EXTREMO/EXATO como fato absoluto ("rende dez",
      // "Entrega em noventa dias") — enunciar sem a forma de faixa/teto
      // eleva o estatuto (P7).
      if ((suporteTemFaixa(janela) || suporteTemTeto(janela)) &&
          !temFormaFaixaOuTeto(sentenca)) continue;
    }
    // CP-01 XR-5bis: o claim que repete a FORMA da faixa/teto do suporte
    // (`8 a 10`) deixa de ser eco fiel quando ADICIONA um enunciado
    // ABSOLUTO/PROMOVEDOR sobre o próprio valor ("sempre dez na prática",
    // "dez garantidas"): o extremo como fato certo ≠ a faixa como norma.
    if (sentencaTemPromocaoSobreFaixa(sentenca, janela)) continue;
    // CP-01 RC-2 (CP-07): identidade léxica não autoriza elevação de
    // estatuto — suporte modal/possibilidade/hipótese NÃO autoriza a
    // forma direta ("Pode, em tese, hidratar" ≁ "Hidrata"). Força só é
    // contrato quando a janela não é faixa/teto gêmeo do claim: dentro do
    // MESMO teto ("até 90 dias" ≡ "até noventa dias" CP-01/P7) a forma já
    // foi protegida por XR-5 e não conta como escalada.
    const estS = estatutoEpistemico(janela), estC = estatutoEpistemico(sentenca);
    const fS = forcaSemantica(janela), fC = forcaSemantica(sentenca);
    const janelaGemeiaFaixaTeto = suporteTemFaixa(janela) || suporteTemTeto(janela);
    if (!janelaGemeiaFaixaTeto && fC > fS) continue;
    if (estC > estS) continue;
    if (estS < 3) {
      // suporte modal: claim só passa com A MESMA modalidade marcada
      if (!RX_MODAL_HABILITADOR.test(sentenca) && !RX_MODAL_FRACO.test(sentenca)) continue;
    }
    return true;
  }
  return false;
}

// ======================================================================
// P4.1.3R5 — JANELA COMPOSICIONAL (CP-08 RC-C)
// Fragmentos individualmente inocentes que JUNTOS predicam fato material.
// A fronteira de sentença é controlada pelo gerador — então o mesmo
// pipeline também analisa pares adjacentes de sentenças DO MESMO bloco
// publicável com safe-harbor em AMBOS desativado (metáfora nãoé par).
// ======================================================================

/** Par composicional: só executa quando NENHUMA das duas está em safe
 *  harbor — assim narrativa cinematográfica legítima não vira claim. */
function janelaComposicionalAtiva(a: string, b: string): boolean {
  return !sentencaEhSafeHarbor(a) && !sentencaEhSafeHarbor(b);
}

/** Par material: junta os stems e válida pelo mesmo veto (entidade+predicado). */
function detectarComposicaoMaterial(
  a: string,
  b: string
): { motivo: string } | null {
  if (!janelaComposicionalAtiva(a, b)) return null;
  const conj = a + " " + b;
  const aberto = detectarAssercaoMaterialAberta(conj);
  if (aberto) return { motivo: aberto.motivo + "_COMPOSTO" };
  // pares específicos que fragmentam reembolso/recomendação/eficácia —
  // não genéricos para não bloquear narrativa de duas sentenças comuns.
  const sA = a.split(/[.!?]\s*/); const sB = b.split(/[.!?]\s*/);
  const abaixo = (sA[0] || a).trim(); const acima = (sB[0] || b).trim();
  // R5 §10: regex case-insensitive — "De volta se não gostar." inicia em
  // maiúscula e não pode escapar por CASO ortográfico.
  const RX_PAR_DINHEIRO = /(?:dinheiro|cr[ée]dito|valor|pre[çc]o|pagamento)\b/i;
  const RX_PAR_DEVOLUCAO = /(?:de\s+volta|devolv\w*|reembols\w*|devolu[çc]\w*)/i;
  if ((RX_PAR_DINHEIRO.test(abaixo) && RX_PAR_DEVOLUCAO.test(acima)) ||
      (RX_PAR_DEVOLUCAO.test(abaixo) && RX_PAR_DINHEIRO.test(acima))) {
    return { motivo: "REEMBOLSO_COMPOSTO" };
  }
  const RX_PAR_PROFISSIONAL = /(?:dermatolog\w*|m[ée]dic\w*|especialist\w*|nutricion\w*|odontol\w*|fisioterap\w*|psic[óo]l\w*|psiquiatr\w*|fonoaudio\w*|pediatr\w*|cardiolog\w*|profission\w*|cientista\w*|pesquisador\w*)\b/i;
  const RX_PAR_RECOMEND = /(?:recomend\w*|aprovam\w*|aprovado|indic\w*|endoss\w*)/i;
  if ((RX_PAR_PROFISSIONAL.test(abaixo) && RX_PAR_RECOMEND.test(acima)) ||
      (RX_PAR_RECOMEND.test(abaixo) && RX_PAR_PROFISSIONAL.test(acima))) {
    return { motivo: "RECOMENDACAO_COMPOSTA" };
  }
  if (/(?:funciona|age|resultado\w*|fazer\s+efeito)/i.test(abaixo) &&
      /(?:comprovad\w*|cientific\w*|estudo|cl[ií]nica\w*|pr[ée]via\w*)\b/i.test(acima)) {
    return { motivo: "PROVA_COMPOSTA" };
  }
  if (/(?:resultado|efeito|funciona|age\b)/i.test(abaixo) &&
      /(?:garant\w*|certeza|promet\w*|assegura\w*)/i.test(acima)) {
    return { motivo: "GARANTIA_COMPOSTA" };
  }
  if (/(?:des\w*|melhor\w*|maior|menor)\b/i.test(abaixo) &&
      /\b\d+\s*%/i.test(acima)) {
    return { motivo: "NUMERICO_COMPOSTO" };
  }
  return null;
}

// ======================================================================
// P4.1.3 · NON_EXPANSION_OF_AUTHORITY (I10) — ESTÁGIO 2 DO CLAIM GUARD
// ----------------------------------------------------------------------
// CAUSA RAIZ DO INCIDENTE (smoke P4.1.2, provado em produção): o estágio 1
// (categorias comerciais) confere PRESENÇA/AUSÊNCIA de temas no Nível A —
// nunca o ÂMBITO da autorização. "Não possui odor forte e sufocante
// característico" (autorização ESTREITA) escapava como autorização do
// absoluto "sem odor". O Gate então declarava "nenhum claim material
// detectado além do autorizado" — semanticamente incorreto.
//
// MECANISMO (determinístico, generalizável — NÃO regex-para-o-caso-Havana):
//  1) AFIRMAÇÃO DE AUSÊNCIA ABSOLUTA (absolutização de negação escopada):
//     operador absoluto (sem|zero|livre de|não causa|ausência de|…) +
//     alvo de uma FAMÍLIA configurável, SEM qualificador material na
//     sentença → exige SUPORTE ESTRITO no Nível A: operador-equivalente
//     sobre o MESMO grupo-alvo (sinônimos) em sentença TAMBÉM livre de
//     qualificadores. "não possui odor forte" (grupo odor + forte) não
//     sustenta "sem odor" (grupo odor, sem qualificador). Grupo AMPLIO
//     (química) nunca é sustentado por alvo ESPECÍFICO (formol).
//  2) UNIVERSALIZAÇÃO sem suporte ("compatível com qualquer química"):
//     universalizador + alvo → exige universalização igual SEM marca de
//     restrição (mediante/avaliação/teste/alta/…) no Nível A.
//  3) MODALIDADE APROXIMADA REMOVIDA (possibilidade→certeza,
//     faixa→exato, "até"→valor fixo): número+unidade na peça SEM
//     qualificador que no Nível A existe APENAS qualificado
//     (até/aproximadamente/pode/máximo…) → transformação não autorizada.
//
// SUPRESSÕES (idênticas ao estágio 1, fail-closed invertido):
//  - rótulo da linha (HIPÓTESE/SUGESTÃO/PENDENTE/CONDICIONAL) — rascunho;
//  - sentença metalinguística ("o briefing não autoriza dizer 'sem odor'").
// ======================================================================

/** Qualificadores MATERIAIS: sua presença na sentença torna a afirmação de
 *  ausência/restrita — remover qualquer um deles amplia o claim. */
const RX_QUALIFICADOR_MATERIAL =
  // Cuidado: ADJETIVOS DE ENTIDADE ALHEIA ("fórmula suave", "brilho natural")
  // NÃO atenuam o alvo — lista curada aos MATERIAIS do alvo.
  /\bforte\b|intens[ao]|sufocant|caracter[ií]stic|espec[ií]fic|t[ií]pic|leve\b|moderad\w*|residual|ocasional|colateral|secund[áa]ri|nos olhos|do couro|do couro cabeludo|da pele|da raiz|nas pontas|no corpo|comum em|pr[óo]prio de|levemente|pronunciado|presente\b/i;

/** Sentença circundante de `indice` (delimitadores .!? newline). */
function sentencaAoRedor(texto: string, indice: number): string {
  const iniS =
    Math.max(
      texto.lastIndexOf(".", indice - 1),
      texto.lastIndexOf("!", indice - 1),
      texto.lastIndexOf("?", indice - 1),
      texto.lastIndexOf("\n", indice - 1)
    ) + 1;
  let fimS = texto.length;
  for (const p of [".", "!", "?", "\n"]) {
    const j = texto.indexOf(p, indice);
    if (j !== -1) fimS = Math.min(fimS, j);
  }
  return texto.slice(iniS, fimS);
}

/** B3 (CP-06): a sentença negada na peça é ECO de ausência ESTRITAMENTE
 *  suportada no Nível A (mesmo grupo-alvo, sem qualificador dos dois lados)?
 *  Se sim, é respeito ao briefing — suprimível. Caso contrário é CLAIM. */
function ecoDeAusenciaSuportada(sentencaPeca: string, nivelA: string): boolean {
  const afirmadas = afirmacoesAusenciaAbsoluta(sentencaPeca);
  if (afirmadas.length === 0) return false;
  return afirmadas.every((a) => {
    const familia = FAMILIAS_AUSENCIA.find((f) => f.chave === a.familia);
    return familia
      ? suporteAusenciaEstrito(nivelA, familia, a.grupo, a.stemAlvo)
      : false;
  });
}

/** Operadores que AFIRMAM AUSÊNCIA (na peça E no suporte do Nível A). */
const RX_OPERADOR_AUSENCIA = new RegExp(
  "\\b(?:elimin(?:a(?:c|ç)(?:[aã]o)?|ad[oa]r?)\\s+(?:completamente\\s+)?d[aeo]s?\\s+|" +
    "aus[êe]ncia\\s+de\\s+|livre\\s+de\\s+|isento\\s+de\\s+|" +
    "n[aã]o\\s+(?:possui|apresenta|tem|cont[ée]m|causa|provoca|desencadeia|inclui)\\s+|" +
    "nunca\\s+(?:causa|provoca|tem)?\\s*|jamais\\s+(?:causa|provoca|tem)?\\s*|" +
    "nenhum(?:a)?\\s+|sem\\s+qualquer\\s+|sem\\s+|zero\\s+|n[aã]o\\s+existe(?:\\s+neste\\s+briefing)?\\s+)", "gi"
);

/** Um grupo-alvo = conjunto de sinônimos (mesma entidade semântica). */
type GrupoAlvo = {
  readonly rx: RegExp;
  readonly stems: readonly string[];
};
type FamiliaAusencia = {
  readonly chave: string;
  readonly grupos: readonly GrupoAlvo[];
  /** true ⇒ alvo desta família NUNCA se sustenta por alvo de OUTRA família,
   *  e grupo marcado amploNuncaSuportadoPorEspecifico não se sustenta por
   *  grupo específico da MESMA família. */
  readonly amplia?: boolean;
};

function normalizar(palavra: string): string {
  return palavra
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z\d]/g, "")
    .slice(0, 6);
}

const GRUPO_ODOR: GrupoAlvo = {
  rx: /\b(?:odor|cheiro|aroma|perfume)[\wÀ-ÿ-]*/i,
  stems: ["odor", "cheiro", "aroma", "perfume"],
};
const GRUPO_QUIMICA_AMPLIA: GrupoAlvo = {
  rx: /\bqu[ií]mic\w*/i,
  stems: ["quimic"],
};
const GRUPO_COMPOSICAO_ESPECIFICA: GrupoAlvo = {
  rx: /\b(?:formol|toxin\w*|conservant\w*|paraben\w*|sulfat\w*|ftalat\w*|amoniac\w*|am[oô]nia\b)[\wÀ-ÿ-]*/i,
  stems: ["formol", "toxina", "conser", "parabe", "sulfat", "ftalato", "amonia"],
};
const GRUPO_IRRITACAO: GrupoAlvo = {
  rx: /\birrita[\wÀ-ÿ-]*/i,
  stems: ["irrita"],
};
const GRUPO_ALERGIA: GrupoAlvo = {
  rx: /\balerg[\wÀ-ÿ-]*/i,
  stems: ["alergi", "alergo"],
};
const GRUPO_ARDENCIA: GrupoAlvo = {
  rx: /\b(?:ard[êe]ncia|ard[êe]r|ardido|ardendo|queima[cç][ãa]o\b)/i,
  stems: ["ardenc", "ardido", "ardend", "queima"],
};
// X6 (CP-06): SEGURANÇA é família própria — absoluto de risco exige suporte
// ABSOLUTO no Nível A ("baixo risco" ≠ "sem risco"). BLOQUEIO (não QUALIFICAR).
const GRUPO_RISCO: GrupoAlvo = {
  rx: /\b(?:risco|perigo|les[ãa]o|dano|machuc\w*)[\wÀ-ÿ-]*/i,
  stems: ["risco", "perigo", "lesao", "dano", "machuc"],
};
const GRUPO_COCEIRA_VERMELHIDAO: GrupoAlvo = {
  rx: /\b(?:coceira|vermelhid[ãa]o\w*|prurido\b)/i,
  stems: ["coceir", "vermel", "prurid"],
};
const GRUPO_FRIZZ: GrupoAlvo = {
  rx: /\bfrizz\b[\wÀ-ÿ-]*/i,
  stems: ["frizz"],
};

const FAMILIAS_AUSENCIA: readonly FamiliaAusencia[] = [
  { chave: "ODOR_SENSORIAL", grupos: [GRUPO_ODOR] },
  { chave: "SEGURANCA_RISCO", grupos: [GRUPO_RISCO] },
  {
    chave: "TOLERANCIA_DERMICA",
    grupos: [
      GRUPO_IRRITACAO,
      GRUPO_ALERGIA,
      GRUPO_ARDENCIA,
      GRUPO_COCEIRA_VERMELHIDAO,
    ],
  },
  {
    chave: "COMPOSICAO",
    grupos: [GRUPO_QUIMICA_AMPLIA, GRUPO_COMPOSICAO_ESPECIFICA],
    amplia: true,
  },
  { chave: "APARENCIA_CAPILAR", grupos: [GRUPO_FRIZZ] },
  {
    chave: "OFERTA_COMERCIAL", // CP-01 CA-GH: mencionar a restrição ("Sem desconto.") ecoa BF_NEG — não é oferta
    grupos: [{ rx: /\b(?:descont[\wÀ-ÿ]*|cupons?|promo(?:ção|coes)|ofertas?|brindes?|benefício\s+fiscal)\b/i, stems: ["descont", "cupom", "promo", "oferta", "brind"] }],
  },
];

/** Alvos de universalização (famílias sensíveis à forma "qualquer…"). */
const GRUPOS_UNIVERSALIZAVEIS: readonly GrupoAlvo[] = [
  GRUPO_QUIMICA_AMPLIA,
  GRUPO_COMPOSICAO_ESPECIFICA,
  GRUPO_ODOR,
  GRUPO_IRRITACAO,
  GRUPO_ALERGIA,
  { rx: /\b(?:cabel[\wÀ-ÿ]*|fio de cabelo\b|pele\b|couro cabeludo|organismo\w*)/i, stems: ["cabel", "pele", "organi"] },
];

const RX_UNIVERSALIZADOR =
  /\b(?:qualquer|tod[oa]s(?:\s+(?:as|os))?|sempre|universalmente?|100%\s+de\s+tod[oa]s)\b/i;
const RX_MARCA_RESTRICAO_SUPORTE =
  /\bmediante\b|dependendo\b|somente\b|apenas\b|condicionad\w*|quando\b|sob\b|supervis|avalia[cç][ãa]o|avaliado|teste\b|testado|adequad\w*|protocolo|desde que\b|recomendad\w*|orientad\w*|alto\b|alta\b|elevado|m[áa]ximo|por\s+enquanto|parcial\w*|booleano/i;

/** Número + unidade com significado físico/modal (exclui % — já coberto
 *  materialmente pelas categorias comerciais do estágio 1). */
const RX_NUM_UNIDADE =
  /\b(\d{1,3}(?:[.,]\d+)?(?:\s*(?:a|at[ée]|–|—|-)\s*\d{1,3}(?:[.,]\d+)?)?)\s+(dias?|semanas?|mes(?:es)?|anos?|horas?|minutos?|aplica[\wÀ-ÿ]*|sess[\wÀ-ÿ]*|doses?|ml\b|g\b|kg\b|unidades?|pessoas?|clientes?|vezes)\b/gi;
const RX_APROXIMADOR =
  /\bat[ée]\b|aproximad\w*|cerca\s+de\b|por\s+volta\s+de\b|em\s+m[ée]dia\b|m[áa]ximo\b|estimad\w*|faixa\s+de\b|\bpode\b|possivelmente\b|sob\s+(?:o\s+)?m[áa]ximo/i;

/* RED TEAM FIX (V16, mínimo): DOIS eixos de amplificação NÃO previstos
 * pelas famílias AUSENCIA/UNIVERSALIZACAO/MODAL-NUMÉRICA —
 * (a) ESCALA de quantificadores (alguns<vários<muitos<a maioria<todos):
 *     peça não pode saltar para nível superior ao suportado pelo Nível A;
 * (b) MODALIDADE VERBAL (possibilidade→certeza): "pode ajudar a reduzir"
 *     NÃO autoriza "reduz" — o habilitador removido é expansão. */

const RX_TERMOS_POPULACAO = /\b(?:clientes?|clientela|usu[áa]rios?|pessoas?|mulheres?|casos?|resultados?|adeptos?|consumidores?|p[úu]blico)\b/i;
const ESCALA_QUANTIFICADOR: readonly (readonly string[])[] = [
  ["nenhum", "quase nenhum"],
  ["poucos", "casos isolados", "poucas"],
  ["alguns", "algumas", "certos", "parte"],
  ["v[áa]rios", "diversos"],
  ["muitos", "grande n[úu]mero", "incont[áa]veis", "v[áa]rias", "muitas"],
  ["a maioria", "\bmaioria\b", "grande parte", "mais da metade", "predominantemente"],
  ["todos", "todas", "todo mundo", "quase todos", "quase todas", "quase todo", "quase toda", "100%", "un[âa]nime", "consenso", "sempre"],
];
function nivelQuantificador(texto: string): number {
  let melhor = -1;
  for (let i = 0; i < ESCALA_QUANTIFICADOR.length; i += 1) {
    for (const padrao of ESCALA_QUANTIFICADOR[i]) {
      if (new RegExp(padrao, "i").test(texto)) melhor = Math.max(melhor, i);
    }
  }
  return melhor;
}

/** Habilitadores de POSSIBILIDADE cujo desaparecimento transforma o claim. */
const RX_MODAL_HABILITADOR =
  /\bpode\b|\bpodem\b|\bpoder[aá]\b|\bayuda?\w*\s+a\b|ajudar\s+a\b|auxilia\w*\s+a\b|auxiliar\s+a\b|contribui\w*\s+para\b|tend\w*\s+a\b|em\s+alguns\s+casos\b|possivelmente\b/i;

interface ParModalVerbo {
  readonly lema: string;
  readonly verbo: string;
}
function paresModalVerbo(texto: string): readonly ParModalVerbo[] {
  // captura INFINITIVO após habilitador de possibilidade:
  // "pode (ajudar a|auxiliar a|contribuir para)? (a )? <INF-ar/er/ir>"
  const rx = new RegExp(
    "(?:\\bpode\\b|\\bpodem\\b|\\bpoder[aá]\\b)" +
      "(?:\\s+(?:ajudar|auxiliar|contribuir)(?:\\s+a|\\s+para)?)?" +
      "(?:\\s+a)?\\s+([\\wÀ-ÿ]{4,}(?:ar|er|ir))\\b",
    "gi"
  );
  const out: ParModalVerbo[] = [];
  let m: RegExpExecArray | null;
  while ((m = rx.exec(texto)) !== null) {
    const verbo = m[1].toLowerCase();
    const lema = verbo
      .replace(/ar$|er$|ir$/, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (lema.length >= 3) out.push({ lema, verbo });
  }
  return out;
}

/** Para cada verbo-liga do briefing licenciado APENAS modalmente, a peça
 *  usa a forma DIRETA (sem habilitador)? "reduz" vs "pode ajudar a reduzir". */
function modalidadeEstadoRemovida(
  textoPeca: string,
  nivelA: string
): { inicio: number; verbo: string; sentenca: string }[] {
  const out: { inicio: number; verbo: string; sentenca: string }[] = [];
  const paresBriefing = paresModalVerbo(nivelA);
  if (paresBriefing.length === 0) return out;
  const sentencasBriefing = sentencasDe(nivelA);
  const sentencas = sentencasDe(textoPeca);
  let cursor = 0;
  for (const sentenca of sentencas) {
    const iniS = textoPeca.indexOf(sentenca, cursor);
    cursor = iniS + sentenca.length;
    if (RX_MODAL_HABILITADOR.test(sentenca)) continue; // peça preserva modal
    for (const { lema, verbo } of paresBriefing) {
      if (verbo === "ajudar" || verbo === "auxiliar" || verbo === "contribuir") continue;
      const rxLema = new RegExp("\\b" + lema, "i");
      if (!rxLema.test(sentenca)) continue;
      // suporte direto: forma DIRETA (lem a sem modal) existe no Nível A?
      const suportadoDireto = sentencasBriefing.some(
        (bs) => rxLema.test(bs) && !RX_MODAL_HABILITADOR.test(bs)
      );
      if (suportadoDireto) continue;
      const idx = sentenca.search(rxLema);
      out.push({ inicio: iniS + Math.max(0, idx), verbo, sentenca });
    }
  }
  return out;
}

/** Sentença linguística=META sobre regras do sistema (não é claim). */
function sentencaMetalinguistica(s: string): boolean {
  // Meta-discurso: fala SOBRE regras ou sobre o ATO DE DIZ/ENUNCIAR
  // ("não mencionar preço nesta cena" = instrução de produção, não claim).
  // P4.1.3R3 (§11.4): ato-de-enunciar adicionado por extensão conceitual,
  // não por frase: verbos cujo objeto é a própria fala.
  const base = /autoriz|n[íi]vel\s+a\b|proibid|n[ãa]o\s+(?:[ée]\s+)?permitid|epist[êe]mic|guardi[ãa]o|restri[cç][ãa]o\s+(?:do|da)\s+briefing|mencion\w*|\b(?:dizer|falar)\b|\brevel\w+\s+(?:sobre|de|da|do|que|o\s+que)\b|\bcit\w+\b/i.test(s);
  if (!base) return false;
  // CP-10 XR (P11): ATO-DE-ENUNCIAR instrutivo NÃO-negado com claim material
  // embutido é injeção por embalagem ("dizer que é homologado") — não silencia.
  // Instrução de EXCLUSÃO ("não mencionar preço") segue meta-discurso legitimo.
  if (/\b(?:dizer|falar|anunciar|escrever|afirmar|publicar|divulgar|destacar|promet\w*|garantir|assegurar|jur\w*|declar\w*|comprov\w*|confirm\w*)\s+que\b/i.test(s) &&
      !/^\s*(?:[-–•*·]\s*)?n[ãa]o\b/.test(s) &&
      conteudoAssertivoEmbutido(s)) return false;
  return true;
}

function sentencasDe(texto: string): readonly string[] {
  return texto.split(/[.!?\n]+/).filter((s) => s.trim().length > 0);
}

interface AfirmacaoAusencia {
  readonly familia: string;
  readonly grupo: GrupoAlvo;
  readonly stemAlvo: string;
  readonly inicio: number;
  readonly sentenca: string;
}

/** Afirmações de AUSÊNCIA ABSOLUTA sobre famílias controladas
 *  (operador + alvo da família, sentença SEM qualificador material). */
function afirmacoesAusenciaAbsoluta(texto: string): AfirmacaoAusencia[] {
  const achados: AfirmacaoAusencia[] = [];
  RX_OPERADOR_AUSENCIA.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RX_OPERADOR_AUSENCIA.exec(texto)) !== null) {
    const inicio = m.index;
    // janela de alvo: até 4 tokens após o operador
    const resto = texto.slice(inicio + m[0].length, inicio + m[0].length + 48);
    const janela = resto.match(/^\s*(?:[\wÀ-ÿ%#.-]+\b[^.!?]{0,26}){0,3}/)?.[0] ?? "";
    // sentença circundante (para avaliar qualificadores materiais)
    const iniS = Math.max(
      texto.lastIndexOf(".", inicio - 1),
      texto.lastIndexOf("!", inicio - 1),
      texto.lastIndexOf("?", inicio - 1),
      texto.lastIndexOf("\n", inicio - 1)
    ) + 1;
    let fimS = texto.length;
    for (const p of [".", "!", "?", "\n"]) {
      const j = texto.indexOf(p, inicio);
      if (j !== -1) fimS = Math.min(fimS, j);
    }
    const sentenca = texto.slice(iniS, fimS);
    if (RX_QUALIFICADOR_MATERIAL.test(sentenca)) continue; // escopada — não absoluta
    for (const fam of FAMILIAS_AUSENCIA) {
      for (const grupo of fam.grupos) {
        const alvo = janela.match(grupo.rx);
        if (!alvo) continue;
        achados.push({
          familia: fam.chave,
          grupo,
          stemAlvo: normalizar(alvo[0]),
          inicio,
          sentenca,
        });
      }
    }
  }
  return achados;
}

/** Suporte ESTRITO no Nível A: operador de ausência + MESMO grupo-alvo,
 *  sentença SEM qualificador material. Nunca substituível por outra família,
 *  e grupo AMPLIO ("química") nunca se sustenta por ESPECÍFICO ("formol"). */
function suporteAusenciaEstrito(
  nivelA: string,
  familia: FamiliaAusencia,
  grupoAlvo: GrupoAlvo,
  stemAlvo: string
): boolean {
  for (const sentenca of sentencasDe(nivelA)) {
    // CP-01 CA-GH2: família OFERTA_COMERCIAL — o qualificador dentro da NEGAÇÃO
    // ("percentual de desconto") ainda é negação da família inteira.
    if (RX_QUALIFICADOR_MATERIAL.test(sentenca) && familia.chave !== "OFERTA_COMERCIAL") continue;
    RX_OPERADOR_AUSENCIA.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = RX_OPERADOR_AUSENCIA.exec(sentenca)) !== null) {
      const resto = sentenca.slice(m.index + m[0].length, m.index + m[0].length + 48);
      const janela = resto.match(/^\s*(?:[\wÀ-ÿ%#.-]+\b[^.!?]{0,26}){0,3}/)?.[0] ?? "";
      const targets =
        familia.chave === "COMPOSICAO"
          ? // grupo amplo só se sustenta por ele mesmo; específico por específico
            [grupoAlvo]
          : familia.grupos;
      for (const ga of targets) {
        const alvo = janela.match(ga.rx);
        if (!alvo) continue;
        const stemSuporte = normalizar(alvo[0]);
        if (stemSuporte === stemAlvo || ga.stems.includes(stemSuporte)) {
          return true;
        }
      }
    }
  }
  return false;
}

/** Universalização na peça: universalizador + alvo sensível na sentença. */
function universalizacoesSemSuporte(
  texto: string,
  nivelA: string
): { stem: string; inicio: number; sentenca: string }[] {
  const out: { stem: string; inicio: number; sentenca: string }[] = [];
  const sentencas = sentencasDe(texto);
  let cursor = 0;
  for (const sentenca of sentencas) {
    const inicioSentenca = texto.indexOf(sentenca, cursor);
    cursor = inicioSentenca + sentenca.length;
    const univ = new RegExp(RX_UNIVERSALIZADOR.source, "gi");
    let mu: RegExpExecArray | null;
    // proximidade obrigatória: universalizador ANTES do alvo, numa janela
    // curta ("compatível com qualquer química") — "todos os dias" longe do
    // alvo NÃO é universalização dele (falso-positivo do P4 T19).
    while ((mu = univ.exec(sentenca)) !== null) {
      const janela = sentenca.slice(mu.index, mu.index + mu[0].length + 48);
      for (const grupo of GRUPOS_UNIVERSALIZAVEIS) {
        const alvo = janela.slice(mu[0].length).match(grupo.rx);
        if (!alvo) continue;
        const suportado = sentencasDe(nivelA).some((bs) => {
          if (!RX_UNIVERSALIZADOR.test(bs)) return false;
          if (RX_MARCA_RESTRICAO_SUPORTE.test(bs)) return false;
          return grupo.rx.test(bs);
        });
        if (!suportado) {
          out.push({
            stem: normalizar(alvo[0]),
            inicio: inicioSentenca + mu.index,
            sentenca,
          });
        }
      }
    }
  }
  return out;
}

interface TuplaNum {
  readonly numeros: readonly string[];
  readonly unidade: string;
  readonly index: number;
  readonly comprimento: number;
}
/** Tuplas (números, unidade) — REGEX FRESCA por texto: a instância global
 *  compartilhada corrompe lastIndex em loops aninhados (bug real P4.1.3). */
function tuplasNumUnidade(texto: string): TuplaNum[] {
  const rx = new RegExp(RX_NUM_UNIDADE.source, "gi");
  const out: TuplaNum[] = [];
  let m: RegExpExecArray | null;
  while ((m = rx.exec(texto)) !== null) {
    out.push({
      numeros: (m[1].match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(",", ".")),
      unidade: normalizar(m[2]),
      index: m.index,
      comprimento: m[0].length,
    });
  }
  return out;
}

/** Transformação modal: número+unidade exato na peça que no Nível A existe
 *  APENAS qualificado (até/aproximadamente/pode/máximo…). */
function modalidadeAproximadaRemovida(
  texto: string,
  nivelA: string
): { trecho: string; inicio: number; sentenca: string }[] {
  const out: { trecho: string; inicio: number; sentenca: string }[] = [];
  const sentencasNivelA = sentencasDe(nivelA);
  const sentencas = sentencasDe(texto);
  let cursor = 0;
  for (const sentenca of sentencas) {
    const inicioSentenca = texto.indexOf(sentenca, cursor);
    cursor = inicioSentenca + sentenca.length;
    if (RX_APROXIMADOR.test(sentenca)) continue; // peça preserva qualificador
    for (const t of tuplasNumUnidade(sentenca)) {
      const matchEm = (bs: string) =>
        tuplasNumUnidade(bs).some(
          (tb) =>
            tb.unidade === t.unidade &&
            tb.numeros.some((n) => t.numeros.includes(n))
        );
      const haQualificado = sentencasNivelA.some(
        (bs) => RX_APROXIMADOR.test(bs) && matchEm(bs)
      );
      const haDefinitivo = sentencasNivelA.some(
        (bs) => !RX_APROXIMADOR.test(bs) && matchEm(bs)
      );
      if (haQualificado && !haDefinitivo) {
        out.push({
          trecho: sentenca.slice(t.index, t.index + t.comprimento),
          inicio: inicioSentenca + t.index,
          sentenca,
        });
      }
    }
  }
  return out;
}

/**
 * Varre o material destinado à publicação e devolve achados determinísticos.
 * Duas formas de supressão, ambas determinísticas:
 *  1. AUTORIZAÇÃO (Nível A): a forma autorizadora consta no briefing —
 *     para DESCONTO/PREÇO exige o MESMO valor (I8, autorização própria).
 *  2. RÓTULO INTERNO (I9): a linha do match começa com HIPÓTESE/SUGESTÃO/
 *     PENDENTE/CONDICIONAL — trabalho interno explicitamente declarado,
 *     NÃO peça final. "CONFIRMADO:" e afins NÃO são rótulos válidos (I7).
 * Determinístico puro: mesmos textos → mesmos achados.
 */
/** R5 (CP-08 §14): TODA unidade do Nível A que casa o tema precisa ser
 *  apresentação factual — se as únicas menções são condicionais/hipotéticas
 *  ("Se aprovados, teremos certificado CE."), o âmbito NÃO está dado. */
function suporteTemUnidadeFactual(briefing: string, temaRx: RegExp): boolean {
  const rx = new RegExp(temaRx.source, "i");
  for (const u of unidadesDecisao(briefing)) {
    if (u.negada) continue;
    if (!rx.test(u.texto)) continue;
    // R6: mesma barra de factualidade da autorização aberta (única fonte).
    if (RX_SUPORTE_NAO_FATUAL.test(u.texto)) continue;
    return true;
  }
  return false;
}

function stripLedgerBlocks(texto: string): string {
  return texto.replace(
    /-{2,}\[BLOCO:CLAIM_LEDGER\][\s\S]*?(?:-{2,}\[FIM:BLOCO:CLAIM_LEDGER\]|$)/gi,
    " "
  );
}

export function varrerClaimsMateriais(
  textoAnalisadoOriginal: string,
  textoAutoritativo: string
): AchadoEpistemico[] {
  // R5: ledger é METADADO — nunca conta como texto público nas varreduras.
  const textoAnalisado = stripLedgerBlocks(textoAnalisadoOriginal);
  nivelAFallbackCP01 = textoAutoritativo; // CP-01 CA-GH4: eco-de-restrição no porto-seguro
  const achados: AchadoEpistemico[] = [];
  const autorizadasRapidas = new Set<string>();
  // R6 (MB-coerência witness): sentenças cuja autoridade foi CONCEDIDA no
  // estágio 8 (âmbito/suporte ou ledger válido) não voltam a entrar no
  // open-world gate — RECOGNITION happenned, AUTHORIZATION happened.
  const autorizadasFechadas = new Set<string>();
  for (const cat of CATEGORIAS_GUARD) {
    // B2 (CP-06): supressão é POR OCORRÊNCIA — examina TODAS as matches, não
    // só a primeira (primeira ocorrência safe NÃO autoriza a dangerous
    // seguinte). UMA OCORRÊNCIA SEGURA NÃO AUTORIZA OUTRA.
    const detector = new RegExp(
      cat.detector.source,
      cat.detector.flags.includes("g") ? cat.detector.flags : cat.detector.flags + "g"
    );
    let autorizadoCarimbo: boolean | null = null;
    let alvo: RegExpExecArray | null;
    while ((alvo = detector.exec(textoAnalisado)) !== null) {
      if (autorizadoCarimbo === null) {
        autorizadoCarimbo = cat.autorizacaoContextual
          ? cat.autorizacaoContextual(alvo[0], textoAutoritativo)
          : cat.autorizador
            ? sentencasDe(textoAutoritativo).some((fr) =>
                // CP-01/P8: hipótese/plano no Nível A NÃO autoriza (o
                // autorizador lexical só vale sobre unidade FACTUAL,
                // não-negada, não-hipotética).
                cat.autorizador!.test(fr) && !RX_SUPORTE_NAO_FATUAL.test(fr) &&
                !sentencaNegada(textoAutoritativo, textoAutoritativo.indexOf(fr)))
            : false;
      }
      // P4.1 (I8): autorização VALOR-ESPECÍFICA re-verifica por ocorrência
      // (desconto 5% autorizado NÃO autoriza 10%).
      // R4 (CP-07 RC-4): âmbito — tema ≠ escopo (certificação ISO ≠
      // certificação dermatológica). Per-ocorrência, na sentença da peça.
      let autorizado = cat.autorizacaoComAmbito
        ? autorizacaoComAmbito(
            textoAutoritativo,
            sentencaAoRedor(textoAnalisado, alvo.index),
            cat.autorizacaoComAmbito
          )
        : cat.autorizacaoContextual
          ? cat.autorizacaoContextual(alvo[0], textoAutoritativo)
          : autorizadoCarimbo;
      // CP-01/P8 (hipótese≠autoridade): a autoridade só vale se EXISTIR
      // unidade factual e não-negada do Nível A carregando o MESMO tema do
      // claim (mesmo detector). Hipótese contextual não autoriza.
      // CP-01: o check temático-factual (P8/E2) aplica-se SOMENTE ao carimbo
      // lexical (cat.autorizador — tema por palavra, sem validação de valor):
      // é aí que hipótese autorizava fato ("PODEMOS fazer frete..." → claim
      // "frete incluso"). autorizacaoContextual/ComAmbito já carregam
      // exatidão própria (mesmo valor/mesmo âmbito) — E2 sobre eles causa
      // falso negativo por forma detecção-perifraseal (R3/P4/P9 regressões).
      if (autorizado && cat.autorizador && !cat.autorizacaoContextual && !cat.autorizacaoComAmbito) {
        let temFactualTema = false;
        const sClaim = sentencaAoRedor(textoAnalisado, alvo.index);
        const numsCl = tokensNumericos(sClaim);
        const numsValCl = tokensNumericosValor(sClaim);
        for (const fr of sentencasDe(textoAutoritativo)) {
          const iniF = textoAutoritativo.indexOf(fr);
          if (!cat.detector.test(fr)) continue;
          if (RX_SUPORTE_NAO_FATUAL.test(fr)) continue;
          if (sentencaNegada(textoAutoritativo, iniF)) continue;
          // CP-01/P8+XR-5: mesmo tema factual só autoriza com exatidão de
          // valor ("noventa dias" ≡ 90 ∈ "até 90 dias" ✓; "rende 12" ∉ "8 a 10"
          // ✗) e, quando o suporte é faixa, somente a MESMA forma (faixa/teto).
          if (numsCl.size > 0) {
            const numsValS = tokensNumericosValor(fr);
            let coberto = true;
            for (const n of numsCl) {
              const v = valorNumerico(n);
              if (v != null && !numsValS.has(String(v))) { coberto = false; break; }
              if (v == null && !numsValS.has(n)) { coberto = false; break; }
            }
            if (!coberto) continue;
            if (suporteTemFaixa(fr) || /\bat[ée]\s+(?:x|[\wÀ-ÿ]+)/i.test(fr)) {
              if (!temFormaFaixaOuTeto(sClaim)) continue;
            }
          }
          temFactualTema = true;
          break;
        }
        if (!temFactualTema) autorizado = false;
      }
      // CP-01 P8/E2-contextual: mesmo para autorização contextual/âmbito, se
      // TODAS as sentenças do Nível A que carregam a temática do claim são
      // não-factuais ou negadas (hipótese/estudo/plano), a autorização é
      // inválida — hipótese ≠ autoridade vale em TODO caminho de autorização.
      if (autorizado && (cat.autorizacaoContextual || cat.autorizacaoComAmbito)) {
        const algumaFactualTematica = sentencasDe(textoAutoritativo).some((fr) => {
          if (!cat.detector.test(fr)) return false;
          if (RX_SUPORTE_NAO_FATUAL.test(fr)) return false;
          if (sentencaNegada(textoAutoritativo, textoAutoritativo.indexOf(fr))) return false;
          return true;
        });
        if (!algumaFactualTematica) autorizado = false;
      }
      if (autorizado) {
        autorizadasRapidas.add(sentencaAoRedor(textoAnalisado, alvo.index));
        continue;
      }
      if (linhaRotuladaInterna(textoAnalisado, alvo.index)) { // CP-01 OB-C15
        const interno = sentencaAoRedor(textoAnalisado, alvo.index);
        if (semMaterialComercialCP01(interno) &&
            emancipacaoRotuloResisteCP01(interno)) continue;
      }
      // CP-01 P2: trabalho interno DECLARADO (verbo forma-completa +
      // estatuto) é veto por si só — inclusivo com quant-hipotético no objeto
      // ("testar desconto de 10%", "validar dermatologicamente").
      { // I9 (OB-C15)
        const interno = sentencaAoRedor(textoAnalisado, alvo.index);
        if (sentencaEhTrabalhoInternoDeclarado(interno) &&
            emancipacaoRotuloResisteCP01(interno)) continue;
      }
      // P4.1.1: menção em sentença NEGADA na peça é respeito ao briefing
      // ("o briefing não autoriza desconto"), não claim comercial.
      // B3 (CP-06): supressão EXIGE comprovação — mera presença lexical de
      // "sem/não" NÃO basta ("Parcele em 12x sem juros" é CLAIM comercial,
      // não negação de regra). Só suprime se a sentença é METALINGUÍSTICA
      // ou é ECO de ausência estritamente suportada no Nível A.
      if (cat.ignorarNegacaoNaPeca) {
        const sentenca = sentencaAoRedor(textoAnalisado, alvo.index);
        if (
          sentencaNegada(textoAnalisado, alvo.index) &&
          (sentencaMetalinguistica(sentenca) ||
            ecoDeAusenciaSuportada(sentenca, textoAutoritativo))
        ) {
          continue;
        }
      }
      achados.push({
        categoria: cat.nome,
        trecho: corteTrecho(textoAnalisado, alvo.index, alvo[0].length),
        norma: cat.normaQuandoAusente,
        porque: cat.porque,
      });
    }
  }

  // ---------- P4.1.3 · ESTÁGIO 2 — NON_EXPANSION_OF_AUTHORITY (I10) ----------
  // 1) Ausência absoluta sem suporte estrito (absolutização; norma BLOQUEIO)
  for (const afirm of afirmacoesAusenciaAbsoluta(textoAnalisado)) {
    if (linhaRotuladaInterna(textoAnalisado, afirm.inicio) && semMaterialComercialCP01(sentencaAoRedor(textoAnalisado, afirm.inicio))
        && emancipacaoRotuloResisteCP01(sentencaAoRedor(textoAnalisado, afirm.inicio))) continue; // CP-01 CA-F05
      // CP-01 P2: trabalho interno DECLARADO (verbo forma-completa +
      // estatuto) é veto por si só — inclusivo com quant-hipotético no objeto
      // ("testar desconto de 10%", "validar dermatologicamente").
      if (sentencaEhTrabalhoInternoDeclarado(sentencaAoRedor(textoAnalisado, afirm.inicio))) continue;
    if (sentencaMetalinguistica(afirm.sentenca)) continue;
    const familia = FAMILIAS_AUSENCIA.find((f) => f.chave === afirm.familia)!;
    if (suporteAusenciaEstrito(textoAutoritativo, familia, afirm.grupo, afirm.stemAlvo)) continue;
    achados.push({
      categoria: `EXPANSAO_AUSENCIA_ABSOLUTA_${afirm.familia}`,
      trecho: corteTrecho(textoAnalisado, afirm.inicio, 24),
      norma: "BLOQUEIO",
      porque:
        "afirmação de ausência absoluta sem o mesmo grau no briefing: autorização específica/estrita NÃO autoriza a forma absoluta (transformação localizada→global)",
    });
  }
  // 2) Universalização sem suporte amplo (escopo→universo; norma BLOQUEIO)
  for (const u of universalizacoesSemSuporte(textoAnalisado, textoAutoritativo)) {
    if (linhaRotuladaInterna(textoAnalisado, u.inicio) && semMaterialComercialCP01(sentencaAoRedor(textoAnalisado, u.inicio))
        && emancipacaoRotuloResisteCP01(sentencaAoRedor(textoAnalisado, u.inicio))) continue; // CP-01 CA-F05
      // CP-01 P2: trabalho interno DECLARADO (verbo forma-completa +
      // estatuto) é veto por si só — inclusivo com quant-hipotético no objeto
      // ("testar desconto de 10%", "validar dermatologicamente").
      if (sentencaEhTrabalhoInternoDeclarado(sentencaAoRedor(textoAnalisado, u.inicio))) continue;
    if (sentencaMetalinguistica(u.sentenca)) continue;
    achados.push({
      categoria: "UNIVERSALIZACAO_SEM_SUPORTE",
      trecho: corteTrecho(textoAnalisado, u.inicio, 24),
      norma: "BLOQUEIO",
      porque:
        "universalização ('qualquer/todos/sempre') sobre alvo sensível sem a mesma universalização irrestrita no briefing",
    });
  }
  // 4) RED TEAM (V16.a): amplificação de quantificador (alguns→maioria...)
  if (RX_TERMOS_POPULACAO.test(textoAnalisado)) {
    const nivelPeca = nivelQuantificador(textoAnalisado);
    const nivelBriefing = nivelQuantificador(textoAutoritativo);
    if (nivelPeca > nivelBriefing) {
      const idx = textoAnalisado.search(RX_TERMOS_POPULACAO);
      const sAlvo = sentencaAoRedor(textoAnalisado, idx);
      // CP-01 (OB-C2): sentença rotulada como METADADO DE PRODUÇÃO (Personagem:,
      // Direção criativa:...) não é população comercial — "a cliente de
      // sempre" é figura de cena, não quantificador-amplificado de mercado.
      if (!sentencaEhMetadadoProducao(sAlvo) && !sentencaEhSafeHarbor(sAlvo) &&
          !RX_PIN_PRODUCAO_NARRATIVA.test(sAlvo) && !RX_ROTULO_METADADO.test(sAlvo) &&
          !sinalDeApenasArtefatoCP01(sAlvo)) {
        achados.push({
          categoria: "QUANTIFICADOR_AMPLIFICADO",
          trecho: corteTrecho(textoAnalisado, Math.max(0, idx - 24), 40),
          norma: "BLOQUEIO",
          porque:
            "quantificador sobre população AMPLIFICADO além do suportado pelo Nível A (vago/limitado→maioria/todos NÃO herda autorização)",
        });
      }
    }
  }
  // 6) CP-06 (B4–B7) + CP-07 (RC-2/RC-3): escalada de força OU estatuto.
  for (const ex of expansaoForcaSemantica(textoAnalisado, textoAutoritativo)) {
    if (linhaRotuladaInterna(textoAnalisado, ex.inicio) && semMaterialComercialCP01(sentencaAoRedor(textoAnalisado, ex.inicio))
        && emancipacaoRotuloResisteCP01(sentencaAoRedor(textoAnalisado, ex.inicio))) continue; // CP-01 CA-F05
      // CP-01 P2: trabalho interno DECLARADO (verbo forma-completa +
      // estatuto) é veto por si só — inclusivo com quant-hipotético no objeto
      // ("testar desconto de 10%", "validar dermatologicamente").
      if (sentencaEhTrabalhoInternoDeclarado(sentencaAoRedor(textoAnalisado, ex.inicio))) continue;
    if (sentencaMetalinguistica(ex.sentenca)) continue;
    if (sentencaEhSafeHarbor(ex.sentenca)) continue; // R6: porto-seguro por forma comprovável

    // R5 (unificado força+estatuto): metáfora narrativa pura via ANÁFORA
    // paralelística — figura de estilo determinística: dois ou mais
    // segmentos paralelos "uma X que ..., uma Y que ..." predicam a mesma
    // imagem. Não depende de lista léxica por payload; mantém veto para
    // qualquer marcador comercial (entidade/dígito/núcleo/população) e
    // exige que o único alinhamento com o Nível A seja fio tênue (1 stem).
    const RX_ANAFORA_DUPLA = /uma?\s+[\wÀ-ÿ]+\s+que\s+[^,;!.]{2,60}?[,;]\s+uma?\s+[\wÀ-ÿ]+\s+que\s+/i;
    const ehMetaforaNarrativa =
      RX_ANAFORA_DUPLA.test(ex.sentenca) &&
      ex.overlap <= 1 &&
      !RX_ENTIDADE_COMERCIAL.test(ex.sentenca) &&
      !/(?:client|usu[áa]ri|consumidor|paciente|aluno|assinante|doador|p[úu]blico|pessoas?|mulheres?|profission\w*|empresa?|nossa)\b/i.test(ex.sentenca) &&
      !/\d/.test(ex.sentenca) &&
      !RX_NUCLEO_MATERIAL_HARD.test(ex.sentenca);
    if (!ehMetaforaNarrativa && ex.forcaP > ex.forcaS) {
      // CP-01/P7: eco da MESMA faixa/marcador do suporte não é expansão
      // ("entre oito e dez" ≡ "aproximadamente 8 a 10") — a autorização
      // aberta integral cobre força/estatuto.
      if (autorizacaoAberta(ex.sentenca, textoAutoritativo)) continue;
      achados.push({
        categoria: "EXPANSAO_FORCA_SEMANTICA",
        trecho: corteTrecho(textoAnalisado, ex.inicio, 32),
        norma: "BLOQUEIO",
        porque:
          `força da afirmação (${ex.forcaP}) excede a força do suporte alinhado (${ex.forcaS}) — SPECIFIC AUTHORITY DOES NOT IMPLY BROADER AUTHORITY`,
      });
    }
    // R5 §14 (CP-08): TRANSFORMAÇÃO EPISTÊMICA de escopo sujeito.
  // "Uma cliente disse" → "Há evidência" sem prova de população.
  // O sistema investe: quantificação IMPOSSÍVEL sobre população ausente
  // no support predicado por gerador não é SAFE — qualifica.
  if (/\bhá\s+evid[êe]ncia\b|\btem[- ]se\s+evid[êe]ncia\b|\b[ée]\s+evid[êe]ncia\b|\bdemonstra\s+que\b|\bmostra\s+que\b/i.test(textoAnalisado)) {
    const suporteReduz = /\b(?:alguem|uma\s+(?:pessoa|cliente|dama|pessoa\w*)|algumas?|casos?\s+(?:espec[íi]ficos?|isolados?|de\s+in[íi]cio))\b/i.test(textoAutoritativo);
    const afirmaPopulacao = /\bhá\s+evid[êe]ncia\b|\b(?:resultados?\s+(?:mostram|indicam|demonstram|revelam))\b|\bafirma\s+que\b/i.test(textoAnalisado);
    if (afirmaPopulacao && !suporteReduz) {
      achados.push({
        categoria: "ESTATUTO_POPULACAO_SEM_SUPORTE",
        trecho: corteTrecho(textoAnalisado, 0, 40),
        norma: "QUALIFICAR",
        porque: "evidência/ação estabelecida AFIRMADA sobre população sem suporte de caso isolado → generalização sem prova (P4 I9/R4 RC-3)",
      });
    } else if (afirmaPopulacao) {
      // evidência afirmada — a citação literal é revista pelo ledger se houver
    }
  }

    if (!ehMetaforaNarrativa && ex.estadP !== undefined && ex.estadP > ex.estadS) {
      achados.push({
        categoria: "ESTATUTO_ELEVADO_SEM_SUPORTE",
        trecho: corteTrecho(textoAnalisado, ex.inicio, 32),
        norma: "QUALIFICAR",
        porque:
          `estatuto epistêmico da afirmação (${ex.estadP}) excede o do suporte alinhado (${ex.estadS}) — relato/hipótese/possibilidade NÃO autorizam fato/promessa/garantia`,
      });
    }
  }
  // 7) CLAIM LEDGER (CP-06 R3 + CP-07 R4): citação fabricada/fraca/sem-
  // suporte BLOQUEIA; cobertura auditável é OBRIGATÓRIA para famílias
  // WITNESS (autoridade externa/ranking/patente/registro).
  const achadosLedger = verificarClaimLedger(textoAnalisadoOriginal, textoAutoritativo);
  for (const al of achadosLedger) achados.push(al);
  const entradas = extrairClaimLedger(textoAnalisadoOriginal);
  // R5: consumo 1:1 (uma entrada no ledger não autoriza duplicata/super)
  const entradasUsadasLedger = new Map<unknown, Set<string>>();
  for (const e of entradas) entradasUsadasLedger.set(e, new Set());

  // 8) CLOSED CLAIM AUTHORITY (CP-07 RC-1) — FAIL CLOSED: sentença com
  // âncora material publicável sem âmbito/suporte no Nível A nem citação
  // validada no ledger → SEM_SUPORTE_IDENTIFICADO (nunca APROVADO silencio).
  for (const anc of ancorasMateriais(textoAnalisado)) {
    if (linhaRotuladaInterna(textoAnalisado, anc.inicio) && semMaterialComercialCP01(sentencaAoRedor(textoAnalisado, anc.inicio))
        && emancipacaoRotuloResisteCP01(sentencaAoRedor(textoAnalisado, anc.inicio))) continue; // CP-01 CA-F05
      // CP-01 P2: trabalho interno DECLARADO (verbo forma-completa +
      // estatuto) é veto por si só — inclusivo com quant-hipotético no objeto
      // ("testar desconto de 10%", "validar dermatologicamente").
      if (sentencaEhTrabalhoInternoDeclarado(sentencaAoRedor(textoAnalisado, anc.inicio))) continue;
    if (sentencaEhSafeHarbor(anc.sentenca) && !anc.witness) continue; // R6: witness nunca é dispensado
    // CP-01 (OB-C3): a família witness continua vedada a eco, mas INSTRUÇÃO
    // DE EXCLUSÃO ("nada de selo ou badge na arte") não reivindica a
    // credencial — a negação é vetor de SUPRESSÃO, não de autoridade.
    if (anc.witness && /^\s{0,24}(?:[A-ZÀ-Þ][\wÀ-ÿ ]{0,30}:\s*)?(?:[-–•*·]\s*)?(?:nada\s+de\s+|sem(?:\s+(?:o|a|um|uma)\b)?\s*(?:nenhum[as]?\s+)?)(?:selo\w*|badge\w*|certifica|homologa|aprova|registr|patente|iso|anvisa|inmetro|fda)/i.test(anc.sentenca)) {
      // MB-coerência: a instrução-exclusão resolve a autoridade aqui; marca
      // como FECHADA para que o open-world gate (estágio 9) a respeite.
      autorizadasFechadas.add(anc.sentenca);
      continue;
    }

    // R5: metalinguagem NÃO camufla família WITNESS — instrução vazada no
    // texto público sobre registro/aprovação segue sendo claim auditável.
    if (sentencaMetalinguistica(anc.sentenca) && !anc.witness) continue;
    const suportePorAmbito = autorizacaoComAmbito(textoAutoritativo, anc.sentenca, anc.temaRx, anc.temaFiltro ?? anc.temaRx) && suporteTemUnidadeFactual(textoAutoritativo, anc.temaRx);
    const entradaAlinhada = entradas.find((ent) => {
      const stemsC = new Set(stemsSignificativos(ent.claim).map(stemDe));
      const stemsP = new Set(stemsSignificativos(anc.sentenca).map(stemDe));
      let alinh = false;
      for (const a of stemsC) for (const b of stemsP) if (stemMatch(a, b)) { alinh = true; break; }
      return alinh;
    });
    // R5 (CP-08 RC-B): existência literal NÃO basta — o suporte precisa ser
    // RELEVANTE ao tema da âncora alinhada (fechamento da chave-mestra por
    // citação irrelevante: "salao"/"Briefing Havana"/"Tom acolhedor" não
    // autorizam "Aprovado pela ANVISA").
    const relevanciaDoSuporte = (entradaAlinhada
      ? (anc.temaFiltro ?? anc.temaRx).test(entradaAlinhada.suporte)
      : false);
    // R5: consumo 1:1 — uma entrada segura não autoriza REUSO para
    // outra âncora no mesmo texto (two-claims-one-entry era chave-mestra).
    const usadas = entradasUsadasLedger.get(entradaAlinhada);
    if (usadas && usadas.size > 0) {
      // R5: duas âncoras distintas consumindo A MESMA entrada = ledger
      // incompleto (citação única não cobre dois claims).
      achados.push({
        categoria: "LEDGER_INCOMPLETO", trecho: corteTrecho(textoAnalisado, anc.inicio, 32),
        norma: "QUALIFICAR",
        porque: "duas âncoras materiais distintas referenciam A MESMA entrada do Claim Ledger (consumo 1:1) — cobertura insuficiente",
      });
      continue;
    }
    const entradaValida =
      entradaAlinhada &&
      citacaoLiteral(entradaAlinhada.suporte, textoAutoritativo) &&
      relevanciaDoSuporte &&
      // R5: suporte hipotético/condicional não anScoriza fato
      estatutoEpistemico(entradaAlinhada.suporte) >= estatutoEpistemico(entradaAlinhada.claim) &&
      forcaSemantica(entradaAlinhada.claim) <= forcaSemantica(entradaAlinhada.suporte);
    if (suportePorAmbito || entradaValida) {
      autorizadasFechadas.add(anc.sentenca);
      // autoridade existe ── mas família WITNESS exige REGISTRO no ledger
      // (auditabilidade determinística: remoção do ledger precisa red).
      if (anc.witness) {
        if (entradas.length === 0) {
          achados.push({
            categoria: "LEDGER_AUSENTE", trecho: corteTrecho(textoAnalisado, anc.inicio, 32),
            norma: "QUALIFICAR",
            porque: `claim de autoridade externa/credibilidade (${anc.familia}) SEM representação no Claim Ledger — ausência de ledger não é estratégia de bypass`,
          });
        } else if (!entradaValida) {
          achados.push({
            categoria: "LEDGER_INCOMPLETO", trecho: corteTrecho(textoAnalisado, anc.inicio, 32),
            norma: "QUALIFICAR",
            porque: `claim witness (${anc.familia}) autorizado mas SEM entrada regístrada e válida no Claim Ledger (entrada precisa citar literal do Nível A com força suficiente)`,
          });
        }
        if (entradaValida && entradaAlinhada) {
          entradasUsadasLedger.get(entradaAlinhada)!.add(anc.familia);
        }
      }
    } else {
      achados.push({
        categoria: "SEM_SUPORTE_IDENTIFICADO", trecho: corteTrecho(textoAnalisado, anc.inicio, 32),
        norma: anc.norma,
        porque: `afirmação material (${anc.familia}) SEM autoridade verificável no Nível A e SEM citação auditável no Claim Ledger — fail-closed (não-APROVADO automático)`,
      });
      // R5 §17: ledger PRESENTE sem entrada alinhada = cobertura
      // incompleta — o claim está FORA do ledger declarado.
      if (entradas.length > 0 && !entradaAlinhada) {
        achados.push({
          categoria: "LEDGER_INCOMPLETO", trecho: corteTrecho(textoAnalisado, anc.inicio, 32),
          norma: "QUALIFICAR",
          porque: "afirmação material SEM entrada no Claim Ledger embora outras âncoras tenham ledger declarado — claim fora do ledger (cobertura incompleta)",
        });
      }
    }
  }

  // 5) RED TEAM (V16.b): possibilidade→certeza verbal ("pode ajudar a reduzir"→"reduz")
  for (const mv of modalidadeEstadoRemovida(textoAnalisado, textoAutoritativo)) {
    if (linhaRotuladaInterna(textoAnalisado, mv.inicio) && semMaterialComercialCP01(sentencaAoRedor(textoAnalisado, mv.inicio))
        && emancipacaoRotuloResisteCP01(sentencaAoRedor(textoAnalisado, mv.inicio))) continue; // CP-01 CA-F05
      // CP-01 P2: trabalho interno DECLARADO (verbo forma-completa +
      // estatuto) é veto por si só — inclusivo com quant-hipotético no objeto
      // ("testar desconto de 10%", "validar dermatologicamente").
      if (sentencaEhTrabalhoInternoDeclarado(sentencaAoRedor(textoAnalisado, mv.inicio))) continue;
    if (sentencaMetalinguistica(mv.sentenca)) continue;
    achados.push({
      categoria: "MODALIDADE_ESTADO_REMOVIDA",
      trecho: corteTrecho(textoAnalisado, mv.inicio, mv.verbo.length + 6),
      norma: "BLOQUEIO",
      porque:
        "habilitador de possibilidade removido: o Nível A licencia APENAS a forma modal ('pode ajudar a "+mv.verbo+"'); afirmar a forma direta é expansão de autoridade",
    });
  }

  // 9) OPEN-WORLD MATERIAL ASSERTION GATE (CP-08 RC-A) — a ÚLTIMA camada,
  // fail-closed: sentença pública COM predicação factual sobre entidade
  // comercial, SEM âncora conhecida, SEM autorização aberta no Nível A,
  // NÃO está em safe-harbor determinístico → INCERTEZA MATERIAL → REVISÃO.
  // Nunca depende de label autodeclarado (CRIATIVO/NAO-MATERIAL/METÁFORA).
  {
    const sentencas = sentencasDe(textoAnalisado).map((s) => s.trim()).filter((s) => s.length > 0);
    let cursor = 0;
    for (const s of sentencas) {
      const ini = textoAnalisado.indexOf(s, cursor);
      cursor = ini + s.length;
      if (linhaRotuladaInterna(textoAnalisado, ini)) {
        // CP-10 XR-3 / P2 / P9: o rótulo interno situa o ESTATUTO, mas NÃO
        // concede autoridade ao claim contido. Rótulo PURO segue suprimido
        // (I9); rótulo COM materialidade vira QUALIFICAR — nunca silêncio.
        if (!rotuloMarciaTrabalhoInterno(s) && (nucleoHardNaoNegado(s) || RX_POSSE_COMERCIAL.test(s) ||
            conteudoAssertivoEmbutido(s) || RX_QUANTIFICACAO_MATERIAL.test(s) ||
            temSinalMaterialCanalCP01(textoSemRotuloCP01(s)))) { // CP-01 CA-F05g
          achados.push({
            categoria: "ROTULO_COM_CLAIM_MATERIAL",
            trecho: corteTrecho(textoAnalisado, ini, 32),
            norma: "QUALIFICAR",
            porque:
              "rótulo interno (HIPÓTESE/SUGESTÃO/PENDENTE/CONDICIONAL) não autoriza o claim material contido — a embalagem sintática não cria autoridade (CP-10 XR-3; P2/P9); REVISÃO obrigatória antes de publicar",
          });
        }
        continue;
      }
      if (sentencaMetalinguistica(s)) continue;
      // R5: terminador preservado — sentença INTERROGATIVA não é asserção
      // ("o que mudaria se a escova durasse uma semana?" é pergunta, não
      // afirmação material).
      const sFull = s + (/^[.!?]/.test(textoAnalisado.slice(cursor)) ? textoAnalisado.slice(cursor, cursor + 1) : "");
      const aberto = detectarAssercaoMaterialAberta(sFull);
      if (!aberto) continue;
      // Já gera achado identificado? — mantém o mais severo (não duplica).
      if (achados.some((a) => a.trecho === corteTrecho(textoAnalisado, ini, 32))) continue;
      // Já AUTORIZADO por categoria Guard no mesmo texto: este não é terreno aberto.
      // B3.2 (CP-06 preservado): sentença cujas afirmações de AUSÊNCIA
      // têm TODAS suporte estrito no Nível A é ECO legítimo, não incerteza
      // material aberta — não duplica o estágio 2 (que já aprovou o eco).
      const ausencias = afirmacoesAusenciaAbsoluta(s);
      if (ausencias.length > 0 && ausencias.every((af) =>
        suporteAusenciaEstrito(textoAutoritativo, FAMILIAS_AUSENCIA.find((f) => f.chave === af.familia)!, af.grupo, af.stemAlvo)
      )) continue;
      const estaBattfecha = s.toLowerCase();
      let guardOk = false;
      for (const au of autorizadasRapidas) {
        if (au.toLowerCase() === estaBattfecha || au.toLowerCase().includes(estaBattfecha) || estaBattfecha.includes(au.toLowerCase())) { guardOk = true; break; }
      }
      if (!guardOk) for (const au of autorizadasFechadas) {
        if (au.toLowerCase() === estaBattfecha || au.toLowerCase().includes(estaBattfecha) || estaBattfecha.includes(au.toLowerCase())) { guardOk = true; break; }
      }
      if (guardOk) continue;
      if (autorizacaoAberta(s, textoAutoritativo)) continue;
      achados.push({
        categoria: "ASSERCAO_MATERIAL_ABERTA",
        trecho: corteTrecho(textoAnalisado, ini, 32),
        norma: "QUALIFICAR",
        porque:
          "incerteza material: predicação factual sobre entidade comercial (" + aberto.motivo + ") fora das famílias conhecidas e SEM autoridade aberta no Nível A — open-world gate, REVISÃO conservadora (não-APROVADO silencioso)",
      });
    }
    // 10) JANELA COMPOSICIONAL (CP-08 RC-C) — pares adjacentes do MESMO
    // bloco publicável (fronteira de sentença é do gerador, não do guardião).
    // R6 (CP-09 RC-1/RC-4): padrões composicionais ESPECÍFICOS avaliados
    // sobre janela de até 3 sentenças (2 diretas + 1 neutra intermediária).
    // O caminho GENÉRICO (redetecção do conjunto) só vale materialidade
    // NOVA: se a leitura material já existir em um fragmento isolado, o
    // estágio 9 (ou a autorização aberta) já a tratou — reinjetá-la no par
    // com texto inerte ao lado cria falso positivo ("Duração de até 90
    // dias." + "Análise interna." não é afirmação nova).
    const RX_MOTIVO_GENERICO = /^(?:POSSE|PREDICADO|QUANTIFICACAO|INDETERMINADO)_COMPOSTO$/;
    const parachute = (idxIni: number, motivo: string) => {
      achados.push({
        categoria: "COMPOSICAO_MATERIAL_" + motivo,
        trecho: corteTrecho(textoAnalisado, idxIni, 40),
        norma: "QUALIFICAR",
        porque:
          "predicação material montada por fragmentação de sentenças (" + motivo + "): cada fragmento parece inocente isolado; juntos formam claim material sem autoridade no Nível A",
      });
    };
    // reconstrói terminadores (estágio 9 preserva; aqui também — "— você
    // cortou?" é pergunta, não fragmento de claim).
    const sFullPar = (idx: number, ini: number): string =>
      sentencas[idx] + (/^[.!?]/.test(textoAnalisado.slice(ini + sentencas[idx].length))
        ? textoAnalisado.slice(ini + sentencas[idx].length, ini + sentencas[idx].length + 1) : "");
    for (let i = 0; i + 1 < sentencas.length; i++) {
      const iniPrimeira = textoAnalisado.indexOf(sentencas[i], 0);
      const iniSegTmp = textoAnalisado.indexOf(sentencas[i + 1], iniPrimeira + 1);
      const s1Full = sFullPar(i, iniPrimeira);
      const s2Full = sFullPar(i + 1, iniSegTmp);
      const comp = detectarComposicaoMaterial(s1Full, s2Full);
      // fragmento rotulado como trabalho interno não é tecido de afirmação
      if (linhaRotuladaInterna(textoAnalisado, iniPrimeira) && semMaterialComercialCP01(sentencaAoRedor(textoAnalisado, iniPrimeira))
        && emancipacaoRotuloResisteCP01(sentencaAoRedor(textoAnalisado, iniPrimeira))) continue; // CP-01 CA-F05
      // CP-01 P2: trabalho interno DECLARADO (verbo forma-completa +
      // estatuto) é veto por si só — inclusivo com quant-hipotético no objeto
      // ("testar desconto de 10%", "validar dermatologicamente").
      if (sentencaEhTrabalhoInternoDeclarado(sentencaAoRedor(textoAnalisado, iniPrimeira))) continue;
      const iniSegunda = textoAnalisado.indexOf(sentencas[i + 1], iniPrimeira + 1);
      if (linhaRotuladaInterna(textoAnalisado, iniSegunda) && semMaterialComercialCP01(sentencaAoRedor(textoAnalisado, iniSegunda))
        && emancipacaoRotuloResisteCP01(sentencaAoRedor(textoAnalisado, iniSegunda))) continue; // CP-01 CA-F05
      // CP-01 P2: trabalho interno DECLARADO (verbo forma-completa +
      // estatuto) é veto por si só — inclusivo com quant-hipotético no objeto
      // ("testar desconto de 10%", "validar dermatologicamente").
      if (sentencaEhTrabalhoInternoDeclarado(sentencaAoRedor(textoAnalisado, iniSegunda))) continue;
      if (comp && RX_MOTIVO_GENERICO.test(comp.motivo)) {
        // materialidade NOVA exigida no caminho genérico
        if (detectarAssercaoMaterialAberta(sentencas[i]) || detectarAssercaoMaterialAberta(sentencas[i + 1])) continue;
        if (autorizacaoAberta(sentencas[i], textoAutoritativo) || autorizacaoAberta(sentencas[i + 1], textoAutoritativo)) continue;
      }
      if (!comp) continue;
      const conj = sentencas[i] + " . " + sentencas[i + 1];
      if (autorizacaoAberta(conj, textoAutoritativo)) continue;
      parachute(iniPrimeira, comp.motivo);
    }
    // janela de 3: padrões específicos com fragmento neutro no meio
    // ("Seu dinheiro. / Sem perguntas. / De volta." — o atacante controla a
    // distância; o neutro não pode desarmar a leitura conjunta).
    for (let i = 0; i + 2 < sentencas.length; i++) {
      const iniPrimeira = textoAnalisado.indexOf(sentencas[i], 0);
      if (linhaRotuladaInterna(textoAnalisado, iniPrimeira) && semMaterialComercialCP01(sentencaAoRedor(textoAnalisado, iniPrimeira))
        && emancipacaoRotuloResisteCP01(sentencaAoRedor(textoAnalisado, iniPrimeira))) continue; // CP-01 CA-F05
      // CP-01 P2: trabalho interno DECLARADO (verbo forma-completa +
      // estatuto) é veto por si só — inclusivo com quant-hipotético no objeto
      // ("testar desconto de 10%", "validar dermatologicamente").
      if (sentencaEhTrabalhoInternoDeclarado(sentencaAoRedor(textoAnalisado, iniPrimeira))) continue;
      const iniMeio = textoAnalisado.indexOf(sentencas[i + 1], iniPrimeira + 1);
      if (linhaRotuladaInterna(textoAnalisado, iniMeio) && semMaterialComercialCP01(sentencaAoRedor(textoAnalisado, iniMeio))
        && emancipacaoRotuloResisteCP01(sentencaAoRedor(textoAnalisado, iniMeio))) continue; // CP-01 CA-F05
      // CP-01 P2: trabalho interno DECLARADO (verbo forma-completa +
      // estatuto) é veto por si só — inclusivo com quant-hipotético no objeto
      // ("testar desconto de 10%", "validar dermatologicamente").
      if (sentencaEhTrabalhoInternoDeclarado(sentencaAoRedor(textoAnalisado, iniMeio))) continue;
      const iniTerceira = textoAnalisado.indexOf(sentencas[i + 2], iniMeio + 1);
      if (linhaRotuladaInterna(textoAnalisado, iniTerceira) && semMaterialComercialCP01(sentencaAoRedor(textoAnalisado, iniTerceira))
        && emancipacaoRotuloResisteCP01(sentencaAoRedor(textoAnalisado, iniTerceira))) continue; // CP-01 CA-F05
      // CP-01 P2: trabalho interno DECLARADO (verbo forma-completa +
      // estatuto) é veto por si só — inclusivo com quant-hipotético no objeto
      // ("testar desconto de 10%", "validar dermatologicamente").
      if (sentencaEhTrabalhoInternoDeclarado(sentencaAoRedor(textoAnalisado, iniTerceira))) continue;
      // o fragmento do meio precisa ser inerte ao gate aberto (senão é
      // conteúdo material próprio, não "separador neutro").
      const meio = detectarAssercaoMaterialAberta(sentencas[i + 1]);
      if (meio) continue;
      const comp = detectarComposicaoMaterial(sentencas[i], sentencas[i + 2]);
      if (!comp || RX_MOTIVO_GENERICO.test(comp.motivo)) continue;
      const conj = sentencas[i] + " " + sentencas[i + 1] + " " + sentencas[i + 2];
      if (autorizacaoAberta(conj, textoAutoritativo)) continue;
      if (achados.some((x) => x.trecho === corteTrecho(textoAnalisado, iniPrimeira, 40))) continue;
      parachute(iniPrimeira, comp.motivo + "_JANELA3");
    }
  }

  // 11) R5 §14 — ESTATUTO/ESCOPO DO SUPORTE (CP-08): quando o Nível A
  // sustenta o tema APENAS como relato/caso/depoimento/teste interno
  // ("Uma cliente disse que gostou.", "Clientes relatam menos frizz.",
  // "Nosso teste interno foi positivo."), a peça NÃO pode reapresentar o
  // mesmo conteúdo como fato/efeito geral (depoimento→evidência,
  // relato→fato, um caso→geral, caso isolado→fatual, interno→independente).
  // Mecanismo de confronto suporte×peça (não regex-por-payload): marcador
  // de suporte limitado no briefing + sentença categórica alinhada na peça
  // (≥2 stems compartilhados, ou ≥1 stem + núcleo de prova/efeito, ou
  // cabeçalho de prova) SEM preservação do marcador de relato → REVISÃO.
  {
    const RX_SUPORTE_LIMITADO = /\b(?:depoiment\w*|relat(?:am|aram|ou|o|os|a|e)\b|relat\w+|disseram|disse|contou|contaram|testemunh\w*|uma?\s+(?:cliente|pessoa|consumidor[ao]?|paciente|usu[áa]ri[ao])\b|um\s+caso\b|casos?\s+(?:isolados?|espec[íi]ficos?)|teste\s+interno|pesquisa\s+interna|avalia[çc][ãa]o\s+interna|amostra\s+(?:interna|pequena|reduzida)|piloto\b|preliminar\w*)\b/i;
    const RX_NUCLEO_PROVA_EFEITO = /\b(?:evid[êe]nci\w*|valida[çc][ãa]o\w*|comprova[çc][ãa]o\w*|demonstra[çc][ãa]o\w*|diminu\w+|reduz\w+|elimin\w+|desaparec\w+|sumiu\b|some\b|aument\w+|melhor\w+|funciona\b|resultado\w*)\b/i;
    if (RX_SUPORTE_LIMITADO.test(textoAutoritativo)) {
      const stemsBrief = new Set(stemsSignificativos(textoAutoritativo).map(stemDe).filter((s) => !stemEhGenericoAberta(s)));
      let cursorRel = 0;
      for (const s of sentencasDe(textoAnalisado)) {
        const iniS = textoAnalisado.indexOf(s, cursorRel);
        cursorRel = iniS + s.length;
        const t = s.trim();
        if (!t) continue;
        if (linhaRotuladaInterna(textoAnalisado, iniS) && semMaterialComercialCP01(sentencaAoRedor(textoAnalisado, iniS))
        && emancipacaoRotuloResisteCP01(sentencaAoRedor(textoAnalisado, iniS))) continue; // CP-01 CA-F05
      // CP-01 P2: trabalho interno DECLARADO (verbo forma-completa +
      // estatuto) é veto por si só — inclusivo com quant-hipotético no objeto
      // ("testar desconto de 10%", "validar dermatologicamente").
      if (sentencaEhTrabalhoInternoDeclarado(sentencaAoRedor(textoAnalisado, iniS))) continue;
        if (sentencaMetalinguistica(t)) continue;
        if (/^[.!?]/.test(textoAnalisado.slice(cursorRel)) && textoAnalisado[cursorRel] === "?") continue; // interrogativa não é asserção
        if (/^\s*(?:vem|venha|gostou\b|aproveite|chame|ligue|compre|pe[çc]a|clique|saiba|descubra|fa[çc]a|experimente|garanta|corra|acesse|participe|assine|agende|visite|confira)\b/i.test(t)) continue; // CTA/imperativo
        // preservação do marcador de relato: a própria peça enquadra o
        // conteúdo como depoimento — uso honesto do suporte limitado.
        if (/\b(?:relat\w+|disseram|disse|depoiment\w*|segundo\b|diz(?:em)?\s+(?:que|a|o)|contam\b|conta\s+que)\b/i.test(t)) continue;
        const stemsS = new Set(stemsSignificativos(t).map(stemDe).filter((x) => !stemEhGenericoAberta(x)));
        let overlap = 0;
        for (const a of stemsS) for (const b of stemsBrief) if (stemMatch(a, b)) { overlap += 1; break; }
        const prova = RX_NUCLEO_PROVA_EFEITO.test(t);
        const cabecalhoProva = prova && /^(?:h[áa]|temos|existe|valida|estudo|teste|comprova|demonstr)/i.test(t);
        if (!(overlap >= 2 || (prova && overlap >= 1) || cabecalhoProva)) continue;
        if (achados.some((x) => x.trecho === corteTrecho(textoAnalisado, iniS, 32))) continue;
        achados.push({
          categoria: "ESTATUTO_SUPORTE_LIMITADO",
          trecho: corteTrecho(textoAnalisado, iniS, 32),
          norma: "QUALIFICAR",
          porque: "conteúdo sustentado no Nível A apenas como relato/caso/depoimento/teste interno, reapresentado na peça como fato/efeito geral (transformação depoimento→evidência, relato→fato, caso→geral, interno→independente)",
        });
      }
    }
  }

  // 3) Modalidade aproximada removida (possibilidade→certeza; faixa→exato)
  for (const mm of modalidadeAproximadaRemovida(textoAnalisado, textoAutoritativo)) {
    if (linhaRotuladaInterna(textoAnalisado, mm.inicio) && semMaterialComercialCP01(sentencaAoRedor(textoAnalisado, mm.inicio))
        && emancipacaoRotuloResisteCP01(sentencaAoRedor(textoAnalisado, mm.inicio))) continue; // CP-01 CA-F05
      // CP-01 P2: trabalho interno DECLARADO (verbo forma-completa +
      // estatuto) é veto por si só — inclusivo com quant-hipotético no objeto
      // ("testar desconto de 10%", "validar dermatologicamente").
      if (sentencaEhTrabalhoInternoDeclarado(sentencaAoRedor(textoAnalisado, mm.inicio))) continue;
    if (sentencaMetalinguistica(mm.sentenca)) continue;
    // CP-01/P4/P7: se a sentença é integralmente autorizada pelo Nível A
    // (mesma força, mesmo estatuto, mesma faixa — P4: o separador "; vs ."
    // do briefing não pode mudar a autoridade), não há modalidade removida.
    if (autorizacaoAberta(mm.sentenca, textoAutoritativo)) continue;
    achados.push({
      categoria: "MODALIDADE_APROXIMADA_REMOVIDA",
      trecho: corteTrecho(textoAnalisado, mm.inicio, mm.trecho.length),
      norma: "BLOQUEIO",
      porque:
        "qualificador material de aproximação/possibilidade/teto removido: faixa ou possibilidade do briefing virou valor exato garantido na peça",
    });
  }

  return achados;
}

/** P4.1: aviso NÃO-AUTORITATIVO carimbado no repasse interagentes quando o
 *  output contém claim material sem autorização. A criatividade segue fluindo
 *  (texto original íntegro), mas a AUTORIDADE não é herdada (I1/I4/I6). */
/** A varredura interagente (P4.1 I1/I4) roda sobre RAW ∪ PUBLIC e a janela
 *  de contexto pode atravessar delimitadores internos ecoados (transporte).
 *  O AVISO viaja no repasse N→N+1, onde delimitadores estruturais NUNCA
 *  podem aparecer (invariante P4.1.2 — higienizarRepasse; "CONTRATO_AGENTE
 *  id=" não vaza). Sanitiza SÓ o trecho exibido neste aviso — o bloco do
 *  Auditor (red team) continua vendo o trecho integral do RAW. Janelas
 *  truncam delimitadores no meio: cobre o par completo e caudas abertas. */
function sanitizarTrechoTransporte(trecho: string): string {
  return trecho
    .replace(/-{2,}\[(?:FIM:)?BLOCO:[^\]\n]*\](?:-{2,})?/g, "‹bloco-interno›")
    .replace(/-{2,}\[(?:FIM:)?BLOCO:[\s\S]*$/g, "‹bloco-interno›")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function montarAvisoInteragente(
  achados: readonly AchadoEpistemico[]
): string | null {
  if (achados.length === 0) return null;
  return [
    "ANOTAÇÃO AUTOMÁTICA DO GUARDIÃO (P4.1 — texto da máquina, NÃO é autorização nem fato):",
    "o output abaixo contém claim(s) material(is) SEM o valor/oferta correspondente no NÍVEL A.",
    "Situado como SUGESTÃO/HIPÓTESE não autoritativa: desenvolva SOMENTE de forma condicional",
    "(ex.: \"se aprovado comercialmente, ...\") ou rotulada na própria linha; NÃO apresente como",
    "oferta existente, preço, desconto, garantia, gratuidade, público confirmado ou fato.",
    ...achados.map((a) => `  - [${a.norma}] ${a.categoria}: "${sanitizarTrechoTransporte(a.trecho)}"`),
    "Repetição por agentes não cria autoridade (I1/I2); etiquetar como CONFIRMADO também não (I7).",
  ].join("\n");
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
