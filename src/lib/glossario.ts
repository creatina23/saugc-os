// TR-04.8D.3.4.7 — GLOSSÁRIO DO ANUNCIA (fonte única de explicações).
// ======================================================================
// Princípio: a linguagem profissional fica NA SUPERFÍCIE (siglas curtas e
// consolidadas NÃO viram parágrafos); a explicação vive sob demanda, a um
// clique/toque — e MORA AQUI, nunca hardcoded nos componentes.
//
// Conteúdo honesto: nenhum número inventado, nenhuma promessa, nenhuma
// estatística de mercado. Exemplos usam números hipotéticos explícitos.
//
// UX-04 (níveis — princípio, não máquina): este arquivo serve NÍVEL 1
// (sigla/métrica, explicação curta sob demanda) e NÍVEL 2 (conceito de
// decisão: nome completo + significado + exemplo + por que importa).
// NÍVEL 3 (ação sensível: explicação ANTES da confirmação) NÃO vem daqui —
// é responsabilidade do fluxo de confirmação, que já existe no Command
// Center. Termos cotidianos (NÍVEL 0) NUNCA entram aqui.
//
// Reutilizável: qualquer tela do AnuncIA pode renderizar
// `<TermoInfo slug="..." />` (src/components/ui/termo-info.tsx).

export interface EntradaGlossario {
  /** Termo como aparece na interface (sigla ou palavra profissional). */
  termo: string;
  /** Nome completo (no idioma original, quando sigla). */
  nomeCompleto?: string;
  /** Tradução para o português. */
  traducao?: string;
  /** Significado em uma frase, sem jargão. */
  explicacao: string;
  /** Exemplo numérico hipotético (sempre deixa claro que é exemplo). */
  exemplo?: string;
  /** Por que isso importa para a decisão do negócio. */
  porQueImporta?: string;
}

