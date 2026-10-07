// src/lib/orquestrador/conformidade.ts — ARC-02B · P1 + P3
// ======================================================================
// P1 CONTEXT MINIMALITY — matriz de dependências EXPLÍCITA da cadeia.
//   Cada especialista recebe SOMENTE as etapas de que depende (fim do
//   repasse all-to-all). O Auditor (analista) é a ÚNICA etapa com visão
//   total — é o papel dele (P6): a TRILHA AUDITÁVEL (raw íntegro) segue
//   separada do WORKING CONTEXT e alimenta o gate determinístico.
//
// P3 CONTRACT FULFILLMENT — validação determinística, tolerante e
//   MÍNIMA por contrato (começando por AGT-009). Resposta tecnicamente
//   não-vazia ≠ contrato cumprido: "ok", eco de instrução e resposta
//   incompleta NÃO viram `concluido`. Zero custo: sem rede, sem LLM.
//
//   Tolerância: diacríticos ignorados, marcação markdown (**bold**),
//   prefixos de lista ("1." / "-" / "#"), espaçamento e caixa livres.
//   Mínimo: apenas as seções DECLARADAS no bloco SAÍDA do próprio
//   contrato — nada além é exigido (anti-falso-negativo).
//
// Invariantes: determinístico puro (I-14/15); nenhum texto é reescrito;
//   falha honesta C-17 (falso positivo estrutural NUNCA silenciado).
// ======================================================================

// ---------- P1 · Matriz de dependências (T1 — explícita) ----------
/**
 * Chave = persona consumidora; valor = ids de etapas cujo OUTPUT é
 * dependência necessária no WORKING CONTEXT. Quaisquer outros outputs
 * NÃO entram na cadeia (ficam só na trilha auditável do Auditor).
 *
 * Justificativa por aresta (também em 03_MAPA_DEPENDENCIAS.md):
 * - comportamento:    raiz — só briefing (Nível A) + guardas.
 * - estrategista:     [comportamento] — o gargalo/funil deriva das
 *                     tensões e hipóteses humanas levantadas.
 * - copywriter:       [comportamento, estrategista] — crença atual e
 *                     mudança vêm do mapa humano; mecanismo/prioridade
 *                     vêm da estratégia.
 * - diretor:          [copywriter] — o storyboard dirige a mensagem
 *                     vencedora (hooks/roteiro UGC escolhidos).
 * - engenheiro:       [diretor] — os prompts multimodais traduzem o
 *                     storyboard aprovado, cena a cena.
 * - analista:         TODAS — mandato de auditoria (P6). A trilha
 *                     auditável continua íntegra e NÃO passa pelo
 *                     working context dos especialistas.
 */
export const DEPENDENCIAS_ETAPAS: Readonly<Record<string, readonly string[]>> = {
  comportamento: [],
  estrategista: ["comportamento"],
  copywriter: ["comportamento", "estrategista"],
  diretor: ["copywriter"],
  engenheiro: ["diretor"],
  analista: ["comportamento", "estrategista", "copywriter", "diretor", "engenheiro"],
} as const;

/** Integridade estrutural da matriz (T1): toda dependência refere uma
 *  persona existente e a matriz é acíclica por construção (uí: a cadeia
 *  é sequencial — uma etapa só pode depender de anteriores). */
export function matrizDependenciasValida(idsEmOrdem: readonly string[]): boolean {
  for (const [consumidora, deps] of Object.entries(DEPENDENCIAS_ETAPAS)) {
    const idx = idsEmOrdem.indexOf(consumidora);
    if (idx < 0) return false;
    for (const dep of deps) {
      const idxDep = idsEmOrdem.indexOf(dep);
      if (idxDep < 0 || idxDep >= idx) return false; // inexistente ou FORWARD-edge
    }
  }
  return true;
}

// ---------- P3 · Verificador estrutural por contrato ----------

export interface SecaoContrato {
  /** Nome canônico exibido em mensagens honestas de não conformidade. */
  readonly nome: string;
  /** Regex já diacrítico-insensível sobre texto NORMALIZADO (upper). */
  readonly rx: RegExp;
}

