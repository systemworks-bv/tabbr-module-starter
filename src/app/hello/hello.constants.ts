/**
 * Globally-unique module id, must match the id registered server-side (see `moduleId` in
 * tabbr.config.json). Shared between HelloModuleImpl and HelloWorldComponent so translation
 * lookups (`read: HELLO_MODULE_ID`) stay in sync with it.
 */
export const HELLO_MODULE_ID = 'club.poc.hello';
