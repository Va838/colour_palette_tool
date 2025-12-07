/**
 * Property-based tests for Responsive Layout
 * Using fast-check for property-based testing
 */

import fc from 'fast-check';
import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Responsive Layout Property Tests', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // Load the HTML file
    const html = fs.readFileSync(path.resolve('./index.html'), 'utf-8');
    const css = fs.readFileSync(path.resolve('./styles.css'), 'utf-8');
    
    // Create a new JSDOM instance with the HTML
    dom = new JSDOM(html, {
      resources: 'usable',
      runScripts: 'dangerously'
    });
    
    document = dom.window.document;
    window = dom.window;
    
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  });

  // Feature: color-palette-tool, Property 20: Responsive layout behavior
  // Validates: Requirements 9.5
  it('should have media queries defined for mobile, tablet, and desktop viewports', () => {
    // Read the CSS file to verify media queries exist
    const css = fs.readFileSync(path.resolve('./styles.css'), 'utf-8');
    
    // Check for mobile media query (<768px)
    const mobileMediaQuery = /@media\s*\([^)]*max-width\s*:\s*767px[^)]*\)/i;
    expect(css).toMatch(mobileMediaQuery);
    
    // Check for tablet media query (>=768px)
    const tabletMediaQuery = /@media\s*\([^)]*min-width\s*:\s*768px[^)]*\)/i;
    expect(css).toMatch(tabletMediaQuery);
    
    // Check for desktop media query (>=1024px)
    const desktopMediaQuery = /@media\s*\([^)]*min-width\s*:\s*1024px[^)]*\)/i;
    expect(css).toMatch(desktopMediaQuery);
  });

  it('should ensure layout elements exist and are properly structured for responsive behavior', () => {
    // Define viewport width ranges
    const viewportWidthArb = fc.integer({ min: 320, max: 1920 });
    
    fc.assert(
      fc.property(viewportWidthArb, (width) => {
        // Set viewport width
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width
        });
        
        // Get key layout elements
        const container = document.querySelector('.container');
        const mainContent = document.querySelector('.main-content');
        const inputSection = document.querySelector('.input-section');
        const resultsSection = document.querySelector('.results-section');
        const header = document.querySelector('.header');
        const footer = document.querySelector('.footer');
        
        // All elements should exist
        expect(container).toBeTruthy();
        expect(mainContent).toBeTruthy();
        expect(inputSection).toBeTruthy();
        expect(resultsSection).toBeTruthy();
        expect(header).toBeTruthy();
        expect(footer).toBeTruthy();
        
        // Verify container has max-width set
        const containerStyle = window.getComputedStyle(container);
        expect(containerStyle.maxWidth).toBeTruthy();
        
        // Verify main content uses grid layout
        const mainContentStyle = window.getComputedStyle(mainContent);
        expect(mainContentStyle.display).toMatch(/grid|flex/);
      }),
      { numRuns: 100 }
    );
  });

  it('should ensure no content overflow at any viewport width', () => {
    const viewportWidthArb = fc.integer({ min: 320, max: 1920 });
    
    fc.assert(
      fc.property(viewportWidthArb, (width) => {
        // Set viewport width
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width
        });
        
        // Trigger resize event
        window.dispatchEvent(new window.Event('resize'));
        
        // Get all major content elements
        const elements = [
          document.querySelector('.container'),
          document.querySelector('.header'),
          document.querySelector('.main-content'),
          document.querySelector('.input-section'),
          document.querySelector('.results-section'),
          document.querySelector('.footer')
        ];
        
        // Check each element doesn't cause horizontal overflow
        elements.forEach(element => {
          if (element) {
            const rect = element.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(element);
            
            // Element width should not exceed viewport
            expect(rect.width).toBeLessThanOrEqual(width);
            
            // Check for overflow-x
            const overflowX = computedStyle.overflowX;
            // Should not have visible horizontal overflow
            if (overflowX === 'visible') {
              // If overflow is visible, content should fit
              expect(rect.width).toBeLessThanOrEqual(width);
            }
          }
        });
      }),
      { numRuns: 100 }
    );
  });

  it('should maintain proper spacing and padding at all viewport sizes', () => {
    const viewportWidthArb = fc.integer({ min: 320, max: 1920 });
    
    fc.assert(
      fc.property(viewportWidthArb, (width) => {
        // Set viewport width
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width
        });
        
        // Trigger resize event
        window.dispatchEvent(new window.Event('resize'));
        
        const container = document.querySelector('.container');
        const inputSection = document.querySelector('.input-section');
        
        if (container) {
          const containerStyle = window.getComputedStyle(container);
          const padding = containerStyle.padding;
          
          // Should have some padding
          expect(padding).toBeTruthy();
          expect(padding).not.toBe('0px');
        }
        
        if (inputSection) {
          const sectionStyle = window.getComputedStyle(inputSection);
          const padding = sectionStyle.padding;
          
          // Should have some padding
          expect(padding).toBeTruthy();
          expect(padding).not.toBe('0px');
        }
      }),
      { numRuns: 100 }
    );
  });
});
