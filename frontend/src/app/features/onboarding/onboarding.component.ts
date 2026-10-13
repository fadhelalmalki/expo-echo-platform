import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../../core/i18n.service';
import { ProfileService } from '../../core/profile.service';
import { NotificationService } from '../../core/notification.service';
import { ToastService } from '../../core/toast.service';
import { categoryEmoji } from '../../shared/format';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  template: `
    <div class="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 pb-10 pt-10 safe-top">
      <div class="animate-slide-up">
        <span
          class="flex h-16 w-16 items-center justify-center rounded-3xl text-3xl shadow-lg"
          style="background: linear-gradient(135deg, #006c35, #4fb480 55%, #fab712)"
        >
          🌴
        </span>
        <h1 class="mt-5 text-3xl font-black leading-tight">{{ i18n.t('onboarding.welcome') }}</h1>
        <p class="mt-2 text-sm text-ink-soft">{{ i18n.t('onboarding.subtitle') }}</p>
      </div>

      <section class="mt-7">
        <label class="text-sm font-bold text-ink-soft">{{ i18n.t('onboarding.yourName') }}</label>
        <input
          [value]="name()"
          (input)="name.set($any($event.target).value)"
          [placeholder]="i18n.t('onboarding.namePlaceholder')"
          class="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-base font-semibold outline-none focus:border-expo-green"
        />
      </section>

      <section class="mt-6">
        <div class="flex items-baseline justify-between">
          <h2 class="text-sm font-bold text-ink-soft">{{ i18n.t('onboarding.pickInterests') }}</h2>
          <span class="text-xs text-ink-soft/70">{{ i18n.t('onboarding.interestsHint') }}</span>
        </div>
        <div class="mt-3 flex flex-wrap gap-2.5">
          @for (category of profile.categories(); track category.id) {
            <button
              type="button"
              (click)="toggle(category.code)"
              class="flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition active:scale-95"
              [class]="
                selected().has(category.code)
                  ? 'border-transparent text-white shadow-md'
                  : 'border-line bg-white text-ink-soft'
              "
              [style.background]="
                selected().has(category.code)
                  ? 'linear-gradient(135deg, ' + category.colorStart + ', ' + category.colorEnd + ')'
                  : ''
              "
            >
              <span class="text-lg">{{ emoji(category.code) }}</span>
              {{ i18n.lang() === 'ar' ? category.nameAr : category.nameEn }}
            </button>
          }
        </div>
      </section>

      <section class="mt-6">
        <h2 class="text-sm font-bold text-ink-soft">{{ i18n.t('onboarding.availableTime') }}</h2>
        <div class="mt-3 flex flex-wrap gap-2">
          @for (minutes of timeOptions; track minutes) {
            <button
              type="button"
              (click)="availableMinutes.set(minutes)"
              class="rounded-2xl border px-4 py-2 text-sm font-bold transition active:scale-95"
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

      <section class="mt-6 rounded-2xl border border-line bg-white p-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-bold">📍 {{ i18n.t('profile.location') }}</p>
            <p class="mt-0.5 text-xs text-ink-soft">
              {{ usingRealLocation() ? i18n.t('onboarding.useMyLocation') : i18n.t('onboarding.atExpoSite') }}
            </p>
          </div>
          <button
            type="button"
            (click)="useMyLocation()"
            [disabled]="locating()"
            class="rounded-full border border-line px-3 py-2 text-xs font-bold text-ink-soft disabled:opacity-50"
          >
            {{ locating() ? i18n.t('onboarding.locating') : i18n.t('onboarding.useMyLocation') }}
          </button>
        </div>
        <div class="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <p class="text-sm font-bold">🔔 {{ i18n.t('notif.enable') }}</p>
          <button
            type="button"
            (click)="enableNotifications()"
            class="rounded-full border border-line px-3 py-2 text-xs font-bold text-ink-soft"
          >
            {{ notifications.permission() === 'granted' ? '✓' : i18n.t('notif.enable') }}
          </button>
        </div>
      </section>

      @if (error()) {
        <p class="mt-4 rounded-2xl bg-expo-red/10 px-4 py-3 text-sm font-semibold text-expo-red">
          {{ error() }}
        </p>
      }

      <button
        type="button"
        (click)="submit()"
        [disabled]="submitting()"
        class="mt-7 w-full rounded-2xl bg-expo-green py-4 text-base font-extrabold text-white shadow-lg transition active:scale-[0.99] disabled:opacity-60"
      >
        {{ submitting() ? i18n.t('common.loading') : i18n.t('onboarding.start') }}
      </button>
      <p class="mt-3 text-center text-[11px] text-ink-soft/70">{{ i18n.t('onboarding.locationHint') }}</p>
    </div>
  `,
})
export class OnboardingComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly profile = inject(ProfileService);
  protected readonly notifications = inject(NotificationService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly timeOptions = [15, 30, 45, 60, 90, 120];

  protected readonly name = signal('');
  protected readonly selected = signal<Set<string>>(new Set<string>());
  protected readonly availableMinutes = signal(30);
  protected readonly usingRealLocation = signal(false);
  protected readonly locating = signal(false);
  protected readonly submitting = signal(false);
  protected readonly error = signal('');
  private coords = signal<{ lat: number; lng: number } | null>(null);

  protected readonly siteCenter = computed(() => this.profile.config()?.siteCenter);

  protected emoji(code: string): string {
    return categoryEmoji(code);
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

  protected useMyLocation(): void {
    if (!navigator.geolocation) {
      return;
    }
    this.locating.set(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.coords.set({ lat: position.coords.latitude, lng: position.coords.longitude });
        this.usingRealLocation.set(true);
        this.locating.set(false);
      },
      () => {
        this.locating.set(false);
        this.toast.show(this.i18n.t('onboarding.atExpoSite'), 'info');
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  protected async enableNotifications(): Promise<void> {
    const result = await this.notifications.requestPermission();
    this.toast.show(
      result === 'granted' ? this.i18n.t('notif.enabled') : this.i18n.t('notif.denied'),
      result === 'granted' ? 'success' : 'info',
    );
  }

  protected async submit(): Promise<void> {
    this.error.set('');
    if (!this.name().trim()) {
      this.error.set(this.i18n.t('onboarding.needName'));
      return;
    }
    if (this.selected().size === 0) {
      this.error.set(this.i18n.t('onboarding.needInterest'));
      return;
    }
    this.submitting.set(true);
    const center = this.siteCenter() ?? { lat: 24.769, lng: 46.658 };
    const location = this.coords() ?? center;
    try {
      await this.profile.createProfile({
        displayName: this.name().trim(),
        interestCodes: [...this.selected()],
        availableMinutes: this.availableMinutes(),
        latitude: location.lat,
        longitude: location.lng,
      });
      this.router.navigateByUrl('/feed');
    } catch {
      this.error.set(this.i18n.t('common.error'));
    } finally {
      this.submitting.set(false);
    }
  }
}
