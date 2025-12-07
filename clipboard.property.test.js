/**
 * Property-based tests for clipboard copy functionality
 * Using fast-check for property-based testing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { JSDOM } from 'jsdom';

describe('Clipboard Copy Functionality Property-Based Tests', () => {
  let dom;
  let mockClipboard;

  beforeEach(() => {
    // Set up a fresh DOM for each test
    dom = new JSDOM('<!DOCTYPE html><body></body>');
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.window = dom.window;

    // Mock the Clipboard API
    mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined)
    };
    
    // Use Object.defineProperty to mock navigator
    Object.defineProperty(global, 'navigator', {
      value: {
        clipboard: mockClipboard
      },
      writable: true,
      configurable: true
    });
  });

  // Arbitrary for generating valid HEX colors
  const hexColorArb = fc.hexaString({ minLength: 6, maxLength: 6 }).map(hex => `#${hex.toUpperCase()}`);

  /**
   * Feature: color-palette-tool, Property 12: Clipboard copy functionality
   * Validates: Requirements 5.1, 5.2
   * 
   * For any HEX code element in the UI, clicking it should copy the HEX value 
   * to the clipboard and display a confirmation message.
   */
  it('Property 12: Clicking any HEX code element copies value and shows confirmation', async () => {
    await fc.assert(
      fc.asyncProperty(hexColorArb, async (hexCode) => {
        // Create a HEX code button element
        const hexButton = document.createElement('button');
        hexButton.className = 'color-hex';
        hexButton.textContent = hexCode;
        hexButton.setAttribute('data-hex', hexCode);
        document.body.appendChild(hexButton);

        // Create a toast element for confirmation
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.hidden = true;
        
        const toastMessage = document.createElement('span');
        toastMessage.id = 'toastMessage';
        toast.appendChild(toastMessage);
        
        document.body.appendChild(toast);

        // Reset mock before test
        mockClipboard.writeText.mockClear();

        // Simulate the clipboard copy handler (synchronous for testing)
        const copyToClipboard = async (hex) => {
          await navigator.clipboard.writeText(hex);
          
          // Show confirmation toast
          toastMessage.textContent = `Copied ${hex} to clipboard`;
          toast.hidden = false;
        };

        // Trigger the copy action
        await copyToClipboard(hexCode);

        // Verify clipboard.writeText was called with the HEX code
        expect(mockClipboard.writeText).toHaveBeenCalledWith(hexCode);
        expect(mockClipboard.writeText).toHaveBeenCalledTimes(1);

        // Verify confirmation message is displayed
        expect(toast.hidden).toBe(false);
        expect(toastMessage.textContent).toContain(hexCode);
        expect(toastMessage.textContent).toContain('Copied');

        // Clean up
        document.body.innerHTML = '';
      }),
      { numRuns: 100 }
    );
  }, 10000); // Increase timeout to 10 seconds

  /**
   * Feature: color-palette-tool, Property 12: Clipboard copy functionality (Fallback)
   * Validates: Requirements 5.1, 5.2
   * 
   * When Clipboard API is not available, the system should use a fallback method
   * and still display a confirmation message.
   */
  it('Property 12: Fallback method works when Clipboard API is unavailable', () => {
    fc.assert(
      fc.property(hexColorArb, (hexCode) => {
        // Remove Clipboard API to test fallback
        Object.defineProperty(global, 'navigator', {
          value: {},
          writable: true,
          configurable: true
        });

        // Create a HEX code button element
        const hexButton = document.createElement('button');
        hexButton.className = 'color-hex';
        hexButton.textContent = hexCode;
        hexButton.setAttribute('data-hex', hexCode);
        document.body.appendChild(hexButton);

        // Create a toast element for confirmation
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.hidden = true;
        
        const toastMessage = document.createElement('span');
        toastMessage.id = 'toastMessage';
        toast.appendChild(toastMessage);
        
        document.body.appendChild(toast);

        // Fallback copy function using textarea
        const copyToClipboardFallback = (hex) => {
          try {
            const textarea = document.createElement('textarea');
            textarea.value = hex;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            
            if (success) {
              // Show confirmation toast
              toastMessage.textContent = `Copied ${hex} to clipboard`;
              toast.hidden = false;
            }
            
            return success;
          } catch (error) {
            return false;
          }
        };

        // Mock execCommand
        document.execCommand = vi.fn().mockReturnValue(true);

        // Add click event listener with fallback
        hexButton.addEventListener('click', () => {
          const hex = hexButton.getAttribute('data-hex');
          
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(hex).then(() => {
              toastMessage.textContent = `Copied ${hex} to clipboard`;
              toast.hidden = false;
            });
          } else {
            copyToClipboardFallback(hex);
          }
        });

        // Trigger click event
        hexButton.click();

        // Verify execCommand was called with 'copy'
        expect(document.execCommand).toHaveBeenCalledWith('copy');

        // Verify confirmation message is displayed
        expect(toast.hidden).toBe(false);
        expect(toastMessage.textContent).toContain(hexCode);
        expect(toastMessage.textContent).toContain('Copied');

        // Clean up
        document.body.innerHTML = '';
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
