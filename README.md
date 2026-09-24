# PulseSharedNavigation

The **Andalusia Pulse sidebar** as a drop-in React component. Add it to any Power Apps Code App and your users get the same navigation they have in the Pulse hub — same modules, same apps, same pinned favorites, same role-based access.


## ⚡ Quick setup (1 command)

From your Code App folder (it must already have the Microsoft Dataverse connector):

```bash
npx github:AmrMousaa/PulseSharedNavigation
```

This installs the package, reads your app id from `power.config.json`, and wraps `<App />` in `src/main.tsx`:

```tsx
<PulseShell dataverse={MicrosoftDataverseService} powerAppId="<your appId>">
  <App />
</PulseShell>
```

Run `npm run dev` — the Pulse sidebar is on the left. No CSS import or menu button needed: on wide screens it's docked (your content is shifted right automatically); on small screens it becomes a drawer with a floating menu button.

Don't have the Dataverse connector yet? Add it first:

```bash
pac code add-data-source -a shared_commondataserviceforapps -c <your-dataverse-connection-id>
```

---

## Features

| Feature | Details |
| --- | --- |
| Modules & apps | Loads active `pulse_modules` / `pulse_apps` from the Pulse Dataverse environment, ordered by `pulse_order`. |
| Role-based access | Only apps linked (via `pulse_apppermissions`) to one of the user's security roles are shown. System Administrators see everything. Empty modules are hidden. |
| Search | Filters modules **and** apps as you type, with match highlighting. |
| Accordion | One module expanded at a time; the module of the current app opens automatically. |
| Current app highlight | Pass `currentAppId` and its module gets the accent bar, the app is highlighted. |
| Favorites (pins) | Star any app to pin it — synced with the Pulse hub home page (`pulse_favorites`). Max 5, optimistic, race-safe. |
| App launch | Opens the app with `hidenavbar=true` and records usage for the Pulse analytics dashboard (`pulse_appusagestatses`, `pulse_appuserlastuseds`). |
| Disabled apps | Apps without a URL are shown greyed out and can't be launched. |
| Home | Logo click returns to the Pulse hub (configurable). |
| Layout modes | `overlay` (slide-in drawer, like Pulse) or `docked` (always visible ≥ 1024px, drawer below). |
| UX | Loading skeleton, error state with retry, Esc to close, backdrop click to close, keyboard accessible, reduced-motion aware. |
| Isolated styles | Every class is prefixed `psn-`; theme via CSS variables. |

---

## Manual setup (more control)

### 1. Prerequisites

Your app must be a **Power Apps Code App** with the **Microsoft Dataverse** connector added (the sidebar reads Pulse data cross-environment through it):

```bash
pac code add-data-source -a shared_commondataserviceforapps -c <your-dataverse-connection-id>
```

This generates `src/generated/services/MicrosoftDataverseService.ts` in your app — you'll pass it to the sidebar.

Users need read access to the Pulse tables in the Pulse environment (`https://org1cb63e1b.crm4.dynamics.com`) — the same access they already have for the Pulse hub.

### 2. Install

```bash
npm install github:AmrMousaa/PulseSharedNavigation
```

Pin a version with a tag: `npm install github:AmrMousaa/PulseSharedNavigation#v1.1.0`.

### 3. Use it

```tsx
import { useState } from 'react';
import { PulseNavigation, PulseMenuButton, createDataverseClient } from 'pulse-shared-navigation';
import { MicrosoftDataverseService } from './generated/services/MicrosoftDataverseService';

// Create once, outside the component.
const pulseClient = createDataverseClient(MicrosoftDataverseService);

export default function App() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      <PulseNavigation
        client={pulseClient}
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
        currentAppId="<this app's pulse_appid>" // optional: highlights your app
      />

      <header>
        <PulseMenuButton onClick={() => setNavOpen(true)} />
        …
      </header>
      <main>…</main>
    </>
  );
}
```

That's it. Modules, apps, permissions, favorites and usage tracking are all handled.

### Docked layout

```tsx
<PulseNavigation client={pulseClient} variant="docked" isOpen={navOpen} onClose={() => setNavOpen(false)} />
<div className="psn-docked-offset">{/* your app — padded by the sidebar width on wide screens */}</div>
```

On screens ≥ 1024px the sidebar is always visible; below that it becomes the slide-in drawer (keep the `PulseMenuButton` for small screens).

---

## API

### `<PulseShell />` — zero-config wrapper

Everything below plus: `dataverse` (your generated `MicrosoftDataverseService`, or pass `client`), `powerAppId` (highlights your app by matching its Pulse URL), `showMenuButton` (default `true`), `children`. Defaults to `variant="docked"`.


