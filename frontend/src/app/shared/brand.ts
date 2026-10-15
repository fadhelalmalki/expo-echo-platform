import { Lang } from '../core/i18n.service';

/** Where a logo is rendered. Drives the `sizes` hint so small screens fetch the smallest useful file. */
export type LogoSlot = 'header' | 'hero';

export interface LogoAsset {
  src: string;
  srcset: string;
  sizes: string;
  width: number;
  height: number;
}

interface LogoRung {
  file: string;
  width: number;
  height: number;
}

interface LogoVariant {
  /** Ascending by width. The largest rung doubles as the `src` fallback (the full-resolution master). */
  rungs: readonly LogoRung[];
  sizes: Record<LogoSlot, string>;
}

/**
 * Rendered widths are height-driven: header `clamp(2rem, 7vw, 3rem)`, hero `clamp(2.5rem, 11vw, 4.5rem)`.
 * Multiplying each clamp by the logo's aspect ratio (en 1286/245, ar 1120/259) gives the `sizes` below,
 * with the breakpoint where the height saturates (3rem / 7vw = 686px, 4.5rem / 11vw = 655px).
 *
 * The masters are the top rung rather than a generated file: the original encoders compress better than
 * anything we can resample to, so a generated 1134px/934px rung came out both larger and lower-resolution.
 */
const VARIANTS: Record<Lang, LogoVariant> = {
  en: {
    rungs: [
      { file: '/en-logo-504.png', width: 504, height: 96 },
      { file: '/en-logo-766.png', width: 766, height: 146 },
      { file: '/en-logo.png', width: 1286, height: 245 },
    ],
    sizes: {
      header: '(min-width: 686px) 252px, 36.74vw',
      hero: '(min-width: 655px) 378px, 57.74vw',
    },
  },
  ar: {
    rungs: [
      { file: '/ar-logo-415.png', width: 415, height: 96 },
      { file: '/ar-logo-623.png', width: 623, height: 144 },
      { file: '/ar-logo.png', width: 1120, height: 259 },
    ],
    sizes: {
      header: '(min-width: 686px) 208px, 30.27vw',
      hero: '(min-width: 655px) 311px, 47.57vw',
    },
  },
};

export function logoAsset(lang: Lang, slot: LogoSlot): LogoAsset {
  const variant = VARIANTS[lang];
  const largest = variant.rungs[variant.rungs.length - 1];
  return {
    src: largest.file,
    srcset: variant.rungs.map((rung) => `${rung.file} ${rung.width}w`).join(', '),
    sizes: variant.sizes[slot],
    width: largest.width,
    height: largest.height,
  };
}
