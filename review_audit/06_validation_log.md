# Validation Log

## Comandos executados

| Comando | Resultado | Observações |
|---|---|---|
| `npm ci` | ❌ | Falhou com `EPERM` ao remover `lightningcss.win32-x64-msvc.node`; indica reprodutibilidade frágil/local file lock |
| `npm run lint` | ✅ | Script atual é apenas `tsc --noEmit` |
| `npm run build` | ✅ | Build passou na workspace principal; bundle principal `~1.7 MB` minificado |
| `npm audit --omit=dev` | ⚠️ | Reportou `4` vulnerabilidades (`1` moderada, `3` altas) |
| `npm run clean` | ❌ | Script usa `rm -rf dist`, incompatível com `cmd` no Windows |
| `npm ls vite brace-expansion path-to-regexp picomatch` | ✅ | Mostrou árvore instalada e versões locais |
| `npm ls idb d3-shape victory-vendor @reduxjs/toolkit recharts firebase` | ✅ | Dependências de build estavam presentes na workspace principal |

## Divergências observadas
- Alguns subagentes, em worktrees isoladas, viram `npm run build` falhando por resolução de dependências (`recharts`, `d3-shape`, `idb`, `@reduxjs/toolkit`).
- Na workspace principal, com a árvore atual instalada, `npm run build` passou.
- Interpretação operacional: **há fragilidade de reprodutibilidade do ambiente**, mas não há falha de build confirmada no estado atual da workspace principal.

## Saídas relevantes
- Build:
  - `dist/assets/index-*.js` ≈ `1,697.68 kB`
  - warning de chunks acima de `500 kB`
- Audit:
  - `brace-expansion` (moderada)
  - `path-to-regexp` (alta)
  - `picomatch` (alta)
  - `vite` (alta)
