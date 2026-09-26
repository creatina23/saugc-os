// TR-04.8D.2c-0: tipos PUROS do Dashboard (sem lógica, sem dependências).
// Tipos de consulta/Truth (Linha*, FonteErro, DadosDashboard, Painel)
// permanecem em src/app/dashboard-view.tsx — o orquestrador da tela.

export interface ReceitaCliente {
  id: string;
  nome: string;
  valor: number;
}

// TR-04.8D.2a: KPI sem "trend" — subtexto apenas factual (fonte/cálculo).
export interface Kpi {
  label: string;
  value: string;
  sub?: string;
}

// TR-04.8D.2a: funil por VALOR (R$) — dados reais de deals.value/stage.
export interface FunilValorEtapa {
  stage: string;
  valor: number;
  quantidade: number;
}

export interface CanalPerformance {
  platform: string;
  spend: number;
  impressions: number;
  clicks: number;
  revenue: number;
  conversions: number;
}

export interface Atividade {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

// TR-04.8D.2b: contagem real por status/categoria (sem categoria inventada)
export interface ContagemRotulo {
  rotulo: string;
  quantidade: number;
}

// TR-04.8D.2b: ROAS real vs meta — somente campanhas com meta válida.
// roasReal = null quando spend = 0 (ROAS "—", sem classificação).
export interface RoasMeta {
  id: string;
  nome: string;
  roasReal: number | null;
  meta: number;
}

export interface TopCampanha {
  id: string;
  nome: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface MesCadencia {
  chave: string;
  rotulo: string;
  total: number;
}
