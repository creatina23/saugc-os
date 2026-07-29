import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface PagePlaceholderProps {
  icon: LucideIcon;
  module: string;
  title: string;
  description: string;
  stage: string;
}

export function PagePlaceholder({
  icon: Icon,
  module,
  title,
  description,
  stage,
}: PagePlaceholderProps) {
  return (
    <Card className="bg-grid relative overflow-hidden">
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-pulse rounded-2xl bg-primary/20 blur-xl" />
          <div className="relative flex size-16 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-primary/20 to-ai/20">
            <Icon className="size-7 text-primary" />
          </div>
        </div>
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">{module}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
        <Badge variant="outline" className="mt-6">
          {stage}
        </Badge>
      </div>
    </Card>
  );
}