import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/concorrencias")({
  head: () => ({
    meta: [
      { title: "Concorrências Privadas — Bora Bora" },
      { name: "description", content: "Gestão de concorrências privadas da Construtora Bali." },
      { property: "og:title", content: "Concorrências Privadas — Bora Bora" },
      { property: "og:description", content: "Gestão de concorrências privadas da Construtora Bali." },
    ],
  }),
  component: ConcorrenciasPage,
});

function ConcorrenciasPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-foreground">Concorrências Privadas</h2>
      <p className="mt-2 text-sm text-muted-foreground">Gestão de concorrências em breve...</p>
    </div>
  );
}