/**
 * Unit tests for ColorUtility class
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import { describe, it, expect } from 'vitest';
import ColorUtility from './color-utility.js';

describe('ColorUtility', () => {
  const colorUtil = new ColorUtility();

  describe('HEX to RGB conversion', () => {
    it('should convert #FF5733 to RGB(255, 87, 51)', () => {
      const result = colorUtil.hexToRgb('#FF5733');
      expect(result).toEqual({ r: 255, g: 87, b: 51 });
    });

    it('should convert hex without # prefix', () => {
      const result = colorUtil.hexToRgb('FF5733');
      expect(result).toEqual({ r: 255, g: 87, b: 51 });
    });

    it('should convert #000000 to RGB(0, 0, 0)', () => {
      const result = colorUtil.hexToRgb('#000000');
      expect(result).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should convert #FFFFFF to RGB(255, 255, 255)', () => {
      const result = colorUtil.hexToRgb('#FFFFFF');
      expect(result).toEqual({ r: 255, g: 255, b: 255 });
    });
  });

  describe('RGB to HEX conversion', () => {
    it('should convert RGB(255, 87, 51) to #FF5733', () => {
      const result = colorUtil.rgbToHex(255, 87, 51);
      expect(result).toBe('#FF5733');
    });

    it('should convert RGB(0, 0, 0) to #000000', () => {
      const result = colorUtil.rgbToHex(0, 0, 0);
      expect(result).toBe('#000000');
    });

    it('should convert RGB(255, 255, 255) to #FFFFFF', () => {
      const result = colorUtil.rgbToHex(255, 255, 255);
      expect(result).toBe('#FFFFFF');
    });

    it('should handle decimal values by rounding', () => {
      const result = colorUtil.rgbToHex(255.4, 87.6, 51.2);
      expect(result).toBe('#FF5833');
    });
  });

  describe('RGB to HSL conversion', () => {
    it('should convert RGB(255, 87, 51) to HSL approximately', () => {
      const result = colorUtil.rgbToHsl(255, 87, 51);
      expect(result.h).toBeCloseTo(11, 0);
      expect(result.s).toBeCloseTo(100, 0);
      expect(result.l).toBeCloseTo(60, 0);
    });

    it('should convert RGB(0, 0, 0) to HSL(0, 0, 0)', () => {
      const result = colorUtil.rgbToHsl(0, 0, 0);
      expect(result).toEqual({ h: 0, s: 0, l: 0 });
    });

    it('should convert RGB(255, 255, 255) to HSL(0, 0, 100)', () => {
      const result = colorUtil.rgbToHsl(255, 255, 255);
      expect(result).toEqual({ h: 0, s: 0, l: 100 });
    });

    it('should convert RGB(128, 128, 128) to grey HSL', () => {
      const result = colorUtil.rgbToHsl(128, 128, 128);
      expect(result.h).toBe(0);
      expect(result.s).toBe(0);
      expect(result.l).toBeCloseTo(50, 0);
    });
  });

  describe('HSL to RGB conversion', () => {
    it('should convert HSL(11, 100, 60) to RGB approximately', () => {
      const result = colorUtil.hslToRgb(11, 100, 60);
      expect(result.r).toBe(255);
      expect(result.g).toBe(88); // Actual correct value from HSL conversion
      expect(result.b).toBe(51);
    });

    it('should convert HSL(0, 0, 0) to RGB(0, 0, 0)', () => {
      const result = colorUtil.hslToRgb(0, 0, 0);
      expect(result).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should convert HSL(0, 0, 100) to RGB(255, 255, 255)', () => {
      const result = colorUtil.hslToRgb(0, 0, 100);
      expect(result).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should convert HSL(0, 0, 50) to grey RGB', () => {
      const result = colorUtil.hslToRgb(0, 0, 50);
      expect(result.r).toBeCloseTo(128, 1);
      expect(result.g).toBeCloseTo(128, 1);
      expect(result.b).toBeCloseTo(128, 1);
    });
  });

  describe('Round-trip conversions', () => {
    it('should maintain color through HEX -> RGB -> HEX', () => {
      const original = '#FF5733';
      const rgb = colorUtil.hexToRgb(original);
      const result = colorUtil.rgbToHex(rgb.r, rgb.g, rgb.b);
      expect(result).toBe(original);
    });

    it('should maintain color through RGB -> HSL -> RGB with minimal loss', () => {
      const original = { r: 255, g: 87, b: 51 };
      const hsl = colorUtil.rgbToHsl(original.r, original.g, original.b);
      const result = colorUtil.hslToRgb(hsl.h, hsl.s, hsl.l);
      // Due to rounding in HSL conversion, allow 1-2 unit difference
      expect(result.r).toBeCloseTo(original.r, -1);
      expect(result.g).toBeCloseTo(original.g, -1);
      expect(result.b).toBeCloseTo(original.b, -1);
    });
  });

  describe('adjustHue', () => {
    it('should adjust hue by positive degrees', () => {
      const result = colorUtil.adjustHue('#FF0000', 120);
      const hsl = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result)));
      expect(hsl.h).toBeCloseTo(120, 0);
    });

    it('should adjust hue by negative degrees', () => {
      const result = colorUtil.adjustHue('#FF0000', -60);
      const hsl = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result)));
      expect(hsl.h).toBeCloseTo(300, 0);
    });

    it('should wrap hue around 360 degrees', () => {
      const result = colorUtil.adjustHue('#FF0000', 400);
      const hsl = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result)));
      expect(hsl.h).toBeCloseTo(40, 0);
    });
  });

  describe('adjustSaturation', () => {
    it('should increase saturation', () => {
      const original = '#808080'; // Grey with 0% saturation
      const result = colorUtil.adjustSaturation(original, 50);
      const hsl = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result)));
      expect(hsl.s).toBeCloseTo(50, 0);
    });

    it('should decrease saturation', () => {
      const original = '#FF0000'; // Red with 100% saturation
      const result = colorUtil.adjustSaturation(original, -30);
      const hsl = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result)));
      expect(hsl.s).toBeCloseTo(70, 5);
    });

    it('should clamp saturation at 0', () => {
      const result = colorUtil.adjustSaturation('#FF0000', -200);
      const hsl = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result)));
      expect(hsl.s).toBe(0);
    });

    it('should clamp saturation at 100', () => {
      const result = colorUtil.adjustSaturation('#808080', 200);
      const hsl = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result)));
      expect(hsl.s).toBe(100);
    });
  });

  describe('adjustLightness', () => {
    it('should increase lightness', () => {
      const original = '#808080'; // Grey with 50% lightness
      const result = colorUtil.adjustLightness(original, 20);
      const hsl = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result)));
      expect(hsl.l).toBeCloseTo(70, 5);
    });

    it('should decrease lightness', () => {
      const original = '#808080'; // Grey with 50% lightness
      const result = colorUtil.adjustLightness(original, -20);
      const hsl = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result)));
      expect(hsl.l).toBeCloseTo(30, 5);
    });

    it('should clamp lightness at 0', () => {
      const result = colorUtil.adjustLightness('#808080', -200);
      const hsl = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result)));
      expect(hsl.l).toBe(0);
    });

    it('should clamp lightness at 100', () => {
      const result = colorUtil.adjustLightness('#808080', 200);
      const hsl = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result)));
      expect(hsl.l).toBe(100);
    });
  });

  describe('generateAnalogous', () => {
    it('should generate 3 analogous colors', () => {
      const result = colorUtil.generateAnalogous('#FF0000');
      expect(result).toHaveLength(3);
      expect(result[1]).toBe('#FF0000'); // Middle color is the base
    });

    it('should have colors 30 degrees apart', () => {
      const result = colorUtil.generateAnalogous('#00FF00'); // Use green to avoid wrap-around
      const hsl0 = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result[0])));
      const hsl1 = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result[1])));
      const hsl2 = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result[2])));
      
      expect(Math.abs(hsl1.h - hsl0.h)).toBeCloseTo(30, 0);
      expect(Math.abs(hsl2.h - hsl1.h)).toBeCloseTo(30, 0);
    });
  });

  describe('generateComplementary', () => {
    it('should generate complementary color 180 degrees apart', () => {
      const base = '#FF0000';
      const result = colorUtil.generateComplementary(base);
      
      const baseHsl = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(base)));
      const resultHsl = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result)));
      
      const hueDiff = Math.abs(resultHsl.h - baseHsl.h);
      expect(hueDiff).toBeCloseTo(180, 0);
    });
  });

  describe('generateTriadic', () => {
    it('should generate 3 triadic colors', () => {
      const result = colorUtil.generateTriadic('#FF0000');
      expect(result).toHaveLength(3);
      expect(result[0]).toBe('#FF0000'); // First color is the base
    });

    it('should have colors 120 degrees apart', () => {
      const result = colorUtil.generateTriadic('#FF0000');
      const hsl0 = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result[0])));
      const hsl1 = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result[1])));
      const hsl2 = colorUtil.rgbToHsl(...Object.values(colorUtil.hexToRgb(result[2])));
      
      expect(Math.abs(hsl1.h - hsl0.h)).toBeCloseTo(120, 0);
      expect(Math.abs(hsl2.h - hsl0.h)).toBeCloseTo(240, 0);
    });
  });
});
