/**
 * AccessibilityChecker - WCAG contrast ratio calculations and validation
 * 
 * Provides functions for calculating contrast ratios between colors,
 * validating WCAG compliance, and finding accessible text-background pairs.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

class AccessibilityChecker {
  /**
   * Calculate relative luminance of a color
   * Based on WCAG 2.1 formula: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
   * @param {string} hex - HEX color code
   * @returns {number} Relative luminance (0-1)
   */
  getRelativeLuminance(hex) {
    // Convert hex to RGB
    const cleanHex = hex.replace(/^#/, '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    // Apply gamma correction
    const linearize = (channel) => {
      return channel <= 0.03928
        ? channel / 12.92
        : Math.pow((channel + 0.055) / 1.055, 2.4);
    };

    const rLinear = linearize(r);
    const gLinear = linearize(g);
    const bLinear = linearize(b);

    // Calculate relative luminance using WCAG formula
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  /**
   * Calculate contrast ratio between two colors
   * Based on WCAG 2.1 formula: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
   * @param {string} color1Hex - First HEX color code
   * @param {string} color2Hex - Second HEX color code
   * @returns {number} Contrast ratio (1-21)
   */
  calculateContrastRatio(color1Hex, color2Hex) {
    const l1 = this.getRelativeLuminance(color1Hex);
    const l2 = this.getRelativeLuminance(color2Hex);

    // Ensure L1 is the lighter color
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    // Calculate contrast ratio
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if contrast ratio meets WCAG AA standard
   * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
   * @param {number} contrastRatio - Contrast ratio to check
   * @returns {boolean} True if meets WCAG AA
   */
  meetsWCAG_AA(contrastRatio) {
    return contrastRatio >= 4.5;
  }

  /**
   * Check if contrast ratio meets WCAG AAA standard
   * WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
   * @param {number} contrastRatio - Contrast ratio to check
   * @returns {boolean} True if meets WCAG AAA
   */
  meetsWCAG_AAA(contrastRatio) {
    return contrastRatio >= 7;
  }

  /**
   * Find accessible text-background color pairs in a palette
   * @param {Object} palette - Palette object with colors property
   * @returns {Array<{text: string, background: string, ratio: number}>} Array of accessible pairs
   */
  findAccessiblePairs(palette) {
    const accessiblePairs = [];
    const colors = palette.colors;

    // Get all color values from the palette
    const colorEntries = Object.entries(colors);

    // Test all combinations of colors
    for (let i = 0; i < colorEntries.length; i++) {
      for (let j = 0; j < colorEntries.length; j++) {
        if (i === j) continue; // Skip same color

        const [textRole, textColor] = colorEntries[i];
        const [bgRole, bgColor] = colorEntries[j];

        // Get hex value (handle both string and object formats)
        const textHex = typeof textColor === 'string' ? textColor : textColor.hex;
        const bgHex = typeof bgColor === 'string' ? bgColor : bgColor.hex;

        const ratio = this.calculateContrastRatio(textHex, bgHex);

        // Only include pairs that meet WCAG AA standard
        if (this.meetsWCAG_AA(ratio)) {
          accessiblePairs.push({
            text: textHex,
            background: bgHex,
            ratio: Math.round(ratio * 100) / 100 // Round to 2 decimal places
          });
        }
      }
    }

    return accessiblePairs;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibilityChecker;
}

export default AccessibilityChecker;
