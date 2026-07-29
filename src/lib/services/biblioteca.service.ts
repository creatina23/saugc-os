// Camada de serviços — módulo BIBLIOTECA.

import { libraryItems } from "@/lib/mock-data";
import type { LibraryCategory, LibraryItem } from "@/types";
import { matches, normalize } from "./_utils";

export const bibliotecaService = {
  /** Lista todos os itens da biblioteca. */
  list: (): LibraryItem[] => libraryItems,

  /** Busca um item pelo id. */
  getById: (id: string): LibraryItem | undefined =>
    libraryItems.find((item) => item.id === id),

  /** Filtra por categoria. */
  filterByCategory: (category: LibraryCategory): LibraryItem[] =>
    libraryItems.filter((item) => item.category === category),

  /** Busca livre por título, descrição ou autor. */
  search: (query: string): LibraryItem[] => {
    const q = normalize(query);
    if (!q) return libraryItems;
    return libraryItems.filter(
      (item) =>
        matches(item.title, q) ||
        matches(item.description, q) ||
        matches(item.author, q)
    );
  },
};
