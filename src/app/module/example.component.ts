import { Component, inject, resource } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AIRPLANE_PUBLIC_API, PERSON_PUBLIC_API } from '@tabbr/module-sdk';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { MODULE_ID } from './module-config';

/**
 * An example page. It shows the two ways a module talks to tabbr:
 * - the public APIs other modules offer (PERSON_PUBLIC_API, AIRPLANE_PUBLIC_API, ...), injected
 *   with `optional: true` because that module may not be active for the club;
 * - plain HttpClient calls to `${inject(TABBR_API_HOST)}/api/...`, which carry the logged-in
 *   user's credentials automatically.
 */
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [TranslocoDirective],
  template: `
    <div style="padding: 2rem;" *transloco="let t; prefix: moduleId">
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
        @for (lang of languages; track lang) {
          <button type="button" (click)="setLanguage(lang)" [disabled]="activeLanguage() === lang">
            {{ lang.toUpperCase() }}
          </button>
        }
      </div>

      <h1>{{ t('title') }}</h1>
      <p>{{ t('intro') }}</p>

      <h2>{{ t('me.title') }}</h2>
      @if (personApi?.personNow(); as me) {
        <p>{{ me.firstname }} {{ me.lastname }}</p>
      } @else {
        <p>{{ t('me.unknown') }}</p>
      }

      <h2>{{ t('airplanes.title') }}</h2>
      @if (!airplaneApi) {
        <p>{{ t('airplanes.moduleInactive') }}</p>
      } @else if (airplanes.isLoading()) {
        <p>{{ t('airplanes.loading') }}</p>
      } @else if (airplanes.error()) {
        <p>{{ t('airplanes.error') }}</p>
      } @else if (!airplanes.value()?.content?.length) {
        <p>{{ t('airplanes.empty') }}</p>
      } @else {
        <ul>
          @for (airplane of airplanes.value()!.content; track airplane.id) {
            <li>{{ airplane.immatriculation }} ({{ airplane.type }})</li>
          }
        </ul>
      }
    </div>
  `,
})
export class ExampleComponent {
  protected readonly moduleId = MODULE_ID;

  protected readonly personApi = inject(PERSON_PUBLIC_API, { optional: true });
  protected readonly airplaneApi = inject(AIRPLANE_PUBLIC_API, { optional: true });
  protected readonly airplanes = resource({
    loader: () => this.airplaneApi ? this.airplaneApi.query() : Promise.resolve(undefined),
  });

  private readonly transloco = inject(TranslocoService);
  protected readonly languages = ['nl', 'en'];
  protected readonly activeLanguage = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  protected setLanguage(lang: string): void {
    this.transloco.setActiveLang(lang);
  }
}
