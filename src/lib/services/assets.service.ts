// Camada de serviços — módulo ASSETS.

import { assets } from "@/lib/mock-data";
import type { Asset, AssetCategory, AssetFormat } from "@/types";
import { matches, normalize } from "./_utils";

export const assetsService = {
  /** Lista todos os assets. */
  list: (): Asset[] => assets,

  /** Busca um asset pelo id. */
  getById: (id: string): Asset | undefined =>
    assets.find((asset) => asset.id === id),

  /** Filtra por categoria (Video Ads, Hook Clips, B-Roll, Product Photos). */
  filterByCategory: (category: AssetCategory): Asset[] =>
    assets.filter((asset) => asset.category === category),

  /** Filtra por formato (MP4, MOV, PNG, JPG, GIF). */
  filterByFormat: (format: AssetFormat): Asset[] =>
    assets.filter((asset) => asset.format === format),

  /** Lista assets de um cliente (pelo nome). */
  getByClient: (clientName: string): Asset[] =>
    assets.filter((asset) => asset.client === clientName),

  /** Busca livre por nome, cliente ou tag. */
  search: (query: string): Asset[] => {
    const q = normalize(query);
    if (!q) return assets;
    return assets.filter(
      (asset) =>
        matches(asset.name, q) ||
        matches(asset.client, q) ||
        asset.tags.some((tag) => matches(tag, q))
    );
  },
};