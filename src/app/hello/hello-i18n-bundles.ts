import { TranslationBundleMap } from '@tabbr/module-sdk/i18n';

// Shared by both callers of provideModuleI18n() - HelloModuleImpl's route (federated, inside the
// shell's router) and app.config.ts (the standalone dev-preview harness) - so the bundle map
// itself only needs to change in one place.
export const HELLO_I18N_BUNDLES: TranslationBundleMap = {
  nl: () => import('./i18n/nl'),
  en: () => import('./i18n/en'),
};
