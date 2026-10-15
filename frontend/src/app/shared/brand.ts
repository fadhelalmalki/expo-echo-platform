import { Lang } from '../core/i18n.service';

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
  sizes: string;
}

/**
 * Header logos render at a fixed `h-6` (24px) and `sm:h-8` (32px), so the intrinsic width is a constant
 * per breakpoint: height x aspect ratio (en 1286/245, ar 1120/259).
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
    sizes: '(min-width: 640px) 168px, 126px',
  },
  ar: {
    rungs: [
      { file: '/ar-logo-415.png', width: 415, height: 96 },
      { file: '/ar-logo-623.png', width: 623, height: 144 },
      { file: '/ar-logo.png', width: 1120, height: 259 },
    ],
    sizes: '(min-width: 640px) 138px, 104px',
  },
};

export function logoAsset(lang: Lang): LogoAsset {
  const variant = VARIANTS[lang];
  const largest = variant.rungs[variant.rungs.length - 1];
  return {
    src: largest.file,
    srcset: variant.rungs.map((rung) => `${rung.file} ${rung.width}w`).join(', '),
    sizes: variant.sizes,
    width: largest.width,
    height: largest.height,
  };
}
