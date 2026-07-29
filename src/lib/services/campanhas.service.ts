// Camada de serviços — módulo CAMPANHAS.

import { campaigns } from "@/lib/mock-data";
import type { Campaign, CampaignPlatform, CampaignStatus } from "@/types";
import { matches, normalize } from "./_utils";

export const campanhasService = {
  /** Lista todas as campanhas. */
  list: (): Campaign[] => campaigns,

  /** Busca uma campanha pelo id. */
  getById: (id: string): Campaign | undefined =>
    campaigns.find((campaign) => campaign.id === id),

  /** Filtra por status (Ativa, Pausada, Rascunho). */
  filterByStatus: (status: CampaignStatus): Campaign[] =>
    campaigns.filter((campaign) => campaign.status === status),

  /** Filtra por plataforma (Meta Ads, Google Ads, TikTok). */
  filterByPlatform: (platform: CampaignPlatform): Campaign[] =>
    campaigns.filter((campaign) => campaign.platform === platform),

  /** Lista campanhas de um cliente (pelo nome). */
  getByClient: (clientName: string): Campaign[] =>
    campaigns.filter((campaign) => campaign.client === clientName),

  /** Busca livre por nome da campanha ou cliente. */
  search: (query: string): Campaign[] => {
    const q = normalize(query);
    if (!q) return campaigns;
    return campaigns.filter(
      (campaign) => matches(campaign.name, q) || matches(campaign.client, q)
    );
  },
};