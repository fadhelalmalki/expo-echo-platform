import { Category } from '../core/models';
import { Lang } from '../core/i18n.service';

const ICONS: Record<string, string> = {
  NATURE: '🌿',
  ART: '🎨',
  ARCHITECTURE: '🏛️',
  TECHNOLOGY: '🧠',
  SCIENCE: '🔬',
  TRADITION: '🏮',
};

export function categoryEmoji(code: string): string {
  return ICONS[code] ?? '✨';
}

export function localizedName(item: { nameEn: string; nameAr: string }, lang: Lang): string {
  return lang === 'ar' ? item.nameAr : item.nameEn;
}

export function categoryName(category: Category, lang: Lang): string {
  return lang === 'ar' ? category.nameAr : category.nameEn;
}

export function distanceLabel(meters: number | null | undefined, lang: Lang): string {
  if (meters == null) {
    return '';
  }
  if (meters < 1000) {
    return `${meters} ${lang === 'ar' ? 'م' : 'm'}`;
  }
  return `${(meters / 1000).toFixed(1)} ${lang === 'ar' ? 'كم' : 'km'}`;
}

export function timeLabel(iso: string, lang: Lang): string {
  const date = new Date(iso);
  return date.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function dayLabel(iso: string, lang: Lang): string {
  const date = new Date(iso);
  return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function gradient(category: Category): string {
  return `linear-gradient(135deg, ${category.colorStart}, ${category.colorEnd})`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join('') || '?';
}
