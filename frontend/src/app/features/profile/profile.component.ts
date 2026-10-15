import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../../core/i18n.service';
import { ProfileService } from '../../core/profile.service';
import { NotificationService } from '../../core/notification.service';
import { ToastService } from '../../core/toast.service';
import { categoryEmoji, initials } from '../../shared/format';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <div class="animate-slide-up">
      <h1 class="text-2xl font-black">{{ i18n.t('profile.title') }}</h1>
    </div>

    <div class="card mt-4 flex items-center gap-4 p-4">
      <span
        class="flex h-16 w-16 items-center justify-center rounded-3xl text-2xl font-black text-white"
        style="background: linear-gradient(135deg, #47266c, #95629e)"
      >
        {{ avatar() }}
      </span>
      <div class="min-w-0">
        <p class="truncate text-lg font-extrabold">{{ profile.visitor()?.displayName }}</p>
        <p class="text-xs text-ink-soft">{{ i18n.t('tagline') }}</p>
      </div>
    </div>

    <section class="card mt-4 p-4">
      <h2 class="text-sm font-extrabold text-ink-soft">{{ i18n.t('profile.interests') }}</h2>
      <div class="mt-3 flex flex-wrap gap-2">
        @for (category of profile.categories(); track category.id) {
          <button
            type="button"
            (click)="toggle(category.code)"
            class="flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold transition"
            [class]="
              selected().has(category.code)
                ? 'border-transparent text-white'
                : 'border-line bg-white text-ink-soft'
            "
            [style.background]="
              selected().has(category.code)
                ? 'linear-gradient(135deg, ' + category.colorStart + ', ' + category.colorEnd + ')'
                : ''
            "
          >
            <span>{{ emoji(category.code) }}</span>
            {{ i18n.lang() === 'ar' ? category.nameAr : category.nameEn }}
          </button>
        }
      </div>
    </section>

    <section class="card mt-4 p-4">
      <h2 class="text-sm font-extrabold text-ink-soft">{{ i18n.t('profile.time') }}</h2>
      <div class="mt-3 flex flex-wrap gap-2">
        @for (minutes of timeOptions; track minutes) {
          <button
            type="button"
            (click)="availableMinutes.set(minutes)"
            class="rounded-2xl border px-4 py-2 text-sm font-bold transition"
            [class]="
              availableMinutes() === minutes
                ? 'border-expo-green bg-expo-green text-white'
                : 'border-line bg-white text-ink-soft'
            "
          >
            {{ minutes }} {{ i18n.t('common.minutesShort') }}
          </button>
        }
      </div>
    </section>

    <section class="card mt-4 divide-y divide-line p-0">
      <div class="flex items-center justify-between p-4">
        <span class="text-sm font-bold">{{ i18n.t('profile.language') }}</span>
        <div class="flex overflow-hidden rounded-full border border-line">
          <button
            type="button"
            (click)="i18n.setLang('ar')"
            class="px-3 py-1.5 text-xs font-bold"
            [class]="i18n.lang() === 'ar' ? 'bg-expo-green text-white' : 'text-ink-soft'"
          >
            {{ i18n.t('common.arabic') }}
          </button>
          <button
            type="button"
            (click)="i18n.setLang('en')"
            class="px-3 py-1.5 text-xs font-bold"
            [class]="i18n.lang() === 'en' ? 'bg-expo-green text-white' : 'text-ink-soft'"
          >
            {{ i18n.t('common.english') }}
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between p-4">
        <span class="text-sm font-bold">
          🔔 {{ i18n.t('profile.notifications') }}
          <span class="block text-xs font-medium text-ink-soft">
            {{
              notifications.muted()
                ? i18n.t('notif.muted')
                : notifications.permission() === 'granted'
                  ? i18n.t('profile.notifOn')
                  : i18n.t('profile.notifOff')
            }}
          </span>
        </span>
        <div class="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            (click)="enableNotifications()"
            class="rounded-full border px-3 py-1.5 text-xs font-bold transition"
            [class]="
              notifications.muted()
                ? 'border-line text-ink-soft'
                : 'border-expo-green bg-expo-green text-white'
            "
          >
            {{
              notifications.permission() === 'granted' && !notifications.muted()
                ? '✓'
                : i18n.t('notif.enable')
            }}
          </button>
          <button
            type="button"
            (click)="skipNotifications()"
            class="rounded-full border px-3 py-1.5 text-xs font-bold transition"
            [class]="
              notifications.muted()
                ? 'border-expo-red bg-expo-red text-white'
                : 'border-line text-ink-soft'
            "
          >
            {{ i18n.t('notif.skip') }}
          </button>
          <button
            type="button"
            (click)="notifications.showTest()"
            class="rounded-full bg-expo-purple px-3 py-1.5 text-xs font-bold text-white"
          >
            {{ i18n.t('notif.test') }}
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between p-4">
        <span class="text-sm font-bold">
          📍 {{ i18n.t('profile.location') }}
          <span class="block text-xs font-medium text-ink-soft">
            @if (profile.visitor()?.latitude !== null) {
              {{ coordsLabel() }}
            }
          </span>
        </span>
        <button
          type="button"
          (click)="useMyLocation()"
          class="rounded-full border border-line px-3 py-1.5 text-xs font-bold text-ink-soft"
        >
          {{ i18n.t('onboarding.useMyLocation') }}
        </button>
      </div>
    </section>

    <button
      type="button"
      (click)="save()"
      class="mt-5 w-full rounded-2xl bg-expo-green py-4 text-base font-extrabold text-white shadow-lg active:scale-[0.99]"
    >
      {{ i18n.t('profile.save') }}
    </button>

    <button
      type="button"
      (click)="reset()"
      class="mt-3 w-full rounded-2xl border border-expo-red/40 py-3 text-sm font-bold text-expo-red"
    >
      {{ i18n.t('profile.reset') }}
    </button>
  `,
})
export class ProfileComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly profile = inject(ProfileService);
  protected readonly notifications = inject(NotificationService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly timeOptions = [15, 30, 45, 60, 90, 120];
  protected readonly selected = signal<Set<string>>(
    new Set(this.profile.visitor()?.interests.map((c) => c.code) ?? []),
  );
  protected readonly availableMinutes = signal<number>(
    this.profile.visitor()?.availableMinutes ?? 30,
  );

  protected avatar(): string {
    const name = this.profile.visitor()?.displayName;
    return name ? initials(name) : '👤';
  }

  protected emoji(code: string): string {
    return categoryEmoji(code);
  }

  protected coordsLabel(): string {
    const v = this.profile.visitor();
    if (v?.latitude == null || v?.longitude == null) {
      return '';
    }
    return `${v.latitude.toFixed(3)}, ${v.longitude.toFixed(3)}`;
  }

  protected toggle(code: string): void {
    const next = new Set(this.selected());
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    this.selected.set(next);
  }

  protected async enableNotifications(): Promise<void> {
    this.notifications.setMuted(false);
    const result = await this.notifications.requestPermission();
    this.toast.show(
      result === 'granted' ? this.i18n.t('notif.enabled') : this.i18n.t('notif.denied'),
      result === 'granted' ? 'success' : 'info',
    );
  }

  protected skipNotifications(): void {
    this.notifications.setMuted(true);
    this.toast.show(this.i18n.t('notif.muted'), 'info');
  }

  protected useMyLocation(): void {
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      this.profile.setLocalLocation(position.coords.latitude, position.coords.longitude);
      this.toast.show(this.i18n.t('profile.location'), 'info');
    });
  }

  protected async save(): Promise<void> {
    const visitor = this.profile.visitor();
    if (!visitor) {
      return;
    }
    await this.profile.updateProfile({
      interestCodes: [...this.selected()],
      availableMinutes: this.availableMinutes(),
      latitude: visitor.latitude ?? undefined,
      longitude: visitor.longitude ?? undefined,
    });
    this.toast.show(this.i18n.t('profile.saved'), 'success');
  }

  protected reset(): void {
    this.profile.reset();
    this.notifications.disconnect();
    this.router.navigateByUrl('/onboarding');
  }
}
