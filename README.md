# Color Palette Tool

A standalone web application that helps developers quickly select accessible and aesthetically pleasing color palettes for their applications. Generate intelligent palette recommendations based on your application type, purpose, and desired color mood.

## Features

- **Smart Palette Generation**: Get 3 distinct, professionally designed color palettes tailored to your needs
- **Accessibility First**: All palettes include WCAG-compliant color combinations with contrast ratio information
- **Multiple Export Formats**: Export palettes as CSS variables, JSON, or plain text
- **One-Click Copy**: Click any HEX code to copy it to your clipboard
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **No Backend Required**: Runs entirely in the browser with no server dependencies

## Quick Start

### Option 1: Open Directly in Browser

1. Download or clone this repository
2. Open `index.html` in your web browser
3. Start generating palettes!

### Option 2: Run with Local Server

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

## How to Use

### 1. Fill Out the Form

- **Application Type**: Select the type of application you're building (e.g., web dashboard, mobile app, portfolio site)
- **Purpose**: Describe what your application does (e.g., "A fitness tracking app for runners")
- **Color Mood**: Choose the emotional tone you want (warm, cool, pastel, dark mode, etc.)

### 2. Generate Palettes

Click the "Generate Palettes" button to receive 3 unique color palette recommendations.

### 3. Explore Your Palettes

Each palette includes:
- **Palette Name & Vibe**: A descriptive name and mood description
- **5 Colors with Roles**: Primary, Secondary, Accent, Background, Surface, and Text colors
- **HEX Codes**: Click any HEX code to copy it to your clipboard
- **Usage Guidance**: Suggestions for how to use each color in your UI
- **Accessibility Info**: Contrast ratios and recommended text-background combinations
- **Implementation Tips**: Guidance on applying the palette in your code

### 4. Export Your Palette

Choose from multiple export formats:
- **CSS Variables**: Ready-to-use CSS custom properties
- **JSON**: Structured data for programmatic use
- **Plain Text**: Simple list of colors and codes

## Color Moods Explained

- **Warm**: Reds, oranges, yellows, and warm neutrals for energetic, inviting designs
- **Cool**: Blues, teals, purples, and cool greys for calm, professional aesthetics
- **Pastel**: Soft, low-saturation colors with high brightness for gentle, approachable interfaces
- **Dark Mode**: Dark backgrounds with bright accents for modern, eye-friendly designs
- **Professional**: Blues, greys, and muted tones for corporate and business applications
- **Playful**: Bright, saturated colors for fun, creative, and youthful projects

## Accessibility

All generated palettes are validated against WCAG (Web Content Accessibility Guidelines) standards:

- **Minimum Contrast**: Every palette includes at least one text-background pair with a 4.5:1 contrast ratio
- **Clear Guidance**: Accessibility information shows which colors work well together for readable text
- **WCAG Compliance**: Helps you meet AA and AAA accessibility standards

## Development

### Running Tests

```bash
# Install dependencies
npm install

# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Project Structure

```
color-palette-tool/
├── index.html                          # Main HTML file
├── styles.css                          # Application styles
├── app.js                              # Main application entry point
├── color-utility.js                    # Color conversion and manipulation
├── accessibility-checker.js            # WCAG contrast calculations
├── palette-generator.js                # Palette generation algorithms
├── palette-display.js                  # UI rendering for palettes
├── export-manager.js                   # Export functionality
├── *.test.js                          # Unit tests
├── *.property.test.js                 # Property-based tests
└── README.md                          # This file
```

## Browser Compatibility

### Supported Browsers

| Browser | Minimum Version |
|---------|----------------|
| Chrome  | 90+            |
| Edge    | 90+            |
| Firefox | 88+            |
| Safari  | 14+            |
| iOS Safari | 14+         |
| Chrome Mobile | 90+      |

### Required Features

The application requires the following modern browser features:
- ES6+ JavaScript (arrow functions, classes, modules)
- CSS Grid and Flexbox
- CSS Custom Properties (CSS variables)
- Clipboard API (with fallback for older browsers)

### Fallbacks

- **Clipboard API not available**: The app will display text in a modal for manual copying
- **CSS Custom Properties not supported**: A warning message will be shown

## Deployment

### Static Hosting Services

This application can be deployed to any static hosting service:

#### GitHub Pages

1. Push your code to a GitHub repository
2. Go to Settings > Pages
3. Select your branch and root folder
4. Your site will be available at `https://yourusername.github.io/repository-name`

#### Netlify

1. Sign up at [netlify.com](https://www.netlify.com)
2. Drag and drop your project folder
3. Your site is live instantly with a custom URL

#### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Cloudflare Pages

1. Sign up at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect your Git repository
3. Deploy with zero configuration

### Custom Domain

Most hosting services allow you to connect a custom domain. Check your hosting provider's documentation for specific instructions.

## Technical Details

### Color Theory Implementation

The palette generator uses established color theory principles:
- **Analogous colors**: Colors adjacent on the color wheel for harmony
- **Complementary colors**: Opposite colors for contrast
- **Triadic colors**: Three evenly spaced colors for balance

### Accessibility Calculations

Contrast ratios are calculated using the WCAG 2.1 formula:

```
contrast_ratio = (L1 + 0.05) / (L2 + 0.05)
```

Where L1 and L2 are the relative luminance values of the lighter and darker colors.

## Troubleshooting

### Colors not copying to clipboard

- Ensure you're using a modern browser (see Browser Compatibility)
- Check that your browser allows clipboard access
- Try the export feature as an alternative

### Palettes look similar

- Try different color moods
- Provide more specific application purpose descriptions
- Refresh and generate again for new variations

### Layout issues on mobile

- Ensure you're using a supported browser version
- Try rotating your device
- Clear your browser cache

## Contributing

This is a standalone educational project. Feel free to fork and modify for your own use!

## License

MIT License - feel free to use this tool for personal or commercial projects.

## Credits

Built with vanilla JavaScript, HTML, and CSS. No frameworks, no dependencies (except dev tools for testing).

---

**Need help?** Check the browser console for any error messages, and ensure you're using a supported browser version.
