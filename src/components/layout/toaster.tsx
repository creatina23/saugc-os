"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import {
  dismissToast,
  getToasts,
  subscribeToasts,
  type ToastItem,
} from "@/lib/toast";
import { cn } from "@/lib/utils";

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
} as const;

const toastTone = {
  success: "text-success",
  error: "text-destructive",
  info: "text-info",
  warning: "text-warning",
} as const;

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>(() => getToasts());

  useEffect(() => subscribeToasts(setItems), []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-[80] flex w-[340px] flex-col gap-2"
    >
      {items.map((item) => {
        const Icon = toastIcons[item.type];
        return (
          <div
            key={item.id}
            className="animate-fade-in pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-2xl"
          >
            <Icon className={cn("mt-0.5 size-4 shrink-0", toastTone[item.type])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.title}</p>
              {item.description ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              aria-label="Fechar notificação"
              className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}