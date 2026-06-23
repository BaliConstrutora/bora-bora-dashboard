
## Plan: Bora Bora - Gestão Comercial

Build a shell app with a fixed dark-blue sidebar, top header, and 4 placeholder routes. Uses TanStack Router (project's router — equivalent to React Router for this purpose), Tailwind v4, shadcn/ui sidebar primitives, Lucide icons, and the Inter font.

### Design tokens (src/styles.css)
- Add Inter via `<link>` in `__root.tsx` head; set `--font-sans: Inter`.
- Override semantic tokens to brand:
  - `--primary: oklch(...)` ≈ `#1E3A5F` (dark blue)
  - `--accent: oklch(...)` ≈ `#F59E0B` (gold)
  - `--sidebar`, `--sidebar-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-primary` tuned so sidebar = dark blue bg + white text, active item = gold bg with dark text.
- Background stays white.

### Files

1. `src/routes/__root.tsx` — add Inter `<link>`, update title to "Bora Bora - Gestão Comercial", wrap `<Outlet />` with `SidebarProvider` + `AppSidebar` + header bar (page title from route + user avatar dropdown with logout placeholder).
2. `src/components/app-sidebar.tsx` — shadcn Sidebar with brand block ("Bora Bora" / "Construtora Bali" subtitle) and 4 menu items using `Link` + `useRouterState` for active highlight (gold accent).
3. `src/components/app-header.tsx` — reads current route, renders page title + `SidebarTrigger` + avatar (shadcn Avatar + DropdownMenu with Logout item).
4. `src/routes/index.tsx` — replace placeholder. Title "Dashboard", text "Resumo geral em breve...".
5. `src/routes/atestados.tsx` — "Atestados" / "Gestão de atestados em breve...".
6. `src/routes/licitacoes.tsx` — "Licitações Públicas" / "Gestão de licitações em breve...".
7. `src/routes/concorrencias.tsx` — "Concorrências Privadas" / "Gestão de concorrências em breve...".

Each page route sets its own `head()` meta (title + description).

### Page title mapping
Header derives title from a small `{ pathname: title }` map matching the 4 routes.

### Notes
- Project uses TanStack Router (not react-router-dom) — same navigation semantics, type-safe `Link to=`.
- Sidebar `collapsible="icon"` with `SidebarTrigger` always visible in header so it works on mobile.
- Logout is a placeholder button (no auth wired yet).
