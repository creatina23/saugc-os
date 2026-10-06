// src/lib/orquestrador/entendimento.ts — ARC-01 · ENTENDIMENTO CANÔNICO
// ======================================================================
// Camada de ENTENDIMENTO ANTES DA ESPECIALIZAÇÃO (princípio ARC-01 §3):
//
//   ENTRADA → NORMALIZAÇÃO/ENTENDIMENTO → SUFICIÊNCIA/AMBIGUIDADE →
//   CONTEXTO CANÔNICO → ESPECIALISTAS → AUDITOR → GATE
//
// MOTIVAÇÃO (caso real comprovado na missão): a entrada livre virava
// "Objetivo da operação: <texto>" e ia DIRETO aos especialistas. Sem
// grounding, o primeiro agente escolhia uma leitura qualquer de um
// termo polissêmico ("escova progressiva vegetal" lida como saúde
// bucal), e o erro propagava como contexto não-autoritativo que todas
// as etapas seguintes ancoravam — produção sofisticada e errada.
//
// MECANISMO (classe, NÃO caso hardcoded — ARC-01 §7):
//   - NADA aqui é regex para "progressiva" nem dicionário de produto.
//   - O desambiguador é GENÉRICO: categorias comerciais declaram sinais
//     de evidência (termos linguísticos que as caracterizam) e objetos
//     naturalmente polissêmicos (termos que pertencem a mais de uma).
//     Qualquer categoria nova entra como DADO na tabela, não como regra.
//   - Resolução = co-ocorrência: a categoria vence somente quando o
//     PRÓPRIO TEXTO DO USUÁRIO carrega o sinal que a distingue.
//   - Sem sinal suficiente → PRECISA_CONFIRMAR (incerteza preservada);
//     os especialistas NÃO podem escolher silenciosamente (§5).
//   - varrerDesvioSemantico é o lado determinístico do GATE: detecta
//     quando um output (incluindo de etapa anterior — CASO E) afirma
//     categoria divergente da resolvida, OU assume categoria de objeto
//     ambíguo como fato sem rótulo epistêmico no próprio local.
//
// Determinístico, puro, sem relógio/rede/LLM: testável 100% offline.
// Não degrada inteligência: frase curta NÃO é bloqueada; o caminho sem
// ambiguidade não muda em nada (bloco declara a leitura e segue).
//
// Contrato semântico (ARC-01 §4): o bloco gerado rotula explicitamente
//   [FATO_FORNECIDO]    — substrings literais da entrada;
//   [INTERPRETAÇÃO]     — leitura com evidência textual citada;
//   [HIPÓTESE]          — expectativas NÃO afirmadas (painel de lacunas);
//   [DESCONHECIDO]      — atributos ausentes na entrada;
//   [PRECISA_CONFIRMAR] — ambiguidade material não resolvida.
//
// Outputs de agentes anteriores continuam CONTEXTO NÃO AUTORITATIVO —
// inferência NUNCA vira fato por ter aparecido antes (§4, paralelo à
// REGRA_NAO_PROMOCAO_TEXTO do guardião epistêmico).

import { termoEmContextoAfirmativo } from "./epistemico";
import type { AchadoEpistemico } from "./epistemico";
import type { BlocoDado } from "./pipeline";

// ---------- Normalização / tolerância a typo (geral, não léxica) ----------

/** Normaliza para comparação: NFD sem acentos, minúsculas, colapso. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Distância de edição (Levenshtein) — tolerância a typo de 1 caractere
 *  para termos ≥5 letras (corrige a CLASSE "typo", não palavras-chaves). */
function distanciaEdicao(a: string, b: string): number {
  if (a === b) return 0;
  const linhas: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let anteriorDiagonal = linhas[0] ?? 0;
    linhas[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const acima = linhas[j] ?? j;
      linhas[j] = Math.min(
        (linhas[j] ?? j) + 1,
        (linhas[j - 1] ?? j - 1) + 1,
        anteriorDiagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      anteriorDiagonal = acima;
    }
  }
  return linhas[b.length] ?? 0;
}

/** Token do texto "bate" no sinal? Exato, OU contém, OU typo ≤1 (≥5 letras). */
function tokenBate(token: string, sinal: string): boolean {
  if (token === sinal) return true;
  if (sinal.length >= 5 && distanciaEdicao(token, sinal) <= 1) return true;
  // flexão simples pt: sinal exato como prefixo de token (alisa→alisamento)
  if (sinal.length >= 6 && token.startsWith(sinal)) return true;
  return false;
}

/** Sinal presente no texto normalizado? Multipalavra = contenção exata;
 *  (não damos tolerância a typo em frase multilateral: composição já é forte). */
function sinalPresente(textoNorm: string, tokensTexto: string[], sinal: string): { evidencia: string | null } {
  const sinalNorm = normalizar(sinal);
  if (sinalNorm.includes(" ")) {
    return { evidencia: textoNorm.includes(sinalNorm) ? sinal : null };
  }
  for (const token of tokensTexto) {
    if (tokenBate(token, sinalNorm)) return { evidencia: sinal };
  }
  return { evidencia: null };
}

// ---------- Tabela de categorias (DADO, não regra) ----------
// Mecanismo genérico de desambiguação por co-ocorrência. Cada categoria
// declara: sinais fortes (1 ocorrência resolve), sinais fracos (precisam
// 2 ocorrências distintas) e objetos polissêmicos que ela compartilha.
// NENHUM nome de produto específico aqui — só comandos de domínio.

export interface CategoriaComercial {
  readonly id: string;
  readonly rotulo: string;
  readonly sinaisFortes: readonly string[];
  readonly sinaisFracos: readonly string[];
  /** Objetos linguísticos que, SOZINHOS, vivem em ≥2 categorias. */
  readonly objetosPolissemicos: readonly string[];
}

