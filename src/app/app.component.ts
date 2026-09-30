import { Component, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { HelloWorldComponent } from './hello/hello-world.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HelloWorldComponent],
  template: `
    <h2>tabbr custom module (federation remote) - dev preview</h2>
    @if (keycloak) {
      @if (keycloak.isLoggedIn()) {
        <app-hello-world />
      } @else {
        <p>Not logged in to the tabbr dev bridge.</p>
        <button (click)="keycloak.login()">Log in via Keycloak</button>
      }
    } @else {
      <p>Dev bridge not active (production build, or <code>provideTabbrDevBridge</code> not
         wired up in app.config.ts). Load <strong>localhost:4200</strong> (tabbr shell) to see
         the Hello module in production instead.</p>
    }
  `,
})
export class AppComponent {
  protected readonly keycloak = inject(KeycloakService, { optional: true });
}
