import { MODULE_ID } from '../module-config';

// Nested under the module id, like tabbr's own modules do it.
export default {
  [MODULE_ID]: {
    'title': 'My module',
    'intro': 'This page comes from your own module. Edit src/app/module/example.component.ts and take it from there.',
    'me.title': 'Logged in as',
    'me.unknown': 'Not known yet.',
    'airplanes.title': "The club's airplanes",
    'airplanes.loading': 'Loading airplanes…',
    'airplanes.error': 'Could not load the airplanes.',
    'airplanes.empty': 'No airplanes found.',
    'airplanes.moduleInactive': 'The airplane module is not active for this club.',
  },
};
