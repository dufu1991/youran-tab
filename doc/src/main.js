import './style.css';

const supportedLocales = ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'es-ES', 'ru-RU', 'fr-FR', 'de-DE', 'it-IT'];
const fallbackLocale = 'zh-CN';
const storageKeyLocale = 'doc_locale';
const localeNames = {
    'en-US': 'English',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'ja-JP': '日本語',
    'ko-KR': '한국어',
    'es-ES': 'Español',
    'ru-RU': 'Русский',
    'fr-FR': 'Français',
    'de-DE': 'Deutsch',
    'it-IT': 'Italiano',
};

const messages = {
    'en-US': {
        'site.title': 'Youran Tab - Customizable New Tab',
        'site.description':
            'Youran Tab is an open-source, highly customizable new tab extension with multiple themes, backgrounds, and layouts.',
        'lang.label': 'Language',
        'lang.auto': 'Follow browser',
        'hero.badge': 'Works with Chrome / Edge / Firefox',
        'hero.compat':
            'Domestic browsers like 360, QQ, Sogou, and Liebao can install directly from the Edge Add-ons store — fully compatible.',
        'hero.title': 'Youran Tab',
        'hero.desc':
            'An open-source, highly customizable new tab extension.<br />4 themes, 10 languages, and multiple backgrounds to create your own start page.',
        'themes.title': '4 themes, switch anytime',
        'themes.subtitle': 'Each theme has its own set of options to fit different workflows.',
        'themes.classic.title': 'Classic',
        'themes.classic.desc':
            'Traditional grid layout with adjustable columns, spacing, radius, opacity, and icon size. A clean and practical default.',
        'themes.bento.title': 'Bento',
        'themes.bento.desc':
            'Card layout inspired by macOS widgets. Supports fixed or adaptive grids, auto click statistics, and auto enlargement based on click count.',
        'themes.terminal.title': 'Terminal',
        'themes.terminal.desc': 'Full command-line experience. 9 color schemes, 4 cursor styles, and customizable prompts for power users.',
        'themes.minimal.title': 'Minimal',
        'themes.minimal.desc': 'Remove all distractions and keep only sites. Clean, focused, and calm.',
        'features.title': 'Powerful features, lightweight',
        'features.subtitle': 'Fully open source. All data stays local. No accounts, no tracking.',
        'features.search.title': '12 search engines',
        'features.search.desc': 'Google, Bing, Baidu, DuckDuckGo, Perplexity, and more. Switch with one click.',
        'features.background.title': 'Multiple backgrounds',
        'features.background.desc': 'Solid, gradient, image, random. Separate settings for light and dark.',
        'features.dark.title': 'Dark mode',
        'features.dark.desc': 'Follow system or switch light / dark manually.',
        'features.languages.title': '10 languages',
        'features.languages.desc':
            'Chinese, English, Japanese, Korean, French, German, Spanish, Russian, Italian. Auto-detects system language.',
        'features.icons.title': 'Flexible icons',
        'features.icons.desc': '3 online icon sources, custom uploads, and separate dark-mode icons.',
        'features.sync.title': 'Import & export',
        'features.sync.desc': 'Export site settings as JSON and migrate to other devices in one click.',
        'terminal.title': 'Terminal theme, power user feel',
        'terminal.desc':
            'Manage everything with commands. Add sites, switch themes, and search the web — all from the keyboard. Arrow-key selection for quick control.',
        'terminal.cmd.ls': 'List all sites',
        'terminal.cmd.add': 'Add a new site',
        'terminal.cmd.search': 'Search the web',
        'terminal.cmd.theme': 'Switch theme',
        'terminal.cmd.color': 'Switch color scheme',
        'terminal.cmd.export': 'Export site list',
        'terminal.mock.added': 'Added: YouTube',
        'tech.title': 'Modern stack',
        'tech.subtitle': 'Lightweight, high performance, zero-runtime dependencies.',
        'cta.title': 'Get started',
        'cta.subtitle': 'Free and open source. Install and use immediately — no sign-up. All data stays local.',
        'footer.name': 'Youran Tab',
    },
    'zh-CN': {
        'site.title': '悠然标签页 - 可定制的浏览器新标签页',
        'site.description': '悠然标签页：一款开源且高度可定制的浏览器新标签页扩展，支持多种主题、背景和布局。',
        'lang.label': '语言',
        'lang.auto': '跟随浏览器',
        'hero.badge': '适用于 Chrome、Edge、Firefox',
        'hero.compat': '360、QQ、搜狗、360 极速、猎豹等国产浏览器可通过 Edge 插件市场直接安装，完全兼容。',
        'hero.title': '悠然标签页',
        'hero.desc': '一款开源、高度可定制的浏览器新标签页扩展。<br />4 种主题、10 种语言、多种背景，打造专属你的浏览器起始页。',
        'themes.title': '4 种主题，随心切换',
        'themes.subtitle': '每种主题都有独立的配置项，满足不同使用习惯。',
        'themes.classic.title': '经典',
        'themes.classic.desc': '传统网格布局，可调节列数、间距、圆角、透明度和图标大小。简洁实用的默认选择。',
        'themes.bento.title': '便当',
        'themes.bento.desc': '类似 macOS 小组件的卡片式布局，支持固定或自适应网格，自动统计点击次数，并根据点击次数自动放大。',
        'themes.terminal.title': '终端',
        'themes.terminal.desc': '完整的命令行交互体验。9 种配色、4 种光标样式、可自定义提示符，极客的选择。',
        'themes.minimal.title': '极简',
        'themes.minimal.desc': '去除一切多余元素，只保留站点。干净、专注、无干扰。',
        'features.title': '功能丰富，轻量运行',
        'features.subtitle': '完全开源，所有数据存储在本地，无需登录，不收集任何信息。',
        'features.search.title': '12 个搜索引擎',
        'features.search.desc': 'Google、Bing、百度、DuckDuckGo、Perplexity 等，一键切换。',
        'features.background.title': '多种背景',
        'features.background.desc': '纯色、渐变、图片、随机，亮色暗色独立配置。',
        'features.dark.title': '暗色模式',
        'features.dark.desc': '自动跟随系统，也可手动切换亮色或暗色。',
        'features.languages.title': '10 种语言',
        'features.languages.desc': '中、英、日、韩、法、德、西、俄、意大利语，自动检测系统语言。',
        'features.icons.title': '图标灵活',
        'features.icons.desc': '3 种在线图标源，支持自定义上传，暗色模式独立图标。',
        'features.sync.title': '导入导出',
        'features.sync.desc': '一键导出站点配置为 JSON，轻松迁移到其他设备。',
        'terminal.title': '终端主题，极客体验',
        'terminal.desc': '输入命令管理一切。添加站点、切换主题、搜索网页，全部通过键盘完成。支持方向键交互选择，高效直觉。',
        'terminal.cmd.ls': '列出所有站点',
        'terminal.cmd.add': '添加新站点',
        'terminal.cmd.search': '搜索网页',
        'terminal.cmd.theme': '切换主题',
        'terminal.cmd.color': '切换配色方案',
        'terminal.cmd.export': '导出站点列表',
        'terminal.mock.added': '已添加：YouTube',
        'tech.title': '现代技术栈',
        'tech.subtitle': '轻量、高性能、零依赖运行时。',
        'cta.title': '开始使用',
        'cta.subtitle': '开源免费，安装后即可使用，无需注册，所有数据保存在本地。',
        'footer.name': '悠然标签页',
    },
    'zh-TW': {
        'site.title': '悠然標籤頁 - 可自訂的瀏覽器新標籤頁',
        'site.description': '悠然標籤頁：一款開源且高度可自訂的瀏覽器新標籤頁擴充功能，支援多種主題、背景和版面。',
        'lang.label': '語言',
        'lang.auto': '跟隨瀏覽器',
        'hero.badge': '適用於 Chrome、Edge、Firefox',
        'hero.compat': '360、QQ、搜狗、360 極速、獵豹等國產瀏覽器可透過 Edge 擴充功能市場直接安裝，完全相容。',
        'hero.title': '悠然標籤頁',
        'hero.desc': '一款開源、高度可自訂的瀏覽器新標籤頁擴充功能。<br />4 種主題、10 種語言、多種背景，打造專屬你的瀏覽器起始頁。',
        'themes.title': '4 種主題，隨心切換',
        'themes.subtitle': '每種主題都有獨立的設定項，滿足不同使用習慣。',
        'themes.classic.title': '經典',
        'themes.classic.desc': '傳統網格版面，可調整欄數、間距、圓角、透明度和圖示大小。簡潔實用的預設選擇。',
        'themes.bento.title': '便當',
        'themes.bento.desc': '類似 macOS 小工具的卡片式版面，支援固定或自適應網格，自動統計點擊次數，並根據點擊次數自動放大。',
        'themes.terminal.title': '終端',
        'themes.terminal.desc': '完整的命令列互動體驗。9 種配色、4 種游標樣式、可自訂提示符號，極客的選擇。',
        'themes.minimal.title': '極簡',
        'themes.minimal.desc': '移除所有多餘元素，只保留站點。乾淨、專注、無干擾。',
        'features.title': '功能豐富，輕量運行',
        'features.subtitle': '完全開源，所有資料儲存在本地，無需登入，不蒐集任何資訊。',
        'features.search.title': '12 個搜尋引擎',
        'features.search.desc': 'Google、Bing、百度、DuckDuckGo、Perplexity 等，一鍵切換。',
        'features.background.title': '多種背景',
        'features.background.desc': '純色、漸層、圖片、隨機，亮色暗色獨立設定。',
        'features.dark.title': '暗色模式',
        'features.dark.desc': '自動跟隨系統，也可手動切換亮色或暗色。',
        'features.languages.title': '10 種語言',
        'features.languages.desc': '中、英、日、韓、法、德、西、俄、義大利語，自動偵測系統語言。',
        'features.icons.title': '圖示靈活',
        'features.icons.desc': '3 種線上圖示來源，支援自訂上傳，暗色模式獨立圖示。',
        'features.sync.title': '匯入匯出',
        'features.sync.desc': '一鍵匯出站點設定為 JSON，輕鬆遷移到其他裝置。',
        'terminal.title': '終端主題，極客體驗',
        'terminal.desc': '輸入命令管理一切。新增站點、切換主題、搜尋網頁，全部透過鍵盤完成。支援方向鍵互動選擇，高效直覺。',
        'terminal.cmd.ls': '列出所有站點',
        'terminal.cmd.add': '新增站點',
        'terminal.cmd.search': '搜尋網頁',
        'terminal.cmd.theme': '切換主題',
        'terminal.cmd.color': '切換配色方案',
        'terminal.cmd.export': '匯出站點列表',
        'terminal.mock.added': '已新增：YouTube',
        'tech.title': '現代技術堆疊',
        'tech.subtitle': '輕量、高效能、零依賴執行環境。',
        'cta.title': '開始使用',
        'cta.subtitle': '開源免費，安裝後即可使用，無需註冊，所有資料保存在本地。',
        'footer.name': '悠然標籤頁',
    },
    'ja-JP': {
        'site.title': '悠然タブ - カスタマイズ可能な新しいタブ',
        'site.description':
            '悠然タブは、複数のテーマ、背景、レイアウトを備えたオープンソースで高いカスタマイズ性の新しいタブ拡張機能です。',
        'lang.label': '言語',
        'lang.auto': 'ブラウザに従う',
        'hero.badge': 'Chrome / Edge / Firefox に対応',
        'hero.compat': '360、QQ、Sogou、Liebao などの中国製ブラウザは Edge アドオンストアから直接インストールできます。完全互換。',
        'hero.title': '悠然タブ',
        'hero.desc':
            'オープンソースで高いカスタマイズ性の新しいタブ拡張機能。<br />4 つのテーマ、10 言語、複数の背景で、あなただけのスタートページを作成。',
        'themes.title': '4 つのテーマを自由に切り替え',
        'themes.subtitle': '各テーマに独立した設定があり、用途に合わせて調整できます。',
        'themes.classic.title': 'クラシック',
        'themes.classic.desc':
            '伝統的なグリッドレイアウト。列数、間隔、角丸、透明度、アイコンサイズを調整可能。シンプルで実用的な既定の選択。',
        'themes.bento.title': 'Bento',
        'themes.bento.desc':
            'macOS ウィジェットに似たカード型レイアウト。固定または自動調整グリッドに対応し、クリック回数を自動集計して自動拡大。',
        'themes.terminal.title': 'ターミナル',
        'themes.terminal.desc': '本格的なコマンドライン体験。9 色の配色、4 種類のカーソル、プロンプトをカスタマイズ可能。',
        'themes.minimal.title': 'ミニマル',
        'themes.minimal.desc': '余計な要素を排除し、サイトだけを表示。クリーンで集中できます。',
        'features.title': '豊富な機能、軽量動作',
        'features.subtitle': '完全にオープンソース。すべてのデータはローカルに保存され、ログイン不要、情報収集なし。',
        'features.search.title': '12 の検索エンジン',
        'features.search.desc': 'Google、Bing、百度、DuckDuckGo、Perplexity など。ワンクリックで切り替え。',
        'features.background.title': '多彩な背景',
        'features.background.desc': '単色、グラデーション、画像、ランダム。ライト / ダークを個別設定。',
        'features.dark.title': 'ダークモード',
        'features.dark.desc': 'システムに自動追従、または手動でライト / ダークを切り替え。',
        'features.languages.title': '10 言語',
        'features.languages.desc':
            '中国語、英語、日本語、韓国語、フランス語、ドイツ語、スペイン語、ロシア語、イタリア語に対応。システム言語を自動検出。',
        'features.icons.title': '柔軟なアイコン',
        'features.icons.desc': '3 つのオンラインアイコンソース、カスタムアップロード、ダークモード専用アイコンに対応。',
        'features.sync.title': 'インポート / エクスポート',
        'features.sync.desc': 'サイト設定を JSON でエクスポートし、他の端末へ簡単移行。',
        'terminal.title': 'ターミナルテーマ、こだわりの体験',
        'terminal.desc': 'コマンドで一括管理。サイト追加、テーマ切替、Web 検索をすべてキーボードで。方向キーで選択でき、操作も直感的。',
        'terminal.cmd.ls': 'サイト一覧を表示',
        'terminal.cmd.add': '新しいサイトを追加',
        'terminal.cmd.search': 'Web を検索',
        'terminal.cmd.theme': 'テーマを切り替え',
        'terminal.cmd.color': '配色を切り替え',
        'terminal.cmd.export': 'サイト一覧をエクスポート',
        'terminal.mock.added': '追加済み：YouTube',
        'tech.title': 'モダンスタック',
        'tech.subtitle': '軽量・高性能・ランタイム依存なし。',
        'cta.title': '始めよう',
        'cta.subtitle': '無料でオープンソース。インストール後すぐに使えます。登録不要で、すべてのデータはローカルに保存。',
        'footer.name': '悠然タブ',
    },
    'ko-KR': {
        'site.title': 'Youran Tab - 맞춤형 새 탭',
        'site.description': 'Youran Tab 은 여러 테마, 배경, 레이아웃을 지원하는 오픈 소스 고급 맞춤형 새 탭 확장 프로그램입니다.',
        'lang.label': '언어',
        'lang.auto': '브라우저 언어 따르기',
        'hero.badge': 'Chrome / Edge / Firefox 지원',
        'hero.compat': '360, QQ, Sogou, Liebao 등의 중국 브라우저는 Edge 추가 기능 스토어에서 직접 설치할 수 있으며, 완벽하게 호환됩니다.',
        'hero.title': 'Youran Tab',
        'hero.desc':
            '오픈 소스 고급 맞춤형 새 탭 확장 프로그램입니다.<br />4 가지 테마, 10 개 언어, 다양한 배경으로 나만의 시작 페이지를 만드세요.',
        'themes.title': '4 가지 테마, 자유롭게 전환',
        'themes.subtitle': '각 테마는 독립적인 옵션을 제공해 다양한 사용 습관에 맞출 수 있습니다.',
        'themes.classic.title': '클래식',
        'themes.classic.desc':
            '전통적인 그리드 레이아웃. 열 수, 간격, 라운드, 투명도, 아이콘 크기를 조정할 수 있습니다. 깔끔하고 실용적인 기본 선택.',
        'themes.bento.title': '벤토',
        'themes.bento.desc':
            'macOS 위젯 스타일 카드 레이아웃. 고정 또는 반응형 그리드를 지원하며 클릭 횟수를 자동 집계하고 자동으로 확대합니다.',
        'themes.terminal.title': '터미널',
        'themes.terminal.desc': '완전한 커맨드 라인 경험. 9 가지 색상, 4 가지 커서 스타일, 프롬프트를 자유롭게 설정.',
        'themes.minimal.title': '미니멀',
        'themes.minimal.desc': '불필요한 요소를 제거하고 사이트만 표시합니다. 깔끔하고 집중할 수 있습니다.',
        'features.title': '풍부한 기능, 가벼운 실행',
        'features.subtitle': '완전 오픈 소스. 모든 데이터는 로컬에 저장되며 로그인이나 추적이 없습니다.',
        'features.search.title': '12 개 검색 엔진',
        'features.search.desc': 'Google, Bing, Baidu, DuckDuckGo, Perplexity 등. 한 번의 클릭으로 전환.',
        'features.background.title': '다양한 배경',
        'features.background.desc': '단색, 그라데이션, 이미지, 랜덤. 라이트 / 다크를 각각 설정.',
        'features.dark.title': '다크 모드',
        'features.dark.desc': '시스템을 자동으로 따르거나 라이트 / 다크를 수동으로 전환.',
        'features.languages.title': '10 개 언어',
        'features.languages.desc':
            '중국어, 영어, 일본어, 한국어, 프랑스어, 독일어, 스페인어, 러시아어, 이탈리아어 지원. 시스템 언어 자동 감지.',
        'features.icons.title': '아이콘 유연성',
        'features.icons.desc': '3 가지 온라인 아이콘 소스, 사용자 업로드, 다크 모드 전용 아이콘 지원.',
        'features.sync.title': '가져오기 / 내보내기',
        'features.sync.desc': '사이트 설정을 JSON 으로 내보내고 다른 기기로 쉽게 이동.',
        'terminal.title': '터미널 테마, 파워 사용자 경험',
        'terminal.desc':
            '명령으로 모든 것을 관리합니다. 사이트 추가, 테마 전환, 웹 검색을 모두 키보드로 수행. 방향키 선택을 지원해 빠르고 직관적입니다.',
        'terminal.cmd.ls': '모든 사이트 목록',
        'terminal.cmd.add': '새 사이트 추가',
        'terminal.cmd.search': '웹 검색',
        'terminal.cmd.theme': '테마 전환',
        'terminal.cmd.color': '색상 스킴 전환',
        'terminal.cmd.export': '사이트 목록 내보내기',
        'terminal.mock.added': '추가됨: YouTube',
        'tech.title': '모던 스택',
        'tech.subtitle': '가볍고 고성능, 런타임 의존성 없음.',
        'cta.title': '시작하기',
        'cta.subtitle': '무료 오픈 소스. 설치 후 바로 사용 가능하며 가입이 필요 없습니다. 모든 데이터는 로컬에 저장됩니다.',
        'footer.name': 'Youran Tab',
    },
    'es-ES': {
        'site.title': 'Youran Tab - Nueva pestaña personalizable',
        'site.description':
            'Youran Tab es una extensión de nueva pestaña de código abierto y altamente personalizable, con múltiples temas, fondos y diseños.',
        'lang.label': 'Idioma',
        'lang.auto': 'Seguir navegador',
        'hero.badge': 'Compatible con Chrome / Edge / Firefox',
        'hero.compat':
            'Navegadores como 360, QQ, Sogou y Liebao pueden instalar directamente desde la tienda de complementos de Edge, totalmente compatibles.',
        'hero.title': 'Youran Tab',
        'hero.desc':
            'Una extensión de nueva pestaña de código abierto y altamente personalizable.<br />4 temas, 10 idiomas y múltiples fondos para crear tu página de inicio.',
        'themes.title': '4 temas, cambia cuando quieras',
        'themes.subtitle': 'Cada tema tiene opciones independientes para adaptarse a distintos hábitos.',
        'themes.classic.title': 'Clásico',
        'themes.classic.desc':
            'Diseño de cuadrícula tradicional con columnas, espaciado, radio, opacidad y tamaño de iconos ajustables. Una opción predeterminada limpia y práctica.',
        'themes.bento.title': 'Bento',
        'themes.bento.desc':
            'Diseño de tarjetas inspirado en los widgets de macOS. Soporta cuadrícula fija o adaptativa, cuenta clics automáticamente y amplía según el número de clics.',
        'themes.terminal.title': 'Terminal',
        'themes.terminal.desc':
            'Experiencia completa de línea de comandos. 9 esquemas de color, 4 estilos de cursor y prompt personalizable.',
        'themes.minimal.title': 'Minimal',
        'themes.minimal.desc': 'Elimina todo lo extra y deja solo los sitios. Limpio, enfocado y sin distracciones.',
        'features.title': 'Funciones potentes, ejecución ligera',
        'features.subtitle': 'Totalmente de código abierto. Todos los datos se guardan localmente. Sin cuentas ni seguimiento.',
        'features.search.title': '12 motores de búsqueda',
        'features.search.desc': 'Google, Bing, Baidu, DuckDuckGo, Perplexity y más. Cambia con un clic.',
        'features.background.title': 'Múltiples fondos',
        'features.background.desc': 'Color sólido, degradado, imagen, aleatorio. Configuración separada para claro y oscuro.',
        'features.dark.title': 'Modo oscuro',
        'features.dark.desc': 'Sigue al sistema o cambia manualmente entre claro / oscuro.',
        'features.languages.title': '10 idiomas',
        'features.languages.desc':
            'Chino, inglés, japonés, coreano, francés, alemán, español, ruso, italiano. Detección automática del idioma del sistema.',
        'features.icons.title': 'Iconos flexibles',
        'features.icons.desc': '3 fuentes de iconos en línea, carga personalizada y iconos separados para modo oscuro.',
        'features.sync.title': 'Importar y exportar',
        'features.sync.desc': 'Exporta la configuración de sitios como JSON y migra a otros dispositivos con un clic.',
        'terminal.title': 'Tema terminal, experiencia geek',
        'terminal.desc':
            'Gestiona todo con comandos. Añade sitios, cambia temas y busca en la web desde el teclado. Selección con flechas para un control rápido.',
        'terminal.cmd.ls': 'Listar todos los sitios',
        'terminal.cmd.add': 'Agregar nuevo sitio',
        'terminal.cmd.search': 'Buscar en la web',
        'terminal.cmd.theme': 'Cambiar tema',
        'terminal.cmd.color': 'Cambiar esquema de color',
        'terminal.cmd.export': 'Exportar lista de sitios',
        'terminal.mock.added': 'Añadido: YouTube',
        'tech.title': 'Stack moderno',
        'tech.subtitle': 'Ligero, alto rendimiento y sin dependencias de runtime.',
        'cta.title': 'Empezar',
        'cta.subtitle': 'Gratis y de código abierto. Instala y usa al instante, sin registro. Todos los datos quedan en local.',
        'footer.name': 'Youran Tab',
    },
    'ru-RU': {
        'site.title': 'Youran Tab — настраиваемая новая вкладка',
        'site.description':
            'Youran Tab — это расширение новой вкладки с открытым исходным кодом и высокой настраиваемостью, с множеством тем, фонов и макетов.',
        'lang.label': 'Язык',
        'lang.auto': 'Язык браузера',
        'hero.badge': 'Подходит для Chrome / Edge / Firefox',
        'hero.compat':
            'Браузеры 360, QQ, Sogou, Liebao и другие могут устанавливать расширения прямо из магазина Edge — полная совместимость.',
        'hero.title': 'Youran Tab',
        'hero.desc':
            'Расширение новой вкладки с открытым исходным кодом и высокой настраиваемостью.<br />4 темы, 10 языков и несколько фонов для вашей стартовой страницы.',
        'themes.title': '4 темы, переключайтесь как угодно',
        'themes.subtitle': 'У каждой темы собственные настройки под разные сценарии.',
        'themes.classic.title': 'Классика',
        'themes.classic.desc':
            'Традиционная сетка с настройкой колонок, отступов, скругления, прозрачности и размера иконок. Практичный вариант по умолчанию.',
        'themes.bento.title': 'Бенто',
        'themes.bento.desc':
            'Карточный макет в стиле виджетов macOS. Поддерживает фиксированную или адаптивную сетку, автоматически считает клики и увеличивает по числу кликов.',
        'themes.terminal.title': 'Терминал',
        'themes.terminal.desc': 'Полноценный командный интерфейс. 9 цветовых схем, 4 вида курсора и настраиваемый промпт.',
        'themes.minimal.title': 'Минимал',
        'themes.minimal.desc': 'Убирает все лишнее и оставляет только сайты. Чисто, сфокусировано, без отвлекающих деталей.',
        'features.title': 'Много функций, лёгкая работа',
        'features.subtitle': 'Полностью open source. Все данные хранятся локально. Без аккаунтов и трекинга.',
        'features.search.title': '12 поисковых систем',
        'features.search.desc': 'Google, Bing, Baidu, DuckDuckGo, Perplexity и другие. Переключение в один клик.',
        'features.background.title': 'Разные фоны',
        'features.background.desc': 'Однотонный, градиент, изображение, случайный. Раздельные настройки для светлой и тёмной темы.',
        'features.dark.title': 'Тёмный режим',
        'features.dark.desc': 'Следует системе или ручное переключение светлый / тёмный.',
        'features.languages.title': '10 языков',
        'features.languages.desc':
            'Китайский, английский, японский, корейский, французский, немецкий, испанский, русский, итальянский. Автоопределение языка системы.',
        'features.icons.title': 'Гибкие иконки',
        'features.icons.desc': '3 онлайн-источника иконок, загрузка своих и отдельные иконки для тёмного режима.',
        'features.sync.title': 'Импорт и экспорт',
        'features.sync.desc': 'Экспорт настроек сайтов в JSON и перенос на другие устройства в один клик.',
        'terminal.title': 'Тема терминала, опыт для гиков',
        'terminal.desc':
            'Управляйте всем командами. Добавляйте сайты, меняйте темы и ищите в сети с клавиатуры. Выбор стрелками для быстрого управления.',
        'terminal.cmd.ls': 'Список всех сайтов',
        'terminal.cmd.add': 'Добавить новый сайт',
        'terminal.cmd.search': 'Поиск в сети',
        'terminal.cmd.theme': 'Сменить тему',
        'terminal.cmd.color': 'Сменить схему цветов',
        'terminal.cmd.export': 'Экспорт списка сайтов',
        'terminal.mock.added': 'Добавлено: YouTube',
        'tech.title': 'Современный стек',
        'tech.subtitle': 'Лёгкий, быстрый, без зависимостей рантайма.',
        'cta.title': 'Начать',
        'cta.subtitle': 'Бесплатно и с открытым исходным кодом. Установка и использование сразу, без регистрации. Все данные локально.',
        'footer.name': 'Youran Tab',
    },
    'fr-FR': {
        'site.title': 'Youran Tab - Nouvel onglet personnalisable',
        'site.description':
            'Youran Tab est une extension de nouvel onglet open source et hautement personnalisable, avec plusieurs thèmes, fonds et mises en page.',
        'lang.label': 'Langue',
        'lang.auto': 'Suivre le navigateur',
        'hero.badge': 'Compatible avec Chrome / Edge / Firefox',
        'hero.compat':
            'Les navigateurs 360, QQ, Sogou et Liebao peuvent installer directement depuis le store Edge — entièrement compatibles.',
        'hero.title': 'Youran Tab',
        'hero.desc':
            'Une extension de nouvel onglet open source et hautement personnalisable.<br />4 thèmes, 10 langues et plusieurs fonds pour créer votre page de démarrage.',
        'themes.title': '4 thèmes, changez à volonté',
        'themes.subtitle': "Chaque thème dispose d'options dédiées pour s'adapter à vos usages.",
        'themes.classic.title': 'Classique',
        'themes.classic.desc':
            "Grille traditionnelle avec colonnes, espacements, rayon, opacité et taille d'icônes réglables. Un choix par défaut simple et pratique.",
        'themes.bento.title': 'Bento',
        'themes.bento.desc':
            'Mise en page en cartes inspirée des widgets macOS. Grille fixe ou adaptative, comptage automatique des clics et agrandissement selon le nombre de clics.',
        'themes.terminal.title': 'Terminal',
        'themes.terminal.desc': 'Expérience complète en ligne de commande. 9 palettes, 4 styles de curseur et invite personnalisable.',
        'themes.minimal.title': 'Minimal',
        'themes.minimal.desc': 'Supprime tout le superflu et ne garde que les sites. Propre, concentré, sans distraction.',
        'features.title': 'Fonctions riches, exécution légère',
        'features.subtitle': 'Entièrement open source. Toutes les données sont locales. Sans compte, sans suivi.',
        'features.search.title': '12 moteurs de recherche',
        'features.search.desc': 'Google, Bing, Baidu, DuckDuckGo, Perplexity, etc. Changement en un clic.',
        'features.background.title': 'Multiples arrière-plans',
        'features.background.desc': 'Uni, dégradé, image, aléatoire. Réglages séparés pour clair et sombre.',
        'features.dark.title': 'Mode sombre',
        'features.dark.desc': 'Suivre le système ou basculer clair / sombre manuellement.',
        'features.languages.title': '10 langues',
        'features.languages.desc':
            'Chinois, anglais, japonais, coréen, français, allemand, espagnol, russe, italien. Détection automatique de la langue du système.',
        'features.icons.title': 'Icônes flexibles',
        'features.icons.desc': "3 sources d'icônes en ligne, upload personnalisé et icônes distinctes pour le mode sombre.",
        'features.sync.title': 'Importer / exporter',
        'features.sync.desc': 'Exporter la configuration des sites en JSON et migrer en un clic.',
        'terminal.title': 'Thème terminal, esprit geek',
        'terminal.desc':
            'Tout gérer par commandes. Ajouter des sites, changer de thème, rechercher sur le web — tout au clavier. Sélection avec les flèches pour un contrôle rapide.',
        'terminal.cmd.ls': 'Lister tous les sites',
        'terminal.cmd.add': 'Ajouter un site',
        'terminal.cmd.search': 'Rechercher sur le web',
        'terminal.cmd.theme': 'Changer de thème',
        'terminal.cmd.color': 'Changer le thème de couleur',
        'terminal.cmd.export': 'Exporter la liste des sites',
        'terminal.mock.added': 'Ajouté : YouTube',
        'tech.title': 'Stack moderne',
        'tech.subtitle': 'Léger, performant et sans dépendance runtime.',
        'cta.title': 'Commencer',
        'cta.subtitle': 'Gratuit et open source. Installation et usage immédiats, sans inscription. Toutes les données restent locales.',
        'footer.name': 'Youran Tab',
    },
    'de-DE': {
        'site.title': 'Youran Tab – Anpassbarer neuer Tab',
        'site.description':
            'Youran Tab ist eine Open-Source-Erweiterung für neue Tabs mit hoher Anpassbarkeit, mehreren Themes, Hintergründen und Layouts.',
        'lang.label': 'Sprache',
        'lang.auto': 'Browser folgen',
        'hero.badge': 'Kompatibel mit Chrome / Edge / Firefox',
        'hero.compat': 'Browser wie 360, QQ, Sogou und Liebao können direkt aus dem Edge Add-ons Store installieren — voll kompatibel.',
        'hero.title': 'Youran Tab',
        'hero.desc':
            'Eine Open-Source-Erweiterung für neue Tabs mit hoher Anpassbarkeit.<br />4 Themes, 10 Sprachen und mehrere Hintergründe für deine Startseite.',
        'themes.title': '4 Themes, frei wechselbar',
        'themes.subtitle': 'Jedes Theme hat eigene Optionen für unterschiedliche Arbeitsweisen.',
        'themes.classic.title': 'Klassisch',
        'themes.classic.desc':
            'Klassisches Raster mit einstellbaren Spalten, Abständen, Radius, Transparenz und Icon-Größe. Eine klare und praktische Standardwahl.',
        'themes.bento.title': 'Bento',
        'themes.bento.desc':
            'Kartenlayout inspiriert von macOS-Widgets. Unterstützt feste oder adaptive Raster, zählt Klicks automatisch und vergrößert nach Klickzahl.',
        'themes.terminal.title': 'Terminal',
        'themes.terminal.desc': 'Vollständiges Kommandozeilen-Erlebnis. 9 Farbschemata, 4 Cursor-Stile und anpassbarer Prompt.',
        'themes.minimal.title': 'Minimal',
        'themes.minimal.desc': 'Entfernt alles Überflüssige und zeigt nur Sites. Sauber, fokussiert, ohne Ablenkung.',
        'features.title': 'Starke Funktionen, leichtgewichtig',
        'features.subtitle': 'Komplett Open Source. Alle Daten bleiben lokal. Keine Konten, kein Tracking.',
        'features.search.title': '12 Suchmaschinen',
        'features.search.desc': 'Google, Bing, Baidu, DuckDuckGo, Perplexity und mehr. Wechsel mit einem Klick.',
        'features.background.title': 'Mehrere Hintergründe',
        'features.background.desc': 'Einfarbig, Verlauf, Bild, zufällig. Separate Einstellungen für hell und dunkel.',
        'features.dark.title': 'Dunkelmodus',
        'features.dark.desc': 'Folgt dem System oder manuell hell / dunkel umschalten.',
        'features.languages.title': '10 Sprachen',
        'features.languages.desc':
            'Chinesisch, Englisch, Japanisch, Koreanisch, Französisch, Deutsch, Spanisch, Russisch, Italienisch. Automatische Spracherkennung.',
        'features.icons.title': 'Flexible Icons',
        'features.icons.desc': '3 Online-Iconquellen, eigene Uploads und separate Dark-Mode-Icons.',
        'features.sync.title': 'Import & Export',
        'features.sync.desc': 'Site-Einstellungen als JSON exportieren und auf andere Geräte migrieren.',
        'terminal.title': 'Terminal-Theme, Geek-Feeling',
        'terminal.desc':
            'Alles per Befehl verwalten. Sites hinzufügen, Themes wechseln, im Web suchen – alles per Tastatur. Pfeilauswahl für schnelle Bedienung.',
        'terminal.cmd.ls': 'Alle Sites auflisten',
        'terminal.cmd.add': 'Neue Site hinzufügen',
        'terminal.cmd.search': 'Im Web suchen',
        'terminal.cmd.theme': 'Theme wechseln',
        'terminal.cmd.color': 'Farbschema wechseln',
        'terminal.cmd.export': 'Siteliste exportieren',
        'terminal.mock.added': 'Hinzugefügt: YouTube',
        'tech.title': 'Moderner Stack',
        'tech.subtitle': 'Leicht, leistungsstark, ohne Runtime-Abhängigkeiten.',
        'cta.title': 'Loslegen',
        'cta.subtitle': 'Kostenlos und Open Source. Nach der Installation sofort nutzbar, ohne Registrierung. Alle Daten bleiben lokal.',
        'footer.name': 'Youran Tab',
    },
    'it-IT': {
        'site.title': 'Youran Tab - Nuova scheda personalizzabile',
        'site.description':
            "Youran Tab è un'estensione di nuova scheda open source e altamente personalizzabile, con più temi, sfondi e layout.",
        'lang.label': 'Lingua',
        'lang.auto': 'Segui il browser',
        'hero.badge': 'Compatibile con Chrome / Edge / Firefox',
        'hero.compat': 'I browser 360, QQ, Sogou e Liebao possono installare direttamente dallo store Edge — pienamente compatibili.',
        'hero.title': 'Youran Tab',
        'hero.desc':
            "Un'estensione di nuova scheda open source e altamente personalizzabile.<br />4 temi, 10 lingue e vari sfondi per creare la tua pagina iniziale.",
        'themes.title': '4 temi, cambia quando vuoi',
        'themes.subtitle': 'Ogni tema ha opzioni dedicate per adattarsi a diverse abitudini.',
        'themes.classic.title': 'Classico',
        'themes.classic.desc':
            'Layout a griglia tradizionale con colonne, spaziatura, raggio, opacità e dimensione delle icone regolabili. Una scelta predefinita semplice e pratica.',
        'themes.bento.title': 'Bento',
        'themes.bento.desc':
            'Layout a schede ispirato ai widget macOS. Supporta griglia fissa o adattiva, conta i clic automaticamente e ingrandisce in base ai clic.',
        'themes.terminal.title': 'Terminale',
        'themes.terminal.desc': 'Esperienza completa da riga di comando. 9 schemi colore, 4 stili di cursore e prompt personalizzabile.',
        'themes.minimal.title': 'Minimal',
        'themes.minimal.desc': 'Rimuove ogni distrazione e mostra solo i siti. Pulito, concentrato, senza distrazioni.',
        'features.title': 'Funzioni potenti, esecuzione leggera',
        'features.subtitle': 'Completamente open source. Tutti i dati restano in locale. Nessun account, nessun tracciamento.',
        'features.search.title': '12 motori di ricerca',
        'features.search.desc': 'Google, Bing, Baidu, DuckDuckGo, Perplexity e altro. Cambio con un clic.',
        'features.background.title': 'Sfondi multipli',
        'features.background.desc': 'Tinta unita, sfumatura, immagine, casuale. Impostazioni separate per chiaro e scuro.',
        'features.dark.title': 'Modalità scura',
        'features.dark.desc': 'Segue il sistema o passa manualmente tra chiaro / scuro.',
        'features.languages.title': '10 lingue',
        'features.languages.desc':
            'Cinese, inglese, giapponese, coreano, francese, tedesco, spagnolo, russo, italiano. Rilevamento automatico della lingua di sistema.',
        'features.icons.title': 'Icone flessibili',
        'features.icons.desc': '3 fonti di icone online, caricamento personalizzato e icone separate per la modalità scura.',
        'features.sync.title': 'Importa ed esporta',
        'features.sync.desc': 'Esporta le impostazioni dei siti in JSON e migra su altri dispositivi con un clic.',
        'terminal.title': 'Tema terminale, esperienza geek',
        'terminal.desc':
            'Gestisci tutto con i comandi. Aggiungi siti, cambia tema, cerca sul web — tutto da tastiera. Selezione con frecce per un controllo rapido.',
        'terminal.cmd.ls': 'Elenca tutti i siti',
        'terminal.cmd.add': 'Aggiungi un nuovo sito',
        'terminal.cmd.search': 'Cerca sul web',
        'terminal.cmd.theme': 'Cambia tema',
        'terminal.cmd.color': 'Cambia schema colori',
        'terminal.cmd.export': 'Esporta elenco siti',
        'terminal.mock.added': 'Aggiunto: YouTube',
        'tech.title': 'Stack moderno',
        'tech.subtitle': 'Leggero, ad alte prestazioni, senza dipendenze runtime.',
        'cta.title': 'Inizia',
        'cta.subtitle': 'Gratis e open source. Installa e usa subito, senza registrazione. Tutti i dati restano in locale.',
        'footer.name': 'Youran Tab',
    },
};

