// src/lib/imagem/nucleo-qualidade.ts — CP-01B · FND-04 v2 + ARQ-6
// ======================================================================
// Núcleo universal SEGURO de qualidade de imagem + finalização DETERMINÍSTICA
// do prompt enviado aos geradores (FLUX/SDXL/Cloudflare).
//
// FONTE AUTORIZADA: uploads/CP-01-B-... (ficha FND-04 v2). A ficha avisa:
// NÃO aplicar "only when not explicitly requested" como linguagem dentro
// de uma string universal — o código precisa saber a intenção. Este módulo
// é exatamente essa tradução para código:
//   A) núcleo universal seguro, sempre igual;
//   B) NÃO nega logo/texto quando o usuário pediu (detectarIntencao);
//   C) negativas específicas que contradizem a intenção são omitidas;
//   D) dedup DETERMINÍSTICO por frase normalizada (sem LLM adicional);
//   E) zero efeitos colaterais: puro, síncrono, testável offline.
//
// Deliberação de escopo (verdade sobre a cadeia real):
//   - O AGT-017 (otimizador LLM) já recebe regra "never duplicate" no v2.
//   - O caminho "elite já bom" (>=30 palavras + photorealistic) era
//     CONTRATO DO PRODUTO preservar 100% — mantido sem suffix.
//   - Este finalizador roda no texto OTIMIZADO e no FALLBACK original:
//     se nada faltar, nada é anexado (dedup por contenção).

/** Núcleo universal: boosters seguros independentes de intenção. */
export const NUCLEO_QUALIDADE_IMAGEM =
  "photorealistic photo, natural lighting, clean professional commercial image, " +
  "sharp focus, highly detailed, coherent materials and realistic texture";

/** Negativas anti-erro estrutural (SEMPRE seguras, qualquer intenção). */
export const NEGATIVAS_ESTRUTURAIS = [
  "no watermark",
  "no blurry image",
  "no deformed anatomy",
  "no extra fingers",
] as const;

/** Negativas de conteúdo: só valem quando NÃO contradizem o pedido. */
export const NEGATIVA_TEXTO_NAO_SOLICITADO = "no unintended letters or words";

export interface IntencaoImagem {
  readonly pediuTexto: boolean;
  readonly pediuLogo: boolean;
}

/** Detecção DETERMINÍSTICA de intenção (lexical, EN + PT).
 *  Conservadora: em dúvida, tende a NÃO negar (falso "pediu" é melhor
 *  que negar um pedido real — C-01 verdade operacional com o usuário). */
export function detectarIntencao(promptOriginal: string): IntencaoImagem {
  const t = promptOriginal.toLowerCase();
  const pediuTexto =
    /\b(text(texto|o)?|words?|letters?|lettering|typograph\w*|phrase|saying|quote|headline|title|slogan|escrit[oa]s?|letras?|frase)\b/.test(
      t
    ) ||
    /text in (the )?(image|photo|picture)/.test(t) ||
    /with the (text|words|phrase)/.test(t);
  const pediuLogo = /\b(logo(marca|type)?\w*|brand ?mark|wordmark)\b/.test(t);
  return { pediuTexto, pediuLogo };
}

/** Normalização para comparação de frases (dedup determinístico). */
function normalizar(frase: string): string {
  return frase
    .toLowerCase()
    .replace(/[.,;:!?"'()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Frase presente? Contenção por string normalizada (determinística). */
function contem(base: string, termo: string): boolean {
  const b = normalizar(base);
  const n = normalizar(termo);
  if (!n) return true;
  return b.includes(n);
}

/**
 * Monta o prompt FINAL enviado ao gerador:
 *  1. parte do texto base (otimizado pelo AGT-017 ou fallback original);
 *  2. anexa do NÚCLEO somente as frases que ainda NÃO constam;
 *  3. anexa NEGATIVAS_ESTRUTURAIS idem;
 *  4. anexa NEGATIVA_TEXTO_NAO_SOLICITADO somente se a intenção não
 *     pedir texto nem logo;
 *  5. remove frases contraditórias "no text/no logo/without text/…"
 *     quando o usuário explicitamente pediu texto ou logo (FND-04 §C).
 *  Saída permanece UM PARÁGRAFO (contrato da cadeia de imagem).
 */
export function montarPromptFinalImagem(
  textoBase: string,
  promptOriginal: string,
  intencao?: IntencaoImagem
): string {
  const int = intencao ?? detectarIntencao(promptOriginal);

  let base = textoBase.trim().replace(/\s+/g, " ");
  if (int.pediuTexto || int.pediuLogo) {
    // FND-04 §C: negativa que contradiz pedido explícito sai do base.
    const padroes = int.pediuTexto
      ? [/\bwithout (any )?(text|letters|words)\b/gi, /\bno (text|letters|words)\b/gi]
      : [/\bwithout (any )?logo\b/gi, /\bno logo\b/gi];
    for (const padrao of padroes) {
      base = base.replace(padrao, "").replace(/\s{2,}/g, " ").trim();
    }
    base = base.replace(/,\s*,/g, ",").replace(/,\s*$/, "").trim();
  }

  const faltantes: string[] = [];
  for (const termo of NUCLEO_QUALIDADE_IMAGEM.split(",").map((t) => t.trim())) {
    if (!contem(base, termo)) faltantes.push(termo);
  }
  for (const negativa of NEGATIVAS_ESTRUTURAIS) {
    if (!contem(base, negativa)) faltantes.push(negativa);
  }
  if (!int.pediuTexto && !int.pediuLogo) {
    if (!contem(base, NEGATIVA_TEXTO_NAO_SOLICITADO)) {
      faltantes.push(NEGATIVA_TEXTO_NAO_SOLICITADO);
    }
  }

  if (faltantes.length === 0) return base;
  const baseComVirgula = base.endsWith(",") || base.endsWith(".") ? base : `${base},`;
  return `${baseComVirgula} ${faltantes.join(", ")}`;
}