export const CATEGORIAS_COMERCIAIS: readonly CategoriaComercial[] = [
  {
    id: "capilar",
    rotulo: "cuidado e tratamento capilar",
    sinaisFortes: [
      "progressiva", "alisamento", "selagem", "capilar", "cabelo",
      "cabelos", "formol", "mechas", "mecha", "fios", "reconstrução",
      "botox", "escovação capilar", "cronograma capilar", "química capilar",
      "loiro", "frizz", "relaxamento", "cabelereiro", "cabelereira",
    ],
    sinaisFracos: ["salão", "beleza", "hidratação", "condicionador", "shampoo"],
    objetosPolissemicos: ["escova"],
  },
  {
    id: "odontologica",
    rotulo: "cuidado odontológico e bucal",
    sinaisFortes: [
      "dente", "dentes", "dental", "odontológica", "odontológico",
      "bucal", "escovação", "gengiva", "dentadura", "cárie",
    ],
    sinaisFracos: ["boca", "mordida"],
    objetosPolissemicos: ["escova"],
  },
  {
    id: "fitness",
    rotulo: "fitness e bem-estar físico",
    sinaisFortes: [
      "academia", "treino", "musculação", "corrida", "pilates",
      "crossfit", "fisioterapia", "exercício", "exercício físico",
    ],
    sinaisFracos: ["saúde", "corpo"],
    objetosPolissemicos: [],
  },
  {
    id: "alimentacao",
    rotulo: "alimentos e bebidas",
    sinaisFortes: [
      "restaurante", "lanche", "hambúrguer", "çaixa", "pizza",
      "churrasco", "açaí", "café", "sobremesa", "delivery de comida",
    ],
    sinaisFracos: ["sabor", "receita"],
    objetosPolissemicos: [],
  },
] as const;

/** Mapa objeto polissêmico → candidatas (construído a partir dos DADOS). */
function candidatasPorObjeto(token: string): CategoriaComercial[] {
  return CATEGORIAS_COMERCIAIS.filter((c) =>
    c.objetosPolissemicos.some((o) => tokenBate(token, normalizar(o)))
  );
}

// ---------- Extração do objeto da intenção (geral) ----------

/** Conectores de intenção + de tipo de entrega (marketing comercial).
 *  Tudo aqui é a CLASSE "como um pedido de marketing se diz", não
 *  produto. O que restar DEPOIS é o objeto livre do usuário. */
const CONECTOR_INTENCAO =
  /^(?:quero|preciso|necessito|criar?|montar?|monte|planejar?|planeje|desenvolver?|desenvolva|lançar?|lance|vender?|vender|promover?|promova|divulgar?|divulgue|fazer?|faça|fazer|gerar?|gere|definir?|defina|preparar?|prepare|organizar?|organize)\s+(?:muito\s+)?(?:pra|para|a|uma?|um|o|da|do)?\s*/i;

const TIPO_ENTREGA_BALASTO =
  /^(?:campanhas?|anúncios?|anuncios?|plano|planos?|estrategias?|estratégias?|conteúdos?|conteudos?|cop[yi](?:es)?|textos?|posts?|postagem|postagens?|vídeos?|videos?|roteiros?|criativos?|propagandas?|marketings?|funis?|funil|e-?mails?|sequência|sequencia|ideias?|imgens?|imagens?|fotos?|peças?|pecas?|cards?|boards?|comerciais?|cartas?|landing\s*pages?|descricao|descrição)\s+/i;

const LIGACAO_BALASTO = /^(?:de|da|do|das|dos|para|pra|sobre|com|d[eê]|promocional de|vendas? de|divulgação de)\s+/i;

/** Remove artigos/pronomes iniciais do objeto e realces finais automáticos. */
function limparObjeto(bruto: string): string {
  let objeto = bruto.trim();
  objeto = objeto.replace(/^(?:uma?|um|o|a|as|os|esta|este|essa|esse|minha|meu|nossa|seu|sua|da|do)\s+/i, "");
  objeto = objeto.replace(/[.!?,;:\s]+$/, "");
  return objeto;
}

export interface ExtracaoObjeto {
  readonly detectado: boolean;
  readonly objetoOriginal: string;
  readonly objetoNormalizado: string;
  /** Canal detectado no próprio texto (camada de contexto, não de categoria). */
  readonly canais: readonly string[];
}

const CANAIS = ["instagram", "tiktok", "facebook", "meta", "whatsapp", "youtube", "pinterest", "linkedin", "google ads", "tráfego pago", "orgânico"] as const;

/** Extrai o objeto central do pedido independente de forma verbal/côlquio. */
export function extrairObjeto(texto: string): ExtracaoObjeto {
  let resto = texto.trim();
  // Passos de limpeza de intenção/tipo (podem ocorrer até 2 vezes cada)
  for (let volta = 0; volta < 2; volta += 1) {
    const m1 = CONECTOR_INTENCAO.exec(resto);
    if (m1) resto = resto.slice(m1[0].length);
    const m2 = TIPO_ENTREGA_BALASTO.exec(resto = resto.trim());
    if (m2) resto = resto.slice(m2[0].length);
  }
  resto = resto.replace(LIGACAO_BALASTO, "").trim();
  const objetoOriginal = limparObjeto(resto) || texto.trim();
  const canais = CANAIS.filter((canal) =>
    normalizar(objetoOriginal).includes(normalizar(canal))
  );
  return {
    detectado: resto.trim().length > 0,
    objetoOriginal,
    objetoNormalizado: normalizar(objetoOriginal),
    canais,
  };
}

// ---------- Núcleo: analisar objetivo livre ----------

export type StatusCategoria = "resolvida" | "ambigua" | "indefinida";

export interface EntendimentoObjetivo {
  readonly extracao: ExtracaoObjeto;
  readonly status: StatusCategoria;
  /** Presente quando resolvida: categoria + evidências literais encontradas. */
  readonly categoria?: {
    readonly id: string;
    readonly rotulo: string;
    readonly evidencias: readonly string[];
    readonly porScore: number;
  };
  /** Presente quando ambígua: objeto + candidatas que o dividem. */
  readonly ambiguidade?: {
    readonly objeto: string;
    readonly candidatas: readonly { readonly id: string; readonly rotulo: string }[];
  };
}

/**
 * Regra de decisão (determinística e auditável):
 *   1. pontua categoria = 2×sinais fortes + 1×sinais fracos presentes no
 *      objeto (com tolerância a typo);
 *   2. se UMA líder com score ≥2 e estritamente maior que a segunda →
 *      "resolvida" com evidências;
 *   3. se NENHUMA pontua e o objeto contém termo polissêmico compartilhado
 *      por ≥2 categorias → "ambigua" (PRECISA_CONFIRMAR);
 *   4. demais casos → "indefinida" (sem opinião; a cadeia está livre, e o
 *      bloco declara o DESCONHECIDO — incerteza preservada, §5B).
 */
