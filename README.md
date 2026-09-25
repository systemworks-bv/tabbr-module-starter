# tabbr module starter

A starting point for your own **tabbr module**: pages and menu items you build yourself, which
tabbr loads into your club's app. Clone it, pick your club, and start writing Angular.

## What you need

- [Node.js](https://nodejs.org) 20 or newer
- A tabbr account in the club you build for. To **publish** the module you need the **ADMIN** role
  in that club; previewing only needs a normal account.

## Get started

```bash
git clone https://github.com/systemworks-bv/tabbr-module-starter.git my-module
cd my-module
npm install
npm run setup     # asks for your club code and writes tabbr.config.json
npm start         # dev preview on http://localhost:4300
```

Your club code is the part before `.tabbr.be` in your club's address (e.g. `abc` for
`abc.tabbr.be`). The preview logs you in with your tabbr account and runs your pages against your
club's real data.

## Where your code goes

| Path | What it is |
|---|---|
| `src/app/module/module.ts` | Your module as tabbr sees it: its pages (routes) and menu items |
| `src/app/module/example.component.ts` | An example page, replace it with your own |
| `src/app/module/i18n/` | Translations (`nl`, `en`), nested under your module id |
| `tabbr.config.json` | Club, module id and title; written by `npm run setup` |
| `src/app/app.*.ts` | The dev preview only; tabbr never loads these |

## Talking to tabbr

Everything comes from [`@tabbr/module-sdk`](https://www.npmjs.com/package/@tabbr/module-sdk):

- **Other modules' public APIs** such as `PERSON_PUBLIC_API` (the logged-in person) and
  `AIRPLANE_PUBLIC_API` (the club's airplanes). Inject them with `{ optional: true }`: they are
  `null` when that module isn't active for the club. The example page uses both.
- **The tabbr REST API** through Angular's `HttpClient` and `inject(TABBR_API_HOST)`. Requests
  carry the logged-in user's credentials automatically, and only see what that user may see.

To get TypeScript types for your club's own data (including its custom fields):

```bash
npm run fetch-types   # writes src/types/tabbr/entities.d.ts
```

## Publish to your club

```bash
npm run publish-module
```

This builds the module, logs you in (in your browser) and uploads it. After a page refresh your
club's members see the new menu item. Publishing again replaces the previous version.

## Good to know

- **Don't upgrade Angular or rxjs** past the versions in `package.json`. tabbr runs your module on
  its own copy of them and needs to be at least as new as what you build with. When tabbr moves to
  a new Angular major version, update this project and publish again.
- The module id in `tabbr.config.json` identifies your module within the club. Changing it after
  publishing creates a second module instead of updating the first.
- The CLI behind the npm scripts is [`@tabbr/module-cli`](https://www.npmjs.com/package/@tabbr/module-cli);
  run `npx tabbr-module` for all its options.

## License

This starter is MIT licensed (see [LICENSE](LICENSE)): the module you build from it is yours.
`@tabbr/module-sdk` and `@tabbr/module-cli` have their own license, which allows using them for
modules that run on tabbr.
