import { beforeEach, describe, expect, it } from 'vitest';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeAttribute('lang');
  });

  it('persists the chosen language and applies direction', () => {
    const i18n = new I18nService();

    i18n.setLang('ar');
    expect(i18n.lang()).toBe('ar');
    expect(localStorage.getItem('expoecho.lang')).toBe('ar');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');

    i18n.setLang('en');
    expect(i18n.lang()).toBe('en');
    expect(localStorage.getItem('expoecho.lang')).toBe('en');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
  });

  it('translates known keys for the active language', () => {
    const i18n = new I18nService();
    i18n.setLang('en');
    expect(i18n.t('onboarding.chooseLanguage')).toBe('Choose your language');
    i18n.setLang('ar');
    expect(i18n.t('onboarding.chooseLanguage')).toBe('اختر لغتك');
  });

  it('toggles between arabic and english', () => {
    const i18n = new I18nService();
    i18n.setLang('ar');
    i18n.toggle();
    expect(i18n.lang()).toBe('en');
    i18n.toggle();
    expect(i18n.lang()).toBe('ar');
  });
});
