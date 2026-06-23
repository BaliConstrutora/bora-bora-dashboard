import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/atestados")({
  head: () => ({
    meta: [
      { title: "Atestados — Bora Bora" },
      { name: "description", content: "Gestão de atestados da Construtora Bali." },
      { property: "og:title", content: "Atestados — Bora Bora" },
      { property: "og:description", content: "Gestão de atestados da Construtora Bali." },
    ],
  }),
  component: AtestadosPage,
});

function AtestadosPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-foreground">Atestados</h2>
      <p className="mt-2 text-sm text-muted-foreground">Gestão de atestados em breve...</p>
    </div>
  );
}