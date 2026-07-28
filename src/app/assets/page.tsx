"use client";

import { useMemo, useState } from "react";
import { Download, Film } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { assets } from "@/lib/mock-data";
import type { AssetCategory } from "@/types";

const categories: AssetCategory[] = [
  "Video Ads",
  "Hook Clips",
  "B-Roll",
  "Product Photos",
];

export default function AssetsPage() {
  const [category, setCategory] = useState<AssetCategory | "Todos">("Todos");

  const filtered = useMemo(
    () => assets.filter((a) => category === "Todos" || a.category === category),
    [category]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        title="Assets"
        description="Galeria de criativos digitais com formatos, resolução e tags."
        actions={<Button variant="outline">Upload (mock)</Button>}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={category === "Todos" ? "default" : "outline"}
          onClick={() => setCategory("Todos")}
        >
          Todos
        </Button>
        {categories.map((c) => (
          <Button
            key={c}
            size="sm"
            variant={category === c ? "default" : "outline"}
            onClick={() => setCategory(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((asset) => (
          <Card key={asset.id} className="overflow-hidden">
            <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-white/5 to-violet-500/10">
              <Film className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <CardContent className="space-y-3 p-4">
              <div>
                <p className="truncate text-sm font-medium">{asset.name}</p>
                <p className="text-xs text-muted-foreground">{asset.client}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline">{asset.format}</Badge>
                <Badge variant="muted">{asset.resolution}</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {asset.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
