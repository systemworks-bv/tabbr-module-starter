import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideTabbrDevBridge } from '@tabbr/module-sdk/dev-bridge';
import { provideModuleI18n } from '@tabbr/module-sdk/i18n';
import { HELLO_I18N_BUNDLES } from './hello/hello-i18n-bundles';
// Same tabbr.config.json the CLI (publish/fetch-types) reads - one place to change club/apiHost
// when adapting this workspace, instead of duplicating them here. See README "Your own club".
import tabbrConfig from '../../tabbr.config.json';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideRouter([]),
    ...provideModuleI18n({ bundles: HELLO_I18N_BUNDLES }),
    ...(isDevMode()
      ? [provideTabbrDevBridge({ clubCode: tabbrConfig.club, apiHost: tabbrConfig.apiHost })]
      : []),
  ],
};
