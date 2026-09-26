// TR-04.8D.3.1 — COMMAND CENTER CONTRACTS V1 (domínio puro, sem runtime).
// ======================================================================
// Contratos TypeScript PUROS para a futura camada de prioridades (8D.3.2).
// Nada aqui executa: sem React, sem Next, sem Supabase, sem IA, sem IO,
// sem relógio, sem aleatoriedade, sem imports de runtime (tudo é type).
//
// PRINCÍPIO CENTRAL (congelado pelo dono):
//   Signal ≠ Attention ≠ Priority ≠ Recommendation ≠ Action ≠ Execution
//   ≠ Result. Estes contratos existem para tornar difícil misturá-los:
//   - NÃO existe type Recommendation neste arquivo (§15 da unidade);
//   - Priority NÃO contém recommendedAction / bestAction / shouldDo;
//   - ActionCandidate NÃO é recomendação: é uma ação DISPONÍVEL que o
//     sistema pode executar quando o humano decidir — nunca "a ação
//     que o sistema acha certa";
//   - Priority V1 NÃO é recomendação: representa "existe uma situação
//     factual que merece determinada classe de atenção operacional,
//     sustentada por evidências renderizáveis" (definição do dono).
//
// RELAÇÃO COM O ATTENTION ENGINE (decisão D1): o motor de sinais
// (src/lib/attention.ts) permanece independente e imutável; o futuro
// Priority Engine CONSOME seus sinais. Por isso este arquivo importa
// TIPOS do motor (import type — zero dependência de runtime, zero risco
// de ciclo: attention.ts não importa nada daqui).
//
// JSON-SAFE (§19): todos os campos são string/number/boolean/array/objeto
// simples. Sem Date, Map, Set, funções ou classes — datas são ISO string
// documentadas. Pronto para persistência/API futura sem reconstrução.
//
// YAGNI (decisões D3/§14): este arquivo NÃO contém status de lifecycle
// persistente, executor, Policy Engine, Memory, score, peso ou ranking.
// Persistência futura (priorities/actions/outcomes) é prevista pelo
// design (ids estáveis + JSON-safe), mas nenhum contrato de storage é
// criado agora.

import type { EvidenciaSinal, NivelAtencao } from "./attention";

// ---------------------------------------------------------------------------
// CLASSE DE ATENÇÃO OPERACIONAL
// ---------------------------------------------------------------------------
// Alias deliberado (§3): a classe de uma prioridade É exatamente a mesma
// semântica do nível de atenção do motor ("prioridade" | "acompanhar" |
// "informacao") — não são duas coisas parecidas, é o mesmo domínio: a
// prioridade herda a classe do sinal que a originou. O acoplamento é
// type-only e unidirecional; o motor é imutável por regra da casa, logo a
// union não muda sem autorização do dono. Se um dia divergirem, substituir
// este alias por uma union própria — e NUNCA criar critical/high/medium/low
// nem score numérico nem peso oculto.
export type ClassePrioridade = NivelAtencao;

// ---------------------------------------------------------------------------
// CONFIANÇA EPISTÊMICA (§7) — NÃO É PROBABILIDADE
// ---------------------------------------------------------------------------
// Union semântica deliberadamente NÃO numérica (proteção: confidence nunca
// vira score — não há mapeamento para 0..1 e não há ordenação implícita).
// - "factual": calculada por regra determinística sobre dados reais.
//   Prioridade do futuro motor de regras é normalmente factual.
// - "inferida-ia": conteúdo produzido por modelo probabilístico. Rótulo
//   inalienável — NUNCA sobe para "factual", por melhor que pareça.
// - "precisa-confirmacao": evidência insuficiente/ambígua; o sistema afirma
//   explicitamente que um humano precisa confirmar antes de agir.
export type ConfiancaEpistemica =
  | "factual"
  | "inferida-ia"
  | "precisa-confirmacao";

