import { Injectable, inject, signal } from '@angular/core';
import { AppNotification } from './models';
import { ApiService } from './api.service';
import { I18nService } from './i18n.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  readonly permission = signal<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  );
  readonly reminders = signal<AppNotification[]>([]);
  readonly connected = signal(false);

  private source: EventSource | null = null;
  private visitorId: string | null = null;

  loadHistory(visitorId: string): void {
    this.api.getNotifications(visitorId).subscribe((n) => this.reminders.set(n));
  }

  connect(visitorId: string): void {
    if (this.visitorId === visitorId && this.source) {
      return;
    }
    this.visitorId = visitorId;
    this.loadHistory(visitorId);
    if (this.source) {
      this.source.close();
    }
    this.source = new EventSource(`/api/notifications/stream?visitorId=${encodeURIComponent(visitorId)}`);
    this.source.addEventListener('connected', () => this.connected.set(true));
    this.source.addEventListener('reminder', (event) => this.onReminder(event));
    this.source.onerror = () => this.connected.set(false);
  }

  disconnect(): void {
    this.source?.close();
    this.source = null;
    this.connected.set(false);
  }

  private onReminder(event: MessageEvent): void {
    try {
      const payload: AppNotification = JSON.parse(event.data);
      this.reminders.update((list) => [payload, ...list.filter((r) => r.id !== payload.id)]);
      const isAr = this.i18n.lang() === 'ar';
      const title = isAr ? payload.titleAr : payload.titleEn;
      const body = isAr ? payload.messageAr : payload.messageEn;
      this.showSystemNotification(title, body);
      this.toast.show(body, 'info');
    } catch {
      // ignore malformed payloads
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (typeof Notification === 'undefined') {
      return 'denied';
    }
    const result = await Notification.requestPermission();
    this.permission.set(result);
    return result;
  }

  showTest(): void {
    this.showSystemNotification(
      this.i18n.t('notif.reminderTitle'),
      this.i18n.lang() === 'ar'
        ? 'هذا إشعار تجريبي من إكسبو إيكو.'
        : 'This is a test notification from Expo Echo.',
    );
    this.toast.show(this.i18n.t('notif.sent'), 'success');
  }

  private showSystemNotification(title: string, body: string): void {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return;
    }
    try {
      new Notification(title, { body, icon: '/favicon.ico', badge: '/favicon.ico' });
    } catch {
      // some browsers require a service worker; in-app toast still shows
    }
  }
}
