// Utilitários INTERNOS da camada de serviços.
// Uso exclusivo dos arquivos *.service.ts (não sai daqui).

/** Normaliza texto para buscas (sem espaços extras, minúsculo). */
export const normalize = (value: string): string => value.trim().toLowerCase();

/** Verifica se o campo contém o termo buscado (query já normalizada). */
export const matches = (field: string, normalizedQuery: string): boolean =>
  normalize(field).includes(normalizedQuery);