// TR-04.8D.2c-3B: cores de status COMPARTILHADAS (status-card.tsx e
// estado-operacao.tsx) — extraídas 1:1 de status-card.tsx para evitar
// duplicação. Mesma semântica dos módulos; status desconhecido recebe cor
// neutra — a informação nunca depende só da cor (legenda com nome +
// contagem sempre visível).
export const CORES_STATUS: Record<string, string> = {
  Ativa: "bg-success",
  Aprovado: "bg-success",
  Pausada: "bg-warning",
  "Em Aprovação": "bg-warning",
  Revisão: "bg-warning",
  Produção: "bg-primary",
  Rascunho: "bg-muted-foreground",
  "Sem status": "bg-border",
  "Sem categoria": "bg-border",
};

export const COR_STATUS_NEUTRA = "bg-muted-foreground/60";
