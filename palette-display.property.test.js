/**
 * Property-based tests for PaletteDisplay component
 * Using fast-check for property-based testing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import PaletteDisplay from './palette-display.js';
import { JSDOM } from 'jsdom';

describe('PaletteDisplay Property-Based Tests', () => {
  let dom;
  let container;
  let display;

  beforeEach(() => {
    // Set up a fresh DOM for each test
    dom = new JSDOM('<!DOCTYPE html><div id="container"></div>');
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    
    container = dom.window.document.getElementById('container');
    display = new PaletteDisplay(container);
  });

  // Arbitrary for generating valid HEX colors
  const hexColorArb = fc.hexaString({ minLength: 6, maxLength: 6 }).map(hex => `#${hex}`);

  // Arbitrary for generating color objects
  const colorArb = fc.record({
    hex: hexColorArb,
    role: fc.constantFrom('primary', 'secondary', 'accent', 'background', 'surface', 'text'),
    usage: fc.string({ minLength: 10, maxLength: 100 })
  });

  // Arbitrary for generating palettes
  const paletteArb = fc.record({
    name: fc.string({ minLength: 5, maxLength: 50 }),
    vibe: fc.string({ minLength: 10, maxLength: 100 }),
    colors: fc.record({
      primary: colorArb,
      secondary: colorArb,
      accent: colorArb,
      background: colorArb,
      surface: colorArb,
      text: colorArb
    }),
    accessiblePairs: fc.array(
      fc.record({
        text: hexColorArb,
        background: hexColorArb,
        ratio: fc.double({ min: 4.5, max: 21, noNaN: true })
      }),
      { minLength: 1, maxLength: 5 }
    )
  });

  /**
   * Feature: color-palette-tool, Property 13: Color visual representation
   * Validates: Requirements 5.3
   * 
   * For any displayed color, the UI element should contain both a visual color 
   * preview and the HEX code text.
   */
  it('Property 13: Every displayed color contains both visual preview and HEX code', () => {
    fc.assert(
      fc.property(paletteArb, (palette) => {
        // Clear container before rendering
        display.clear();
        
        // Render the palette
        display.renderPalette(palette, 0);

        // Get all color items
        const colorItems = container.querySelectorAll('.color-item');
        
        // Should have 6 colors (primary, secondary, accent, background, surface, text)
        expect(colorItems.length).toBe(6);

        // Check each color item
        colorItems.forEach(colorItem => {
          // Should have a color swatch (visual preview)
          const swatch = colorItem.querySelector('.color-swatch');
          expect(swatch).toBeTruthy();
          expect(swatch.style.backgroundColor).toBeTruthy();

          // Should have a HEX code element
          const hexElement = colorItem.querySelector('.color-hex');
          expect(hexElement).toBeTruthy();
          
          // HEX code should be displayed as text
          const hexText = hexElement.textContent;
          expect(hexText).toMatch(/^#[0-9A-Fa-f]{6}$/);

          // The HEX code should also be in the data attribute
          const hexData = hexElement.getAttribute('data-hex');
          expect(hexData).toBe(hexText);
        });

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: color-palette-tool, Property 11: Accessibility information completeness
   * Validates: Requirements 4.2, 4.4
   * 
   * For any generated palette, the accessibility information should include contrast 
   * ratios and specify which colors are suitable for text on which backgrounds.
   */
  it('Property 11: Accessibility information includes contrast ratios and color specifications', () => {
    fc.assert(
      fc.property(paletteArb, (palette) => {
        // Clear container before rendering
        display.clear();
        
        // Render the palette
        display.renderPalette(palette, 0);

        // Get accessibility section
        const accessibilitySection = container.querySelector('.accessibility-section');
        expect(accessibilitySection).toBeTruthy();

        // Should have a heading
        const heading = accessibilitySection.querySelector('.section-heading');
        expect(heading).toBeTruthy();
        expect(heading.textContent).toContain('Accessibility');

        // Should have accessibility pairs list
        const pairsList = accessibilitySection.querySelector('.accessibility-pairs');
        expect(pairsList).toBeTruthy();

        // Get all pair items
        const pairItems = pairsList.querySelectorAll('.accessibility-pair');
        expect(pairItems.length).toBeGreaterThan(0);

        // Check each pair item
        pairItems.forEach(pairItem => {
          const description = pairItem.querySelector('.pair-description');
          expect(description).toBeTruthy();

          const descriptionText = description.textContent;

          // Should include contrast ratio
          expect(descriptionText).toMatch(/Contrast Ratio:\s*[\d.]+:1/);

          // Should specify text color (HEX code)
          expect(descriptionText).toMatch(/Text:\s*#[0-9A-Fa-f]{6}/);

          // Should specify background color (HEX code)
          expect(descriptionText).toMatch(/Background:\s*#[0-9A-Fa-f]{6}/);

          // Should have WCAG badge
          expect(descriptionText).toMatch(/WCAG (AA|AAA)/);
        });

        // Should have a note about suitable colors
        const note = accessibilitySection.querySelector('.accessibility-note');
        expect(note).toBeTruthy();
        expect(note.textContent).toContain('suitable');

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: color-palette-tool, Property 17: Implementation tips presence and content
   * Validates: Requirements 7.1, 7.2, 7.3
   * 
   * For any displayed palette, implementation tips should be present and include 
   * guidance about CSS variable usage and primary color application.
   */
  it('Property 17: Implementation tips include CSS variable guidance and primary color usage', () => {
    fc.assert(
      fc.property(paletteArb, (palette) => {
        // Clear container before rendering
        display.clear();
        
        // Render the palette
        display.renderPalette(palette, 0);

        // Get implementation section
        const implementationSection = container.querySelector('.implementation-section');
        expect(implementationSection).toBeTruthy();

        // Should have a heading
        const heading = implementationSection.querySelector('.section-heading');
        expect(heading).toBeTruthy();
        expect(heading.textContent).toContain('Implementation');

        // Should have tips list
        const tipsList = implementationSection.querySelector('.implementation-tips');
        expect(tipsList).toBeTruthy();

        // Get all tip items
        const tipItems = tipsList.querySelectorAll('li');
        expect(tipItems.length).toBeGreaterThan(0);

        // Convert tips to text for easier checking
        const tipsText = Array.from(tipItems).map(item => item.textContent).join(' ');

        // Should include CSS variable guidance (Requirement 7.2)
        expect(tipsText).toMatch(/CSS\s+(Variables?|custom properties)/i);
        expect(tipsText).toContain(':root');
        expect(tipsText).toContain('--color-');

        // Should include primary color usage guidance (Requirement 7.3)
        expect(tipsText).toMatch(/Primary\s+Color/i);
        expect(tipsText).toMatch(/(call-to-action|CTA|button|branding)/i);

        // Should reference actual colors from the palette
        expect(tipsText).toContain(palette.colors.primary.hex);

        return true;
      }),
      { numRuns: 100 }
    );
  });
});
