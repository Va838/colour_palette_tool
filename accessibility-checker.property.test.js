/**
 * Property-based tests for AccessibilityChecker class
 * Feature: color-palette-tool, Property 10: Accessible text-background pairs exist
 * Validates: Requirements 4.1, 4.3
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import AccessibilityChecker from './accessibility-checker.js';

describe('AccessibilityChecker - Property-Based Tests', () => {
  const checker = new AccessibilityChecker();

  /**
   * Generate a valid HEX color code
   */
  const hexColorArbitrary = fc.hexaString({ minLength: 6, maxLength: 6 }).map(hex => `#${hex.toUpperCase()}`);

  /**
   * Generate a palette with random colors
   */
  const paletteArbitrary = fc.record({
    colors: fc.record({
      primary: hexColorArbitrary,
      secondary: hexColorArbitrary,
      accent: hexColorArbitrary,
      background: hexColorArbitrary,
      surface: hexColorArbitrary,
      text: hexColorArbitrary
    })
  });

  /**
   * Generate a palette that is guaranteed to have at least one high-contrast pair
   * by including both very dark and very light colors
   */
  const accessiblePaletteArbitrary = fc.record({
    colors: fc.tuple(
      hexColorArbitrary, // random color 1
      hexColorArbitrary, // random color 2
      hexColorArbitrary, // random color 3
      fc.constantFrom('#000000', '#111111', '#222222'), // dark color
      fc.constantFrom('#FFFFFF', '#EEEEEE', '#DDDDDD')  // light color
    ).map(([c1, c2, c3, dark, light]) => ({
      primary: c1,
      secondary: c2,
      accent: c3,
      background: dark,
      text: light
    }))
  });

  describe('Property 10: Accessible text-background pairs exist', () => {
    it('should find at least one accessible pair in palettes with high contrast colors', () => {
      fc.assert(
        fc.property(accessiblePaletteArbitrary, (palette) => {
          const pairs = checker.findAccessiblePairs(palette);
          
          // Should find at least one accessible pair
          expect(pairs.length).toBeGreaterThan(0);
          
          // All returned pairs should meet WCAG AA (4.5:1)
          pairs.forEach(pair => {
            expect(pair.ratio).toBeGreaterThanOrEqual(4.5);
          });
          
          // Each pair should have required properties
          pairs.forEach(pair => {
            expect(pair).toHaveProperty('text');
            expect(pair).toHaveProperty('background');
            expect(pair).toHaveProperty('ratio');
            expect(typeof pair.text).toBe('string');
            expect(typeof pair.background).toBe('string');
            expect(typeof pair.ratio).toBe('number');
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should only return pairs that meet WCAG AA standard', () => {
      fc.assert(
        fc.property(paletteArbitrary, (palette) => {
          const pairs = checker.findAccessiblePairs(palette);
          
          // Every returned pair must meet WCAG AA
          pairs.forEach(pair => {
            expect(pair.ratio).toBeGreaterThanOrEqual(4.5);
            expect(checker.meetsWCAG_AA(pair.ratio)).toBe(true);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should calculate consistent contrast ratios for the same color pairs', () => {
      fc.assert(
        fc.property(hexColorArbitrary, hexColorArbitrary, (color1, color2) => {
          const ratio1 = checker.calculateContrastRatio(color1, color2);
          const ratio2 = checker.calculateContrastRatio(color2, color1);
          
          // Contrast ratio should be the same regardless of order
          expect(ratio1).toBeCloseTo(ratio2, 5);
        }),
        { numRuns: 100 }
      );
    });

    it('should return contrast ratios between 1 and 21', () => {
      fc.assert(
        fc.property(hexColorArbitrary, hexColorArbitrary, (color1, color2) => {
          const ratio = checker.calculateContrastRatio(color1, color2);
          
          // Contrast ratio must be between 1:1 and 21:1
          expect(ratio).toBeGreaterThanOrEqual(1);
          expect(ratio).toBeLessThanOrEqual(21);
        }),
        { numRuns: 100 }
      );
    });

    it('should return ratio of 1 for identical colors', () => {
      fc.assert(
        fc.property(hexColorArbitrary, (color) => {
          const ratio = checker.calculateContrastRatio(color, color);
          
          // Same color should have contrast ratio of 1:1
          expect(ratio).toBeCloseTo(1, 1);
        }),
        { numRuns: 100 }
      );
    });

    it('should identify black and white as having maximum contrast', () => {
      const ratio = checker.calculateContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0);
      expect(checker.meetsWCAG_AA(ratio)).toBe(true);
      expect(checker.meetsWCAG_AAA(ratio)).toBe(true);
    });
  });
});
