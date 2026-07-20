Replace the entire content of `src/types/index.ts` with the exact TypeScript definitions provided in the message.

After the replacement, run a typecheck to surface any downstream compile errors in files that consume these types (mock data, API layer, atestados routes). If breakages appear, they will be addressed as a follow-up — this plan only covers the types file replacement itself.