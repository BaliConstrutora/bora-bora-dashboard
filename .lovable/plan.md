Update `src/lib/atestados-ai.functions.ts` to improve Claude extraction for complex PDFs and expand category coverage.

Changes:
1. Increase `max_tokens` from 4096 to 8192 in the Anthropic API request body.
2. Expand the `categoria_sugerida` enum in `USER_PROMPT` to include all project categories:
   "Serviços Preliminares" | "Fundações" | "Estrutura de Concreto" | "Alvenaria" | "Cobertura" | "Revestimentos" | "Instalações Hidráulicas" | "Instalações Elétricas" | "Pavimentação" | "Paisagismo" | "Drenagem" | "Terraplanagem" | "Transportes" | "Sinalização" | "Demolição e Remoções" | "Administração Local" | "Outros"
3. Append category-mapping instructions to `SYSTEM_PROMPT`:
   - Use 'Drenagem' for sarjeta, drainage, esgoto pluvial services.
   - Use 'Terraplanagem' for earthmoving, escavação, aterro, desmatamento services.
   - Use 'Transportes' for transporte de massa, DMT, caminhão basculante services.
   - Use 'Sinalização' for horizontal/vertical signaling, tachões, tachas services.
   - Use 'Administração Local' for engenheiro de obra, encarregado, equipe administrativa.
   - Use 'Demolição e Remoções' for demolição, remoção de pavimento services.

Verification: run a TypeScript typecheck after edits.