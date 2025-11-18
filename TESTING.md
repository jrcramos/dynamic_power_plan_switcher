# Testing Guide

This document explains how to test the Dynamic Power Plan Switcher application.

## Running Tests

The project includes automated tests to verify the application builds correctly and can be loaded by Electron.

### Run all tests

```bash
npm test
```

### What is being tested

The test suite verifies:

1. **Build Artifacts**: Checks that all required files are created during the build process
   - `dist/` directory exists
   - `dist/index.html` exists
   - `dist-electron/main.cjs` exists
   - `dist-electron/preload.cjs` exists

2. **Asset Path Configuration**: Ensures HTML uses relative paths (critical for Electron)
   - Verifies that asset paths in HTML start with `./` instead of `/`
   - This prevents the blank screen issue in the Electron app

3. **React App Structure**: Validates basic React application setup
   - Root element mounting
   - Component exports

## Manual Testing

### Testing the Web Version

```bash
# Start development server
npm run dev

# Or test production build
npm run build
npm run preview
```

Then open http://localhost:5173 (dev) or http://localhost:4173 (preview) in your browser.

### Testing the Electron App

```bash
# Development mode (with hot reload)
npm run electron:dev

# Production build
npm run electron:build
```

The production build creates an installer in the `release/` directory.

## Troubleshooting Tests

### Issue: Tests fail with module import errors

**Solution**: The project uses ES modules. Make sure you're using Node.js 18 or higher.

### Issue: "dist directory should exist" test fails

**Solution**: Run `npm run build` before running tests to generate the build artifacts.

### Issue: Path tests fail after making changes

**Solution**: Rebuild the application with `npm run build` and run tests again.

## Continuous Integration

Tests should be run as part of the CI/CD pipeline:

```bash
npm install
npm run build
npm test
```

This ensures that:
- All dependencies are installed
- The application builds successfully
- The build artifacts are correctly configured for Electron
