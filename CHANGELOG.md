# Changelog

All notable changes to this project are documented here.

The format follows the spirit of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses the `package.json` version as the public site version.

## [Unreleased]

### Added
- Added this changelog to make release history and production-impacting changes easier to review.

## [3.0.0] - 2026-05-14

### Added
- Added static site verification via `scripts/verify-content.cjs`, covering prompt/card totals, copy-button parity, duplicate IDs, placeholder links, department badge consistency, and required mobile search markup.
- Added `npm test` and `npm run build` scripts so local development and CI can run the same validation path.
- Added mobile bottom-bar and mobile search modal markup to the production `index.html` entry point.
- Added a screen-reader-only CSS utility used by accessible modal labeling.

### Changed
- Updated the GitHub Pages workflow to install dependencies with `npm ci` and run `npm run build` before uploading the Pages artifact.
- Restored package-level ESM mode and kept the Node verification helper as `.cjs`, avoiding repo-wide module-mode changes while preserving CommonJS compatibility for the verification script.
- Corrected visible department prompt-count badges in `index.html` so they match the actual section contents.
- Replaced dead resource-card placeholder links with relevant in-page destinations and adjusted resource-card copy to avoid promising unavailable downloads or videos.
- Updated README and GitHub setup documentation to reflect the current Lithuanian-only entry point and Actions-based deployment flow.

### Removed
- Removed the duplicate GitHub Pages workflow so deployment has a single source of truth.
- Removed an unused global `window.closeMobileSearch` helper after modal close behavior was wired with standard event listeners.

### Fixed
- Fixed missing repeatable verification that previously caused `npm test` and `npm run build` to fail because those scripts did not exist.
- Fixed mobile quick actions being referenced by docs/scripts but missing from the production HTML.
- Fixed misleading documentation references to a non-existent `index_en.html` file.

## [2.x] - 2026-02-01

### Added
- Added P2 enhanced search, favorites, recently used, lazy-loading, and GitHub Actions deployment work documented in `P2_IMPLEMENTATION.md` and `TODO.md`.
- Added extracted CSS/JavaScript structure under `assets/` for the static prompt collection.

## [1.0.0] - Initial release

### Added
- Added the initial static Lithuanian prompt collection with copy-ready AI tasks for everyday work.
