<p align="center">
  <img src="https://youran-tab.du-fu.com/logo.png" alt="Youran Tab" width="80" height="80" />
</p>

<h1 align="center">Youran Tab</h1>

<p align="center">
  Eine quelloffene, umfassend anpassbare Neuer-Tab-Erweiterung für Chrome, Edge, Firefox und Browser wie 360, QQ Browser und Sogou Browser.
  <br />
  Alle Daten werden lokal gespeichert. Es ist kein Konto erforderlich und es werden keine Informationen erfasst.
  <br /><br />
  <a href="https://youran-tab.du-fu.com/">Offizielle Website</a>
  <br /><br />
  <a href="../README.md">English</a> ·
  <a href="./README.zh-CN.md">简体中文</a> ·
  <a href="./README.zh-TW.md">繁體中文</a> ·
  <a href="./README.ja.md">日本語</a> ·
  <a href="./README.ko.md">한국어</a> ·
  <a href="./README.es.md">Español</a> ·
  <a href="./README.fr.md">Français</a> ·
  <a href="./README.de.md">Deutsch</a> ·
  <a href="./README.ru.md">Русский</a> ·
  <a href="./README.it.md">Italiano</a>
</p>

## Installation

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/aghmmgdpejlegikblfffnefbkehjdgel?style=for-the-badge&logo=googlechrome&logoColor=white&label=Chrome)](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel)
[![Edge Add-ons](https://custom-icon-badges.demolab.com/badge/dynamic/json?style=for-the-badge&logo=edge-white&logoColor=white&label=Edge&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fbijgffabnhpieoedkhlfbijmgollbpbf&color=0078D7)](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf)
[![Firefox Add-ons](https://img.shields.io/amo/v/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5?style=for-the-badge&logo=firefoxbrowser&logoColor=white&label=Firefox)](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/)

## Designs

| Design | Beschreibung |
|--------|--------------|
| Klassisch | Traditionelles Rasterlayout mit anpassbarer Spaltenzahl, Abständen, Eckenrundung, Deckkraft und Symbolgröße |
| Bento | Kartenlayout mit festem oder responsivem Raster, das Klicks zählt und häufig verwendete Elemente vergrößert |
| Terminal | Vollständige Kommandozeilenumgebung mit 9 Farbschemata, 4 Cursorstilen und anpassbarer Eingabeaufforderung |
| Minimal | Entfernt alle überflüssigen Elemente und zeigt nur Ihre Websites an |
| Glas | Milchglasartige Pillenkarten in einer horizontalen Liste mit anpassbarer Spaltenzahl |
| Blase | Schwebende kreisförmige Blasen mit fester oder zufälliger Platzierung und anpassbarer Größe |
| Pixel | Retro-Pixelstil mit kommandozeilenähnlichem Suchfeld und menübasierten Interaktionen |
| Notiz | Haftnotiz-Pinnwand mit Reißzwecken, farbigem Papier und Masonry-Layout |

## Funktionen

- Suchfeld mit gängigen Suchmaschinen und KI-Assistenten. Benötigte Dienste lassen sich aktivieren, als Standard festlegen oder vorübergehend am Anfang des Suchfelds wechseln
- Mehrere Hintergrundmodi: Volltonfarbe, Farbverlauf, Bild und Zufall, mit getrennten Einstellungen für den hellen und dunklen Modus
- Dunkler Modus, der automatisch dem System folgt oder manuell umgeschaltet werden kann
- 3 Online-Symbolquellen, Upload eigener Symbole und separate Symbole für den dunklen Modus
- Import und Export von Website-Konfigurationen im JSON-Format für eine einfache Migration

## Sprachen

Unterstützt 10 Sprachen und erkennt automatisch die Browsersprache:

`简体中文` `繁體中文` `English` `日本語` `한국어` `Español` `Français` `Deutsch` `Русский` `Italiano`

## Technologien

- [Svelte](https://svelte.dev/) — UI-Framework
- [Vite](https://vite.dev/) — Build-Werkzeug
- [Tailwind CSS](https://tailwindcss.com/) — CSS-Framework
- [Bun](https://bun.sh/) — Paketmanager und Laufzeitumgebung

## Entwicklung

```bash
# Abhängigkeiten installieren
bun install

# Entwicklungsserver starten
bun run dev

# Für Chrome / Edge erstellen
bun run build

# Für Firefox erstellen
bun run build:firefox

# Alle Plattformen paketieren
bun run release
```

## Browserkompatibilität

| Browser | Installation |
|---------|--------------|
| Chrome | [Chrome Web Store](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel) |
| Edge | [Microsoft Edge-Add-ons](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf) |
| Firefox | [Firefox-Add-ons](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/) |
| 360, QQ Browser, Sogou Browser, Cheetah Browser und weitere | Installation über [Microsoft Edge-Add-ons](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf); vollständig kompatibel |

## Lizenz

MIT
