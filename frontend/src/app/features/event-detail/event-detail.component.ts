import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { I18nService } from '../../core/i18n.service';
import { ProfileService } from '../../core/profile.service';
import { ToastService } from '../../core/toast.service';
import { EventCard } from '../../core/models';
import { CountdownComponent } from '../../shared/countdown.component';
import { MatchRingComponent } from '../../shared/match-ring.component';
import { categoryEmoji, distanceLabel, timeLabel } from '../../shared/format';

interface BreakdownRow {
  label: string;
  value: number;
  max: number;
  color: string;
}

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CountdownComponent, MatchRingComponent],
  template: `
    @if (card(); as c) {
      <div class="animate-slide-up pb-6">
        <button
          type="button"
          (click)="back()"
          class="mb-3 inline-flex items-center gap-1 text-sm font-bold text-ink-soft"
        >
          {{ i18n.isRtl() ? '→' : '←' }} {{ i18n.t('detail.back') }}
        </button>

        <div
          class="card overflow-hidden p-0 text-white"
          [style.background]="'linear-gradient(135deg, ' + c.category.colorStart + ', ' + c.category.colorEnd + ')'"
        >
          <div class="flex items-start justify-between gap-3 p-5">
            <div class="min-w-0">
              <span class="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                {{ emoji(c) }} {{ categoryName(c) }}
              </span>
              <h1 class="mt-3 text-2xl font-black leading-tight">{{ title(c) }}</h1>
              <p class="mt-1 text-sm text-white/90">
                📍 {{ venueName(c) }}<span class="mx-1">•</span>{{ time(c) }}
              </p>
            </div>
            <div class="flex shrink-0 flex-col items-center gap-1">
              <div class="rounded-full bg-white/15 p-1">
                <app-match-ring
                  [score]="c.matchScore"
                  colorStart="#ffffff"
                  colorEnd="#ffffff"
                  [size]="66"
                />
              </div>
              <span class="text-[10px] font-bold text-white/90">{{ i18n.t('detail.score') }}</span>
            </div>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
          <span class="rounded-full bg-expo-red/10 px-3 py-1.5 text-expo-red">
            <app-countdown [startAt]="c.startAt" />
          </span>
          @if (c.distanceMeters !== null) {
            <span class="rounded-full bg-mist px-3 py-1.5 text-ink-soft">🚶 {{ dist(c) }}</span>
            <span class="rounded-full bg-mist px-3 py-1.5 text-ink-soft">
              ⏱️ {{ c.walkMinutes }} {{ i18n.t('feed.walkMin') }}
            </span>
          }
        </div>

        <button
          type="button"
          (click)="toggleBooking(c)"
          class="mt-4 w-full rounded-2xl py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98]"
          [style.background]="c.booked ? '#006c35' : 'linear-gradient(135deg, ' + c.category.colorStart + ', ' + c.category.colorEnd + ')'"
        >
          {{ c.booked ? '✓ ' + i18n.t('detail.booked') : i18n.t('detail.book') }}
        </button>

        <section class="card mt-4 p-4">
          <h2 class="text-sm font-extrabold text-expo-green">✨ {{ i18n.t('detail.whyThisMatch') }}</h2>
          <p class="mt-2 text-sm leading-relaxed text-ink-soft">{{ reason(c) }}</p>
        </section>

        <section class="card mt-4 p-4">
          <h2 class="text-sm font-extrabold">{{ i18n.t('detail.score') }} — {{ c.matchScore }}%</h2>
          <div class="mt-3 space-y-2.5">
            @for (row of rows(c); track row.label) {
              <div>
                <div class="flex items-center justify-between text-xs font-semibold text-ink-soft">
                  <span>{{ row.label }}</span>
                  <span>{{ row.value }}/{{ row.max }}</span>
                </div>
                <div class="mt-1 h-2 w-full overflow-hidden rounded-full bg-mist">
                  <div
                    class="h-full rounded-full"
                    [style.width.%]="(row.value / row.max) * 100"
                    [style.background]="row.color"
                  ></div>
                </div>
              </div>
            }
          </div>
        </section>

        <section class="card mt-4 p-4">
          <h2 class="text-sm font-extrabold">{{ i18n.t('detail.about') }}</h2>
          <p class="mt-2 text-sm leading-relaxed text-ink-soft">{{ description(c) }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            @for (tag of c.tags; track tag) {
              <span class="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink-soft">
                #{{ tag }}
              </span>
            }
          </div>
          <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-2xl bg-mist p-3">
              <dt class="text-xs text-ink-soft">{{ i18n.t('detail.language') }}</dt>
              <dd class="font-bold uppercase">{{ c.language }}</dd>
            </div>
            <div class="rounded-2xl bg-mist p-3">
              <dt class="text-xs text-ink-soft">{{ i18n.t('detail.seats') }}</dt>
              <dd class="font-bold">{{ c.seatsLeft }} / {{ c.capacity }}</dd>
            </div>
          </dl>
        </section>
      </div>
    } @else {
      <div class="p-8 text-center text-ink-soft">{{ i18n.t('common.loading') }}</div>
    }
  `,
})
export class EventDetailComponent implements OnInit {
  protected readonly i18n = inject(I18nService);
  private readonly profile = inject(ProfileService);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly card = signal<EventCard | null>(null);
  private readonly eventId = Number(this.route.snapshot.paramMap.get('id'));

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    const id = this.profile.visitorId;
    if (!id) {
      return;
    }
    this.api.getRecommendations(id, 1440, undefined, 50).subscribe((response) => {
      const found = response.cards.find((c) => c.id === this.eventId);
      if (found) {
        this.card.set(found);
      } else {
        this.api.getEvent(this.eventId).subscribe((event) => {
          if (event) {
            this.card.set({ ...(event as unknown as EventCard), matchScore: 0 });
          }
        });
      }
    });
  }

  protected title(c: EventCard): string {
    return this.i18n.lang() === 'ar' ? c.titleAr : c.titleEn;
  }

  protected description(c: EventCard): string {
    return this.i18n.lang() === 'ar' ? c.descriptionAr : c.descriptionEn;
  }

  protected venueName(c: EventCard): string {
    return this.i18n.lang() === 'ar' ? c.venue.nameAr : c.venue.nameEn;
  }

  protected categoryName(c: EventCard): string {
    return this.i18n.lang() === 'ar' ? c.category.nameAr : c.category.nameEn;
  }

  protected reason(c: EventCard): string {
    return (this.i18n.lang() === 'ar' ? c.aiReasonAr : c.aiReasonEn) ?? '';
  }

  protected emoji(c: EventCard): string {
    return categoryEmoji(c.category.code);
  }

  protected time(c: EventCard): string {
    return timeLabel(c.startAt, this.i18n.lang());
  }

  protected dist(c: EventCard): string {
    return distanceLabel(c.distanceMeters, this.i18n.lang());
  }

  protected rows(c: EventCard): BreakdownRow[] {
    return [
      { label: this.i18n.t('detail.interestFit'), value: c.breakdown.interest, max: 40, color: '#47266c' },
      { label: this.i18n.t('detail.distance'), value: c.breakdown.proximity, max: 25, color: '#1e87bd' },
      { label: this.i18n.t('detail.timing'), value: c.breakdown.timing, max: 20, color: '#e8431b' },
      { label: this.i18n.t('detail.availability'), value: c.breakdown.capacity, max: 10, color: '#08b0a0' },
      { label: this.i18n.t('detail.popularity'), value: c.breakdown.popularity, max: 5, color: '#fab712' },
    ];
  }

  protected toggleBooking(c: EventCard): void {
    const id = this.profile.visitorId;
    if (!id) {
      return;
    }
    if (c.booked) {
      this.api.cancel(id, c.id).subscribe(() => {
        this.card.set({ ...c, booked: false, seatsLeft: c.seatsLeft + 1 });
        this.toast.show(this.i18n.t('detail.cancel'), 'info');
      });
    } else {
      this.api.book(id, c.id).subscribe({
        next: () => {
          this.card.set({ ...c, booked: true, seatsLeft: Math.max(0, c.seatsLeft - 1) });
          this.toast.show(
            this.i18n.lang() === 'ar' ? 'تم تأكيد حضورك ✅' : 'Attendance confirmed ✅',
            'success',
          );
        },
        error: () => this.toast.show(this.i18n.t('common.error'), 'error'),
      });
    }
  }

  protected back(): void {
    this.router.navigateByUrl('/feed');
  }
}