/** Normalização tolerante única: NFD→strip diacríticos, remove marcação
 *  markdown simples (negrito/itálico), colapsa espaços — preserva quebras
 *  de linha (cabeçários de seção são validados por linha). Determinística. */
export function normalizarParaVerificacao(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\r/g, "")
    // feat: marcacao de negrito (pares ** e __) — se o interior nao acabar
    // em delimitador, devolve ":" (cabecalho-like real-world: "**CABECALHO**
    // conteudo" com negrito fazendo o delimitador). Conteudo tocado so no
    // fechamento do par; ":" nao e letra, nao afeta medicao de substancia.
    .replace(/\*\*([^*\n]+)\*\*/g, (_m, inner: string) => (/[:\u2013\u2014-]\s*$/.test(inner) ? inner : inner + ":"))
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/__([^_\n]+)__/g, (_m, inner: string) => (/[:\u2013\u2014-]\s*$/.test(inner) ? inner : inner + ":"))
    .replace(/_([^_\n]+)_/g, "$1")
    .replace(/[ \t]+/g, " ")
    .toUpperCase();
}

/** ARC-02B.2 · REAL-WORLD TOLERANT CONTRACT (H3, causa-raiz comprovada):
 *  o ":" final do cabeçalho deixa de ser OBRIGATÓRIO — mas SÓ quando o
 *  cabeçalho encerra a linha (`MAPA DO CONTEXTO\n`). Com conteúdo INLINE
 *  na mesma linha, exige-se delimitador — `:` ou travessão `—/–/-` idioma-
 *  grafo real de LLM (`SEÇÃO: conteúdo` / `SEÇÃO — conteúdo`). Assim:
 *   · formas reais de LLM ("**SEÇÃO**", "## SEÇÃO", "1. SEÇÃO", a seção
 *     pura numa linha, com/sem dois-pontos, prefixo emoji/símbolo) funcionam;
 *   · prosa que apenas COMEÇA com o nome da seção ("MAPA DO CONTEXTO é...")
 *     NÃO vira cabeçalho (fronteira determinística conservada);
 *   · rejeição de vazio/"-" /lixo permanece a cargo da SUBSTÂNCIA mínima
 *     pós-cabeçalho (ARC-02B.1 · A-03) — cabeçalho ≠ entrega.
 *  Prefixo aceito: marcadores markdown/lista, numeração, parênteses e
 *  símbolos Unicode (emoji) — tudo que NÃO é letra, antes do nome. */
function rxSecao(asciiPattern: string): RegExp {
  return rxCabecalho(asciiPattern.replace(/ /g, "\\s+"));
}

/** Cabeçalho tolerante (ARC-02B.2) a partir de um NÚCLEO regex já ASCII. */
function rxCabecalho(core: string): RegExp {
  return new RegExp(
    `(^|\\n)[#>*\\-\\u2022\\d. )\\p{S}]*${core}` +
      `(?:[ \\t]*[:\\u2013\\u2014-]|[ \\t]*(?=\\n|$))`,
    "mu"
  );
}

/** As seções derivam DO PRÓPRIO bloco SAÍDA: de cada contrato (verbatim
 *  em src/lib/agentes/pipeline.ts). RG only exige o que o contrato declara. */
