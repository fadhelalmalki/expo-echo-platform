import { Component, inject } from '@angular/core';
import { I18nService } from '../core/i18n.service';

/**
 * Segmented language control shared by the shell header and the onboarding page.
 *
 * Each segment keeps a 44px tap target (Apple HIG / WCAG 2.5.5) via an invisible pseudo-element while
 * staying 32px tall, and `min-w-11` keeps the control's width stable when the selection changes.
 */
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  template: `
    <div
      role="group"
      [attr.aria-label]="i18n.t('common.language')"
      class="inline-flex items-center rounded-full border border-line bg-white p-0.5 shadow-sm"
    >
      <button
        type="button"
        (click)="i18n.setLang('ar')"
        [attr.aria-pressed]="i18n.lang() === 'ar'"
        class="relative min-h-8 min-w-11 rounded-full px-2.5 text-xs font-bold transition before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']"
        [class]="i18n.lang() === 'ar' ? 'bg-expo-green text-white' : 'text-ink-soft'"
      >
        {{ i18n.t('common.arabic') }}
      </button>
      <button
        type="button"
        (click)="i18n.setLang('en')"
        [attr.aria-pressed]="i18n.lang() === 'en'"
        class="relative min-h-8 min-w-11 rounded-full px-2.5 text-xs font-bold transition before:absolute before:-inset-y-1.5 before:inset-x-0 before:content-['']"
        [class]="i18n.lang() === 'en' ? 'bg-expo-green text-white' : 'text-ink-soft'"
      >
        {{ i18n.t('common.english') }}
      </button>
    </div>
  `,
})
export class LanguageSwitcherComponent {
  protected readonly i18n = inject(I18nService);
}
