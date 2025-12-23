# Firefox Compatibility Guide

This document outlines the changes needed to make this Chrome extension compatible with Firefox.

## Current Status

The extension is currently built for Chrome using:
- Manifest V3
- CRXJS Vite Plugin
- Chrome-specific Side Panel API
- `chrome.*` namespace for APIs

## Summary of Changes Needed

### 1. Build Tool Changes

**Current:** CRXJS Vite Plugin (Chrome-focused)

**Firefox Options:**
- **Option A:** Use `web-ext` alongside CRXJS for dual builds
- **Option B:** Replace CRXJS with `vite-plugin-web-extension` (supports both browsers)
- **Option C:** Manual build process with separate configs

### 2. Side Panel → Sidebar Replacement

**Chrome Side Panel API (Current):**
```typescript
// manifest.config.ts
side_panel: {
  default_path: 'src/sidepanel/index.html'
}
```

**Firefox Sidebar API (Needed):**
```typescript
// manifest.config.ts
sidebar_action: {
  default_panel: 'src/sidepanel/index.html',
  default_title: 'Tab Manager'
}
```

**Key Differences:**
- Chrome: `sidePanel` permission
- Firefox: `sidebarAction` in manifest
- Chrome: Accessed via browser UI or `chrome.sidePanel` API
- Firefox: Accessed via sidebar toggle or `browser.sidebarAction` API

### 3. Manifest Configuration

**Current `manifest.config.ts`:**
```typescript
export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  permissions: ['tabs', 'sidePanel', 'contentSettings'],
  action: {
    default_popup: 'src/popup/index.html'
  },
  side_panel: {
    default_path: 'src/sidepanel/index.html'
  },
  content_scripts: [
    {
      matches: ['https://*/*'],
      js: ['src/content/main.tsx']
    }
  ]
})
```

**Firefox-Compatible Version:**
```typescript
export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,

  // Firefox-specific metadata
  browser_specific_settings: {
    gecko: {
      id: 'your-extension@example.com',
      strict_min_version: '109.0' // Manifest V3 minimum
    }
  },

  permissions: [
    'tabs',
    // Remove 'sidePanel' for Firefox, add nothing (sidebar doesn't need permission)
    'contentSettings'
  ],

  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'Tab Manager'
  },

  // Firefox uses sidebar_action instead of side_panel
  sidebar_action: {
    default_panel: 'src/sidepanel/index.html',
    default_title: 'Tab Manager',
    default_icon: 'public/logo.png'
  },

  content_scripts: [
    {
      matches: ['https://*/*'],
      js: ['src/content/main.tsx']
    }
  ]
})
```

### 4. API Namespace Compatibility

**Current:** Uses `chrome.*` exclusively

**Options for Firefox:**

**Option A: Use `browser` namespace (Firefox standard):**
```typescript
// Works in Firefox natively
const tabs = await browser.tabs.query({})
await browser.tabs.update(tabId, { active: true })
```

**Option B: Polyfill with webextension-polyfill:**
```bash
npm install webextension-polyfill
```

```typescript
import browser from 'webextension-polyfill'

// Now works in both Chrome and Firefox
const tabs = await browser.tabs.query({})
await browser.tabs.update(tabId, { active: true })
```

**Option C: Simple compatibility shim:**
```typescript
// At the top of files using APIs
const browserAPI = typeof browser !== 'undefined' ? browser : chrome

// Then use browserAPI throughout
const tabs = await browserAPI.tabs.query({})
```

### 5. Package.json Changes

**Add Firefox build scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "dev:firefox": "web-ext run --source-dir dist",
    "build": "tsc -b && vite build",
    "build:firefox": "tsc -b && vite build --mode firefox",
    "package:firefox": "web-ext build --source-dir dist --artifacts-dir release"
  },
  "devDependencies": {
    "web-ext": "^8.0.0",
    "webextension-polyfill": "^0.12.0",
    "@types/webextension-polyfill": "^0.12.0"
  }
}
```

### 6. Code Changes for Duplicate Tabs Feature

**Current `src/popup/App.tsx`:**
```typescript
const getDuplicateTabs = async () => {
  const allTabs = await chrome.tabs.query({})
  // ... rest of code
}

const focusTab = async (tabId, windowId) => {
  await chrome.tabs.update(tabId, { active: true })
  await chrome.windows.update(windowId, { focused: true })
}
```

**Firefox-Compatible Version (with polyfill):**
```typescript
import browser from 'webextension-polyfill'

