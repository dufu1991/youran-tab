# 悠然标签页

一款开源、高度可定制的浏览器新标签页扩展，适用于 Chrome、Edge、Firefox 以及 360、QQ、搜狗等国产浏览器。

所有数据存储在本地，无需登录，不收集任何信息。

## 主题

| 主题 | 说明 |
|------|------|
| 经典 | 传统网格布局，可调节列数、间距、圆角、透明度与图标大小 |
| 便当 | 卡片式布局，固定或自适应网格，自动统计点击次数并根据频率放大 |
| 终端 | 完整命令行交互，9 种配色、4 种光标样式、可自定义提示符 |
| 极简 | 去除一切多余元素，只保留站点 |

## 功能

- 12 个搜索引擎，一键切换
- 多种背景模式：纯色、渐变、图片、随机，亮色与暗色独立配置
- 暗色模式，自动跟随系统或手动切换
- 3 种在线图标源，支持自定义上传，暗色模式独立图标
- 站点配置导入导出，JSON 格式，方便迁移

## 多语言

支持 10 种语言，自动检测浏览器语言：

`zh-CN` `zh-TW` `en-US` `ja-JP` `ko-KR` `es-ES` `fr-FR` `de-DE` `ru-RU` `it-IT`

## 技术栈

- [Svelte 5](https://svelte.dev/) — UI 框架
- [Vite 7](https://vite.dev/) — 构建工具
- [Tailwind CSS 4](https://tailwindcss.com/) — 样式框架
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
| Chrome | Chrome 应用商店 |
| Edge | Edge 插件市场 |
| Firefox | Firefox 附加组件 |
| 360、QQ、搜狗、猎豹等 | 通过 Edge 插件市场安装，完全兼容 |

## License

MIT
