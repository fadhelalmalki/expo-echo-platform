import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-match-ring',
  standalone: true,
  template: `
    <div class="relative inline-flex items-center justify-center" [style.width.px]="size()" [style.height.px]="size()">
      <svg [attr.width]="size()" [attr.height]="size()" class="-rotate-90">
        <defs>
          <linearGradient [attr.id]="gradId()" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" [attr.stop-color]="colorStart()" />
            <stop offset="100%" [attr.stop-color]="colorEnd()" />
          </linearGradient>
        </defs>
        <circle
          [attr.cx]="size() / 2"
          [attr.cy]="size() / 2"
          [attr.r]="radius()"
          fill="none"
          stroke="rgba(18,18,26,0.08)"
          [attr.stroke-width]="thickness()"
        />
        <circle
          [attr.cx]="size() / 2"
          [attr.cy]="size() / 2"
          [attr.r]="radius()"
          fill="none"
          [attr.stroke]="'url(#' + gradId() + ')'"
          [attr.stroke-width]="thickness()"
          stroke-linecap="round"
          [attr.stroke-dasharray]="circumference()"
          [attr.stroke-dashoffset]="offset()"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span class="font-extrabold" [style.font-size.px]="size() * 0.3">{{ score() }}</span>
        <span class="text-[9px] font-semibold text-ink-soft/70">%</span>
      </div>
    </div>
  `,
})
export class MatchRingComponent {
  readonly score = input.required<number>();
  readonly colorStart = input('#006C35');
  readonly colorEnd = input('#4FB480');
  readonly size = input(60);
  readonly thickness = input(5);

  private readonly uid = Math.random().toString(36).slice(2, 8);
  protected readonly gradId = computed(() => `matchgrad-${this.uid}`);
  protected readonly radius = computed(() => this.size() / 2 - this.thickness());
  protected readonly circumference = computed(() => 2 * Math.PI * this.radius());
  protected readonly offset = computed(
    () => this.circumference() * (1 - Math.min(100, Math.max(0, this.score())) / 100),
  );
}