// ---------------------------------------------------------------------------
// REFERÊNCIA DE ENTIDADE (§4)
// ---------------------------------------------------------------------------
// Fontes = nomes REAIS das tabelas (provenance auditável). Os rótulos de
// fonte do motor de attention ("campanhas", "briefings"...) são mapeados
// para estes nomes pela camada do Priority Engine — o mapeamento mora no
// engine (8D.3.2), não aqui.
//
// ESCOPO DELIBERADO (revisão 3.1A): estas são as fontes OPERACIONAIS
// elegíveis para Priority V1 — NÃO "todas as tabelas que existem". A
// tabela library_items EXISTE no produto (repositório de conhecimento:
// título/categoria/autor/conteúdo — ver biblioteca-view.tsx, COLUNAS) e
// FOI EXCLUÍDA de propósito: é conhecimento passivo, sem ciclo operacional
// (sem status/deadline/métricas) e nenhuma regra atual ou prevista para
// 8D.3.2 emite sinal/prioridade sobre ela. Incluí-la agora seria inventar
// capacidade. Quando existir regra real sobre ela (ou sobre qualquer fonte
// nova), ela entra nesta union com um literal — evolução de uma linha,
// não reconstrução.
export type FonteEntidade =
  | "clients"
  | "campaigns"
  | "deals"
  | "briefings"
  | "commercials"
  | "assets";

export interface ReferenciaEntidade {
  readonly fonte: FonteEntidade;
  /** Id REAL da linha na tabela (o mesmo usado no id do sinal). */
  readonly id: string;
  /** Vínculo com o cliente como ele EXISTE hoje: texto solto (client_name),
   *  sem FK. NÃO é clientId, NÃO garante join, NÃO finge integridade
   *  referencial — duas campanhas com o mesmo client_name não provam ser do
   *  mesmo cliente. Quando o schema tiver FK de verdade, este campo evolui. */
  readonly clientName?: string;
}

// ---------------------------------------------------------------------------
// EVIDÊNCIA (§5) — estruturada, crua e renderizável
// ---------------------------------------------------------------------------
// Separação MATERIALIZADA (revisão 3.1A). EvidenciaPrioridade NÃO é mais
// alias da union fechada do Attention Engine: é uma union PRÓPRIA que
// (1) INCLUI toda EvidenciaSinal como válida — todo sinal V1 vira evidência
// de prioridade sem conversão — e (2) aceita variantes tipadas do futuro
// Priority Engine SEM modificar attention.ts (a union vive AQUI).
//
// Contrato para variantes (§5/§17 do 3.1, mantido): discriminador `tipo`
// obrigatório (string literal, kebab-case como no motor); campos crus com
// tipos literais; unidade/semântica quando necessária; só dados JSON-safe;
// nunca texto pré-formatado como fonte de verdade. VETADO escape hatch
// genérico (Record<string, unknown>, payload: any, data: unknown) — toda
// variante declara exatamente o que carrega. A proveniência global da
// prioridade mora em `origem`; variantes futuras que cruzarem engines
// (Operational State, Growth Graph, Proof Vault, Memory, Experiments...)
// podem refinar proveniência dentro da própria variante — SEM importar
// módulos que ainda não existem e SEM inventar evidências especulativas:
// só entra variante já sustentada por dados reais e prevista em unidade.

/** ÚNICA variante própria do motor de prioridades materializada agora
 *  (3.1A) — arquiteturalmente justificável porque os dados JÁ EXISTEM
 *  (campaigns.budget e campaigns.spend constam do select real) e a regra
 *  futura está prevista para 8D.3.2 ("orçamento consumido"). SOMENTE
 *  CONTRATO: nenhum cálculo nem regra aqui.
 *  Unidades: budget e spend em R$ crus da tabela; percentualConsumido =
 *  spend ÷ budget × 100 (≥ 0; PODE exceder 100 — estouro de orçamento é
 *  fato, não erro de dado). A pré-condição budget > 0 pertence à futura
 *  regra, não ao tipo: a evidência só deve materializar o fato quando a
 *  regra disparar. */
