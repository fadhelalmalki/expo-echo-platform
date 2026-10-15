import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';
import { ProfileService } from '../../core/profile.service';
import { ToastService } from '../../core/toast.service';
import { Booking } from '../../core/models';
import { CountdownComponent } from '../../shared/countdown.component';
import { categoryEmoji, timeLabel } from '../../shared/format';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CountdownComponent],
  template: `
    <div class="animate-slide-up">
      <h1 class="text-2xl font-black">{{ i18n.t('bookings.title') }}</h1>
      <p class="mt-0.5 text-sm text-ink-soft">
        {{ activeCount() }} {{ i18n.t('bookings.upcoming') }}
      </p>
    </div>

    @if (bookings().length === 0) {
      <div class="card mt-6 p-8 text-center">
        <p class="text-4xl">🎟️</p>
        <p class="mt-3 font-bold">{{ i18n.t('bookings.empty') }}</p>
        <p class="mt-1 text-sm text-ink-soft">{{ i18n.t('bookings.emptyHint') }}</p>
        <button
          type="button"
          (click)="goToFeed()"
          class="mt-4 rounded-full bg-expo-green px-5 py-2.5 text-sm font-bold text-white"
        >
          {{ i18n.t('bookings.explore') }}
        </button>
      </div>
    } @else {
      <div class="mt-4 space-y-4">
        @for (booking of bookings(); track booking.id) {
          <article class="card animate-slide-up overflow-hidden">
            <div
              class="h-1.5 w-full"
              [style.background]="
                'linear-gradient(135deg, ' + booking.category.colorStart + ', ' + booking.category.colorEnd + ')'
              "
            ></div>
            <div class="p-4">
              <div class="flex items-start gap-3">
                <span
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl text-white"
                  [style.background]="
                    'linear-gradient(135deg, ' + booking.category.colorStart + ', ' + booking.category.colorEnd + ')'
                  "
                >
                  {{ emoji(booking) }}
                </span>
                <div class="min-w-0 flex-1">
                  <h3 class="text-base font-extrabold leading-snug">{{ title(booking) }}</h3>
                  <p class="mt-0.5 text-xs text-ink-soft">
                    📍 {{ venue(booking) }}<span class="mx-1">•</span>{{ time(booking) }}
                  </p>
                </div>
                <span
                  class="rounded-full px-2.5 py-1 text-[10px] font-bold"
                  [class]="
                    booking.status === 'CONFIRMED'
                      ? 'bg-expo-green/10 text-expo-green'
                      : 'bg-mist text-ink-soft'
                  "
                >
                  {{
                    booking.status === 'CONFIRMED'
                      ? i18n.t('bookings.confirmed')
                      : i18n.t('bookings.cancelled')
                  }}
                </span>
              </div>

              <div class="mt-3 flex items-center justify-between gap-2">
                <span class="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink-soft">
                  <app-countdown [startAt]="booking.startAt" />
                </span>
                <div class="flex items-center gap-2">
                  @if (booking.status === 'CONFIRMED') {
                    <button
                      type="button"
                      (click)="cancel(booking)"
                      class="rounded-full border border-expo-red/40 px-4 py-2 text-xs font-bold text-expo-red"
                    >
                      {{ i18n.t('bookings.cancel') }}
                    </button>
                  }
                </div>
              </div>

              <p class="mt-3 text-[11px] text-ink-soft">
                🔔 {{ i18n.t('bookings.reminder') }}
                {{ profile.config()?.reminderLeadMinutes ?? 10 }} {{ i18n.t('common.minutesShort') }}
              </p>
            </div>
          </article>
        }
      </div>
    }
  `,
})
export class BookingsComponent implements OnInit {
  protected readonly i18n = inject(I18nService);
  protected readonly profile = inject(ProfileService);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly bookings = signal<Booking[]>([]);

  ngOnInit(): void {
    this.load();
  }

  protected activeCount(): number {
    return this.bookings().filter((b) => b.status === 'CONFIRMED').length;
  }

  private load(): void {
    const id = this.profile.visitorId;
    if (!id) {
      return;
    }
    this.api.getBookings(id).subscribe((list) => this.bookings.set(list));
  }

  protected cancel(booking: Booking): void {
    const id = this.profile.visitorId;
    if (!id) {
      return;
    }
    this.api.cancel(id, booking.eventId).subscribe({
      next: () => {
        this.bookings.update((list) =>
          list.map((b) => (b.id === booking.id ? { ...b, status: 'CANCELLED' as const } : b)),
        );
      },
      error: () => this.toast.show(this.i18n.t('common.error'), 'error'),
    });
  }

  protected goToFeed(): void {
    this.router.navigateByUrl('/feed');
  }

  protected title(booking: Booking): string {
    return this.i18n.lang() === 'ar' ? booking.titleAr : booking.titleEn;
  }

  protected venue(booking: Booking): string {
    return this.i18n.lang() === 'ar' ? booking.venueNameAr : booking.venueNameEn;
  }

  protected time(booking: Booking): string {
    return timeLabel(booking.startAt, this.i18n.lang());
  }

  protected emoji(booking: Booking): string {
    return categoryEmoji(booking.category.code);
  }
}
