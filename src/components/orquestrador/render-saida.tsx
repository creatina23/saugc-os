// src/components/orquestrador/render-saida.tsx — CP-01 P4.1.2 (OUTPUT PRESENTATION)
// ======================================================================
// Apresentação RICA e SEGURA das saídas do Orquestrador.
//
// GARANTIAS DURAS (§18–§25 da missão P4.1.2):
// - ZERO dangerouslySetInnerHTML / rehype-raw / HTML cru: texto do modelo
//   é NÃO-CONFIÁVEL; tudo passa por React com escape automático (XSS-safe
//   por construção).
// - Subset Markdown conversível: títulos (#/##/###), negrito, itálico,
//   listas - e 1., separadores (---/===), `código` inline, citação (>).
// - ESCAPES pré-processados (\*, \-, \_, \\, \`, \[ \] \# \>) — o lixo de
//   escape do provider ("DADO\_AUTORIZADO", "\---") renderiza legível.
// - OVERFLOW obrigatório: container com min-w-0/max-w-full/break-words +
//   overflow-wrap:anywhere; código inline quebra (overflow-x seguro).
//   Nenhuma barra horizontal além do previsto; nada escondido por CSS.
// - EMOJIS EXISTEM SÓ NA APRESENTAÇÃO: mapeamento explícito keyword→emoji
//   neste arquivo; texto persistido/repassado permanece igual.
// - Material interno delimitado (---[BLOCO:*]--- vindos de execuções
//   antigas/ecos) NÃO é apagado: é RECOLHÍVEL (🔧) — o usuário decide se
//   quer ver o transporte; nada some silenciosamente.
// - Labels epistêmicos ([FATO]/[HIPÓTESE]/[SUGESTÃO]/[PENDENTE]/[BLOQUEIO])
//   viram badges visuais. SEM criar rótulos novos — só os cinco existentes.
// - Botão "Copiar" com feedback imediato ("Copiado!").
//
// Parser PURO e determinístico (parseSaida/parseInline abaixo são exportados
// e testados pelo harness T35–T43 — o componente só mapeia o AST).
// ======================================================================

"use client";

import { useState } from "react";

// ---------- 1) Escapes (sentinelas Unicode do Plano Privado) ----------

/** Marca `\X` (X no conjunto escapável) como char privado U+E000+code;
 *  assim os padrões Markdown NÃO casam com o que era literal. */
