/**
 * ExportManager - Export color palettes in multiple formats
 * 
 * Provides functionality to export palettes as CSS variables, JSON, and plain text.
 * Handles file downloads and clipboard operations.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

class ExportManager {
  /**
   * Export palette as CSS custom properties
   * @param {Object} palette - Palette object to export
   * @returns {string} CSS custom properties string
   */
  exportAsCSS(palette) {
    const lines = [':root {'];
    
    // Add each color as a CSS custom property
    for (const [role, color] of Object.entries(palette.colors)) {
      lines.push(`  --color-${role}: ${color.hex};`);
    }
    
    lines.push('}');
    
    return lines.join('\n');
  }

  /**
   * Export palette as JSON
   * @param {Object} palette - Palette object to export
   * @returns {string} JSON string
   */
  exportAsJSON(palette) {
    const exportData = {
      name: palette.name,
      vibe: palette.vibe,
      colors: {}
    };
    
    // Extract color names and HEX codes
    for (const [role, color] of Object.entries(palette.colors)) {
      exportData.colors[role] = color.hex;
    }
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export palette as plain text
   * @param {Object} palette - Palette object to export
   * @returns {string} Formatted plain text
   */
  exportAsPlainText(palette) {
    const lines = [
      `Palette: ${palette.name}`,
      `Vibe: ${palette.vibe}`,
      '',
      'Colors:'
    ];
    
    // Add each color with role and HEX code
    for (const [role, color] of Object.entries(palette.colors)) {
      const roleName = role.charAt(0).toUpperCase() + role.slice(1);
      lines.push(`  ${roleName}: ${color.hex}`);
    }
    
    return lines.join('\n');
  }

  /**
   * Download content as a file
   * @param {string} content - File content
   * @param {string} filename - Name of the file to download
   * @param {string} mimeType - MIME type of the file
   */
  downloadFile(content, filename, mimeType) {
    // Create a Blob from the content
    const blob = new Blob([content], { type: mimeType });
    
    // Create a temporary download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Promise that resolves to true if successful
   */
  async copyToClipboard(text) {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for browsers without Clipboard API
        return this._copyToClipboardFallback(text);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Try fallback method
      return this._copyToClipboardFallback(text);
    }
  }

  /**
   * Fallback clipboard copy using textarea selection
   * @private
   * @param {string} text - Text to copy
   * @returns {boolean} True if successful
   */
  _copyToClipboardFallback(text) {
    try {
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.left = '-9999px';
      
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      
      // Execute copy command
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      return success;
    } catch (error) {
      console.error('Fallback copy failed:', error);
      return false;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExportManager;
}

export default ExportManager;
