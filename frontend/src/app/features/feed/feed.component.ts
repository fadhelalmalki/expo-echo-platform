import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';
import { ProfileService } from '../../core/profile.service';
import { ToastService } from '../../core/toast.service';
import { EventCard } from '../../core/models';
import { EventCardComponent } from '../../shared/event-card.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [EventCardComponent],
  template: `
    <div class="animate-slide-up">
      <h1 class="text-2xl font-black">{{ i18n.t('feed.title') }}</h1>
      <p class="mt-0.5 text-sm text-ink-soft">
        {{ i18n.t('feed.forYou') }}<span class="mx-1">•</span
        ><a routerLink="/profile" class="font-semibold text-expo-green hover:underline">{{ visitorName() }}</a>
      </p>
    </div>

    <div class="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      <span class="shrink-0 text-xs font-bold text-ink-soft">{{ i18n.t('feed.timeWindow') }}:</span>
      @for (option of timeOptions; track option) {
        <button
          type="button"
          (click)="setWindow(option)"
          class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition"
          [class]="
            timeWindow() === option
              ? 'border-expo-green bg-expo-green text-white'
              : 'border-line bg-white text-ink-soft'
          "
        >
          {{ option }} {{ i18n.t('common.minutesShort') }}
        </button>
      }
      <button
        type="button"
        (click)="load()"
        class="ms-auto shrink-0 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink-soft"
      >
        ↻ {{ i18n.t('feed.refresh') }}
      </button>
    </div>

    @if (loading()) {
      <div class="mt-6 space-y-4">
        @for (skeleton of [1, 2, 3]; track skeleton) {
          <div class="card h-40 animate-pulse bg-white/70"></div>
        }
      </div>
    } @else if (cards().length === 0) {
      <div class="card mt-6 p-8 text-center">
        <p class="text-4xl">🧭</p>
        <p class="mt-3 font-bold">{{ i18n.t('feed.noResults') }}</p>
        <p class="mt-1 text-sm text-ink-soft">{{ i18n.t('feed.noResultsHint') }}</p>
      </div>
    } @else {
      <div class="mt-4 space-y-4">
        @for (card of cards(); track card.id) {
          <app-event-card
            [card]="card"
            (book)="book($event)"
            (cancel)="cancel($event)"
            (open)="openDetail($event)"
          />
        }
      </div>
    }
  `,
})
export class FeedComponent implements OnInit {
  protected readonly i18n = inject(I18nService);
  protected readonly profile = inject(ProfileService);
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly timeOptions = [15, 30, 60, 120];
  protected readonly cards = signal<EventCard[]>([]);
  protected readonly loading = signal(true);
  protected readonly timeWindow = signal<number>(30);

  protected readonly visitorName = computed(() => this.profile.visitor()?.displayName ?? '');

  ngOnInit(): void {
    const visitor = this.profile.visitor();
    if (visitor?.availableMinutes) {
      this.timeWindow.set(visitor.availableMinutes);
    }
    this.load();
  }

  protected setWindow(minutes: number): void {
    this.timeWindow.set(minutes);
    this.load();
  }

  protected load(): void {
    const id = this.profile.visitorId;
    if (!id) {
      return;
    }
    this.loading.set(true);
    this.api.getRecommendations(id, this.timeWindow(), undefined, 20).subscribe({
      next: (response) => {
        this.cards.set(response.cards);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show(this.i18n.t('common.error'), 'error');
      },
    });
  }

  protected book(card: EventCard): void {
    const id = this.profile.visitorId;
    if (!id) {
      return;
    }
    this.api.book(id, card.id).subscribe({
      next: () => {
        this.updateCard(card.id, (c) => ({
          ...c,
          booked: true,
          bookedCount: c.bookedCount + 1,
          seatsLeft: Math.max(0, c.seatsLeft - 1),
        }));
        this.toast.show(
          this.i18n.lang() === 'ar' ? 'تم تأكيد حضورك ✅' : 'Attendance confirmed ✅',
          'success',
        );
      },
      error: () => this.toast.show(this.i18n.t('common.error'), 'error'),
    });
  }

  protected cancel(card: EventCard): void {
    const id = this.profile.visitorId;
    if (!id) {
      return;
    }
    this.api.cancel(id, card.id).subscribe({
      next: () => {
        this.updateCard(card.id, (c) => ({
          ...c,
          booked: false,
          bookedCount: Math.max(0, c.bookedCount - 1),
          seatsLeft: c.seatsLeft + 1,
        }));
      },
      error: () => this.toast.show(this.i18n.t('common.error'), 'error'),
    });
  }

  protected openDetail(card: EventCard): void {
    this.router.navigate(['/events', card.id]);
  }

  private updateCard(id: number, patch: (card: EventCard) => EventCard): void {
    this.cards.update((list) => list.map((c) => (c.id === id ? patch(c) : c)));
  }
}
