/**
 * Color Palette Tool - Main Application Entry Point
 * 
 * This application generates accessible color palettes based on user preferences.
 * Requirements: 8.2, 9.1
 */

// Import required modules
import PaletteGenerator from './palette-generator.js';
import PaletteDisplay from './palette-display.js';

// Application state
const state = {
    preferences: null,
    palettes: []
};

// DOM elements
const elements = {
    form: null,
    loading: null,
    palettesContainer: null,
    toast: null,
    toastMessage: null
};

// Component instances
let paletteGenerator = null;
let paletteDisplay = null;

/**
 * Initialize the application
 */
function init() {
    // Cache DOM elements
    elements.form = document.getElementById('paletteForm');
    elements.loading = document.getElementById('loading');
    elements.palettesContainer = document.getElementById('palettesContainer');
    elements.toast = document.getElementById('toast');
    elements.toastMessage = document.getElementById('toastMessage');

    // Initialize components
    paletteGenerator = new PaletteGenerator();
    paletteDisplay = new PaletteDisplay(elements.palettesContainer);

    // Set up event listeners
    setupEventListeners();

    console.log('Color Palette Tool initialized');
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    if (elements.form) {
        elements.form.addEventListener('submit', handleFormSubmit);
    }

    // Set up clipboard copy functionality using event delegation
    if (elements.palettesContainer) {
        elements.palettesContainer.addEventListener('click', handleHexCodeClick);
    }
}

/**
 * Handle form submission
 * Requirements: 1.5, 2.1
 * @param {Event} event - Form submit event
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Clear previous errors
    clearErrors();

    // Get form data
    const formData = getFormData();

    // Validate form
    const validation = validateForm(formData);
    
    if (!validation.isValid) {
        displayErrors(validation.errors);
        return;
    }

    // Store preferences
    state.preferences = formData;

    // Show loading state
    showLoading();

    try {
        // Generate palettes using the palette generator
        // Use setTimeout to simulate async operation and allow UI to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const palettes = paletteGenerator.generate(formData);
        
        // Store generated palettes
        state.palettes = palettes;

        // Display palettes using the palette display component
        paletteDisplay.render(palettes);

        // Hide loading state
        hideLoading();

        // Scroll to results
        scrollToResults();

        // Show success message
        showToast('Successfully generated 3 color palettes!');
    } catch (error) {
        // Handle errors during palette generation
        console.error('Error generating palettes:', error);
        hideLoading();
        showToast('Error generating palettes. Please try again.');
        
        // Display user-friendly error message
        displayGenerationError(error);
    }
}

/**
 * Scroll to results section smoothly
 */
function scrollToResults() {
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Display error message for palette generation failures
 * @param {Error} error - Error object
 */
function displayGenerationError(error) {
    if (elements.palettesContainer) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'generation-error';
        errorDiv.innerHTML = `
            <h3>Unable to Generate Palettes</h3>
            <p>We encountered an error while generating your color palettes. Please try again with different preferences.</p>
            <p class="error-details">${error.message || 'Unknown error'}</p>
        `;
        elements.palettesContainer.appendChild(errorDiv);
    }
}

/**
 * Get form data
 * @returns {Object} Form data object
 */
function getFormData() {
    return {
        appType: document.getElementById('appType').value,
        purpose: document.getElementById('purpose').value.trim(),
        colorMood: document.getElementById('colorMood').value
    };
}

/**
 * Validate form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with isValid flag and errors object
 */
function validateForm(formData) {
    const errors = {};

    if (!formData.appType) {
        errors.appType = 'Please select an application type';
    }

    if (!formData.purpose || formData.purpose.trim().length === 0) {
        errors.purpose = 'Please describe your application purpose';
    }

    if (!formData.colorMood) {
        errors.colorMood = 'Please select a color mood';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Display validation errors
 * @param {Object} errors - Errors object with field names as keys
 */
function displayErrors(errors) {
    Object.keys(errors).forEach(fieldName => {
        const errorElement = document.getElementById(`${fieldName}Error`);
        if (errorElement) {
            errorElement.textContent = errors[fieldName];
        }
    });
}

/**
 * Clear all error messages
 */
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

/**
 * Show loading state
 */
function showLoading() {
    if (elements.loading) {
        elements.loading.hidden = false;
    }
    if (elements.palettesContainer) {
        elements.palettesContainer.innerHTML = '';
    }
    // Disable form submit button during loading
    const submitButton = elements.form?.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Generating...';
    }
}

/**
 * Hide loading state
 */
function hideLoading() {
    if (elements.loading) {
        elements.loading.hidden = true;
    }
    // Re-enable form submit button
    const submitButton = elements.form?.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Generate Palettes';
    }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 */
function showToast(message) {
    if (elements.toast && elements.toastMessage) {
        elements.toastMessage.textContent = message;
        elements.toast.hidden = false;

        // Auto-hide after 3 seconds
        setTimeout(() => {
            elements.toast.hidden = true;
        }, 3000);
    }
}

/**
 * Handle click on HEX code elements
 * @param {Event} event - Click event
 */
function handleHexCodeClick(event) {
    // Check if clicked element is a HEX code button
    const hexButton = event.target.closest('.color-hex');
    
    if (hexButton) {
        const hexCode = hexButton.getAttribute('data-hex');
        if (hexCode) {
            copyToClipboard(hexCode);
        }
    }
}

/**
 * Copy text to clipboard with fallback
 * @param {string} text - Text to copy
 */
async function copyToClipboard(text) {
    try {
        // Try modern Clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            showToast(`Copied ${text} to clipboard`);
        } else {
            // Fallback for browsers without Clipboard API
            copyToClipboardFallback(text);
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        // Try fallback method
        copyToClipboardFallback(text);
    }
}

/**
 * Fallback clipboard copy using textarea selection
 * @param {string} text - Text to copy
 */
function copyToClipboardFallback(text) {
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
        
        if (success) {
            showToast(`Copied ${text} to clipboard`);
        } else {
            showToast('Failed to copy to clipboard');
        }
    } catch (error) {
        console.error('Fallback copy failed:', error);
        showToast('Failed to copy to clipboard');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getFormData,
        validateForm,
        showToast,
        copyToClipboard,
        copyToClipboardFallback,
        handleHexCodeClick
    };
}