export interface EvidenciaOrcamentoConsumido {
  readonly tipo: "orcamento-consumido";
  /** Orçamento configurado (campaigns.budget), em R$. */
  readonly budget: number;
  /** Gasto acumulado registrado (campaigns.spend), em R$. */
  readonly spend: number;
  /** spend ÷ budget × 100 — derivado dos dois números acima (≥ 0). */
  readonly percentualConsumido: number;
}

export type EvidenciaPrioridade =
  | EvidenciaSinal
  | EvidenciaOrcamentoConsumido;

// ---------------------------------------------------------------------------
// ORIGEM / PROVENANCE (§8) — um único conceito: `origem`
// ---------------------------------------------------------------------------
// Union discriminada por engine (type safety, §18):
// - "rules": motor de regras determinístico. `motor` NÃO EXISTE aqui —
//   a union torna impossível declarar motor de IA para origem de regras.
// - "ai": modelo probabilístico. `motor` é OBRIGATÓRIO e registra a
//   identificação real devolvida pela camada de IA (hoje o campo `motor`
//   da /api/ia, ex.: "Groq · llama-3.3-..."). NENHUM provider é inventado
//   ou enumerado neste contrato — o texto vem da execução real.
// `version`: versão do mecanismo gerador (ex.: "priority-1" para regras;
// versão de contrato/prompt quando IA explicar/preparar — decisão da
// camada que gera, documentada lá).
export type OrigemPrioridade =
  | { readonly engine: "rules"; readonly version: string }
  | { readonly engine: "ai"; readonly version: string; readonly motor: string };

// ---------------------------------------------------------------------------
// AÇÃO CANDIDATA (§9–§12) — DISPONÍVEL, NUNCA RECOMENDADA
// ---------------------------------------------------------------------------
// "Candidata" é contrato, não enfeite: o sistema NÃO recomenda executar
// nenhuma destas ações. Elas respondem apenas "o que é POSSÍVEL fazer a
// partir desta prioridade hoje". Não existe campo "recommended",
// "suggested" ou ordenação por preferência aqui.
//
// Categoria × risco (§12): a categoria JÁ expressa o risco suficiente no
// V1 (navigation = leitura; preparation = preparo sem efeito externo;
// internal/external-execution = escrita dentro/fora) — por isso NÃO há
// enum de risk separado (duplicação vetada).
export type CategoriaAcaoCandidata =
  | "navigation" // A — abrir tela/rota
  | "preparation" // B — gerar análise/draft SEM efeito externo
  | "internal-execution" // C — gravação dentro do sistema
  | "external-execution"; // D — efeito fora do sistema (não existe hoje)

// Honestidade de disponibilidade (§10): uma ação que não pode rodar AGORA
// é "unavailable"; uma que depende de capacidade inexistente (ex.: qualquer
// external-execution hoje) é "blocked" — NUNCA apresentada como executável.
// Roadmap ("future") não entra em contrato runtime — fica no relatório.
export type DisponibilidadeAcao = "available" | "unavailable" | "blocked";

interface CandidatoAcaoBase {
  /** Id estável e determinístico (ex.: "nav:campanhas",
   *  "op:briefings:criar"). Âncora para dedup/idempotência futura —
   *  nunca aleatório, nunca índice de array. */
  readonly id: string;
  readonly label: string;
  /** POLICY (§11): DESCREVE requisito — esta ação exige confirmação
   *  humana explícita no momento da execução. NÃO é permissão armazenada
   *  nem grant antecipado: autorização é check em tempo de execução,
   *  fora deste contrato. Não existe Policy Engine no V1. */
  readonly requiresConfirmation: boolean;
}

