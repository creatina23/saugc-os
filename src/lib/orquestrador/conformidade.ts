// src/lib/orquestrador/conformidade.ts — ARC-02B · P1 + P3
export const DEPENDENCIAS_ETAPAS: Readonly<Record<string, readonly string[]>> = {
  comportamento: [], estrategista: ["comportamento"],
  copywriter: ["comportamento", "estrategista"], diretor: ["copywriter"],
  engenheiro: ["diretor"], analista: ["comportamento", "estrategista", "copywriter", "diretor", "engenheiro"],
} as const;
export function matrizDependenciasValida(idsEmOrdem: readonly string[]): boolean {
  for (const [consumidora,deps] of Object.entries(DEPENDENCIAS_ETAPAS)) {
    const idx=idsEmOrdem.indexOf(consumidora); if(idx<0)return false;
    for(const dep of deps){const d=idsEmOrdem.indexOf(dep);if(d<0||d>=idx)return false;}
  } return true;
}
export interface SecaoContrato { readonly nome:string; readonly rx:RegExp; }
export function normalizarParaVerificacao(texto:string):string{return texto.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\*\*?([^*\n]+)\*\*?/g,"$1").replace(/[ \t]+/g," ").toUpperCase();}
function rxSecao(p:string):RegExp{const f=p.replace(/ /g,"\\s+");return new RegExp(`(^|\\n)[#>*\\-\\u2022\\d. )]*${f}[ \\t]*:`,"m");}
const SECOES:Readonly<Record<string,readonly SecaoContrato[]>>={
comportamento:["MAPA DO CONTEXTO","TENSÕES HUMANAS","HIPÓTESES DE COMPORTAMENTO","IMPLICAÇÕES DE COMUNICAÇÃO","FILTRO ÉTICO","PRÓXIMO PASSO"].map(nome=>({nome,rx:rxSecao(nome.normalize("NFD").replace(/[\u0300-\u036f]/g,""))})),
estrategista:[{nome:"OBJETIVO E RESTRIÇÕES",rx:rxSecao("OBJETIVO E RESTRICOES")},{nome:"DIAGNÓSTICO DO FUNIL",rx:rxSecao("DIAGNOSTICO DO FUNIL")},{nome:"MÉTRICA-MESTRE",rx:/(^|\n)[#>*\-•\d. )]*METRICA\s*-\s*MESTRE[ \t]*:/m},{nome:"HIPÓTESES DE CRESCIMENTO",rx:rxSecao("HIPOTESES DE CRESCIMENTO")},{nome:"PRIORIDADE",rx:rxSecao("PRIORIDADE")},{nome:"PLANO DE TESTE",rx:rxSecao("PLANO DE TESTE")},{nome:"PRÓXIMO PASSO",rx:rxSecao("PROXIMO PASSO")}],
copywriter:[{nome:"DIAGNÓSTICO",rx:rxSecao("DIAGNOSTICO")},{nome:"MUDANÇA DE CRENÇA",rx:rxSecao("MUDANCA DE CRENCA")},{nome:"HOOKS (5)",rx:/(^|\n)[#>*\-•\d. )]*HOOKS\s*\(\s*5\s*\)[ \t]*:/m},{nome:"HEADLINES (3)",rx:/(^|\n)[#>*\-•\d. )]*HEADLINES\s*\(\s*3\s*\)[ \t]*:/m},{nome:"CTAS (3)",rx:/(^|\n)[#>*\-•\d. )]*CTAS\s*\(\s*3\s*\)[ \t]*:/m},{nome:"ROTEIRO UGC",rx:rxSecao("ROTEIRO UGC")},{nome:"MAIS FORTE",rx:rxSecao("MAIS FORTE")},{nome:"PONTOS A VALIDAR",rx:rxSecao("PONTOS A VALIDAR")}],
diretor:["OBJETIVO E HIPÓTESE","CONCEITOS","DIREÇÃO ESCOLHIDA","STORYBOARD","CONTINUIDADE E PRODUÇÃO","PONTOS A VALIDAR"].map(nome=>({nome,rx:rxSecao(nome.normalize("NFD").replace(/[\u0300-\u036f]/g,""))})),
engenheiro:[{nome:"PROMPT PT-BR",rx:rxSecao("PROMPT PT-BR")},{nome:"PROMPT IN ENGLISH",rx:rxSecao("PROMPT IN ENGLISH")}],
analista:[{nome:"NOTA: X/10",rx:/(^|\n)[#>*\-•\d. )]*NOTA[ \t]*:[ \t]*\d{1,2}([.,]\d+)?/m},{nome:"JUSTIFICATIVA",rx:rxSecao("JUSTIFICATIVA")},{nome:"OBJETO E LIMITE",rx:rxSecao("OBJETO E LIMITE")},{nome:"CRITÉRIOS",rx:rxSecao("CRITERIOS")},{nome:"CORREÇÕES PRIORITÁRIAS",rx:rxSecao("CORRECOES PRIORITARIAS")},{nome:"VEREDITO",rx:rxSecao("VEREDITO")}]
};
const RX_ANALISTA_NAO_AVALIADO=/STATUS\s*:\s*NAO AVALIADO/;
export interface VeredictoConformidade{readonly conforme:boolean;readonly motivo:"eco"|"secoes-faltantes"|null;readonly faltam:readonly string[];readonly ecoDetectado:boolean;}
export function detectarEcoDeInstrucao(contrato:string,texto:string):boolean{const c=normalizarParaVerificacao(contrato),t=normalizarParaVerificacao(texto),l=c.split("\n")[0].trim(),p=l.length>=40?l.slice(0,80):l;if(p.length>=20&&t.includes(p))return true;return /(^|\n)\s*(METODO|REGRAS|FORMATO)[ \t]*:/m.test(t)&&/(^|\n)\s*(FORMATO )?(OBRIGATORIO )?(DE )?SAIDA[ \t]*:/m.test(t);}
export function verificarConformidadeContrato(personaId:string,contrato:string,texto:string):VeredictoConformidade{
if(typeof texto!=="string"||texto.trim()==="")return{conforme:false,motivo:"secoes-faltantes",faltam:["(texto vazio)"],ecoDetectado:false};
const secoes=SECOES[personaId];if(!secoes)return{conforme:false,motivo:"secoes-faltantes",faltam:[`(sem tabela de contrato para ${personaId})`],ecoDetectado:false};
if(detectarEcoDeInstrucao(contrato,texto))return{conforme:false,motivo:"eco",faltam:[],ecoDetectado:true};
if(personaId==="analista"&&RX_ANALISTA_NAO_AVALIADO.test(normalizarParaVerificacao(texto)))return{conforme:true,motivo:null,faltam:[],ecoDetectado:false};
const norm=normalizarParaVerificacao(texto),faltam=secoes.filter(s=>!s.rx.test(norm)).map(s=>s.nome);return{conforme:faltam.length===0,motivo:faltam.length===0?null:"secoes-faltantes",faltam,ecoDetectado:false};}