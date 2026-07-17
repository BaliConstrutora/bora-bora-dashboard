import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Bora Bora" },
      { name: "description", content: "Resumo geral da gestão comercial da Construtora Bali." },
      { property: "og:title", content: "Dashboard — Bora Bora" },
      { property: "og:description", content: "Resumo geral da gestão comercial da Construtora Bali." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
      <p className="mt-2 text-sm text-muted-foreground">Resumo geral em breve...</p>
    </div>
  );
}