export function analisarObjetivoLivre(objetivoLivre: string): EntendimentoObjetivo {
  const extracao = extrairObjeto(objetivoLivre);
  const norm = extracao.objetoNormalizado;
  const tokens = norm.split(" ").filter(Boolean);

  const pontuacao = CATEGORIAS_COMERCIAIS.map((categoria) => {
    const fortes: string[] = [];
    const fracas: string[] = [];
    for (const sinal of categoria.sinaisFortes) {
      const { evidencia } = sinalPresente(norm, tokens, sinal);
      if (evidencia) fortes.push(evidencia);
    }
    for (const sinal of categoria.sinaisFracos) {
      const { evidencia } = sinalPresente(norm, tokens, sinal);
      if (evidencia) fracas.push(evidencia);
    }
    return { categoria, fortes, fracas, score: fortes.length * 2 + fracas.length * 1 };
  })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);

  const lider = pontuacao[0];
  const segunda = pontuacao[1];
  if (lider && lider.score >= 2 && (!segunda || lider.score > segunda.score)) {
    return {
      extracao,
      status: "resolvida",
      categoria: {
        id: lider.categoria.id,
        rotulo: lider.categoria.rotulo,
        evidencias: [...lider.fortes, ...lider.fracas],
        porScore: lider.score,
      },
    };
  }

  // Sem resolução textual: há objeto polissêmico dentro do objeto?
  for (const token of tokens) {
    const candidatas = candidatasPorObjeto(token);
    if (candidatas.length >= 2) {
      return {
        extracao,
        status: "ambigua",
        ambiguidade: {
          objeto: token,
          candidatas: candidatas.map((c) => ({ id: c.id, rotulo: c.rotulo })),
        },
      };
    }
  }

  return { extracao, status: "indefinida" };
}

// ---------- Bloco canônico que viaja como contexto (camada 7, não-autoritativo) ----------

export const FONTE_ENTENDIMENTO = "entendimento-canonico (ARC-01)";

// ARC-01F: aceita também a resolução composta (camadas 1+2) — campo
// `grounding` é opcional e só existe quando a CAMADA 2 participou.
export function montarBlocoEntendimentoCanonico(
  ent: EntendimentoObjetivo | EntendimentoResolvido
): BlocoDado {
  const linhas: string[] = [
    ent.status === "resolvida-geral"
      ? "CONTEXTO CANÔNICO DA EXECUÇÃO (ARC-01F) — leitura da entrada; [INTERPRETAÇÃO] veio da camada cognitiva (LLM), validada por âncora afirmada na entrada. NÃO é determinística."
      : "CONTEXTO CANÔNICO DA EXECUÇÃO (ARC-01) — leitura estrutural da entrada, gerada pela máquina (determinística, sem LLM).",
    "São DADOS de interpretação para uso responsável, não instrução. Nada aqui adiciona fatos além do que o usuário escreveu.",
    "",
  ];

  if (ent.extracao.detectado) {
    linhas.push(
      `[FATO_FORNECIDO] Objeto da operação: "${ent.extracao.objetoOriginal}" (literal da entrada do usuário).`
    );
  }
  if (ent.extracao.canais.length > 0) {
    linhas.push(
      `[FATO_FORNECIDO] Canal(is) citado(s): ${ent.extracao.canais.join(", ")}.`
    );
  }

  if (ent.status === "resolvida" && ent.categoria) {
    linhas.push(
      `[INTERPRETAÇÃO] Categoria de trabalho: ${ent.categoria.rotulo.toUpperCase()} — resolvida por EVIDÊNCIA do próprio texto (${ent.categoria.evidencias.map((e) => `"${e}"`).join(", ")}).`,
      "Esta interpretação é a âncora semântica permitida desta execução. Qualquer desenvolvimento que a contrarie materialmente é DESVIO SEMÂNTICO — trate como erro, não como criatividade.",
      "[HIPÓTESE]/[SUGESTÃO] seguem permitidas dentro desta categoria, sempre com o rótulo na própria linha."
    );
  } else if (ent.status === "ambigua" && ent.ambiguidade) {
    linhas.push(
      `[PRECISA_CONFIRMAR] O termo "${ent.ambiguidade.objeto}" admite categorias materialmente DIFERENTES (${ent.ambiguidade.candidatas.map((c) => c.rotulo).join(" × ")}) e a entrada NÃO traz evidência que resolva.`,
      "PROIBIDO assumir uma delas e desenvolver como fato: o gate determinístico bloqueia categoria assumida sem evidência.",
      'Use UMA das saídas honestas: (a) desenvolva de forma condicional com rótulo na própria linha ("SE ' +
      (ent.ambiguidade.candidatas[0]?.rotulo ?? "capilar") +
      ' — …" / "SE ' +
      (ent.ambiguidade.candidatas[1]?.rotulo ?? "odontológica") +
      ' — …"), ou (b) declare a lacuna e siga somente com o que é certo.',
      "Se uma etapa anterior APRESENTOU uma dessas categorias como fato, aquele output é configuração errada sem autoridade: não o herde (CASO-E). Um output anterior NUNCA resolve ambiguidade."
    );
  } else if (ent.status === "resolvida-geral" && ent.categoria) {
    // CAMADA 2 (ARC-01F): interpretação estabelecida com evidência literal
    // da entrada — status INTERPRETAÇÃO, nunca FATO_FORNECIDO.
    linhas.push(
      `[INTERPRETAÇÃO] Leitura de trabalho: ${ent.categoria.rotulo.toUpperCase()} — estabelecida pela camada cognitiva da própria AnuncIA COM EVIDÊNCIA da entrada (${ent.categoria.evidencias.map((e) => `"${e}"`).join(", ")}).`,
      "Esta interpretação NÃO é FATO: é leitura derivada da entrada para uso responsável nesta execução — NÃO fato fornecido, autorização ou dado verificado.",
      "Qualquer desenvolvimento que contrarie materialmente esse objeto é DESVIO SEMÂNTICO — trate como erro, não como criatividade.",
      "[HIPÓTESE]/[SUGESTÃO] seguem permitidas dentro desta interpretação, sempre com rótulo na própria linha."
    );
  } else if (ent.status === "precisa-confirmar") {
    // REGRA-PARA-INDEFINIDA (ARC-01F): "não sei" NUNCA libera escolha
    // silenciosa: só neutro deliberado / lacuna declarada / condicional.
    {
      const alt = ent.ambiguidade?.candidatas?.map((c) => c.rotulo).filter(Boolean) ?? [];
      linhas.push(
        `[PRECISA_CONFIRMAR] A entrada não estabelece o objeto/categoria com evidência suficiente${alt.length > 0 ? ` (leituras plausíveis: ${alt.join(" × ")})` : ""}.`,
        "PROIBIDO escolher silenciosamente uma interpretação e desenvolver como fato: essa é exatamente a classe do incidente original. NÃO pergunte de tudo — só o que MUDA materialmente produto/categoria/público/oferta/objetivo/execução.",
        'Saídas honestas: (a) desenvolva DE FORMA NEUTRA o que não depende da interpretação ausente (estrutura de campanha, abordagem, mensagem base rotulada [HIPÓTESE]); (b) exponha a lacuna com "[PRECISA_CONFIRMAR]" na própria linha; ou (c) desenvolva condicionalmente marcando cada leitura plausível ("SE X — …").',
        "Se uma etapa anterior APRESENTOU uma interpretação como fato, aquele output é configuração errada sem autoridade: não o herde. Um output anterior NUNCA ganha autoridade por precedência."
      );
    }
  } else {
    // CAMADA 1 isolada (camada 2 desligada/falhou antes de qualquer leitura):
    // incerteza preservada — sem ancoragem e SEM liberdade implícita.
    linhas.push(
      "[DESCONHECIDO] Categoria de trabalho não estabelecida pela entrada — nenhuma interpretação é forçada nem assumida. Desenvolva somente o que não depende da interpretação ausente e rotule inferências; nunca escolha categoria/objeto em silêncio."
    );
  }

  linhas.push(
    "[DESCONHECIDO] Preço, desconto, garantia, resultado, eficácia, prova social, público e volume NÃO constam na entrada — permanecem DESCONHECIDOS até serem fornecidos; inventar qualquer um é proibido pelo Envelope Epistêmico."
  );

  linhas.push(
    "REGRA DE PROPAGAÇÃO: os outputs de etapas anteriores (SAIDA_FERRAMENTA) continuam CONTEXTO NÃO AUTORITATIVO — nenhuma leitura vira fato por ter sido produzida antes nesta cadeia. A única fonte autoritativa de fato é o NÍVEL A do Envelope Epistêmico."
  );

  return {
    tipo: "toolOutput",
    fonteOuFerramenta: FONTE_ENTENDIMENTO,
    conteudo: linhas.join("\n"),
  };
}