export const GLOSSARIO: Record<string, EntradaGlossario> = {
  // --------------------- Métricas de anúncios ---------------------
  ctr: {
    termo: "CTR",
    nomeCompleto: "Click-Through Rate",
    traducao: "Taxa de Cliques",
    explicacao:
      "Percentual de pessoas que clicaram no anúncio depois de visualizá-lo.",
    exemplo:
      "Se 1.000 pessoas viram o anúncio e 30 clicaram, o CTR é 3%.",
    porQueImporta:
      "Ajuda a entender se o anúncio está despertando interesse em quem vê.",
  },
  cpc: {
    termo: "CPC",
    nomeCompleto: "Cost Per Click",
    traducao: "Custo por Clique",
    explicacao: "Quanto você paga, em média, por cada clique no anúncio.",
    exemplo: "Se você investiu R$ 100 e recebeu 50 cliques, o CPC é R$ 2.",
    porQueImporta:
      "Mostra quanto custa atrair um visitante — essencial para comparar anúncios.",
  },
  cpm: {
    termo: "CPM",
    nomeCompleto: "Cost Per Mille",
    traducao: "Custo por Mil Impressões",
    explicacao:
      "Quanto você paga para o anúncio ser exibido mil vezes.",
    exemplo: "Com CPM de R$ 20, mil exibições do anúncio custam R$ 20.",
    porQueImporta:
      "Indica o custo de ganhar visibilidade, antes mesmo de qualquer clique.",
  },
  cpa: {
    termo: "CPA",
    nomeCompleto: "Cost Per Acquisition",
    traducao: "Custo por Aquisição",
    explicacao:
      "Quanto você paga, em média, por cada resultado conquistado (venda, cadastro etc.).",
    exemplo:
      "Se você investiu R$ 500 e conseguiu 10 vendas, o CPA é R$ 50 por venda.",
    porQueImporta:
      "É o custo do resultado que importa — permite comparar com o lucro de cada venda.",
  },
  cac: {
    termo: "CAC",
    nomeCompleto: "Customer Acquisition Cost",
    traducao: "Custo de Aquisição de Cliente",
    explicacao:
      "Quanto a empresa gasta, somando marketing e vendas, para conquistar um cliente novo.",
    porQueImporta:
      "Se o CAC for maior do que o lucro que o cliente gera, o crescimento prejuíza o caixa.",
  },
  roas: {
    termo: "ROAS",
    nomeCompleto: "Return on Ad Spend",
    traducao: "Retorno sobre o Investimento em Anúncios",
    explicacao:
      "Quanto de receita cada real investido em anúncio gerou.",
    exemplo:
      "Se você investiu R$ 100 e os anúncios geraram R$ 400 em vendas, o ROAS é 4x.",
    porQueImporta:
      "Mostra se o dinheiro do anúncio está voltando — abaixo de 1x significa pagar mais do que recebe.",
  },
  roi: {
    termo: "ROI",
    nomeCompleto: "Return on Investment",
    traducao: "Retorno sobre o Investimento",
    explicacao:
      "Quanto o investimento gerou de resultado, considerando ganhos e custos.",
    porQueImporta:
      "É a medida central para saber se um investimento vale a pena.",
  },
  ltv: {
    termo: "LTV",
    nomeCompleto: "Lifetime Value",
    traducao: "Valor do Cliente ao Longo do Relacionamento",
    explicacao:
      "Quanto um cliente costuma gerar de receita durante todo o tempo de relação com a empresa.",
    porQueImporta:
      "Ajuda a decidir quanto faz sentido investir para conquistar cada cliente.",
  },
  // --------------------- Conceitos de marketing ---------------------
  lead: {
    termo: "Lead",
    traducao: "Potencial cliente",
    explicacao:
      "Pessoa que demonstrou interesse e deixou um contato (ex.: telefone ou e-mail).",
    porQueImporta:
      "É a porta de entrada do processo comercial — sem lead, não há negociação.",
  },
  conversao: {
    termo: "Conversão",
    explicacao:
      "Quando alguém realiza a ação que o anúncio ou a página se propõe (comprar, cadastrar-se, chamar no WhatsApp etc.).",
    exemplo:
      "Se 100 pessoas visitam a página e 5 fazem o cadastro, houve 5 conversões.",
    porQueImporta:
      "É o resultado que justifica o investimento — cliques sem conversão não pagam contas.",
  },
  impressoes: {
    termo: "Impressões",
    explicacao: "Quantas vezes o anúncio foi exibido.",
    porQueImporta:
      "É a base da visibilidade: sem impressões, ninguém vê — mas impressão não é clique nem venda.",
  },
  alcance: {
    termo: "Alcance",
    explicacao: "Quantas pessoas diferentes viram o anúncio pelo menos uma vez.",
    porQueImporta:
      "Difere de impressões: uma pessoa que vê 3 vezes conta 1 no alcance e 3 nas impressões.",
  },
  frequencia: {
    termo: "Frequência",
    explicacao: "Em média, quantas vezes cada pessoa viu o anúncio.",
    porQueImporta:
      "Frequência muito alta pode indicar repetição excessiva e cansaço do público.",
  },
  remarketing: {
    termo: "Remarketing",
    explicacao:
      "Exibir anúncios novamente para quem já interagiu com você (visitou o site, por exemplo).",
    porQueImporta:
      "Quem já demonstrou interesse costuma responder mais a um novo contato.",
  },
  funil: {
    termo: "Funil",
    explicacao:
      "A jornada do possível cliente em etapas — do primeiro contato até a compra. Cada etapa costuma ter menos gente que a anterior.",
    porQueImporta:
      "Ajuda a enxergar em que etapa os interessados estão se perdendo.",
  },
  "ticket-medio": {
    termo: "Ticket médio",
    explicacao: "Valor médio de cada venda ou negociação.",
    exemplo:
      "Se 10 vendas somaram R$ 5.000, o ticket médio é R$ 500.",
    porQueImporta:
      "Combinado com o volume, define o faturamento — e orienta quanto investir para vender.",
  },
  atribuicao: {
    termo: "Atribuição",
    explicacao:
      "Identificar qual canal ou anúncio foi responsável por um resultado (uma venda, por exemplo).",
    porQueImporta:
      "Sem atribuição, não dá para saber onde o investimento está funcionando.",
  },
  pixel: {
    termo: "Pixel",
    explicacao:
      "Pequeno código instalado no site que registra visitas e ações, usado para medir resultados de anúncios.",
    porQueImporta:
      "É o que permite saber se quem clicou no anúncio virou cliente de verdade.",
  },
  "publico-semelhante": {
    termo: "Público semelhante",
    explicacao:
      "Audiência criada automaticamente com pessoas parecidas com seus clientes atuais.",
    porQueImporta:
      "Amplia o alcance mantendo o perfil de quem já compra.",
  },
  cta: {
    termo: "CTA",
    nomeCompleto: "Call to Action",
    traducao: "Chamada para Ação",
    explicacao:
      "Convite direto para a ação desejada (ex.: \"Compre agora\", \"Fale conosco\").",
    porQueImporta:
      "Sem chamada clara, o interessado pode não saber qual é o próximo passo.",
  },
  // --------------------- Métricas do negócio (SaaS/B2B) ---------------------
  mrr: {
    termo: "MRR",
    nomeCompleto: "Monthly Recurring Revenue",
    traducao: "Receita Recorrente Mensal",
    explicacao: "Soma da receita que se repete todo mês (assinaturas, contratos).",
    porQueImporta:
      "É a receita previsível da empresa — a base para planejar crescimento.",
  },
  pipeline: {
    termo: "Pipeline",
    explicacao:
      "Soma do valor de todas as negociações em andamento (ainda não fechadas).",
    porQueImporta:
      "Mostra quanto dinheiro pode entrar — pipeline ainda não é receita confirmada.",
  },
};

/** Busca tolerante: undefined quando o termo não está catalogado (o
 *  componente decide não renderizar nada — nunca inventa explicação). */
export function entradaDoGlossario(slug: string): EntradaGlossario | undefined {
  return GLOSSARIO[slug];
}
