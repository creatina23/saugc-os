import { Skeleton } from "@/components/ui/skeleton";

const barHeights = [42, 58, 36, 72, 55, 84];

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando página…</span>

      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`kpi-${i}`} className="glass-panel space-y-3 rounded-2xl p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-panel space-y-4 rounded-2xl p-5 lg:col-span-2">
          <Skeleton className="h-5 w-44" />
          <div className="flex h-48 items-end gap-3">
            {barHeights.map((height, i) => (
              <Skeleton
                key={`bar-${i}`}
                className="flex-1"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
        <div className="glass-panel space-y-3 rounded-2xl p-5">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`row-${i}`} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}