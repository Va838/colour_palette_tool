/**
 * Property-based tests for form element labeling
 * Feature: color-palette-tool, Property 18: Form element labeling
 * Validates: Requirements 9.2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Form Element Labeling - Property-Based Tests', () => {
  let dom;
  let document;

  beforeEach(() => {
    // Load the actual HTML file
    const htmlContent = readFileSync(join(__dirname, 'index.html'), 'utf-8');
    
    dom = new JSDOM(htmlContent, {
      url: 'http://localhost',
      runScripts: 'dangerously',
      resources: 'usable'
    });

    document = dom.window.document;
    global.document = document;
    global.window = dom.window;
  });

  afterEach(() => {
    global.document = undefined;
    global.window = undefined;
    dom.window.close();
  });

  /**
   * Get all form input elements (input, select, textarea)
   */
  function getAllFormInputElements() {
    const form = document.getElementById('paletteForm');
    if (!form) return [];

    const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
    return inputs.filter(input => {
      // Filter out submit buttons and other non-data inputs
      const type = input.type || input.tagName.toLowerCase();
      return type !== 'submit' && type !== 'button' && type !== 'reset';
    });
  }

  /**
   * Check if an element has an associated label
   */
  function hasAssociatedLabel(element) {
    const id = element.id;
    
    // Check for label with 'for' attribute
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label && label.textContent.trim().length > 0) {
        return true;
      }
    }

    // Check if element is wrapped in a label
    let parent = element.parentElement;
    while (parent) {
      if (parent.tagName === 'LABEL' && parent.textContent.trim().length > 0) {
        return true;
      }
      parent = parent.parentElement;
    }

    // Check for aria-label or aria-labelledby
    if (element.hasAttribute('aria-label') && element.getAttribute('aria-label').trim().length > 0) {
      return true;
    }

    if (element.hasAttribute('aria-labelledby')) {
      const labelId = element.getAttribute('aria-labelledby');
      const labelElement = document.getElementById(labelId);
      if (labelElement && labelElement.textContent.trim().length > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if an element has helpful placeholder text
   */
  function hasHelpfulPlaceholder(element) {
    // Not all elements support placeholders (e.g., select elements)
    const supportsPlaceholder = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA';
    
    if (!supportsPlaceholder) {
      // For elements that don't support placeholders (like select),
      // we consider them as having "helpful" placeholder if they have a default option
      if (element.tagName === 'SELECT') {
        const firstOption = element.querySelector('option:first-child');
        return firstOption && firstOption.textContent.trim().length > 0;
      }
      return true; // Other elements don't need placeholders
    }

    // For input and textarea, check if placeholder exists and is meaningful
    const placeholder = element.getAttribute('placeholder');
    return placeholder && placeholder.trim().length > 0;
  }

  describe('Property 18: Form element labeling', () => {
    it('should have an associated label for every form input element', () => {
      const formInputs = getAllFormInputElements();
      
      // Property: For any form input element, it should have an associated label
      expect(formInputs.length).toBeGreaterThan(0); // Ensure we have form inputs to test
      
      formInputs.forEach(input => {
        const hasLabel = hasAssociatedLabel(input);
        expect(hasLabel).toBe(true);
      });
    });

    it('should have helpful placeholder text or default option for every form input element', () => {
      const formInputs = getAllFormInputElements();
      
      // Property: For any form input element, it should have helpful placeholder text
      expect(formInputs.length).toBeGreaterThan(0); // Ensure we have form inputs to test
      
      formInputs.forEach(input => {
        const hasPlaceholder = hasHelpfulPlaceholder(input);
        expect(hasPlaceholder).toBe(true);
      });
    });

    it('should have both label and placeholder/default option for every form input element', () => {
      const formInputs = getAllFormInputElements();
      
      // Property: For any form input element, it should have BOTH label AND placeholder
      expect(formInputs.length).toBeGreaterThan(0); // Ensure we have form inputs to test
      
      formInputs.forEach(input => {
        const hasLabel = hasAssociatedLabel(input);
        const hasPlaceholder = hasHelpfulPlaceholder(input);
        
        expect(hasLabel).toBe(true);
        expect(hasPlaceholder).toBe(true);
      });
    });

    it('should have non-empty label text for every form input element', () => {
      const formInputs = getAllFormInputElements();
      
      expect(formInputs.length).toBeGreaterThan(0);
      
      formInputs.forEach(input => {
        const id = input.id;
        expect(id).toBeTruthy(); // Each input should have an ID for proper labeling
        
        const label = document.querySelector(`label[for="${id}"]`);
        expect(label).toBeTruthy(); // Label should exist
        expect(label.textContent.trim().length).toBeGreaterThan(0); // Label should have text
      });
    });

    it('should maintain label-input associations across form structure', () => {
      // This property verifies that the label-input relationship is properly maintained
      const formInputs = getAllFormInputElements();
      
      expect(formInputs.length).toBeGreaterThan(0);
      
      formInputs.forEach(input => {
        const id = input.id;
        const label = document.querySelector(`label[for="${id}"]`);
        
        // Verify the label points to the correct input
        expect(label).toBeTruthy();
        expect(label.getAttribute('for')).toBe(id);
        
        // Verify the input can be found by the label's 'for' attribute
        const linkedInput = document.getElementById(label.getAttribute('for'));
        expect(linkedInput).toBe(input);
      });
    });

    it('should have accessible form structure for screen readers', () => {
      // Property: Form should be accessible with proper ARIA and semantic HTML
      const form = document.getElementById('paletteForm');
      expect(form).toBeTruthy();
      
      const formInputs = getAllFormInputElements();
      expect(formInputs.length).toBeGreaterThan(0);
      
      formInputs.forEach(input => {
        // Each input should have either:
        // 1. An associated label element
        // 2. aria-label attribute
        // 3. aria-labelledby attribute
        const hasLabel = hasAssociatedLabel(input);
        expect(hasLabel).toBe(true);
        
        // Each input should have a name attribute for form submission
        expect(input.name || input.id).toBeTruthy();
      });
    });
  });
});
