import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProfileService } from './core/profile.service';
import { NotificationService } from './core/notification.service';
import { ToastHostComponent } from './shared/toast-host.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHostComponent],
  template: `
    <router-outlet />
    <app-toast-host />
  `,
})
export class App {
  private readonly profile = inject(ProfileService);
  private readonly notifications = inject(NotificationService);

  constructor() {
    this.profile.loadReferenceData();
    this.profile.init();

    effect(() => {
      const visitor = this.profile.visitor();
      if (visitor) {
        this.notifications.connect(visitor.id);
      }
    });
  }
}
