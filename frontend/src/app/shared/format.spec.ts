import { describe, expect, it } from 'vitest';
import { categoryEmoji, distanceLabel, initials } from './format';

describe('format helpers', () => {
  it('formats distance in meters under 1km', () => {
    expect(distanceLabel(150, 'en')).toBe('150 m');
    expect(distanceLabel(150, 'ar')).toBe('150 م');
  });

  it('formats distance in kilometers over 1km', () => {
    expect(distanceLabel(2500, 'en')).toBe('2.5 km');
  });

  it('returns empty for null distance', () => {
    expect(distanceLabel(null, 'en')).toBe('');
  });

  it('maps known categories to emojis', () => {
    expect(categoryEmoji('NATURE')).toBe('🌿');
    expect(categoryEmoji('UNKNOWN')).toBe('✨');
  });

  it('builds initials from a name', () => {
    expect(initials('Fadhel Almalki')).toBe('FA');
  });
});
