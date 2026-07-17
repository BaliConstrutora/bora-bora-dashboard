import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/licitacoes")({
  head: () => ({
    meta: [
      { title: "Licitações Públicas — Bora Bora" },
      { name: "description", content: "Gestão de licitações públicas da Construtora Bali." },
      { property: "og:title", content: "Licitações Públicas — Bora Bora" },
      { property: "og:description", content: "Gestão de licitações públicas da Construtora Bali." },
    ],
  }),
  component: LicitacoesPage,
});

function LicitacoesPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-foreground">Licitações Públicas</h2>
      <p className="mt-2 text-sm text-muted-foreground">Gestão de licitações em breve...</p>
    </div>
  );
}