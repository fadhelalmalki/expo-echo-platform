import { Component, computed, inject, input, output } from '@angular/core';
import { EventCard } from '../core/models';
import { I18nService } from '../core/i18n.service';
import { CountdownComponent } from './countdown.component';
import { MatchRingComponent } from './match-ring.component';
import { categoryEmoji, distanceLabel, gradient } from './format';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CountdownComponent, MatchRingComponent],
  template: `
    <article
      (click)="open.emit(card())"
      class="card animate-slide-up cursor-pointer overflow-hidden transition active:scale-[0.99]"
    >
      <div class="h-1.5 w-full" [style.background]="gradientStyle()"></div>
      <div class="p-4">
        <div class="flex items-start justify-between gap-3">
          <div
            class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold text-white"
            [style.background]="gradientStyle()"
          >
            <span>{{ emoji() }}</span>
            <span>{{ categoryName() }}</span>
          </div>
          <app-match-ring
            [score]="card().matchScore"
            [colorStart]="card().category.colorStart"
            [colorEnd]="card().category.colorEnd"
            [size]="56"
          />
        </div>

        <h3 class="mt-3 text-lg font-extrabold leading-snug">{{ title() }}</h3>
        <p class="mt-0.5 text-sm text-ink-soft">
          📍 {{ venueName() }}<span class="mx-1">•</span>{{ area() }}
        </p>

        <div class="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span
            class="inline-flex items-center rounded-full px-2.5 py-1"
            [class]="
              card().minutesToStart >= 0 && card().minutesToStart <= 15
                ? 'bg-expo-red/10 text-expo-red'
                : 'bg-mist text-ink-soft'
            "
          >
            <app-countdown [startAt]="card().startAt" />
          </span>
          @if (card().distanceMeters !== null) {
            <span class="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-ink-soft">
              🚶 {{ distanceText() }}
            </span>
            <span class="inline-flex items-center rounded-full bg-mist px-2.5 py-1 text-ink-soft">
              {{ card().walkMinutes }} {{ i18n.t('common.minutesShort') }} {{ i18n.t('feed.walkMin') }}
            </span>
          }
        </div>

        @if (reason()) {
          <p
            class="mt-3 rounded-2xl border border-dashed border-expo-green/30 bg-expo-green/5 p-3 text-sm text-ink-soft"
          >
            <span class="font-bold text-expo-green">✨ {{ i18n.t('feed.why') }}</span>
            {{ reason() }}
          </p>
        }

        <div class="mt-4 flex items-center justify-between gap-3">
          <span class="text-xs font-semibold text-ink-soft">
            @if (card().full) {
              <span class="text-expo-red">{{ i18n.t('feed.full') }}</span>
            } @else {
              {{ card().seatsLeft }} {{ i18n.t('feed.seatsLeft') }}
            }
          </span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="calendar.emit(card()); $event.stopPropagation()"
              class="rounded-full border border-line p-2 text-lg"
              [attr.aria-label]="i18n.t('feed.addCalendar')"
            >
              🗓️
            </button>
            @if (card().booked) {
              <button
                type="button"
                (click)="cancel.emit(card()); $event.stopPropagation()"
                class="rounded-full bg-expo-green px-4 py-2 text-sm font-bold text-white"
              >
                ✓ {{ i18n.t('feed.confirmed') }}
              </button>
            } @else {
              <button
                type="button"
                [disabled]="card().full"
                (click)="book.emit(card()); $event.stopPropagation()"
                class="rounded-full px-4 py-2 text-sm font-bold text-white transition active:scale-95 disabled:opacity-40"
                [style.background]="gradientStyle()"
              >
                {{ i18n.t('feed.confirm') }}
              </button>
            }
          </div>
        </div>
      </div>
    </article>
  `,
})
export class EventCardComponent {
  readonly card = input.required<EventCard>();
  readonly i18n = inject(I18nService);

  readonly book = output<EventCard>();
  readonly cancel = output<EventCard>();
  readonly open = output<EventCard>();
  readonly calendar = output<EventCard>();

  protected readonly title = computed(() =>
    this.i18n.lang() === 'ar' ? this.card().titleAr : this.card().titleEn,
  );
  protected readonly venueName = computed(() =>
    this.i18n.lang() === 'ar' ? this.card().venue.nameAr : this.card().venue.nameEn,
  );
  protected readonly area = computed(() => this.card().venue.areaCode);
  protected readonly categoryName = computed(() =>
    this.i18n.lang() === 'ar' ? this.card().category.nameAr : this.card().category.nameEn,
  );
  protected readonly emoji = computed(() => categoryEmoji(this.card().category.code));
  protected readonly gradientStyle = computed(() => gradient(this.card().category));
  protected readonly distanceText = computed(() =>
    distanceLabel(this.card().distanceMeters, this.i18n.lang()),
  );
  protected readonly reason = computed(() => {
    const c = this.card();
    const text = this.i18n.lang() === 'ar' ? c.aiReasonAr : c.aiReasonEn;
    return text ?? '';
  });
}
