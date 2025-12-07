/**
 * Property-based tests for PaletteGenerator
 * Using fast-check for property-based testing
 */

import fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import PaletteGenerator from './palette-generator.js';
import ColorUtility from './color-utility.js';

describe('PaletteGenerator Property Tests', () => {
  
  // Feature: color-palette-tool, Property 2: Palette generation count
  // Validates: Requirements 2.1
  it('should generate exactly 3 distinct palettes for any valid preferences', () => {
    const generator = new PaletteGenerator();
    
    const appTypeArb = fc.constantFrom(
      'web-dashboard', 'mobile-app', 'portfolio', 'e-commerce', 'saas', 'professional', 'playful'
    );
    
    const purposeArb = fc.string({ minLength: 1, maxLength: 200 });
    
    const colorMoodArb = fc.constantFrom('warm', 'cool', 'pastel', 'dark');
    
    const preferencesArb = fc.record({
      appType: appTypeArb,
      purpose: purposeArb,
      colorMood: colorMoodArb
    });
    
    fc.assert(
      fc.property(preferencesArb, (preferences) => {
        const palettes = generator.generate(preferences);
        
        // Should generate exactly 3 palettes
        expect(palettes).toHaveLength(3);
        
        // Palettes should be distinct (different names or colors)
        const paletteSignatures = palettes.map(p => 
          JSON.stringify({ name: p.name, primary: p.colors.primary.hex })
        );
        const uniqueSignatures = new Set(paletteSignatures);
        expect(uniqueSignatures.size).toBe(3);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: color-palette-tool, Property 3: Palette completeness
  // Validates: Requirements 2.2, 2.3, 2.4, 2.5
  it('should generate complete palettes with all required properties', () => {
    const generator = new PaletteGenerator();
    
    const appTypeArb = fc.constantFrom(
      'web-dashboard', 'mobile-app', 'portfolio', 'e-commerce', 'saas', 'professional', 'playful'
    );
    
    const purposeArb = fc.string({ minLength: 1, maxLength: 200 });
    
    const colorMoodArb = fc.constantFrom('warm', 'cool', 'pastel', 'dark');
    
    const preferencesArb = fc.record({
      appType: appTypeArb,
      purpose: purposeArb,
      colorMood: colorMoodArb
    });
    
    fc.assert(
      fc.property(preferencesArb, (preferences) => {
        const palettes = generator.generate(preferences);
        
        palettes.forEach(palette => {
          // Should have name and vibe description
          expect(palette.name).toBeDefined();
          expect(typeof palette.name).toBe('string');
          expect(palette.name.length).toBeGreaterThan(0);
          
          expect(palette.vibe).toBeDefined();
          expect(typeof palette.vibe).toBe('string');
          expect(palette.vibe.length).toBeGreaterThan(0);
          
          // Should have exactly 5 colors
          expect(palette.colors).toBeDefined();
          const colorRoles = Object.keys(palette.colors);
          expect(colorRoles).toHaveLength(6); // primary, secondary, accent, background, surface, text
          
          // Should have all required roles
          expect(colorRoles).toContain('primary');
          expect(colorRoles).toContain('secondary');
          expect(colorRoles).toContain('accent');
          expect(colorRoles).toContain('background');
          expect(colorRoles).toContain('surface');
          expect(colorRoles).toContain('text');
          
          // Each color should have hex, role, and usage
          Object.entries(palette.colors).forEach(([role, color]) => {
            expect(color.hex).toBeDefined();
            expect(typeof color.hex).toBe('string');
            expect(color.hex).toMatch(/^#[0-9A-F]{6}$/i);
            
            expect(color.role).toBeDefined();
            expect(typeof color.role).toBe('string');
            expect(color.role).toBe(role);
            
            expect(color.usage).toBeDefined();
            expect(typeof color.usage).toBe('string');
            expect(color.usage.length).toBeGreaterThan(0);
          });
        });
      }),
      { numRuns: 100 }
    );
  });

});

  // Feature: color-palette-tool, Property 4: Warm color mood compliance
  // Validates: Requirements 3.1
  it('should generate warm palettes with colors in warm spectrum', () => {
    const generator = new PaletteGenerator();
    const colorUtil = new ColorUtility();
    
    const appTypeArb = fc.constantFrom(
      'web-dashboard', 'mobile-app', 'portfolio', 'e-commerce', 'saas', 'professional', 'playful'
    );
    
    const purposeArb = fc.string({ minLength: 1, maxLength: 200 });
    
    const preferencesArb = fc.record({
      appType: appTypeArb,
      purpose: purposeArb,
      colorMood: fc.constant('warm')
    });
    
    fc.assert(
      fc.property(preferencesArb, (preferences) => {
        const palettes = generator.generate(preferences);
        
        palettes.forEach(palette => {
          // Check non-neutral colors (primary, secondary, accent)
          ['primary', 'secondary', 'accent'].forEach(role => {
            const color = palette.colors[role];
            const rgb = colorUtil.hexToRgb(color.hex);
            const hsl = colorUtil.rgbToHsl(rgb.r, rgb.g, rgb.b);
            
            // Warm colors: reds (0-30°), oranges (30-60°), yellows (60-90°), or warm range (330-360°)
            // Allow some tolerance for neutrals (low saturation)
            if (hsl.s > 10) { // Only check colors with some saturation
              const isWarm = (hsl.h >= 0 && hsl.h <= 90) || (hsl.h >= 330 && hsl.h <= 360);
              expect(isWarm).toBe(true);
            }
          });
        });
      }),
      { numRuns: 100 }
    );
  });

  // Feature: color-palette-tool, Property 5: Cool color mood compliance
  // Validates: Requirements 3.2
  it('should generate cool palettes with colors in cool spectrum', () => {
    const generator = new PaletteGenerator();
    const colorUtil = new ColorUtility();
    
    const appTypeArb = fc.constantFrom(
      'web-dashboard', 'mobile-app', 'portfolio', 'e-commerce', 'saas', 'professional', 'playful'
    );
    
    const purposeArb = fc.string({ minLength: 1, maxLength: 200 });
    
    const preferencesArb = fc.record({
      appType: appTypeArb,
      purpose: purposeArb,
      colorMood: fc.constant('cool')
    });
    
    fc.assert(
      fc.property(preferencesArb, (preferences) => {
        const palettes = generator.generate(preferences);
        
        palettes.forEach(palette => {
          // Check non-neutral colors (primary, secondary, accent)
          ['primary', 'secondary', 'accent'].forEach(role => {
            const color = palette.colors[role];
            const rgb = colorUtil.hexToRgb(color.hex);
            const hsl = colorUtil.rgbToHsl(rgb.r, rgb.g, rgb.b);
            
            // Cool colors: blues, teals, purples (150-330°)
            // Allow some tolerance for neutrals (low saturation)
            if (hsl.s > 10) { // Only check colors with some saturation
              const isCool = hsl.h >= 150 && hsl.h <= 330;
              expect(isCool).toBe(true);
            }
          });
        });
      }),
      { numRuns: 100 }
    );
  });

  // Feature: color-palette-tool, Property 6: Pastel color characteristics
  // Validates: Requirements 3.3
  it('should generate pastel palettes with low saturation and high lightness', () => {
    const generator = new PaletteGenerator();
    const colorUtil = new ColorUtility();
    
    const appTypeArb = fc.constantFrom(
      'web-dashboard', 'mobile-app', 'portfolio', 'e-commerce', 'saas', 'professional', 'playful'
    );
    
    const purposeArb = fc.string({ minLength: 1, maxLength: 200 });
    
    const preferencesArb = fc.record({
      appType: appTypeArb,
      purpose: purposeArb,
      colorMood: fc.constant('pastel')
    });
    
    fc.assert(
      fc.property(preferencesArb, (preferences) => {
        const palettes = generator.generate(preferences);
        
        palettes.forEach(palette => {
          // Check all colors except text (which needs to be dark for contrast)
          ['primary', 'secondary', 'accent', 'background', 'surface'].forEach(role => {
            const color = palette.colors[role];
            const rgb = colorUtil.hexToRgb(color.hex);
            const hsl = colorUtil.rgbToHsl(rgb.r, rgb.g, rgb.b);
            
            // Pastel: saturation < 50%, lightness > 70%
            expect(hsl.s).toBeLessThan(50);
            expect(hsl.l).toBeGreaterThan(70);
          });
        });
      }),
      { numRuns: 100 }
    );
  });

  // Feature: color-palette-tool, Property 7: Dark mode color characteristics
  // Validates: Requirements 3.4
  it('should generate dark mode palettes with dark backgrounds and bright accents', () => {
    const generator = new PaletteGenerator();
    const colorUtil = new ColorUtility();
    
    const appTypeArb = fc.constantFrom(
      'web-dashboard', 'mobile-app', 'portfolio', 'e-commerce', 'saas', 'professional', 'playful'
    );
    
    const purposeArb = fc.string({ minLength: 1, maxLength: 200 });
    
    const preferencesArb = fc.record({
      appType: appTypeArb,
      purpose: purposeArb,
      colorMood: fc.constant('dark')
    });
    
    fc.assert(
      fc.property(preferencesArb, (preferences) => {
        const palettes = generator.generate(preferences);
        
        palettes.forEach(palette => {
          // Check background and surface colors (should be dark: lightness < 20%)
          ['background', 'surface'].forEach(role => {
            const color = palette.colors[role];
            const rgb = colorUtil.hexToRgb(color.hex);
            const hsl = colorUtil.rgbToHsl(rgb.r, rgb.g, rgb.b);
            
            expect(hsl.l).toBeLessThan(20);
          });
          
          // Check accent colors (should be bright: lightness > 50%)
          ['primary', 'secondary', 'accent'].forEach(role => {
            const color = palette.colors[role];
            const rgb = colorUtil.hexToRgb(color.hex);
            const hsl = colorUtil.rgbToHsl(rgb.r, rgb.g, rgb.b);
            
            expect(hsl.l).toBeGreaterThan(50);
          });
        });
      }),
      { numRuns: 100 }
    );
  });

  // Feature: color-palette-tool, Property 8: Professional palette characteristics
  // Validates: Requirements 3.5
  it('should generate professional palettes with muted colors', () => {
    const generator = new PaletteGenerator();
    const colorUtil = new ColorUtility();
    
    const purposeArb = fc.string({ minLength: 1, maxLength: 200 });
    
    const preferencesArb = fc.record({
      appType: fc.constant('professional'),
      purpose: purposeArb,
      colorMood: fc.constantFrom('warm', 'cool', 'pastel', 'dark')
    });
    
    fc.assert(
      fc.property(preferencesArb, (preferences) => {
        const palettes = generator.generate(preferences);
        
        palettes.forEach(palette => {
          // Check primary, secondary, accent colors
          let colorCount = 0;
          let mutedCount = 0;
          
          ['primary', 'secondary', 'accent'].forEach(role => {
            const color = palette.colors[role];
            const rgb = colorUtil.hexToRgb(color.hex);
            const hsl = colorUtil.rgbToHsl(rgb.r, rgb.g, rgb.b);
            
            colorCount++;
            // Professional: saturation < 60%
            if (hsl.s < 60) {
              mutedCount++;
            }
          });
          
          // Majority of colors should be muted (at least 2 out of 3)
          expect(mutedCount).toBeGreaterThanOrEqual(2);
        });
      }),
      { numRuns: 100 }
    );
  });

  // Feature: color-palette-tool, Property 9: Playful palette characteristics
  // Validates: Requirements 3.6
  it('should generate playful palettes with bright saturated accents', () => {
    const generator = new PaletteGenerator();
    const colorUtil = new ColorUtility();
    
    const purposeArb = fc.string({ minLength: 1, maxLength: 200 });
    
    const preferencesArb = fc.record({
      appType: fc.constant('playful'),
      purpose: purposeArb,
      colorMood: fc.constantFrom('warm', 'cool', 'dark') // Exclude pastel as it conflicts
    });
    
    fc.assert(
      fc.property(preferencesArb, (preferences) => {
        const palettes = generator.generate(preferences);
        
        palettes.forEach(palette => {
          // Check accent color specifically
          const accent = palette.colors.accent;
          const rgb = colorUtil.hexToRgb(accent.hex);
          const hsl = colorUtil.rgbToHsl(rgb.r, rgb.g, rgb.b);
          
          // Playful: accent should have saturation > 60% and brightness > 50%
          expect(hsl.s).toBeGreaterThan(60);
          expect(hsl.l).toBeGreaterThan(50);
        });
      }),
      { numRuns: 100 }
    );
  });
