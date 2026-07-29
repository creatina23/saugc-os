// Camada de serviços — módulo DASHBOARD.
// ATENÇÃO: os dados de pipeline (pipelineValueByStage) moram no crm.service.
// Aqui ficam apenas KPIs, receita, performance por canal e atividades.

import {
  activityLog,
  campaignPerformance,
  dashboardMetrics,
  revenueTrajectory,
} from "@/lib/mock-data";
import type { ActivityLog, DashboardMetric, RevenuePoint } from "@/types";

export const dashboardService = {
  /** Lista os KPIs do topo do Dashboard. */
  getMetrics: (): DashboardMetric[] => dashboardMetrics,

  /** Série de receita dos últimos meses (gráfico de barras). */
  getRevenueTrajectory: (): RevenuePoint[] => revenueTrajectory,

  /** Log de atividades recentes. */
  getActivityLog: (): ActivityLog[] => activityLog,

  /** Performance por canal (Meta, Google, TikTok). */
  getCampaignPerformance: (): typeof campaignPerformance => campaignPerformance,
};