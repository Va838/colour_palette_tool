/**
 * ColorUtility - Color conversion and manipulation utilities
 * 
 * Provides functions for converting between color spaces (HEX, RGB, HSL)
 * and adjusting color properties (hue, saturation, lightness).
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

class ColorUtility {
  /**
   * Convert HEX color to RGB
   * @param {string} hex - HEX color code (e.g., "#FF5733" or "FF5733")
   * @returns {{r: number, g: number, b: number}} RGB object with values 0-255
   */
  hexToRgb(hex) {
    // Remove # if present
    const cleanHex = hex.replace(/^#/, '');
    
    // Parse hex values
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    return { r, g, b };
  }

  /**
   * Convert RGB to HEX color
   * @param {number} r - Red value (0-255)
   * @param {number} g - Green value (0-255)
   * @param {number} b - Blue value (0-255)
   * @returns {string} HEX color code with # prefix
   */
  rgbToHex(r, g, b) {
    const toHex = (value) => {
      const hex = Math.round(value).toString(16).padStart(2, '0');
      return hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  /**
   * Convert RGB to HSL
   * @param {number} r - Red value (0-255)
   * @param {number} g - Green value (0-255)
   * @param {number} b - Blue value (0-255)
   * @returns {{h: number, s: number, l: number}} HSL object (h: 0-360, s: 0-100, l: 0-100)
   */
  rgbToHsl(r, g, b) {
    // Normalize RGB values to 0-1
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (delta !== 0) {
      // Calculate saturation
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

      // Calculate hue
      switch (max) {
        case r:
          h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / delta + 2) / 6;
          break;
        case b:
          h = ((r - g) / delta + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Convert HSL to RGB
   * @param {number} h - Hue (0-360)
   * @param {number} s - Saturation (0-100)
   * @param {number} l - Lightness (0-100)
   * @returns {{r: number, g: number, b: number}} RGB object with values 0-255
   */
  hslToRgb(h, s, l) {
    // Normalize values
    h = h / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
      // Achromatic (grey)
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  /**
   * Adjust the hue of a color
   * @param {string} hex - HEX color code
   * @param {number} degrees - Degrees to adjust hue (-360 to 360)
   * @returns {string} New HEX color code
   */
  adjustHue(hex, degrees) {
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Adjust hue and wrap around 360
    hsl.h = (hsl.h + degrees) % 360;
    if (hsl.h < 0) hsl.h += 360;
    
    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  /**
   * Adjust the saturation of a color
   * @param {string} hex - HEX color code
   * @param {number} amount - Amount to adjust saturation (-100 to 100)
   * @returns {string} New HEX color code
   */
  adjustSaturation(hex, amount) {
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Adjust saturation and clamp to 0-100
    hsl.s = Math.max(0, Math.min(100, hsl.s + amount));
    
    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  /**
   * Adjust the lightness of a color
   * @param {string} hex - HEX color code
   * @param {number} amount - Amount to adjust lightness (-100 to 100)
   * @returns {string} New HEX color code
   */
  adjustLightness(hex, amount) {
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Adjust lightness and clamp to 0-100
    hsl.l = Math.max(0, Math.min(100, hsl.l + amount));
    
    const newRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  /**
   * Generate analogous colors (colors adjacent on the color wheel)
   * @param {string} baseHex - Base HEX color code
   * @returns {string[]} Array of 3 analogous colors including the base
   */
  generateAnalogous(baseHex) {
    return [
      this.adjustHue(baseHex, -30),
      baseHex,
      this.adjustHue(baseHex, 30)
    ];
  }

  /**
   * Generate complementary color (opposite on the color wheel)
   * @param {string} baseHex - Base HEX color code
   * @returns {string} Complementary HEX color code
   */
  generateComplementary(baseHex) {
    return this.adjustHue(baseHex, 180);
  }

  /**
   * Generate triadic colors (evenly spaced on the color wheel)
   * @param {string} baseHex - Base HEX color code
   * @returns {string[]} Array of 3 triadic colors including the base
   */
  generateTriadic(baseHex) {
    return [
      baseHex,
      this.adjustHue(baseHex, 120),
      this.adjustHue(baseHex, 240)
    ];
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ColorUtility;
}

export default ColorUtility;