### `<PulseNavigation />` — connected, recommended

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `client` | `DataverseClient` | **required** | From `createDataverseClient(MicrosoftDataverseService)`. |
| `isOpen` | `boolean` | **required** | Drawer open state. |
| `onClose` | `() => void` | **required** | Called on backdrop click, Esc, close button, or after launching an app. |
| `variant` | `'overlay' \| 'docked'` | `'overlay'` | Layout mode. |
| `currentAppId` | `string` | – | `pulse_appid` of the host app; auto-expands and highlights it. |
| `powerAppId` | `string` | – | Alternative to `currentAppId`: your `power.config.json` `appId`, matched against Pulse app URLs. |
| `currentModuleId` | `string` | – | Force which module shows the accent bar. |
| `homeUrl` | `string \| null` | Pulse hub URL | Where the logo navigates. `null` disables it. |
| `onGoHome` | `() => void` | – | Custom logo click (overrides `homeUrl`). |
| `onLaunchApp` | `(app, module) => void` | track + same-tab open | Custom launch behaviour. |
| `disableFavorites` | `boolean` | `false` | Hide the pin stars. |
| `maxFavorites` | `number` | `5` | Pin limit. |
| `trackUsage` | `boolean` | `true` | Record launches in Pulse analytics. |
| `onError` | `(message) => void` | built-in toast | Receive favorite errors. |
| `getUserContext` | `() => Promise<{ objectId, fullName }>` | Power Apps `getContext()` | Override user resolution. |
| `brandName` / `brandTagline` / `logo` | `string` / `string` / `ReactNode` | `Andalusia Pulse` / `ENTERPRISE HUB` / layers icon | Header branding. |
| `userName` / `userSubtitle` | `string` | signed-in user / `Enterprise workspace` | Footer card. |
| `footer` | `ReactNode \| null` | user card | Replace (or hide with `null`) the footer. |
| `searchPlaceholder` | `string` | `Search modules or apps` | |
| `className` | `string` | – | Extra class on the root. |

### `<PulseSidebar />` — presentational only

The same UI with **no data fetching** — pass `modules: NavModule[]` and callbacks yourself. Use it if your data comes from somewhere else, or for tests/storybooks.

```tsx
<PulseSidebar
  modules={[{ id: 'm1', name: 'Finance', apps: [{ id: 'a1', moduleId: 'm1', name: 'Revenue', url: 'https://…' }] }]}
  isOpen={open}
  onClose={() => setOpen(false)}
  onLaunchApp={(app) => (window.location.href = app.url!)}
/>
```

### `usePulseNavigation({ client })` — hook only

Build your own UI on top of the data layer. Returns `{ status, error, modules, userName, retry, launchApp, favorites, favoritedAppIds, pendingAppIds, toggleFavorite, reloadFavorites }`.

### Other exports

`PulseMenuButton`, `ModuleIcon`, `createDataverseClient(service, organizationUrl?)`, `PULSE_ORGANIZATION_URL`, `PULSE_HUB_URL`, `MAX_FAVORITES`, `withHiddenNavbar(url)`, and types `NavModule`, `NavApp`, `NavFavorite`, `DataverseClient`, `UserContext`.

---

## Theming

Styles are injected automatically. (`import 'pulse-shared-navigation/styles.css'` still works if you prefer a real stylesheet.)

Override any variable on `.psn-root` (sidebar), `.psn-menu-btn` or `.psn-toast`:

```css
.psn-root {
  --psn-sidebar-w: 300px;
  --psn-bg: linear-gradient(165deg, #1e293b, #0f172a);
  --psn-accent: #38bdf8;
  --psn-z: 1000; /* raise if your app has high z-index headers */
}
```

Available: `--psn-sidebar-w`, `--psn-z`, `--psn-font`, `--psn-bg`, `--psn-accent`, `--psn-accent-2`, `--psn-deep`, `--psn-text`, `--psn-overlay`, `--psn-shadow`, `--psn-radius`, `--psn-radius-lg`.

The design uses the **Urbanist** font (falls back to system UI). Add it to your `index.html` for a pixel match:

```html
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;600;700&display=swap" rel="stylesheet" />
```

---

## Data model (Pulse environment)

| Table | Used for |
| --- | --- |
| `pulse_modules` | Sidebar groups (`pulse_name`, `pulse_iconurl`, `pulse_order`) |
| `pulse_apps` | Apps (`pulse_name`, `pulse_appurl`, `pulse_iconurl`, `pulse_Module`) |
| `pulse_apppermissions` | App ↔ security role links |
| `pulse_favorites` | Per-user pins (read/write) |
| `pulse_appusagestatses`, `pulse_appuserlastuseds` | Launch analytics (write) |
| `systemusers`, `roles` | Resolving the signed-in user and their roles |

Modules, apps and permissions are managed from **Pulse → Pulse Configuration**; changes show up in every app using this component.

---

## Developing this package

```bash
npm install
npm run dev        # playground at http://localhost:3100 with mock data (example/)
npm run typecheck
npm run build      # outputs dist/ — commit it, consumers install straight from GitHub
```

Release: bump `version` in `package.json`, `npm run build`, commit, then `git tag vX.Y.Z && git push --tags`.
