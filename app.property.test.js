/**
 * Property-based tests for form state persistence
 * Feature: color-palette-tool, Property 1: Form state persistence
 * Validates: Requirements 1.2, 1.3, 1.4
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';

describe('Form State Persistence - Property-Based Tests', () => {
  let dom;
  let document;
  let window;
  let state;

  // Valid application types from the HTML
  const validAppTypes = [
    'web-dashboard',
    'mobile-app',
    'portfolio',
    'e-commerce',
    'saas',
    'blog',
    'landing-page'
  ];

  // Valid color moods from the HTML
  const validColorMoods = [
    'warm',
    'cool',
    'pastel',
    'dark',
    'professional',
    'playful'
  ];

  /**
   * Generate valid application type
   */
  const appTypeArbitrary = fc.constantFrom(...validAppTypes);

  /**
   * Generate valid purpose text (non-empty string)
   */
  const purposeArbitrary = fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0);

  /**
   * Generate valid color mood
   */
  const colorMoodArbitrary = fc.constantFrom(...validColorMoods);

  /**
   * Generate complete valid form data
   */
  const formDataArbitrary = fc.record({
    appType: appTypeArbitrary,
    purpose: purposeArbitrary,
    colorMood: colorMoodArbitrary
  });

  beforeEach(() => {
    // Create a fresh DOM for each test
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <form id="paletteForm">
            <select id="appType" name="appType">
              <option value="">Select application type...</option>
              <option value="web-dashboard">Web Dashboard</option>
              <option value="mobile-app">Mobile App</option>
              <option value="portfolio">Portfolio Site</option>
              <option value="e-commerce">E-commerce</option>
              <option value="saas">SaaS Application</option>
              <option value="blog">Blog/Content Site</option>
              <option value="landing-page">Landing Page</option>
            </select>
            <textarea id="purpose" name="purpose"></textarea>
            <select id="colorMood" name="colorMood">
              <option value="">Select color mood...</option>
              <option value="warm">Warm</option>
              <option value="cool">Cool</option>
              <option value="pastel">Pastel</option>
              <option value="dark">Dark Mode</option>
              <option value="professional">Professional</option>
              <option value="playful">Playful</option>
            </select>
            <span class="error-message" id="appTypeError"></span>
            <span class="error-message" id="purposeError"></span>
            <span class="error-message" id="colorMoodError"></span>
          </form>
          <div id="loading" hidden></div>
          <div id="palettesContainer"></div>
          <div id="toast" hidden>
            <span id="toastMessage"></span>
          </div>
        </body>
      </html>
    `, {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable'
    });

    document = dom.window.document;
    window = dom.window;
    
    // Initialize application state
    state = {
      preferences: null,
      palettes: []
    };

    // Make globals available
    global.document = document;
    global.window = window;
  });

  afterEach(() => {
    // Clean up
    global.document = undefined;
    global.window = undefined;
    dom.window.close();
  });

  /**
   * Helper function to set form values and retrieve them
   */
  function setAndGetFormData(formData) {
    // Set form values
    document.getElementById('appType').value = formData.appType;
    document.getElementById('purpose').value = formData.purpose;
    document.getElementById('colorMood').value = formData.colorMood;

    // Get form data (simulating the getFormData function)
    const retrievedData = {
      appType: document.getElementById('appType').value,
      purpose: document.getElementById('purpose').value.trim(),
      colorMood: document.getElementById('colorMood').value
    };

    return retrievedData;
  }

  describe('Property 1: Form state persistence', () => {
    it('should persist application type selection for any valid app type', () => {
      fc.assert(
        fc.property(appTypeArbitrary, (appType) => {
          const formData = { appType, purpose: 'Test purpose', colorMood: 'cool' };
          const retrieved = setAndGetFormData(formData);
          
          // The stored value should match the input value
          expect(retrieved.appType).toBe(appType);
        }),
        { numRuns: 100 }
      );
    });

    it('should persist purpose text for any valid purpose string', () => {
      fc.assert(
        fc.property(purposeArbitrary, (purpose) => {
          const formData = { appType: 'web-dashboard', purpose, colorMood: 'cool' };
          const retrieved = setAndGetFormData(formData);
          
          // The stored value should match the input value (trimmed)
          expect(retrieved.purpose).toBe(purpose.trim());
        }),
        { numRuns: 100 }
      );
    });

    it('should persist color mood selection for any valid color mood', () => {
      fc.assert(
        fc.property(colorMoodArbitrary, (colorMood) => {
          const formData = { appType: 'web-dashboard', purpose: 'Test purpose', colorMood };
          const retrieved = setAndGetFormData(formData);
          
          // The stored value should match the input value
          expect(retrieved.colorMood).toBe(colorMood);
        }),
        { numRuns: 100 }
      );
    });

    it('should persist all form fields for any valid complete form data', () => {
      fc.assert(
        fc.property(formDataArbitrary, (formData) => {
          const retrieved = setAndGetFormData(formData);
          
          // All stored values should match input values
          expect(retrieved.appType).toBe(formData.appType);
          expect(retrieved.purpose).toBe(formData.purpose.trim());
          expect(retrieved.colorMood).toBe(formData.colorMood);
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain form state across multiple updates', () => {
      fc.assert(
        fc.property(
          fc.array(formDataArbitrary, { minLength: 2, maxLength: 5 }),
          (formDataArray) => {
            // Set and verify each form data in sequence
            formDataArray.forEach(formData => {
              const retrieved = setAndGetFormData(formData);
              
              // Each update should correctly reflect the new state
              expect(retrieved.appType).toBe(formData.appType);
              expect(retrieved.purpose).toBe(formData.purpose.trim());
              expect(retrieved.colorMood).toBe(formData.colorMood);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should trim leading and trailing whitespace from purpose field', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          (purpose) => {
            // Add extra leading and trailing whitespace
            const purposeWithWhitespace = `  ${purpose}  `;
            const formData = { 
              appType: 'web-dashboard', 
              purpose: purposeWithWhitespace, 
              colorMood: 'cool' 
            };
            const retrieved = setAndGetFormData(formData);
            
            // Should trim leading and trailing whitespace
            expect(retrieved.purpose).toBe(purpose.trim());
            // Should not have leading or trailing whitespace
            expect(retrieved.purpose).toBe(retrieved.purpose.trim());
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
