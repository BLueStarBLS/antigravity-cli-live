# Change Log

All notable changes to the "antigravity-cli-live" extension will be documented in this file.

## [1.3.0] - 2026-06-02

### Added
- Editor toolbar button with Antigravity brand icon for one-click CLI launch (matching modern AI coding assistant UX patterns like Claude Code)
- Theme-adaptive toolbar icons (light and dark variants)

### Changed
- Refactored terminal creation logic into a shared `terminal.ts` module, eliminating code duplication between `extension.ts` and `cliViewProvider.ts`

## [1.2.0] - 2026-05-29

### Changed
- Updated package dependencies and metadata

## [1.1.0] - 2026-05-26

### Added
- Quick Commands panel in sidebar: send common commands (`/clear`, `/config`, `/context`, `/model`, `/resume`, `/usage`) directly to the active terminal
- Secondary launch button ("Open Terminal in Bottom Panel") in sidebar

## [1.0.0] - 2026-05-25

### Added
- Initial release
- Activity Bar sidebar with one-click CLI launch
- Editor Tab and Bottom Panel terminal placement options
- Configurable CLI command via `antigravity-cli-live.cliCommand` setting
