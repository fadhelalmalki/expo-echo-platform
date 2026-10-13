import { Component, computed, inject, input } from '@angular/core';
import { ClockService } from '../core/clock.service';
import { I18nService } from '../core/i18n.service';

@Component({
  selector: 'app-countdown',
  standalone: true,
  template: `
    <span class="inline-flex items-center gap-1.5">
      @if (started()) {
        <span class="h-1.5 w-1.5 rounded-full bg-ink-soft/40"></span>{{ i18n.t('feed.started') }}
      } @else {
        <span
          class="h-1.5 w-1.5 rounded-full"
          [class]="imminent() ? 'bg-expo-red animate-pulse' : 'bg-expo-green'"
        ></span>
        @if (minutes() <= 0) {
          {{ i18n.t('feed.now') }}
        } @else {
          {{ i18n.t('feed.startsIn') }} {{ minutes() }} {{ i18n.t('common.minutesShort') }}
        }
      }
    </span>
  `,
})
export class CountdownComponent {
  readonly startAt = input.required<string>();
  protected readonly i18n = inject(I18nService);
  private readonly clock = inject(ClockService);

  protected readonly minutes = computed(() =>
    Math.floor((new Date(this.startAt()).getTime() - this.clock.now()) / 60000),
  );
  protected readonly started = computed(() => this.minutes() < 0);
  protected readonly imminent = computed(() => this.minutes() >= 0 && this.minutes() <= 15);
}
