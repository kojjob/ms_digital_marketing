# Tailwind CSS Setup for MS Digital Marketing Website

This directory contains the Tailwind CSS build configuration for the MS Digital Marketing website.

## Setup

1. Install dependencies:
```
npm install
```

2. Build the CSS:
```
npm run build
```

3. Watch for changes during development:
```
npm run watch
```

4. Build minified CSS for production:
```
npm run minify
```

## Integration

The compiled CSS will be output to:
- `../css/tailwind.css` for development
- `../css/tailwind.min.css` for production

Update the HTML files to reference these files instead of using the Tailwind CDN.

## Configuration

The Tailwind configuration is in `tailwind.config.js`. This matches the configuration previously defined in `js/tailwind-config.js` but is now properly set up for the build process.
