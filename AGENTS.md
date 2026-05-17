# AGENTS.md

## Cursor Cloud specific instructions

### Overview

VELANTRIM EITI is a zero-dependency, fully client-side PWA (Progressive Web App) built as a single monolithic `index.html` file (~2.9 MB, v13.2.0). There is **no build step, no package manager, no backend, and no external database**. The app uses browser-native storage (IndexedDB, localStorage) and an in-browser SQLite WASM engine (`sql-wasm.js` / `sql-wasm.wasm`).

### Running the app

Serve the repository root with any static HTTP server. Service Workers require `http://` or `https://` (not `file://`).

```
python3 -m http.server 8080 --directory /workspace
```

Then open `http://localhost:8080/index.html` in Chrome.

### Repository

**GitHub Pages:** https://velantrian.github.io/velantrim-eiti/
**Repo:** https://github.com/velantrian/velantrim-eiti

### Key files

| File | Purpose |
|---|---|
| `index.html` | The entire application (HTML + CSS + JS monolith) |
| `sql-wasm.js` / `sql-wasm.wasm` | SQLite WASM engine for FTS5 search |
| `sw.js` | Service Worker for offline/PWA caching |
| `manifest.json` | PWA manifest |

### Gotchas

- **Single-file architecture is sacred.** All HTML, CSS, and JS lives in `index.html`. Do NOT split into modules, components, or separate files unless explicitly asked.
- **No build system.** There is no `package.json`, `requirements.txt`, `webpack.config`, or similar. Do not create them.
- **Surgical edits only.** Make minimal targeted changes. Never rewrite or restructure unless explicitly requested.
- **Version consistency.** `EITI_VERSION` in `index.html`, `CACHE` in `sw.js`, and `description` in `manifest.json` must always match.
- AI chat features (DeepSeek, Gemini, Grok, OpenRouter) require external API keys configured in the app's Settings tab. The DuckDuckGo AI provider works without an API key.
- The app stores all data in the browser (IndexedDB ~500 MB, localStorage ~5 MB, SQLite WASM for FTS5). There are no external databases.
- When testing, the first load shows an onboarding wizard that must be completed before accessing the main interface.
- Service Workers require `http://` or `https://` (not `file://`).