export function protegerEscapes(texto: string): string {
  return texto.replace(/\\([\\`*_\-\[\]#>])/g, (_m, ch: string) =>
    String.fromCodePoint(0xe000 + ch.codePointAt(0)!)
  );
}

/** Desfaz as sentinelas devolvendo o caractere escapado como LITERAL. */
export function restaurarEscapes(texto: string): string {
  return texto.replace(/[\uE000-\uE0FF]/g, (ch) =>
    String.fromCodePoint(ch.codePointAt(0)! - 0xe000)
  );
}

// ---------- 2) Segmentação estrutural (bloco interno ⇄ texto) ----------

/** Delimitadores EXATOS do compositor (qualquer rótulo — inclui salvaguarda
 *  contra saídas legadas que ecoaram o transporte). */
const RX_BLOCO_INTERNO =
  /---\[BLOCO:([^\]\r\n]+)\]---\r?\n?[\s\S]*?\n?---\[FIM:BLOCO:\1\]---/g;
const RX_ABERTURA_INTERNA = /---\[BLOCO:([^\]\r\n]+)\]---/g;

export type CategoriaRotulo =
  | "FATO"
  | "HIPÓTESE"
  | "SUGESTÃO"
  | "PENDENTE"
  | "BLOQUEIO";

export type SegmentoSaida =
  | { tipo: "interno"; rotulo: string; conteudo: string; fechado: boolean }
  | { tipo: "titulo"; nivel: 1 | 2 | 3; texto: string }
  | { tipo: "rotulo"; categoria: CategoriaRotulo; texto: string }
  | { tipo: "item"; ordenado: boolean; texto: string }
  | { tipo: "citacao"; texto: string }
  | { tipo: "divisor" }
  | { tipo: "paragrafo"; texto: string };

const MAPA_ROTULOS: Record<string, CategoriaRotulo> = {
  FATO: "FATO",
  "HIPÓTESE": "HIPÓTESE",
  HIPOTESE: "HIPÓTESE",
  "SUGESTÃO": "SUGESTÃO",
  SUGESTAO: "SUGESTÃO",
  PENDENTE: "PENDENTE",
  BLOQUEIO: "BLOQUEIO",
};

/** Linhas de label epistêmico (APENAS os 5 rótulos do sistema):
 *  `[FATO]: texto` · `🧪 [HIPÓTESE] texto` · `FATO: texto` · `🚨 BLOQUEIO: texto`.
 *  Colchetes OU emoji+dows-pontos/traço exigidos — um parágrafo comum que
 *  comece com essas palavras NÃO vira badge por acidente. */
const RX_EMOJI_PREFIX = "(?:\\p{Extended_Pictographic}\\uFE0F?\\s*)*";
const RX_ROTULO_COLCHETE = new RegExp(
  `^\\s*${RX_EMOJI_PREFIX}\\[\\s*(FATO|HIP[ÓO]TESE|SUGEST[ÃA]O|PENDENTE|BLOQUEIO)\\s*\\]\\s*[:\-–—]?\\s*(.+)?$`,
  "iu"
);
const RX_ROTULO_SIMPLES = new RegExp(
  `^\\s*${RX_EMOJI_PREFIX}(FATO|HIP[ÓO]TESE|SUGEST[ÃA]O|PENDENTE|BLOQUEIO)\\s*[:\-–—]\\s*(.+)$`,
  "iu"
);

const RX_EMOJI_INICIAL =
  /^(?:\p{Extended_Pictographic}|\p{Emoji_Component}|\uFE0F |[\u200D])+\s*/u;

function fatiarBlocoInterno(texto: string): (string | SegmentoSaida)[] {
  const partes: (string | SegmentoSaida)[] = [];
  let ultimo = 0;
  RX_BLOCO_INTERNO.lastIndex = 0;
  let m: RegExpExecArray | null;
  const fechados: RegExpExecArray[] = [];
  while ((m = RX_BLOCO_INTERNO.exec(texto)) !== null) {
    fechados.push(m);
  }
  for (const f of fechados) {
    if (f.index > ultimo) partes.push(texto.slice(ultimo, f.index));
    partes.push({
      tipo: "interno",
      rotulo: f[1].trim(),
      conteudo: f[0],
      fechado: true,
    });
    ultimo = f.index + f[0].length;
  }
  partes.push(texto.slice(ultimo));
  return partes;
}

/** Abertura solta SEM fechamento confiável → segmento interno "aberto"
 *  (preservado integralmente, colapsável com aviso honesto). */
function fatiarAberturaSolta(texto: string): (string | SegmentoSaida)[] {
  const partes: (string | SegmentoSaida)[] = [];
  let ultimo = 0;
  RX_ABERTURA_INTERNA.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RX_ABERTURA_INTERNA.exec(texto)) !== null) {
    if (m.index > ultimo) partes.push(texto.slice(ultimo, m.index));
    // o bloco sem fim vai até a próxima linha em branco dupla ou EOF
    const resto = texto.slice(m.index);
    const fimBloco = resto.indexOf("\n\n\n");
    const fim = fimBloco === -1 ? resto.length : fimBloco;
    partes.push({
      tipo: "interno",
      rotulo: m[1].trim(),
      conteudo: resto.slice(0, fim),
      fechado: false,
    });
    ultimo = m.index + fim;
  }
  partes.push(texto.slice(ultimo));
  return partes;
}

// ---------- 3) Emojis de apresentação por keyword (explícito; §21) ----------

const SINONIMOS: readonly (readonly [RegExp, string])[] = [
  [/resumo|sum[aá]rio/i, "📋"],
  [/estrat[eé]gia|plano|prioriza/i, "🎯"],
  [/ideia|criativ|conceito/i, "💡"],
  [/canal|distribui/i, "📣"],
  [/risco|amea[çc]a|cuidado|alerta/i, "⚠️"],
  [/veredito|auditoria|nota|revis[aã]o|qualidade/i, "🔍"],
  [/persona|p[uú]blico|audi[êe]ncia|consumidor/i, "👥"],
  [/copy|roteiro|texto|legenda|an[uú]ncio/i, "✍️"],
  [/storyboard|cena|v[íi]deo|ugc|audiovisual/i, "🎬"],
  [/prompt|imagem|visual/i, "🖼️"],
  [/hip[óo]tese/i, "🧪"],
  [/m[eé]trica|dado|evid[êe]ncia|n[úu]mero/i, "📊"],
  [/pr[óo]ximo|a[çc][ãa]o|execu[çc][ãa]o/i, "🚀"],
  [/conclus[aã]o|final|encerramento/i, "🏁"],
];

export function emojiDeCategoria(rotulo: string): string | null {
  for (const [padrao, emoji] of SINONIMOS) {
    if (padrao.test(rotulo)) return emoji;
  }
  return null;
}

// ---------- 4) Parser linha-a-linha do subset Markdown ----------

const RX_TITULO = /^\s{0,3}(#{1,3})\s+(.+?)\s*$/;
const RX_DIVISOR = /^\s*(?:-{3,}|={3,}|_{3,})\s*$/;
const RX_ITEM = /^\s*[-•]\s+(.+)$/;
const RX_ITEM_NUM = /^\s*(\d{1,2})[.)]\s+(.+)$/;
const RX_CITACAO = /^\s*>\s+(.+)$/;

/** Parser PURO: texto (já sem escapes sensíveis) → segmentos. */
export function parseSaida(textoOriginal: string): SegmentoSaida[] {
  const protegido = protegerEscapes(textoOriginal);
  const bruto = fatiarBlocoInterno(protegido);
  const segmentos: SegmentoSaida[] = [];

  for (const parte of bruto) {
    if (typeof parte !== "string") {
      segmentos.push(parte);
      continue;
    }
    for (const fatia of fatiarAberturaSolta(parte)) {
      if (typeof fatia !== "string") {
        segmentos.push(fatia);
        continue;
      }
      const linhas = fatia.split(/\r?\n/);
      let paragrafo: string[] = [];
      const flushParagrafo = () => {
        const texto = paragrafo.join(" ").trim();
        if (texto) segmentos.push({ tipo: "paragrafo", texto });
        paragrafo = [];
      };
      for (const linha of linhas) {
        const t = linha.trim();
        if (t === "") {
          flushParagrafo();
          continue;
        }
        let m: RegExpMatchArray | null;
        if ((m = t.match(RX_TITULO))) {
          flushParagrafo();
          segmentos.push({
            tipo: "titulo",
            nivel: Math.min(3, m[1].length) as 1 | 2 | 3,
            texto: m[2],
          });
          continue;
        }
        if (RX_DIVISOR.test(t)) {
          flushParagrafo();
          segmentos.push({ tipo: "divisor" });
          continue;
        }
        if (
          (m = t.match(RX_ROTULO_COLCHETE)) ||
          (m = t.match(RX_ROTULO_SIMPLES))
        ) {
          const categoria = MAPA_ROTULOS[m[1].toUpperCase().normalize("NFC")];
          const resto = (m[2] ?? "").trim();
          if (categoria && resto !== "") {
            flushParagrafo();
            segmentos.push({ tipo: "rotulo", categoria, texto: resto });
            continue;
          }
        }
        if ((m = t.match(RX_ITEM)) || (m = t.match(RX_ITEM_NUM))) {
          flushParagrafo();
          segmentos.push({
            tipo: "item",
            ordenado: /\d/.test(t.slice(0, 4)),
            texto: m.length === 3 ? m[2] : m[1],
          });
          continue;
        }
        if ((m = t.match(RX_CITACAO))) {
          flushParagrafo();
          segmentos.push({ tipo: "citacao", texto: m[1] });
          continue;
        }
        paragrafo.push(t);
      }
      flushParagrafo();
    }
  }
  return segmentos;
}

// ---------- 5) Inline (negrito, itálico, `código`) ----------

export type TrechoInline =
  | { t: "texto"; c: string }
  | { t: "negrito"; c: string }
  | { t: "italico"; c: string }
  | { t: "codigo"; c: string };

export function parseInline(texto: string): TrechoInline[] {
  const trechos: TrechoInline[] = [];
  // 1) fatiar por `código` inline (não-escapado; escapes já são sentinelas)
  const fatias = texto.split(/`([^`\n]+)`/g);
  fatias.forEach((fatia, i) => {
    if (i % 2 === 1) {
      trechos.push({ t: "codigo", c: fatia });
      return;
    }
    parseNegritoItalico(fatia, trechos);
  });
  return trechos;
}

function parseNegritoItalico(texto: string, destino: TrechoInline[]) {
  let resto = texto;
  const RX = /\*\*([^*]+)\*\*|\*([^*\n]+)\*/;
  let m: RegExpExecArray | null;
  while ((m = RX.exec(resto)) !== null) {
    if (m.index > 0) destino.push({ t: "texto", c: resto.slice(0, m.index) });
    if (m[1] !== undefined) destino.push({ t: "negrito", c: m[1] });
    else destino.push({ t: "italico", c: m[2] });
    resto = resto.slice(m.index + m[0].length);
  }
  if (resto) destino.push({ t: "texto", c: resto });
}

// ---------- 6) Componente React ----------

const ESTILO_ROTULO: Record<CategoriaRotulo, string> = {
  FATO: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  "HIPÓTESE": "bg-amber-500/15 text-amber-300 border-amber-500/40",
  "SUGESTÃO": "bg-sky-500/15 text-sky-300 border-sky-500/40",
  PENDENTE: "bg-zinc-500/15 text-zinc-300 border-zinc-500/40",
  BLOQUEIO: "bg-rose-500/15 text-rose-300 border-rose-500/40",
};

function Inline({ texto }: { texto: string }) {
  const trechos = parseInline(texto);
  return (
    <>
      {trechos.map((trecho, i) => {
        const c = restaurarEscapes(trecho.c);
        switch (trecho.t) {
          case "negrito":
            return (
              <strong key={i} className="font-semibold text-zinc-100">
                {c}
              </strong>
            );
          case "italico":
            return <em key={i}>{c}</em>;
          case "codigo":
            return (
              <code
                key={i}
                className="bg-zinc-800/80 text-emerald-300 rounded px-1 py-0.5 text-[0.9em] whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
              >
                {c}
              </code>
            );
          default:
            return <span key={i}>{c}</span>;
        }
      })}
    </>
  );
}

function RotuloBadge({ categoria }: { categoria: CategoriaRotulo }) {
  return (
    <span
      className={`inline-block shrink-0 rounded border px-1.5 py-px text-[10px] font-semibold tracking-wide ${ESTILO_ROTULO[categoria]}`}
    >
      {categoria}
    </span>
  );
}

function TituloComEmoji({ seg }: { seg: Extract<SegmentoSaida, { tipo: "titulo" }> }) {
  const semEmoji = seg.texto.replace(RX_EMOJI_INICIAL, "");
  const emoji = emojiDeCategoria(semEmoji);
  const classe =
    seg.nivel === 1
      ? "text-base font-bold text-zinc-100"
      : seg.nivel === 2
        ? "text-sm font-bold text-zinc-100"
        : "text-sm font-semibold text-zinc-200";
  return (
    <p className={`${classe} flex items-start gap-1.5 min-w-0`} role="heading" aria-level={seg.nivel + 2}>
      {emoji && (
        <span aria-hidden className="shrink-0">
          {emoji}
        </span>
      )}
      <span className="min-w-0 break-words [overflow-wrap:anywhere]">
        <Inline texto={semEmoji} />
      </span>
    </p>
  );
}

function SegmentoView({ seg }: { seg: SegmentoSaida }) {
  switch (seg.tipo) {
    case "interno":
      return (
        <details className="rounded border border-zinc-700/60 bg-zinc-900/60 px-2 py-1">
          <summary className="cursor-pointer select-none text-xs text-zinc-500 hover:text-zinc-300">
            🔧 Material técnico recebido ({seg.rotulo}
            {seg.fechado ? "" : " — fechamento ausente, exibido integral"})
          </summary>
          <pre className="mt-1 whitespace-pre-wrap break-words text-[11px] leading-relaxed text-zinc-500 [overflow-wrap:anywhere]">
            {restaurarEscapes(seg.conteudo)}
          </pre>
        </details>
      );
    case "titulo":
      return <TituloComEmoji seg={seg} />;
    case "rotulo":
      return (
        <div className="flex items-start gap-2 min-w-0">
          <RotuloBadge categoria={seg.categoria} />
          <span className="min-w-0 break-words text-sm text-zinc-200 [overflow-wrap:anywhere]">
            <Inline texto={seg.texto} />
          </span>
        </div>
      );
    case "item":
      return null; // renderizado por ListaView (agrupado)
    case "citacao":
      return (
        <blockquote className="border-l-2 border-zinc-600 pl-3 text-sm italic text-zinc-400 min-w-0 break-words [overflow-wrap:anywhere]">
          <Inline texto={seg.texto} />
        </blockquote>
      );
    case "divisor":
      return <hr className="border-zinc-700/70" />;
    case "paragrafo":
      return (
        <p className="text-sm leading-relaxed text-zinc-300 min-w-0 break-words [overflow-wrap:anywhere]">
          <Inline texto={seg.texto} />
        </p>
      );
  }
}

/** Agrupa itens consecutivos em listas (mesmo tipo de marcador). */
function ListaView({ itens }: { itens: Extract<SegmentoSaida, { tipo: "item" }>[] }) {
  const ordenada = itens[0].ordenado;
  const Tag = ordenada ? "ol" : "ul";
  return (
    <Tag
      className={`space-y-1 pl-5 text-sm text-zinc-300 min-w-0 ${
        ordenada ? "list-decimal" : "list-disc"
      }`}
    >
      {itens.map((item, i) => (
        <li key={i} className="break-words [overflow-wrap:anywhere]">
          <Inline texto={item.texto} />
        </li>
      ))}
    </Tag>
  );
}

export function BotaoCopiar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1500);
    } catch {
      setCopiado(false);
    }
  };
  return (
    <button
      type="button"
      onClick={copiar}
      aria-live="polite"
      className="shrink-0 rounded border border-zinc-700 bg-zinc-800/80 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400"
    >
      {copiado ? "Copiado!" : "📋 Copiar"}
    </button>
  );
}

/** Renderizador principal da saída de uma etapa. */
export function RenderSaida({ texto }: { texto: string }) {
  const segmentos = parseSaida(texto);
  const agrupado: (SegmentoSaida | Extract<SegmentoSaida, { tipo: "item" }>[])[] = [];
  for (const seg of segmentos) {
    const ultimo = agrupado[agrupado.length - 1];
    if (seg.tipo === "item" && Array.isArray(ultimo)) {
      (ultimo as Extract<SegmentoSaida, { tipo: "item" }>[]).push(seg);
    } else if (seg.tipo === "item") {
      agrupado.push([seg]);
    } else {
      agrupado.push(seg);
    }
  }
  return (
    <div
      className="space-y-2 min-w-0 max-w-full break-words [overflow-wrap:anywhere]"
      data-render-saida
    >
      {agrupado.map((bloco, i) =>
        Array.isArray(bloco) ? (
          <ListaView key={i} itens={bloco} />
        ) : (
          <SegmentoView key={i} seg={bloco} />
        )
      )}
    </div>
  );
}