const SECOES: Readonly<Record<string, readonly SecaoContrato[]>> = {
  comportamento: [
    { nome: "MAPA DO CONTEXTO", rx: rxSecao("MAPA DO CONTEXTO") },
    { nome: "TENSÕES HUMANAS", rx: rxSecao("TENSOES HUMANAS") },
    { nome: "HIPÓTESES DE COMPORTAMENTO", rx: rxSecao("HIPOTESES DE COMPORTAMENTO") },
    { nome: "IMPLICAÇÕES DE COMUNICAÇÃO", rx: rxSecao("IMPLICACOES DE COMUNICACAO") },
    { nome: "FILTRO ÉTICO", rx: rxSecao("FILTRO ETICO") },
    { nome: "PRÓXIMO PASSO", rx: rxSecao("PROXIMO PASSO") },
  ],
  estrategista: [
    { nome: "OBJETIVO E RESTRIÇÕES", rx: rxSecao("OBJETIVO E RESTRICOES") },
    { nome: "DIAGNÓSTICO DO FUNIL", rx: rxSecao("DIAGNOSTICO DO FUNIL") },
    { nome: "MÉTRICA-MESTRE", rx: rxCabecalho("METRICA\\s*[-\\u2013\\u2014]\\s*MESTRE") },
    { nome: "HIPÓTESES DE CRESCIMENTO", rx: rxSecao("HIPOTESES DE CRESCIMENTO") },
    { nome: "PRIORIDADE", rx: rxSecao("PRIORIDADE") },
    { nome: "PLANO DE TESTE", rx: rxSecao("PLANO DE TESTE") },
    { nome: "PRÓXIMO PASSO", rx: rxSecao("PROXIMO PASSO") },
  ],
  copywriter: [
    { nome: "DIAGNÓSTICO", rx: rxSecao("DIAGNOSTICO") },
    { nome: "MUDANÇA DE CRENÇA", rx: rxSecao("MUDANCA DE CRENCA") },
    { nome: "HOOKS (5)", rx: rxCabecalho("HOOKS\\s*\\(\\s*5\\s*\\)") },
    { nome: "HEADLINES (3)", rx: rxCabecalho("HEADLINES\\s*\\(\\s*3\\s*\\)") },
    { nome: "CTAS (3)", rx: rxCabecalho("CTAS\\s*\\(\\s*3\\s*\\)") },
    { nome: "ROTEIRO UGC", rx: rxSecao("ROTEIRO UGC") },
    { nome: "MAIS FORTE", rx: rxSecao("MAIS FORTE") },
    { nome: "PONTOS A VALIDAR", rx: rxSecao("PONTOS A VALIDAR") },
  ],
  diretor: [
    { nome: "OBJETIVO E HIPÓTESE", rx: rxSecao("OBJETIVO E HIPOTESE") },
    { nome: "CONCEITOS", rx: rxSecao("CONCEITOS") },
    { nome: "DIREÇÃO ESCOLHIDA", rx: rxSecao("DIRECAO ESCOLHIDA") },
    { nome: "STORYBOARD", rx: rxSecao("STORYBOARD") },
    { nome: "CONTINUIDADE E PRODUÇÃO", rx: rxSecao("CONTINUIDADE E PRODUCAO") },
    { nome: "PONTOS A VALIDAR", rx: rxSecao("PONTOS A VALIDAR") },
  ],
  engenheiro: [
    { nome: "PROMPT PT-BR", rx: rxSecao("PROMPT PT-BR") },
    { nome: "PROMPT IN ENGLISH", rx: rxSecao("PROMPT IN ENGLISH") },
    // RESTRIÇÕES/NEGATIVO é condicional no próprio contrato ("somente
    // quando útil") — NÃO é exigida (mínimo do contrato).
  ],
  analista: [
    // NOTA: X/10 é o hard contract preexistente (parser em pipeline.ts) —
    // verificada aqui como requisito de conclusão; o caso "STATUS: NÃO
    // AVALIADO — DADOS INSUFICIENTES" (sancionado pelo contrato) é
    // tratado como cumprimento alternativo legítimo.
    { nome: "NOTA: X/10", rx: /(^|\n)[#>*\-•\d. )]*NOTA[ \t]*:[ \t]*\d{1,2}([.,]\d+)?/m },
    { nome: "JUSTIFICATIVA", rx: rxSecao("JUSTIFICATIVA") },
    { nome: "OBJETO E LIMITE", rx: rxSecao("OBJETO E LIMITE") },
    { nome: "CRITÉRIOS", rx: rxSecao("CRITERIOS") },
    { nome: "CORREÇÕES PRIORITÁRIAS", rx: rxSecao("CORRECOES PRIORITARIAS") },
    { nome: "VEREDITO", rx: rxSecao("VEREDITO") },
  ],
} as const;

/** Marcador sancionado pelo próprio AGT-012 para material não avaliável. */
const RX_ANALISTA_NAO_AVALIADO = /STATUS\s*:\s*NAO AVALIADO/;

// ---------- ARC-02B.1 · A-03 — SUBSTÂNCIA MÍNIMA PÓS-CABEÇALHO (R6–R9) ----------
// Presença de cabeçalho ≠ entrega. Para CADA seção obrigatória, o conteúdo
// entre o seu cabeçalho e o próximo (ou EOF) precisa de ENTREGA substantiva
// MÍNIMA, provada deterministicamente — sem LLM, sem semântica pesada:
//   · MIN_LETRAS_SECAO letras UNICODE (rejeita: vazio, whitespace, pontuação,
//     somente marcador/lista, traço);
//   · razão de vogais ≥ RAZAO_VOGAL_MIN (rejeita lixo trivial de teclado
//     tipo "asdf qwer", PT/EN reais — mesmo telegráficos — são vocálicos).
// Exceção: "NOTA: X/10" é marcador de hard-contract — a entrega dela é o
// próprio número (não se exige prosa ao redor).
const MIN_LETRAS_SECAO = 8;
const RAZAO_VOGAL_MIN = 0.25;
/** Nº de letras (Unicode) examinadas para a razão de vogais — medida na
 *  cabeça do conteúdo, não no inteiro (preenchedores longos não mascaram). */
const JANELA_LETRAS = 24;
const RX_LETRA = /[\p{L}]/gu;
const RX_VOGAL = /[aeiouáéíóúâêîôûãõàèìòù]/giu;

/** Seções cujo conteúdo é marcador por contrato — isentas de substância. */
const SECOES_ISENTAS_SUBSTANCIA = new Set(["NOTA: X/10"]);

interface LocalizacaoSecao {
  readonly nome: string;
  /** índice do INÍCIO do cabeçalho no texto normalizado */
  readonly inicio: number;
  /** índice do FIM do cabeçalho (início do conteúdo) no texto normalizado */
  readonly inicioConteudo: number;
}

/** Localiza (em `norm`, já normalizado) cada seção presente (1ª ocorrência);
 *  retorna ordenado por posição no texto. */
function localizarSecoes(norm: string, secoes: readonly SecaoContrato[]): LocalizacaoSecao[] {
  const achados: LocalizacaoSecao[] = [];
  for (const s of secoes) {
    const m = s.rx.exec(norm);
    if (m) {
      achados.push({ nome: s.nome, inicio: m.index, inicioConteudo: m.index + m[0].length });
    }
  }
  achados.sort((a, b) => a.inicio - b.inicio);
  return achados;
}

/** Lista as seções PRESENTES cujo conteúdo falta substância mínima:
 *  conteúdo = texto entre o fim do cabeçalho próprio e o INÍCIO do
 *  cabeçalho seguinte (exato, independente do conteúdo). */
function secoesSemSubstancia(
  norm: string,
  localizadas: readonly LocalizacaoSecao[]
): string[] {
  const vazias: string[] = [];
  for (let i = 0; i < localizadas.length; i += 1) {
    const sec = localizadas[i];
    if (SECOES_ISENTAS_SUBSTANCIA.has(sec.nome)) continue;
    const fim = i + 1 < localizadas.length ? localizadas[i + 1].inicio : norm.length;
    const trecho = norm.slice(sec.inicioConteudo, fim);
    const letrasArr = trecho.match(RX_LETRA) ?? [];
    const letras = letrasArr.length;
    // Razão de vogais medida na JANELA inicial das letras (não no inteiro):
    // seção legítima pode conter preenchimento estrutural longo; lixo
    // determinínistico ("asdf qwer") falha já na janela inicial. Só o começo
    // importa — prosa real abre com prosa real.
    const janela = letrasArr.slice(0, JANELA_LETRAS).join(" ");
    const vogais = (janela.match(RX_VOGAL) ?? []).length;
    const temSubstancia = letras >= MIN_LETRAS_SECAO && vogais >= Math.ceil(Math.min(letras, JANELA_LETRAS) * RAZAO_VOGAL_MIN);
    if (!temSubstancia) vazias.push(sec.nome);
  }
  return vazias;
}

export interface VeredictoConformidade {
  readonly conforme: boolean;
  /** "eco" | "secoes-faltantes" | "secoes-vazias" | null */
  readonly motivo: "eco" | "secoes-faltantes" | "secoes-vazias" | null;
  /** Seções ausentes (rótulos canônicos do contrato) — mensagem honesta. */
  readonly faltam: readonly string[];
  /** true quando a resposta é eco da instrução (contrato repetido). */
  readonly ecoDetectado: boolean;
}

/** Detecta eco de instrução de forma GENERALIZADA por contrato:
 *  (a) a linha de papel do contrato (1ª frase, "Você é …") aparece na
 *      resposta — nenhuma entrega real repete o mandato;
 *  (b) marcadores de CONSTRUÇÃO do contrato ("MÉTODO:" / "REGRAS:" +
 *      "SAÍDA:") — estrutura interna que nunca habita a entrega. */
export function detectarEcoDeInstrucao(contrato: string, texto: string): boolean {
  const contratoNorm = normalizarParaVerificacao(contrato);
  const textoNorm = normalizarParaVerificacao(texto);
  const linhaPapel = contratoNorm.split("\n")[0].trim();
  // última parte da 1ª frase pós "VOCÊ É" — robusta a reencadeamentos
  const papel = linhaPapel.length >= 40 ? linhaPapel.slice(0, 80) : linhaPapel;
  if (papel.length >= 20 && textoNorm.includes(papel)) return true;
  const temConstrucao = /(^|\n)\s*(METODO|REGRAS|FORMATO)[ \t]*:/m.test(textoNorm);
  const temCabSaida = /(^|\n)\s*(FORMATO )?(OBRIGATORIO )?(DE )?SAIDA[ \t]*:/m.test(textoNorm);
  if (temConstrucao && temCabSaida) return true;
  void contratoNorm;
  return false;
}

/**
 * Veredito mínimo do contrato para `personaId`.
 * Invariante: NUNCA marca conforme com base em "texto não-vazio".
 * Personas sem tabela caem na regra estrita "texto com conteúdo mínimo"
 * — nesta cadeia todas as 6 possuem tabela (erro de configuração seria
 * erro de programação, não silenciado: retorna NÃO conforme com motivo).
 */
export function verificarConformidadeContrato(
  personaId: string,
  contrato: string,
  texto: string
): VeredictoConformidade {
  if (typeof texto !== "string" || texto.trim() === "") {
    return { conforme: false, motivo: "secoes-faltantes", faltam: ["(texto vazio)"], ecoDetectado: false };
  }
  const secoes = SECOES[personaId];
  if (!secoes) {
    return { conforme: false, motivo: "secoes-faltantes", faltam: [`(sem tabela de contrato para ${personaId})`], ecoDetectado: false };
  }
  if (detectarEcoDeInstrucao(contrato, texto)) {
    return { conforme: false, motivo: "eco", faltam: [], ecoDetectado: true };
  }
  // Caso legítimo sancionado pelo AGT-012: auditoria impossível declarada.
  if (personaId === "analista" && RX_ANALISTA_NAO_AVALIADO.test(normalizarParaVerificacao(texto))) {
    return { conforme: true, motivo: null, faltam: [], ecoDetectado: false };
  }
  const norm = normalizarParaVerificacao(texto);
  const faltam = secoes.filter((s) => !s.rx.test(norm)).map((s) => s.nome);
  if (faltam.length > 0) {
    return { conforme: false, motivo: "secoes-faltantes", faltam, ecoDetectado: false };
  }
  // ARC-02B.1 · A-03: todos os cabeçalhos presentes — agora EXIGE substância
  // mínima em cada seção obrigatória (vazio/whitespace/pontuação/marcador/
  // lixo trivial = fora do contrato; ver constantes acima).
  const vazias = secoesSemSubstancia(norm, localizarSecoes(norm, secoes));
  if (vazias.length > 0) {
    return { conforme: false, motivo: "secoes-vazias", faltam: vazias, ecoDetectado: false };
  }
  return { conforme: true, motivo: null, faltam: [], ecoDetectado: false };
}