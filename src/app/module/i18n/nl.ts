import { MODULE_ID } from '../module-config';

// Nested under the module id, like tabbr's own modules do it.
export default {
  [MODULE_ID]: {
    'title': 'Mijn module',
    'intro': 'Deze pagina komt uit je eigen module. Pas src/app/module/example.component.ts aan en ga verder.',
    'me.title': 'Ingelogd als',
    'me.unknown': 'Nog niet gekend.',
    'airplanes.title': 'Vliegtuigen van de club',
    'airplanes.loading': 'Vliegtuigen laden…',
    'airplanes.error': 'Kon de vliegtuigen niet laden.',
    'airplanes.empty': 'Geen vliegtuigen gevonden.',
    'airplanes.moduleInactive': 'De vliegtuigmodule is niet actief voor deze club.',
  },
};
