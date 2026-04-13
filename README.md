# Ez-UUID 🔑

A Chrome extension that lets you instantly copy Roblox user IDs from anywhere on the site.

## Features
- **Profile pages** — "Copy ID" button injected next to the user's name
- **User cards** — button overlaid on friend cards, search results, etc.
- **Three-dot menus** — "Copy User ID" option injected into Roblox's native dropdown menus
- Toast notification confirms the copy with the actual ID

## Install (unpacked / dev mode)

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select this folder

> Note: You'll need to add placeholder icon PNGs at `icons/icon16.png`, `icons/icon48.png`, `icons/icon128.png` or Chrome will warn about missing icons (the extension will still work).

## How it works

- `manifest.json` — declares permissions and which scripts run on Roblox
- `content.js` — the main logic: finds user IDs in the DOM/URL and injects buttons
- `styles.css` — styling for injected elements and the toast notification

## User ID sources (in order of priority)
1. Page URL (`/users/12345/profile`)
2. `data-userid` / `data-user-id` attributes on DOM elements
3. `meta[name="user-data"]` tag

## Notes
- Roblox is an Angular SPA — the script uses a `MutationObserver` to handle navigation without full page reloads
- Context menu injection watches for dynamically added dropdown elements
