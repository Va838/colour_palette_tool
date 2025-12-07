/**
 * PaletteGenerator - Generate color palettes based on user preferences
 * 
 * Creates 3 distinct color palettes using color theory principles,
 * applying mood transformations and ensuring accessibility.
 * 
 * Requirements: 2.1, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

// Import dependencies for ES6 modules
import ColorUtility from './color-utility.js';
import AccessibilityChecker from './accessibility-checker.js';

class PaletteGenerator {
  constructor() {
    this.colorUtility = new ColorUtility();
    this.accessibilityChecker = new AccessibilityChecker();
  }

  /**
   * Generate 3 distinct palettes based on user preferences
   * @param {Object} preferences - User preferences {appType, purpose, colorMood}
   * @returns {Array<Object>} Array of 3 palette objects
   */
  generate(preferences) {
    const palettes = [];
    const { appType, purpose, colorMood } = preferences;

    // Generate base hue from application type and purpose
    const baseHue = this._generateBaseHue(appType, purpose);

    // Generate 3 distinct palettes with different approaches
    const seeds = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];

    for (let i = 0; i < 3; i++) {
      let palette;
      
      // Apply mood-specific generation
      if (colorMood === 'warm') {
        palette = this.generateWarmPalette(seeds[i]);
      } else if (colorMood === 'cool') {
        palette = this.generateCoolPalette(seeds[i]);
      } else if (colorMood === 'pastel') {
        palette = this.generatePastelPalette(seeds[i]);
      } else if (colorMood === 'dark') {
        palette = this.generateDarkModePalette(seeds[i]);
      } else {
        palette = this.generateCoolPalette(seeds[i]); // Default to cool
      }

      // Apply application type adjustments
      if (appType === 'professional' || appType === 'web-dashboard' || appType === 'saas') {
        palette = this._applyProfessionalAdjustments(palette);
      } else if (appType === 'playful' || appType === 'mobile-app') {
        palette = this._applyPlayfulAdjustments(palette);
      }

      // Generate palette name
      palette.name = this._generatePaletteName(colorMood, appType, i);
      palette.vibe = this._generateVibeDescription(colorMood, appType);

      // Find accessible pairs
      palette.accessiblePairs = this.accessibilityChecker.findAccessiblePairs(palette);

      palettes.push(palette);
    }

    return palettes;
  }

  /**
   * Generate a warm color palette
   * @param {number} seedHue - Base hue value (0-360)
   * @returns {Object} Palette object
   */
  generateWarmPalette(seedHue) {
    // Adjust seed to warm spectrum (reds, oranges, yellows: 0-60 or 330-360)
    let warmHue = seedHue;
    if (seedHue > 90 && seedHue < 330) {
      // Map to warm range (0-60)
      warmHue = seedHue % 60;
    }
    // Ensure warmHue is in 0-60 range
    if (warmHue > 60 && warmHue < 330) {
      warmHue = warmHue % 60;
    }

    const primary = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(warmHue, 70, 55))
    );
    
    // Keep secondary in warm range (0-60)
    const secondaryHue = (warmHue + 20) % 60;
    const secondary = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(secondaryHue, 65, 60))
    );
    
    // Keep accent in warm range (0-60)
    const accentHue = (warmHue + 40) % 60;
    const accent = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(accentHue, 80, 50))
    );
    
    const background = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(warmHue, 20, 95))
    );
    
    const surface = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(warmHue, 15, 98))
    );
    
    const text = '#1A1A1A';

    return {
      colors: {
        primary: { hex: primary, role: 'primary', usage: 'Use for main buttons and CTAs' },
        secondary: { hex: secondary, role: 'secondary', usage: 'Use for secondary actions and highlights' },
        accent: { hex: accent, role: 'accent', usage: 'Use for important UI elements and notifications' },
        background: { hex: background, role: 'background', usage: 'Use for main page background' },
        surface: { hex: surface, role: 'surface', usage: 'Use for cards and elevated surfaces' },
        text: { hex: text, role: 'text', usage: 'Use for body text and headings' }
      }
    };
  }

  /**
   * Generate a cool color palette
   * @param {number} seedHue - Base hue value (0-360)
   * @returns {Object} Palette object
   */
  generateCoolPalette(seedHue) {
    // Adjust seed to cool spectrum (blues, teals, purples: 150-330)
    let coolHue = seedHue;
    if (seedHue < 150 || seedHue > 330) {
      // Map to cool range (150-330)
      coolHue = 150 + (seedHue % 180);
    }
    // Ensure coolHue is in 150-330 range
    if (coolHue < 150 || coolHue > 330) {
      coolHue = 150 + (coolHue % 180);
    }

    const primary = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(coolHue, 65, 50))
    );
    
    // Keep secondary in cool range (150-330)
    const secondaryHue = 150 + ((coolHue - 150 + 40) % 180);
    const secondary = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(secondaryHue, 60, 55))
    );
    
    // Keep accent in cool range (150-330)
    const accentHue = 150 + ((coolHue - 150 + 80) % 180);
    const accent = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(accentHue, 75, 45))
    );
    
    const background = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(coolHue, 15, 96))
    );
    
    const surface = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(coolHue, 10, 99))
    );
    
    const text = '#1A1A1A';

    return {
      colors: {
        primary: { hex: primary, role: 'primary', usage: 'Use for main buttons and CTAs' },
        secondary: { hex: secondary, role: 'secondary', usage: 'Use for secondary actions and highlights' },
        accent: { hex: accent, role: 'accent', usage: 'Use for important UI elements and notifications' },
        background: { hex: background, role: 'background', usage: 'Use for main page background' },
        surface: { hex: surface, role: 'surface', usage: 'Use for cards and elevated surfaces' },
        text: { hex: text, role: 'text', usage: 'Use for body text and headings' }
      }
    };
  }

  /**
   * Generate a pastel color palette
   * @param {number} seedHue - Base hue value (0-360)
   * @returns {Object} Palette object
   */
  generatePastelPalette(seedHue) {
    // Pastel colors have low saturation (<50%) and high lightness (>70%)
    const primary = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(seedHue, 45, 75))
    );
    
    const secondary = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb((seedHue + 60) % 360, 40, 78))
    );
    
    const accent = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb((seedHue + 120) % 360, 48, 72))
    );
    
    const background = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(seedHue, 25, 95))
    );
    
    const surface = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(seedHue, 20, 98))
    );
    
    const text = '#2A2A2A';

    return {
      colors: {
        primary: { hex: primary, role: 'primary', usage: 'Use for main buttons and CTAs' },
        secondary: { hex: secondary, role: 'secondary', usage: 'Use for secondary actions and highlights' },
        accent: { hex: accent, role: 'accent', usage: 'Use for important UI elements and notifications' },
        background: { hex: background, role: 'background', usage: 'Use for main page background' },
        surface: { hex: surface, role: 'surface', usage: 'Use for cards and elevated surfaces' },
        text: { hex: text, role: 'text', usage: 'Use for body text and headings' }
      }
    };
  }

  /**
   * Generate a dark mode palette
   * @param {number} seedHue - Base hue value (0-360)
   * @returns {Object} Palette object
   */
  generateDarkModePalette(seedHue) {
    // Dark mode: dark backgrounds (<20% lightness), bright accents (>50% lightness)
    const primary = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(seedHue, 70, 60))
    );
    
    const secondary = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb((seedHue + 30) % 360, 65, 55))
    );
    
    const accent = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb((seedHue + 60) % 360, 80, 65))
    );
    
    const background = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(seedHue, 10, 12))
    );
    
    const surface = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(seedHue, 8, 18))
    );
    
    const text = '#F5F5F5';

    return {
      colors: {
        primary: { hex: primary, role: 'primary', usage: 'Use for main buttons and CTAs' },
        secondary: { hex: secondary, role: 'secondary', usage: 'Use for secondary actions and highlights' },
        accent: { hex: accent, role: 'accent', usage: 'Use for important UI elements and notifications' },
        background: { hex: background, role: 'background', usage: 'Use for main page background' },
        surface: { hex: surface, role: 'surface', usage: 'Use for cards and elevated surfaces' },
        text: { hex: text, role: 'text', usage: 'Use for body text and headings' }
      }
    };
  }

  /**
   * Generate a professional palette (internal use)
   * @param {number} seedHue - Base hue value (0-360)
   * @returns {Object} Palette object
   */
  generateProfessionalPalette(seedHue) {
    // Professional: blues/greys (180-270 or achromatic), saturation <60%
    let professionalHue = seedHue;
    if (seedHue < 180 || seedHue > 270) {
      professionalHue = 210 + (seedHue % 30); // Map to blue range
    }

    const primary = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(professionalHue, 55, 50))
    );
    
    const secondary = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(professionalHue, 45, 55))
    );
    
    const accent = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb((professionalHue + 20) % 360, 58, 48))
    );
    
    const background = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(professionalHue, 10, 97))
    );
    
    const surface = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(professionalHue, 8, 99))
    );
    
    const text = '#1A1A1A';

    return {
      colors: {
        primary: { hex: primary, role: 'primary', usage: 'Use for main buttons and CTAs' },
        secondary: { hex: secondary, role: 'secondary', usage: 'Use for secondary actions and highlights' },
        accent: { hex: accent, role: 'accent', usage: 'Use for important UI elements and notifications' },
        background: { hex: background, role: 'background', usage: 'Use for main page background' },
        surface: { hex: surface, role: 'surface', usage: 'Use for cards and elevated surfaces' },
        text: { hex: text, role: 'text', usage: 'Use for body text and headings' }
      }
    };
  }

  /**
   * Generate a playful palette (internal use)
   * @param {number} seedHue - Base hue value (0-360)
   * @returns {Object} Palette object
   */
  generatePlayfulPalette(seedHue) {
    // Playful: bright, saturated accents (>60% saturation, >50% brightness)
    const primary = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(seedHue, 75, 55))
    );
    
    const secondary = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb((seedHue + 90) % 360, 70, 58))
    );
    
    const accent = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb((seedHue + 180) % 360, 85, 60))
    );
    
    const background = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(seedHue, 30, 96))
    );
    
    const surface = this.colorUtility.rgbToHex(
      ...Object.values(this.colorUtility.hslToRgb(seedHue, 25, 99))
    );
    
    const text = '#1A1A1A';

    return {
      colors: {
        primary: { hex: primary, role: 'primary', usage: 'Use for main buttons and CTAs' },
        secondary: { hex: secondary, role: 'secondary', usage: 'Use for secondary actions and highlights' },
        accent: { hex: accent, role: 'accent', usage: 'Use for important UI elements and notifications' },
        background: { hex: background, role: 'background', usage: 'Use for main page background' },
        surface: { hex: surface, role: 'surface', usage: 'Use for cards and elevated surfaces' },
        text: { hex: text, role: 'text', usage: 'Use for body text and headings' }
      }
    };
  }

  /**
   * Apply professional adjustments to a palette
   * @private
   */
  _applyProfessionalAdjustments(palette) {
    // Reduce saturation for professional look, but preserve hue ranges from mood
    const adjustedColors = {};
    
    for (const [role, color] of Object.entries(palette.colors)) {
      const rgb = this.colorUtility.hexToRgb(color.hex);
      const hsl = this.colorUtility.rgbToHsl(rgb.r, rgb.g, rgb.b);
      
      // Only reduce saturation, don't shift hue (preserve mood)
      if (role !== 'text' && role !== 'background' && role !== 'surface') {
        hsl.s = Math.min(hsl.s, 58); // Cap saturation at 58%
      }
      
      const newRgb = this.colorUtility.hslToRgb(hsl.h, hsl.s, hsl.l);
      adjustedColors[role] = {
        hex: this.colorUtility.rgbToHex(newRgb.r, newRgb.g, newRgb.b),
        role: color.role,
        usage: color.usage
      };
    }
    
    return { ...palette, colors: adjustedColors };
  }

  /**
   * Apply playful adjustments to a palette
   * @private
   */
  _applyPlayfulAdjustments(palette) {
    // Increase saturation and brightness for accent colors, but respect mood constraints
    const adjustedColors = {};
    
    for (const [role, color] of Object.entries(palette.colors)) {
      const rgb = this.colorUtility.hexToRgb(color.hex);
      const hsl = this.colorUtility.rgbToHsl(rgb.r, rgb.g, rgb.b);
      
      // Boost saturation and brightness for accent, but only if not already pastel
      // Pastel colors should stay below 50% saturation
      if (role === 'accent' && hsl.s >= 50) {
        // Only boost if we're not in pastel mode (pastel has s < 50)
        hsl.s = Math.max(hsl.s, 65); // Ensure at least 65% saturation
        hsl.l = Math.max(hsl.l, 52); // Ensure at least 52% lightness
      }
      
      const newRgb = this.colorUtility.hslToRgb(hsl.h, hsl.s, hsl.l);
      adjustedColors[role] = {
        hex: this.colorUtility.rgbToHex(newRgb.r, newRgb.g, newRgb.b),
        role: color.role,
        usage: color.usage
      };
    }
    
    return { ...palette, colors: adjustedColors };
  }

  /**
   * Generate base hue from application type and purpose
   * @private
   */
  _generateBaseHue(appType, purpose) {
    // Use a simple hash of the purpose string to generate a seed
    let hash = 0;
    if (purpose) {
      for (let i = 0; i < purpose.length; i++) {
        hash = ((hash << 5) - hash) + purpose.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
      }
    }
    
    // Map application type to hue ranges
    const typeHueMap = {
      'web-dashboard': 210,  // Blue
      'mobile-app': 280,     // Purple
      'portfolio': 180,      // Cyan
      'e-commerce': 350,     // Red
      'saas': 200,           // Blue
      'professional': 220,   // Blue
      'playful': 30          // Orange
    };
    
    const baseHue = typeHueMap[appType] || 200;
    const variation = Math.abs(hash % 60) - 30; // -30 to +30 variation
    
    return (baseHue + variation + 360) % 360;
  }

  /**
   * Generate palette name
   * @private
   */
  _generatePaletteName(colorMood, appType, index) {
    const moodNames = {
      warm: ['Sunset Glow', 'Autumn Warmth', 'Desert Heat'],
      cool: ['Ocean Breeze', 'Arctic Frost', 'Mountain Mist'],
      pastel: ['Soft Dreams', 'Gentle Touch', 'Cloud Nine'],
      dark: ['Midnight Sky', 'Shadow Depths', 'Cosmic Night']
    };
    
    const typeModifiers = {
      professional: 'Professional',
      'web-dashboard': 'Dashboard',
      'mobile-app': 'Mobile',
      portfolio: 'Creative',
      'e-commerce': 'Commerce',
      saas: 'Enterprise',
      playful: 'Playful'
    };
    
    const baseName = (moodNames[colorMood] || moodNames.cool)[index];
    const modifier = typeModifiers[appType] || '';
    
    return modifier ? `${baseName} ${modifier}` : baseName;
  }

  /**
   * Generate vibe description
   * @private
   */
  _generateVibeDescription(colorMood, appType) {
    const moodDescriptions = {
      warm: 'warm and inviting',
      cool: 'cool and calming',
      pastel: 'soft and gentle',
      dark: 'bold and modern'
    };
    
    const typeDescriptions = {
      professional: 'professional appeal',
      'web-dashboard': 'data-focused clarity',
      'mobile-app': 'mobile-friendly design',
      portfolio: 'creative expression',
      'e-commerce': 'conversion-optimized',
      saas: 'enterprise reliability',
      playful: 'playful energy'
    };
    
    const mood = moodDescriptions[colorMood] || 'balanced and harmonious';
    const type = typeDescriptions[appType] || 'versatile application';
    
    return `${mood.charAt(0).toUpperCase() + mood.slice(1)} with ${type}`;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaletteGenerator;
}

export default PaletteGenerator;