const getMessage = (locale, key) => {
    const dict = messages[locale] || messages[fallbackLocale] || {};
    return dict[key] ?? messages[fallbackLocale]?.[key];
};

const normalizeLocale = value => {
    if (!value) return null;
    if (value === 'auto') return null;
    if (supportedLocales.includes(value)) return value;
    const base = value.split('-')[0];
    return supportedLocales.find(item => item.split('-')[0] === base) || null;
};

const getStoredLocale = () => {
    const stored = localStorage.getItem(storageKeyLocale);
    if (stored === 'auto') {
        localStorage.removeItem(storageKeyLocale);
        return null;
    }
    return normalizeLocale(stored);
};

const setStoredLocale = value => {
    if (!value) {
        localStorage.removeItem(storageKeyLocale);
        return;
    }
    localStorage.setItem(storageKeyLocale, value);
};

const detectLocale = () => {
    const candidates = Array.from(new Set([navigator.language, ...(navigator.languages || [])].filter(Boolean)));
    for (const lang of candidates) {
        if (supportedLocales.includes(lang)) return lang;
        const base = lang.split('-')[0];
        const match = supportedLocales.find(item => item.split('-')[0] === base);
        if (match) return match;
    }
    return fallbackLocale;
};

const resolveLocale = stored => stored || detectLocale();

