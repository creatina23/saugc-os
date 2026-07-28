import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { libraryItems } from "@/lib/mock-data";

export default function BibliotecaPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        title="Biblioteca"
        description="Vault de conhecimento: templates UGC, hooks, guidelines e playbooks."
        actions={<Button variant="outline">Novo template</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {libraryItems.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <Badge variant="violet" className="font-normal">
                  {item.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {item.author} · Atualizado {item.updatedAt}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
