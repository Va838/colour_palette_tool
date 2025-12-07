/**
 * PaletteDisplay - Render color palettes to the DOM
 * 
 * Displays generated palettes with color swatches, HEX codes, roles,
 * usage suggestions, accessibility information, and implementation tips.
 * 
 * Requirements: 2.2, 2.3, 2.4, 2.5, 4.2, 4.4, 5.3, 7.1, 7.2, 7.3
 */

class PaletteDisplay {
  /**
   * Create a new PaletteDisplay instance
   * @param {HTMLElement} containerElement - DOM element to render palettes into
   */
  constructor(containerElement) {
    this.container = containerElement;
  }

  /**
   * Render all palettes to the DOM
   * @param {Array<Object>} palettes - Array of palette objects to render
   */
  render(palettes) {
    // Clear existing content
    this.clear();

    // Render each palette
    palettes.forEach((palette, index) => {
      this.renderPalette(palette, index);
    });
  }

  /**
   * Render a single palette
   * @param {Object} palette - Palette object to render
   * @param {number} index - Palette index (0-2)
   */
  renderPalette(palette, index) {
    const paletteCard = document.createElement('div');
    paletteCard.className = 'palette-card';
    paletteCard.setAttribute('data-palette-index', index);

    // Palette header with name and vibe
    const header = document.createElement('div');
    header.className = 'palette-header';
    header.innerHTML = `
      <h3 class="palette-name">${this._escapeHtml(palette.name)}</h3>
      <p class="palette-vibe">${this._escapeHtml(palette.vibe)}</p>
    `;
    paletteCard.appendChild(header);

    // Colors section
    const colorsSection = document.createElement('div');
    colorsSection.className = 'palette-colors';
    
    // Render each color
    const colorRoles = ['primary', 'secondary', 'accent', 'background', 'surface', 'text'];
    colorRoles.forEach(role => {
      if (palette.colors[role]) {
        const colorElement = this.renderColor(palette.colors[role], role);
        colorsSection.appendChild(colorElement);
      }
    });
    
    paletteCard.appendChild(colorsSection);

    // Accessibility information
    if (palette.accessiblePairs && palette.accessiblePairs.length > 0) {
      const accessibilitySection = this.renderAccessibilityInfo(palette.accessiblePairs);
      paletteCard.appendChild(accessibilitySection);
    }

    // Implementation tips
    const tipsSection = this.renderImplementationTips(palette);
    paletteCard.appendChild(tipsSection);

    // Append to container
    this.container.appendChild(paletteCard);
  }

  /**
   * Render a single color with swatch, HEX code, role, and usage
   * @param {Object} color - Color object {hex, role, usage}
   * @param {string} role - Color role name
   * @returns {HTMLElement} Color element
   */
  renderColor(color, role) {
    const colorDiv = document.createElement('div');
    colorDiv.className = 'color-item';
    colorDiv.setAttribute('data-color-role', role);

    // Color swatch (visual preview)
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color.hex;
    swatch.setAttribute('aria-label', `${role} color swatch`);

    // Color info container
    const infoDiv = document.createElement('div');
    infoDiv.className = 'color-info';

    // Role label
    const roleLabel = document.createElement('div');
    roleLabel.className = 'color-role';
    roleLabel.textContent = this._formatRoleName(role);

    // HEX code (clickable for copy)
    const hexCode = document.createElement('button');
    hexCode.className = 'color-hex';
    hexCode.textContent = color.hex;
    hexCode.setAttribute('data-hex', color.hex);
    hexCode.setAttribute('aria-label', `Copy ${color.hex} to clipboard`);
    hexCode.title = 'Click to copy';

    // Usage suggestion
    const usage = document.createElement('div');
    usage.className = 'color-usage';
    usage.textContent = color.usage;

    // Assemble color info
    infoDiv.appendChild(roleLabel);
    infoDiv.appendChild(hexCode);
    infoDiv.appendChild(usage);

    // Assemble color item
    colorDiv.appendChild(swatch);
    colorDiv.appendChild(infoDiv);

    return colorDiv;
  }

