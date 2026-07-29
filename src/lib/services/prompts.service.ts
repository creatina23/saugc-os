// Camada de serviços — módulo PROMPTS.

import { prompts } from "@/lib/mock-data";
import type { PromptItem } from "@/types";
import { matches, normalize } from "./_utils";

export const promptsService = {
  /** Lista todos os prompts. */
  list: (): PromptItem[] => prompts,

  /** Busca um prompt pelo id. */
  getById: (id: string): PromptItem | undefined =>
    prompts.find((prompt) => prompt.id === id),

  /** Filtra prompts compatíveis com um modelo (ex.: "GPT-4o"). */
  filterByModel: (model: string): PromptItem[] =>
    prompts.filter((prompt) => prompt.models.includes(model)),

  /** Busca livre por título, descrição ou tag. */
  search: (query: string): PromptItem[] => {
    const q = normalize(query);
    if (!q) return prompts;
    return prompts.filter(
      (prompt) =>
        matches(prompt.title, q) ||
        matches(prompt.description, q) ||
        prompt.tags.some((tag) => matches(tag, q))
    );
  },

  /** Extrai as variáveis {chave} de um texto de prompt (sem repetir). */
  extractVariables: (content: string): string[] => {
    const variables = new Set<string>();
    for (const match of content.matchAll(/\{([^{}]+)\}/g)) {
      const variable = match[1];
      if (variable) variables.add(variable);
    }
    return [...variables];
  },
};