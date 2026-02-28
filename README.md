<p align="center">
  <img src="https://youran-tab.du-fu.com/logo.png" alt="悠然标签页" width="80" height="80" />
</p>

<h1 align="center">悠然标签页</h1>

<p align="center">
  一款开源、高度可定制的浏览器新标签页扩展，适用于 Chrome、Edge、Firefox 以及 360、QQ、搜狗等国产浏览器。
  <br />
  所有数据存储在本地，无需登录，不收集任何信息。
  <br /><br />
  <a href="https://youran-tab.du-fu.com/">官网</a>
</p>

## 安装

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/TODO?style=for-the-badge&logo=googlechrome&logoColor=white&label=Chrome)](https://chromewebstore.google.com/detail/TODO)
[![Edge Add-ons](https://img.shields.io/badge/dynamic/json?style=for-the-badge&logo=microsoftedge&logoColor=white&label=Edge&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2FTODO)](https://microsoftedge.microsoft.com/addons/detail/TODO)
[![Firefox Add-ons](https://img.shields.io/amo/v/TODO?style=for-the-badge&logo=firefoxbrowser&logoColor=white&label=Firefox)](https://addons.mozilla.org/firefox/addon/TODO/)

## 主题

| 主题 | 说明 |
|------|------|
| 经典 | 传统网格布局，可调节列数、间距、圆角、透明度与图标大小 |
| 便当 | 卡片式布局，固定或自适应网格，自动统计点击次数并根据频率放大 |
| 终端 | 完整命令行交互，9 种配色、4 种光标样式、可自定义提示符 |
| 极简 | 去除一切多余元素，只保留站点 |
| 玻璃 | 毛玻璃药丸卡片，横向列表布局，列数可调 |
| 气泡 | 圆形气泡悬浮效果，支持固定排列与随机散布，大小可调 |
| 像素 | 像素复古风格，命令行式搜索框，菜单列表交互 |
| 便签 | 便利贴公告板风格，图钉装饰，彩色纸张，瀑布流布局 |

## 功能

- 8 个搜索引擎，一键切换
- 多种背景模式：纯色、渐变、图片、随机，亮色与暗色独立配置
- 暗色模式，自动跟随系统或手动切换
- 3 种在线图标源，支持自定义上传，暗色模式独立图标
- 站点配置导入导出，JSON 格式，方便迁移

## 多语言

支持 10 种语言，自动检测浏览器语言：

`简体中文` `繁體中文` `English` `日本語` `한국어` `Español` `Français` `Deutsch` `Русский` `Italiano`

## 技术栈

- [Svelte](https://svelte.dev/) — UI 框架
- [Vite](https://vite.dev/) — 构建工具
- [Tailwind](https://tailwindcss.com/) — 样式框架
- [Bun](https://bun.sh/) — 包管理与运行时

## 开发

```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev

# 构建 Chrome / Edge
bun run build

# 构建 Firefox
bun run build:firefox

# 打包全部平台
bun run release
```

## 浏览器兼容

| 浏览器 | 安装方式 |
|--------|----------|
| Chrome | [Chrome 应用商店](https://chromewebstore.google.com/detail/TODO) |
| Edge | [Edge 插件市场](https://microsoftedge.microsoft.com/addons/detail/TODO) |
| Firefox | [Firefox 附加组件](https://addons.mozilla.org/firefox/addon/TODO/) |
| 360、QQ、搜狗、猎豹等 | 通过 [Edge 插件市场](https://microsoftedge.microsoft.com/addons/detail/TODO) 安装，完全兼容 |

## License

MIT
