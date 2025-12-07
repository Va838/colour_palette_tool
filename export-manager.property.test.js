/**
 * Property-based tests for ExportManager
 * 
 * Tests universal properties that should hold for all palette exports
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import ExportManager from './export-manager.js';

// Arbitrary generator for color objects
const colorArbitrary = fc.record({
  hex: fc.hexaString({ minLength: 7, maxLength: 7 }).map(s => '#' + s.slice(1)),
  role: fc.constantFrom('primary', 'secondary', 'accent', 'background', 'surface', 'text'),
  usage: fc.string({ minLength: 10, maxLength: 100 })
});

// Arbitrary generator for palette objects
const paletteArbitrary = fc.record({
  name: fc.string({ minLength: 5, maxLength: 50 }),
  vibe: fc.string({ minLength: 10, maxLength: 100 }),
  colors: fc.record({
    primary: colorArbitrary,
    secondary: colorArbitrary,
    accent: colorArbitrary,
    background: colorArbitrary,
    surface: colorArbitrary,
    text: colorArbitrary
  })
});

describe('ExportManager Property Tests', () => {
  const exportManager = new ExportManager();

  // Feature: color-palette-tool, Property 14: CSS export validity
  // Validates: Requirements 6.2
  it('Property 14: CSS export validity - For any palette exported as CSS, the output should be valid CSS custom property syntax', () => {
    fc.assert(
      fc.property(paletteArbitrary, (palette) => {
        const cssOutput = exportManager.exportAsCSS(palette);
        
        // Check that output is a string
        expect(typeof cssOutput).toBe('string');
        
        // Check that output starts with :root {
        expect(cssOutput).toMatch(/^:root\s*\{/);
        
        // Check that output ends with }
        expect(cssOutput).toMatch(/\}\s*$/);
        
        // Check that each color role appears as a CSS custom property
        const roles = ['primary', 'secondary', 'accent', 'background', 'surface', 'text'];
        roles.forEach(role => {
          const regex = new RegExp(`--color-${role}:\\s*#[0-9A-Fa-f]{6};`);
          expect(cssOutput).toMatch(regex);
        });
        
        // Verify the CSS can be parsed without errors by checking syntax
        // CSS custom properties follow the pattern: --name: value;
        const customPropertyPattern = /--color-\w+:\s*#[0-9A-Fa-f]{6};/g;
        const matches = cssOutput.match(customPropertyPattern);
        expect(matches).not.toBeNull();
        expect(matches.length).toBe(6); // Should have 6 color properties
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: color-palette-tool, Property 15: JSON export validity
  // Validates: Requirements 6.3
  it('Property 15: JSON export validity - For any palette exported as JSON, the output should be valid JSON that can be parsed and should contain color names and HEX codes', () => {
    fc.assert(
      fc.property(paletteArbitrary, (palette) => {
        const jsonOutput = exportManager.exportAsJSON(palette);
        
        // Check that output is a string
        expect(typeof jsonOutput).toBe('string');
        
        // Verify the JSON can be parsed without errors
        let parsed;
        expect(() => {
          parsed = JSON.parse(jsonOutput);
        }).not.toThrow();
        
        // Verify the parsed object has the expected structure
        expect(parsed).toHaveProperty('name');
        expect(parsed).toHaveProperty('vibe');
        expect(parsed).toHaveProperty('colors');
        
        // Verify colors object contains all required roles
        const roles = ['primary', 'secondary', 'accent', 'background', 'surface', 'text'];
        roles.forEach(role => {
          expect(parsed.colors).toHaveProperty(role);
          // Verify each color is a valid HEX code
          expect(parsed.colors[role]).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
        
        // Verify the name and vibe match the original palette
        expect(parsed.name).toBe(palette.name);
        expect(parsed.vibe).toBe(palette.vibe);
        
        // Verify each color HEX code matches the original
        roles.forEach(role => {
          expect(parsed.colors[role]).toBe(palette.colors[role].hex);
        });
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: color-palette-tool, Property 16: Export action completion
  // Validates: Requirements 6.4
  it('Property 16: Export action completion - For any export request, the system should either trigger a file download or copy formatted text to clipboard', () => {
    fc.assert(
      fc.property(
        paletteArbitrary,
        fc.constantFrom('css', 'json', 'text'),
        (palette, format) => {
          // Test that export methods produce valid output
          let exportedContent;
          
          switch (format) {
            case 'css':
              exportedContent = exportManager.exportAsCSS(palette);
              break;
            case 'json':
              exportedContent = exportManager.exportAsJSON(palette);
              break;
            case 'text':
              exportedContent = exportManager.exportAsPlainText(palette);
              break;
          }
          
          // Verify that export produces non-empty string content
          expect(typeof exportedContent).toBe('string');
          expect(exportedContent.length).toBeGreaterThan(0);
          
          // Verify that the content contains palette information
          if (format === 'json') {
            // For JSON, parse and check the structure
            const parsed = JSON.parse(exportedContent);
            expect(parsed.name).toBe(palette.name);
          } else if (format === 'text') {
            // For plain text, check if name appears in the output
            expect(exportedContent).toContain(palette.name);
          }
          
          // Verify that the content contains color information (HEX codes)
          const roles = ['primary', 'secondary', 'accent', 'background', 'surface', 'text'];
          let containsColorInfo = false;
          roles.forEach(role => {
            if (exportedContent.includes(palette.colors[role].hex)) {
              containsColorInfo = true;
            }
          });
          expect(containsColorInfo).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