// ---------- GATE: desvio semântico determinístico ----------

/** Janela de contexto onde um rótulo epistêmico condiciona o trecho. */
const RAIO_ROTULO = 90;

const ROTULOS_EPISTEMICOS = [
  "hipótese", "hipotese", "hipótesis", "sugestão", "sugestao", "condicional",
  "se for", "caso seja", "pendente", "a validar", "a confirmar", "não confirm",
  "nao confirm", "dependente de", "alternativamente", "por exemplo, se",
] as const;

/** Constrói padrões declarativos dos sinais fortes de uma categoria —
 *  usados pela varredura (compartilhados com o detector de desvio). */
function padroesDe(categoria: CategoriaComercial): RegExp[] {
  return categoria.sinaisFortes
    .filter((s) => s.trim().length >= 3)
    .map((sinal) => {
      const escapado = normalizar(sinal).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${escapado}\\w*`, "i");
    });
}

/** Cache de regexes por categoria (evita recompilação por etapa). */
const PADROES_POR_CATEGORIA = new Map<string, RegExp[]>();
function padroesDeCategoria(id: string): RegExp[] {
  if (!PADROES_POR_CATEGORIA.has(id)) {
    const categoria = CATEGORIAS_COMERCIAIS.find((c) => c.id === id);
    PADROES_POR_CATEGORIA.set(id, categoria ? padroesDe(categoria) : []);
  }
  return PADROES_POR_CATEGORIA.get(id) ?? [];
}

/** Prefixos curtos de parseamento condicional (§5) — o próprio bloco
 *  canônico instrui a forma "SE <categoria> — …", logo anteriorização de
 *  ≤35 caracteres por marcador de sentido condicional TAMBÉM protege a
 *  mencion legítima. Deliberadamente curto: "se" de fala NÃO autoriza
 *  claim a 90 caracteres de distância. */
const RAIO_CONDICIONAL = 35;
const REGEX_CONDICIONAL = /(?:^|[\s(–—•\-])(se|caso|cen\u00e1rio|cenario|cen\u00e1rios|cenarios|em caso de)\s/i;

/** Trecho materialmente "anunciado"? Proteções: (a) rótulo epistêmico na
 *  janela ±RAIO_ROTULO; (b) parseamento condicional curto antes do trecho.
 *  Qualquer uma presente = a menção está desenvolvida condicionalmente. */
function temRotuloNaVizinhanca(texto: string, inicio: number): boolean {
  const antes = texto.slice(Math.max(0, inicio - RAIO_ROTULO), inicio);
  const depois = texto.slice(inicio, inicio + RAIO_ROTULO);
  const janela = (antes + depois).toLowerCase();
  if (ROTULOS_EPISTEMICOS.some((rotulo) => janela.includes(rotulo))) return true;
  // (b) condicional lexical CURTO: apenas nos últimos RAIO_CONDICIONAL chars
  const curto = texto.slice(Math.max(0, inicio - RAIO_CONDICIONAL), inicio);
  return REGEX_CONDICIONAL.test(curto);
}

/** Pequeno recorte legível ao redor do achado (sem delimitadores de bloco). */
function trechoDe(texto: string, inicio: number): string {
  return texto
    .slice(Math.max(0, inicio - 40), inicio + 60)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

/**
 * Varredura determinística de DESVIO SEMÂNTICO. Duas falhas materializadas:
 *
 *   (1) DESVIO_SEMANTICO_CATEGORIA — com categoria RESOLVIDA por evidência,
 *       o texto afirma sinais fortes de OUTRA categoria. Cobre o CASO-E:
 *       o erro semântico de uma etapa anterior — mesmo propagado como
 *       toolOutput — NÃO é promovido a fato: quando esse material entra no
 *       material publicável do Auditor, o bloqueio aparece.
 *
 *   (2) CATEGORIA_ASSUMIDA_SEM_ENTENDIMENTO — com objeto AMBÍGUO
 *       (PRECISA_CONFIRMAR), o texto afirma uma das categorias candidatas
 *       sem nenhum rótulo epistêmico na vizinhança — ou seja, escolheu
 *       silenciosamente uma interpretação de alto impacto (§5).
 */
export function varrerDesvioSemantico(
  texto: string,
  ent: EntendimentoObjetivo | EntendimentoResolvido
): AchadoEpistemico[] {
  const achados: AchadoEpistemico[] = [];
  const norm = normalizar(texto);

  // ARC-01F BLOCKER-FIX (P2): a cláusula `!!id.startsWith("geral-")` desligava
  // a guarda exatamente para a camada de autoridade mais fraca (corredor
  // reproduzido pelo Hacker). resolvida-geral passa a ser varrida como qualquer
  // categoria resolvida: afirmar sinais de categoria conhecida divergente é desvio.
  if ((ent.status === "resolvida" || ent.status === "resolvida-geral") && ent.categoria) {
    const outras = CATEGORIAS_COMERCIAIS.filter((c) => c.id !== ent.categoria?.id);
    for (const outra of outras) {
      for (const padrao of padroesDeCategoria(outra.id)) {
        const match = padrao.exec(norm);
        if (match && typeof match.index === "number") {
          // Respeito à categoria é visível quando é condicional (hipótese/sugestão/condição).
          if (temRotuloNaVizinhanca(norm, match.index)) continue;
          achados.push({
            categoria: "DESVIO_SEMANTICO_CATEGORIA",
            trecho: trechoDe(texto, match.index),
            norma: "BLOQUEIO",
            porque:
              `a entrada foi resolvida como ${ent.categoria.rotulo} por evidência do próprio texto ` +
              `(${ent.categoria.evidencias.map((e) => `"${e}"`).join(", ")}); afirmar sinais de ` +
              `${outra.rotulo} ("${match[0]}") é desvio semântico do objeto, mesmo propagado por outra etapa.`,
          });
          break; // um achado por categoria divergente basta
        }
      }
    }
  }

  if (ent.status === "ambigua" && ent.ambiguidade) {
    for (const candidata of ent.ambiguidade.candidatas) {
      for (const padrao of padroesDeCategoria(candidata.id)) {
        const match = padrao.exec(normalizar(texto));
        if (match && typeof match.index === "number") {
          if (temRotuloNaVizinhanca(norm, match.index)) continue;
          achados.push({
            categoria: "CATEGORIA_ASSUMIDA_SEM_ENTENDIMENTO",
            trecho: trechoDe(texto, match.index),
            norma: "BLOQUEIO",
            porque:
              `o objeto "${ent.ambiguidade.objeto}" é ambíguo (PRECISA_CONFIRMAR) e a entrada não resolve ` +
              `categoria; afirmar "${match[0]}" sem rótulo epistêmico = escolher silenciosamente uma ` +
              `interpretação de alto impacto (proibido, ARC-01 §5).`,
          });
          break;
        }
      }
    }
  }

  // ARC-01F BLOCKER-FIX (P2) · INTERPRETAÇÃO AUTODECLARADA afirmada como fato:
  // quando o status NÃO autorizou a interpretação da CAMADA 2 (precisa-confirmar/
  // ambigua com grounding), afirmar conteúdo significativo dela SEM rótulo
  // epistêmico = promover autodeclaração a fato. (Rotulada/condicional segue livre.)
  if (
    (ent.status === "precisa-confirmar" || ent.status === "ambigua") &&
    "grounding" in ent && ent.grounding?.estrutura?.interpretacao_proposta
  ) {
    for (const token of tokensSignificativos(ent.grounding.estrutura.interpretacao_proposta)) {
      if (token.length < 6) continue; // só tokens fortes (auditável, baixo ruído)
      if (termoEmContextoAfirmativo(texto, token) && !temRotuloNaVizinhanca(norm, norm.indexOf(token))) {
        achados.push({
          categoria: "INTERPRETACAO_NAO_AUTORIZADA_COMO_FATO",
          trecho: trechoDe(texto, norm.indexOf(token)),
          norma: "BLOQUEIO",
          porque:
            `a CAMADA 2 NÃO autorizou sua interpretação (${ent.status}); afirmar "${token}" ` +
            "da interpretação proposta como fato = dar autoridade a autodeclaração (BLOCKER ARC-01F).",
        });
        break;
      }
    }
  }

  // ARC-01F · ALTERNATIVAS DO GROUNDING (CAMADA 2): quando a própria
  // estrutura cognitiva listou leituras materiais concorrentes do mesmo
  // objeto, NENHUMA delas pode ser afirmada como fato sem confirmação;
  // rotulada/condicional NÃO é achado.
  if ("grounding" in ent && ent.grounding) {
    const alternativas = ent.grounding.estrutura?.alternativas_plausiveis ?? [];
    for (const alternativa of alternativas) {
      const altNorm = normalizar(alternativa);
      if (altNorm.length < 8) continue;
      const indice = norm.indexOf(altNorm);
      if (indice >= 0 && !temRotuloNaVizinhanca(norm, indice)) {
        achados.push({
          categoria: "LEITURA_EM_CONFLITO_COMO_FATO",
          trecho: trechoDe(texto, indice),
          norma: "BLOQUEIO",
          porque:
            `"${alternativa.slice(0, 70)}" foi listada pela camada cognitiva como ALTERNATIVA ` +
            "plausível em disputa; afirmá-la como fato = promover leitura em conflito sem confirmação (§ precisa-confirmar).",
        });
      }
    }
  }

  return achados;
}

// ---------- Resumo aditivo que passeia até a UI (honesto, sem teatro) ----------

export interface ResumoEntendimento {
  readonly objeto: string | null;
  readonly status: StatusEntendimento;
  readonly categoriaRotulo?: string;
  readonly evidencias?: readonly string[];
  readonly ambiguidade?: {
    readonly objeto: string;
    readonly candidatasRotulos: readonly string[];
  };
}

export function resumirEntendimento(
  ent: EntendimentoObjetivo | EntendimentoResolvido
): ResumoEntendimento {
  const base: ResumoEntendimento = {
    objeto: ent.extracao.detectado ? ent.extracao.objetoOriginal : null,
    status: ent.status,
  };
  if ((ent.status === "resolvida" || ent.status === "resolvida-geral") && ent.categoria) {
    return {
      ...base,
      status: ent.status,
      categoriaRotulo: ent.categoria.rotulo,
      evidencias: ent.categoria.evidencias,
    };
  }
  if ((ent.status === "ambigua" || ent.status === "precisa-confirmar") && ent.ambiguidade) {
    return {
      ...base,
      status: ent.status,
      ambiguidade: {
        objeto: ent.ambiguidade.objeto,
        candidatasRotulos: ent.ambiguidade.candidatas.map((c) => c.rotulo),
      },
    };
  }
  return { ...base, status: ent.status };
}

// ======================================================================
// ARC-01F · CAMADA 2 — GROUNDING SEMÂNTICO GERAL (generalização comprovada)
// ----------------------------------------------------------------------
// INVARIANTE (declarada pela missão): ENTENDER ANTES DE ESPECIALIZAR,
// para QUALQUER domínio. A tabela lexical da CAMADA 1 permanece apenas
// como FAST PATH: otimização determinística/otimizador de conflito
// conhecido — ela NÃO é mais a defesa única contra ambiguidade material.
//
// Quando a camada determinística NÃO resolve com segurança ("ambigua"
// polissêmica conhecida OU "indefinida" fora da taxonomia), a pipeline
// usa a própria capacidade cognitiva REAL da AnuncIA (o callback `gerar`
// já existente — mesmo canal/provedores/diagnóstico do resto da cadeia)
// para produzir ESTRUTURA — nunca marketing. O output:
//   (a) NÃO ganha autoridade automaticamente;
//   (b) não pode citesevidência fora da ENTRADA (anti-alucinação
//       determinística: evidência que não consta da entrada anula a
//       resolução);
//   (c) com alternativas incompatíveis OU confiança insuficiente OU
//       falha de parsing → PRECISA_CONFIRMAR;
//   (d) jamais inventa pesquisa externa/"conhecimento verificado".
//
// REGRA PARA O FIM DA "INDEFINIDA LIVRE": qualquer resultado final é
//   (A) interpretação geral com evidência; OU (B) PRECISA_CONFIRMAR; OU
//   (C) desenvolvimento deliberadamente neutro — declarado no bloco.
//   NUNCA promoção silenciosa (§ "REGRA PARA INDEFINIDA", ARC-01F).
// ======================================================================

import type { GeradorIA } from "./pipeline";

export type StatusEntendimento =
  | StatusCategoria           // "resolvida" | "ambigua" | "indefinida"
  | "resolvida-geral"         // CAMADA 2 resolveu com evidência da entrada
  | "precisa-confirmar";      // CAMADA 2 não estabeleceu / alternativas

/** Contrato mínimo (§ JSON da missão) — colhido estritamente. */
export interface GroundingEstrutura {
  readonly objeto_literal: string;
  readonly interpretacao_proposta: string;
  readonly categoria_ou_tipo: string;
  readonly evidencias_da_entrada: readonly string[];
  readonly alternativas_plausiveis: readonly string[];
  readonly confianca_qualitativa: "alta" | "media" | "baixa";
  readonly precisa_confirmar: boolean;
  readonly motivo: string;
}

export const FONTE_GROUNDING = "entendimento-canonical (ARC-01F, camada cognitiva)";

/** Prompt-especificação da CHAMADA DE ESTRUTURA (não marketing).
 *  Vai como CONTRATO do pseudo-agente de grounding — assunto é leitura,
 *  não criação. Sem memória, sem web, sem "verificado". */
export const PROMPT_GROUNDING_ESTRUTURA = `Você é o módulo de LEITURA ESTRUTURAL da AnuncIA (não é um agente de marketing). Sua única função é produzir ESTRUTURA sobre a entrada abaixo, já marcada como não-autoritativa.

REGRAS DURAS:
1. Use SOMENTE o que está escrito na ENTRADA. Não invente pesquisa, web, fonte, dado, estudo, estatística, "conhecimento verificado", faixa de preço, desconto, garantia ou resultado.
2. Identifique o objeto_literal EXATAMENTE como aparece na entrada.
3. Proponha interpretacao_proposta e categoria_ou_tipo APENAS com evidência COLETÁVEL DENTRO da própria entrada — e liste essas evidencias_da_entrada como FRASES literais (substring) da entrada ou não-a-liste.
3.5. ECO: interpretacao_proposta e categoria_ou_tipo devem reutilizar os termos da própria entrada (não troque por sinônimo de domínio: um sofá é "sofá"). Interpretação sem eco na entrada perde autoridade.
3.6. NÚCLEO: evidencias_da_entrada devem incluir, literalmente, TODA a descrição central do objeto (substantivo + qualificadores até a primeira preposição). Evidência periférica (só um atributo ou a marca) NÃO autoriza a interpretação.
4. Se o objeto admitir DUAS OU MAIS interpretações materialmente incompatíveis (mudariam produto/categoria/público/oferta/objetivo/execução), liste-as em alternativas_plausiveis e marque precisa_confirmar = true.
5. Se a entrada não trouxer evidência suficiente para escolher uma interpretação responsável, marque precisa_confirmar = true e confianca_qualitativa = "baixa".
6. incerteza IRRELEVANTE (que não muda produto/categoria/objetivo) NÃO gera confirmação: segue como hipótese do plano.
7. Responda EXCLUSIVAMENTE com UM OBJETO JSON (sem texto fora dele, sem markdown) com EXATAMENTE estas chaves:
{"objeto_literal":"...","interpretacao_proposta":"...","categoria_ou_tipo":"...","evidencias_da_entrada":["..."],"alternativas_plausiveis":["..."],"confianca_qualitativa":"alta|media|baixa","precisa_confirmar":true|false,"motivo":"..."}`;

/** Extração resiliente do JSON da resposta (primeiro objeto equilibrado |
 *  parse objetivo), SEM fallback criativo. */
export function extrairJsonGrounding(texto: string): GroundingEstrutura | null {
  const inicio = texto.indexOf("{");
  if (inicio < 0) return null;
  let profundidade = 0;
  let fim = -1;
  for (let i = inicio; i < texto.length; i += 1) {
    const ch = texto[i];
    if (ch === "{") profundidade += 1;
    if (ch === "}") {
      profundidade -= 1;
      if (profundidade === 0) { fim = i; break; }
    }
  }
  if (fim < 0) return null;
  try {
    const bruto = JSON.parse(texto.slice(inicio, fim + 1)) as Partial<GroundingEstrutura>;
    if (typeof bruto.objeto_literal !== "string" || typeof bruto.interpretacao_proposta !== "string") return null;
    const conf = bruto.confianca_qualitativa;
    return {
      objeto_literal: bruto.objeto_literal.slice(0, 200),
      interpretacao_proposta: String(bruto.interpretacao_proposta ?? "").slice(0, 300),
      categoria_ou_tipo: String(bruto.categoria_ou_tipo ?? "").slice(0, 120),
      evidencias_da_entrada: Array.isArray(bruto.evidencias_da_entrada)
        ? bruto.evidencias_da_entrada.filter((e): e is string => typeof e === "string").slice(0, 12)
        : [],
      alternativas_plausiveis: Array.isArray(bruto.alternativas_plausiveis)
        ? bruto.alternativas_plausiveis.filter((e): e is string => typeof e === "string").slice(0, 12)
        : [],
      confianca_qualitativa: conf === "alta" || conf === "media" || conf === "baixa" ? conf : "baixa",
      precisa_confirmar: bruto.precisa_confirmar === true,
      motivo: String(bruto.motivo ?? "").slice(0, 300),
    };
  } catch {
    return null;
  }
}


/** ARC-01F BLOCKER-FIX (P1) — EXISTÊNCIA ≠ SUPORTE.
 *  Palavras-funcionais pt-BR NÃO carregam âncora (estrutural, não domínio). */
const STOPWORDS_ANCORA = new Set([
  "de", "da", "do", "das", "dos", "para", "pra", "com", "em", "no", "na",
  "nos", "nas", "um", "uma", "uns", "umas", "o", "a", "os", "as", "e",
  "ou", "ao", "aos", "seu", "sua", "seus", "suas", "que", "por", "sem",
  "sob", "sobre", "ate", "entre", "contra", "pelo", "pela", "este", "esta",
]);

/** Tokens que CARREGAM significado (≥4 letras, não-funcionais). */
function tokensSignificativos(texto: string): string[] {
  return normalizar(texto)
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !STOPWORDS_ANCORA.has(t));
}

/** Match ESTRITO de âncora: exato ou prefixo longo (≥6).
 *  SEM distância de edição — Levenshtein unia conceitos sem relação
 *  ("capas"≈"copas", "modulo"≈"modular") — CAUSA 1/b do Release Gate. */
function matchEstrito(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length >= 6 && b.startsWith(a)) return true;
  if (b.length >= 6 && a.startsWith(b)) return true;
  return false;
}

/** ZONA-NÚCLEO do objeto: tokens significativos (≥3, não-funcionais) do
 *  descritivo do objeto, do início até a 1ª preposição estrutural ou
 *  separador de cláusula — é onde vive o NÚCLEO que distingue o produto
 *  ("sofá modular" ← "um sofá modular com capas"; "plataforma saas";
 *  "curso online"; "consultoria tributaria"; "cadeira ergonomica").
 *  Marca-candidata (1º token seguido de ",", " e um/uma", " é um/uma")
 *  é descartada: a identidade do objeto está no descritivo, não na marca.
 *  Estrutural (posição/unidade), NÃO léxico de domínio. */
const PREP_CORTE = new Set([
  "de", "da", "do", "das", "dos", "para", "pra", "com", "em", "no", "na",
  "por", "pelo", "pela", "sem", "sob", "sobre", "ate", "entre", "contra",
  "ao", "aos",
]);
function zonaNucleoDoObjeto(objeto: string): string[] {
  let norm = normalizar(objeto);
  const marca = norm.match(/^([a-z0-9]{3,})(\s*,|\s+e\s+um[a]?\s|\s+e\s+\b[a-zà-ú]+\b)/u);
  if (marca && !PREP_CORTE.has(marca[1])) norm = norm.slice(marca[0].length);
  const out: string[] = [];
  for (const raw of norm.split(/[\s,.!?;:()—\n]+/)) {
    const tok = raw.trim();
    if (!tok) continue;
    if (PREP_CORTE.has(tok)) break;
    if (tok.length < 3 || STOPWORDS_ANCORA.has(tok)) continue;
    out.push(tok);
    if (out.length >= 4) break; // núcleo é local (evita engolir a lista inteira)
  }
  return out;
}

/** A interpretação/categoria declara conteúdo AFIRMADO na entrada?
 *  v2 (Release Gate final): MATCH ESTRITO (sem Levenshtein) + NÚCLEO —
 *  além do eco de ≥1 âncora, TODA a zona-núcleo do objeto precisa estar
 *  COBERTA pelas evidências validadas. "Achei uma palavra compartilhada"
 *  não é mais suficiente (A1/A2/A5/A6a–A6d). */
function relacaoSuportadaPelaEntrada(
  entrada: string,
  interpretacao: string,
  categoria: string,
  evidenciasValidadas: readonly string[],
  zonaNucleo: readonly string[]
): { readonly suportada: boolean; readonly ancora: string | null } {
  if (zonaNucleo.length > 0) {
    // tokens crus das evidências (≥3 — evidência literal da entrada pode
    // trazer núcleo curto: "pet", "shop", "kit", "saas"…)
    const evToks = normalizar(evidenciasValidadas.join(" "))
      .split(/[\s,.!?;:()—\n]+/)
      .filter((t) => t.length >= 3 && !STOPWORDS_ANCORA.has(t));
    const zonaCoberta = zonaNucleo.every(
      (nucleo) => evToks.some((ev) => ev === nucleo || (nucleo.length >= 6 && ev.startsWith(nucleo)) || (ev.length >= 6 && nucleo.startsWith(ev)))
    );
    if (!zonaCoberta) return { suportada: false, ancora: null };
  }
  for (const token of tokensSignificativos(`${interpretacao} ${categoria}`)) {
    for (const tEntrada of tokensSignificativos(entrada)) {
      if (matchEstrito(tEntrada, token) && termoEmContextoAfirmativo(entrada, tEntrada)) {
        return { suportada: true, ancora: tEntrada };
      }
    }
  }
  return { suportada: false, ancora: null };
}

/** Anti-alucinação determinística: só contam evidências que SÃO substring
 *  (normalizada) da entrada do usuário. Evidência inventada derruba a
 *  resolução — a interpretação NÃO ganha autoridade por articulação. */
function evidenciasValidasDaEntrada(evidencias: readonly string[], entrada: string): string[] {
  const normEntrada = normalizar(entrada);
  return evidencias.filter((e) => e.trim().length >= 2 && normEntrada.includes(normalizar(e)));
}

/** Resultado composto final respeitando REGRA-PARA-INDEFINIDA (A/B/C). */
export interface EntendimentoResolvido extends Omit<EntendimentoObjetivo, "status"> {
  readonly status: StatusEntendimento;
  /** Presente quando a CAMADA 2 participou (mesmo quando falhou/marcou). */
  readonly grounding?: {
    readonly estrutura: GroundingEstrutura | null;
    /** "joia resolvida" | "joia precisa-confirmar" | "fallback-falha" */
    readonly modo: "resolvida" | "precisa-confirmar" | "fallback-falha";
    /** evidencias que SOBREVIVERAM à validação anti-alucinação. */
    readonly evidenciasValidadas: readonly string[];
  };
}

export interface OpcoesResolucao {
  /** CAMADA 1 como DADO (permite mutation check: tabela sem categoria). */
  readonly categorias?: readonly CategoriaComercial[];
  /** Desliga a chamada cognitiva (testes 100% determinísticos). */
  readonly desligarCamada2?: boolean;
}

/**
 * RESOLVER (camada 1 fast-path → camada 2 grounding geral).
 * Status que sai daqui NUNCA é "indefinida-livre": quem não resolveu
 * desce deliberadamente para B/C (PRECISA_CONFIRMAR / neutro declare),
 * nunca para escolha silenciosa de especialista.
 */
export async function resolverEntendimento(
  objetivoLivre: string,
  gerar: GeradorIA,
  opcoes: OpcoesResolucao = {}
): Promise<EntendimentoResolvido> {
  // CAMADA 1 — FAST PATH DETERMINÍSTICO (otimização + conflito conhecido)
  const base = opcoes.categorias
    ? analisarObjetivoLivreCom(objetivoLivre, opcoes.categorias)
    : analisarObjetivoLivre(objetivoLivre);

  if (base.status === "resolvida") return base; // seguro sem custo cognitivo
  if (opcoes.desligarCamada2) return base;      // chamador decidiu: camada 1 exato (testes)

  // CAMADA 2 — GROUNDING SEMÂNTICO GERAL via cognição existente
  let estrutura: GroundingEstrutura | null = null;
  try {
    const resposta = await gerar({
      userCommand: objetivoLivre,
      agentContract: {
        id: "entendimento-canonical",
        versao: "1.0.0",
        conteudo: PROMPT_GROUNDING_ESTRUTURA,
      },
      dados: [],
    });
    estrutura = resposta.texto ? extrairJsonGrounding(resposta.texto) : null;
  } catch {
    estrutura = null;
  }

  if (estrutura === null) {
    // (C) fallback honesto: neutro dedeliberado, SEM liberdade implícita
    return {
      ...base,
      status: base.status === "ambigua" ? base.status : "precisa-confirmar",
      grounding: { estrutura: null, modo: "fallback-falha", evidenciasValidadas: [] },
    };
  }

  // ARC-01F BLOCKER-FIX (P1/P3) — autoridade NÃO nasce de autodeclaração:
  // (i) evidência precisa EXISTIR *afirmada* na entrada (negação não sustenta);
  // (ii) a relação evidência→interpretação precisa de ÂNCORA: pelo menos um
  //     token significativo de (interpretação ∪ categoria) afirmado na entrada.
  // (iii) os 3 critérios restantes seguem fail-closed, mas AGORA há verificação
  //     independente do mesmo grounding. Sem âncora → precisa-confirmar.
  const existentes = evidenciasValidasDaEntrada(estrutura.evidencias_da_entrada, objetivoLivre);
  const validadas = existentes.filter((e) => termoEmContextoAfirmativo(objetivoLivre, e));
  const zonaNucleo = zonaNucleoDoObjeto(base.extracao.objetoOriginal);
  const relacao = relacaoSuportadaPelaEntrada(
    objetivoLivre,
    estrutura.interpretacao_proposta,
    estrutura.categoria_ou_tipo,
    validadas,
    zonaNucleo
  );
  const temAlternativas = estrutura.alternativas_plausiveis.length >= 1;
  const confiancaBaixa = estrutura.confianca_qualitativa === "baixa";
  const semEvidencia = validadas.length === 0;
  const semSuporte = !relacao.suportada;
  const deveConfirmar =
    estrutura.precisa_confirmar || temAlternativas || confiancaBaixa || semEvidencia || semSuporte;

  if (!deveConfirmar) {
    // (A) interpretação geral obtida COM evidência da própria entrada
    return {
      extracao: base.extracao,
      status: "resolvida-geral",
      categoria: {
        id: `geral-${estrutura.categoria_ou_tipo ? normalizar(estrutura.categoria_ou_tipo).replace(/\s+/g, "-").slice(0, 40) : "entrada"}`,
        rotulo: estrutura.categoria_ou_tipo || estrutura.interpretacao_proposta,
        evidencias: validadas,
        porScore: 0,
      },
      grounding: { estrutura, modo: "resolvida", evidenciasValidadas: validadas },
    };
  }

  // (B) PRECISA_CONFIRMAR — ambiguidade/confiança insuficiente é preservada
  return {
    extracao: base.extracao,
    status: base.status === "ambigua" ? base.status : "precisa-confirmar",
    ...(base.status === "ambigua" ? { ambiguidade: base.ambiguidade } : {}),
    ambiguidade: base.ambiguidade ?? {
      objeto: base.extracao.detectado ? base.extracao.objetoOriginal : estrutura.objeto_literal,
      candidatas: estrutura.alternativas_plausiveis.slice(0, 4).map((alt, idx) => ({
        id: `alt-${idx}`,
        rotulo: alt.length > 80 ? `${alt.slice(0, 77)}…` : alt,
      })),
    },
    grounding: { estrutura, modo: "precisa-confirmar", evidenciasValidadas: validadas },
  };
}

/** CAMADA 1 parametrizada por DADO (igual lógica; usada por mutation). */
export function analisarObjetivoLivreCom(
  objetivoLivre: string,
  categorias: readonly CategoriaComercial[]
): EntendimentoObjetivo {
  const extracao = extrairObjeto(objetivoLivre);
  const norm = extracao.objetoNormalizado;
  const tokens = norm.split(" ").filter(Boolean);
  const pontuacao = categorias.map((categoria) => {
    const fortes: string[] = [];
    const fracas: string[] = [];
    for (const sinal of categoria.sinaisFortes) {
      const { evidencia } = sinalPresente(norm, tokens, sinal);
      if (evidencia) fortes.push(evidencia);
    }
    for (const sinal of categoria.sinaisFracos) {
      const { evidencia } = sinalPresente(norm, tokens, sinal);
      if (evidencia) fracas.push(evidencia);
    }
    return { categoria, fortes, fracas, score: fortes.length * 2 + fracas.length * 1 };
  })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);
  const lider = pontuacao[0];
  const segunda = pontuacao[1];
  if (lider && lider.score >= 2 && (!segunda || lider.score > segunda.score)) {
    return {
      extracao,
      status: "resolvida",
      categoria: { id: lider.categoria.id, rotulo: lider.categoria.rotulo, evidencias: [...lider.fortes, ...lider.fracas], porScore: lider.score },
    };
  }
  for (const token of tokens) {
    const cand = candidatasPorObjetoCom(token, categorias);
    if (cand.length >= 2) {
      return {
        extracao,
        status: "ambigua",
        ambiguidade: { objeto: token, candidatas: cand.map((c) => ({ id: c.id, rotulo: c.rotulo })) },
      };
    }
  }
  return { extracao, status: "indefinida" };
}

function candidatasPorObjetoCom(token: string, categorias: readonly CategoriaComercial[]): CategoriaComercial[] {
  return categorias.filter((c) => c.objetosPolissemicos.some((o) => tokenBate(token, normalizar(o))));
}
