<p align="center">
  <img src="https://youran-tab.du-fu.com/logo.png" alt="Youran Tab" width="80" height="80" />
</p>

<h1 align="center">Youran Tab</h1>

<p align="center">
  Una extensión de nueva pestaña de código abierto y altamente personalizable para Chrome, Edge, Firefox y navegadores como 360, QQ Browser y Sogou Browser.
  <br />
  Todos los datos se almacenan localmente. No requiere iniciar sesión ni recopila información.
  <br /><br />
  <a href="https://youran-tab.du-fu.com/">Sitio web oficial</a>
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

## Instalación

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/aghmmgdpejlegikblfffnefbkehjdgel?style=for-the-badge&logo=googlechrome&logoColor=white&label=Chrome)](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel)
[![Edge Add-ons](https://custom-icon-badges.demolab.com/badge/dynamic/json?style=for-the-badge&logo=edge-white&logoColor=white&label=Edge&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fbijgffabnhpieoedkhlfbijmgollbpbf&color=0078D7)](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf)
[![Firefox Add-ons](https://img.shields.io/amo/v/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5?style=for-the-badge&logo=firefoxbrowser&logoColor=white&label=Firefox)](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/)

## Temas

| Tema | Descripción |
|------|-------------|
| Clásico | Diseño de cuadrícula tradicional con columnas, espaciado, radio de esquina, opacidad y tamaño de iconos ajustables |
| Bento | Diseño de tarjetas con cuadrícula fija o adaptable que registra los clics y amplía los elementos más utilizados |
| Terminal | Experiencia completa de línea de comandos con 9 esquemas de color, 4 estilos de cursor y un indicador personalizable |
| Mínimo | Elimina todos los elementos innecesarios y muestra únicamente tus sitios |
| Cristal | Tarjetas translúcidas con forma de píldora, dispuestas en una lista horizontal con número de columnas ajustable |
| Burbuja | Burbujas circulares flotantes con posición fija o aleatoria y tamaños ajustables |
| Pixel | Estilo pixelado retro con un cuadro de búsqueda tipo línea de comandos e interacción mediante menús |
| Nota | Tablón de notas adhesivas con chinchetas, papeles de colores y diseño de mampostería |

## Funciones

- Cuadro de búsqueda con los principales motores de búsqueda y asistentes de IA. Activa los servicios que necesites, elige uno predeterminado o cambia temporalmente desde la parte frontal del cuadro
- Varios modos de fondo: color sólido, degradado, imagen y aleatorio, con ajustes independientes para los modos claro y oscuro
- Modo oscuro que sigue automáticamente al sistema o se puede cambiar manualmente
- 3 fuentes de iconos en línea, carga de iconos personalizados e iconos independientes para el modo oscuro
- Importación y exportación de configuraciones de sitios en formato JSON para facilitar la migración

## Idiomas

Admite 10 idiomas y detecta automáticamente el idioma del navegador:

`简体中文` `繁體中文` `English` `日本語` `한국어` `Español` `Français` `Deutsch` `Русский` `Italiano`

## Tecnologías

- [Svelte](https://svelte.dev/) — Framework de interfaz de usuario
- [Vite](https://vite.dev/) — Herramienta de compilación
- [Tailwind CSS](https://tailwindcss.com/) — Framework de CSS
- [Bun](https://bun.sh/) — Gestor de paquetes y entorno de ejecución

## Desarrollo

```bash
# Instalar dependencias
bun install

# Iniciar el servidor de desarrollo
bun run dev

# Compilar para Chrome / Edge
bun run build

# Compilar para Firefox
bun run build:firefox

# Empaquetar todas las plataformas
bun run release
```

## Compatibilidad con navegadores

| Navegador | Instalación |
|-----------|-------------|
| Chrome | [Chrome Web Store](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel) |
| Edge | [Complementos de Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf) |
| Firefox | [Complementos para Firefox](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/) |
| 360, QQ Browser, Sogou Browser, Cheetah Browser y otros | Instalación desde [Complementos de Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf); compatibilidad total |

## Licencia

MIT
