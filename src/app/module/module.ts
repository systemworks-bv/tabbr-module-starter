import { computed } from '@angular/core';
import { MenuContribution, SimpleModuleBase } from '@tabbr/module-sdk';
import { provideModuleI18n } from '@tabbr/module-sdk/i18n';
import { MODULE_ID, MODULE_PATH, MODULE_TITLE } from './module-config';
import { I18N_BUNDLES } from './i18n-bundles';
import { ExampleComponent } from './example.component';

/**
 * Your module, as tabbr sees it: its routes (pages) and menu entries.
 *
 * tabbr loads this class at runtime (it is the "./Module" entry in federation.config.js, exported
 * as "Module") and mounts the routes below inside its own router.
 */
export class Module extends SimpleModuleBase {
  constructor() {
    super(MODULE_ID, [
      {
        path: MODULE_PATH,
        component: ExampleComponent,
        title: MODULE_TITLE,
        // Your module's own translations. Route-level, because provideModuleI18n() returns
        // environment providers, which a component's `providers` can't hold.
        providers: [...provideModuleI18n({ bundles: I18N_BUNDLES })],
      },
    ]);

    this.menu = computed<MenuContribution[]>(() => [
      {
        moduleId: this.moduleId,
        createNavigationItemsForMenu: (menuManager: any) => {
          menuManager.addRootMenuItem({
            id: MODULE_ID,
            title: MODULE_TITLE,
            type: 'basic',
            icon: 'heroicons_outline:puzzle-piece',
            link: '/' + MODULE_PATH,
          });
        },
      },
    ]);
  }
}