const getDuplicateTabs = async () => {
  const allTabs = await browser.tabs.query({})
  // ... rest of code
}

const focusTab = async (tabId, windowId) => {
  await browser.tabs.update(tabId, { active: true })
  await browser.windows.update(windowId, { focused: true })
}
```

### 7. Type Definitions

**Add Firefox types:**
```typescript
// src/types/browser.d.ts
import { Browser } from 'webextension-polyfill'

declare global {
  const browser: Browser
}
```

**Or use conditional types:**
```typescript
type Tab = chrome.tabs.Tab | browser.tabs.Tab
```

### 8. Build Configuration for Dual Browser Support

**Create `vite.config.firefox.ts`:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifestConfig from './manifest.config.firefox'

export default defineConfig({
  plugins: [react(), crx({ manifest: manifestConfig })],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    outDir: 'dist-firefox'
  }
})
```

**Create `manifest.config.firefox.ts`:**
```typescript
import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,

  browser_specific_settings: {
    gecko: {
      id: 'crxjs-tab-unload@example.com',
      strict_min_version: '109.0'
    }
  },

  permissions: ['tabs', 'contentSettings'],

  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'Tab Manager'
  },

  sidebar_action: {
    default_panel: 'src/sidepanel/index.html',
    default_title: 'Tab Manager'
  },

  content_scripts: [
    {
      matches: ['https://*/*'],
      js: ['src/content/main.tsx']
    }
  ]
})
```

## Implementation Roadmap

### Minimal Firefox Support (Popup Only)
1. Install `webextension-polyfill`
2. Replace `chrome` with `browser` in all API calls
3. Create Firefox-specific manifest with `browser_specific_settings`
4. Remove side panel from Firefox build
5. Test with `web-ext run`

### Full Firefox Support (With Sidebar)
1. Do steps above
2. Replace `side_panel` with `sidebar_action` in manifest
3. Update sidebar code to use Firefox's sidebar API
4. Create dual build process
5. Test both Chrome and Firefox builds

### Cross-Browser Development Workflow
1. Use `webextension-polyfill` for all API calls
2. Maintain separate manifest configs for Chrome/Firefox
3. Create separate build scripts for each browser
4. Test in both browsers regularly

## API Compatibility Matrix

| Feature | Chrome | Firefox | Notes |
|---------|--------|---------|-------|
| `tabs.query()` | ✓ | ✓ | Fully compatible |
| `tabs.update()` | ✓ | ✓ | Fully compatible |
| `tabs.discard()` | ✓ | ✓ | Fully compatible |
| `windows.update()` | ✓ | ✓ | Fully compatible |
| Side Panel | ✓ | ✗ | Use `sidebar_action` in Firefox |
| Manifest V3 | ✓ | ✓ | Firefox 109+ |

## Testing in Firefox

**Development:**
```bash
# Build the extension
npm run build

# Run in Firefox (auto-reload)
npx web-ext run --source-dir dist
```

**Testing:**
```bash
# Open Firefox
# Navigate to about:debugging
# Click "This Firefox"
# Click "Load Temporary Add-on"
# Select manifest.json from dist folder
```

**Production Package:**
```bash
# Create .xpi file for Firefox Add-ons
npx web-ext build --source-dir dist
```

## Key Differences Summary

| Aspect | Chrome | Firefox |
|--------|--------|---------|
| API Namespace | `chrome.*` | `browser.*` (also supports `chrome.*`) |
| Side UI | Side Panel | Sidebar |
| Manifest Field | `side_panel` | `sidebar_action` |
| Package Format | .zip | .xpi |
| Store | Chrome Web Store | Firefox Add-ons (AMO) |
| Build Tool | CRXJS | web-ext |

## Recommended Approach

**For maximum compatibility with minimal effort:**

1. Install webextension-polyfill:
   ```bash
   npm install webextension-polyfill @types/webextension-polyfill
   ```

2. Replace all `chrome.*` with `browser.*` from polyfill

3. Create conditional manifest based on build target

4. Use separate build outputs: `dist/` for Chrome, `dist-firefox/` for Firefox

5. Test in both browsers before release

## Additional Resources

- [MDN: Browser Extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [web-ext Documentation](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/)
- [webextension-polyfill](https://github.com/mozilla/webextension-polyfill)
- [Browser Compatibility Chart](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs)
