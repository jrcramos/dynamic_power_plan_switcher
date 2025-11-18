/**
 * Basic tests for Dynamic Power Plan Switcher
 * These tests verify that the application can be built and loaded correctly
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Application Build Tests', () => {
  test('dist directory should exist after build', () => {
    const distPath = path.join(__dirname, '../dist');
    expect(fs.existsSync(distPath)).toBe(true);
  });

  test('index.html should exist in dist', () => {
    const indexPath = path.join(__dirname, '../dist/index.html');
    expect(fs.existsSync(indexPath)).toBe(true);
  });

  test('index.html should use relative paths for assets (not absolute)', () => {
    const indexPath = path.join(__dirname, '../dist/index.html');
    const content = fs.readFileSync(indexPath, 'utf-8');
    
    // Check that script sources don't start with / (absolute path)
    // They should start with ./ or just be relative
    const scriptMatches = content.match(/src="([^"]+)"/g);
    const linkMatches = content.match(/href="([^"]+)"/g);
    
    if (scriptMatches) {
      scriptMatches.forEach(match => {
        const src = match.match(/(?:src|href)="([^"]+)"/)[1];
        // Allow relative paths (./assets/...) but not absolute paths (/assets/...)
        // unless it's an external URL
        if (src.startsWith('/') && !src.startsWith('//') && !src.startsWith('http')) {
          throw new Error(`Found absolute path in HTML: ${src}. Should use relative path for Electron compatibility.`);
        }
      });
    }
    
    if (linkMatches) {
      linkMatches.forEach(match => {
        const href = match.match(/href="([^"]+)"/)[1];
        if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('http')) {
          throw new Error(`Found absolute path in HTML: ${href}. Should use relative path for Electron compatibility.`);
        }
      });
    }
  });

  test('dist-electron directory should exist after build', () => {
    const distElectronPath = path.join(__dirname, '../dist-electron');
    expect(fs.existsSync(distElectronPath)).toBe(true);
  });

  test('main.cjs should exist in dist-electron', () => {
    const mainPath = path.join(__dirname, '../dist-electron/main.cjs');
    expect(fs.existsSync(mainPath)).toBe(true);
  });

  test('preload.cjs should exist in dist-electron', () => {
    const preloadPath = path.join(__dirname, '../dist-electron/preload.cjs');
    expect(fs.existsSync(preloadPath)).toBe(true);
  });
});

describe('React App Tests', () => {
  test('index.tsx should have root element mount', () => {
    const indexPath = path.join(__dirname, '../index.tsx');
    const content = fs.readFileSync(indexPath, 'utf-8');
    expect(content).toContain("getElementById('root')");
  });

  test('App.tsx should export default component', () => {
    const appPath = path.join(__dirname, '../App.tsx');
    const content = fs.readFileSync(appPath, 'utf-8');
    expect(content).toContain('export default');
  });
});
