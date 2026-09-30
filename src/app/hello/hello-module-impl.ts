import { computed } from '@angular/core';
import { MenuContribution, SimpleModuleBase } from '@tabbr/module-sdk';
import { provideModuleI18n } from '@tabbr/module-sdk/i18n';
import { HELLO_MODULE_ID } from './hello.constants';
import { HELLO_I18N_BUNDLES } from './hello-i18n-bundles';
import { HelloWorldComponent } from './hello-world.component';

/**
 * Federated club module implementation.
 *
 * Exposed via Native Federation as `./HelloModuleImpl` from this remote workspace.
 * The tabbr shell loads this class at runtime and registers it as a PlatformModuleImplementation,
 * mounting its routes under the club's router tree.
 *
 * Usage in tabbr-ui (shell):
 *   new FederatedBaseModule('club.poc.hello', 'waving_hand', [],
 *     'http://localhost:4300/remoteEntry.json', './HelloModuleImpl', 'HelloModuleImpl',
 *     () => Promise.resolve({}))
 */
export class HelloModuleImpl extends SimpleModuleBase {
  constructor() {
    super(HELLO_MODULE_ID, [
      {
        path: 'hello',
        component: HelloWorldComponent,
        title: 'Hello (federated)',
        // Route-level (environment-injector-scoped) providers, not component-level: provideModuleI18n()
        // returns EnvironmentProviders, which Component.providers can't accept - see its doc
        // comment (@tabbr/module-sdk/i18n) for the full "why private / why not the shell's
        // TranslocoService" rationale. The standalone dev-preview harness (app.component.ts)
        // bypasses the router entirely, so it registers the same provider set at the app root
        // instead (app.config.ts).
        providers: [...provideModuleI18n({ bundles: HELLO_I18N_BUNDLES })],
      },
    ]);

    // menu.service.ts's mainMenuItems computed only ever calls createNavigationItemsForMenu() -
    // MenuContribution.menuItems (the static-array field) is declared in the SDK but not
    // actually read by that code path, so it has to be this callback shape instead. The
    // `menuManager` param is typed `unknown` in the SDK (no dependency on tabbr-internal
    // navigation types), but structurally matches tabbr-ui's own MenuManager
    // (club-module.types.ts) at runtime - addRootMenuItem/addMenuItem/addAdminMenuItem.
    //
    // The title here stays a literal string (not translated): it's rendered by the shell's menu,
    // built outside this module's own route tree, so it has no access to the private, route-scoped
    // TranslocoService instance provideModuleI18n() sets up above - only HelloWorldComponent's own
    // template does.
    this.menu = computed<MenuContribution[]>(() => [
      {
        moduleId: this.moduleId,
        createNavigationItemsForMenu: (menuManager: any) => {
          menuManager.addRootMenuItem({
            id: HELLO_MODULE_ID,
            title: 'Hello (federated)',
            type: 'basic',
            icon: 'heroicons_outline:hand-raised',
            link: '/hello',
          });
        },
      },
    ]);
  }
}
