Replace `window.open` with an inline PDF viewer Dialog in both atestados pages.

## New component: `src/components/pdf-viewer-dialog.tsx`
Reusable to avoid duplication.

Props: `open: boolean`, `onOpenChange: (o: boolean) => void`, `storagePath: string | null`, `title: string` (e.g. `"Visualizar Atestado — AT-123"`).

Behavior:
- On open with a valid `storagePath`, call `supabase.storage.from("atestados-pdfs").createSignedUrl(storagePath, 120)`.
- While loading, show a centered `Loader2` spinner inside the dialog body.
- On error or missing URL, `toast.error("Não foi possível carregar o PDF.")` and close.
- On success, render `<iframe src={signedUrl} width="100%" height="100%" style={{ border: "none" }} />` in the body.
- Reset URL state when the dialog closes so reopening re-fetches a fresh signed URL.

Layout:
- `DialogContent className="max-w-5xl w-full h-[85vh] flex flex-col p-0"`.
- `DialogHeader` (padded) with `DialogTitle` = provided title.
- Body: `flex-1 min-h-0` containing the iframe (fills space).
- Footer: `flex items-center justify-between` with:
  - Left: `Button variant="outline"` labeled `Fechar` that calls `onOpenChange(false)`.
  - Right: `<a href={signedUrl} download>` wrapping a `Button` labeled `Baixar PDF` (disabled while loading / when no URL). Uses `<a>` tag with `download` attribute per spec.

## `src/routes/_authenticated/atestados/index.tsx`
- Replace `pdfLoadingId` + `handleVerPdf`'s `window.open` flow with dialog state: `const [pdfAtestado, setPdfAtestado] = useState<{ id: string; numero: string; path: string } | null>(null)`.
- Dropdown `Ver PDF` item: if `!a.documentoUrl`, `toast.info(...)`; else `setPdfAtestado({ id: a.id, numero: a.numero, path: a.documentoUrl })`.
- Render `<PdfViewerDialog open={!!pdfAtestado} onOpenChange={(o) => !o && setPdfAtestado(null)} storagePath={pdfAtestado?.path ?? null} title={`Visualizar Atestado — ${pdfAtestado?.numero ?? ""}`} />`.
- Remove now-unused `pdfLoadingId` state and spinner in dropdown item (icon stays as `FileText`).

## `src/routes/_authenticated/atestados/$atestadoId.tsx`
- Replace `pdfLoading` + `handleVerPdf`'s `window.open` flow with `const [pdfOpen, setPdfOpen] = useState(false)`.
- `Ver PDF` button (in Documento card): keeps `FileText` icon; onClick opens the dialog (with `toast.info` guard if no `documentoUrl`).
- Render `<PdfViewerDialog open={pdfOpen} onOpenChange={setPdfOpen} storagePath={atestado.documentoUrl ?? null} title={`Visualizar Atestado — ${atestado.numero}`} />`.

## Notes
- All UI strings in pt-BR as specified.
- No API/schema changes.
- Uses existing shadcn `Dialog` primitives (already present in the project via shadcn/ui).
