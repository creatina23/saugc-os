// Camada de serviços — módulo NOTIFICAÇÕES.
// Read-only: "marcar como lida" só chega quando o backend existir.

import { notifications } from "@/lib/mock-data";
import type { AppNotification } from "@/types";

export const notificacoesService = {
  /** Lista todas as notificações. */
  list: (): AppNotification[] => notifications,

  /** Lista apenas as não lidas. */
  getUnread: (): AppNotification[] =>
    notifications.filter((notification) => notification.unread),

  /** Quantidade de não lidas (badge do sino no header). */
  getUnreadCount: (): number =>
    notifications.filter((notification) => notification.unread).length,
};