  /**
   * Render accessibility information section
   * @param {Array<Object>} accessiblePairs - Array of accessible color pairs
   * @returns {HTMLElement} Accessibility section element
   */
  renderAccessibilityInfo(accessiblePairs) {
    const section = document.createElement('div');
    section.className = 'accessibility-section';

    const heading = document.createElement('h4');
    heading.className = 'section-heading';
    heading.textContent = 'Accessibility Information';
    section.appendChild(heading);

    // Find the best text-background pairs (highest contrast)
    const sortedPairs = [...accessiblePairs].sort((a, b) => b.ratio - a.ratio);
    const topPairs = sortedPairs.slice(0, 3); // Show top 3 pairs

    const pairsList = document.createElement('ul');
    pairsList.className = 'accessibility-pairs';

    topPairs.forEach(pair => {
      const listItem = document.createElement('li');
      listItem.className = 'accessibility-pair';
      
      // Create visual preview of the pair
      const preview = document.createElement('div');
      preview.className = 'pair-preview';
      preview.style.backgroundColor = pair.background;
      preview.style.color = pair.text;
      preview.textContent = 'Aa';
      preview.setAttribute('aria-hidden', 'true');

      // Create text description
      const description = document.createElement('div');
      description.className = 'pair-description';
      description.innerHTML = `
        <strong>Contrast Ratio: ${pair.ratio}:1</strong><br>
        Text: <code>${pair.text}</code> on Background: <code>${pair.background}</code><br>
        <span class="wcag-badge">${pair.ratio >= 7 ? 'WCAG AAA' : 'WCAG AA'}</span>
      `;

      listItem.appendChild(preview);
      listItem.appendChild(description);
      pairsList.appendChild(listItem);
    });

    section.appendChild(pairsList);

    // Add note about suitable colors
    const note = document.createElement('p');
    note.className = 'accessibility-note';
    note.textContent = 'These color combinations are suitable for body text and meet WCAG accessibility standards.';
    section.appendChild(note);

    return section;
  }

  /**
   * Render implementation tips section
   * @param {Object} palette - Palette object
   * @returns {HTMLElement} Implementation tips section
   */
  renderImplementationTips(palette) {
    const section = document.createElement('div');
    section.className = 'implementation-section';

    const heading = document.createElement('h4');
    heading.className = 'section-heading';
    heading.textContent = 'Implementation Tips';
    section.appendChild(heading);

    const tipsList = document.createElement('ul');
    tipsList.className = 'implementation-tips';

    // Tip 1: CSS Variables
    const tip1 = document.createElement('li');
    tip1.innerHTML = `
      <strong>CSS Variables:</strong> Define these colors as CSS custom properties in your root stylesheet:
      <pre><code>:root {
  --color-primary: ${palette.colors.primary.hex};
  --color-secondary: ${palette.colors.secondary.hex};
  --color-accent: ${palette.colors.accent.hex};
}</code></pre>
    `;
    tipsList.appendChild(tip1);

    // Tip 2: Primary color usage
    const tip2 = document.createElement('li');
    tip2.innerHTML = `
      <strong>Primary Color:</strong> Use <code>${palette.colors.primary.hex}</code> for main call-to-action buttons, 
      links, and key branding elements to create visual hierarchy.
    `;
    tipsList.appendChild(tip2);

    // Tip 3: Consistency
    const tip3 = document.createElement('li');
    tip3.innerHTML = `
      <strong>Consistency:</strong> Maintain consistent color usage throughout your application. 
      Use the accent color sparingly for important notifications and highlights.
    `;
    tipsList.appendChild(tip3);

    section.appendChild(tipsList);

    return section;
  }

  /**
   * Clear all rendered palettes
   */
  clear() {
    this.container.innerHTML = '';
  }

  /**
   * Format role name for display
   * @private
   * @param {string} role - Role name (e.g., 'primary')
   * @returns {string} Formatted role name (e.g., 'Primary')
   */
  _formatRoleName(role) {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  /**
   * Escape HTML to prevent XSS
   * @private
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaletteDisplay;
}

export default PaletteDisplay;
