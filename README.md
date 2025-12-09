# Tab Unload Extension

A Chrome/Firefox extension for managing browser tabs. Built with React 19, TypeScript, and Vite using the CRXJS plugin.

## Features

- **Tab Management**: View all tabs, current window tabs, or just the active tab
- **Tab Unloading**: Manually discard tabs to free up memory using Chrome's native `chrome.tabs.discard` API
- **Cross-browser Support**: Works in Chrome and Firefox
- React 19 with TypeScript
- Vite build tool with Hot Module Replacement (HMR)
- CRXJS Vite plugin integration
- Popup UI and Side Panel support

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open Chrome and navigate to `chrome://extensions/`, enable "Developer mode", and load the unpacked extension from the `dist` directory.

4. Build for production:

```bash
npm run build
```

## Project Structure

- `src/popup/` - Extension popup UI
- `src/content/` - Content scripts
- `manifest.config.ts` - Chrome extension manifest configuration

## Documentation

- [React Documentation](https://reactjs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [CRXJS Documentation](https://crxjs.dev/vite-plugin)

## Project Structure

- `src/popup/` - Extension popup UI (main tab manager interface)
- `src/sidepanel/` - Side panel UI
- `src/content/` - Content scripts injected into web pages
- `manifest.config.ts` - Chrome extension manifest configuration

## Chrome Extension Development Notes

- Use `manifest.config.ts` to configure your extension
- The CRXJS plugin automatically handles manifest generation and HMR
- Content scripts should be placed in `src/content/`
- Popup UI should be placed in `src/popup/`
