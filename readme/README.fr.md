<p align="center">
  <img src="https://youran-tab.du-fu.com/logo.png" alt="Youran Tab" width="80" height="80" />
</p>

<h1 align="center">Youran Tab</h1>

<p align="center">
  Une extension de nouvel onglet open source et hautement personnalisable pour Chrome, Edge, Firefox, ainsi que des navigateurs comme 360, QQ Browser et Sogou Browser.
  <br />
  Toutes les données sont stockées localement. Aucun compte n’est requis et aucune information n’est collectée.
  <br /><br />
  <a href="https://youran-tab.du-fu.com/">Site officiel</a>
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

## Thèmes

| Thème | Description |
|-------|-------------|
| Classique | Une grille traditionnelle avec un nombre de colonnes, un espacement, des coins arrondis, une opacité et une taille d’icônes réglables |
| Bento | Une disposition en cartes avec une grille fixe ou adaptative qui comptabilise les clics et agrandit les éléments les plus utilisés |
| Terminal | Une expérience complète en ligne de commande avec 9 palettes de couleurs, 4 styles de curseur et une invite personnalisable |
| Minimal | Supprime tous les éléments superflus et affiche uniquement vos sites |
| Verre | Des cartes translucides en forme de pilule dans une liste horizontale au nombre de colonnes réglable |
| Bulle | Des bulles circulaires flottantes avec placement fixe ou aléatoire et tailles réglables |
| Pixel | Un style pixel rétro avec une barre de recherche façon ligne de commande et des interactions par menus |
| Post-it | Un tableau de notes adhésives avec punaises, papiers colorés et disposition en maçonnerie |

## Fonctionnalités

- Une barre de recherche intégrant les principaux moteurs de recherche et assistants IA. Activez les services nécessaires, choisissez un service par défaut ou changez-en temporairement depuis le début de la barre
- Plusieurs modes d’arrière-plan : couleur unie, dégradé, image et aléatoire, avec des réglages distincts pour les modes clair et sombre
- Un mode sombre qui suit automatiquement le système ou peut être activé manuellement
- 3 sources d’icônes en ligne, le téléversement d’icônes personnalisées et des icônes distinctes pour le mode sombre
- L’importation et l’exportation des configurations de sites au format JSON pour faciliter la migration

## Langues

Prend en charge 10 langues et détecte automatiquement la langue du navigateur :

`简体中文` `繁體中文` `English` `日本語` `한국어` `Español` `Français` `Deutsch` `Русский` `Italiano`

## Technologies

- [Svelte](https://svelte.dev/) — Framework d’interface utilisateur
- [Vite](https://vite.dev/) — Outil de compilation
- [Tailwind CSS](https://tailwindcss.com/) — Framework CSS
- [Bun](https://bun.sh/) — Gestionnaire de paquets et environnement d’exécution

## Développement

```bash
# Installer les dépendances
bun install

# Démarrer le serveur de développement
bun run dev

# Compiler pour Chrome / Edge
bun run build

# Compiler pour Firefox
bun run build:firefox

# Empaqueter toutes les plateformes
bun run release
```

## Compatibilité des navigateurs

| Navigateur | Installation |
|------------|--------------|
| Chrome | [Chrome Web Store](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel) |
| Edge | [Modules complémentaires Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf) |
| Firefox | [Modules complémentaires Firefox](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/) |
| 360, QQ Browser, Sogou Browser, Cheetah Browser et autres | Installation depuis les [Modules complémentaires Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf) ; compatibilité totale |

## Licence

MIT
