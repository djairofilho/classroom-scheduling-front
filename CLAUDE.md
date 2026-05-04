# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint over `**/*.{js,jsx}` (config in [eslint.config.js](eslint.config.js))
- `npm run preview` — preview built bundle

There is no test runner configured.

## Environment

- `VITE_API_BASE_URL` — backend base URL. Defaults to `http://localhost:8080` when unset (see [src/lib/api.js:1](src/lib/api.js#L1)).
- The auth token is persisted in `localStorage` under the key `portal-auth-token`.

## Architecture

Single-page React 19 app (Vite + Tailwind v4) for a Brazilian classroom-scheduling portal. UI strings, page paths, and domain terminology are in Portuguese; only display strings should pass through i18n.

### Provider stack ([src/main.jsx](src/main.jsx))

`I18nProvider` → `AuthProvider` → `BrowserRouter` → `App`. Anything that calls `useAuth()` or `useI18n()` must live below all three.

### Routing & access control ([src/App.jsx](src/App.jsx))

Routes are declared in a single `<Routes>` tree wrapped by two guards:

- `RequireAuth` — redirects unauthenticated users to `/login`, preserving the original location in `state.from`. While `auth.loading` is true, renders `<LoadingBlock>` instead of redirecting (prevents a flicker when a stored token is being validated).
- `RequireAdmin` — redirects non-admins to `/`. Wraps the `/admin/*` and `/configuracoes/api` routes only.

`AppShell` is the layout for every authenticated route. The login page is the only route outside the shell.

### Auth flow ([src/lib/auth.jsx](src/lib/auth.jsx), [src/lib/authContext.js](src/lib/authContext.js))

`AuthProvider` rehydrates the session on mount: if a token exists in localStorage it calls `api.getMe()`; on failure it clears the token. The context exposes `user`, `loading`, `isAdmin` (derived from `user.papel === 'ADMIN'`), and `login`/`register`/`logout` actions that update the token and user in lockstep. **Always import `useAuth` from `./lib/authContext`, not `./lib/auth`** — the provider file is JSX-only to keep React Refresh happy (see the `eslint-disable react-refresh/only-export-components` pattern used elsewhere when a file must export both).

### API layer ([src/lib/api.js](src/lib/api.js))

A single `apiRequest` helper attaches the bearer token, JSON content-type, throws an `Error` with `.status` on non-2xx responses, and returns `null` for 204. The exported `api` object is a flat dictionary of named endpoint methods using Portuguese domain terms (`listEspacos`, `listPredios`, `listReservas`, `listNotificacoes`, `listSolicitantes`, etc.). The helper `isNotFoundError(err)` checks `err.status === 404`. **Add new endpoints to this object rather than calling `fetch` from components.**

### Domain adapters ([src/lib/adapters.js](src/lib/adapters.js))

API responses use Portuguese field names (`nome`, `predio`, `horarios.inicio`, `cancelada`, `lida`, `papel`). Adapters (`mapEspaco`, `mapPredio`, `mapReserva`, `mapNotificacao`, `mapUsuario`) translate them into English-keyed view models the UI consumes (`name`, `building`, `start`, `cancelada` preserved, `statusKey`, `tone`, etc.). They also derive UI fields like `statusKey`/`statusTone`/`typeKey`, which point at i18n keys, and run heuristics like `inferSpaceType` and `inferNotificationTone`. **Pages must call adapters before rendering — components downstream assume the mapped shape.**

### Async data pattern ([src/hooks/useAsyncData.js](src/hooks/useAsyncData.js))

Pages load data with `useAsyncData(loader)` and render one of three states using `<LoadingBlock>` / `<ErrorBlock>` from [src/components/layout/AsyncState.jsx](src/components/layout/AsyncState.jsx). The loader is a dependency of the effect, so memoize it with `useCallback` (see `NewBookingPage`) when it closes over props/state — otherwise it re-fires on every render.

### i18n ([src/i18n/I18nProvider.jsx](src/i18n/I18nProvider.jsx))

`useI18n()` returns `{ locale, setLocale, t }`. Translations for `pt-BR` and `en` are inlined in the provider. Keys are dot-paths (`shell.nav.dashboard`, `common.statuses.available`). Adapters and components reference these keys via `*Key` suffixes (`statusKey`, `titleKey`, `typeKey`); never hardcode display strings.

### Styling ([src/index.css](src/index.css), [src/components/layout/ui.jsx](src/components/layout/ui.jsx))

Tailwind v4 with the brand palette declared inside `@theme` (custom colors like `brand-red`, `ink-muted`, `warm-stone`, `panel`, `mint-deep`, `amber-soft`, plus a `shadow-soft` token). Reusable primitives (`Card`, `Button`, `Badge`) live in `components/layout/ui.jsx` — prefer composing them over reintroducing class strings, and use `tone` props rather than ad-hoc color classes.

### Layout shell ([src/components/layout/AppShell.jsx](src/components/layout/AppShell.jsx))

Sidebar nav is desktop-only (`lg:` breakpoint); a horizontally-scrolling pill nav appears in the header on smaller viewports. Admin links are conditionally appended when `isAdmin`. Main content is wrapped in `lg:scale-80 lg:w-[125%]` to fit a denser layout — when adding pages, work with this transform rather than around it.
