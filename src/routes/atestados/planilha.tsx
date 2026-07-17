import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/atestados/planilha")({
  head: () => ({ meta: [{ title: "Planilha de Quantidades — Bora Bora" }] }),
  component: PlanilhaPage,
});

function PlanilhaPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold">Planilha de Quantidades</h1>
      <p className="text-sm text-muted-foreground mt-2">Em breve.</p>
    </div>
  );
}