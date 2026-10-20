# LiveMock

> Browser-based API mock server — define endpoints visually, intercept real `fetch` calls via a Service Worker, and watch requests log in real time.

**No backend. No config files. No code changes to your app.**

## What it does

LiveMock runs entirely in the browser. You define mock API routes (method, path, status code, response body, delay), and a registered Service Worker silently intercepts matching `fetch` calls — returning your mocked response before any real network request is made.

The request log panel updates live as traffic flows through, showing what was matched, the status code, and response time.

## Key Features

- **Visual route editor** — define method, path, status code, JSON response body, artificial delay, and custom headers
- **Service Worker interception** — real `fetch` calls are intercepted at the network layer, not mocked via monkey-patching
- **Path parameter support** — `/api/users/:id` matches `/api/users/42`, `/api/users/abc`, etc.
- **Live request log** — every intercepted request appears in real time with method, status, path, and latency
- **Try It panel** — send a test request directly from the editor and see the response inline
- **Mock on/off toggle** — disable all interception instantly without losing your route definitions
- **Import / Export** — save and load route collections as JSON files
- **Persistent state** — routes survive page refreshes via `localStorage`
- **Demo routes** — ships with a realistic `users` API to explore immediately

## How the Service Worker works

```
Browser tab (LiveMock app)
  │
  ├─ Registers /sw.js with scope "/"
  ├─ Sends route definitions to SW via postMessage
  │
  └─ On fetch() call:
       SW intercepts → matches route → waits delay → returns mock Response
       SW broadcasts log entry via BroadcastChannel → UI updates live
```

The Service Worker receives route updates whenever you add, edit, or toggle a route. Interception happens at the browser network layer — nothing in your application code changes.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| State | Zustand with localStorage persistence |
| Styling | Tailwind CSS v4 |
| Interception | Service Worker API + BroadcastChannel |
| Icons | Lucide React |

## Running Locally

```bash
git clone https://github.com/dheeraj099/livemock.git
cd livemock
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Note:** Service Workers require `localhost` or HTTPS. The app will not intercept requests on `http://` non-localhost origins.

## Building

```bash
npm run build
npm start
```

## Architecture

```
livemock/
  public/
    sw.js              # Service Worker — fetch interception + BroadcastChannel logging
  app/
    page.tsx           # Root client component — mounts panels, registers SW hook
    layout.tsx
    globals.css
  components/
    Toolbar.tsx        # Top bar — SW status, mock toggle, import/export
    RouteList.tsx      # Left panel — route list with enable/disable per route
    RouteEditor.tsx    # Center panel — edit route, status presets, Try It panel
    RequestLog.tsx     # Right panel — live intercepted request log
  store/
    mockStore.ts       # Zustand store — routes, logs, SW status, persist middleware
  hooks/
    useServiceWorker.ts  # SW registration, BroadcastChannel listener, route sync
  types/
    index.ts           # Shared TypeScript types
```

## Limitations & Future Work

- Service Worker scope is limited to the LiveMock app's own origin. To use LiveMock's interception in a separate app, you would need to embed or import the SW registration there.
- Query string matching is not yet supported (path matching is pathname-only).
- Response body templating (dynamic values, sequence cycling) is not yet implemented.
- No drag-to-reorder for routes.

## License

MIT
