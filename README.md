# tabbr-custom-module-poc

A minimal, working example of a **federated tabbr club module**: an Angular workspace, built and
deployed *independently* of the main `tabbr-ui` monorepo, that a club can upload to its own tabbr
instance and have it show up in the app - new menu item, new route, reading real club data - with
no rebuild or redeploy of `tabbr-ui` itself.

It's loaded at runtime via [Native
Federation](https://github.com/angular-architects/module-federation-plugin) (`@angular-architects/native-federation`),
using the public `@tabbr/module-sdk` contract. The one feature module in here (`src/app/hello/`,
id `club.poc.hello`) is a deliberately simple "Hello" example - use it as the template to copy
when starting a real module.

## What the example does

`src/app/hello/hello-world.component.ts` renders a page that:

- shows the API host injected by the shell (`TABBR_API_HOST`);
- reads the logged-in person via `PERSON_PUBLIC_API` (no HTTP call - a per-club singleton);
- queries the club's airplanes via `AIRPLANE_PUBLIC_API.query()`;
- fetches the last 5 flights with a plain `httpResource()` call against `TABBR_API_HOST`;
- is translated (NL/EN) via `@tabbr/module-sdk/i18n`'s `provideModuleI18n()`.

`src/app/hello/hello-module-impl.ts` (`HelloModuleImpl`) is what actually gets exposed via
federation - it registers the route and a menu entry, extending the SDK's `SimpleModuleBase`.

## Prerequisites

- Node.js matching `tabbr-ui`'s toolchain (Angular 20 / esbuild-based builds) and npm.
- A tabbr club to target (a club code, e.g. `TESTCLUB`), and the **ADMIN** role in it if you want
  to publish.
- For the standalone dev preview (see below) to log in: the tabbr Keycloak client's **Valid
  Redirect URIs** must include `http://localhost:*` - a one-time setting in the Keycloak admin
  console, not something this workspace can configure itself.

## Quick start

```bash
npm install
npm start
```

Opens on **http://localhost:4300**. This is a *standalone preview*, not the real tabbr shell: it
bootstraps this workspace on its own (`src/bootstrap.ts`) and wires up `provideTabbrDevBridge()`
(dev-only, see `src/app/app.config.ts`) so you can log in via the real Keycloak realm and hit a
real club's API directly - without running `tabbr-ui` at all. Log in, and you'll see the Hello
page render with real data for the club configured in `tabbr.config.json`.

## `tabbr.config.json` - the one place club settings live

```json
{
  "club": "TESTCLUB",
  "apiHost": "https://api.tabbr.be",
  "moduleId": "club.poc.hello",
  "title": "Hello",
  "icon": "waving_hand",
  "exposedModule": "./HelloModuleImpl",
  "exportName": "HelloModuleImpl"
}
```

Both the CLI (`publish`, `fetch-types`) and this workspace's own dev-preview harness
(`app.config.ts`, via a direct JSON import) read this **same** file, so they can't drift apart -
there is nowhere else the club code is hardcoded. **To adapt this workspace for your own club,
edit this file.** Command-line flags to the CLI, if you use them, override it.

- `club` - the club code to target (case-insensitive).
- `apiHost` - both which backend `publish`/`fetch-types` talk to and which backend the dev-preview
  harness's dev bridge points at. This workspace targets the **public, production** tabbr API only
  (`https://api.tabbr.be`) - there is no other host to point it at from outside SystemWorks BV.
- `moduleId` - globally unique within the club. Convention is `club.<clubcode>.<name>`, but
  nothing enforces it (this example intentionally uses `club.poc.hello`, not
  `club.testclub.hello`, since the module itself isn't club-specific).
- `exposedModule` / `exportName` - must match the `exposes` map in `federation.config.js` and the
  class `HelloModuleImpl` exports.

## Project layout

| Path | Purpose |
|---|---|
| `tabbr.config.json` | Club/module settings - see above. |
| `federation.config.js` | Native Federation config: what's exposed, what's shared with the shell (and why - see its extensive inline comments for the hard-won reasons behind every shared package). |
| `src/main.ts` | Entry point: `initFederation()` before anything else, then dynamically imports `bootstrap.ts`. |
| `src/bootstrap.ts` + `src/app/app.config.ts` | Bootstraps the **standalone dev-preview harness only** (`npm start`) - never loaded when the real shell imports this module via federation. |
| `src/app/app.component.ts` | The dev-preview harness's root component: a login gate around `<app-hello-world>`. |
| `src/app/hello/hello-module-impl.ts` | `HelloModuleImpl` - the `PlatformModuleImplementation` actually exposed via federation (`./HelloModuleImpl` in `federation.config.js`). Registers the route + menu entry. |
| `src/app/hello/hello-world.component.ts` | The feature component - the part worth copying as a starting point for a real module. |
| `src/app/hello/hello.constants.ts` | The module id, shared between the impl and the component. |
| `src/app/hello/hello-i18n-bundles.ts`, `i18n/en.ts`, `i18n/nl.ts` | Translation bundles, loaded via `provideModuleI18n()`. |

## Standalone preview vs. the real shell

Two different things load this code, and only one of them is what actually ships:

- **`npm start` (standalone preview, port 4300)** - for building/testing the feature component in
  isolation, via the dev bridge (`app.config.ts`, gated by `isDevMode()`). Convenient, but not how
  clubs see the module.
- **The real `tabbr-ui` shell** - after publishing (below), the shell fetches your club's
  registered custom modules and loads `HelloModuleImpl` straight from your uploaded
  `remoteEntry.json`, mounting its route under the club's own router tree and its menu item under
  the club's own menu. No manual registration step and no `tabbr-ui` code change is needed for
  this to happen - it's entirely server-driven, from the moment you publish.

## Publishing to a club

```bash
npm run publish-module
```

Runs `tabbr-module publish` (`@tabbr/module-cli`, via `npx`/the `publish-module` script), which:

1. runs `ng build` in this workspace;
2. zips the build output;
3. logs you in via a browser redirect to Keycloak (PKCE - your password never touches the CLI or
   this workspace) and caches the token at `~/.tabbr/credentials.json`;
4. uploads the zip to the club configured in `tabbr.config.json` (you need the **ADMIN** role
   there).

The module is live for that club immediately after a successful publish - reload `tabbr-ui` and
it's in the menu.

## Fetching live entity types

```bash
npm run fetch-types
```

Fetches every entity the configured club has (including its custom fields) as TypeScript data
interfaces into `src/types/tabbr/entities.d.ts`, for typing your own component code (e.g. an
`httpResource`'s response shape). It reflects one club's live, possibly-custom field
configuration and is regenerable on demand - already gitignored, don't hand-edit or commit it.

See `npx tabbr-module --help` for fetching a single entity's *script-sandbox* types instead (what
tabbr-ui's own hook/calculation script editor uses) - a different, narrower shape than the REST
response types above.

## Native Federation notes

`federation.config.js` shares only an explicit allowlist with the shell (not `shareAll()`):
Angular core/common/router/platform-browser, rxjs, `keycloak-angular`, `@jsverse/transloco`.
`@tabbr/module-sdk` is deliberately **not** shared - each copy (yours and the shell's) resolves
its DI tokens by name through a page-global registry, so your module keeps working across SDK
versions without a rebuild. See the SDK's own README ("Compatibility across SDK versions") and the
heavily-commented `shared` block in `federation.config.js` before changing it - most of those
comments document a real bug that was hit and fixed, not a hypothetical.

## Further reading

- [`@tabbr/module-sdk`](https://www.npmjs.com/package/@tabbr/module-sdk) - the DI tokens and
  helpers this module is built against (`PlatformModuleImplementation`, `SimpleModuleBase`,
  `TABBR_API_HOST`, the `*_PUBLIC_API` tokens, `provideModuleI18n`, `provideTabbrDevBridge`).
- [`@tabbr/module-cli`](https://www.npmjs.com/package/@tabbr/module-cli) - `publish` /
  `fetch-types` / `init`, used above.

Both packages are proprietary to SystemWorks BV - free to use to build modules for the tabbr
platform, not for other use or redistribution.
