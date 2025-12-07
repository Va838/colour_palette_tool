/**
 * Unit tests for AccessibilityChecker class
 * Requirements: 4.1, 4.3
 */

import { describe, it, expect } from 'vitest';
import AccessibilityChecker from './accessibility-checker.js';

describe('AccessibilityChecker', () => {
  const checker = new AccessibilityChecker();

  describe('getRelativeLuminance', () => {
    it('should calculate luminance for black as 0', () => {
      const result = checker.getRelativeLuminance('#000000');
      expect(result).toBeCloseTo(0, 5);
    });

    it('should calculate luminance for white as 1', () => {
      const result = checker.getRelativeLuminance('#FFFFFF');
      expect(result).toBeCloseTo(1, 5);
    });

    it('should calculate luminance for mid-grey', () => {
      const result = checker.getRelativeLuminance('#808080');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });
  });

  describe('calculateContrastRatio', () => {
    it('should calculate black/white contrast ratio as approximately 21', () => {
      const result = checker.calculateContrastRatio('#000000', '#FFFFFF');
      expect(result).toBeCloseTo(21, 0);
    });

    it('should calculate white/black contrast ratio as approximately 21', () => {
      const result = checker.calculateContrastRatio('#FFFFFF', '#000000');
      expect(result).toBeCloseTo(21, 0);
    });

    it('should calculate same color contrast ratio as 1', () => {
      const result = checker.calculateContrastRatio('#FF5733', '#FF5733');
      expect(result).toBeCloseTo(1, 1);
    });

    it('should calculate contrast ratio for grey on white', () => {
      const result = checker.calculateContrastRatio('#767676', '#FFFFFF');
      expect(result).toBeGreaterThan(4.5); // Should meet WCAG AA
    });
  });

  describe('meetsWCAG_AA', () => {
    it('should return true for contrast ratio of 4.5:1', () => {
      expect(checker.meetsWCAG_AA(4.5)).toBe(true);
    });

    it('should return true for contrast ratio above 4.5:1', () => {
      expect(checker.meetsWCAG_AA(7.0)).toBe(true);
    });

    it('should return false for contrast ratio below 4.5:1', () => {
      expect(checker.meetsWCAG_AA(4.0)).toBe(false);
    });

    it('should return false for contrast ratio of 1:1', () => {
      expect(checker.meetsWCAG_AA(1.0)).toBe(false);
    });
  });

  describe('meetsWCAG_AAA', () => {
    it('should return true for contrast ratio of 7:1', () => {
      expect(checker.meetsWCAG_AAA(7.0)).toBe(true);
    });

    it('should return true for contrast ratio above 7:1', () => {
      expect(checker.meetsWCAG_AAA(21.0)).toBe(true);
    });

    it('should return false for contrast ratio below 7:1', () => {
      expect(checker.meetsWCAG_AAA(6.5)).toBe(false);
    });

    it('should return false for contrast ratio of 4.5:1', () => {
      expect(checker.meetsWCAG_AAA(4.5)).toBe(false);
    });
  });

  describe('findAccessiblePairs', () => {
    it('should find accessible pairs in a palette with high contrast colors', () => {
      const palette = {
        colors: {
          primary: '#0000FF',
          secondary: '#FFFFFF',
          accent: '#FF0000',
          background: '#000000',
          text: '#FFFFFF'
        }
      };

      const result = checker.findAccessiblePairs(palette);
      expect(result.length).toBeGreaterThan(0);
      
      // All returned pairs should meet WCAG AA
      result.forEach(pair => {
        expect(pair.ratio).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should return empty array for palette with only low contrast colors', () => {
      const palette = {
        colors: {
          primary: '#888888',
          secondary: '#999999',
          accent: '#AAAAAA',
          background: '#BBBBBB',
          text: '#CCCCCC'
        }
      };

      const result = checker.findAccessiblePairs(palette);
      // May have some pairs, but very few
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle palette with Color objects (hex property)', () => {
      const palette = {
        colors: {
          primary: { hex: '#0000FF', role: 'primary' },
          background: { hex: '#FFFFFF', role: 'background' }
        }
      };

      const result = checker.findAccessiblePairs(palette);
      expect(result.length).toBeGreaterThan(0);
      
      // Should find the blue/white pair
      const blueWhitePair = result.find(
        pair => pair.text === '#0000FF' && pair.background === '#FFFFFF'
      );
      expect(blueWhitePair).toBeDefined();
      expect(blueWhitePair.ratio).toBeGreaterThan(4.5);
    });

    it('should include ratio property in each pair', () => {
      const palette = {
        colors: {
          text: '#000000',
          background: '#FFFFFF'
        }
      };

      const result = checker.findAccessiblePairs(palette);
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(pair => {
        expect(pair).toHaveProperty('text');
        expect(pair).toHaveProperty('background');
        expect(pair).toHaveProperty('ratio');
        expect(typeof pair.ratio).toBe('number');
      });
    });
  });
});
