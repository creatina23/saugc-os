export type ClientTier = "Enterprise" | "Growth" | "Starter";
export type ClientStatus = "Ativo" | "Inativo" | "Em onboarding";

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  tier: ClientTier;
  status: ClientStatus;
  mrr: number;
  logoInitials: string;
  since: string;
}

export type CampaignPlatform = "Meta Ads" | "Google Ads" | "TikTok";
export type CampaignStatus = "Ativa" | "Pausada" | "Rascunho";

export interface Campaign {
  id: string;
  name: string;
  client: string;
  platform: CampaignPlatform;
  status: CampaignStatus;
  budget: number;
  spend: number;
  impressions: number;
  ctr: number;
  stage: string;
}

export type BriefingStatus = "Em Aprovação" | "Aprovado" | "Rascunho";

export interface Briefing {
  id: string;
  title: string;
  client: string;
  creator: string;
  status: BriefingStatus;
  deadline: string;
  tags: string[];
}

export type DealStage =
  | "Qualificação"
  | "Proposta Enviada"
  | "Negociação"
  | "Contrato Fechado";

export interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: DealStage;
  owner: string;
  probability: number;
}

export type AssetFormat = "MP4" | "MOV" | "PNG" | "JPG" | "GIF";
export type AssetCategory = "Video Ads" | "Hook Clips" | "B-Roll" | "Product Photos";

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  format: AssetFormat;
  resolution: string;
  tags: string[];
  client: string;
  updatedAt: string;
}

export type LibraryCategory =
  | "UGC Script Templates"
  | "Ad Copy Hooks"
  | "Creator Guidelines"
  | "Strategy Guides";

export interface LibraryItem {
  id: string;
  title: string;
  category: LibraryCategory;
  description: string;
  updatedAt: string;
  author: string;
}

export interface PromptItem {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  models: string[];
  parameters: Record<string, string | number>;
}

export interface ActivityLog {
  id: string;
  message: string;
  timestamp: string;
  type: "campaign" | "deal" | "client" | "asset" | "system";
}

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

export interface RevenuePoint {
  month: string;
  value: number;
}
