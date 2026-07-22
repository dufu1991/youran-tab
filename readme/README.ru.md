<p align="center">
  <img src="https://youran-tab.du-fu.com/logo.png" alt="Youran Tab" width="80" height="80" />
</p>

<h1 align="center">Youran Tab</h1>

<p align="center">
  Расширение новой вкладки с открытым исходным кодом и широкими возможностями настройки для Chrome, Edge, Firefox и таких браузеров, как 360, QQ Browser и Sogou Browser.
  <br />
  Все данные хранятся локально. Учетная запись не требуется, и никакая информация не собирается.
  <br /><br />
  <a href="https://youran-tab.du-fu.com/">Официальный сайт</a>
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

## Установка

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/aghmmgdpejlegikblfffnefbkehjdgel?style=for-the-badge&logo=googlechrome&logoColor=white&label=Chrome)](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel)
[![Edge Add-ons](https://custom-icon-badges.demolab.com/badge/dynamic/json?style=for-the-badge&logo=edge-white&logoColor=white&label=Edge&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fbijgffabnhpieoedkhlfbijmgollbpbf&color=0078D7)](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf)
[![Firefox Add-ons](https://img.shields.io/amo/v/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5?style=for-the-badge&logo=firefoxbrowser&logoColor=white&label=Firefox)](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/)

## Темы

| Тема | Описание |
|------|----------|
| Классика | Традиционная сетка с настраиваемым количеством столбцов, интервалами, скруглением углов, прозрачностью и размером значков |
| Бенто | Карточная компоновка с фиксированной или адаптивной сеткой, которая подсчитывает нажатия и увеличивает часто используемые элементы |
| Терминал | Полноценная командная строка с 9 цветовыми схемами, 4 стилями курсора и настраиваемым приглашением |
| Минимал | Убирает все лишние элементы и оставляет только ваши сайты |
| Стекло | Полупрозрачные карточки-капсулы в горизонтальном списке с настраиваемым количеством столбцов |
| Пузыри | Парящие круглые пузыри с фиксированным или случайным расположением и настраиваемым размером |
| Пиксель | Ретропиксельный стиль со строкой поиска в виде командной строки и взаимодействием через меню |
| Стикер | Доска со стикерами, кнопками, цветной бумагой и плиточной компоновкой |

## Возможности

- Строка поиска с популярными поисковыми системами и ИИ-ассистентами. Можно включить нужные сервисы, выбрать сервис по умолчанию или временно переключить его в начале строки поиска
- Несколько режимов фона: сплошной цвет, градиент, изображение и случайный выбор, с отдельными настройками для светлого и темного режимов
- Темный режим, который автоматически следует системным настройкам или переключается вручную
- 3 онлайн-источника значков, загрузка собственных значков и отдельные значки для темного режима
- Импорт и экспорт настроек сайтов в формате JSON для удобного переноса

## Языки

Поддерживает 10 языков и автоматически определяет язык браузера:

`简体中文` `繁體中文` `English` `日本語` `한국어` `Español` `Français` `Deutsch` `Русский` `Italiano`

## Технологии

- [Svelte](https://svelte.dev/) — UI-фреймворк
- [Vite](https://vite.dev/) — Инструмент сборки
- [Tailwind CSS](https://tailwindcss.com/) — CSS-фреймворк
- [Bun](https://bun.sh/) — Менеджер пакетов и среда выполнения

## Разработка

```bash
# Установить зависимости
bun install

# Запустить сервер разработки
bun run dev

# Собрать для Chrome / Edge
bun run build

# Собрать для Firefox
bun run build:firefox

# Упаковать версии для всех платформ
bun run release
```

## Совместимость с браузерами

| Браузер | Установка |
|---------|-----------|
| Chrome | [Интернет-магазин Chrome](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel) |
| Edge | [Надстройки Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf) |
| Firefox | [Дополнения Firefox](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/) |
| 360, QQ Browser, Sogou Browser, Cheetah Browser и другие | Установка через [Надстройки Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf); полная совместимость |

## Лицензия

MIT
