import { Component, inject, resource } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { httpResource } from '@angular/common/http';
import { AIRPLANE_PUBLIC_API, FlightDto, PERSON_PUBLIC_API, QueryResult, TABBR_API_HOST } from '@tabbr/module-sdk';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { HELLO_MODULE_ID } from './hello.constants';

@Component({
  selector: 'app-hello-world',
  standalone: true,
  imports: [TranslocoDirective],
  template: `
    <div class="absolute inset-0 flex flex-col min-w-0 overflow-auto" style="padding: 2rem;" *transloco="let t; prefix: moduleId">
      <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; align-items: center;">
        <span>🌐</span>
        @for (lang of availableLangs; track lang) {
          <button type="button" (click)="switchLang(lang)" [disabled]="activeLang() === lang">
            {{ lang.toUpperCase() }}
          </button>
        }
      </div>

      <h1>👋 {{ t('module.title') }}</h1>
      <p>{{ t('module.description') }}</p>
      <p>{{ t('page.intro') }}</p>
      <p>{{ t('page.apiHost') }} <code>{{ apiHost }}</code></p>

      <!-- PERSON_PUBLIC_API: read-only, per-club singleton, no HTTP call needed here at all -->
      <h2>{{ t('person.title') }}</h2>
      @if (personApi) {
        @if (personApi.personNow(); as me) {
          <p>{{ t('person.now') }} <strong>{{ me.firstname }} {{ me.lastname }}</strong></p>
        } @else {
          <p>{{ t('person.unknown') }}</p>
        }
      } @else {
        <p>{{ t('person.moduleInactive') }}</p>
      }

      <!-- AIRPLANE_PUBLIC_API.query() returns the real, server-side QueryResult (paging +
           aggregations included, see the SDK's own QueryResult doc comment) - not flattened
           into a plain array, so the total below is the real club-wide count, not just this
           page's length. -->
      <h2>{{ t('airplanes.title') }}</h2>
      @if (airplanesResource.isLoading()) {
        <p>{{ t('airplanes.loading') }}</p>
      } @else if (airplanesResource.error()) {
        <p>{{ t('airplanes.error') }}</p>
      } @else if (airplanesResource.value().content.length === 0) {
        <p>{{ t('airplanes.empty') }}</p>
      } @else {
        <p>{{ airplanesResource.value().total }} {{ t('airplanes.total') }}</p>
        <ul>
          @for (airplane of airplanesResource.value().content; track airplane.id) {
            <li>{{ airplane.immatriculation }} ({{ airplane.type }})</li>
          }
        </ul>
      }

      <!-- No FLIGHT_PUBLIC_API equivalent for "list recent flights" (it's deliberately
           read-only and narrow, just getById()) - HttpClient stays the right tool for this,
           same as any other shell service you can inject directly here. -->
      <h2>{{ t('flights.title') }}</h2>
      @if (flightsResource.isLoading()) {
        <p>{{ t('flights.loading') }}</p>
      } @else if (flightsResource.error()) {
        <p>{{ t('flights.error') }}</p>
      } @else if (flightsResource.value().length === 0) {
        <p>{{ t('flights.empty') }}</p>
      } @else {
        <ul>
          @for (flight of flightsResource.value(); track flight.id) {
            <li>{{ flight.date }} — {{ formatDuration(flight.flightDurationInMinutes) }}</li>
          }
        </ul>
      }
    </div>
  `,
})
export class HelloWorldComponent {
  protected readonly apiHost = inject(TABBR_API_HOST);
  protected readonly moduleId = HELLO_MODULE_ID;

  private readonly translocoService = inject(TranslocoService);
  protected readonly availableLangs = ['nl', 'en'];
  protected readonly activeLang = toSignal(this.translocoService.langChanges$, {
    initialValue: this.translocoService.getActiveLang(),
  });

  protected switchLang(lang: string): void {
    this.translocoService.setActiveLang(lang);
  }

  // optional: true - null (not an error) whenever the person module isn't active for this club.
  protected readonly personApi = inject(PERSON_PUBLIC_API, { optional: true });

  // resource() (@angular/core), not httpResource() - AIRPLANE_PUBLIC_API.query() is a plain
  // Promise, not a URL-based HTTP request; httpResource() is specifically for the latter.
  private readonly airplaneApi = inject(AIRPLANE_PUBLIC_API, { optional: true });
  protected readonly airplanesResource = resource({
    loader: async () => (await this.airplaneApi?.query()) ?? { content: [], total: 0, page: 0, success: true },
    defaultValue: { content: [], total: 0, page: 0, success: true } as QueryResult<never>,
  });

  // The backend already sorts flights by date desc, start desc (see FlightPersistenceInfo),
  // so the first page's content is already newest-first — no client-side sorting needed.
  protected readonly flightsResource = httpResource<FlightDto[]>(
    () => ({ url: `${this.apiHost}/api/flight`, params: { page: '0' } }),
    {
      defaultValue: [],
      parse: (raw) => (raw as QueryResult<FlightDto>).content.slice(0, 5),
    },
  );

  protected formatDuration(minutes: number | null): string {
    if (minutes == null) return '—';
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return hours > 0 ? `${hours}h ${remainder}m` : `${remainder}m`;
  }
}
