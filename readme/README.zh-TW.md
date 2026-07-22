<p align="center">
  <img src="https://youran-tab.du-fu.com/logo.png" alt="悠然標籤頁" width="80" height="80" />
</p>

<h1 align="center">悠然標籤頁</h1>

<p align="center">
  一款開源且高度可自訂的瀏覽器新分頁擴充功能，適用於 Chrome、Edge、Firefox，以及 360、QQ、搜狗等瀏覽器。
  <br />
  所有資料均儲存在本機，無須登入，也不會收集任何資訊。
  <br /><br />
  <a href="https://youran-tab.du-fu.com/">官方網站</a>
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

## 安裝

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/aghmmgdpejlegikblfffnefbkehjdgel?style=for-the-badge&logo=googlechrome&logoColor=white&label=Chrome)](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel)
[![Edge Add-ons](https://custom-icon-badges.demolab.com/badge/dynamic/json?style=for-the-badge&logo=edge-white&logoColor=white&label=Edge&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fbijgffabnhpieoedkhlfbijmgollbpbf&color=0078D7)](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf)
[![Firefox Add-ons](https://img.shields.io/amo/v/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5?style=for-the-badge&logo=firefoxbrowser&logoColor=white&label=Firefox)](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/)

## 主題

| 主題 | 說明 |
|------|------|
| 經典 | 傳統網格版面，可調整欄數、間距、圓角、透明度與圖示大小 |
| 便當 | 卡片式版面，支援固定或自適應網格，自動統計點擊次數並依使用頻率放大 |
| 終端 | 完整命令列互動，提供 9 種配色、4 種游標樣式和自訂提示符號 |
| 極簡 | 移除所有多餘元素，只保留網站 |
| 玻璃 | 毛玻璃膠囊卡片，採用橫向清單版面，欄數可調 |
| 氣泡 | 圓形氣泡懸浮效果，支援固定排列與隨機散布，大小可調 |
| 像素 | 復古像素風格，提供命令列式搜尋框和選單清單互動 |
| 便箋 | 便利貼公告板風格，帶有圖釘裝飾、彩色紙張和瀑布流版面 |

## 功能

- 搜尋框內建主流搜尋引擎與 AI 問答服務，可依需求啟用、設定預設項目，也可在搜尋框前方暫時切換
- 多種背景模式：純色、漸層、圖片和隨機，亮色與暗色模式可分別設定
- 支援暗色模式，可自動跟隨系統或手動切換
- 提供 3 種線上圖示來源，支援自訂上傳，並可為暗色模式單獨設定圖示
- 支援以 JSON 格式匯入和匯出網站設定，方便移轉

## 多語言

支援 10 種語言，並自動偵測瀏覽器語言：

`简体中文` `繁體中文` `English` `日本語` `한국어` `Español` `Français` `Deutsch` `Русский` `Italiano`

## 技術架構

- [Svelte](https://svelte.dev/) — UI 框架
- [Vite](https://vite.dev/) — 建置工具
- [Tailwind CSS](https://tailwindcss.com/) — CSS 框架
- [Bun](https://bun.sh/) — 套件管理器與執行環境

## 開發

```bash
# 安裝相依套件
bun install

# 啟動開發伺服器
bun run dev

# 建置 Chrome / Edge 版本
bun run build

# 建置 Firefox 版本
bun run build:firefox

# 封裝所有平台
bun run release
```

## 瀏覽器相容性

| 瀏覽器 | 安裝方式 |
|--------|----------|
| Chrome | [Chrome 線上應用程式商店](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel) |
| Edge | [Edge 擴充功能商店](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf) |
| Firefox | [Firefox 附加元件](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/) |
| 360、QQ、搜狗、獵豹等 | 透過 [Edge 擴充功能商店](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf) 安裝，完全相容 |

## 授權條款

MIT