// Union discriminada por categoria (§18): navigation é link de app —
// carrega `href` obrigatório, está sempre disponível e nunca exige
// confirmação (literais congelados, impossível marcar link como blocked).
// As demais categorias não têm rota: identificam a operação simbólica.
export type CandidatoAcao =
  | (CandidatoAcaoBase & {
      readonly categoria: "navigation";
      readonly href: string;
      readonly availability: "available";
      readonly requiresConfirmation: false;
    })
  | (CandidatoAcaoBase & {
      readonly categoria:
        | "preparation"
        | "internal-execution"
        | "external-execution";
      readonly availability: DisponibilidadeAcao;
      /** Identificador simbólico da operação (ex.: "briefings:criar-a-partir-de-prioridade").
       *  NOME declarativo apenas — nenhum executor existe no V1; quem
       *  interpreta o identificador é a camada de execução futura. */
      readonly operacao?: string;
    });

// ---------------------------------------------------------------------------
// PRIORITY V1 — o contrato central (≠ Recommendation)
// ---------------------------------------------------------------------------
export interface PriorityV1 {
  /** IDENTIDADE (§2): estável e determinística, derivada do sinal —
   *  formato "${ruleId}:${entityId}" (igual ao id do motor) e, para
   *  prioridades de sistema, "${ruleId}:${fonte}". É a chave natural de
   *  deduplicação futura. PROIBIDO: Math.random(), Date.now(), UUID
   *  aleatório, índice de array, texto de título. */
  readonly id: string;

  /** Regra que originou a prioridade. String ABERTA de propósito: o motor
   *  de attention hoje emite "R1".."R6" (union fechada e IMUTÁVEL), mas o
   *  Priority Engine poderá ter regras próprias (ex.: "P2:orcamento-
   *  consumido") sem permissão para editar attention.ts. Referenciar o
   *  texto da regra NÃO acopla ao tipo fechado do motor. */
  readonly ruleId: string;

  /** Entidade de negócio referenciada. null = prioridade DE SISTEMA
   *  (ex.: fonte indisponível — hoje R6): fato sobre a infraestrutura de
   *  dados, não sobre uma linha de negócio. (Espelha GrupoSinais.entidade
   *  null do agrupamento atual.) */
  readonly entidade: ReferenciaEntidade | null;

  readonly classe: ClassePrioridade;

  /** ≥1 evidência conceitualmente. Cruas, tipadas por `tipo` e
   *  RENDERIZÁVEIS sem IA: é isto que responde "Por que estou vendo
   *  isso?" no Command Center. Hoje cada prioridade carrega a evidência
   *  do sinal que a originou; o array existe porque regras futuras podem
   *  juntar evidências corroborantes (o array NÃO funde nem resume nada). */
  readonly evidencias: readonly EvidenciaPrioridade[];

  /** REASON (§6): frase FACTUAL, derivável exclusivamente das evidências
   *  desta prioridade, sem verbos causais ("porque", "devido a", "leva a")
   *  e sem prescrição ("deve", "aumente", "pause"). NÃO é recomendação,
   *  NÃO é análise, NÃO é explicação de IA. Ex.: "Campanha ativa está
   *  abaixo da meta de ROAS configurada." Os textos das regras NÃO são
   *  codificados nesta unidade — o contrato define a SEMÂNTICA; o engine
   *  (8D.3.2) produzirá os textos a partir das evidências. */
  readonly reason: string;

  readonly confidence: ConfiancaEpistemica;

  /** Ações CANDIDATAS (ver CandidatoAcao): possibilidades, não
   *  recomendações. Pode ser vazio (prioridade informativa sem ação). */
  readonly acoes: readonly CandidatoAcao[];

  readonly origem: OrigemPrioridade;

  /** CREATED AT (§13): ISO-8601 do momento em que ESTA PRIORIDADE FOI
   *  CALCULADA. NÃO é: o momento do evento, a data do dado, updated_at de
   *  qualquer tabela (inexistente no produto) nem frescor das fontes.
   *  Nenhuma leitura de staleness pode ser derivada deste campo — a
   *  cobertura das fontes é comunicada separadamente (hoje: banner de
   *  dados parciais + R6). */
  readonly createdAt: string;
}
