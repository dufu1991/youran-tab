<p align="center">
  <img src="https://youran-tab.du-fu.com/logo.png" alt="Youran Tab" width="80" height="80" />
</p>

<h1 align="center">Youran Tab</h1>

<p align="center">
  Un’estensione open source e altamente personalizzabile per la pagina Nuova scheda, compatibile con Chrome, Edge, Firefox e browser come 360, QQ Browser e Sogou Browser.
  <br />
  Tutti i dati vengono archiviati localmente. Non è richiesto alcun account e non viene raccolta alcuna informazione.
  <br /><br />
  <a href="https://youran-tab.du-fu.com/">Sito ufficiale</a>
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

## Installazione

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/aghmmgdpejlegikblfffnefbkehjdgel?style=for-the-badge&logo=googlechrome&logoColor=white&label=Chrome)](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel)
[![Edge Add-ons](https://custom-icon-badges.demolab.com/badge/dynamic/json?style=for-the-badge&logo=edge-white&logoColor=white&label=Edge&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fbijgffabnhpieoedkhlfbijmgollbpbf&color=0078D7)](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf)
[![Firefox Add-ons](https://img.shields.io/amo/v/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5?style=for-the-badge&logo=firefoxbrowser&logoColor=white&label=Firefox)](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/)

## Temi

| Tema | Descrizione |
|------|-------------|
| Classico | Griglia tradizionale con numero di colonne, spaziatura, raggio degli angoli, opacità e dimensione delle icone regolabili |
| Bento | Layout a schede con griglia fissa o adattiva che conta i clic e ingrandisce gli elementi usati più spesso |
| Terminale | Esperienza completa da riga di comando con 9 combinazioni di colori, 4 stili del cursore e prompt personalizzabile |
| Minimale | Elimina tutti gli elementi superflui e mostra soltanto i tuoi siti |
| Vetro | Schede traslucide a forma di pillola in un elenco orizzontale con numero di colonne regolabile |
| Bolla | Bolle circolari fluttuanti con disposizione fissa o casuale e dimensioni regolabili |
| Pixel | Stile pixel rétro con casella di ricerca simile a una riga di comando e interazioni tramite menu |
| Nota | Bacheca di note adesive con puntine, fogli colorati e layout masonry |

## Funzionalità

- Una casella di ricerca con i principali motori di ricerca e assistenti IA. Attiva i servizi necessari, scegline uno predefinito o cambialo temporaneamente dalla parte iniziale della casella
- Diverse modalità di sfondo: colore uniforme, sfumatura, immagine e casuale, con impostazioni separate per le modalità chiara e scura
- Modalità scura che segue automaticamente il sistema o può essere attivata manualmente
- 3 fonti di icone online, caricamento di icone personalizzate e icone separate per la modalità scura
- Importazione ed esportazione delle configurazioni dei siti in formato JSON per semplificare la migrazione

## Lingue

Supporta 10 lingue e rileva automaticamente la lingua del browser:

`简体中文` `繁體中文` `English` `日本語` `한국어` `Español` `Français` `Deutsch` `Русский` `Italiano`

## Stack tecnologico

- [Svelte](https://svelte.dev/) — Framework per l’interfaccia utente
- [Vite](https://vite.dev/) — Strumento di build
- [Tailwind CSS](https://tailwindcss.com/) — Framework CSS
- [Bun](https://bun.sh/) — Gestore di pacchetti e ambiente di esecuzione

## Sviluppo

```bash
# Installare le dipendenze
bun install

# Avviare il server di sviluppo
bun run dev

# Creare la build per Chrome / Edge
bun run build

# Creare la build per Firefox
bun run build:firefox

# Creare i pacchetti per tutte le piattaforme
bun run release
```

## Compatibilità con i browser

| Browser | Installazione |
|---------|---------------|
| Chrome | [Chrome Web Store](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel) |
| Edge | [Componenti aggiuntivi di Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf) |
| Firefox | [Componenti aggiuntivi per Firefox](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/) |
| 360, QQ Browser, Sogou Browser, Cheetah Browser e altri | Installazione dai [Componenti aggiuntivi di Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf); piena compatibilità |

## Licenza

MIT
