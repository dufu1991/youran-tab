<p align="center">
  <img src="https://youran-tab.du-fu.com/logo.png" alt="Youran Tab" width="80" height="80" />
</p>

<h1 align="center">Youran Tab</h1>

<p align="center">
  An open-source, highly customizable new tab extension for Chrome, Edge, Firefox, and browsers such as 360, QQ Browser, and Sogou Browser.
  <br />
  All data is stored locally. No account is required, and no information is collected.
  <br /><br />
  <a href="https://youran-tab.du-fu.com/">Official Website</a>
  <br /><br />
  <a href="./README.md">English</a> ·
  <a href="./readme/README.zh-CN.md">简体中文</a> ·
  <a href="./readme/README.zh-TW.md">繁體中文</a> ·
  <a href="./readme/README.ja.md">日本語</a> ·
  <a href="./readme/README.ko.md">한국어</a> ·
  <a href="./readme/README.es.md">Español</a> ·
  <a href="./readme/README.fr.md">Français</a> ·
  <a href="./readme/README.de.md">Deutsch</a> ·
  <a href="./readme/README.ru.md">Русский</a> ·
  <a href="./readme/README.it.md">Italiano</a>
</p>

## Installation

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/aghmmgdpejlegikblfffnefbkehjdgel?style=for-the-badge&logo=googlechrome&logoColor=white&label=Chrome)](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel)
[![Edge Add-ons](https://custom-icon-badges.demolab.com/badge/dynamic/json?style=for-the-badge&logo=edge-white&logoColor=white&label=Edge&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fbijgffabnhpieoedkhlfbijmgollbpbf&color=0078D7)](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf)
[![Firefox Add-ons](https://img.shields.io/amo/v/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5?style=for-the-badge&logo=firefoxbrowser&logoColor=white&label=Firefox)](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/)

## Themes

| Theme | Description |
|-------|-------------|
| Classic | A traditional grid layout with adjustable columns, spacing, corner radius, opacity, and icon size |
| Bento | A card-based layout with fixed or responsive grids that tracks clicks and enlarges frequently used items |
| Terminal | A complete command-line experience with 9 color schemes, 4 cursor styles, and a customizable prompt |
| Minimal | Removes every unnecessary element and displays only your sites |
| Glass | Frosted-glass pill cards in a horizontal list with an adjustable column count |
| Bubble | Floating circular bubbles with fixed or random placement and adjustable sizes |
| Pixel | A retro pixel style with a command-line search box and menu-based interactions |
| Sticky Notes | A sticky-note bulletin board with pushpins, colorful paper, and a masonry layout |

## Features

- A search box with popular search engines and AI assistants. Enable the services you need, choose a default, or switch temporarily from the front of the search box
- Multiple background modes: solid color, gradient, image, and random, with separate settings for light and dark modes
- Dark mode that follows the system automatically or can be switched manually
- 3 online icon sources, custom icon uploads, and separate icons for dark mode
- Import and export site configurations in JSON format for easy migration

## Languages

Supports 10 languages and automatically detects the browser language:

`简体中文` `繁體中文` `English` `日本語` `한국어` `Español` `Français` `Deutsch` `Русский` `Italiano`

## Tech Stack

- [Svelte](https://svelte.dev/) — UI framework
- [Vite](https://vite.dev/) — Build tool
- [Tailwind CSS](https://tailwindcss.com/) — CSS framework
- [Bun](https://bun.sh/) — Package manager and runtime

## Development

```bash
# Install dependencies
bun install

# Start the development server
bun run dev

# Build for Chrome / Edge
bun run build

# Build for Firefox
bun run build:firefox

# Package all platforms
bun run release
```

## Browser Compatibility

| Browser | Installation |
|---------|--------------|
| Chrome | [Chrome Web Store](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel) |
| Edge | [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf) |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/) |
| 360, QQ Browser, Sogou Browser, Cheetah Browser, and others | Install from [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf); fully compatible |

## License

MIT
