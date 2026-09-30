const { withNativeFederation, share } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'tabbrCustomModulePoc',

  exposes: {
    // NOTE: entry path deliberately has no leading './' - a bug in
    // @angular-architects/native-federation's createTsConfigForFederation()
    // (angular-esbuild-adapter.js) filters out any entry-point fileName that
    // starts with '.', which silently drops the conventional './src/...'
    // format from the generated tsconfig.federation.json's `include`, causing
    // "File is missing from the TypeScript compilation" at build time.
    './HelloModuleImpl': 'src/app/hello/hello-module-impl.ts',
  },

  // Explicit allowlist matching the tabbr-ui shell's federation.config.js -
  // NOT shareAll(). Must be kept in sync with the shell's shared list: these
  // are the framework runtime packages that need to be the SAME physical
  // instance as the shell's, otherwise DI/change-detection breaks. See the
  // shell's federation.config.js for the full explanation.
  //
  // @tabbr/module-sdk is NOT shared: its tokens get their identity from a
  // page-global registry (sharedToken()), so this module keeps working whatever
  // SDK version the shell runs. See the SDK README.
  //
  // zone.js is deliberately excluded - it's a page-global side-effect polyfill,
  // not a versioned library, and sharing it externalized it into the import
  // map and broke module resolution under ng serve. See the shell's
  // federation.config.js for the full explanation.
  //
  // MUST be wrapped in share() (not a raw object literal) - a plain object
  // under `shared` skips secondary-entry-point discovery entirely
  // (@angular/core/rxjs-interop, @angular/common/http, @tabbr/module-sdk/dev-
  // bridge, ...): esbuild still externalizes those subpaths, just without
  // registering them in the import map, which only breaks at runtime (the
  // build itself succeeds either way). See the shell's federation.config.js
  // for the full story.
  //
  // @angular/common IS shared as the bare package (not just /http) - see the
  // shell's federation.config.js for the full story: platform-browser's DOM
  // adapter is a module-level singleton set once at bootstrap, and sharing
  // only the /http secondary left @angular/router's own separately-bundled
  // chunk with an un-initialized copy of @angular/common, crashing
  // PathLocationStrategy at runtime ("Cannot read properties of null
  // (reading 'getBaseHref')"). This workspace has no locale imports, so it
  // doesn't hit the locale/externalization conflict the shell had to route
  // around via a tsconfig alias.
  // keycloak-angular is shared for a reason specific to THIS workspace (not
  // the shell/remote boundary): app.component.ts imports KeycloakService
  // directly, and @tabbr/module-sdk/dev-bridge (a shared secondary entry
  // point, its own separate esbuild pass) ALSO imports it. Since
  // keycloak-angular wasn't shared, each pass independently bundled its own
  // private copy of the KeycloakService class - two unrelated class objects
  // with the same name. Angular DI matches bare-class providers by object
  // identity, so `inject(KeycloakService, {optional:true})` in app.component.ts
  // could never find the provider provideTabbrDevBridge() registered against
  // ITS OWN copy - always resolved to null, no error, just silent DI mismatch.
  //
  // @jsverse/transloco is shared for the IDENTICAL reason, just louder about
  // it: hello-world.component.ts imports TranslocoService directly, and
  // @tabbr/module-sdk/i18n (another shared secondary entry point, its own
  // separate esbuild pass) ALSO imports provideTransloco/TRANSLOCO_LOADER
  // from it internally. Unshared, each pass bundles its own private copy of
  // every InjectionToken transloco exports (TRANSLOCO_TRANSPILER, TRANSLOCO_
  // CONFIG, TRANSLOCO_LOADER, ...) - and unlike the KeycloakService case,
  // this one doesn't fail silently: TranslocoService itself is `providedIn:
  // 'root'`, so injecting it constructs a fresh instance right there in the
  // component's own (app-bundle) injector, which then looks up its own
  // constructor deps (TRANSLOCO_TRANSPILER first) against tokens from the
  // app bundle's copy of transloco - never matching the providers
  // provideModuleI18n() registered using the SDK chunk's copy. Threw
  // `NG0201: No provider found for InjectionToken TRANSLOCO_TRANSPILER`, not
  // a silent null. Sharing the package gives both passes the same token
  // objects, so provideModuleI18n()'s providers resolve correctly regardless
  // of which pass's copy of TranslocoService ends up injected.
  // @angular/platform-browser (bootstrapApplication itself, plus
  // provideAnimations() from its /animations secondary) is shared for the
  // same reason as @angular/common above, but via a different mechanism:
  // under `ng serve`, Vite's OWN dependency pre-bundler (separate from
  // native-federation's esbuild shared-chunk system, only active in dev-serve
  // mode) bundles any *unshared* package bootstrap.ts/app.config.ts import
  // directly - producing a THIRD, Vite-private copy of @angular/common's
  // module-level DOM-adapter state, distinct from the federation-shared one
  // @angular/router's shared chunk reads from. bootstrapApplication() set the
  // adapter on Vite's private copy; getDOM() on the shared copy stayed null -
  // same "Cannot read properties of null (reading 'getBaseHref')" crash as
  // the very first @angular/common fix, one layer deeper.
  shared: {
    ...share({
      '@angular/core': { singleton: true, strictVersion: true, requiredVersion: 'auto', includeSecondaries: true },
      '@angular/common': { singleton: true, strictVersion: true, requiredVersion: 'auto', includeSecondaries: true },
      '@angular/router': { singleton: true, strictVersion: true, requiredVersion: 'auto', includeSecondaries: true },
      '@angular/platform-browser': { singleton: true, strictVersion: true, requiredVersion: 'auto', includeSecondaries: true },
      'rxjs': { singleton: true, strictVersion: true, requiredVersion: 'auto', includeSecondaries: true },
      'keycloak-angular': { singleton: true, strictVersion: true, requiredVersion: 'auto', includeSecondaries: true },
      '@jsverse/transloco': { singleton: true, strictVersion: true, requiredVersion: 'auto', includeSecondaries: true },
    }),
  },
  // tsconfig.json used to have manual `paths` entries for @angular/core, rxjs
  // etc. pointing straight at node_modules (unrelated to federation - a
  // leftover local-resolution workaround). Those have been removed: they were
  // redundant with default node_modules resolution, and native-federation's
  // getMappedPaths() walks every wildcard tsconfig path's subdirectories
  // (mapped-paths.js) to look for "shared local lib" candidates BEFORE
  // applying the sharedMappings filter below - so the walk (and its "does not
  // contain an entryPoint" warnings for subfolders like rxjs/operators or
  // @angular/core/fesm2022) happened regardless of this being []. Keep
  // sharedMappings: [] anyway as a safety net so any wildcard tsconfig path
  // added in the future isn't auto-treated as a shared local lib.
  sharedMappings: [],
});
