export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  type: ToastType;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let listeners: ToastListener[] = [];
let counter = 0;

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

export function toast(
  title: string,
  options?: { description?: string; type?: ToastType }
) {
  const id = ++counter;
  toasts = [
    ...toasts,
    { id, title, description: options?.description, type: options?.type ?? "success" },
  ];
  emit();
  setTimeout(() => dismissToast(id), 4000);
}

export function dismissToast(id: number) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

export function getToasts() {
  return toasts;
}

export function subscribeToasts(listener: ToastListener) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}