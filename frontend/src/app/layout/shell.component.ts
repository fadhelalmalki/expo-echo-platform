import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { I18nService } from '../core/i18n.service';
import { ProfileService } from '../core/profile.service';
import { logoAsset } from '../shared/brand';
import { initials } from '../shared/format';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="mx-auto flex min-h-dvh w-full max-w-2xl flex-col bg-mist">
      <header class="glass safe-top sticky top-0 z-40 border-b border-line/70">
        <div class="flex items-center justify-between px-4 py-3">
          <a routerLink="/feed" class="flex min-w-0 items-center gap-2.5">
            <img
              [src]="logo().src"
              [srcset]="logo().srcset"
              [sizes]="logo().sizes"
              [attr.width]="logo().width"
              [attr.height]="logo().height"
              [alt]="i18n.t('app.logoAlt')"
              fetchpriority="high"
              class="h-[clamp(2rem,7vw,3rem)] w-auto min-w-0 max-w-full object-contain"
            />
          </a>
          <div class="flex shrink-0 items-center gap-2">
            <button
              type="button"
              (click)="i18n.toggle()"
              class="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink-soft"
            >
              {{ i18n.lang() === 'ar' ? 'EN' : 'AR' }}
            </button>
            <a
              routerLink="/profile"
              class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ring-1 ring-black/10 transition hover:scale-105"
              style="background: linear-gradient(135deg, #47266c, #95629e)"
              [title]="profile.visitor()?.displayName ?? ''"
            >
              {{ avatar() }}
            </a>
          </div>
        </div>
      </header>

      <main class="flex-1 px-4 pb-28 pt-4">
        <router-outlet />
      </main>

      <nav class="glass safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line/70">
        <div class="mx-auto flex max-w-2xl items-stretch justify-around px-2">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="text-expo-green"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-bold text-ink-soft"
            >
              <span class="text-xl">{{ item.icon }}</span>
              {{ i18n.t(item.label) }}
            </a>
          }
        </div>
      </nav>
    </div>
  `,
})
export class ShellComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly profile = inject(ProfileService);

  protected readonly logo = computed(() => logoAsset(this.i18n.lang(), 'header'));

  protected readonly avatar = computed(() => {
    const name = this.profile.visitor()?.displayName;
    return name ? initials(name) : '👤';
  });

  protected readonly navItems = [
    { path: '/feed', icon: '✨', label: 'nav.feed' },
    { path: '/map', icon: '🗺️', label: 'nav.map' },
    { path: '/bookings', icon: '🗓️', label: 'nav.bookings' },
    { path: '/profile', icon: '👤', label: 'nav.profile' },
  ];
}
