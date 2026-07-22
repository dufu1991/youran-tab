<p align="center">
  <img src="https://youran-tab.du-fu.com/logo.png" alt="悠然タブ" width="80" height="80" />
</p>

<h1 align="center">悠然タブ</h1>

<p align="center">
  Chrome、Edge、Firefox、および 360、QQ Browser、Sogou Browser などに対応した、オープンソースで高度にカスタマイズ可能な新しいタブ拡張機能です。
  <br />
  すべてのデータはローカルに保存されます。ログインは不要で、情報を収集することもありません。
  <br /><br />
  <a href="https://youran-tab.du-fu.com/">公式サイト</a>
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

## インストール

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/aghmmgdpejlegikblfffnefbkehjdgel?style=for-the-badge&logo=googlechrome&logoColor=white&label=Chrome)](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel)
[![Edge Add-ons](https://custom-icon-badges.demolab.com/badge/dynamic/json?style=for-the-badge&logo=edge-white&logoColor=white&label=Edge&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fbijgffabnhpieoedkhlfbijmgollbpbf&color=0078D7)](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf)
[![Firefox Add-ons](https://img.shields.io/amo/v/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5?style=for-the-badge&logo=firefoxbrowser&logoColor=white&label=Firefox)](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/)

## テーマ

| テーマ | 説明 |
|--------|------|
| クラシック | 列数、間隔、角丸、透明度、アイコンサイズを調整できる従来型のグリッドレイアウト |
| ベントー | 固定またはレスポンシブなグリッドを選べるカードレイアウト。クリック数を自動集計し、使用頻度に応じて項目を拡大 |
| ターミナル | 9 種類の配色、4 種類のカーソルスタイル、カスタマイズ可能なプロンプトを備えた完全なコマンドライン操作 |
| ミニマル | 不要な要素をすべて取り除き、サイトだけを表示 |
| グラス | 列数を調整できる横並びのすりガラス風ピル型カード |
| バブル | 固定配置またはランダム配置を選べ、サイズも調整できる円形のフローティングバブル |
| ピクセル | コマンドライン風の検索ボックスとメニュー操作を備えたレトロなピクセルスタイル |
| ふせん | 画びょう、カラフルな紙、メイソンリーレイアウトを使った付箋掲示板スタイル |

## 機能

- 主要な検索エンジンと AI アシスタントを内蔵した検索ボックス。必要なサービスを有効にしてデフォルトを選択でき、検索ボックスの先頭から一時的に切り替えることも可能
- 単色、グラデーション、画像、ランダムの複数の背景モード。ライトモードとダークモードを個別に設定可能
- システムに自動追従するか手動で切り替えられるダークモード
- 3 種類のオンラインアイコンソース、カスタムアイコンのアップロード、ダークモード専用アイコンに対応
- サイト設定を JSON 形式でインポートおよびエクスポートし、簡単に移行可能

## 対応言語

10 言語に対応し、ブラウザの言語を自動検出します：

`简体中文` `繁體中文` `English` `日本語` `한국어` `Español` `Français` `Deutsch` `Русский` `Italiano`

## 技術スタック

- [Svelte](https://svelte.dev/) — UI フレームワーク
- [Vite](https://vite.dev/) — ビルドツール
- [Tailwind CSS](https://tailwindcss.com/) — CSS フレームワーク
- [Bun](https://bun.sh/) — パッケージマネージャー兼ランタイム

## 開発

```bash
# 依存関係をインストール
bun install

# 開発サーバーを起動
bun run dev

# Chrome / Edge 向けにビルド
bun run build

# Firefox 向けにビルド
bun run build:firefox

# すべてのプラットフォーム向けにパッケージ化
bun run release
```

## ブラウザ互換性

| ブラウザ | インストール方法 |
|----------|------------------|
| Chrome | [Chrome ウェブストア](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel) |
| Edge | [Microsoft Edge アドオン](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf) |
| Firefox | [Firefox アドオン](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/) |
| 360、QQ Browser、Sogou Browser、Cheetah Browser など | [Microsoft Edge アドオン](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf) からインストール可能。完全対応 |

## ライセンス

MIT
