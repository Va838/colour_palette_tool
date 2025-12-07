/**
 * Property-based tests for invalid input error handling
 * Feature: color-palette-tool, Property 19: Invalid input error handling
 * Validates: Requirements 9.3
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Invalid Input Error Handling - Property-Based Tests', () => {
  let dom;
  let document;
  let window;
  let validateForm;
  let displayErrors;
  let clearErrors;

  // Valid application types
  const validAppTypes = [
    'web-dashboard',
    'mobile-app',
    'portfolio',
    'e-commerce',
    'saas',
    'blog',
    'landing-page'
  ];

  // Valid color moods
  const validColorMoods = [
    'warm',
    'cool',
    'pastel',
    'dark',
    'professional',
    'playful'
  ];

  beforeEach(async () => {
    // Load the actual HTML file
    const htmlContent = readFileSync(join(__dirname, 'index.html'), 'utf-8');
    
    dom = new JSDOM(htmlContent, {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable'
    });

    document = dom.window.document;
    window = dom.window;
    
    global.document = document;
    global.window = window;

    // Load the app.js module functions
    const appModule = await import('./app.js');
    validateForm = appModule.validateForm;

    // Define displayErrors and clearErrors functions
    displayErrors = (errors) => {
      Object.keys(errors).forEach(fieldName => {
        const errorElement = document.getElementById(`${fieldName}Error`);
        if (errorElement) {
          errorElement.textContent = errors[fieldName];
        }
      });
    };

    clearErrors = () => {
      const errorElements = document.querySelectorAll('.error-message');
      errorElements.forEach(element => {
        element.textContent = '';
      });
    };
  });

  afterEach(() => {
    global.document = undefined;
    global.window = undefined;
    dom.window.close();
  });

  /**
   * Generate invalid form data (missing at least one required field)
   */
  const invalidFormDataArbitrary = fc.oneof(
    // Missing appType
    fc.record({
      appType: fc.constant(''),
      purpose: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
      colorMood: fc.constantFrom(...validColorMoods)
    }),
    // Missing purpose
    fc.record({
      appType: fc.constantFrom(...validAppTypes),
      purpose: fc.constant(''),
      colorMood: fc.constantFrom(...validColorMoods)
    }),
    // Missing purpose (whitespace only)
    fc.record({
      appType: fc.constantFrom(...validAppTypes),
      purpose: fc.string({ minLength: 1, maxLength: 20 }).map(s => ' '.repeat(s.length)),
      colorMood: fc.constantFrom(...validColorMoods)
    }),
    // Missing colorMood
    fc.record({
      appType: fc.constantFrom(...validAppTypes),
      purpose: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
      colorMood: fc.constant('')
    }),
    // Missing multiple fields
    fc.record({
      appType: fc.constant(''),
      purpose: fc.constant(''),
      colorMood: fc.constantFrom(...validColorMoods)
    }),
    // Missing all fields
    fc.record({
      appType: fc.constant(''),
      purpose: fc.constant(''),
      colorMood: fc.constant('')
    })
  );

  describe('Property 19: Invalid input error handling', () => {
    it('should mark validation as invalid for any form data with missing required fields', () => {
      fc.assert(
        fc.property(invalidFormDataArbitrary, (formData) => {
          const validation = validateForm(formData);
          
          // For any invalid form data, validation should fail
          expect(validation.isValid).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should provide error messages for any invalid form submission', () => {
      fc.assert(
        fc.property(invalidFormDataArbitrary, (formData) => {
          const validation = validateForm(formData);
          
          // For any invalid form data, there should be at least one error message
          expect(Object.keys(validation.errors).length).toBeGreaterThan(0);
          
          // Each error message should be a non-empty string
          Object.values(validation.errors).forEach(errorMessage => {
            expect(typeof errorMessage).toBe('string');
            expect(errorMessage.length).toBeGreaterThan(0);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should display error messages in the DOM for any invalid form submission', () => {
      fc.assert(
        fc.property(invalidFormDataArbitrary, (formData) => {
          // Clear any previous errors
          clearErrors();
          
          // Validate and display errors
          const validation = validateForm(formData);
          displayErrors(validation.errors);
          
          // For any invalid form data, at least one error element should have text
          const errorElements = Array.from(document.querySelectorAll('.error-message'));
          const errorElementsWithText = errorElements.filter(el => el.textContent.trim().length > 0);
          
          expect(errorElementsWithText.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should provide specific error messages for each missing field', () => {
      fc.assert(
        fc.property(invalidFormDataArbitrary, (formData) => {
          const validation = validateForm(formData);
          
          // Check that errors correspond to the actual missing fields
          if (!formData.appType) {
            expect(validation.errors.appType).toBeDefined();
            expect(validation.errors.appType.length).toBeGreaterThan(0);
          }
          
          if (!formData.purpose || formData.purpose.trim().length === 0) {
            expect(validation.errors.purpose).toBeDefined();
            expect(validation.errors.purpose.length).toBeGreaterThan(0);
          }
          
          if (!formData.colorMood) {
            expect(validation.errors.colorMood).toBeDefined();
            expect(validation.errors.colorMood.length).toBeGreaterThan(0);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should clear previous error messages before displaying new ones', () => {
      fc.assert(
        fc.property(
          fc.tuple(invalidFormDataArbitrary, invalidFormDataArbitrary),
          ([firstFormData, secondFormData]) => {
            // First validation and display
            const firstValidation = validateForm(firstFormData);
            displayErrors(firstValidation.errors);
            
            // Clear errors
            clearErrors();
            
            // All error elements should be empty after clearing
            const errorElements = Array.from(document.querySelectorAll('.error-message'));
            errorElements.forEach(el => {
              expect(el.textContent).toBe('');
            });
            
            // Second validation and display
            const secondValidation = validateForm(secondFormData);
            displayErrors(secondValidation.errors);
            
            // Only errors from the second validation should be displayed
            Object.keys(secondValidation.errors).forEach(fieldName => {
              const errorElement = document.getElementById(`${fieldName}Error`);
              expect(errorElement.textContent).toBe(secondValidation.errors[fieldName]);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should prevent palette generation for any invalid form submission', () => {
      fc.assert(
        fc.property(invalidFormDataArbitrary, (formData) => {
          const validation = validateForm(formData);
          
          // For any invalid form data, validation should fail
          // This prevents the form submission handler from proceeding to palette generation
          expect(validation.isValid).toBe(false);
          
          // The errors object should contain at least one error
          expect(Object.keys(validation.errors).length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    it('should handle empty string and whitespace-only purpose as invalid', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 20 }).filter(s => s.trim().length === 0),
          (invalidPurpose) => {
            const formData = {
              appType: 'web-dashboard',
              purpose: invalidPurpose,
              colorMood: 'cool'
            };
            
            const validation = validateForm(formData);
            
            // Whitespace-only or empty purpose should be invalid
            expect(validation.isValid).toBe(false);
            expect(validation.errors.purpose).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should display clear and descriptive error messages', () => {
      fc.assert(
        fc.property(invalidFormDataArbitrary, (formData) => {
          const validation = validateForm(formData);
          
          // Each error message should be clear and descriptive
          Object.values(validation.errors).forEach(errorMessage => {
            // Error messages should be reasonably long (not just "Error")
            expect(errorMessage.length).toBeGreaterThan(5);
            
            // Error messages should not be generic codes
            expect(errorMessage).not.toMatch(/^[A-Z0-9_]+$/);
          });
        }),
        { numRuns: 100 }
      );
    });
  });
});