const langPicker = document.getElementById('lang-picker');
const langToggle = document.getElementById('lang-toggle');
const langMenu = document.getElementById('lang-menu');

const setMenuVisible = visible => {
    if (!langMenu) return;
    langMenu.classList.toggle('hidden', !visible);
};

const updateMenu = locale => {
    if (!langToggle || !langMenu) return;
    langToggle.textContent = localeNames[locale] || locale;
    langMenu.innerHTML = '';
    supportedLocales.forEach(loc => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.lang = loc;
        button.textContent = localeNames[loc] || loc;
        button.className = 'w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/10 hover:text-white';
        if (loc === locale) {
            button.className += ' text-white';
        }
        langMenu.appendChild(button);
    });
};

const applyI18n = locale => {
    document.documentElement.lang = locale;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const value = getMessage(locale, key);
        if (!value) return;
        const attr = el.dataset.i18nAttr;
        const mode = el.dataset.i18nMode;
        if (attr) {
            el.setAttribute(attr, value);
            return;
        }
        if (mode === 'html') {
            el.innerHTML = value;
            return;
        }
        el.textContent = value;
    });
    return locale;
};

const applyLocaleSetting = stored => {
    const locale = resolveLocale(stored);
    applyI18n(locale);
    updateMenu(locale);
    return locale;
};

const initialStored = getStoredLocale();
applyLocaleSetting(initialStored);

if (langToggle && langMenu) {
    langToggle.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const shouldOpen = langMenu.classList.contains('hidden');
        setMenuVisible(shouldOpen);
    });

    langMenu.addEventListener('click', event => {
        const button = event.target.closest('button[data-lang]');
        if (!button) return;
        const detected = detectLocale();
        const nextLocale = normalizeLocale(button.dataset.lang) || detected;
        const stored = nextLocale === detected ? null : nextLocale;
        setStoredLocale(stored);
        applyLocaleSetting(stored);
        setMenuVisible(false);
    });

    document.addEventListener('click', event => {
        if (!langPicker) return;
        if (!langPicker.contains(event.target)) {
            setMenuVisible(false);
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            setMenuVisible(false);
        }
    });
}
