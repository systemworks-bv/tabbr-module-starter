// Nested under the module id, matching the convention tabbr-ui's own bundled modules use (see
// e.g. tabbr-ui's modules/home/i18n/nl.ts) - keeps this bundle drop-in compatible if the shell
// ever merges it into its own (shared) TranslocoService instead of this remote's private one.
export default {
  'club.poc.hello': {
    'module.title': 'Hallo vanuit de federated club module',
    'module.description':
      'Proof-of-concept module, geladen vanuit een aparte workspace via Native Federation.',
    'page.intro':
      'Deze component werd geladen vanuit een aparte workspace via Native Federation — geen rebuild van tabbr-ui nodig.',
    'page.apiHost': 'API host doorgegeven vanuit de shell:',
    'person.title': 'Ingelogde persoon (via PERSON_PUBLIC_API)',
    'person.now': 'Ingelogd als:',
    'person.unknown': 'Nog niet bekend.',
    'person.moduleInactive': 'Person-module niet actief voor deze club.',
    'airplanes.title': 'Vliegtuigen van de club (via AIRPLANE_PUBLIC_API)',
    'airplanes.loading': 'Vliegtuigen laden…',
    'airplanes.error': 'Kon vliegtuigen niet laden.',
    'airplanes.empty': 'Geen vliegtuigen gevonden voor deze club.',
    'airplanes.total': 'vliegtuig(en) in totaal',
    'flights.title': 'Laatste 5 geregistreerde vluchten',
    'flights.loading': 'Vluchten laden…',
    'flights.error': 'Kon vluchten niet laden.',
    'flights.empty': 'Geen vluchten gevonden voor deze club.',
  },
};
