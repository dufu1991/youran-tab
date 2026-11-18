import './style.css';
import changelogMd from '../../CHANGELOG.md?raw';
import packageInfo from '../../package.json';
import { marked } from 'marked';

const appVersion = packageInfo.version;
const supportedLocales = ['en-US', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es', 'ru', 'fr', 'de', 'it'];
const fallbackLocale = 'zh-CN';
const storageKeyLocale = 'doc_locale';
const localeNames = {
    'en-US': 'English',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'ja': '日本語',
    'ko': '한국어',
    'es': 'Español',
    'ru': 'Русский',
    'fr': 'Français',
    'de': 'Deutsch',
    'it': 'Italiano',
};

const messages = {
    'en-US': {
        'site.title': 'Youran Tab - Customizable New Tab',
        'site.description':
            'Youran Tab is an open-source, highly customizable new tab extension with multiple themes, backgrounds, and layouts.',
        'lang.label': 'Language',
        'lang.auto': 'Follow browser',
        'theme.label': 'Theme',
        'theme.auto': 'Automatic',
        'theme.light': 'Light',
        'theme.dark': 'Dark',
        'hero.badge': 'Works with Chrome / Edge / Firefox',
        'hero.compat':
            'Domestic browsers like 360, QQ, Sogou, and Liebao can install directly from the Edge Add-ons store — fully compatible.',
        'hero.title': 'Youran Tab',
        'hero.desc':
            'An open-source, highly customizable new tab extension.<br />8 themes, 10 languages, and multiple backgrounds to create your own start page.',
        'themes.title': '8 themes, switch anytime',
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
        'themes.glass.title': 'Glass',
        'themes.glass.desc': 'Frosted glass pill cards in a horizontal list. Adjustable column count for a clean, modern look.',
        'themes.bubble.title': 'Bubble',
        'themes.bubble.desc': 'Floating circle bubbles. Supports fixed and random scatter layouts with adjustable size.',
        'themes.pixel.title': 'Pixel',
        'themes.pixel.desc': 'Retro pixel style with a command-prompt search bar and menu list interaction.',
        'themes.sticky.title': 'Sticky',
        'themes.sticky.desc': 'Sticky note bulletin board with pin decorations, colorful papers, and waterfall layout.',
        'features.title': 'Powerful features, lightweight',
        'features.subtitle': 'Fully open source. All data stays local. No accounts, no tracking.',
        'features.search.title': 'Quick search',
        'features.search.desc': '10 popular search engines and 10 AI assistants built in. Enable the ones you want, set a default, or switch temporarily from the search bar without touching your browser\'s own search settings. Typing also finds your saved sites.',
        'features.folders.title': 'Folders',
        'features.folders.desc': 'Group related sites into folders shown as a grid or stacked icons. Save a whole tab group in one go, and reopen everything as a tab group with one click.',
        'features.clip.title': 'One-Click Add from Any Page',
        'features.clip.desc': 'Right-click any web page and choose "Add to Youran Tab" to put it in the main list or a folder of your choice.',
        'features.background.title': 'Multiple backgrounds',
        'features.background.desc': 'Solid, gradient, image, dynamic and random backgrounds, configured separately for light and dark mode. Random mode gives you a fresh background every time you open a tab.',
        'features.dark.title': 'Dark mode',
        'features.dark.desc': 'Follow system or switch light / dark manually.',
        'features.languages.title': '10 languages',
        'features.languages.desc':
            'Chinese, English, Japanese, Korean, French, German, Spanish, Russian, Italian. Auto-detects system language.',
        'features.icons.title': 'Crisp Icons',
        'features.icons.desc': 'Automatically picks the sharpest icon from multiple sources. You can also choose an icon source, upload a custom icon, or set a separate icon for dark mode.',
        'features.organize.title': 'Drag to Organize',
        'features.organize.desc': 'In edit mode, drag to reorder and drop onto a folder to file a site. Deleted a site or folder by mistake? Undo it right away.',
        'features.sync.title': 'Import & export',
        'features.sync.desc': 'Export sites and settings separately or together as JSON, and restore them in one click on a new device.',
        'foldersSpotlight.title': 'Too many tabs? Put them in a folder and reopen in one click',
        'foldersSpotlight.desc':
            'Save the pages you are working on as a folder, then close the whole group when you don\'t need it to free up tab bar space and memory. Next time, right-click the folder and choose "Open all in a tab group". The pages come back as a tab group named after the folder, with your workspace exactly as you left it.',
        'foldersSpotlight.step1.title': 'Save a whole group',
        'foldersSpotlight.step1.desc': 'Check the current tab group when creating a folder, or right-click any web page to add it to a specific folder.',
        'foldersSpotlight.step2.title': 'Close with confidence',
        'foldersSpotlight.step2.desc': 'Close the entire tab group in your browser. It no longer takes up tab bar space or memory.',
        'foldersSpotlight.step3.title': 'Restore in one click',
        'foldersSpotlight.step3.desc': 'Right-click the folder and open all in a tab group. The group is named after the folder automatically.',
        'foldersSpotlight.sceneTitle': 'Great for these scenarios',
        'foldersSpotlight.sceneDesc':
            'Project back offices, event pages, reference docs, short-term research... These pages are often needed for only a few days. They are not worth bookmarking, but you still want to keep them around for a while, and a folder is the perfect place for them.',
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
        'nav.name': 'Youran Tab',
        'nav.home': 'Home',
        'nav.support': 'Support',
        'nav.privacy': 'Privacy Policy',
        'nav.guide': 'User Guide',
        'nav.changelog': 'Changelog',
        'support.title': 'Support Youran Tab',
        'support.subtitle': 'If this project helps you, you are welcome to support it in any of the following ways. Your support goes toward continued development, maintenance, and polishing the experience.',
        'support.note': 'You are welcome to include your GitHub profile or other social link in the donation message. I will acknowledge your support on the project repository and the official website.',
        'support.buymeacoffee.title': 'Buy Me a Coffee',
        'support.buymeacoffee.desc': 'Support the project through Buy Me a Coffee and help keep it improving.',
        'support.paypal.desc': 'Support quickly with PayPal, ideal for overseas and cross-region payments.',
        'support.wechat.title': 'WeChat Appreciation',
        'support.wechat.desc': 'Open WeChat and scan the code. Thank you for your support and encouragement.',
        'support.alipay.title': 'Alipay',
        'support.alipay.desc': 'Use Alipay to scan and support the project as it continues to evolve.',
        'support.openLink': 'Support now',
        'privacy.title': 'Privacy Policy',
        'privacy.updated': 'Last updated: November 18, 2026',
        'privacy.intro.title': 'Overview',
        'privacy.intro.desc': 'Youran Tab (hereinafter referred to as "this extension") is an open-source browser new tab extension. We highly value your privacy. This extension does not collect, store, or transmit any personal user data.',
        'privacy.collect.title': 'Data Collection',
        'privacy.collect.desc': 'This extension does not collect any personal information or usage data. All configuration data (including site lists, theme settings, background settings, etc.) is stored in the browser\'s local storage and is never sent to any external server. When you use Add from Current Tabs, the extension only reads, locally, the titles, URLs and group names of the tabs and tab groups open in the current browser window, to show the selection list. When you use the web page context menu "Add to Youran Tab", the extension only reads the title and URL of the page you right-clicked, and saves them as a site.',
        'privacy.storage.title': 'Local Storage',
        'privacy.storage.desc': 'This extension uses the browser\'s extension storage (storage.local) to save your sites and personalized settings. The background script reads the site list from it to check whether a page has already been added and to build the folder menu, and uses it to hand pages added from the right-click menu to the new tab page. When upgrading from a version earlier than 0.5.0, data previously saved in localStorage is migrated automatically, and a backup copy is kept locally. This data is stored entirely on your device. You can back up your data at any time using the extension\'s export feature, or clear all data by uninstalling the extension.',
        'privacy.network.title': 'Network Requests',
        'privacy.network.desc': 'This extension requests public icon services (Google, Favicon Extractor, icon.horse) and the site\'s own icon files only when fetching site icons, and the requests contain only the site\'s domain name. When you submit a search or AI question, your query is sent directly to the selected third-party service and its result page opens. The extension and its developer do not collect or store the query, and your site list, settings, backgrounds and other local configuration data are not sent.',
        'privacy.thirdparty.title': 'Third-Party Services',
        'privacy.thirdparty.desc': 'This extension does not integrate any third-party analytics, advertising, or tracking services.',
        'privacy.permissions.title': 'Permissions',
        'privacy.permissions.desc': 'This extension only requests the permissions it needs to run: <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code> and <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code> are used to read the titles, URLs and group names of the tabs in the current window and to open folders as tab groups; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code> is used to provide "Add to Youran Tab" in the web page right-click menu; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code> and <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code> are used only to show a notice on the current page after you click that menu item, and do not read page content; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code> is used to save your sites and settings and to pass pending pages within the extension; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code> (Chrome and Edge only) lifts the extension storage size limit so that many uploaded custom icons can still be saved; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code> is used to call the browser\'s default search engine; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> is used to read the browser\'s built-in site icons. This extension does not read page text, form content, personal identity information, account information, passwords or payment data, and it does not access your browsing history or bookmarks.',
        'privacy.changes.title': 'Policy Changes',
        'privacy.changes.desc': 'If there are any changes to this privacy policy, we will update them on this page. Since this extension does not collect any data, no significant changes to this policy are expected.',
        'privacy.opensource.title': 'Open Source Transparency',
        'privacy.opensource.desc': 'This extension is fully open source, with source code hosted on <a href="https://github.com/dufu1991/youran-tab" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub</a>. Anyone is welcome to review the code to verify our privacy commitments.',
        'privacy.contact.title': 'Contact',
        'privacy.contact.desc': 'If you have any privacy-related questions or concerns, please contact us through <a href="https://github.com/dufu1991/youran-tab/issues" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub Issues</a>.',
        'guide.title': 'User Guide',
        'guide.install.title': 'Installation',
        'guide.install.desc': 'Search for "Youran Tab" in the Chrome Web Store, Edge Add-ons, or Firefox Add-ons and install it. After installation, open a new tab to start using it. Browsers such as 360, QQ, and Sogou can install it from the Edge Add-ons store. On first use, 4 sites are preloaded (Google, YouTube, ChatGPT and Baidu), and the random background is enabled by default.',
        'guide.addsite.title': 'Adding Sites',
        'guide.addsite.desc': 'There are 3 ways:<br />1. <strong>Add manually</strong>: Turn on "Edit mode" in settings and click "+ Add site", or right-click a blank area and choose "Add site". Enter a name and URL, and the icon is fetched automatically.<br />2. <strong>Add from the current tabs</strong>: Pick an already-open tab directly in the add dialog. See below for details.<br />3. <strong>Right-click on a web page to add</strong>: Save pages as you browse. See below for details.',
        'guide.theme.title': 'Theme Overview',
        'guide.theme.desc': 'You can choose from 8 themes in the settings panel: Classic, Bento, Terminal, Minimal, Glass, Bubble, Pixel, or Sticky. Each theme has its own configuration options. Switching themes will not lose settings from other themes, and folders work across all visual themes.',
        'guide.classic.title': 'Classic Theme',
        'guide.classic.desc': 'Standard icon grid layout with a frosted glass card background on hover. Configurable options include: container width (400-1400px), columns (3-8), border radius, card opacity, frosted glass blur, and icon size. The number of columns automatically shrinks based on the number of sites to avoid empty columns.',
        'guide.bento.title': 'Bento Theme',
        'guide.bento.desc': 'Two layout modes are available:<br />1. <strong>Dynamic layout</strong> (default): Card size is determined by click count using a Treemap algorithm. Sites with more clicks occupy larger areas, and new sites also have an initial area. Folder cards aggregate the click counts of the sites inside them, so frequently used folders also grow larger. Click counts are snapshotted on page load, so clicking does not cause immediate re-layout.<br />2. <strong>Fixed grid</strong>: All cards are equally sized and arranged in the configured number of columns.<br />Configurable options include: container width, gap (4-32px), border radius, card opacity, frosted glass blur, icon size, layout mode toggle, and fixed-mode column count.',
        'guide.folders.title': 'Folders',
        'guide.folders.desc': 'Folders hold related sites. Switch to "Folder" in the add dialog to create one. You can check existing sites or current tabs to add them, and drag to reorder.<br />There are 4 folder icon styles: <strong>Grid</strong> (default, shows the icons of the first few sites, and with more than 4 the 4th cell shows the remaining count), <strong>Stack</strong> (stacks the icons of the first 3 sites), <strong>Custom image</strong> and <strong>Paste SVG</strong>. You can also set the icon background color, whether to show the background, the corner radius and the icon scale.<br />Clicking a folder opens a panel near its position, and clicking a site inside opens it. Drag within the panel to reorder, or drag outside the panel to move a site out of the folder.<br /><strong>Open by group</strong>: Right-click a folder and choose "Open all tabs" or "Open all in a tab group". The latter puts the folder\'s sites into a tab group named after the folder. For pages you don\'t need for now, save them as a folder first, then close the whole group in your browser to free up tab bar space and memory. Next time you need them, open them as a group in one click and your workspace comes back as it was.<br />When deleting a folder, you can delete only the folder and move its sites back to the main list, or delete the folder together with its sites.',
        'guide.organize.title': 'Editing and Organizing',
        'guide.organize.desc': 'Turn on "Edit mode" in settings, then click a site or folder to edit or delete it. Drag to reorder, and drop onto the middle of a folder to move a site into it. Click "Done" when you finish. After you delete a site or folder, an "Undo" notice appears so you can restore it right away. When several new tabs are open, changes made in one are synced to the others automatically.',
        'guide.tabs.title': 'Add from Current Tabs',
        'guide.tabs.desc': 'When you add a site or create a folder, the dialog lists the tabs open in the current browser window, organized by tab group. Select a single tab to fill in its title and URL automatically, or select several to add them in a batch. When creating a folder, you can also check a whole tab group and the folder name is filled in for you. When there are more than <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">12</code> tabs, a search box appears so you can filter by title, URL or group name.',
        'guide.webadd.title': 'Right-Click on a Web Page to Add',
        'guide.webadd.desc': 'Right-click a blank area of any web page and choose "Add to Youran Tab" to save the current page, using the page title as the site name. If you have created folders, the menu expands into "Main list" and each folder, so you can put the page straight into a specific folder. A brief notice appears in the top right of the page after adding, and a page you have already saved shows "Already in Youran Tab" instead of being added twice. New sites appear the next time you open or switch back to a new tab. On restricted pages such as browser stores, the notice cannot be shown, but the site is still added normally.',
        'guide.contextmenu.title': 'Context Menu',
        'guide.contextmenu.desc': 'Right-click in a new tab (except in the Terminal theme):<br />1. <strong>Right-click a site</strong>: Open in new tab, edit, move to a folder or move out of a folder, delete.<br />2. <strong>Right-click a folder</strong>: Open all tabs, open all in a tab group (requires browser support for tab groups), edit folder, delete.<br />3. <strong>Right-click a blank area</strong>: Add site, change background. In random mode, a new random background is applied immediately. Otherwise, one of your saved solid, gradient, image or dynamic backgrounds is picked at random and kept.',
        'guide.icons.title': 'Site Icons',
        'guide.icons.desc': 'Icons are set to "Auto" by default: it requests icons from the site itself, the browser\'s built-in icons, Google, Favicon Extractor and icon.horse, skips placeholder images, picks the sharpest one and saves it locally. If none is available, a first-letter icon is generated. When editing a site, you can also choose Google, Extractor or icon.horse as the icon source, upload a custom icon, and adjust the icon radius. In dark mode you can set a separate icon, which helps with line icons that are hard to see on dark backgrounds. Icons are cached locally for the long term and are fetched again automatically when you edit a site or change its icon source.',
        'guide.terminalDetail.title': 'Terminal Theme',
        'guide.terminalDetail.desc': 'A full command-line interface with complete keyboard support. Available commands:<br /><br /><dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5"><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">h</code></dt><dd>Show help</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">ls</code></dt><dd>List all sites. Sites inside folders are shown as "Folder / Site"</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">&lt;number&gt; / name / url</code></dt><dd>Open a site by number, name or URL</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">add &lt;url&gt; &lt;name&gt;</code></dt><dd>Add a new site</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">edit &lt;number&gt; &lt;url&gt; &lt;name&gt;</code></dt><dd>Edit a site</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">rm &lt;number&gt;</code></dt><dd>Delete a site</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s &lt;keyword&gt;</code></dt><dd>Search or ask with the default option</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code></dt><dd>Switch theme</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code></dt><dd>Switch display mode</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code></dt><dd>Switch language</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code></dt><dd>Set color scheme</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code></dt><dd>Set cursor style</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code></dt><dd>Set command prompt</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">width &lt;px|full&gt;</code></dt><dd>Set terminal width</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">set</code></dt><dd>Open the settings panel</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code></dt><dd>Export data</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code></dt><dd>Import data</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">clear</code></dt><dd>Clear the screen</dd></dl><br />There are 9 color schemes (Green, Amber, Blue, Cyan, Purple, Pink, Red, Orange, Mono) and 4 cursor styles (Bar, Wide, Block, Underline). When <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code> and <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code> are entered without arguments, use the arrow keys to choose an option, press Enter to confirm, or press Esc to cancel.<br /><br /><strong>Tip:</strong> Due to browser restrictions, focus stays in the address bar when a new tab opens. Click anywhere on the page to start typing commands.',
        'guide.minimal.title': 'Minimal Theme',
        'guide.minimal.desc': 'A pure text list style with no icons or cards, showing only site name links. This theme has no theme-specific configuration options.',
        'guide.glass.title': 'Glass Theme',
        'guide.glass.desc': 'Frosted glass pill cards in a horizontal list layout. Configurable options include: column count (1-4). The search bar is embedded in the main interface, and site titles are always shown. Works great with image or gradient backgrounds.',
        'guide.bubble.title': 'Bubble Theme',
        'guide.bubble.desc': 'Floating circle bubble effect without site titles. Two layout modes are available:<br />1. <strong>Fixed layout</strong> (default): Bubbles are arranged in order with even spacing.<br />2. <strong>Random scatter</strong>: Bubbles are randomly scattered on the canvas using collision detection to prevent overlapping.<br />Configurable options include: layout mode toggle, bubble size (48-120px). The search bar is presented as an expandable search bubble.',
        'guide.pixel.title': 'Pixel Theme',
        'guide.pixel.desc': 'Retro pixel style with menu list interaction. Sites are displayed in a list format with titles always shown. The search bar uses a command-prompt style. Hover effects include a scanline animation. This theme has no theme-specific configuration options.',
        'guide.sticky.title': 'Sticky Theme',
        'guide.sticky.desc': 'A sticky-note bulletin board style. Notes come in colorful paper with pin decorations, are tilted at random angles, and flow in a waterfall layout. With no background set, light mode shows a corkboard and dark mode a dark wood board. You can also set a background like in other themes. The search bar is embedded as a note with a hand-drawn dashed input. Configurable option: show or hide site titles.',
        'guide.search.title': 'Search',
        'guide.search.desc': 'The search bar comes with 10 search engines such as Google, Bing and Baidu, plus 10 AI assistants such as ChatGPT, Claude and DeepSeek. Enable them in settings, star one as the default, and choose whether the default is search or AI. Click the icon in front of the search bar to switch temporarily; this only applies to the current page and never changes your browser\'s search settings. Using an AI assistant opens its website, so signing in to that service first is recommended. As you type, matching saved sites appear in a list (including those inside folders), found by name, domain or folder name; use the arrow keys to select, Enter to open, and Ctrl / Cmd + Enter to open in a new tab. In the Terminal theme, use the <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s</code> command followed by keywords to search or ask with the default option.',
        'guide.background.title': 'Background Settings',
        'guide.background.desc': 'All themes except Terminal and Minimal support backgrounds. There are 6 modes:<br />1. <strong>None</strong>: Uses the browser\'s default new tab background color. The Sticky theme shows a corkboard when there is no background.<br />2. <strong>Solid</strong>: 18 preset colors each for light and dark mode, plus custom colors.<br />3. <strong>Gradient</strong>: 18 preset gradients each for light and dark mode. Click "Random gradient" to generate more.<br />4. <strong>Image</strong>: Upload from your device, up to 18 images, stored only locally.<br />5. <strong>Dynamic</strong>: 18 preset dynamic backgrounds each for light and dark mode.<br />6. <strong>Random</strong> (default for new users): Switches randomly among the solid, gradient, image and dynamic types you select, and picks again each time you open a new tab or click "Change background". For the random source, choose "Generate new" to create a brand-new background every time, or "From presets" to pick only from your existing presets and uploaded images.<br />If you don\'t like a solid, gradient or dynamic preset, delete it and a new one is generated when you add one, or click "Regenerate 18 presets" to refresh them all. Light and dark mode backgrounds are configured independently.',
        'guide.darkmode.title': 'Dark Mode',
        'guide.darkmode.desc': 'Supports 3 modes: auto follow system, manual light, and manual dark. In dark mode, you can configure separate icons for sites.',
        'guide.importexport.title': 'Import & Export',
        'guide.importexport.desc': 'You can export data from settings, choosing "Sites only", "Settings only" or "Sites + Settings". The file name automatically includes the extension version. Site data includes the folder structure, folder icons and styles, and the sites inside. When importing, sites are merged with existing data and duplicates are skipped. Settings overwrite all current settings, and the page refreshes automatically after import. Files from a newer version require updating the extension before importing. In the Terminal theme, the <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code> and <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code> commands do the same thing.',
        'guide.browser.title': 'Permissions',
        'guide.browser.desc': 'Here is what each browser permission is used for:<br />1. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code>: Read the titles, URLs and group names of the tabs in the current window when adding a site or creating a folder, and open a folder as a tab group.<br />2. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code>: Provide "Add to Youran Tab" in the web page right-click menu.<br />3. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code>: Show a brief notice in the top right of the current page after you add it.<br />4. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code>: Save your sites and settings, and pass pending pages between the background and the new tab page.<br />5. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code> (Chrome and Edge only): Lift the extension storage size limit so that many uploaded custom icons can still be saved.<br />6. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code>: Call the browser\'s default search engine when needed.<br />7. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> (Chrome and Edge only): Read the browser\'s built-in site icons as one of the icon sources.<br />8. Access to icon services (Google, gstatic, Favicon Extractor, icon.horse): Fetch and cache site icons.',
        'guide.align.title': 'Alignment',
        'guide.align.desc': 'Content supports 3 vertical alignment options: top, center, and bottom. Each theme saves its alignment setting independently.',
        'guide.reset.title': 'Reset Settings and Clear Cache',
        'guide.reset.desc': '"Reset settings" restores all settings to their defaults. Your saved sites and click counts are kept, and only appearance and feature settings are restored. "Clear icon cache" removes all cached site icons, and they are downloaded again the next time you open a tab.',
        'changelog.title': 'Changelog',
        'changelog.storeDelayHint': 'Store versions may be delayed due to browser store review.',
        'changelog.v1.feat1': '8 themes: Classic, Bento, Terminal, Minimal, Glass, Bubble, Pixel, Sticky',
        'changelog.v1.feat2': 'Built-in search bar',
        'changelog.v1.feat3': 'Multiple background modes: solid, gradient, image, dynamic, random',
        'changelog.v1.feat4': 'Dark mode with system follow or manual toggle',
        'changelog.v1.feat5': '10 language support',
        'changelog.v1.feat6': 'Site configuration import and export',
        'changelog.v1.feat7': '3 online icon sources with custom upload support',
    },
    'zh-CN': {
        'site.title': '悠然标签页 - 可定制的浏览器新标签页',
        'site.description': '悠然标签页：一款开源且高度可定制的浏览器新标签页扩展，支持多种主题、背景和布局。',
        'lang.label': '语言',
        'lang.auto': '跟随浏览器',
        'theme.label': '外观',
        'theme.auto': '自动',
        'theme.light': '亮色',
        'theme.dark': '暗色',
        'hero.badge': '适用于 Chrome、Edge、Firefox',
        'hero.compat': '360、QQ、搜狗、360 极速、猎豹等国产浏览器可通过 Edge 插件市场直接安装，完全兼容。',
        'hero.title': '悠然标签页',
        'hero.desc': '一款开源、高度可定制的浏览器新标签页扩展。<br />8 种主题、10 种语言、多种背景，打造专属你的浏览器起始页。',
        'themes.title': '8 种主题，随心切换',
        'themes.subtitle': '每种主题都有独立的配置项，满足不同使用习惯。',
        'themes.classic.title': '经典',
        'themes.classic.desc': '传统网格布局，可调节列数、间距、圆角、透明度和图标大小。简洁实用的默认选择。',
        'themes.bento.title': '便当',
        'themes.bento.desc': '类似 macOS 小组件的卡片式布局，支持固定或自适应网格，自动统计点击次数，并根据点击次数自动放大。',
        'themes.terminal.title': '终端',
        'themes.terminal.desc': '完整的命令行交互体验。9 种配色、4 种光标样式、可自定义提示符，极客的选择。',
        'themes.minimal.title': '极简',
        'themes.minimal.desc': '去除一切多余元素，只保留站点。干净、专注、无干扰。',
        'themes.glass.title': '玻璃',
        'themes.glass.desc': '毛玻璃药丸卡片，横向列表布局，列数可调，简洁现代。',
        'themes.bubble.title': '气泡',
        'themes.bubble.desc': '圆形气泡悬浮效果，支持固定排列与随机散布，大小可调。',
        'themes.pixel.title': '像素',
        'themes.pixel.desc': '像素复古风格，命令行式搜索框，菜单列表交互。',
        'themes.sticky.title': '便签',
        'themes.sticky.desc': '便利贴公告板风格，图钉装饰，彩色纸张，瀑布流布局。',
        'features.title': '功能丰富，轻量运行',
        'features.subtitle': '完全开源，所有数据存储在本地，无需登录，不收集任何信息。',
        'features.search.title': '快速搜索',
        'features.search.desc': '内置 10 个主流搜索引擎与 10 个 AI 提问服务，可勾选启用、设置默认项，也能在搜索框前方临时切换，不影响浏览器自身的搜索设置。输入时还会列出匹配的已收藏网站。',
        'features.folders.title': '文件夹收纳',
        'features.folders.desc': '把同类网站收进文件夹，用宫格或堆叠图标展示，可整组保存标签页分组，也能一键按分组打开全部。',
        'features.clip.title': '网页一键加入',
        'features.clip.desc': '在任意网页上右键选择「加入悠然标签页」，直接放进主列表或指定文件夹。',
        'features.background.title': '多种背景',
        'features.background.desc': '纯色、渐变、图片、动态和随机背景，亮色暗色独立配置，随机模式每次打开都有新背景。',
        'features.dark.title': '暗色模式',
        'features.dark.desc': '自动跟随系统，也可手动切换亮色或暗色。',
        'features.languages.title': '10 种语言',
        'features.languages.desc': '中、英、日、韩、法、德、西、俄、意大利语，自动检测系统语言。',
        'features.icons.title': '清晰图标',
        'features.icons.desc': '自动从多个图标源挑出最清晰的一个，也可手动指定图标源、上传自定义图标，并为暗色模式单独设置图标。',
        'features.organize.title': '拖拽整理',
        'features.organize.desc': '编辑模式下拖动即可排序，拖到文件夹上即可归类；误删网站或文件夹可以立即撤销。',
        'features.sync.title': '导入导出',
        'features.sync.desc': '站点和设置可以分别或一起导出为 JSON，换设备时一键恢复。',
        'foldersSpotlight.title': '标签页太多？收进文件夹，用时一键打开',
        'foldersSpotlight.desc': '把一组正在用的网页保存成文件夹，暂时用不到时整组关掉，释放标签栏和电脑内存。下次需要时，右键文件夹选择「在标签页分组中打开全部」，网页会按文件夹名称重新组成一个标签页分组，工作现场原样回来。',
        'foldersSpotlight.step1.title': '整组保存',
        'foldersSpotlight.step1.desc': '新建文件夹时直接勾选当前的标签页分组，也可以在任意网页上右键，加入指定文件夹。',
        'foldersSpotlight.step2.title': '放心关闭',
        'foldersSpotlight.step2.desc': '在浏览器中关掉整个标签页分组，不再占用标签栏，也不再占用内存。',
        'foldersSpotlight.step3.title': '一键恢复',
        'foldersSpotlight.step3.desc': '右键文件夹，在标签页分组中打开全部，分组自动以文件夹名称命名。',
        'foldersSpotlight.sceneTitle': '适合这些场景',
        'foldersSpotlight.sceneDesc': '项目后台、活动页面、文档资料、临时调研……这些网页往往只集中用几天，不值得加入收藏夹，却又需要暂时保留，用文件夹收着最合适。',
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
        'nav.name': '悠然标签页',
        'nav.home': '首页',
        'nav.support': '支持',
        'nav.privacy': '隐私政策',
        'nav.guide': '使用手册',
        'nav.changelog': '版本说明',
        'support.title': '支持悠然标签页',
        'support.subtitle': '如果这个项目对你有帮助，欢迎通过下面的方式支持我。你的支持会用于持续开发、维护和完善体验。',
        'support.note': '欢迎在捐赠留言中附上你的 GitHub 或其他社交账号链接，我会在项目仓库和官网的致谢名单中展示对你的感谢。',
        'support.buymeacoffee.title': 'Buy Me a Coffee',
        'support.buymeacoffee.desc': '通过 Buy Me a Coffee 进行赞助，支持我持续打磨这个项目。',
        'support.paypal.desc': '使用 PayPal 快速支持，适合海外和跨地区支付。',
        'support.wechat.title': '微信赞赏',
        'support.wechat.desc': '打开微信扫一扫，感谢你的支持与鼓励。',
        'support.alipay.title': '支付宝收款',
        'support.alipay.desc': '使用支付宝扫一扫，支持项目继续迭代更新。',
        'support.openLink': '前往支持',
        'privacy.title': '隐私政策',
        'privacy.updated': '最后更新：2026 年 11 月 18 日',
        'privacy.intro.title': '概述',
        'privacy.intro.desc': '悠然标签页（以下简称"本扩展"）是一款开源的浏览器新标签页扩展。我们高度重视您的隐私，本扩展不会收集、存储或传输任何用户个人数据。',
        'privacy.collect.title': '数据收集',
        'privacy.collect.desc': '本扩展不收集任何个人信息或使用数据。所有配置数据（包括站点列表、主题设置、背景设置等）均保存在浏览器本地存储中，不会发送到任何外部服务器。使用「从当前标签页添加」时，本扩展只会在本地读取当前浏览器窗口中已打开标签页和标签页分组的标题、网址与分组名称，用于展示选择列表。使用网页右键菜单「加入悠然标签页」时，本扩展只会读取你右键的这个网页的标题和网址，并保存为站点。',
        'privacy.storage.title': '本地存储',
        'privacy.storage.desc': '本扩展使用浏览器的扩展存储（storage.local）保存你的站点和个性化设置。后台脚本会读取其中的站点列表，用于判断网页是否已加入和生成文件夹菜单，并通过它把右键加入的网页交给新标签页。从 0.5.0 之前的版本升级时，原来保存在 localStorage 中的数据会自动迁移过来，并在本地保留一份备份。这些数据完全存储在你的设备上，你可以随时通过扩展的导出功能备份数据，也可以通过卸载扩展清除所有数据。',
        'privacy.network.title': '网络请求',
        'privacy.network.desc': '本扩展仅在获取站点图标时请求公共图标服务（Google、Favicon Extractor、icon.horse）和网站自身的图标文件，请求中只包含网站域名。当你提交搜索或 AI 提问时，查询内容会直接发送至所选的第三方服务并打开结果页面。本扩展及其开发者不会收集或存储查询内容，也不会发送你的站点列表、设置、背景等本地配置数据。',
        'privacy.thirdparty.title': '第三方服务',
        'privacy.thirdparty.desc': '本扩展不集成任何第三方分析、广告或追踪服务。',
        'privacy.permissions.title': '权限说明',
        'privacy.permissions.desc': '本扩展只申请运行所需的权限：<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code> 与 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code> 用于读取当前窗口标签页的标题、网址和分组名称，并在标签页分组中打开文件夹；<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code> 用于在网页右键菜单中提供「加入悠然标签页」；<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code> 与 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code> 仅用于在你点击该菜单后，在当前网页显示一条加入提示，不会读取页面内容；<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code> 用于保存站点和设置，并在扩展内部传递待加入的网页；<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code>（仅 Chrome 和 Edge）用于解除扩展存储的容量上限，避免上传的自定义图标较多时无法保存；<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code> 用于调用浏览器默认搜索引擎；<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> 用于读取浏览器内置的网站图标。本扩展不会读取页面正文、表单内容、个人身份信息、账户信息、密码或支付数据，也不会访问你的浏览历史或书签。',
        'privacy.changes.title': '政策变更',
        'privacy.changes.desc': '如本隐私政策有任何变更，我们将在此页面更新。由于本扩展不收集任何数据，预计本政策不会发生重大变化。',
        'privacy.opensource.title': '开源透明',
        'privacy.opensource.desc': '本扩展完全开源，源代码托管在 <a href="https://github.com/dufu1991/youran-tab" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub</a>，欢迎任何人审查代码以验证我们的隐私承诺。',
        'privacy.contact.title': '联系方式',
        'privacy.contact.desc': '如有任何隐私相关的问题或疑虑，请通过 <a href="https://github.com/dufu1991/youran-tab/issues" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub Issues</a> 与我们联系。',
        'guide.title': '使用手册',
        'guide.install.title': '安装',
        'guide.install.desc': '在 Chrome 应用商店、Edge 扩展商店或 Firefox 附加组件中搜索「悠然标签页」并安装，安装后打开新标签页即可使用。360、QQ、搜狗等国产浏览器可以从 Edge 扩展商店安装。首次使用会预置 Google、YouTube、ChatGPT 和百度 4 个网站，并默认使用随机背景。',
        'guide.addsite.title': '添加网站',
        'guide.addsite.desc': '有 3 种方式：<br />1. <strong>手动添加</strong>：在设置中打开「编辑模式」后点击「+ 添加网站」，或在空白处右键选择「添加网站」，填写名称和网址即可，图标会自动获取。<br />2. <strong>从当前标签页添加</strong>：在添加弹窗中直接选择已打开的标签页，详见下文。<br />3. <strong>在网页上右键加入</strong>：浏览网页时随手收藏，详见下文。',
        'guide.theme.title': '主题概览',
        'guide.theme.desc': '在设置面板中可选择经典、便当、终端、极简、玻璃、气泡、像素或便签 8 种主题。每种主题都有独立的配置项，切换主题不会丢失其他主题的设置，文件夹也可在所有可视化主题中使用。',
        'guide.classic.title': '经典主题',
        'guide.classic.desc': '标准图标网格布局，鼠标悬停时显示毛玻璃卡片背景。可配置项包括：容器宽度（400-1400px）、列数（3-8 列）、圆角、卡片透明度、毛玻璃模糊度、图标大小。列数会根据站点数量自动收缩，避免出现多余的空列。',
        'guide.bento.title': '便当主题',
        'guide.bento.desc': '提供两种布局模式：<br />1. <strong>动态布局</strong>（默认）：卡片大小由点击次数决定，使用 Treemap 算法自动排列。点击越多的站点占据越大面积，新添加的站点也有初始面积。文件夹卡片会累加内部站点的点击次数，因此常用文件夹也会自动放大。页面加载时快照点击次数，点击后不会立即重排。<br />2. <strong>固定网格</strong>：所有卡片等分，按设定列数排列。<br />可配置项包括：容器宽度、间距（4-32px）、圆角、卡片透明度、毛玻璃模糊度、图标大小、布局模式切换、固定模式列数。',
        'guide.folders.title': '文件夹',
        'guide.folders.desc': '文件夹用来收纳同类网站。在添加弹窗中切换到「文件夹」即可新建，可以勾选已有网站或当前标签页加入，并拖动调整顺序。<br />文件夹图标有 4 种：<strong>宫格</strong>（默认，显示前几个网站的图标，超过 4 个时第 4 格显示剩余数量）、<strong>堆叠</strong>（叠放显示前 3 个网站的图标）、<strong>自定义图片</strong>和<strong>粘贴 SVG</strong>。还可以设置图标背景色、是否显示背景、圆角和图标占比。<br />点击文件夹会在原位置附近展开浮层，点击里面的网站即可打开；在浮层中拖动可以调整顺序，拖到浮层外即可移出文件夹。<br /><strong>按分组打开</strong>：右键文件夹可以选择「打开全部标签页」，或「在标签页分组中打开全部」。后者会把文件夹内的网站放进一个以文件夹名称命名的标签页分组。暂时用不到的一组网页，可以先保存成文件夹，再在浏览器中关掉整个分组，释放标签栏和内存；下次需要时一键按分组打开，工作现场原样回来。<br />删除文件夹时，可以选择只删除文件夹并把内部网站放回主列表，或者连同内部网站一起删除。',
        'guide.organize.title': '编辑与整理',
        'guide.organize.desc': '在设置中打开「编辑模式」后，点击网站或文件夹即可编辑或删除，拖动可以调整顺序，拖到文件夹中间即可放进文件夹，完成后点击「完成」退出。删除网站或文件夹后会出现「撤销」提示，误删可以立即恢复。同时打开多个新标签页时，在其中一个页面中的修改会自动同步到其他页面。',
        'guide.tabs.title': '从当前标签页快速添加',
        'guide.tabs.desc': '添加网站或新建文件夹时，弹窗会列出当前浏览器窗口已打开的标签页，并按标签页分组归类。可以单选一个标签页自动填入标题和网址，也可以多选后批量添加；新建文件夹时还能整组勾选一个标签页分组，文件夹名称会自动补全。标签页超过 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">12</code> 个时会出现搜索框，可按标题、网址或分组名称筛选。',
        'guide.webadd.title': '在网页上右键加入',
        'guide.webadd.desc': '在任意网页的空白处右键，选择「加入悠然标签页」即可收藏当前网页，网页标题会作为网站名称。如果已经建有文件夹，菜单会展开为「主列表」和各个文件夹，可以直接放进指定文件夹。加入后网页右上角会短暂提示；已经收藏过的网页会提示「已在悠然标签页中」，不会重复添加。新网站会在下次打开或切回新标签页时出现。浏览器商店等受限页面无法显示提示，但网站仍会正常加入。',
        'guide.contextmenu.title': '右键菜单',
        'guide.contextmenu.desc': '在新标签页中右键（终端主题除外）：<br />1. <strong>右键网站</strong>：在新标签页中打开、编辑、移动到某个文件夹或移出文件夹、删除。<br />2. <strong>右键文件夹</strong>：打开全部标签页、在标签页分组中打开全部（需要浏览器支持标签页分组）、编辑文件夹、删除。<br />3. <strong>右键空白处</strong>：添加网站、换个背景。背景模式为随机时，会立即换一个新的随机背景；不是随机模式时，会从已保存的纯色、渐变、图片和动态背景中随机换一个并保留。',
        'guide.icons.title': '网站图标',
        'guide.icons.desc': '图标默认为「自动」：同时向网站自身、浏览器内置图标、Google、Favicon Extractor 和 icon.horse 等来源请求，跳过占位图，挑出最清晰的一个并保存在本地；都没有时生成首字母图标。编辑网站时也可以手动指定 Google、Extractor 或 icon.horse 作为图标源，或者上传自定义图标，并调整图标圆角。暗色模式下可以单独设置一套图标，适合在深色背景下看不清的线条图标。图标会长期缓存在本地，修改网站或更换图标源后会自动重新获取。',
        'guide.terminalDetail.title': '终端主题',
        'guide.terminalDetail.desc': '完整的命令行交互界面，支持全键盘操作。可用命令如下：<br /><br /><dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5"><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">h</code></dt><dd>显示帮助信息</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">ls</code></dt><dd>列出所有网站，文件夹内的网站会以「文件夹 / 网站」显示</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">&lt;序号&gt; / 名称 / 网址</code></dt><dd>按序号、名称或网址打开网站</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">add &lt;网址&gt; &lt;名称&gt;</code></dt><dd>添加新网站</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">edit &lt;序号&gt; &lt;网址&gt; &lt;名称&gt;</code></dt><dd>编辑网站</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">rm &lt;序号&gt;</code></dt><dd>删除网站</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s &lt;关键词&gt;</code></dt><dd>按默认项搜索或提问</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code></dt><dd>切换主题</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code></dt><dd>切换显示模式</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code></dt><dd>切换语言</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code></dt><dd>设置配色方案</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code></dt><dd>设置光标样式</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code></dt><dd>设置命令提示符</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">width &lt;像素值|full&gt;</code></dt><dd>设置终端宽度</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">set</code></dt><dd>打开设置面板</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code></dt><dd>导出数据</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code></dt><dd>导入数据</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">clear</code></dt><dd>清屏</dd></dl><br />提供 9 种配色（绿色、琥珀、蓝色、青色、紫色、粉色、红色、橙色、黑白）和 4 种光标样式（竖线、粗线、方块、下划线）。<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code> 不带参数输入时，可以用方向键选择选项，回车确认，Esc 取消。<br /><br /><strong>提示：</strong>受浏览器限制，打开新标签页时焦点默认在地址栏，点击页面任意位置即可开始输入命令。',
        'guide.minimal.title': '极简主题',
        'guide.minimal.desc': '纯文字列表风格，无图标无卡片，只显示站点名称链接。该主题无专属配置项。',
        'guide.glass.title': '玻璃主题',
        'guide.glass.desc': '毛玻璃药丸卡片横向列表布局。可配置项包括：列数（1-4 列）。搜索栏嵌入主界面，始终显示站点标题。适合搭配图片或渐变背景使用。',
        'guide.bubble.title': '气泡主题',
        'guide.bubble.desc': '圆形气泡悬浮效果，不显示站点标题。提供两种布局模式：<br />1. <strong>固定排列</strong>（默认）：气泡按顺序排列，间距均匀。<br />2. <strong>随机散布</strong>：气泡随机散布在画布上，使用碰撞检测算法保证不重叠。<br />可配置项包括：布局模式切换、气泡大小（48-120px）。搜索栏以可展开的搜索气泡形式呈现。',
        'guide.pixel.title': '像素主题',
        'guide.pixel.desc': '像素复古风格，菜单列表交互。站点以列表形式展示，始终显示站点标题。搜索栏采用命令行提示符样式。鼠标悬停时有扫描线动画效果。该主题无专属配置项。',
        'guide.sticky.title': '便签主题',
        'guide.sticky.desc': '便利贴公告板风格，便签带彩色纸张和图钉装饰，角度随机倾斜，按瀑布流排列。未设置背景时，亮色模式显示软木板，暗色模式显示深色木板；也可以像其他主题一样设置背景。搜索框以便签形式嵌入，带手绘虚线输入框。可配置项：显示或隐藏站点标题。',
        'guide.search.title': '搜索功能',
        'guide.search.desc': '搜索框内置 Google、Bing、百度等 10 个搜索引擎和 ChatGPT、Claude、DeepSeek 等 10 个 AI 提问服务，可在设置中勾选启用、点星标设为默认，并选择默认使用搜索还是 AI 提问。点击搜索框前方的图标可以临时切换，只对当前页面生效，不影响浏览器自身的搜索设置。使用 AI 提问会打开对应网站，建议先登录该服务的账号。输入时会列出匹配的已收藏网站（包括文件夹内的），可按名称、域名或文件夹名称查找，方向键选择、回车打开，Ctrl / Cmd + 回车在新标签页中打开。在终端主题中，使用 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s</code> 命令加关键词即可按默认项搜索或提问。',
        'guide.background.title': '背景设置',
        'guide.background.desc': '除终端和极简主题外，其他主题都支持背景设置，共 6 种模式：<br />1. <strong>无</strong>：使用浏览器默认的新标签页背景色。便签主题在无背景时显示软木板。<br />2. <strong>纯色</strong>：亮色和暗色各预置 18 种颜色，也可以自定义颜色。<br />3. <strong>渐变</strong>：亮色和暗色各预置 18 种渐变，可以点击「随机渐变」继续生成。<br />4. <strong>图片</strong>：从本地上传，最多 18 张，只保存在本地。<br />5. <strong>动态</strong>：亮色和暗色各预置 18 种动态背景。<br />6. <strong>随机</strong>（新用户默认）：在勾选的纯色、渐变、图片、动态中随机切换，每次打开新标签页或点击「换个背景」时重新选择。随机来源可选「每次生成」，每次都生成全新的背景；也可选「从预设中选」，只在已有预设和上传的图片中选择。<br />纯色、渐变和动态的预设不满意可以删除，新增时会重新生成，也可以一键「重新生成 18 种」。亮色和暗色模式的背景配置相互独立。',
        'guide.darkmode.title': '暗色模式',
        'guide.darkmode.desc': '支持自动跟随系统、手动亮色和手动暗色 3 种模式。暗色模式下可以为站点配置独立的图标。',
        'guide.importexport.title': '导入导出',
        'guide.importexport.desc': '在设置中可以导出数据，导出时可选择「仅站点」「仅设置」或「站点 + 设置」，文件名会自动带上扩展版本号。站点数据包含文件夹结构、文件夹图标与样式以及内部网站。导入时，站点会与现有数据合并并跳过重复项；设置会覆盖当前所有设置，导入后页面自动刷新。来自更高版本的文件需要先升级扩展再导入。终端主题中也可以使用 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code> 和 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code> 命令完成相同操作。',
        'guide.browser.title': '权限说明',
        'guide.browser.desc': '各项浏览器权限的用途如下：<br />1. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code>：添加网站或新建文件夹时读取当前窗口标签页的标题、网址和分组名称，以及把文件夹在标签页分组中打开。<br />2. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code>：在网页右键菜单中提供「加入悠然标签页」。<br />3. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code>：加入网页后，在当前网页右上角显示一条提示。<br />4. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code>：保存站点和设置，并在后台和新标签页之间传递待加入的网页。<br />5. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code>（仅 Chrome 和 Edge）：解除扩展存储的容量上限，上传的自定义图标较多时也能完整保存。<br />6. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code>：在需要时调用浏览器默认的搜索引擎。<br />7. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code>（仅 Chrome 和 Edge）：读取浏览器内置的网站图标，作为图标来源之一。<br />8. 图标服务的访问权限（Google、gstatic、Favicon Extractor、icon.horse）：获取并缓存网站图标。',
        'guide.align.title': '对齐方式',
        'guide.align.desc': '内容支持顶部、居中、底部 3 种垂直对齐方式。每种主题的对齐方式独立保存，互不影响。',
        'guide.reset.title': '重置设置与清除缓存',
        'guide.reset.desc': '「重置设置」会把所有设置恢复为默认值，已添加的站点数据和点击计数会保留，只恢复外观和功能配置。「清除图标缓存」会清空所有已缓存的网站图标，下次打开时重新下载。',
        'changelog.title': '版本说明',
        'changelog.storeDelayHint': '由于浏览器商店审核，商店版本可能有延迟。',
        'changelog.v1.feat1': '8 种主题：经典、便当、终端、极简、玻璃、气泡、像素、便签',
        'changelog.v1.feat2': '内置搜索框',
        'changelog.v1.feat3': '多种背景模式：纯色、渐变、图片、动态、随机',
        'changelog.v1.feat4': '暗色模式，支持跟随系统或手动切换',
        'changelog.v1.feat5': '10 种语言支持',
        'changelog.v1.feat6': '站点配置导入导出',
        'changelog.v1.feat7': '3 种在线图标源，支持自定义上传',
    },
    'zh-TW': {
        'site.title': '悠然標籤頁 - 可自訂的瀏覽器新標籤頁',
        'site.description': '悠然標籤頁：一款開源且高度可自訂的瀏覽器新標籤頁擴充功能，支援多種主題、背景和版面。',
        'lang.label': '語言',
        'lang.auto': '跟隨瀏覽器',
        'theme.label': '外觀',
        'theme.auto': '自動',
        'theme.light': '亮色',
        'theme.dark': '暗色',
        'hero.badge': '適用於 Chrome、Edge、Firefox',
        'hero.compat': '360、QQ、搜狗、360 極速、獵豹等國產瀏覽器可透過 Edge 擴充功能市場直接安裝，完全相容。',
        'hero.title': '悠然標籤頁',
        'hero.desc': '一款開源、高度可自訂的瀏覽器新標籤頁擴充功能。<br />8 種主題、10 種語言、多種背景，打造專屬你的瀏覽器起始頁。',
        'themes.title': '8 種主題，隨心切換',
        'themes.subtitle': '每種主題都有獨立的設定項，滿足不同使用習慣。',
        'themes.classic.title': '經典',
        'themes.classic.desc': '傳統網格版面，可調整欄數、間距、圓角、透明度和圖示大小。簡潔實用的預設選擇。',
        'themes.bento.title': '便當',
        'themes.bento.desc': '類似 macOS 小工具的卡片式版面，支援固定或自適應網格，自動統計點擊次數，並根據點擊次數自動放大。',
        'themes.terminal.title': '終端',
        'themes.terminal.desc': '完整的命令列互動體驗。9 種配色、4 種游標樣式、可自訂提示符號，極客的選擇。',
        'themes.minimal.title': '極簡',
        'themes.minimal.desc': '移除所有多餘元素，只保留站點。乾淨、專注、無干擾。',
        'themes.glass.title': '玻璃',
        'themes.glass.desc': '毛玻璃藥丸卡片，橫向列表佈局，欄數可調，簡潔現代。',
        'themes.bubble.title': '氣泡',
        'themes.bubble.desc': '圓形氣泡懸浮效果，支援固定排列與隨機散佈，大小可調。',
        'themes.pixel.title': '像素',
        'themes.pixel.desc': '像素復古風格，命令列式搜尋框，選單列表互動。',
        'themes.sticky.title': '便條',
        'themes.sticky.desc': '便利貼公告板風格，圖釘裝飾，彩色紙張，瀑布流佈局。',
        'features.title': '功能豐富，輕量運行',
        'features.subtitle': '完全開源，所有資料儲存在本地，無需登入，不蒐集任何資訊。',
        'features.search.title': '快速搜尋',
        'features.search.desc': '內建 10 個主流搜尋引擎與 10 個 AI 提問服務，可勾選啟用、設定預設項目，也能在搜尋框前方臨時切換，不影響瀏覽器本身的搜尋設定。輸入時還會列出符合的已收藏網站。',
        'features.folders.title': '資料夾收納',
        'features.folders.desc': '把同類網站收進資料夾，以宮格或堆疊圖示呈現，可整組儲存分頁群組，也能一鍵依群組開啟全部。',
        'features.clip.title': '網頁一鍵加入',
        'features.clip.desc': '在任意網頁上按右鍵選擇「加入悠然標籤頁」，直接放進主列表或指定資料夾。',
        'features.background.title': '多種背景',
        'features.background.desc': '純色、漸層、圖片、動態和隨機背景，亮色與暗色獨立設定，隨機模式每次開啟都有新背景。',
        'features.dark.title': '暗色模式',
        'features.dark.desc': '自動跟隨系統，也可手動切換亮色或暗色。',
        'features.languages.title': '10 種語言',
        'features.languages.desc': '中、英、日、韓、法、德、西、俄、義大利語，自動偵測系統語言。',
        'features.icons.title': '清晰圖示',
        'features.icons.desc': '自動從多個圖示來源挑出最清晰的一個，也可手動指定圖示來源、上傳自訂圖示，並為暗色模式單獨設定圖示。',
        'features.organize.title': '拖曳整理',
        'features.organize.desc': '編輯模式下拖曳即可排序，拖到資料夾上即可歸類；誤刪網站或資料夾可以立即復原。',
        'features.sync.title': '匯入匯出',
        'features.sync.desc': '站點和設定可以分別或一併匯出為 JSON，換裝置時一鍵還原。',
        'foldersSpotlight.title': '分頁太多？收進資料夾，要用時一鍵開啟',
        'foldersSpotlight.desc': '把一組正在使用的網頁儲存成資料夾，暫時用不到時整組關閉，釋放分頁列和電腦記憶體。下次需要時，對資料夾按右鍵選擇「在分頁群組中開啟全部」，網頁會依資料夾名稱重新組成一個分頁群組，工作現場原樣回來。',
        'foldersSpotlight.step1.title': '整組儲存',
        'foldersSpotlight.step1.desc': '新增資料夾時直接勾選目前的分頁群組，也可以在任意網頁上按右鍵，加入指定資料夾。',
        'foldersSpotlight.step2.title': '放心關閉',
        'foldersSpotlight.step2.desc': '在瀏覽器中關閉整個分頁群組，不再佔用分頁列，也不再佔用記憶體。',
        'foldersSpotlight.step3.title': '一鍵還原',
        'foldersSpotlight.step3.desc': '對資料夾按右鍵，在分頁群組中開啟全部，群組會自動以資料夾名稱命名。',
        'foldersSpotlight.sceneTitle': '適合這些情境',
        'foldersSpotlight.sceneDesc': '專案後台、活動頁面、文件資料、臨時調查……這些網頁往往只集中使用幾天，不值得加入書籤，卻又需要暫時保留，用資料夾收著最合適。',
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
        'nav.name': '悠然標籤頁',
        'nav.home': '首頁',
        'nav.support': '支持',
        'nav.privacy': '隱私政策',
        'nav.guide': '使用手冊',
        'nav.changelog': '版本說明',
        'support.title': '支持悠然標籤頁',
        'support.subtitle': '如果這個專案對你有幫助，歡迎透過以下方式支持我。你的支持將用於持續開發、維護與打磨體驗。',
        'support.note': '歡迎在贊助留言中附上你的 GitHub 或其他社群帳號連結，我會在專案倉庫與官網的致謝名單中向你致謝。',
        'support.buymeacoffee.title': 'Buy Me a Coffee',
        'support.buymeacoffee.desc': '透過 Buy Me a Coffee 贊助，支持我持續打磨這個專案。',
        'support.paypal.desc': '使用 PayPal 快速支持，適合海外或跨地區支付。',
        'support.wechat.title': '微信贊賞',
        'support.wechat.desc': '打開微信掃一掃，感謝你的支持與鼓勵。',
        'support.alipay.title': '支付寶收款',
        'support.alipay.desc': '使用支付寶掃一掃，支持專案持續迭代更新。',
        'support.openLink': '前往支持',
        'privacy.title': '隱私政策',
        'privacy.updated': '最後更新：2026 年 11 月 18 日',
        'privacy.intro.title': '概述',
        'privacy.intro.desc': '悠然標籤頁（以下簡稱「本擴充功能」）是一款開源的瀏覽器新標籤頁擴充功能。我們高度重視您的隱私，本擴充功能不會收集、儲存或傳輸任何使用者個人資料。',
        'privacy.collect.title': '資料收集',
        'privacy.collect.desc': '本擴充功能不會收集任何個人資訊或使用資料。所有設定資料（包括站點列表、主題設定、背景設定等）均儲存在瀏覽器本機儲存空間中，不會傳送到任何外部伺服器。使用「從目前分頁新增」時，本擴充功能只會在本機讀取目前瀏覽器視窗中已開啟分頁和分頁群組的標題、網址與群組名稱，用於顯示選擇列表。使用網頁右鍵選單「加入悠然標籤頁」時，本擴充功能只會讀取你按右鍵的這個網頁的標題和網址，並儲存為站點。',
        'privacy.storage.title': '本地儲存',
        'privacy.storage.desc': '本擴充功能使用瀏覽器的擴充功能儲存空間（storage.local）儲存你的站點和個人化設定。背景指令碼會讀取其中的站點列表，用於判斷網頁是否已加入和產生資料夾選單，並透過它把右鍵加入的網頁交給新標籤頁。從 0.5.0 之前的版本升級時，原本儲存在 localStorage 中的資料會自動遷移過來，並在本機保留一份備份。這些資料完全儲存在你的裝置上，你可以隨時透過擴充功能的匯出功能備份資料，也可以透過解除安裝擴充功能清除所有資料。',
        'privacy.network.title': '網路請求',
        'privacy.network.desc': '本擴充功能僅在取得站點圖示時請求公開圖示服務（Google、Favicon Extractor、icon.horse）和網站本身的圖示檔案，請求中只包含網站網域名稱。當你提交搜尋或 AI 提問時，查詢內容會直接傳送至所選的第三方服務並開啟結果頁面。本擴充功能及其開發者不會收集或儲存查詢內容，也不會傳送你的站點列表、設定、背景等本機設定資料。',
        'privacy.thirdparty.title': '第三方服務',
        'privacy.thirdparty.desc': '本擴充功能不整合任何第三方分析、廣告或追蹤服務。',
        'privacy.permissions.title': '權限說明',
        'privacy.permissions.desc': '本擴充功能只申請運作所需的權限：<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code> 與 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code> 用於讀取目前視窗分頁的標題、網址和群組名稱，並在分頁群組中開啟資料夾；<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code> 用於在網頁右鍵選單中提供「加入悠然標籤頁」；<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code> 與 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code> 僅用於在你點擊該選單後，在目前網頁顯示一則加入提示，不會讀取頁面內容；<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code> 用於儲存站點和設定，並在擴充功能內部傳遞待加入的網頁；<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code>（僅 Chrome 和 Edge）用於解除擴充功能儲存空間的容量上限，避免上傳的自訂圖示較多時無法儲存；<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code> 用於呼叫瀏覽器預設搜尋引擎；<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> 用於讀取瀏覽器內建的網站圖示。本擴充功能不會讀取頁面正文、表單內容、個人身分資訊、帳戶資訊、密碼或付款資料，也不會存取你的瀏覽記錄或書籤。',
        'privacy.changes.title': '政策變更',
        'privacy.changes.desc': '如本隱私政策有任何變更，我們將在此頁面更新。由於本擴充功能不收集任何資料，預計本政策不會發生重大變化。',
        'privacy.opensource.title': '開源透明',
        'privacy.opensource.desc': '本擴充功能完全開源，原始碼託管在 <a href="https://github.com/dufu1991/youran-tab" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub</a>，歡迎任何人審查程式碼以驗證我們的隱私承諾。',
        'privacy.contact.title': '聯絡方式',
        'privacy.contact.desc': '如有任何隱私相關的問題或疑慮，請透過 <a href="https://github.com/dufu1991/youran-tab/issues" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub Issues</a> 與我們聯繫。',
        'guide.title': '使用手冊',
        'guide.install.title': '安裝',
        'guide.install.desc': '在 Chrome 線上應用程式商店、Edge 擴充功能商店或 Firefox 附加元件中搜尋「悠然標籤頁」並安裝，安裝後開啟新標籤頁即可使用。360、QQ、搜狗等中國瀏覽器可以從 Edge 擴充功能商店安裝。首次使用會預先放入 Google、YouTube、ChatGPT 和百度 4 個網站，並預設使用隨機背景。',
        'guide.addsite.title': '新增網站',
        'guide.addsite.desc': '共有 3 種方式：<br />1. <strong>手動新增</strong>：在設定中開啟「編輯模式」後點擊「+ 新增網站」，或在空白處按右鍵選擇「新增網站」，填寫名稱和網址即可，圖示會自動取得。<br />2. <strong>從目前分頁新增</strong>：在新增視窗中直接選擇已開啟的分頁，詳見下文。<br />3. <strong>在網頁上按右鍵加入</strong>：瀏覽網頁時隨手收藏，詳見下文。',
        'guide.theme.title': '主題概覽',
        'guide.theme.desc': '在設定面板中可選擇經典、便當、終端、極簡、玻璃、氣泡、像素或便條 8 種主題。每種主題都有獨立的設定項，切換主題不會遺失其他主題的設定，資料夾也可在所有視覺化主題中使用。',
        'guide.classic.title': '經典主題',
        'guide.classic.desc': '標準圖示網格佈局，滑鼠懸停時顯示毛玻璃卡片背景。可設定項包括：容器寬度（400-1400px）、欄數（3-8 欄）、圓角、卡片透明度、毛玻璃模糊度、圖示大小。欄數會根據站點數量自動收縮，避免出現多餘的空欄。',
        'guide.bento.title': '便當主題',
        'guide.bento.desc': '提供兩種佈局模式：<br />1. <strong>動態佈局</strong>（預設）：卡片大小由點擊次數決定，使用 Treemap 演算法自動排列。點擊越多的站點佔據越大面積，新增的站點也有初始面積。資料夾卡片會累加內部站點的點擊次數，因此常用資料夾也會自動放大。頁面載入時快照點擊次數，點擊後不會立即重排。<br />2. <strong>固定網格</strong>：所有卡片等分，按設定欄數排列。<br />可設定項包括：容器寬度、間距（4-32px）、圓角、卡片透明度、毛玻璃模糊度、圖示大小、佈局模式切換、固定模式欄數。',
        'guide.folders.title': '資料夾',
        'guide.folders.desc': '資料夾用來收納同類網站。在新增視窗中切換到「資料夾」即可新增，可以勾選現有網站或目前分頁加入，並拖曳調整順序。<br />資料夾圖示有 4 種：<strong>宮格</strong>（預設，顯示前幾個網站的圖示，超過 4 個時第 4 格顯示剩餘數量）、<strong>堆疊</strong>（疊放顯示前 3 個網站的圖示）、<strong>自訂圖片</strong>和<strong>貼上 SVG</strong>。還可以設定圖示背景色、是否顯示背景、圓角和圖示佔比。<br />點擊資料夾會在原位置附近展開浮層，點擊裡面的網站即可開啟；在浮層中拖曳可以調整順序，拖到浮層外即可移出資料夾。<br /><strong>依群組開啟</strong>：對資料夾按右鍵可以選擇「開啟全部分頁」，或「在分頁群組中開啟全部」。後者會把資料夾內的網站放進一個以資料夾名稱命名的分頁群組。暫時用不到的一組網頁，可以先儲存成資料夾，再在瀏覽器中關閉整個群組，釋放分頁列和記憶體；下次需要時一鍵依群組開啟，工作現場原樣回來。<br />刪除資料夾時，可以選擇只刪除資料夾並把內部網站放回主列表，或者連同內部網站一起刪除。',
        'guide.organize.title': '編輯與整理',
        'guide.organize.desc': '在設定中開啟「編輯模式」後，點擊網站或資料夾即可編輯或刪除，拖曳可以調整順序，拖到資料夾中間即可放進資料夾，完成後點擊「完成」退出。刪除網站或資料夾後會出現「復原」提示，誤刪可以立即還原。同時開啟多個新標籤頁時，在其中一個頁面中的修改會自動同步到其他頁面。',
        'guide.tabs.title': '從目前分頁快速新增',
        'guide.tabs.desc': '新增網站或新增資料夾時，視窗會列出目前瀏覽器視窗已開啟的分頁，並依分頁群組歸類。可以單選一個分頁自動填入標題和網址，也可以多選後批次新增；新增資料夾時還能整組勾選一個分頁群組，資料夾名稱會自動補全。分頁超過 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">12</code> 個時會出現搜尋框，可依標題、網址或群組名稱篩選。',
        'guide.webadd.title': '在網頁上按右鍵加入',
        'guide.webadd.desc': '在任意網頁的空白處按右鍵，選擇「加入悠然標籤頁」即可收藏目前網頁，網頁標題會作為網站名稱。如果已經建立資料夾，選單會展開為「主列表」和各個資料夾，可以直接放進指定資料夾。加入後網頁右上角會短暫顯示提示；已經收藏過的網頁會提示「已在悠然標籤頁中」，不會重複新增。新網站會在下次開啟或切回新標籤頁時出現。瀏覽器商店等受限頁面無法顯示提示，但網站仍會正常加入。',
        'guide.contextmenu.title': '右鍵選單',
        'guide.contextmenu.desc': '在新標籤頁中按右鍵（終端主題除外）：<br />1. <strong>右鍵網站</strong>：在新分頁中開啟、編輯、移動到某個資料夾或移出資料夾、刪除。<br />2. <strong>右鍵資料夾</strong>：開啟全部分頁、在分頁群組中開啟全部（需要瀏覽器支援分頁群組）、編輯資料夾、刪除。<br />3. <strong>右鍵空白處</strong>：新增網站、換個背景。背景模式為隨機時，會立即換一個新的隨機背景；不是隨機模式時，會從已儲存的純色、漸層、圖片和動態背景中隨機換一個並保留。',
        'guide.icons.title': '網站圖示',
        'guide.icons.desc': '圖示預設為「Auto」：同時向網站本身、瀏覽器內建圖示、Google、Favicon Extractor 和 icon.horse 等來源請求，跳過預留位置圖片，挑出最清晰的一個並儲存在本機；都沒有時會產生首字母圖示。編輯網站時也可以手動指定 Google、Extractor 或 icon.horse 作為圖示來源，或者上傳自訂圖示，並調整圖示圓角。暗色模式下可以單獨設定一套圖示，適合在深色背景下看不清的線條圖示。圖示會長期快取在本機，修改網站或更換圖示來源後會自動重新取得。',
        'guide.terminalDetail.title': '終端主題',
        'guide.terminalDetail.desc': '完整的命令列互動介面，支援全鍵盤操作。可用命令如下：<br /><br /><dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5"><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">h</code></dt><dd>顯示說明資訊</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">ls</code></dt><dd>列出所有網站，資料夾內的網站會以「資料夾 / 網站」顯示</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">&lt;序號&gt; / 名稱 / 網址</code></dt><dd>依序號、名稱或網址開啟網站</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">add &lt;網址&gt; &lt;名稱&gt;</code></dt><dd>新增網站</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">edit &lt;序號&gt; &lt;網址&gt; &lt;名稱&gt;</code></dt><dd>編輯網站</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">rm &lt;序號&gt;</code></dt><dd>刪除網站</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s &lt;關鍵字&gt;</code></dt><dd>依預設項目搜尋或提問</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code></dt><dd>切換主題</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code></dt><dd>切換顯示模式</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code></dt><dd>切換語言</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code></dt><dd>設定配色方案</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code></dt><dd>設定游標樣式</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code></dt><dd>設定命令提示字元</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">width &lt;像素值|full&gt;</code></dt><dd>設定終端寬度</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">set</code></dt><dd>開啟設定面板</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code></dt><dd>匯出資料</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code></dt><dd>匯入資料</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">clear</code></dt><dd>清除畫面</dd></dl><br />提供 9 種配色（綠色、琥珀、藍色、青色、紫色、粉色、紅色、橙色、黑白）和 4 種游標樣式（豎線、粗線、方塊、底線）。<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code> 不帶參數輸入時，可以用方向鍵選擇選項，按 Enter 確認，按 Esc 取消。<br /><br /><strong>提示：</strong>受瀏覽器限制，開啟新標籤頁時焦點預設在網址列，點擊頁面任意位置即可開始輸入命令。',
        'guide.minimal.title': '極簡主題',
        'guide.minimal.desc': '純文字列表風格，無圖示無卡片，只顯示站點名稱連結。該主題無專屬設定項。',
        'guide.glass.title': '玻璃主題',
        'guide.glass.desc': '毛玻璃藥丸卡片橫向列表佈局。可設定項包括：欄數（1-4 欄）。搜尋列嵌入主介面，始終顯示站點標題。適合搭配圖片或漸層背景使用。',
        'guide.bubble.title': '氣泡主題',
        'guide.bubble.desc': '圓形氣泡懸浮效果，不顯示站點標題。提供兩種佈局模式：<br />1. <strong>固定排列</strong>（預設）：氣泡按順序排列，間距均勻。<br />2. <strong>隨機散佈</strong>：氣泡隨機散佈在畫布上，使用碰撞偵測演算法保證不重疊。<br />可設定項包括：佈局模式切換、氣泡大小（48-120px）。搜尋列以可展開的搜尋氣泡形式呈現。',
        'guide.pixel.title': '像素主題',
        'guide.pixel.desc': '像素復古風格，選單列表互動。站點以列表形式展示，始終顯示站點標題。搜尋列採用命令列提示符號樣式。滑鼠懸停時有掃描線動畫效果。該主題無專屬設定項。',
        'guide.sticky.title': '便條主題',
        'guide.sticky.desc': '便利貼布告欄風格，便條帶彩色紙張和圖釘裝飾，角度隨機傾斜，以瀑布流排列。未設定背景時，亮色模式顯示軟木板，暗色模式顯示深色木板；也可以像其他主題一樣設定背景。搜尋框以便條形式嵌入，帶手繪虛線輸入框。可設定項目：顯示或隱藏站點標題。',
        'guide.search.title': '搜尋功能',
        'guide.search.desc': '搜尋框內建 Google、Bing、百度等 10 個搜尋引擎和 ChatGPT、Claude、DeepSeek 等 10 個 AI 提問服務，可在設定中勾選啟用、點星號設為預設，並選擇預設使用搜尋還是 AI 提問。點擊搜尋框前方的圖示可以臨時切換，只對目前頁面生效，不影響瀏覽器本身的搜尋設定。使用 AI 提問會開啟對應網站，建議先登入該服務的帳號。輸入時會列出符合的已收藏網站（包括資料夾內的），可依名稱、網域或資料夾名稱尋找，方向鍵選擇、按 Enter 開啟，Ctrl / Cmd + Enter 在新分頁中開啟。在終端主題中，使用 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s</code> 命令加關鍵字即可依預設項目搜尋或提問。',
        'guide.background.title': '背景設定',
        'guide.background.desc': '除終端和極簡主題外，其他主題都支援背景設定，共 6 種模式：<br />1. <strong>無</strong>：使用瀏覽器預設的新標籤頁背景色。便條主題在無背景時顯示軟木板。<br />2. <strong>純色</strong>：亮色和暗色各預置 18 種顏色，也可以自訂顏色。<br />3. <strong>漸層</strong>：亮色和暗色各預置 18 種漸層，可以點擊「隨機漸層」繼續生成。<br />4. <strong>圖片</strong>：從本機上傳，最多 18 張，只儲存在本機。<br />5. <strong>動態</strong>：亮色和暗色各預置 18 種動態背景。<br />6. <strong>隨機</strong>（新使用者預設）：在勾選的純色、漸層、圖片、動態中隨機切換，每次開啟新標籤頁或點擊「換個背景」時重新選擇。隨機來源可選「每次生成」，每次都生成全新的背景；也可選「從預設中選」，只在現有預設和上傳的圖片中選擇。<br />純色、漸層和動態的預設不滿意可以刪除，新增時會重新生成，也可以一鍵「重新生成 18 種」。亮色和暗色模式的背景設定相互獨立。',
        'guide.darkmode.title': '暗色模式',
        'guide.darkmode.desc': '支援自動跟隨系統、手動亮色和手動暗色 3 種模式。暗色模式下可以為站點設定獨立的圖示。',
        'guide.importexport.title': '匯入匯出',
        'guide.importexport.desc': '在設定中可以匯出資料，匯出時可選擇「僅站點」「僅設定」或「站點 + 設定」，檔名會自動帶上擴充功能版本號。站點資料包含資料夾結構、資料夾圖示與樣式以及內部網站。匯入時，站點會與現有資料合併並跳過重複項；設定會覆蓋目前所有設定，匯入後頁面自動重新整理。來自較新版本的檔案需要先升級擴充功能再匯入。終端主題中也可以使用 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code> 和 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code> 命令完成相同操作。',
        'guide.browser.title': '權限說明',
        'guide.browser.desc': '各項瀏覽器權限的用途如下：<br />1. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code>：新增網站或新增資料夾時讀取目前視窗分頁的標題、網址和群組名稱，以及把資料夾在分頁群組中開啟。<br />2. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code>：在網頁右鍵選單中提供「加入悠然標籤頁」。<br />3. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code>：加入網頁後，在目前網頁右上角顯示一則提示。<br />4. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code>：儲存站點和設定，並在背景和新標籤頁之間傳遞待加入的網頁。<br />5. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code>（僅 Chrome 和 Edge）：解除擴充功能儲存空間的容量上限，上傳的自訂圖示較多時也能完整儲存。<br />6. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code>：在需要時呼叫瀏覽器預設的搜尋引擎。<br />7. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code>（僅 Chrome 和 Edge）：讀取瀏覽器內建的網站圖示，作為圖示來源之一。<br />8. 圖示服務的存取權限（Google、gstatic、Favicon Extractor、icon.horse）：取得並快取網站圖示。',
        'guide.align.title': '對齊方式',
        'guide.align.desc': '內容支援頂部、置中、底部 3 種垂直對齊方式。每種主題的對齊方式獨立儲存，互不影響。',
        'guide.reset.title': '重設設定與清除快取',
        'guide.reset.desc': '「重設」會把所有設定恢復為預設值，已新增的站點資料和點擊計數會保留，只恢復外觀和功能設定。「清除圖示快取」會清空所有已快取的網站圖示，下次開啟時重新下載。',
        'changelog.title': '版本說明',
        'changelog.storeDelayHint': '由於瀏覽器商店審核，商店版本可能會有延遲。',
        'changelog.v1.feat1': '8 種主題：經典、便當、終端、極簡、玻璃、氣泡、像素、便條',
        'changelog.v1.feat2': '內建搜尋框',
        'changelog.v1.feat3': '多種背景模式：純色、漸層、圖片、動態、隨機',
        'changelog.v1.feat4': '暗色模式，支援跟隨系統或手動切換',
        'changelog.v1.feat5': '10 種語言支援',
        'changelog.v1.feat6': '站點設定匯入匯出',
        'changelog.v1.feat7': '3 種線上圖示來源，支援自訂上傳',
    },
    'ja': {
        'site.title': '悠然タブ - カスタマイズ可能な新しいタブ',
        'site.description':
            '悠然タブは、複数のテーマ、背景、レイアウトを備えたオープンソースで高いカスタマイズ性の新しいタブ拡張機能です。',
        'lang.label': '言語',
        'lang.auto': 'ブラウザに従う',
        'theme.label': 'テーマ',
        'theme.auto': '自動',
        'theme.light': 'ライト',
        'theme.dark': 'ダーク',
        'hero.badge': 'Chrome / Edge / Firefox に対応',
        'hero.compat': '360、QQ、Sogou、Liebao などの中国製ブラウザは Edge アドオンストアから直接インストールできます。完全互換。',
        'hero.title': '悠然タブ',
        'hero.desc':
            'オープンソースで高いカスタマイズ性の新しいタブ拡張機能。<br />8 つのテーマ、10 言語、複数の背景で、あなただけのスタートページを作成。',
        'themes.title': '8 つのテーマを自由に切り替え',
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
        'themes.glass.title': 'グラス',
        'themes.glass.desc': 'すりガラスのピル型カードを横並びに配置。列数を調整でき、すっきりとモダンな外観。',
        'themes.bubble.title': 'バブル',
        'themes.bubble.desc': '浮遊する丸いバブル。固定配置とランダム散布をサポートし、サイズ調整可能。',
        'themes.pixel.title': 'ピクセル',
        'themes.pixel.desc': 'レトロなピクセルスタイル。コマンドプロンプト風の検索バーとメニューリスト操作。',
        'themes.sticky.title': 'ふせん',
        'themes.sticky.desc': '付箋の掲示板スタイル。ピン装飾、カラフルな紙、ウォーターフォールレイアウト。',
        'features.title': '豊富な機能、軽量動作',
        'features.subtitle': '完全にオープンソース。すべてのデータはローカルに保存され、ログイン不要、情報収集なし。',
        'features.search.title': 'クイック検索',
        'features.search.desc': '主要な検索エンジン 10 種類と AI アシスタント 10 種類を内蔵。使うものを選んでデフォルトを設定でき、検索バー前方から一時的に切り替えることもできます。ブラウザ自体の検索設定には影響しません。また、入力すると保存済みのサイトも候補に表示されます。',
        'features.folders.title': 'フォルダーで整理',
        'features.folders.desc': '同じ種類のサイトをフォルダーにまとめ、グリッドまたはスタックのアイコンで表示。タブグループをまるごと保存し、ワンクリックでタブグループとしてすべて開けます。',
        'features.clip.title': 'ウェブページをワンクリックで追加',
        'features.clip.desc': '任意のウェブページで右クリックし「悠然タブに追加」を選ぶと、メインリストまたは指定したフォルダーにそのまま追加されます。',
        'features.background.title': '多彩な背景',
        'features.background.desc': '単色、グラデーション、画像、動的、ランダムの背景を、ライト / ダークそれぞれ個別に設定できます。ランダムモードなら開くたびに新しい背景になります。',
        'features.dark.title': 'ダークモード',
        'features.dark.desc': 'システムに自動追従、または手動でライト / ダークを切り替え。',
        'features.languages.title': '10 言語',
        'features.languages.desc':
            '中国語、英語、日本語、韓国語、フランス語、ドイツ語、スペイン語、ロシア語、イタリア語に対応。システム言語を自動検出。',
        'features.icons.title': 'くっきりアイコン',
        'features.icons.desc': '複数のアイコンソースから最も鮮明なものを自動で選択。アイコンソースの手動指定やカスタムアイコンのアップロード、ダークモード用アイコンの個別設定もできます。',
        'features.organize.title': 'ドラッグで整理',
        'features.organize.desc': '編集モードでドラッグして並べ替え、フォルダーにドロップして分類できます。サイトやフォルダーを誤って削除しても、すぐに元に戻せます。',
        'features.sync.title': 'インポート / エクスポート',
        'features.sync.desc': 'サイトと設定は個別にも一緒にも JSON としてエクスポートでき、デバイスを替えてもワンクリックで復元できます。',
        'foldersSpotlight.title': 'タブが多すぎる？フォルダーにまとめて、必要なときワンクリックで開く',
        'foldersSpotlight.desc':
            '使っているページ一式をフォルダーとして保存し、しばらく使わないときはグループごと閉じて、タブバーとパソコンのメモリを解放。次に必要になったら、フォルダーを右クリックして「タブグループですべて開く」を選ぶと、ページがフォルダー名のタブグループとして復活し、作業環境がそのまま戻ります。',
        'foldersSpotlight.step1.title': 'グループごと保存',
        'foldersSpotlight.step1.desc': 'フォルダーの作成時に現在のタブグループをそのまま選択できます。任意のウェブページで右クリックして、指定のフォルダーに追加することもできます。',
        'foldersSpotlight.step2.title': '安心して閉じる',
        'foldersSpotlight.step2.desc': 'ブラウザでタブグループごと閉じれば、タブバーもメモリも使いません。',
        'foldersSpotlight.step3.title': 'ワンクリックで復元',
        'foldersSpotlight.step3.desc': 'フォルダーを右クリックしてタブグループですべて開くと、グループ名は自動的にフォルダー名になります。',
        'foldersSpotlight.sceneTitle': 'こんな場面に最適',
        'foldersSpotlight.sceneDesc':
            'プロジェクトの管理画面、イベントページ、ドキュメント、一時的な調査……こうしたページは数日だけ集中して使うことが多く、ブックマークするほどではないものの、しばらくは残しておきたいもの。フォルダーにまとめておくのが最適です。',
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
        'nav.name': '悠然タブ',
        'nav.home': 'ホーム',
        'nav.support': 'サポート',
        'nav.privacy': 'プライバシーポリシー',
        'nav.guide': 'ユーザーガイド',
        'nav.changelog': '変更履歴',
        'support.title': '悠然タブをサポート',
        'support.subtitle': 'このプロジェクトが役に立った場合は、以下の方法で支援していただけます。ご支援は継続的な開発、保守、体験向上に活用されます。',
        'support.note': '支援メッセージに GitHub プロフィールや SNS リンクを添えていただければ、プロジェクトのリポジトリと公式サイトの謝辞一覧でお礼を掲載します。',
        'support.buymeacoffee.title': 'Buy Me a Coffee',
        'support.buymeacoffee.desc': 'Buy Me a Coffee から支援していただくことで、このプロジェクトを継続的に磨き続けられます。',
        'support.paypal.desc': 'PayPal ですばやく支援できます。海外や地域をまたぐ支払いにも便利です。',
        'support.wechat.title': 'WeChat 支援',
        'support.wechat.desc': 'WeChat でコードを読み取って支援できます。ご支援と応援に感謝します。',
        'support.alipay.title': 'Alipay',
        'support.alipay.desc': 'Alipay でコードを読み取り、プロジェクトの継続的な改善を支援できます。',
        'support.openLink': '支援する',
        'privacy.title': 'プライバシーポリシー',
        'privacy.updated': '最終更新日：2026 年 11 月 18 日',
        'privacy.intro.title': '概要',
        'privacy.intro.desc': '悠然タブ（以下「本拡張機能」）は、オープンソースのブラウザ新しいタブ拡張機能です。私たちはお客様のプライバシーを非常に重視しており、本拡張機能はいかなるユーザー個人データも収集、保存、送信しません。',
        'privacy.collect.title': 'データ収集',
        'privacy.collect.desc': 'この拡張機能は、個人情報や利用データを一切収集しません。すべての設定データ（サイト一覧、テーマ設定、背景設定などを含む）はブラウザーのローカルストレージに保存され、外部サーバーには送信されません。「現在のタブ」から追加する際、この拡張機能は現在のブラウザーウィンドウで開いているタブとタブグループのタイトル、URL、グループ名をローカルで読み取り、選択リストの表示にのみ使用します。ウェブページの右クリックメニュー「悠然タブに追加」を使う際は、右クリックしたそのページのタイトルと URL のみを読み取り、サイトとして保存します。',
        'privacy.storage.title': 'ローカルストレージ',
        'privacy.storage.desc': 'この拡張機能は、ブラウザーの拡張機能ストレージ（storage.local）を使ってサイトと個人設定を保存します。バックグラウンドスクリプトはその中のサイト一覧を読み取り、ページが追加済みかどうかの判定とフォルダーメニューの作成に使い、右クリックメニューから追加したページを新しいタブへ受け渡す際にも使用します。0.5.0 より前のバージョンからアップデートすると、localStorage に保存されていたデータは自動的に移行され、バックアップとしてローカルにも残ります。これらのデータはすべてお使いのデバイス上にのみ保存されます。拡張機能のエクスポート機能でいつでもデータをバックアップでき、拡張機能をアンインストールするとすべてのデータを削除できます。',
        'privacy.network.title': 'ネットワークリクエスト',
        'privacy.network.desc': 'この拡張機能は、サイトアイコンを取得するときにのみ、公開アイコンサービス（Google、Favicon Extractor、icon.horse）とサイト自身のアイコンファイルにリクエストします。リクエストに含まれるのはサイトのドメイン名のみです。検索や AI への質問を送信すると、クエリは選択したサードパーティサービスに直接送信され、結果ページが開きます。この拡張機能とその開発者は、クエリを収集または保存せず、サイト一覧、設定、背景などのローカル設定データも送信しません。',
        'privacy.thirdparty.title': 'サードパーティサービス',
        'privacy.thirdparty.desc': '本拡張機能は、サードパーティの分析、広告、またはトラッキングサービスを一切統合していません。',
        'privacy.permissions.title': '権限について',
        'privacy.permissions.desc': 'この拡張機能は、動作に必要な権限のみを要求します：<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code> と <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code> は、現在のウィンドウのタブのタイトル、URL、グループ名を読み取り、フォルダーをタブグループで開くために使用します。<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code> は、ウェブページの右クリックメニューに「悠然タブに追加」を表示するために使用します。<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code> と <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code> は、そのメニューをクリックした後に現在のページへ追加通知を表示するためだけに使用し、ページの内容は読み取りません。<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code> は、サイトと設定を保存し、拡張機能内部で追加待ちのページを受け渡すために使用します。<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code>（Chrome と Edge のみ）は、拡張機能ストレージの容量上限を解除し、アップロードしたカスタムアイコンが多くても保存できるようにするために使用します。<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code> は、ブラウザーの既定の検索エンジンを呼び出すために使用します。<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> は、ブラウザー内蔵のサイトアイコンを読み取るために使用します。この拡張機能は、ページ本文、フォーム内容、個人を特定できる情報、アカウント情報、パスワード、支払いデータを読み取らず、閲覧履歴やブックマークにもアクセスしません。',
        'privacy.changes.title': 'ポリシーの変更',
        'privacy.changes.desc': '本プライバシーポリシーに変更がある場合は、このページで更新します。本拡張機能はデータを一切収集しないため、本ポリシーに重大な変更が生じることは想定されません。',
        'privacy.opensource.title': 'オープンソースの透明性',
        'privacy.opensource.desc': '本拡張機能は完全にオープンソースであり、ソースコードは <a href="https://github.com/dufu1991/youran-tab" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub</a> でホストされています。プライバシーへの取り組みを確認するために、どなたでもコードを審査できます。',
        'privacy.contact.title': 'お問い合わせ',
        'privacy.contact.desc': 'プライバシーに関するご質問やご懸念がございましたら、<a href="https://github.com/dufu1991/youran-tab/issues" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub Issues</a> からお問い合わせください。',
        'guide.title': 'ユーザーガイド',
        'guide.install.title': 'インストール',
        'guide.install.desc': 'Chrome ウェブストア、Edge アドオンストア、または Firefox アドオンで「悠然タブ」を検索してインストールしてください。インストール後、新しいタブを開くとすぐに使用できます。360、QQ、Sogou などの中国系ブラウザーは Edge アドオンストアからインストールできます。初回起動時には Google、YouTube、ChatGPT、百度の 4 サイトがあらかじめ登録され、ランダム背景がデフォルトで有効になります。',
        'guide.addsite.title': 'サイトの追加',
        'guide.addsite.desc': '3 つの方法があります：<br />1. <strong>手動で追加</strong>：設定で「編集モード」をオンにして「+ サイト追加」をクリックするか、空白部分を右クリックして「サイト追加」を選び、名前と URL を入力します。アイコンは自動で取得されます。<br />2. <strong>現在のタブから追加</strong>：追加ダイアログで開いているタブを直接選択します。詳細は下記をご覧ください。<br />3. <strong>ウェブページを右クリックして追加</strong>：閲覧中のページをその場で保存できます。詳細は下記をご覧ください。',
        'guide.theme.title': 'テーマ概要',
        'guide.theme.desc': '設定パネルでクラシック、Bento、ターミナル、ミニマル、グラス、バブル、ピクセル、ふせんの 8 つのテーマから選択できます。各テーマには独立した設定項目があり、テーマを切り替えても他のテーマの設定は失われません。フォルダーはすべてのビジュアルテーマで利用できます。',
        'guide.classic.title': 'クラシックテーマ',
        'guide.classic.desc': '標準的なアイコングリッドレイアウトで、ホバー時にすりガラスのカード背景が表示されます。設定項目：コンテナ幅（400-1400px）、列数（3-8 列）、角丸、カードの透明度、すりガラスのぼかし度、アイコンサイズ。列数はサイト数に応じて自動的に縮小し、余分な空列を防ぎます。',
        'guide.bento.title': 'Bento テーマ',
        'guide.bento.desc': '2 つのレイアウトモードがあります：<br />1. <strong>ダイナミックレイアウト</strong>（デフォルト）：カードのサイズはクリック回数に基づき、Treemap アルゴリズムで自動配置されます。クリック数が多いサイトほど大きな面積を占め、新しいサイトにも初期面積があります。フォルダーカードは内部サイトのクリック数を合算するため、よく使うフォルダーも自動的に大きくなります。ページ読み込み時にクリック数のスナップショットが取られ、クリック後にすぐ再配置されることはありません。<br />2. <strong>固定グリッド</strong>：すべてのカードが均等に分割され、設定された列数で配置されます。<br />設定項目：コンテナ幅、間隔（4-32px）、角丸、カードの透明度、すりガラスのぼかし度、アイコンサイズ、レイアウトモードの切替、固定モードの列数。',
        'guide.folders.title': 'フォルダー',
        'guide.folders.desc': 'フォルダーは同じ種類のサイトをまとめるためのものです。追加ダイアログで「フォルダー」に切り替えると作成でき、既存のサイトや現在のタブを選んで追加したり、ドラッグで並べ替えたりできます。<br />フォルダーアイコンは 4 種類あります：<strong>グリッド</strong>（デフォルト。先頭の数サイトのアイコンを表示し、4 件を超えると 4 マス目に残りの件数を表示）、<strong>スタック</strong>（先頭の 3 サイトのアイコンを重ねて表示）、<strong>カスタム画像</strong>、<strong>SVG を貼り付け</strong>。アイコンの背景色、背景の表示有無、角丸、アイコンの比率も設定できます。<br />フォルダーをクリックすると元の位置の近くにパネルが開き、中のサイトをクリックすると開けます。パネル内でドラッグして並べ替えたり、パネルの外へドラッグしてフォルダーから出したりできます。<br /><strong>グループ単位で開く</strong>：フォルダーを右クリックして「すべてのタブを開く」または「タブグループですべて開く」を選べます。後者はフォルダー内のサイトを、フォルダー名のタブグループにまとめて開きます。しばらく使わないページ一式は、まずフォルダーとして保存してからブラウザーでグループごと閉じると、タブバーとメモリを解放できます。次に必要になったらワンクリックでグループとして開き、作業環境がそのまま戻ります。<br />フォルダーを削除するときは、フォルダーだけを削除して中のサイトをメインリストに戻すか、中のサイトごと削除するかを選べます。',
        'guide.organize.title': '編集と整理',
        'guide.organize.desc': '設定で「編集モード」をオンにすると、サイトやフォルダーをクリックして編集または削除できます。ドラッグで並べ替え、フォルダーの中央にドロップするとフォルダーに入れられます。終わったら「完了」をクリックして終了します。サイトやフォルダーを削除すると「元に戻す」の通知が表示され、誤って削除してもすぐに復元できます。複数の新しいタブを同時に開いている場合、1 つのページでの変更は他のページにも自動で同期されます。',
        'guide.tabs.title': '現在のタブからすばやく追加',
        'guide.tabs.desc': 'サイトの追加やフォルダーの作成時に、ダイアログには現在のブラウザーウィンドウで開いているタブがタブグループごとに一覧表示されます。タブを 1 つ選ぶとタイトルと URL が自動入力され、複数選択して一括追加もできます。フォルダー作成時はタブグループをまるごと選択でき、フォルダー名も自動で補完されます。タブが <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">12</code> 個を超えると検索ボックスが表示され、タイトル、URL、グループ名で絞り込めます。',
        'guide.webadd.title': 'ウェブページを右クリックして追加',
        'guide.webadd.desc': '任意のウェブページの空白部分を右クリックして「悠然タブに追加」を選ぶと、現在のページを保存できます。ページのタイトルがサイト名になります。フォルダーを作成済みの場合、メニューは「メインリスト」と各フォルダーに展開され、指定のフォルダーに直接追加できます。追加後はページの右上に短い通知が表示され、すでに保存済みのページには「すでに悠然タブにあります」と表示されて重複追加されません。新しいサイトは、次に新しいタブを開いたとき、または切り替えて戻ったときに表示されます。ブラウザーのストアなど制限のあるページでは通知を表示できませんが、サイトは問題なく追加されます。',
        'guide.contextmenu.title': 'コンテキストメニュー',
        'guide.contextmenu.desc': '新しいタブで右クリック（ターミナルテーマを除く）：<br />1. <strong>サイトを右クリック</strong>：新しいタブで開く、編集、フォルダーへ移動またはフォルダーから出す、削除。<br />2. <strong>フォルダーを右クリック</strong>：すべてのタブを開く、タブグループですべて開く（ブラウザーのタブグループ対応が必要）、フォルダーを編集、削除。<br />3. <strong>空白部分を右クリック</strong>：サイト追加、背景を切り替え。背景モードがランダムのときは、すぐに新しいランダム背景に切り替わります。ランダム以外のときは、保存済みの単色、グラデーション、画像、動的の背景からランダムに 1 つを選んで保持します。',
        'guide.icons.title': 'サイトアイコン',
        'guide.icons.desc': 'アイコンはデフォルトで「Auto」になっています。サイト自身、ブラウザー内蔵アイコン、Google、Favicon Extractor、icon.horse などに同時にリクエストし、プレースホルダー画像を除外して最も鮮明なものを選び、ローカルに保存します。どれも見つからない場合は頭文字のアイコンを生成します。サイトの編集時に、Google、Extractor、icon.horse をアイコンソースとして手動で指定したり、カスタムアイコンをアップロードしたり、アイコンの角丸を調整したりすることもできます。ダークモードでは別のアイコンを個別に設定でき、暗い背景で見えにくい線画アイコンに便利です。アイコンはローカルに長期間キャッシュされ、サイトを編集したりアイコンソースを変更したりすると自動で再取得されます。',
        'guide.terminalDetail.title': 'ターミナルテーマ',
        'guide.terminalDetail.desc': '完全なコマンドラインインターフェースで、キーボードのみで操作できます。利用可能なコマンド：<br /><br /><dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5"><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">h</code></dt><dd>ヘルプを表示</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">ls</code></dt><dd>全サイトを一覧表示。フォルダー内のサイトは「フォルダー / サイト」と表示</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">&lt;番号&gt; / 名前 / URL</code></dt><dd>番号、名前、または URL でサイトを開く</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">add &lt;URL&gt; &lt;名前&gt;</code></dt><dd>新しいサイトを追加</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">edit &lt;番号&gt; &lt;URL&gt; &lt;名前&gt;</code></dt><dd>サイトを編集</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">rm &lt;番号&gt;</code></dt><dd>サイトを削除</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s &lt;キーワード&gt;</code></dt><dd>デフォルトの項目で検索または質問</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code></dt><dd>テーマを切り替え</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code></dt><dd>表示モードを切り替え</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code></dt><dd>言語を切り替え</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code></dt><dd>配色を設定</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code></dt><dd>カーソルスタイルを設定</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code></dt><dd>コマンドプロンプトを設定</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">width &lt;ピクセル値|full&gt;</code></dt><dd>ターミナルの幅を設定</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">set</code></dt><dd>設定パネルを開く</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code></dt><dd>データをエクスポート</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code></dt><dd>データをインポート</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">clear</code></dt><dd>画面をクリア</dd></dl><br />配色は 9 種類（グリーン、アンバー、ブルー、シアン、パープル、ピンク、レッド、オレンジ、モノ）、カーソルスタイルは 4 種類（バー、ワイド、ブロック、アンダーライン）から選べます。<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code> を引数なしで入力すると、矢印キーで選択肢を選び、Enter で確定、Esc でキャンセルできます。<br /><br /><strong>ヒント：</strong>ブラウザーの制限により、新しいタブを開いたときはフォーカスがアドレスバーにあります。ページ上の任意の場所をクリックすると、コマンドを入力できます。',
        'guide.minimal.title': 'ミニマルテーマ',
        'guide.minimal.desc': 'テキストのみのリストスタイルで、アイコンやカードなし、サイト名のリンクのみ表示されます。このテーマには専用の設定項目はありません。',
        'guide.glass.title': 'グラステーマ',
        'guide.glass.desc': 'すりガラスのピルカードを横並びリストで表示。設定項目：列数（1-4 列）。検索バーはメインインターフェースに組み込まれ、サイト名は常に表示されます。画像やグラデーション背景との組み合わせがおすすめです。',
        'guide.bubble.title': 'バブルテーマ',
        'guide.bubble.desc': '円形バブルの浮遊エフェクト。サイト名は非表示です。2 つのレイアウトモードを提供：<br />1. <strong>固定配置</strong>（デフォルト）：バブルが順番に均等な間隔で配置されます。<br />2. <strong>ランダム</strong>：衝突検出アルゴリズムにより重ならないようランダムに散布されます。<br />設定項目：レイアウトモード切替、バブルサイズ（48-120px）。検索バーは展開可能な検索バブルとして表示されます。',
        'guide.pixel.title': 'ピクセルテーマ',
        'guide.pixel.desc': 'レトロなピクセルスタイル、メニューリスト形式のインタラクション。サイトはリスト形式で表示され、サイト名は常に表示されます。検索バーはコマンドプロンプトスタイルです。ホバー時にスキャンラインアニメーション効果があります。このテーマには専用の設定項目はありません。',
        'guide.sticky.title': 'ふせんテーマ',
        'guide.sticky.desc': '付箋の掲示板スタイル。付箋はカラフルな紙とピン飾り付きで、角度はランダムに傾き、滝状のレイアウトで並びます。背景を設定しない場合、ライトモードではコルクボード、ダークモードでは暗い木の板が表示され、他のテーマと同じように背景を設定することもできます。検索バーは手描き風の破線の入力欄を持つ付箋として埋め込まれます。設定項目：サイトタイトルの表示 / 非表示。',
        'guide.search.title': '検索機能',
        'guide.search.desc': '検索バーには Google、Bing、百度など 10 個の検索エンジンと、ChatGPT、Claude、DeepSeek など 10 個の AI アシスタントを内蔵。設定で有効にするものを選び、星でデフォルトに設定し、デフォルトを検索にするか AI への質問にするかも選べます。検索バー前方のアイコンをクリックすると一時的に切り替えられ、現在のページにのみ有効で、ブラウザー自体の検索設定には影響しません。AI アシスタントを使うと該当サイトが開くため、先にそのサービスにログインしておくことをおすすめします。入力すると、名前、ドメイン、フォルダー名に一致する保存済みサイト（フォルダー内のサイトを含む）が一覧表示され、矢印キーで選択、Enter で開き、Ctrl / Cmd + Enter で新しいタブに開けます。ターミナルテーマでは、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s</code> コマンドにキーワードを続けて、デフォルトの項目で検索または質問できます。',
        'guide.background.title': '背景設定',
        'guide.background.desc': 'ターミナルとミニマル以外のすべてのテーマが背景設定に対応しています。6 つのモードがあります：<br />1. <strong>なし</strong>：ブラウザー既定の新しいタブの背景色を使います。ふせんテーマは背景なしのときコルクボードを表示します。<br />2. <strong>単色</strong>：ライト / ダークそれぞれ 18 色がプリセットされ、カスタムカラーも使えます。<br />3. <strong>グラデーション</strong>：ライト / ダークそれぞれ 18 種類がプリセットされ、「ランダムグラデーション」をクリックすると続けて生成できます。<br />4. <strong>画像</strong>：ローカルからアップロードし、最大 18 枚、ローカルにのみ保存されます。<br />5. <strong>動的</strong>：ライト / ダークそれぞれ 18 種類の動的背景がプリセットされています。<br />6. <strong>ランダム</strong>（新規ユーザーのデフォルト）：選択した単色、グラデーション、画像、動的の中からランダムに切り替わり、新しいタブを開くたび、または「背景を切り替え」をクリックするたびに選び直されます。ランダムのソースは「毎回生成」を選ぶと毎回まったく新しい背景を生成し、「プリセットから」を選ぶと既存のプリセットとアップロードした画像の中からだけ選びます。<br />単色、グラデーション、動的のプリセットが気に入らなければ削除でき、追加時に新しく生成されます。「18 種類を再生成」でまとめて作り直すこともできます。ライトモードとダークモードの背景設定は互いに独立しています。',
        'guide.darkmode.title': 'ダークモード',
        'guide.darkmode.desc': 'システム自動追従、手動ライト、手動ダークの 3 つのモードに対応しています。ダークモードではサイトに個別のアイコンを設定できます。',
        'guide.importexport.title': 'インポート / エクスポート',
        'guide.importexport.desc': '設定からデータをエクスポートでき、エクスポート時には「サイトのみ」「設定のみ」「サイト + 設定」を選べます。ファイル名には拡張機能のバージョン番号が自動で付きます。サイトデータにはフォルダー構造、フォルダーのアイコンとスタイル、中のサイトが含まれます。インポート時、サイトは既存データとマージされ、重複はスキップされます。設定は現在のすべての設定を上書きし、インポート後にページが自動で再読み込みされます。新しいバージョンのファイルは、先に拡張機能を更新してからインポートしてください。ターミナルテーマでも <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code> と <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code> コマンドで同じ操作ができます。',
        'guide.browser.title': '権限について',
        'guide.browser.desc': '各ブラウザー権限の用途は次のとおりです：<br />1. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code>：サイトの追加やフォルダーの作成時に現在のウィンドウのタブのタイトル、URL、グループ名を読み取ること、およびフォルダーをタブグループで開くこと。<br />2. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code>：ウェブページの右クリックメニューに「悠然タブに追加」を表示すること。<br />3. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code>、<code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code>：ページを追加した後、現在のページの右上に通知を表示すること。<br />4. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code>：サイトと設定を保存すること、およびバックグラウンドと新しいタブの間で追加待ちのページを受け渡すこと。<br />5. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code>（Chrome と Edge のみ）：拡張機能ストレージの容量上限を解除し、アップロードしたカスタムアイコンが多くても保存できるようにすること。<br />6. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code>：必要に応じてブラウザーの既定の検索エンジンを呼び出すこと。<br />7. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code>（Chrome と Edge のみ）：ブラウザー内蔵のサイトアイコンを読み取り、アイコンソースの 1 つとして使うこと。<br />8. アイコンサービス（Google、gstatic、Favicon Extractor、icon.horse）へのアクセス権限：サイトアイコンの取得とキャッシュ。',
        'guide.align.title': '配置',
        'guide.align.desc': 'コンテンツは上揃え、中央揃え、下揃えの 3 種類の垂直配置に対応しています。各テーマの配置設定は独立して保存されます。',
        'guide.reset.title': '設定のリセットとキャッシュの削除',
        'guide.reset.desc': '「設定をリセット」はすべての設定をデフォルト値に戻します。追加済みのサイトデータとクリック回数は保持され、外観と機能の設定のみが元に戻ります。「アイコンキャッシュを削除」はキャッシュ済みのサイトアイコンをすべて消去し、次回開いたときに再ダウンロードされます。',
        'changelog.title': '変更履歴',
        'changelog.storeDelayHint': 'ブラウザー拡張ストアの審査により、ストア版の公開が遅れる場合があります。',
        'changelog.v1.feat1': '8 つのテーマ：クラシック、Bento、ターミナル、ミニマル、グラス、バブル、ピクセル、ふせん',
        'changelog.v1.feat2': '内蔵検索バー',
        'changelog.v1.feat3': '複数の背景モード：単色、グラデーション、画像、動的、ランダム',
        'changelog.v1.feat4': 'ダークモード、システム追従または手動切替に対応',
        'changelog.v1.feat5': '10 言語対応',
        'changelog.v1.feat6': 'サイト設定のインポート / エクスポート',
        'changelog.v1.feat7': '3 つのオンラインアイコンソース、カスタムアップロード対応',
    },
    'ko': {
        'site.title': 'Youran Tab - 맞춤형 새 탭',
        'site.description': 'Youran Tab 은 여러 테마, 배경, 레이아웃을 지원하는 오픈 소스 고급 맞춤형 새 탭 확장 프로그램입니다.',
        'lang.label': '언어',
        'lang.auto': '브라우저 언어 따르기',
        'theme.label': '테마',
        'theme.auto': '자동',
        'theme.light': '라이트',
        'theme.dark': '다크',
        'hero.badge': 'Chrome / Edge / Firefox 지원',
        'hero.compat': '360, QQ, Sogou, Liebao 등의 중국 브라우저는 Edge 추가 기능 스토어에서 직접 설치할 수 있으며, 완벽하게 호환됩니다.',
        'hero.title': 'Youran Tab',
        'hero.desc':
            '오픈 소스 고급 맞춤형 새 탭 확장 프로그램입니다.<br />8 가지 테마, 10 개 언어, 다양한 배경으로 나만의 시작 페이지를 만드세요.',
        'themes.title': '8 가지 테마, 자유롭게 전환',
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
        'themes.glass.title': '글래스',
        'themes.glass.desc': '프로스트 글라스 알약 카드가 가로 목록으로 배치됩니다. 열 수 조정 가능하며 깔끔하고 모던한 외관.',
        'themes.bubble.title': '버블',
        'themes.bubble.desc': '떠다니는 원형 버블. 고정 배치와 랜덤 배치를 지원하며 크기 조정 가능.',
        'themes.pixel.title': '픽셀',
        'themes.pixel.desc': '레트로 픽셀 스타일. 명령 프롬프트 검색 바와 메뉴 리스트 인터랙션.',
        'themes.sticky.title': '메모지',
        'themes.sticky.desc': '포스트잇 게시판 스타일. 핀 장식, 컬러풀한 종이, 폭포 레이아웃.',
        'features.title': '풍부한 기능, 가벼운 실행',
        'features.subtitle': '완전 오픈 소스. 모든 데이터는 로컬에 저장되며 로그인이나 추적이 없습니다.',
        'features.search.title': '빠른 검색',
        'features.search.desc': '주요 검색 엔진 10 개와 AI 질문 서비스 10 개를 내장했습니다. 원하는 항목을 골라 활성화하고 기본값을 지정할 수 있으며, 검색창 앞에서 임시로 전환할 수도 있습니다. 브라우저 자체의 검색 설정에는 영향을 주지 않습니다. 입력하면 저장된 사이트도 함께 찾아 줍니다.',
        'features.folders.title': '폴더로 정리',
        'features.folders.desc': '비슷한 사이트를 폴더에 모아 그리드 또는 겹침 아이콘으로 표시합니다. 탭 그룹을 통째로 저장할 수 있고, 클릭 한 번으로 그룹 단위로 모두 열 수도 있습니다.',
        'features.clip.title': '웹페이지 바로 추가',
        'features.clip.desc': '어떤 웹페이지에서든 우클릭하여 "Youran Tab에 추가"를 선택하면 메인 목록이나 지정한 폴더에 바로 담깁니다.',
        'features.background.title': '다양한 배경',
        'features.background.desc': '단색, 그라데이션, 이미지, 동적, 랜덤 배경. 라이트 / 다크를 각각 설정하며, 랜덤 모드에서는 열 때마다 새로운 배경이 나타납니다.',
        'features.dark.title': '다크 모드',
        'features.dark.desc': '시스템을 자동으로 따르거나 라이트 / 다크를 수동으로 전환.',
        'features.languages.title': '10 개 언어',
        'features.languages.desc':
            '중국어, 영어, 일본어, 한국어, 프랑스어, 독일어, 스페인어, 러시아어, 이탈리아어 지원. 시스템 언어 자동 감지.',
        'features.icons.title': '선명한 아이콘',
        'features.icons.desc': '여러 아이콘 소스 중 가장 선명한 것을 자동으로 골라 줍니다. 아이콘 소스를 직접 지정하거나 사용자 아이콘을 업로드할 수 있고, 다크 모드 전용 아이콘도 따로 설정할 수 있습니다.',
        'features.organize.title': '드래그로 정리',
        'features.organize.desc': '편집 모드에서 드래그하여 순서를 바꾸고, 폴더 위에 놓아 분류합니다. 사이트나 폴더를 실수로 삭제해도 바로 실행 취소할 수 있습니다.',
        'features.sync.title': '가져오기 / 내보내기',
        'features.sync.desc': '사이트와 설정을 따로 또는 함께 JSON 으로 내보내고, 기기를 바꿀 때 한 번에 복원할 수 있습니다.',
        'foldersSpotlight.title': '탭이 너무 많다면? 폴더에 넣어 두고 필요할 때 한 번에 열기',
        'foldersSpotlight.desc':
            '지금 쓰는 웹페이지 묶음을 폴더로 저장하고, 당분간 필요 없을 때는 그룹째 닫아 탭 표시줄과 컴퓨터 메모리를 확보하세요. 다시 필요해지면 폴더를 우클릭하여 "탭 그룹으로 모두 열기"를 선택하세요. 웹페이지가 폴더 이름의 탭 그룹으로 다시 묶여, 작업하던 상태 그대로 돌아옵니다.',
        'foldersSpotlight.step1.title': '그룹째 저장',
        'foldersSpotlight.step1.desc': '새 폴더를 만들 때 현재 탭 그룹을 바로 선택하거나, 어떤 웹페이지에서든 우클릭하여 지정한 폴더에 추가할 수 있습니다.',
        'foldersSpotlight.step2.title': '안심하고 닫기',
        'foldersSpotlight.step2.desc': '브라우저에서 탭 그룹 전체를 닫으면 탭 표시줄도, 메모리도 더 이상 차지하지 않습니다.',
        'foldersSpotlight.step3.title': '한 번에 복원',
        'foldersSpotlight.step3.desc': '폴더를 우클릭하여 탭 그룹으로 모두 열면, 그룹 이름이 폴더 이름으로 자동 지정됩니다.',
        'foldersSpotlight.sceneTitle': '이런 경우에 잘 맞습니다',
        'foldersSpotlight.sceneDesc':
            '프로젝트 관리 페이지, 이벤트 페이지, 문서 자료, 임시 조사 자료처럼 며칠만 집중해서 쓰는 웹페이지는 북마크에 넣을 만큼은 아니지만 잠시 보관해 둘 필요가 있습니다. 이럴 때 폴더에 담아 두면 가장 알맞습니다.',
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
        'nav.name': 'Youran Tab',
        'nav.home': '홈',
        'nav.support': '지원',
        'nav.privacy': '개인정보 처리방침',
        'nav.guide': '사용 가이드',
        'nav.changelog': '변경 내역',
        'support.title': 'Youran Tab 지원',
        'support.subtitle': '이 프로젝트가 도움이 되었다면 아래 방법으로 후원하실 수 있습니다. 후원은 지속적인 개발, 유지 보수, 그리고 사용자 경험 개선에 사용됩니다.',
        'support.note': '후원 메시지에 GitHub 프로필이나 다른 소셜 링크를 남겨 주시면 프로젝트 저장소와 공식 사이트의 감사 목록에서 소개하겠습니다.',
        'support.buymeacoffee.title': 'Buy Me a Coffee',
        'support.buymeacoffee.desc': 'Buy Me a Coffee 로 후원해 주시면 이 프로젝트를 계속 다듬고 개선해 나갈 수 있습니다.',
        'support.paypal.desc': 'PayPal 로 빠르게 후원할 수 있으며, 해외나 지역 간 결제에도 적합합니다.',
        'support.wechat.title': 'WeChat 후원',
        'support.wechat.desc': 'WeChat 으로 코드를 스캔해 후원할 수 있습니다. 응원과 지원에 감사드립니다.',
        'support.alipay.title': 'Alipay',
        'support.alipay.desc': 'Alipay 로 코드를 스캔해 프로젝트의 지속적인 개선을 지원할 수 있습니다.',
        'support.openLink': '후원하기',
        'privacy.title': '개인정보 처리방침',
        'privacy.updated': '최종 업데이트: 2026년 11월 18일',
        'privacy.intro.title': '개요',
        'privacy.intro.desc': 'Youran Tab(이하 "본 확장 프로그램")은 오픈 소스 브라우저 새 탭 확장 프로그램입니다. 저희는 여러분의 개인정보를 매우 중요하게 생각하며, 본 확장 프로그램은 어떠한 사용자 개인 데이터도 수집, 저장 또는 전송하지 않습니다.',
        'privacy.collect.title': '데이터 수집',
        'privacy.collect.desc': '본 확장 프로그램은 어떠한 개인 정보나 사용 데이터도 수집하지 않습니다. 모든 설정 데이터(사이트 목록, 테마 설정, 배경 설정 등)는 브라우저 로컬 저장소에 저장되며, 외부 서버로 전송되지 않습니다. "현재 탭에서 추가" 기능을 사용할 때는 선택 목록을 보여 주기 위해 현재 브라우저 창에서 열린 탭과 탭 그룹의 제목, URL, 그룹 이름만 로컬에서 읽습니다. 웹페이지 우클릭 메뉴의 "Youran Tab에 추가"를 사용할 때는 우클릭한 웹페이지의 제목과 URL만 읽어 사이트로 저장합니다.',
        'privacy.storage.title': '로컬 저장소',
        'privacy.storage.desc': '본 확장 프로그램은 브라우저의 확장 프로그램 저장소(storage.local)에 사이트와 개인 설정을 저장합니다. 백그라운드 스크립트는 여기에 저장된 사이트 목록을 읽어 웹페이지가 이미 추가되었는지 확인하고 폴더 메뉴를 만들며, 우클릭 메뉴로 추가한 웹페이지를 새 탭에 전달할 때도 이를 사용합니다. 0.5.0 이전 버전에서 업데이트하면 localStorage 에 저장되어 있던 데이터가 자동으로 옮겨지며, 백업용 사본이 로컬에 함께 보관됩니다. 이 데이터는 전적으로 사용자의 기기에 저장됩니다. 확장 프로그램의 내보내기 기능으로 언제든지 데이터를 백업할 수 있으며, 확장 프로그램을 제거하면 모든 데이터가 삭제됩니다.',
        'privacy.network.title': '네트워크 요청',
        'privacy.network.desc': '본 확장 프로그램은 사이트 아이콘을 가져올 때만 공용 아이콘 서비스(Google, Favicon Extractor, icon.horse)와 사이트 자체의 아이콘 파일에 요청하며, 요청에는 사이트 도메인만 포함됩니다. 검색 또는 AI 질문을 제출하면 결과 페이지를 열기 위해 검색어가 선택한 타사 서비스로 직접 전송됩니다. 본 확장 프로그램과 개발자는 검색어를 수집하거나 저장하지 않으며, 사이트 목록, 설정, 배경 등 로컬 구성 데이터도 전송하지 않습니다.',
        'privacy.thirdparty.title': '타사 서비스',
        'privacy.thirdparty.desc': '본 확장 프로그램은 타사 분석, 광고 또는 추적 서비스를 일절 통합하지 않습니다.',
        'privacy.permissions.title': '권한 설명',
        'privacy.permissions.desc': '본 확장 프로그램은 작동에 필요한 권한만 요청합니다. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code> 와 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code> 는 현재 창에 열린 탭의 제목, URL, 그룹 이름을 읽고 폴더를 탭 그룹으로 여는 용도로 사용됩니다. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code> 는 웹페이지 우클릭 메뉴에서 "Youran Tab에 추가"를 제공하는 용도입니다. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code> 와 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code> 은 사용자가 해당 메뉴를 클릭한 뒤 현재 웹페이지에 추가 알림을 표시하는 용도로만 사용되며 페이지 내용은 읽지 않습니다. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code> 는 사이트와 설정을 저장하고 확장 프로그램 내부에서 추가할 웹페이지를 전달하는 용도, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code> (Chrome 과 Edge 만 해당)는 확장 프로그램 저장소의 용량 제한을 해제해 업로드한 사용자 지정 아이콘이 많아도 저장할 수 있게 하는 용도, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code> 는 브라우저 기본 검색 엔진을 호출하는 용도, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> 은 브라우저에 내장된 사이트 아이콘을 읽는 용도입니다. 본 확장 프로그램은 페이지 본문, 입력 폼 내용, 개인 신원 정보, 계정 정보, 비밀번호, 결제 데이터를 읽지 않으며, 방문 기록이나 북마크에도 접근하지 않습니다.',
        'privacy.changes.title': '정책 변경',
        'privacy.changes.desc': '본 개인정보 처리방침에 변경 사항이 있을 경우 이 페이지에서 업데이트됩니다. 본 확장 프로그램은 데이터를 수집하지 않으므로 본 방침에 중대한 변경이 발생할 것으로 예상되지 않습니다.',
        'privacy.opensource.title': '오픈 소스 투명성',
        'privacy.opensource.desc': '본 확장 프로그램은 완전히 오픈 소스이며, 소스 코드는 <a href="https://github.com/dufu1991/youran-tab" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub</a>에 호스팅되어 있습니다. 누구나 코드를 검토하여 개인정보 보호 약속을 확인할 수 있습니다.',
        'privacy.contact.title': '연락처',
        'privacy.contact.desc': '개인정보와 관련된 질문이나 우려 사항이 있으시면 <a href="https://github.com/dufu1991/youran-tab/issues" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub Issues</a>를 통해 문의해 주세요.',
        'guide.title': '사용 가이드',
        'guide.install.title': '설치',
        'guide.install.desc': 'Chrome 웹 스토어, Edge 추가 기능 스토어 또는 Firefox 부가 기능에서 "Youran Tab"을 검색하여 설치하세요. 설치 후 새 탭을 열면 바로 사용할 수 있습니다. 360, QQ, Sogou 등 중국 브라우저는 Edge 추가 기능 스토어에서 설치할 수 있습니다. 처음 사용하면 Google, YouTube, ChatGPT, 바이두 4 개 사이트가 미리 추가되고, 기본적으로 랜덤 배경이 사용됩니다.',
        'guide.addsite.title': '사이트 추가',
        'guide.addsite.desc': '3 가지 방법이 있습니다:<br />1. <strong>직접 추가</strong>: 설정에서 "편집 모드"를 켠 뒤 "+ 사이트 추가"를 클릭하거나, 빈 영역을 우클릭하여 "사이트 추가"를 선택하고 이름과 URL을 입력하면 됩니다. 아이콘은 자동으로 가져옵니다.<br />2. <strong>현재 탭에서 추가</strong>: 추가 창에서 이미 열려 있는 탭을 바로 선택할 수 있습니다. 자세한 내용은 아래를 참고하세요.<br />3. <strong>웹페이지에서 우클릭하여 추가</strong>: 웹을 둘러보다가 바로 저장할 수 있습니다. 자세한 내용은 아래를 참고하세요.',
        'guide.theme.title': '테마 개요',
        'guide.theme.desc': '설정 패널에서 클래식, 벤토, 터미널, 미니멀, 글래스, 버블, 픽셀, 메모지 8 가지 테마를 선택할 수 있습니다. 각 테마는 독립적인 설정 항목이 있으며, 테마를 전환해도 다른 테마의 설정은 유지됩니다. 폴더는 모든 시각 테마에서 사용할 수 있습니다.',
        'guide.classic.title': '클래식 테마',
        'guide.classic.desc': '표준 아이콘 그리드 레이아웃으로, 마우스 호버 시 프로스트 글라스 카드 배경이 표시됩니다. 설정 항목: 컨테이너 너비(400-1400px), 열 수(3-8 열), 모서리 둥글기, 카드 투명도, 프로스트 글라스 흐림 정도, 아이콘 크기. 열 수는 사이트 수에 따라 자동으로 축소되어 빈 열을 방지합니다.',
        'guide.bento.title': '벤토 테마',
        'guide.bento.desc': '두 가지 레이아웃 모드를 제공합니다:<br />1. <strong>동적 레이아웃</strong>(기본): 카드 크기가 클릭 횟수에 따라 결정되며, Treemap 알고리즘으로 자동 배치됩니다. 클릭이 많은 사이트가 더 큰 면적을 차지하며, 새 사이트에도 초기 면적이 부여됩니다. 폴더 카드는 내부 사이트의 클릭 횟수를 합산하므로 자주 쓰는 폴더도 자동으로 더 커집니다. 페이지 로드 시 클릭 횟수를 스냅샷하여 클릭 후 즉시 재배치되지 않습니다.<br />2. <strong>고정 그리드</strong>: 모든 카드가 균등하게 분할되어 설정된 열 수로 배치됩니다.<br />설정 항목: 컨테이너 너비, 간격(4-32px), 모서리 둥글기, 카드 투명도, 프로스트 글라스 흐림 정도, 아이콘 크기, 레이아웃 모드 전환, 고정 모드 열 수.',
        'guide.folders.title': '폴더',
        'guide.folders.desc': '폴더는 비슷한 사이트를 모아 두는 용도입니다. 추가 창에서 "폴더"로 전환하여 새로 만들 수 있으며, 기존 사이트나 현재 탭을 선택해 넣고 드래그하여 순서를 조정할 수 있습니다.<br />폴더 아이콘은 4 가지입니다: <strong>그리드</strong>(기본값, 앞쪽 사이트의 아이콘을 표시하며 4 개를 넘으면 네 번째 칸에 남은 개수를 표시), <strong>겹치기</strong>(처음 3 개 사이트의 아이콘을 겹쳐서 표시), <strong>사용자 이미지</strong>, <strong>SVG 붙여넣기</strong>. 아이콘 배경색, 배경 표시 여부, 모서리 둥글기, 아이콘 비율도 설정할 수 있습니다.<br />폴더를 클릭하면 원래 위치 근처에 팝업이 펼쳐지고, 그 안의 사이트를 클릭하면 열립니다. 팝업 안에서 드래그하면 순서를 바꿀 수 있고, 팝업 밖으로 끌어내면 폴더에서 꺼낼 수 있습니다.<br /><strong>그룹으로 열기</strong>: 폴더를 우클릭하면 "모든 탭 열기" 또는 "탭 그룹으로 모두 열기"를 선택할 수 있습니다. 후자는 폴더 안의 사이트를 폴더 이름의 탭 그룹에 담아 엽니다. 당분간 쓰지 않는 웹페이지 묶음은 폴더로 저장한 뒤 브라우저에서 그룹째 닫아 탭 표시줄과 메모리를 확보하고, 필요할 때 한 번에 그룹으로 열면 작업하던 상태 그대로 돌아옵니다.<br />폴더를 삭제할 때는 폴더만 삭제하고 안의 사이트를 메인 목록으로 되돌리거나, 안의 사이트까지 함께 삭제할 수 있습니다.',
        'guide.organize.title': '편집과 정리',
        'guide.organize.desc': '설정에서 "편집 모드"를 켠 뒤 사이트나 폴더를 클릭하면 편집하거나 삭제할 수 있고, 드래그하여 순서를 바꾸거나 폴더 가운데에 놓아 폴더에 넣을 수 있습니다. 끝나면 "완료"를 클릭하여 나갑니다. 사이트나 폴더를 삭제하면 "실행 취소" 알림이 나타나 실수로 삭제해도 바로 복구할 수 있습니다. 새 탭을 여러 개 열어 두었을 때 한 페이지에서 변경한 내용은 다른 페이지에도 자동으로 동기화됩니다.',
        'guide.tabs.title': '현재 탭에서 빠르게 추가',
        'guide.tabs.desc': '사이트를 추가하거나 새 폴더를 만들 때, 창에 현재 브라우저 창에서 열린 탭이 탭 그룹별로 나뉘어 표시됩니다. 탭 1 개를 선택하면 제목과 URL 이 자동으로 채워지고, 여러 개를 선택하여 한 번에 추가할 수도 있습니다. 새 폴더를 만들 때는 탭 그룹 전체를 선택할 수도 있으며, 폴더 이름이 자동으로 채워집니다. 탭이 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">12</code> 개를 넘으면 검색창이 나타나며, 제목, URL, 그룹 이름으로 필터링할 수 있습니다.',
        'guide.webadd.title': '웹페이지에서 우클릭하여 추가',
        'guide.webadd.desc': '어떤 웹페이지든 빈 영역을 우클릭하여 "Youran Tab에 추가"를 선택하면 현재 웹페이지가 저장되며, 페이지 제목이 사이트 이름이 됩니다. 이미 폴더를 만들어 두었다면 메뉴가 "메인 목록"과 각 폴더로 펼쳐져 원하는 폴더에 바로 넣을 수 있습니다. 추가하면 페이지 오른쪽 위에 잠시 알림이 표시되고, 이미 저장된 페이지는 "이미 Youran Tab에 있습니다"라고 알려 주며 중복 추가되지 않습니다. 새 사이트는 다음에 새 탭을 열거나 새 탭으로 돌아올 때 나타납니다. 브라우저 스토어 등 제한된 페이지에서는 알림이 표시되지 않지만 사이트는 정상적으로 추가됩니다.',
        'guide.contextmenu.title': '우클릭 메뉴',
        'guide.contextmenu.desc': '새 탭에서 우클릭할 때 (터미널 테마 제외):<br />1. <strong>사이트 우클릭</strong>: 새 탭에서 열기, 편집, 폴더로 이동 또는 폴더에서 꺼내기, 삭제.<br />2. <strong>폴더 우클릭</strong>: 모든 탭 열기, 탭 그룹으로 모두 열기 (브라우저가 탭 그룹을 지원해야 함), 폴더 편집, 삭제.<br />3. <strong>빈 영역 우클릭</strong>: 사이트 추가, 배경 바꾸기. 배경 모드가 랜덤이면 즉시 새로운 랜덤 배경으로 바뀌고, 랜덤이 아니면 저장된 단색, 그라데이션, 이미지, 동적 배경 중 하나를 무작위로 골라 유지합니다.',
        'guide.icons.title': '사이트 아이콘',
        'guide.icons.desc': '아이콘은 기본적으로 "Auto"입니다. 사이트 자체, 브라우저 내장 아이콘, Google, Favicon Extractor, icon.horse 등의 소스에 동시에 요청하여 자리 표시 이미지는 제외하고 가장 선명한 것을 골라 로컬에 저장하며, 모두 없으면 첫 글자 아이콘을 만듭니다. 사이트를 편집할 때 Google, Extractor, icon.horse 중 아이콘 소스를 직접 지정하거나 사용자 아이콘을 업로드하고 아이콘 모서리 둥글기를 조정할 수도 있습니다. 다크 모드에서는 별도의 아이콘 세트를 설정할 수 있어, 어두운 배경에서 잘 보이지 않는 선형 아이콘에 알맞습니다. 아이콘은 로컬에 장기간 캐시되며, 사이트를 수정하거나 아이콘 소스를 바꾸면 자동으로 다시 가져옵니다.',
        'guide.terminalDetail.title': '터미널 테마',
        'guide.terminalDetail.desc': '완전한 명령줄 인터페이스로 키보드만으로 조작할 수 있습니다. 사용 가능한 명령:<br /><br /><dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5"><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">h</code></dt><dd>도움말 표시</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">ls</code></dt><dd>모든 사이트 목록 (폴더 안의 사이트는 "폴더 / 사이트"로 표시)</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">&lt;번호&gt; / 이름 / URL</code></dt><dd>번호, 이름 또는 URL로 사이트 열기</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">add &lt;URL&gt; &lt;이름&gt;</code></dt><dd>새 사이트 추가</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">edit &lt;번호&gt; &lt;URL&gt; &lt;이름&gt;</code></dt><dd>사이트 편집</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">rm &lt;번호&gt;</code></dt><dd>사이트 삭제</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s &lt;키워드&gt;</code></dt><dd>기본 항목으로 검색 또는 질문</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code></dt><dd>테마 전환</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code></dt><dd>표시 모드 전환</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code></dt><dd>언어 전환</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code></dt><dd>색상 구성 설정</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code></dt><dd>커서 스타일 설정</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code></dt><dd>명령 프롬프트 설정</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">width &lt;px값|full&gt;</code></dt><dd>터미널 너비 설정</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">set</code></dt><dd>설정 패널 열기</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code></dt><dd>데이터 내보내기</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code></dt><dd>데이터 가져오기</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">clear</code></dt><dd>화면 지우기</dd></dl><br />9 가지 색상(초록, 앰버, 파랑, 청록, 보라, 분홍, 빨강, 주황, 흑백)과 4 가지 커서 스타일(바, 굵은 바, 블록, 밑줄)을 제공합니다. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code>를 인수 없이 입력하면 방향키로 옵션을 선택하고 Enter로 확인하며 Esc로 취소할 수 있습니다.<br /><br /><strong>팁:</strong> 브라우저 제한으로 새 탭을 열면 포커스가 기본적으로 주소창에 있습니다. 페이지의 아무 곳이나 클릭하면 명령을 입력할 수 있습니다.',
        'guide.minimal.title': '미니멀 테마',
        'guide.minimal.desc': '아이콘이나 카드 없이 사이트 이름 링크만 표시하는 순수 텍스트 목록 스타일입니다. 이 테마에는 전용 설정 항목이 없습니다.',
        'guide.glass.title': '글래스 테마',
        'guide.glass.desc': '젖빛 유리 알약 카드를 가로 목록 레이아웃으로 표시합니다. 설정 항목: 열 수 (1-4 열). 검색창이 메인 인터페이스에 내장되며, 사이트 제목이 항상 표시됩니다. 이미지나 그라데이션 배경과 잘 어울립니다.',
        'guide.bubble.title': '버블 테마',
        'guide.bubble.desc': '원형 버블 부유 효과, 사이트 제목은 표시되지 않습니다. 두 가지 레이아웃 모드를 제공합니다:<br />1. <strong>고정 배열</strong> (기본값): 버블이 순서대로 균일한 간격으로 배열됩니다.<br />2. <strong>랜덤 배치</strong>: 충돌 감지 알고리즘을 사용하여 겹치지 않게 랜덤으로 배치됩니다.<br />설정 항목: 레이아웃 모드 전환, 버블 크기 (48-120px). 검색창은 확장 가능한 검색 버블 형태로 표시됩니다.',
        'guide.pixel.title': '픽셀 테마',
        'guide.pixel.desc': '레트로 픽셀 스타일, 메뉴 목록 형태의 인터랙션. 사이트는 목록 형태로 표시되며, 사이트 제목이 항상 표시됩니다. 검색창은 명령 프롬프트 스타일입니다. 호버 시 스캔라인 애니메이션 효과가 있습니다. 이 테마에는 전용 설정 항목이 없습니다.',
        'guide.sticky.title': '메모지 테마',
        'guide.sticky.desc': '스티커 메모 게시판 스타일로, 메모에 색종이와 핀 장식이 있고 각도가 무작위로 기울어지며 워터폴 형태로 배치됩니다. 배경을 설정하지 않으면 라이트 모드에서는 코르크 보드, 다크 모드에서는 어두운 나무 보드가 표시되며, 다른 테마처럼 배경을 설정할 수도 있습니다. 검색창은 메모 형태로 내장되며 손그림 스타일의 점선 입력 필드가 있습니다. 설정 항목: 사이트 제목 표시/숨김.',
        'guide.search.title': '검색 기능',
        'guide.search.desc': '검색창에는 Google, Bing, 바이두 등 10 개의 검색 엔진과 ChatGPT, Claude, DeepSeek 등 10 개의 AI 질문 서비스가 내장되어 있습니다. 설정에서 사용할 항목을 선택하고 별표로 기본값을 지정할 수 있으며, 기본값을 검색과 AI 질문 중 무엇으로 할지도 고를 수 있습니다. 검색창 앞의 아이콘을 클릭하면 현재 페이지에서만 임시로 전환되며, 브라우저 자체의 검색 설정에는 영향을 주지 않습니다. AI 질문을 사용하면 해당 서비스의 사이트가 열리므로 먼저 해당 서비스 계정에 로그인해 두는 것이 좋습니다. 입력하는 동안 이름, 도메인, 폴더 이름과 일치하는 저장된 사이트(폴더 안의 사이트 포함)가 목록으로 표시되며, 방향키로 선택하고 Enter 로 열고, Ctrl / Cmd + Enter 로 새 탭에서 열 수 있습니다. 터미널 테마에서는 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s</code> 명령에 키워드를 붙이면 기본 항목으로 검색하거나 질문할 수 있습니다.',
        'guide.background.title': '배경 설정',
        'guide.background.desc': '터미널과 미니멀 테마를 제외한 모든 테마에서 배경 설정을 지원하며, 6 가지 모드가 있습니다:<br />1. <strong>없음</strong>: 브라우저 기본 새 탭 배경색을 사용합니다. 메모지 테마는 배경이 없으면 코르크 보드를 표시합니다.<br />2. <strong>단색</strong>: 라이트와 다크 각각 18 가지 색상이 미리 준비되어 있으며, 색상을 직접 지정할 수도 있습니다.<br />3. <strong>그라데이션</strong>: 라이트와 다크 각각 18 가지 그라데이션이 미리 준비되어 있으며, "랜덤 그라데이션"을 클릭하여 계속 생성할 수 있습니다.<br />4. <strong>이미지</strong>: 로컬에서 최대 18 장까지 업로드하며, 로컬에만 저장됩니다.<br />5. <strong>동적</strong>: 라이트와 다크 각각 18 가지 동적 배경이 미리 준비되어 있습니다.<br />6. <strong>랜덤</strong> (신규 사용자 기본값): 선택한 단색, 그라데이션, 이미지, 동적 배경 중에서 무작위로 전환하며, 새 탭을 열 때마다 또는 "배경 바꾸기"를 클릭할 때마다 다시 선택합니다. 랜덤 소스는 매번 완전히 새로운 배경을 만드는 "매번 생성"과, 기존 프리셋과 업로드한 이미지 중에서만 고르는 "프리셋에서" 중에서 선택할 수 있습니다.<br />단색, 그라데이션, 동적 프리셋이 마음에 들지 않으면 삭제할 수 있고, 새로 추가하면 다시 생성되며, "18개 다시 생성"으로 한 번에 다시 만들 수도 있습니다. 라이트와 다크 모드의 배경 설정은 서로 독립적입니다.',
        'guide.darkmode.title': '다크 모드',
        'guide.darkmode.desc': '시스템 자동 추종, 수동 라이트, 수동 다크 3 가지 모드를 지원합니다. 다크 모드에서는 사이트에 별도의 아이콘을 설정할 수 있습니다.',
        'guide.importexport.title': '가져오기 / 내보내기',
        'guide.importexport.desc': '설정에서 데이터를 내보낼 수 있으며, "사이트만", "설정만", "사이트 + 설정" 중에서 선택할 수 있습니다. 파일 이름에는 확장 프로그램 버전 번호가 자동으로 붙습니다. 사이트 데이터에는 폴더 구조, 폴더 아이콘과 스타일, 폴더 안의 사이트가 포함됩니다. 가져올 때 사이트는 기존 데이터와 병합되고 중복 항목은 건너뛰며, 설정은 현재 모든 설정을 덮어쓰고 가져온 뒤 페이지가 자동으로 새로고침됩니다. 더 높은 버전에서 만든 파일은 먼저 확장 프로그램을 업데이트한 뒤 가져와야 합니다. 터미널 테마에서도 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code> 와 <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code> 명령으로 같은 작업을 할 수 있습니다.',
        'guide.browser.title': '권한 설명',
        'guide.browser.desc': '각 브라우저 권한의 용도는 다음과 같습니다:<br />1. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code>: 사이트를 추가하거나 새 폴더를 만들 때 현재 창에 열린 탭의 제목, URL, 그룹 이름을 읽고, 폴더를 탭 그룹으로 엽니다.<br />2. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code>: 웹페이지 우클릭 메뉴에서 "Youran Tab에 추가"를 제공합니다.<br />3. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code>: 웹페이지를 추가한 뒤 현재 웹페이지 오른쪽 위에 알림을 표시합니다.<br />4. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code>: 사이트와 설정을 저장하고, 백그라운드와 새 탭 사이에서 추가할 웹페이지를 전달합니다.<br />5. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code> (Chrome 과 Edge 만 해당): 확장 프로그램 저장소의 용량 제한을 해제해 업로드한 사용자 지정 아이콘이 많아도 저장할 수 있게 합니다.<br />6. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code>: 필요할 때 브라우저 기본 검색 엔진을 호출합니다.<br />7. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> (Chrome 과 Edge 만 해당): 브라우저에 내장된 사이트 아이콘을 읽어 아이콘 소스 중 하나로 사용합니다.<br />8. 아이콘 서비스 접근 권한 (Google, gstatic, Favicon Extractor, icon.horse): 사이트 아이콘을 가져와 캐시합니다.',
        'guide.align.title': '정렬 방식',
        'guide.align.desc': '콘텐츠는 상단, 중앙, 하단 3 가지 수직 정렬을 지원합니다. 각 테마의 정렬 설정은 독립적으로 저장됩니다.',
        'guide.reset.title': '설정 초기화 및 캐시 삭제',
        'guide.reset.desc': '"설정 초기화"는 모든 설정을 기본값으로 되돌리며, 추가한 사이트 데이터와 클릭 횟수는 유지되고 외관 및 기능 설정만 초기 상태로 복원됩니다. "아이콘 캐시 지우기"는 캐시된 모든 사이트 아이콘을 삭제하며, 다음에 열 때 다시 다운로드합니다.',
        'changelog.title': '변경 내역',
        'changelog.storeDelayHint': '브라우저 스토어 심사로 인해 스토어 버전 반영이 지연될 수 있습니다.',
        'changelog.v1.feat1': '8 가지 테마: 클래식, 벤토, 터미널, 미니멀, 글래스, 버블, 픽셀, 메모지',
        'changelog.v1.feat2': '내장 검색창',
        'changelog.v1.feat3': '다양한 배경 모드: 단색, 그라데이션, 이미지, 동적, 랜덤',
        'changelog.v1.feat4': '다크 모드, 시스템 추종 또는 수동 전환 지원',
        'changelog.v1.feat5': '10 개 언어 지원',
        'changelog.v1.feat6': '사이트 설정 가져오기 / 내보내기',
        'changelog.v1.feat7': '3 가지 온라인 아이콘 소스, 사용자 업로드 지원',
    },
    'es': {
        'site.title': 'Youran Tab - Nueva pestaña personalizable',
        'site.description':
            'Youran Tab es una extensión de nueva pestaña de código abierto y altamente personalizable, con múltiples temas, fondos y diseños.',
        'lang.label': 'Idioma',
        'lang.auto': 'Seguir navegador',
        'theme.label': 'Tema',
        'theme.auto': 'Automático',
        'theme.light': 'Claro',
        'theme.dark': 'Oscuro',
        'hero.badge': 'Compatible con Chrome / Edge / Firefox',
        'hero.compat':
            'Navegadores como 360, QQ, Sogou y Liebao pueden instalar directamente desde la tienda de complementos de Edge, totalmente compatibles.',
        'hero.title': 'Youran Tab',
        'hero.desc':
            'Una extensión de nueva pestaña de código abierto y altamente personalizable.<br />8 temas, 10 idiomas y múltiples fondos para crear tu página de inicio.',
        'themes.title': '8 temas, cambia cuando quieras',
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
        'themes.glass.title': 'Cristal',
        'themes.glass.desc': 'Tarjetas de pastilla de vidrio esmerilado en lista horizontal. Columnas ajustables para un aspecto limpio y moderno.',
        'themes.bubble.title': 'Burbuja',
        'themes.bubble.desc': 'Burbujas circulares flotantes. Soporta disposición fija y dispersión aleatoria con tamaño ajustable.',
        'themes.pixel.title': 'Pixel',
        'themes.pixel.desc': 'Estilo retro de píxeles con barra de búsqueda tipo terminal y menú de lista interactivo.',
        'themes.sticky.title': 'Nota',
        'themes.sticky.desc': 'Tablero de notas adhesivas con decoraciones de chinchetas, papeles coloridos y diseño en cascada.',
        'features.title': 'Funciones potentes, ejecución ligera',
        'features.subtitle': 'Totalmente de código abierto. Todos los datos se guardan localmente. Sin cuentas ni seguimiento.',
        'features.search.title': 'Búsqueda rápida',
        'features.search.desc': 'Incluye 10 motores de búsqueda populares y 10 servicios de preguntas con IA. Activa los que quieras, define uno predeterminado y cambia temporalmente desde la barra de búsqueda, sin afectar la configuración de búsqueda del navegador. Al escribir también encuentra tus sitios guardados.',
        'features.folders.title': 'Organiza con carpetas',
        'features.folders.desc': 'Agrupa sitios similares en carpetas con iconos de cuadrícula o apilados. Puedes guardar grupos de pestañas completos y abrirlos todos de una vez como grupo.',
        'features.clip.title': 'Añade páginas con un clic',
        'features.clip.desc': 'En cualquier página, haz clic derecho y elige "Añadir a Youran Tab" para guardarla en la lista principal o en una carpeta concreta.',
        'features.background.title': 'Múltiples fondos',
        'features.background.desc': 'Fondos sólidos, degradados, imágenes, dinámicos y aleatorios. Ajustes separados para claro y oscuro; en modo aleatorio, cada apertura trae un fondo nuevo.',
        'features.dark.title': 'Modo oscuro',
        'features.dark.desc': 'Sigue al sistema o cambia manualmente entre claro / oscuro.',
        'features.languages.title': '10 idiomas',
        'features.languages.desc':
            'Chino, inglés, japonés, coreano, francés, alemán, español, ruso, italiano. Detección automática del idioma del sistema.',
        'features.icons.title': 'Iconos nítidos',
        'features.icons.desc': 'Elige automáticamente el icono más nítido entre varias fuentes. También puedes fijar la fuente del icono, subir iconos personalizados y configurar iconos distintos para el modo oscuro.',
        'features.organize.title': 'Organiza arrastrando',
        'features.organize.desc': 'En modo edición, arrastra para reordenar y suelta sobre una carpeta para clasificar. Si eliminas un sitio o una carpeta por error, puedes deshacerlo al instante.',
        'features.sync.title': 'Importar y exportar',
        'features.sync.desc': 'Exporta los sitios y los ajustes por separado o juntos como JSON y restáuralos con un clic al cambiar de dispositivo.',
        'foldersSpotlight.title': '¿Demasiadas pestañas? Guárdalas en una carpeta y ábrelas con un clic cuando las necesites',
        'foldersSpotlight.desc':
            'Guarda como carpeta un conjunto de páginas que estás usando y, cuando no las necesites por un tiempo, cierra todo el grupo para liberar la barra de pestañas y la memoria del equipo. Cuando vuelvas a necesitarlas, haz clic derecho en la carpeta y elige "Abrir todo en un grupo de pestañas": las páginas se reagrupan con el nombre de la carpeta y tu espacio de trabajo vuelve tal como estaba.',
        'foldersSpotlight.step1.title': 'Guarda el grupo entero',
        'foldersSpotlight.step1.desc': 'Al crear una carpeta, marca directamente el grupo de pestañas actual, o haz clic derecho en cualquier página para añadirla a una carpeta concreta.',
        'foldersSpotlight.step2.title': 'Ciérralo sin miedo',
        'foldersSpotlight.step2.desc': 'Cierra todo el grupo de pestañas en el navegador: ya no ocupa la barra de pestañas ni memoria.',
        'foldersSpotlight.step3.title': 'Restáuralo con un clic',
        'foldersSpotlight.step3.desc': 'Haz clic derecho en la carpeta y abre todo en un grupo de pestañas; el grupo toma automáticamente el nombre de la carpeta.',
        'foldersSpotlight.sceneTitle': 'Ideal para estos casos',
        'foldersSpotlight.sceneDesc':
            'Paneles de proyectos, páginas de eventos, documentación, investigaciones temporales... Estas páginas suelen usarse intensamente solo unos días: no merecen un marcador, pero conviene conservarlas un tiempo. Una carpeta es lo más adecuado.',
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
        'nav.name': 'Youran Tab',
        'nav.home': 'Inicio',
        'nav.support': 'Apoyar',
        'nav.privacy': 'Privacidad',
        'nav.guide': 'Guía de uso',
        'nav.changelog': 'Registro de cambios',
        'support.title': 'Apoyar a Youran Tab',
        'support.subtitle': 'Si este proyecto le resulta útil, puede apoyarlo de cualquiera de las siguientes maneras. Su apoyo se destina al desarrollo continuo, al mantenimiento y a seguir mejorando la experiencia.',
        'support.note': 'Puede incluir su perfil de GitHub u otro enlace social en el mensaje de apoyo. Lo mencionaré en la lista de agradecimientos del repositorio y del sitio oficial.',
        'support.buymeacoffee.title': 'Buy Me a Coffee',
        'support.buymeacoffee.desc': 'Apoye el proyecto a través de Buy Me a Coffee y ayude a que siga mejorando.',
        'support.paypal.desc': 'Apoye rápidamente con PayPal, ideal para pagos internacionales o entre regiones.',
        'support.wechat.title': 'Agradecimiento en WeChat',
        'support.wechat.desc': 'Abra WeChat y escanee el código. Gracias por su apoyo y sus ánimos.',
        'support.alipay.title': 'Alipay',
        'support.alipay.desc': 'Use Alipay para escanear y apoyar el proyecto mientras sigue evolucionando.',
        'support.openLink': 'Apoyar ahora',
        'privacy.title': 'Política de privacidad',
        'privacy.updated': 'Última actualización: 18 de noviembre de 2026',
        'privacy.intro.title': 'Descripción general',
        'privacy.intro.desc': 'Youran Tab (en adelante, "esta extensión") es una extensión de nueva pestaña de código abierto para navegadores. Valoramos enormemente su privacidad. Esta extensión no recopila, almacena ni transmite ningún dato personal del usuario.',
        'privacy.collect.title': 'Recopilación de datos',
        'privacy.collect.desc': 'Esta extensión no recopila ninguna información personal ni datos de uso. Todos los datos de configuración (incluidas listas de sitios, ajustes de temas, ajustes de fondo, etc.) se almacenan en el almacenamiento local del navegador y nunca se envían a ningún servidor externo. Al usar "Añadir desde las pestañas actuales", la extensión solo lee localmente los títulos, las URL y los nombres de grupo de las pestañas y los grupos de pestañas abiertos en la ventana activa del navegador para mostrar la lista de selección. Al usar "Añadir a Youran Tab" en el menú contextual de una página, la extensión solo lee el título y la URL de la página sobre la que haces clic derecho y los guarda como sitio.',
        'privacy.storage.title': 'Almacenamiento local',
        'privacy.storage.desc': 'Esta extensión usa el almacenamiento de extensiones del navegador (storage.local) para guardar tus sitios y ajustes personales. El script en segundo plano lee de ahí la lista de sitios para comprobar si una página ya se ha añadido y para crear el menú de carpetas, y lo usa para entregar a la nueva pestaña las páginas añadidas desde el menú contextual. Al actualizar desde una versión anterior a la 0.5.0, los datos guardados antes en localStorage se migran automáticamente y se conserva una copia de seguridad local. Estos datos se almacenan íntegramente en tu dispositivo. Puedes hacer una copia de seguridad en cualquier momento con la función de exportación de la extensión, y desinstalar la extensión elimina todos los datos.',
        'privacy.network.title': 'Solicitudes de red',
        'privacy.network.desc': 'Esta extensión solo realiza solicitudes a servicios públicos de iconos (Google, Favicon Extractor, icon.horse) y a los archivos de iconos de los propios sitios al obtener iconos de sitios, y las solicitudes solo incluyen el dominio del sitio. Cuando envías una búsqueda o una pregunta a una IA, el texto se envía directamente al servicio de terceros seleccionado y se abre la página de resultados. Esta extensión y su desarrollador no recopilan ni almacenan el contenido de las consultas, ni envían tu lista de sitios, ajustes, fondos ni otros datos de configuración local.',
        'privacy.thirdparty.title': 'Servicios de terceros',
        'privacy.thirdparty.desc': 'Esta extensión no integra ningún servicio de análisis, publicidad o seguimiento de terceros.',
        'privacy.permissions.title': 'Permisos',
        'privacy.permissions.desc': 'Esta extensión solo solicita los permisos necesarios para funcionar: <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code> y <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code> sirven para leer los títulos, las URL y los nombres de grupo de las pestañas de la ventana actual y abrir carpetas como grupos de pestañas; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code> sirve para ofrecer "Añadir a Youran Tab" en el menú contextual de las páginas; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code> y <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code> se usan únicamente para mostrar un aviso de que se ha añadido la página tras hacer clic en ese menú, sin leer el contenido de la página; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code> sirve para guardar tus sitios y ajustes y para transferir dentro de la extensión las páginas pendientes de añadir; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code> (solo Chrome y Edge) elimina el límite de tamaño del almacenamiento de la extensión para que se puedan guardar muchos iconos personalizados subidos; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code> sirve para usar el motor de búsqueda predeterminado del navegador; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> sirve para leer los iconos de sitios integrados del navegador. Esta extensión no lee el texto de las páginas, el contenido de formularios, información personal de identidad, información de cuentas, contraseñas ni datos de pago, ni accede a tu historial de navegación ni a tus marcadores.',
        'privacy.changes.title': 'Cambios en la política',
        'privacy.changes.desc': 'Si hay algún cambio en esta política de privacidad, lo actualizaremos en esta página. Dado que esta extensión no recopila ningún dato, no se esperan cambios significativos en esta política.',
        'privacy.opensource.title': 'Transparencia de código abierto',
        'privacy.opensource.desc': 'Esta extensión es completamente de código abierto, con el código fuente alojado en <a href="https://github.com/dufu1991/youran-tab" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub</a>. Cualquiera puede revisar el código para verificar nuestros compromisos de privacidad.',
        'privacy.contact.title': 'Contacto',
        'privacy.contact.desc': 'Si tiene alguna pregunta o inquietud relacionada con la privacidad, contáctenos a través de <a href="https://github.com/dufu1991/youran-tab/issues" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub Issues</a>.',
        'guide.title': 'Guía de uso',
        'guide.install.title': 'Instalación',
        'guide.install.desc': 'Busca "Youran Tab" en Chrome Web Store, la tienda de complementos de Edge o los complementos de Firefox e instálalo. Después, abre una nueva pestaña para empezar a usarlo. Los navegadores chinos como 360, QQ o Sogou pueden instalarlo desde la tienda de complementos de Edge. La primera vez incluye 4 sitios predefinidos (Google, YouTube, ChatGPT y Baidu) y usa un fondo aleatorio de forma predeterminada.',
        'guide.addsite.title': 'Añadir sitios',
        'guide.addsite.desc': 'Hay 3 formas:<br />1. <strong>Añadir manualmente</strong>: en los ajustes, activa el "Modo edición" y haz clic en "+ Añadir sitio", o haz clic derecho en un espacio vacío y elige "Añadir sitio"; escribe el nombre y la URL. El icono se obtiene automáticamente.<br />2. <strong>Añadir desde las pestañas actuales</strong>: elige directamente una pestaña abierta en la ventana de añadir; más detalles abajo.<br />3. <strong>Añadir con clic derecho en la página</strong>: guarda páginas mientras navegas; más detalles abajo.',
        'guide.theme.title': 'Vista general de temas',
        'guide.theme.desc': 'En el panel de ajustes puede elegir entre 8 temas: Clásico, Bento, Terminal, Minimal, Cristal, Burbuja, Pixel o Nota. Cada tema tiene opciones de configuración independientes. Cambiar de tema no perderá la configuración de otros temas, y las carpetas funcionan en todos los temas visuales.',
        'guide.classic.title': 'Tema Clásico',
        'guide.classic.desc': 'Diseño de cuadrícula de iconos estándar con fondo de tarjeta de vidrio esmerilado al pasar el cursor. Opciones configurables: ancho del contenedor (400-1400px), columnas (3-8), radio de borde, opacidad de tarjeta, desenfoque de vidrio esmerilado y tamaño de icono. El número de columnas se reduce automáticamente según la cantidad de sitios para evitar columnas vacías.',
        'guide.bento.title': 'Tema Bento',
        'guide.bento.desc': 'Dos modos de diseño disponibles:<br />1. <strong>Diseño dinámico</strong> (predeterminado): el tamaño de las tarjetas se determina por el número de clics usando un algoritmo Treemap. Los sitios con más clics ocupan áreas más grandes, y los nuevos sitios también tienen un área inicial. Las tarjetas de carpeta suman los clics de los sitios internos, por lo que las carpetas más usadas también se agrandan automáticamente. Los conteos de clics se capturan al cargar la página, por lo que hacer clic no causa una reorganización inmediata.<br />2. <strong>Cuadrícula fija</strong>: todas las tarjetas tienen el mismo tamaño y se organizan en el número de columnas configurado.<br />Opciones configurables: ancho del contenedor, espaciado (4-32px), radio de borde, opacidad de tarjeta, desenfoque de vidrio esmerilado, tamaño de icono, cambio de modo de diseño y número de columnas en modo fijo.',
        'guide.folders.title': 'Carpetas',
        'guide.folders.desc': 'Las carpetas sirven para agrupar sitios similares. En la ventana de añadir, cambia a "Carpeta" para crear una; puedes marcar sitios existentes o las pestañas actuales para incluirlos y arrastrar para ajustar el orden.<br />Hay 4 tipos de icono de carpeta: <strong>Cuadrícula</strong> (predeterminado; muestra los iconos de los primeros sitios y, si hay más de 4, la cuarta celda muestra la cantidad restante), <strong>Apilado</strong> (muestra apilados los iconos de los primeros 3 sitios), <strong>Imagen personalizada</strong> y <strong>Pegar SVG</strong>. También puedes configurar el color de fondo del icono, si se muestra el fondo, el radio de las esquinas y la escala del icono.<br />Al hacer clic en una carpeta, se despliega un panel flotante cerca de su posición; haz clic en un sitio del panel para abrirlo. Arrastra dentro del panel para reordenar, o fuera del panel para sacar el sitio de la carpeta.<br /><strong>Abrir como grupo</strong>: con clic derecho en una carpeta puedes elegir "Abrir todas las pestañas" o "Abrir todo en un grupo de pestañas". Esta última coloca los sitios de la carpeta en un grupo de pestañas con el nombre de la carpeta. Un conjunto de páginas que no necesitas por ahora puede guardarse como carpeta y cerrarse como grupo en el navegador para liberar la barra de pestañas y la memoria; cuando lo necesites, ábrelo como grupo con un clic y tu espacio de trabajo vuelve tal como estaba.<br />Al eliminar una carpeta, puedes elegir eliminar solo la carpeta y devolver sus sitios a la lista principal, o eliminarla junto con sus sitios.',
        'guide.organize.title': 'Edición y organización',
        'guide.organize.desc': 'Tras activar el "Modo edición" en los ajustes, haz clic en un sitio o carpeta para editarlo o eliminarlo, arrastra para reordenar y suelta en el centro de una carpeta para meterlo dentro. Al terminar, haz clic en "Listo" para salir. Al eliminar un sitio o una carpeta aparece un aviso con "Deshacer", para recuperarlo al instante si fue un error. Si tienes varias nuevas pestañas abiertas, los cambios hechos en una se sincronizan automáticamente con las demás.',
        'guide.tabs.title': 'Añadir desde las pestañas actuales',
        'guide.tabs.desc': 'Al añadir un sitio o crear una carpeta, la ventana muestra las pestañas abiertas en la ventana actual del navegador, organizadas por grupo de pestañas. Puedes seleccionar una pestaña para rellenar automáticamente el título y la URL, o seleccionar varias para añadirlas en lote. Al crear una carpeta también puedes marcar un grupo de pestañas completo, y el nombre de la carpeta se completa solo. Si hay más de <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">12</code> pestañas, aparece un cuadro de búsqueda para filtrar por título, URL o nombre de grupo.',
        'guide.webadd.title': 'Añadir con clic derecho en la página',
        'guide.webadd.desc': 'Haz clic derecho en un espacio vacío de cualquier página y elige "Añadir a Youran Tab" para guardar la página actual; el título de la página se usa como nombre del sitio. Si ya has creado carpetas, el menú se despliega en "Lista principal" y en cada carpeta, para que puedas guardarla directamente en la que quieras. Tras añadirla, aparece un aviso breve en la esquina superior derecha de la página; las páginas ya guardadas muestran "Ya está en Youran Tab" y no se duplican. Los sitios nuevos aparecen la próxima vez que abras o vuelvas a una nueva pestaña. En páginas restringidas, como las tiendas del navegador, no se puede mostrar el aviso, pero el sitio se añade con normalidad.',
        'guide.contextmenu.title': 'Menú contextual',
        'guide.contextmenu.desc': 'Clic derecho en la nueva pestaña (excepto en el tema Terminal):<br />1. <strong>Clic derecho en un sitio</strong>: abrir en una nueva pestaña, editar, mover a una carpeta o sacar de la carpeta, eliminar.<br />2. <strong>Clic derecho en una carpeta</strong>: abrir todas las pestañas, abrir todo en un grupo de pestañas (requiere que el navegador admita grupos de pestañas), editar la carpeta, eliminar.<br />3. <strong>Clic derecho en un espacio vacío</strong>: añadir sitio, cambiar fondo. Si el modo de fondo es aleatorio, se cambia al instante a un nuevo fondo aleatorio; si no, se elige al azar uno de los fondos guardados (sólidos, degradados, imágenes y dinámicos) y se conserva.',
        'guide.icons.title': 'Iconos de sitios',
        'guide.icons.desc': 'El icono es "Auto" de forma predeterminada: se solicita a la vez al propio sitio, al icono integrado del navegador, a Google, Favicon Extractor e icon.horse, se descartan las imágenes de relleno, se elige la más nítida y se guarda localmente; si no hay ninguna, se genera un icono con la inicial. Al editar un sitio también puedes fijar Google, Extractor o icon.horse como fuente del icono, subir un icono personalizado y ajustar el radio de las esquinas. En modo oscuro puedes configurar un conjunto de iconos distinto, útil para iconos de líneas que se ven mal sobre fondos oscuros. Los iconos se guardan en caché local a largo plazo y se vuelven a obtener automáticamente al modificar el sitio o cambiar la fuente del icono.',
        'guide.terminalDetail.title': 'Tema Terminal',
        'guide.terminalDetail.desc': 'Interfaz interactiva de línea de comandos completa con soporte total de teclado. Comandos disponibles:<br /><br /><dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5"><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">h</code></dt><dd>Mostrar ayuda</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">ls</code></dt><dd>Listar todos los sitios; los sitios de una carpeta se muestran como "carpeta / sitio"</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">&lt;número&gt; / nombre / url</code></dt><dd>Abrir un sitio por número, nombre o URL</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">add &lt;url&gt; &lt;nombre&gt;</code></dt><dd>Añadir un sitio nuevo</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">edit &lt;número&gt; &lt;url&gt; &lt;nombre&gt;</code></dt><dd>Editar un sitio</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">rm &lt;número&gt;</code></dt><dd>Eliminar un sitio</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s &lt;palabra clave&gt;</code></dt><dd>Buscar o preguntar con la opción predeterminada</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code></dt><dd>Cambiar de tema</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code></dt><dd>Cambiar el modo de visualización</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code></dt><dd>Cambiar de idioma</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code></dt><dd>Configurar el esquema de color</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code></dt><dd>Configurar el estilo del cursor</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code></dt><dd>Configurar el prompt de comandos</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">width &lt;px|full&gt;</code></dt><dd>Configurar el ancho del terminal</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">set</code></dt><dd>Abrir el panel de ajustes</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code></dt><dd>Exportar datos</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code></dt><dd>Importar datos</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">clear</code></dt><dd>Limpiar la pantalla</dd></dl><br />Hay 9 esquemas de color (Verde, Ámbar, Azul, Cian, Púrpura, Rosa, Rojo, Naranja y Mono) y 4 estilos de cursor (Barra, Ancha, Bloque y Subrayado). Al escribir <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code> o <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code> sin argumentos, puedes elegir la opción con las flechas, confirmar con Enter y cancelar con Esc.<br /><br /><strong>Consejo:</strong> por limitaciones del navegador, al abrir una nueva pestaña el foco está en la barra de direcciones; haz clic en cualquier parte de la página para empezar a escribir comandos.',
        'guide.minimal.title': 'Tema Minimal',
        'guide.minimal.desc': 'Estilo de lista de texto puro sin iconos ni tarjetas, mostrando solo enlaces con nombres de sitios. Este tema no tiene opciones de configuración propias.',
        'guide.glass.title': 'Tema Cristal',
        'guide.glass.desc': 'Tarjetas de píldora de vidrio esmerilado en un diseño de lista horizontal. Opciones configurables: número de columnas (1-4). La barra de búsqueda está integrada en la interfaz principal y los títulos de los sitios se muestran siempre. Funciona muy bien con fondos de imagen o degradado.',
        'guide.bubble.title': 'Tema Burbuja',
        'guide.bubble.desc': 'Efecto de burbujas circulares flotantes, sin títulos de sitios. Dos modos de diseño disponibles:<br />1. <strong>Diseño fijo</strong> (predeterminado): Las burbujas se organizan en orden con espaciado uniforme.<br />2. <strong>Dispersión aleatoria</strong>: Las burbujas se dispersan aleatoriamente en el lienzo utilizando detección de colisiones para evitar superposiciones.<br />Opciones configurables: cambio de modo de diseño, tamaño de burbuja (48-120px). La barra de búsqueda se presenta como una burbuja de búsqueda expandible.',
        'guide.pixel.title': 'Tema Pixel',
        'guide.pixel.desc': 'Estilo retro de píxeles con interacción de lista de menú. Los sitios se muestran en formato de lista con títulos siempre visibles. La barra de búsqueda usa un estilo de línea de comandos. Efecto de animación de líneas de escaneo al pasar el ratón. Este tema no tiene opciones de configuración propias.',
        'guide.sticky.title': 'Tema Nota',
        'guide.sticky.desc': 'Estilo de tablón de notas adhesivas: las notas tienen papel de colores y chinchetas, se inclinan en ángulos aleatorios y se colocan en cascada. Sin fondo configurado, el modo claro muestra un corcho y el modo oscuro un tablero de madera oscuro; también puedes configurar un fondo como en los demás temas. La barra de búsqueda se integra como una nota, con un campo de entrada de línea discontinua dibujada a mano. Opción configurable: mostrar u ocultar el título de los sitios.',
        'guide.search.title': 'Búsqueda',
        'guide.search.desc': 'La barra de búsqueda incluye 10 motores de búsqueda, como Google, Bing y Baidu, y 10 servicios de preguntas con IA, como ChatGPT, Claude y DeepSeek. En los ajustes puedes activar los que quieras, marcar uno con la estrella como predeterminado y elegir si por defecto se busca o se pregunta a una IA. Al hacer clic en el icono delante de la barra de búsqueda, se cambia temporalmente solo en la página actual, sin afectar la configuración de búsqueda del navegador. Preguntar a una IA abre el sitio correspondiente, por lo que conviene iniciar sesión antes en ese servicio. Al escribir, aparecen los sitios guardados que coinciden (incluidos los de carpetas), buscados por nombre, dominio o nombre de carpeta; usa las flechas para seleccionar, Enter para abrir y Ctrl / Cmd + Enter para abrir en una pestaña nueva. En el tema Terminal, usa el comando <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s</code> seguido de una palabra clave para buscar o preguntar con la opción predeterminada.',
        'guide.background.title': 'Ajustes de fondo',
        'guide.background.desc': 'Todos los temas, excepto Terminal y Minimal, admiten ajustes de fondo, con 6 modos:<br />1. <strong>Ninguno</strong>: usa el color de fondo predeterminado de la nueva pestaña del navegador. El tema Notas muestra un corcho cuando no hay fondo.<br />2. <strong>Sólido</strong>: 18 colores predefinidos para claro y 18 para oscuro; también puedes personalizar el color.<br />3. <strong>Degradado</strong>: 18 degradados predefinidos para claro y 18 para oscuro; puedes hacer clic en "Degradado aleatorio" para seguir generando.<br />4. <strong>Imagen</strong>: sube hasta 18 desde tu equipo; se guardan solo localmente.<br />5. <strong>Dinámico</strong>: 18 fondos dinámicos predefinidos para claro y 18 para oscuro.<br />6. <strong>Aleatorio</strong> (predeterminado para nuevos usuarios): alterna al azar entre los sólidos, degradados, imágenes y dinámicos marcados, y vuelve a elegir cada vez que abres una nueva pestaña o haces clic en "Cambiar fondo". La fuente aleatoria puede ser "Generar nuevo", que crea un fondo totalmente nuevo cada vez, o "De preajustes", que elige solo entre los preajustes existentes y las imágenes subidas.<br />Si algún preajuste de sólido, degradado o dinámico no te gusta, puedes eliminarlo; al añadir uno se genera de nuevo, y también puedes usar "Regenerar 18 opciones" de una vez. Los fondos de los modos claro y oscuro son independientes entre sí.',
        'guide.darkmode.title': 'Modo oscuro',
        'guide.darkmode.desc': 'Soporta 3 modos: seguir sistema automáticamente, claro manual y oscuro manual. En modo oscuro, puede configurar iconos independientes para los sitios.',
        'guide.importexport.title': 'Importar y exportar',
        'guide.importexport.desc': 'En los ajustes puedes exportar datos y elegir entre "Solo sitios", "Solo configuración" o "Sitios + Configuración"; el nombre del archivo incluye automáticamente la versión de la extensión. Los datos de sitios incluyen la estructura de carpetas, los iconos y estilos de las carpetas y los sitios que contienen. Al importar, los sitios se combinan con los datos existentes omitiendo los duplicados; la configuración sobrescribe todos los ajustes actuales y la página se recarga automáticamente. Los archivos de una versión superior requieren actualizar primero la extensión. En el tema Terminal también puedes usar los comandos <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code> e <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code> para hacer lo mismo.',
        'guide.browser.title': 'Permisos',
        'guide.browser.desc': 'El uso de cada permiso del navegador es el siguiente:<br />1. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code>: al añadir sitios o crear carpetas, lee el título, la URL y el nombre de grupo de las pestañas de la ventana actual, y abre carpetas como grupos de pestañas.<br />2. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code>: ofrece "Añadir a Youran Tab" en el menú contextual de las páginas.<br />3. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code>: tras añadir una página, muestra un aviso en la esquina superior derecha de la página actual.<br />4. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code>: guarda tus sitios y ajustes, y transfiere entre el segundo plano y la nueva pestaña las páginas pendientes de añadir.<br />5. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code> (solo Chrome y Edge): elimina el límite de tamaño del almacenamiento de la extensión para poder guardar muchos iconos personalizados subidos.<br />6. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code>: usa el motor de búsqueda predeterminado del navegador cuando es necesario.<br />7. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> (solo Chrome y Edge): lee los iconos de sitios integrados del navegador como una de las fuentes de iconos.<br />8. permisos de acceso a servicios de iconos (Google, gstatic, Favicon Extractor, icon.horse): obtienen y almacenan en caché los iconos de los sitios.',
        'guide.align.title': 'Alineación',
        'guide.align.desc': 'El contenido admite 3 opciones de alineación vertical: superior, centro e inferior. Cada tema guarda su configuración de alineación de forma independiente.',
        'guide.reset.title': 'Restablecer ajustes y borrar caché',
        'guide.reset.desc': '"Restablecer ajustes" devuelve todos los ajustes a sus valores predeterminados; los datos de sitios añadidos y los conteos de clics se conservan, y solo se restauran la apariencia y la configuración de funciones. "Borrar caché de iconos" elimina todos los iconos de sitios almacenados en caché y se volverán a descargar la próxima vez que abras la página.',
        'changelog.title': 'Registro de cambios',
        'changelog.storeDelayHint': 'La versión de la tienda puede retrasarse debido a la revisión de la tienda del navegador.',
        'changelog.v1.feat1': '8 temas: Clásico, Bento, Terminal, Minimal, Cristal, Burbuja, Pixel, Nota',
        'changelog.v1.feat2': 'Barra de búsqueda integrada',
        'changelog.v1.feat3': 'Múltiples modos de fondo: sólido, degradado, imagen, dinámico y aleatorio',
        'changelog.v1.feat4': 'Modo oscuro con seguimiento del sistema o cambio manual',
        'changelog.v1.feat5': 'Soporte para 10 idiomas',
        'changelog.v1.feat6': 'Importación y exportación de configuración de sitios',
        'changelog.v1.feat7': '3 fuentes de iconos en línea con soporte de carga personalizada',
    },
    'ru': {
        'site.title': 'Youran Tab — настраиваемая новая вкладка',
        'site.description':
            'Youran Tab — это расширение новой вкладки с открытым исходным кодом и высокой настраиваемостью, с множеством тем, фонов и макетов.',
        'lang.label': 'Язык',
        'lang.auto': 'Язык браузера',
        'theme.label': 'Тема',
        'theme.auto': 'Авто',
        'theme.light': 'Светлая',
        'theme.dark': 'Тёмная',
        'hero.badge': 'Подходит для Chrome / Edge / Firefox',
        'hero.compat':
            'Браузеры 360, QQ, Sogou, Liebao и другие могут устанавливать расширения прямо из магазина Edge — полная совместимость.',
        'hero.title': 'Youran Tab',
        'hero.desc':
            'Расширение новой вкладки с открытым исходным кодом и высокой настраиваемостью.<br />8 тем, 10 языков и несколько фонов для вашей стартовой страницы.',
        'themes.title': '8 тем, переключайтесь как угодно',
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
        'themes.glass.title': 'Стекло',
        'themes.glass.desc': 'Карточки-пилюли из матового стекла в горизонтальном списке. Регулируемое число колонок для чистого современного вида.',
        'themes.bubble.title': 'Пузыри',
        'themes.bubble.desc': 'Плавающие круглые пузыри. Поддерживает фиксированное и случайное расположение с настраиваемым размером.',
        'themes.pixel.title': 'Пиксель',
        'themes.pixel.desc': 'Ретро-пиксельный стиль с поисковой строкой в виде командной строки и взаимодействием через меню-список.',
        'themes.sticky.title': 'Стикер',
        'themes.sticky.desc': 'Доска стикеров с декоративными булавками, цветной бумагой и каскадной раскладкой.',
        'features.title': 'Много функций, лёгкая работа',
        'features.subtitle': 'Полностью open source. Все данные хранятся локально. Без аккаунтов и трекинга.',
        'features.search.title': 'Быстрый поиск',
        'features.search.desc': 'Встроено 10 популярных поисковых систем и 10 сервисов вопросов к ИИ. Включайте нужные, назначайте вариант по умолчанию и временно переключайтесь прямо у строки поиска. Настройки поиска самого браузера не меняются. При вводе также находятся сохранённые сайты.',
        'features.folders.title': 'Организация в папки',
        'features.folders.desc': 'Собирайте похожие сайты в папки с иконками в виде сетки или стопки. Можно сохранить группу вкладок целиком и открыть всё сразу как группу.',
        'features.clip.title': 'Добавление страниц в один клик',
        'features.clip.desc': 'На любой странице щёлкните правой кнопкой мыши и выберите «Добавить в Youran Tab», чтобы сохранить её в основной список или в нужную папку.',
        'features.background.title': 'Разные фоны',
        'features.background.desc': 'Однотонные, градиентные, изображения, динамические и случайные фоны. Светлая и тёмная темы настраиваются отдельно, а в случайном режиме при каждом открытии появляется новый фон.',
        'features.dark.title': 'Тёмный режим',
        'features.dark.desc': 'Следует системе или ручное переключение светлый / тёмный.',
        'features.languages.title': '10 языков',
        'features.languages.desc':
            'Китайский, английский, японский, корейский, французский, немецкий, испанский, русский, итальянский. Автоопределение языка системы.',
        'features.icons.title': 'Чёткие значки',
        'features.icons.desc': 'Автоматически выбирает самый чёткий значок из нескольких источников. Источник можно задать вручную, загрузить собственный значок и отдельно настроить значки для тёмной темы.',
        'features.organize.title': 'Упорядочивание перетаскиванием',
        'features.organize.desc': 'В режиме редактирования перетаскивайте, чтобы менять порядок, и бросайте на папку, чтобы разложить по категориям. Случайно удалённый сайт или папку можно сразу вернуть.',
        'features.sync.title': 'Импорт и экспорт',
        'features.sync.desc': 'Сайты и настройки можно экспортировать в JSON по отдельности или вместе и восстановить в один клик на новом устройстве.',
        'foldersSpotlight.title': 'Слишком много вкладок? Уберите их в папку и открывайте одним кликом, когда нужно',
        'foldersSpotlight.desc':
            'Сохраните набор используемых страниц как папку, а когда они временно не нужны, закройте всю группу и освободите панель вкладок и память компьютера. Когда они снова понадобятся, щёлкните папку правой кнопкой мыши и выберите «Открыть все в группе вкладок»: страницы снова соберутся в группу с названием папки, а рабочее пространство вернётся в прежнем виде.',
        'foldersSpotlight.step1.title': 'Сохраните группу целиком',
        'foldersSpotlight.step1.desc': 'При создании папки сразу отметьте текущую группу вкладок или щёлкните правой кнопкой мыши на любой странице и добавьте её в нужную папку.',
        'foldersSpotlight.step2.title': 'Спокойно закройте',
        'foldersSpotlight.step2.desc': 'Закройте всю группу вкладок в браузере: она больше не занимает ни панель вкладок, ни память.',
        'foldersSpotlight.step3.title': 'Верните в один клик',
        'foldersSpotlight.step3.desc': 'Щёлкните папку правой кнопкой мыши и откройте всё в группе вкладок. Группа автоматически получит название папки.',
        'foldersSpotlight.sceneTitle': 'Подходит для таких случаев',
        'foldersSpotlight.sceneDesc':
            'Админ-панели проектов, страницы мероприятий, документация, временные исследования... Такие страницы нужны всего несколько дней: для закладок они не годятся, но временно хранить их всё же нужно. Лучше всего подойдёт папка.',
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
        'nav.name': 'Youran Tab',
        'nav.home': 'Главная',
        'nav.support': 'Поддержать',
        'nav.privacy': 'Конфиденциальность',
        'nav.guide': 'Руководство',
        'nav.changelog': 'История изменений',
        'support.title': 'Поддержать Youran Tab',
        'support.subtitle': 'Если этот проект оказался полезным, вы можете поддержать его любым из способов ниже. Ваша поддержка помогает продолжать разработку, сопровождение и улучшение пользовательского опыта.',
        'support.note': 'Вы можете добавить в сообщение поддержки ссылку на ваш GitHub или другой социальный профиль. Я упомяну вас в списке благодарностей в репозитории и на официальном сайте.',
        'support.buymeacoffee.title': 'Buy Me a Coffee',
        'support.buymeacoffee.desc': 'Поддержите проект через Buy Me a Coffee и помогите ему развиваться дальше.',
        'support.paypal.desc': 'Быстрая поддержка через PayPal, удобно для международных и межрегиональных платежей.',
        'support.wechat.title': 'Поддержка через WeChat',
        'support.wechat.desc': 'Откройте WeChat и отсканируйте код. Спасибо за поддержку и внимание к проекту.',
        'support.alipay.title': 'Alipay',
        'support.alipay.desc': 'Отсканируйте код в Alipay и поддержите дальнейшее развитие проекта.',
        'support.openLink': 'Поддержать сейчас',
        'privacy.title': 'Политика конфиденциальности',
        'privacy.updated': 'Последнее обновление: 18 ноября 2026 г.',
        'privacy.intro.title': 'Обзор',
        'privacy.intro.desc': 'Youran Tab (далее — «данное расширение») — это расширение новой вкладки для браузера с открытым исходным кодом. Мы высоко ценим вашу конфиденциальность. Данное расширение не собирает, не хранит и не передаёт никаких персональных данных пользователей.',
        'privacy.collect.title': 'Сбор данных',
        'privacy.collect.desc': 'Данное расширение не собирает никакой личной информации или данных об использовании. Все данные конфигурации (включая списки сайтов, настройки тем, настройки фона и т. д.) хранятся в локальном хранилище браузера и никогда не отправляются на внешние серверы. При использовании функции «Добавить из текущих вкладок» расширение лишь локально читает заголовки, URL и названия групп открытых вкладок и групп вкладок в текущем окне браузера, чтобы показать список для выбора. При использовании пункта «Добавить в Youran Tab» в контекстном меню страницы расширение читает только заголовок и URL страницы, на которой вы щёлкнули правой кнопкой мыши, и сохраняет их как сайт.',
        'privacy.storage.title': 'Локальное хранилище',
        'privacy.storage.desc': 'Данное расширение использует хранилище расширений браузера (storage.local) для сохранения ваших сайтов и персональных настроек. Фоновый скрипт читает оттуда список сайтов, чтобы проверять, добавлена ли уже страница, и строить меню папок, а также передаёт через него новой вкладке страницы, добавленные из контекстного меню. При обновлении с версии ниже 0.5.0 данные, ранее сохранённые в localStorage, переносятся автоматически, а их резервная копия остаётся на устройстве. Эти данные полностью хранятся на вашем устройстве. Вы можете в любой момент создать резервную копию с помощью функции экспорта расширения, а удаление расширения стирает все данные.',
        'privacy.network.title': 'Сетевые запросы',
        'privacy.network.desc': 'Данное расширение обращается к публичным сервисам значков (Google, Favicon Extractor, icon.horse) и к файлам значков самих сайтов только при получении значков сайтов, при этом запросы содержат лишь домен сайта. Когда вы отправляете поисковый запрос или вопрос к ИИ, текст запроса напрямую отправляется выбранному стороннему сервису, и открывается страница результатов. Расширение и его разработчик не собирают и не хранят содержимое запросов, а также не отправляют ваш список сайтов, настройки, фон и другие локальные данные конфигурации.',
        'privacy.thirdparty.title': 'Сторонние сервисы',
        'privacy.thirdparty.desc': 'Данное расширение не интегрирует никаких сторонних сервисов аналитики, рекламы или отслеживания.',
        'privacy.permissions.title': 'Разрешения',
        'privacy.permissions.desc': 'Данное расширение запрашивает только необходимые для работы разрешения: <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code> и <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code> нужны для чтения заголовков, URL и названий групп вкладок текущего окна и для открытия папок в группах вкладок; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code> нужно для пункта «Добавить в Youran Tab» в контекстном меню страниц; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code> и <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code> используются только для показа уведомления о добавлении на текущей странице после выбора этого пункта меню и не читают содержимое страницы; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code> нужно для сохранения сайтов и настроек и для передачи внутри расширения страниц, ожидающих добавления; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code> (только Chrome и Edge) снимает ограничение на объём хранилища расширения, чтобы сохранялись даже многочисленные загруженные значки; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code> нужно для вызова поисковой системы браузера по умолчанию; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> нужно для чтения встроенных значков сайтов браузера. Расширение не читает текст страниц, содержимое форм, персональные данные, данные учётных записей, пароли и платёжные данные, а также не получает доступ к истории посещений и закладкам.',
        'privacy.changes.title': 'Изменения политики',
        'privacy.changes.desc': 'Если в данной политике конфиденциальности произойдут какие-либо изменения, мы обновим информацию на этой странице. Поскольку данное расширение не собирает никаких данных, существенных изменений в политике не ожидается.',
        'privacy.opensource.title': 'Открытость исходного кода',
        'privacy.opensource.desc': 'Данное расширение полностью открыто, исходный код размещён на <a href="https://github.com/dufu1991/youran-tab" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub</a>. Любой желающий может проверить код, чтобы убедиться в наших обязательствах по защите конфиденциальности.',
        'privacy.contact.title': 'Контакты',
        'privacy.contact.desc': 'Если у вас есть какие-либо вопросы или опасения, связанные с конфиденциальностью, свяжитесь с нами через <a href="https://github.com/dufu1991/youran-tab/issues" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub Issues</a>.',
        'guide.title': 'Руководство',
        'guide.install.title': 'Установка',
        'guide.install.desc': 'Найдите «Youran Tab» в Chrome Web Store, магазине дополнений Edge или дополнениях Firefox и установите. После установки откройте новую вкладку, чтобы начать использование. Китайские браузеры, такие как 360, QQ и Sogou, можно установить из магазина дополнений Edge. При первом запуске предустановлены 4 сайта (Google, YouTube, ChatGPT и Baidu), а по умолчанию используется случайный фон.',
        'guide.addsite.title': 'Добавление сайтов',
        'guide.addsite.desc': 'Есть 3 способа:<br />1. <strong>Вручную</strong>: включите в настройках «Режим редактирования» и нажмите «+ Добавить сайт» либо щёлкните правой кнопкой мыши на пустом месте и выберите «Добавить сайт», затем введите название и URL. Значок подгружается автоматически.<br />2. <strong>Из текущих вкладок</strong>: выберите уже открытую вкладку прямо в окне добавления, подробнее ниже.<br />3. <strong>Правой кнопкой мыши на странице</strong>: сохраняйте страницы прямо во время просмотра, подробнее ниже.',
        'guide.theme.title': 'Обзор тем',
        'guide.theme.desc': 'В панели настроек можно выбрать одну из 8 тем: Классика, Бенто, Терминал, Минимал, Стекло, Пузыри, Пиксель или Стикер. Каждая тема имеет независимые параметры настройки. Смена темы не приведёт к потере настроек других тем, а папки доступны во всех визуальных темах.',
        'guide.classic.title': 'Тема Классика',
        'guide.classic.desc': 'Стандартная сетка значков с фоном карточки из матового стекла при наведении. Настраиваемые параметры: ширина контейнера (400-1400px), количество столбцов (3-8), скругление углов, прозрачность карточки, размытие матового стекла, размер значка. Количество столбцов автоматически уменьшается в зависимости от числа сайтов, чтобы избежать пустых столбцов.',
        'guide.bento.title': 'Тема Бенто',
        'guide.bento.desc': 'Доступны два режима компоновки:<br />1. <strong>Динамическая компоновка</strong> (по умолчанию): размер карточек определяется количеством кликов с использованием алгоритма Treemap. Сайты с большим числом кликов занимают большую площадь, новые сайты также имеют начальную площадь. Карточки папок суммируют клики внутренних сайтов, поэтому часто используемые папки тоже автоматически увеличиваются. Количество кликов фиксируется при загрузке страницы, поэтому клик не вызывает немедленную перекомпоновку.<br />2. <strong>Фиксированная сетка</strong>: все карточки одинакового размера, расположены в заданном числе столбцов.<br />Настраиваемые параметры: ширина контейнера, отступы (4-32px), скругление углов, прозрачность карточки, размытие матового стекла, размер значка, переключение режима компоновки, количество столбцов в фиксированном режиме.',
        'guide.folders.title': 'Папки',
        'guide.folders.desc': 'Папки нужны, чтобы собирать похожие сайты. В окне добавления переключитесь на «Папка», чтобы создать новую: можно отметить существующие сайты или текущие вкладки и перетаскиванием изменить порядок.<br />Иконка папки бывает 4 видов: <strong>Сетка</strong> (по умолчанию, показывает значки первых сайтов, а при числе сайтов больше 4 в четвёртой ячейке отображается количество остальных), <strong>Стопка</strong> (стопкой показываются значки первых 3 сайтов), <strong>Своя картинка</strong> и <strong>Вставить SVG</strong>. Также можно настроить цвет фона иконки, показ фона, скругление углов и размер значка.<br />Щелчок по папке раскрывает всплывающую панель рядом с её местом, а щелчок по сайту в ней открывает его. Перетаскивание внутри панели меняет порядок, а перетаскивание за её пределы вынимает сайт из папки.<br /><strong>Открытие группой</strong>: щёлкните папку правой кнопкой мыши и выберите «Открыть все вкладки» или «Открыть все в группе вкладок». Второй вариант помещает сайты папки в группу вкладок с названием папки. Набор страниц, который пока не нужен, можно сохранить как папку и закрыть в браузере всей группой, освободив панель вкладок и память; когда понадобится, откройте его группой в один клик, и рабочее пространство вернётся в прежнем виде.<br />При удалении папки можно удалить только саму папку, вернув сайты в основной список, или удалить её вместе с сайтами.',
        'guide.organize.title': 'Редактирование и упорядочивание',
        'guide.organize.desc': 'Включите в настройках «Режим редактирования», затем щёлкните сайт или папку, чтобы изменить или удалить их; перетаскивайте, чтобы менять порядок, и бросайте на центр папки, чтобы положить сайт в неё. Закончив, нажмите «Готово». После удаления сайта или папки появится уведомление с кнопкой «Отменить», чтобы случайное удаление можно было сразу вернуть. Если открыто несколько новых вкладок, изменения на одной из них автоматически синхронизируются с остальными.',
        'guide.tabs.title': 'Быстрое добавление из текущих вкладок',
        'guide.tabs.desc': 'При добавлении сайта или создании папки в окне показываются вкладки текущего окна браузера, сгруппированные по группам вкладок. Выберите одну вкладку, чтобы автоматически подставить заголовок и URL, или отметьте несколько и добавьте их разом. При создании папки можно также отметить группу вкладок целиком, а название папки подставится автоматически. Если вкладок больше <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">12</code>, появляется поле поиска: можно фильтровать по заголовку, URL или названию группы.',
        'guide.webadd.title': 'Добавление правой кнопкой мыши на странице',
        'guide.webadd.desc': 'Щёлкните правой кнопкой мыши на пустом месте любой страницы и выберите «Добавить в Youran Tab», чтобы сохранить текущую страницу; заголовок страницы станет названием сайта. Если папки уже созданы, меню раскроется на «Основной список» и все папки, и страницу можно сразу положить в нужную. После добавления в правом верхнем углу страницы ненадолго появится уведомление; уже сохранённые страницы покажут «Уже есть в Youran Tab» и не будут добавлены повторно. Новые сайты появятся при следующем открытии новой вкладки или возвращении на неё. На служебных страницах, например в магазинах браузера, уведомление показать нельзя, но сайт всё равно добавляется как обычно.',
        'guide.contextmenu.title': 'Контекстное меню',
        'guide.contextmenu.desc': 'Щелчок правой кнопкой мыши на новой вкладке (кроме темы «Терминал»):<br />1. <strong>На сайте</strong>: открыть в новой вкладке, изменить, переместить в папку или вынуть из папки, удалить.<br />2. <strong>На папке</strong>: открыть все вкладки, открыть все в группе вкладок (нужна поддержка групп вкладок в браузере), изменить папку, удалить.<br />3. <strong>На пустом месте</strong>: добавить сайт, сменить фон. Если режим фона случайный, сразу выбирается новый случайный фон; если нет, случайно выбирается один из сохранённых однотонных, градиентных, изображений и динамических фонов и остаётся установленным.',
        'guide.icons.title': 'Значки сайтов',
        'guide.icons.desc': 'По умолчанию значок выбирается в режиме «Auto»: запросы одновременно уходят самому сайту, во встроенные значки браузера, в Google, Favicon Extractor и icon.horse, заглушки пропускаются, самый чёткий значок выбирается и сохраняется локально; если ничего нет, создаётся значок с первой буквой. При редактировании сайта можно также вручную выбрать Google, Extractor или icon.horse как источник значка, загрузить собственный значок и настроить скругление его углов. В тёмной теме можно задать отдельный набор значков, это удобно для линейных значков, плохо различимых на тёмном фоне. Значки надолго кэшируются локально и автоматически загружаются заново после изменения сайта или смены источника значка.',
        'guide.terminalDetail.title': 'Тема Терминал',
        'guide.terminalDetail.desc': 'Полноценный интерфейс командной строки с управлением только с клавиатуры. Доступные команды:<br /><br /><dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5"><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">h</code></dt><dd>Показать справку</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">ls</code></dt><dd>Список всех сайтов; сайты внутри папок отображаются как «папка / сайт»</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">&lt;номер&gt; / название / url</code></dt><dd>Открыть сайт по номеру, названию или URL</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">add &lt;url&gt; &lt;название&gt;</code></dt><dd>Добавить новый сайт</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">edit &lt;номер&gt; &lt;url&gt; &lt;название&gt;</code></dt><dd>Изменить сайт</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">rm &lt;номер&gt;</code></dt><dd>Удалить сайт</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s &lt;ключевое слово&gt;</code></dt><dd>Поиск или вопрос по варианту по умолчанию</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code></dt><dd>Сменить тему</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code></dt><dd>Сменить режим отображения</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code></dt><dd>Сменить язык</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code></dt><dd>Настроить цветовую схему</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code></dt><dd>Настроить стиль курсора</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code></dt><dd>Настроить приглашение командной строки</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">width &lt;px|full&gt;</code></dt><dd>Настроить ширину терминала</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">set</code></dt><dd>Открыть панель настроек</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code></dt><dd>Экспортировать данные</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code></dt><dd>Импортировать данные</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">clear</code></dt><dd>Очистить экран</dd></dl><br />Доступно 9 цветовых схем (Зелёный, Янтарный, Синий, Бирюзовый, Фиолетовый, Розовый, Красный, Оранжевый и Моно) и 4 стиля курсора (Линия, Широкая, Блок и Подчёркивание). Если ввести <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code> или <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code> без аргументов, вариант можно выбрать стрелками, подтвердить клавишей Enter и отменить клавишей Esc.<br /><br /><strong>Подсказка:</strong> из-за ограничений браузера при открытии новой вкладки фокус по умолчанию находится в адресной строке; щёлкните в любом месте страницы, чтобы начать вводить команды.',
        'guide.minimal.title': 'Тема Минимал',
        'guide.minimal.desc': 'Чисто текстовый список без значков и карточек, отображаются только ссылки с названиями сайтов. У этой темы нет собственных настроек.',
        'guide.glass.title': 'Тема Стекло',
        'guide.glass.desc': 'Матовые стеклянные карточки-таблетки в горизонтальном списке. Настраиваемые параметры: количество столбцов (1-4). Строка поиска встроена в основной интерфейс, названия сайтов всегда отображаются. Отлично сочетается с фонами-изображениями или градиентами.',
        'guide.bubble.title': 'Тема Пузыри',
        'guide.bubble.desc': 'Эффект плавающих круглых пузырей, без названий сайтов. Доступны два режима компоновки:<br />1. <strong>Фиксированная</strong> (по умолчанию): пузыри расположены по порядку с равными промежутками.<br />2. <strong>Случайное расположение</strong>: пузыри случайно разбросаны по холсту с алгоритмом обнаружения столкновений, чтобы они не перекрывались.<br />Настраиваемые параметры: переключение режима, размер пузырей (48-120px). Строка поиска представлена в виде раскрывающегося пузыря поиска.',
        'guide.pixel.title': 'Тема Пиксель',
        'guide.pixel.desc': 'Ретро-пиксельный стиль с взаимодействием в виде списка меню. Сайты отображаются в виде списка, названия сайтов всегда показаны. Строка поиска в стиле командной строки. При наведении — эффект анимации сканирующих линий. У этой темы нет собственных настроек.',
        'guide.sticky.title': 'Тема Стикер',
        'guide.sticky.desc': 'Стиль доски с липкими заметками: заметки на цветной бумаге с кнопками-булавками, случайно наклонены и расположены каскадом. Если фон не задан, в светлом режиме показывается пробковая доска, а в тёмном тёмная деревянная; фон можно задать и так же, как в других темах. Строка поиска встроена в виде заметки с нарисованным от руки пунктирным полем ввода. Настраивается: показ или скрытие названий сайтов.',
        'guide.search.title': 'Поиск',
        'guide.search.desc': 'В строку поиска встроено 10 поисковых систем, среди них Google, Bing и Baidu, и 10 сервисов вопросов к ИИ, среди них ChatGPT, Claude и DeepSeek. В настройках можно включить нужные, отметить звёздочкой вариант по умолчанию и выбрать, что использовать по умолчанию: поиск или вопрос к ИИ. Щелчок по значку перед строкой поиска временно переключает вариант только на текущей странице и не влияет на настройки поиска самого браузера. Вопрос к ИИ открывает соответствующий сайт, поэтому лучше сначала войти в аккаунт этого сервиса. При вводе появляется список подходящих сохранённых сайтов (включая сайты в папках) с поиском по названию, домену или названию папки: стрелки выбирают, Enter открывает, Ctrl / Cmd + Enter открывает в новой вкладке. В теме «Терминал» команда <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s</code> с ключевым словом выполняет поиск или вопрос по варианту по умолчанию.',
        'guide.background.title': 'Настройки фона',
        'guide.background.desc': 'Фон можно настроить во всех темах, кроме «Терминал» и «Минимализм». Есть 6 режимов:<br />1. <strong>Нет</strong>: используется цвет фона новой вкладки браузера по умолчанию. В теме «Стикеры» без фона показывается пробковая доска.<br />2. <strong>Однотонный</strong>: 18 готовых цветов для светлой и 18 для тёмной темы, также можно выбрать свой цвет.<br />3. <strong>Градиент</strong>: 18 готовых градиентов для светлой и 18 для тёмной темы; можно нажать «Случайный градиент» и создавать новые.<br />4. <strong>Изображение</strong>: загружайте с компьютера до 18 изображений, они хранятся только локально.<br />5. <strong>Динамический</strong>: 18 готовых динамических фонов для светлой и 18 для тёмной темы.<br />6. <strong>Случайный</strong> (по умолчанию для новых пользователей): случайно переключается между отмеченными однотонными, градиентными, изображениями и динамическими фонами и выбирает заново при каждом открытии новой вкладки или нажатии «Сменить фон». Источник случайного фона: «Создавать новый» каждый раз создаёт совершенно новый фон, а «Из пресетов» выбирает только среди готовых пресетов и загруженных изображений.<br />Если пресеты однотонных, градиентных и динамических фонов не нравятся, их можно удалить; при добавлении новые создаются заново, а кнопка «Создать 18 заново» делает это разом. Фоны светлой и тёмной тем настраиваются независимо.',
        'guide.darkmode.title': 'Тёмный режим',
        'guide.darkmode.desc': 'Поддерживается 3 режима: автоматическое следование за системой, ручной светлый и ручной тёмный. В тёмном режиме можно настроить отдельные значки для сайтов.',
        'guide.importexport.title': 'Импорт и экспорт',
        'guide.importexport.desc': 'В настройках можно экспортировать данные, выбрав «Только сайты», «Только настройки» или «Сайты + Настройки»; в имя файла автоматически добавляется версия расширения. Данные сайтов включают структуру папок, иконки и стили папок и находящиеся в них сайты. При импорте сайты объединяются с существующими данными, дубликаты пропускаются; настройки перезаписывают все текущие, после импорта страница обновляется автоматически. Файлы из более новой версии сначала требуют обновления расширения. В теме «Терминал» то же можно сделать командами <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code> и <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code>.',
        'guide.browser.title': 'Разрешения',
        'guide.browser.desc': 'Назначение разрешений браузера:<br />1. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code>: при добавлении сайта или создании папки читает заголовки, URL и названия групп вкладок текущего окна, а также открывает папки в группах вкладок.<br />2. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code>: добавляет «Добавить в Youran Tab» в контекстное меню страниц.<br />3. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code>: после добавления страницы показывает уведомление в правом верхнем углу текущей страницы.<br />4. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code>: сохраняет сайты и настройки и передаёт между фоновым процессом и новой вкладкой страницы, ожидающие добавления.<br />5. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code> (только Chrome и Edge): снимает ограничение на объём хранилища расширения, чтобы сохранялись даже многочисленные загруженные значки.<br />6. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code>: при необходимости вызывает поисковую систему браузера по умолчанию.<br />7. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> (только Chrome и Edge): читает встроенные значки сайтов браузера как один из источников значков.<br />8. доступ к сервисам значков (Google, gstatic, Favicon Extractor, icon.horse): получение и кэширование значков сайтов.',
        'guide.align.title': 'Выравнивание',
        'guide.align.desc': 'Контент поддерживает 3 варианта вертикального выравнивания: верх, центр и низ. Настройка выравнивания сохраняется для каждой темы независимо.',
        'guide.reset.title': 'Сброс настроек и очистка кэша',
        'guide.reset.desc': '«Сбросить настройки» возвращает все настройки к значениям по умолчанию; добавленные сайты и счётчики кликов сохраняются, восстанавливаются только внешний вид и настройки функций. «Очистить кэш иконок» удаляет все кэшированные значки сайтов, при следующем открытии они будут загружены заново.',
        'changelog.title': 'История изменений',
        'changelog.storeDelayHint': 'Публикация версии в магазине может задерживаться из-за проверки браузерного магазина.',
        'changelog.v1.feat1': '8 тем: Классика, Бенто, Терминал, Минимал, Стекло, Пузыри, Пиксель, Стикер',
        'changelog.v1.feat2': 'Встроенная строка поиска',
        'changelog.v1.feat3': 'Несколько режимов фона: однотонный, градиент, изображение, динамический и случайный',
        'changelog.v1.feat4': 'Тёмный режим с автоследованием за системой или ручным переключением',
        'changelog.v1.feat5': 'Поддержка 10 языков',
        'changelog.v1.feat6': 'Импорт и экспорт конфигурации сайтов',
        'changelog.v1.feat7': '3 онлайн-источника значков с поддержкой загрузки своих',
    },
    'fr': {
        'site.title': 'Youran Tab - Nouvel onglet personnalisable',
        'site.description':
            'Youran Tab est une extension de nouvel onglet open source et hautement personnalisable, avec plusieurs thèmes, fonds et mises en page.',
        'lang.label': 'Langue',
        'lang.auto': 'Suivre le navigateur',
        'theme.label': 'Thème',
        'theme.auto': 'Automatique',
        'theme.light': 'Clair',
        'theme.dark': 'Sombre',
        'hero.badge': 'Compatible avec Chrome / Edge / Firefox',
        'hero.compat':
            'Les navigateurs 360, QQ, Sogou et Liebao peuvent installer directement depuis le store Edge — entièrement compatibles.',
        'hero.title': 'Youran Tab',
        'hero.desc':
            'Une extension de nouvel onglet open source et hautement personnalisable.<br />8 thèmes, 10 langues et plusieurs fonds pour créer votre page de démarrage.',
        'themes.title': '8 thèmes, changez à volonté',
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
        'themes.glass.title': 'Verre',
        'themes.glass.desc': 'Cartes pilules en verre dépoli en liste horizontale. Nombre de colonnes ajustable pour un look propre et moderne.',
        'themes.bubble.title': 'Bulle',
        'themes.bubble.desc': 'Bulles circulaires flottantes. Disposition fixe et aléatoire avec taille ajustable.',
        'themes.pixel.title': 'Pixel',
        'themes.pixel.desc': 'Style rétro pixel avec barre de recherche type terminal et interaction par menu liste.',
        'themes.sticky.title': 'Post-it',
        'themes.sticky.desc': 'Tableau de post-it avec épingles décoratives, papiers colorés et disposition en cascade.',
        'features.title': 'Fonctions riches, exécution légère',
        'features.subtitle': 'Entièrement open source. Toutes les données sont locales. Sans compte, sans suivi.',
        'features.search.title': 'Recherche rapide',
        'features.search.desc': '10 moteurs de recherche courants et 10 services de questions IA intégrés : activez ceux que vous voulez, définissez un choix par défaut et changez temporairement depuis la barre de recherche, sans toucher aux réglages de recherche du navigateur. La saisie retrouve aussi vos sites enregistrés.',
        'features.folders.title': 'Rangement en dossiers',
        'features.folders.desc': 'Rangez les sites similaires dans des dossiers affichés en grille ou en pile d’icônes, enregistrez un groupe d’onglets entier et rouvrez tout un dossier en un clic sous forme de groupe.',
        'features.clip.title': 'Ajout en un clic depuis le web',
        'features.clip.desc': 'Sur n’importe quelle page, faites un clic droit et choisissez « Ajouter à Youran Tab » pour l’envoyer dans la liste principale ou dans un dossier précis.',
        'features.background.title': 'Multiples arrière-plans',
        'features.background.desc': 'Fonds unis, dégradés, images, dynamiques et aléatoires, avec une configuration distincte pour les modes clair et sombre. En mode aléatoire, chaque ouverture apporte un nouveau fond.',
        'features.dark.title': 'Mode sombre',
        'features.dark.desc': 'Suivre le système ou basculer clair / sombre manuellement.',
        'features.languages.title': '10 langues',
        'features.languages.desc':
            'Chinois, anglais, japonais, coréen, français, allemand, espagnol, russe, italien. Détection automatique de la langue du système.',
        'features.icons.title': 'Icônes nettes',
        'features.icons.desc': 'Youran Tab choisit automatiquement l’icône la plus nette parmi plusieurs sources. Vous pouvez aussi imposer une source, importer une icône personnalisée et définir une icône distincte pour le mode sombre.',
        'features.organize.title': 'Organisation par glisser-déposer',
        'features.organize.desc': 'En mode édition, faites glisser pour réordonner et déposez sur un dossier pour classer. Un site ou un dossier supprimé par erreur peut être restauré aussitôt.',
        'features.sync.title': 'Importer / exporter',
        'features.sync.desc': 'Exportez les sites et les réglages séparément ou ensemble au format JSON, puis restaurez-les en un clic sur un autre appareil.',
        'foldersSpotlight.title': 'Trop d’onglets ? Rangez-les dans un dossier et rouvrez-les en un clic',
        'foldersSpotlight.desc':
            'Enregistrez un ensemble de pages en cours d’utilisation dans un dossier, puis fermez-le d’un coup quand vous n’en avez plus besoin pour libérer la barre d’onglets et la mémoire. Au moment voulu, faites un clic droit sur le dossier et choisissez « Tout ouvrir dans un groupe d’onglets » : les pages reforment un groupe d’onglets portant le nom du dossier et votre espace de travail revient tel quel.',
        'foldersSpotlight.step1.title': 'Enregistrer le groupe',
        'foldersSpotlight.step1.desc': 'Lors de la création d’un dossier, cochez directement le groupe d’onglets actuel, ou faites un clic droit sur n’importe quelle page pour l’ajouter à un dossier.',
        'foldersSpotlight.step2.title': 'Fermer sans crainte',
        'foldersSpotlight.step2.desc': 'Fermez tout le groupe d’onglets dans le navigateur : il n’occupe plus ni la barre d’onglets ni la mémoire.',
        'foldersSpotlight.step3.title': 'Rouvrir en un clic',
        'foldersSpotlight.step3.desc': 'Faites un clic droit sur le dossier et ouvrez tout dans un groupe d’onglets : le groupe prend automatiquement le nom du dossier.',
        'foldersSpotlight.sceneTitle': 'Idéal pour ces cas',
        'foldersSpotlight.sceneDesc':
            'Back-offices de projet, pages d’événement, documentation, recherches temporaires… Ces pages ne servent souvent que quelques jours : elles ne méritent pas un favori mais doivent être conservées un temps. Un dossier est parfait pour cela.',
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
        'nav.name': 'Youran Tab',
        'nav.home': 'Accueil',
        'nav.support': 'Soutenir',
        'nav.privacy': 'Confidentialité',
        'nav.guide': "Guide d'utilisation",
        'nav.changelog': 'Journal des modifications',
        'support.title': 'Soutenir Youran Tab',
        'support.subtitle': 'Si ce projet vous aide, vous pouvez le soutenir de l’une des façons ci-dessous. Votre soutien sert à poursuivre le développement, la maintenance et l’amélioration de l’expérience.',
        'support.note': 'Vous pouvez ajouter votre profil GitHub ou un autre lien social dans votre message de soutien. Je vous remercierai dans la liste des contributeurs du dépôt et sur le site officiel.',
        'support.buymeacoffee.title': 'Buy Me a Coffee',
        'support.buymeacoffee.desc': 'Soutenez le projet via Buy Me a Coffee et aidez-le à continuer de progresser.',
        'support.paypal.desc': 'Soutien rapide via PayPal, idéal pour les paiements internationaux ou interrégionaux.',
        'support.wechat.title': 'Soutien via WeChat',
        'support.wechat.desc': 'Ouvrez WeChat et scannez le code. Merci pour votre soutien et vos encouragements.',
        'support.alipay.title': 'Alipay',
        'support.alipay.desc': 'Scannez avec Alipay pour soutenir l’évolution continue du projet.',
        'support.openLink': 'Soutenir maintenant',
        'privacy.title': 'Politique de confidentialité',
        'privacy.updated': 'Dernière mise à jour : 18 novembre 2026',
        'privacy.intro.title': 'Aperçu',
        'privacy.intro.desc': "Youran Tab (ci-après dénommé \"cette extension\") est une extension de nouvel onglet open source pour navigateur. Nous accordons une grande importance à votre vie privée. Cette extension ne collecte, ne stocke ni ne transmet aucune donnée personnelle.",
        'privacy.collect.title': 'Collecte de données',
        'privacy.collect.desc': 'Cette extension ne collecte aucune information personnelle ni donnée d’utilisation. Toutes les données de configuration, y compris les listes de sites, les paramètres de thème et les paramètres de fond, sont stockées dans le stockage local du navigateur et ne sont jamais envoyées à un serveur externe. Lors de l’utilisation de l’ajout depuis l’onglet actuel, l’extension lit uniquement en local les titres, les URL et les noms de groupe des onglets et groupes d’onglets ouverts dans la fenêtre actuelle du navigateur afin d’afficher la liste de sélection. Lors de l’utilisation de l’option « Ajouter à Youran Tab » du menu contextuel, l’extension lit uniquement le titre et l’URL de la page sur laquelle vous avez fait un clic droit et les enregistre comme site.',
        'privacy.storage.title': 'Stockage local',
        'privacy.storage.desc': 'Cette extension utilise le stockage d’extension du navigateur (storage.local) pour enregistrer vos sites et vos paramètres personnalisés. Le script d’arrière-plan y lit la liste des sites pour vérifier si une page a déjà été ajoutée et pour construire le menu des dossiers, et l’utilise pour transmettre au nouvel onglet les pages ajoutées depuis le menu contextuel. Lors d’une mise à jour depuis une version antérieure à 0.5.0, les données enregistrées auparavant dans localStorage sont migrées automatiquement et une copie de sauvegarde est conservée localement. Ces données sont entièrement stockées sur votre appareil. Vous pouvez sauvegarder vos données à tout moment via la fonction d’exportation, ou supprimer toutes les données en désinstallant l’extension.',
        'privacy.network.title': 'Requêtes réseau',
        'privacy.network.desc': 'Cette extension sollicite les services publics d’icônes (Google, Favicon Extractor, icon.horse) et les fichiers d’icônes des sites eux-mêmes uniquement pour récupérer les icônes des sites ; les requêtes ne contiennent que le nom de domaine du site. Lorsque vous envoyez une recherche ou une question à une IA, la requête est transmise directement au service tiers sélectionné afin d’ouvrir la page de résultats. Ni l’extension ni son développeur ne collectent ou ne stockent la requête, et votre liste de sites, vos paramètres, vos arrière-plans et vos autres données de configuration locales ne sont pas transmis.',
        'privacy.thirdparty.title': 'Services tiers',
        'privacy.thirdparty.desc': "Cette extension n'intègre aucun service d'analyse, de publicité ou de suivi tiers.",
        'privacy.permissions.title': 'Autorisations',
        'privacy.permissions.desc': 'Cette extension ne demande que les autorisations nécessaires à son fonctionnement : <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code> et <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code> servent à lire les titres, les URL et les noms de groupe des onglets de la fenêtre actuelle et à ouvrir les dossiers dans un groupe d’onglets ; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code> sert à proposer « Ajouter à Youran Tab » dans le menu contextuel des pages web ; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code> et <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code> servent uniquement à afficher une notification d’ajout sur la page actuelle après votre clic sur ce menu, sans lire le contenu de la page ; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code> sert à enregistrer vos sites et paramètres et à transmettre les pages à ajouter au sein de l’extension ; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code> (Chrome et Edge uniquement) lève la limite de taille du stockage de l’extension afin que de nombreuses icônes personnalisées importées puissent être enregistrées ; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code> sert à appeler le moteur de recherche par défaut du navigateur ; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> sert à lire les icônes de sites intégrées au navigateur. Cette extension ne lit pas le contenu des pages, les données de formulaires, les informations d’identité personnelle, les informations de compte, les mots de passe ou les données de paiement, et n’accède pas à votre historique de navigation ni à vos favoris.',
        'privacy.changes.title': 'Modifications de la politique',
        'privacy.changes.desc': "En cas de modification de cette politique de confidentialité, nous la mettrons à jour sur cette page. Étant donné que cette extension ne collecte aucune donnée, aucune modification significative de cette politique n'est prévue.",
        'privacy.opensource.title': 'Transparence open source',
        'privacy.opensource.desc': 'Cette extension est entièrement open source, avec le code source hébergé sur <a href="https://github.com/dufu1991/youran-tab" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub</a>. Tout le monde est invité à examiner le code pour vérifier nos engagements en matière de confidentialité.',
        'privacy.contact.title': 'Contact',
        'privacy.contact.desc': 'Si vous avez des questions ou des préoccupations liées à la confidentialité, veuillez nous contacter via <a href="https://github.com/dufu1991/youran-tab/issues" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub Issues</a>.',
        'guide.title': "Guide d'utilisation",
        'guide.install.title': 'Installation',
        'guide.install.desc': 'Recherchez « Youran Tab » dans le Chrome Web Store, le store d’extensions Edge ou les modules complémentaires Firefox et installez-le. Après l’installation, ouvrez un nouvel onglet pour commencer à l’utiliser. Les navigateurs chinois comme 360, QQ et Sogou peuvent l’installer depuis le store d’extensions Edge. Au premier lancement, 4 sites sont préinstallés (Google, YouTube, ChatGPT et Baidu) et le fond aléatoire est activé par défaut.',
        'guide.addsite.title': 'Ajouter un site',
        'guide.addsite.desc': 'Il existe 3 méthodes :<br />1. <strong>Ajout manuel</strong> : activez le « Mode édition » dans les réglages puis cliquez sur « + Ajouter un site », ou faites un clic droit sur une zone vide et choisissez « Ajouter un site ». Saisissez le nom et l’URL ; l’icône est récupérée automatiquement.<br />2. <strong>Depuis un onglet ouvert</strong> : choisissez directement un onglet déjà ouvert dans la fenêtre d’ajout, voir plus bas.<br />3. <strong>Clic droit sur une page web</strong> : enregistrez une page au fil de votre navigation, voir plus bas.',
        'guide.theme.title': 'Aperçu des thèmes',
        'guide.theme.desc': "Dans le panneau de paramètres, vous pouvez choisir parmi 8 thèmes : Classique, Bento, Terminal, Minimal, Verre, Bulle, Pixel ou Post-it. Chaque thème a ses propres options de configuration. Changer de thème ne fait pas perdre les paramètres des autres thèmes, et les dossiers fonctionnent dans tous les thèmes visuels.",
        'guide.classic.title': 'Thème Classique',
        'guide.classic.desc': "Disposition en grille d'icônes standard avec un fond de carte en verre dépoli au survol. Options configurables : largeur du conteneur (400-1400px), colonnes (3-8), arrondi des angles, opacité de la carte, flou du verre dépoli et taille des icônes. Le nombre de colonnes se réduit automatiquement en fonction du nombre de sites pour éviter les colonnes vides.",
        'guide.bento.title': 'Thème Bento',
        'guide.bento.desc': "Deux modes de disposition disponibles :<br />1. <strong>Disposition dynamique</strong> (par défaut) : la taille des cartes est déterminée par le nombre de clics via un algorithme Treemap. Les sites les plus cliqués occupent une plus grande surface, et les nouveaux sites ont également une surface initiale. Les cartes de dossier additionnent les clics des sites internes, donc les dossiers les plus utilisés grandissent aussi automatiquement. Les compteurs de clics sont capturés au chargement de la page, donc cliquer ne provoque pas de réorganisation immédiate.<br />2. <strong>Grille fixe</strong> : toutes les cartes sont de taille égale et disposées selon le nombre de colonnes configuré.<br />Options configurables : largeur du conteneur, espacement (4-32px), arrondi des angles, opacité de la carte, flou du verre dépoli, taille des icônes, basculement du mode de disposition et nombre de colonnes en mode fixe.",
        'guide.folders.title': 'Dossiers',
        'guide.folders.desc': 'Les dossiers servent à ranger les sites similaires. Dans la fenêtre d’ajout, passez à « Dossier » pour en créer un : cochez des sites existants ou des onglets actuels à y ajouter, puis faites glisser pour les réordonner.<br />L’icône d’un dossier existe en 4 variantes : <strong>Grille</strong> (par défaut, affiche les icônes des premiers sites ; au-delà de 4, la 4e case indique le nombre restant), <strong>Empilé</strong> (superpose les icônes des 3 premiers sites), <strong>Image personnalisée</strong> et <strong>Coller un SVG</strong>. Vous pouvez aussi régler la couleur de fond de l’icône, l’afficher ou non, les angles arrondis et la proportion de l’icône.<br />Un clic sur un dossier ouvre un panneau flottant près de son emplacement ; cliquez sur un site pour l’ouvrir. Dans le panneau, faites glisser pour réordonner, ou hors du panneau pour sortir un site du dossier.<br /><strong>Ouvrir en groupe</strong> : faites un clic droit sur un dossier pour choisir « Ouvrir tous les onglets » ou « Tout ouvrir dans un groupe d’onglets ». Cette dernière option place les sites du dossier dans un groupe d’onglets portant le nom du dossier. Pour un ensemble de pages dont vous n’avez pas besoin tout de suite, enregistrez-le dans un dossier, puis fermez tout le groupe dans le navigateur pour libérer la barre d’onglets et la mémoire ; la prochaine fois, rouvrez-le en un clic et votre espace de travail revient tel quel.<br />À la suppression d’un dossier, vous pouvez ne supprimer que le dossier en remettant ses sites dans la liste principale, ou le supprimer avec les sites qu’il contient.',
        'guide.organize.title': 'Édition et organisation',
        'guide.organize.desc': 'Après avoir activé le « Mode édition » dans les réglages, cliquez sur un site ou un dossier pour le modifier ou le supprimer, faites glisser pour réordonner et déposez au centre d’un dossier pour l’y ranger. Cliquez sur « Terminé » pour quitter. Après la suppression d’un site ou d’un dossier, une notification « Annuler » apparaît pour restaurer aussitôt un élément supprimé par erreur. Lorsque plusieurs nouveaux onglets sont ouverts, les modifications faites dans l’un sont synchronisées automatiquement avec les autres.',
        'guide.tabs.title': 'Ajouter depuis les onglets ouverts',
        'guide.tabs.desc': 'Lors de l’ajout d’un site ou de la création d’un dossier, la fenêtre liste les onglets ouverts dans la fenêtre actuelle du navigateur, classés par groupe d’onglets. Vous pouvez sélectionner un seul onglet pour remplir automatiquement le titre et l’URL, ou en sélectionner plusieurs pour les ajouter en lot. Lors de la création d’un dossier, vous pouvez aussi cocher un groupe d’onglets entier, et le nom du dossier est complété automatiquement. S’il y a plus de <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">12</code> onglets, un champ de recherche apparaît et filtre par titre, URL ou nom de groupe.',
        'guide.webadd.title': 'Ajouter par clic droit sur une page web',
        'guide.webadd.desc': 'Faites un clic droit sur une zone vide de n’importe quelle page et choisissez « Ajouter à Youran Tab » pour enregistrer la page actuelle ; son titre devient le nom du site. Si des dossiers existent, le menu se déploie en « Liste principale » et en un élément par dossier, ce qui permet de l’ajouter directement dans le dossier voulu. Une brève notification s’affiche ensuite en haut à droite de la page ; une page déjà enregistrée affiche « Déjà dans Youran Tab » et n’est pas ajoutée en double. Le nouveau site apparaît à la prochaine ouverture ou lorsque vous revenez sur le nouvel onglet. Sur les pages restreintes comme les stores du navigateur, la notification ne peut pas s’afficher, mais le site est bien ajouté.',
        'guide.contextmenu.title': 'Menu contextuel',
        'guide.contextmenu.desc': 'Clic droit dans le nouvel onglet (sauf avec le thème Terminal) :<br />1. <strong>Clic droit sur un site</strong> : ouvrir dans un nouvel onglet, modifier, déplacer vers un dossier ou sortir d’un dossier, supprimer.<br />2. <strong>Clic droit sur un dossier</strong> : ouvrir tous les onglets, tout ouvrir dans un groupe d’onglets (nécessite la prise en charge des groupes d’onglets par le navigateur), modifier le dossier, supprimer.<br />3. <strong>Clic droit sur une zone vide</strong> : ajouter un site, changer le fond. Si le mode de fond est aléatoire, un nouveau fond aléatoire s’applique immédiatement ; sinon, un fond est choisi au hasard parmi les fonds unis, dégradés, images et dynamiques enregistrés, puis conservé.',
        'guide.icons.title': 'Icônes des sites',
        'guide.icons.desc': 'L’icône est réglée par défaut sur « Auto » : Youran Tab interroge en parallèle le site lui-même, l’icône intégrée du navigateur, Google, Favicon Extractor, icon.horse et d’autres sources, ignore les images de substitution, retient la plus nette et l’enregistre en local ; si aucune n’est disponible, une icône avec l’initiale est générée. Lors de la modification d’un site, vous pouvez aussi choisir Google, Extractor ou icon.horse comme source, importer une icône personnalisée et régler l’arrondi des angles. En mode sombre, vous pouvez définir un jeu d’icônes distinct, utile pour les icônes en traits peu lisibles sur fond sombre. Les icônes sont conservées longtemps en cache local et sont récupérées de nouveau automatiquement après la modification d’un site ou le changement de source.',
        'guide.terminalDetail.title': 'Thème Terminal',
        'guide.terminalDetail.desc': 'Interface en ligne de commande complète, entièrement utilisable au clavier. Commandes disponibles :<br /><br /><dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5"><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">h</code></dt><dd>Afficher l’aide</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">ls</code></dt><dd>Lister tous les sites ; ceux d’un dossier s’affichent sous la forme « dossier / site »</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">&lt;numéro&gt; / nom / url</code></dt><dd>Ouvrir un site par numéro, nom ou URL</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">add &lt;url&gt; &lt;nom&gt;</code></dt><dd>Ajouter un site</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">edit &lt;numéro&gt; &lt;url&gt; &lt;nom&gt;</code></dt><dd>Modifier un site</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">rm &lt;numéro&gt;</code></dt><dd>Supprimer un site</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s &lt;mot-clé&gt;</code></dt><dd>Rechercher ou poser une question avec l’option par défaut</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code></dt><dd>Changer de thème</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code></dt><dd>Changer le mode d’affichage</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code></dt><dd>Changer de langue</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code></dt><dd>Changer la palette de couleurs</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code></dt><dd>Changer le style du curseur</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code></dt><dd>Changer l’invite de commande</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">width &lt;pixels|full&gt;</code></dt><dd>Définir la largeur du terminal</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">set</code></dt><dd>Ouvrir le panneau de réglages</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code></dt><dd>Exporter les données</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code></dt><dd>Importer des données</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">clear</code></dt><dd>Effacer l’écran</dd></dl><br />9 palettes de couleurs (Vert, Ambre, Bleu, Cyan, Violet, Rose, Rouge, Orange, Mono) et 4 styles de curseur (Barre, Large, Bloc, Souligné). Lorsque <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code> et <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code> sont saisies sans argument, utilisez les flèches pour choisir, Entrée pour confirmer et Échap pour annuler.<br /><br /><strong>Astuce : </strong>en raison des limitations du navigateur, le focus reste par défaut sur la barre d’adresse à l’ouverture d’un nouvel onglet. Cliquez n’importe où sur la page pour commencer à saisir des commandes.',
        'guide.minimal.title': 'Thème Minimal',
        'guide.minimal.desc': "Style de liste en texte pur sans icônes ni cartes, affichant uniquement les liens avec les noms des sites. Ce thème n'a pas d'options de configuration spécifiques.",
        'guide.glass.title': 'Thème Verre',
        'guide.glass.desc': 'Cartes en forme de pilule en verre dépoli dans une liste horizontale. Options configurables : nombre de colonnes (1-4). La barre de recherche est intégrée dans l\'interface principale et les titres des sites sont toujours affichés. Idéal avec des arrière-plans d\'image ou de dégradé.',
        'guide.bubble.title': 'Thème Bulle',
        'guide.bubble.desc': 'Effet de bulles circulaires flottantes, sans titres de sites. Deux modes de disposition disponibles :<br />1. <strong>Disposition fixe</strong> (par défaut) : les bulles sont disposées dans l\'ordre avec un espacement régulier.<br />2. <strong>Dispersion aléatoire</strong> : les bulles sont dispersées aléatoirement sur le canevas avec détection de collision pour éviter les chevauchements.<br />Options configurables : basculement du mode de disposition, taille des bulles (48-120px). La barre de recherche se présente sous forme de bulle de recherche extensible.',
        'guide.pixel.title': 'Thème Pixel',
        'guide.pixel.desc': 'Style rétro pixel avec interaction sous forme de liste de menu. Les sites sont affichés en liste avec les titres toujours visibles. La barre de recherche utilise un style d\'invite de commande. Effet d\'animation de lignes de balayage au survol. Ce thème n\'a pas d\'options de configuration spécifiques.',
        'guide.sticky.title': 'Thème Post-it',
        'guide.sticky.desc': 'Style tableau d’affichage de post-it : des notes en papier de couleur avec punaises, inclinées de manière aléatoire et disposées en cascade. Sans fond défini, le mode clair affiche un panneau en liège et le mode sombre un panneau en bois foncé ; vous pouvez aussi définir un fond comme pour les autres thèmes. La barre de recherche est intégrée sous forme de note, avec un champ de saisie en pointillés dessinés à la main. Option configurable : afficher ou masquer les titres des sites.',
        'guide.search.title': 'Recherche',
        'guide.search.desc': 'La barre de recherche intègre 10 moteurs comme Google, Bing et Baidu et 10 services de questions IA comme ChatGPT, Claude et DeepSeek. Activez-les dans les réglages, marquez-en un par défaut avec l’étoile et choisissez si la recherche ou la question IA est l’option par défaut. Cliquez sur l’icône devant la barre pour basculer temporairement, uniquement pour la page en cours, sans modifier les réglages de recherche du navigateur. Une question IA ouvre le site correspondant ; il est conseillé de se connecter d’abord au compte du service. Pendant la saisie, les sites enregistrés correspondants s’affichent (y compris ceux des dossiers), recherchés par nom, domaine ou nom de dossier ; utilisez les flèches pour sélectionner, Entrée pour ouvrir et Ctrl / Cmd + Entrée pour ouvrir dans un nouvel onglet. Dans le thème Terminal, utilisez la commande <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s</code> suivie de mots-clés pour rechercher ou poser une question avec l’option par défaut.',
        'guide.background.title': "Paramètres d'arrière-plan",
        'guide.background.desc': 'Tous les thèmes sauf Terminal et Minimal prennent en charge les réglages de fond, avec 6 modes :<br />1. <strong>Aucun</strong> : utilise la couleur de fond par défaut du nouvel onglet du navigateur. Le thème Post-it affiche un panneau en liège lorsqu’il n’y a pas de fond.<br />2. <strong>Uni</strong> : 18 couleurs prédéfinies pour chacun des modes clair et sombre, ou une couleur personnalisée.<br />3. <strong>Dégradé</strong> : 18 dégradés prédéfinis pour chacun des modes clair et sombre ; cliquez sur « Dégradé aléatoire » pour en générer d’autres.<br />4. <strong>Image</strong> : importées depuis votre appareil, 18 au maximum, stockées uniquement en local.<br />5. <strong>Dynamique</strong> : 18 fonds dynamiques prédéfinis pour chacun des modes clair et sombre.<br />6. <strong>Aléatoire</strong> (par défaut pour les nouveaux utilisateurs) : alterne au hasard entre les types cochés (uni, dégradé, image, dynamique), avec un nouveau choix à chaque ouverture d’un nouvel onglet ou clic sur « Changer le fond ». La source aléatoire peut être « Générer » pour créer à chaque fois un tout nouveau fond, ou « Depuis les préréglages » pour ne choisir que parmi les préréglages existants et les images importées.<br />Vous pouvez supprimer les préréglages unis, dégradés et dynamiques qui ne vous plaisent pas ; l’ajout en régénère de nouveaux, et vous pouvez aussi cliquer sur « Regénérer 18 variantes ». Les fonds des modes clair et sombre sont configurés indépendamment.',
        'guide.darkmode.title': 'Mode sombre',
        'guide.darkmode.desc': "Prend en charge 3 modes : suivi automatique du système, clair manuel et sombre manuel. En mode sombre, vous pouvez configurer des icônes indépendantes pour les sites.",
        'guide.importexport.title': 'Importer / exporter',
        'guide.importexport.desc': 'Dans les réglages, vous pouvez exporter vos données en choisissant « Sites uniquement », « Paramètres uniquement » ou « Sites + Paramètres » ; le nom du fichier inclut automatiquement la version de l’extension. Les données des sites comprennent la structure des dossiers, les icônes et styles de dossier et les sites qu’ils contiennent. À l’importation, les sites sont fusionnés avec les données existantes et les doublons sont ignorés ; les paramètres remplacent tous les paramètres actuels et la page s’actualise automatiquement. Un fichier issu d’une version plus récente nécessite de mettre d’abord l’extension à jour. Dans le thème Terminal, les commandes <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code> et <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code> permettent de faire la même chose.',
        'guide.browser.title': 'Description des autorisations',
        'guide.browser.desc': 'Voici à quoi sert chaque autorisation du navigateur :<br />1. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code> : lire le titre, l’URL et le nom de groupe des onglets de la fenêtre actuelle lors de l’ajout d’un site ou de la création d’un dossier, et ouvrir un dossier dans un groupe d’onglets.<br />2. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code> : proposer « Ajouter à Youran Tab » dans le menu contextuel des pages web.<br />3. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code> : afficher une notification en haut à droite de la page actuelle après l’ajout d’une page.<br />4. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code> : enregistrer vos sites et paramètres, et transmettre les pages à ajouter entre l’arrière-plan et le nouvel onglet.<br />5. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code> (Chrome et Edge uniquement) : lever la limite de taille du stockage de l’extension afin de pouvoir enregistrer de nombreuses icônes personnalisées importées.<br />6. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code> : appeler le moteur de recherche par défaut du navigateur au besoin.<br />7. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> (Chrome et Edge uniquement) : lire l’icône de site intégrée au navigateur, comme l’une des sources d’icônes.<br />8. Accès aux services d’icônes (Google, gstatic, Favicon Extractor, icon.horse) : récupérer et mettre en cache les icônes des sites.',
        'guide.align.title': 'Alignement',
        'guide.align.desc': "Le contenu prend en charge 3 options d'alignement vertical : haut, centre et bas. Chaque thème enregistre son paramètre d'alignement indépendamment.",
        'guide.reset.title': 'Réinitialisation et vidage du cache',
        'guide.reset.desc': '« Réinitialiser les paramètres » rétablit tous les paramètres par défaut ; les données de sites déjà ajoutés et les compteurs de clics sont conservés, seules les configurations d’apparence et de fonctionnalités sont restaurées. « Vider le cache des icônes » supprime toutes les icônes de sites mises en cache, qui seront téléchargées de nouveau à la prochaine ouverture.',
        'changelog.title': 'Journal des modifications',
        'changelog.storeDelayHint': 'La version distribuée sur les stores peut être retardée en raison de la validation du store du navigateur.',
        'changelog.v1.feat1': '8 thèmes : Classique, Bento, Terminal, Minimal, Verre, Bulle, Pixel, Post-it',
        'changelog.v1.feat2': 'Barre de recherche intégrée',
        'changelog.v1.feat3': 'Plusieurs modes de fond : uni, dégradé, image, dynamique, aléatoire',
        'changelog.v1.feat4': 'Mode sombre avec suivi système ou basculement manuel',
        'changelog.v1.feat5': 'Prise en charge de 10 langues',
        'changelog.v1.feat6': 'Importation et exportation de la configuration des sites',
        'changelog.v1.feat7': "3 sources d'icônes en ligne avec upload personnalisé",
    },
    'de': {
        'site.title': 'Youran Tab – Anpassbarer neuer Tab',
        'site.description':
            'Youran Tab ist eine Open-Source-Erweiterung für neue Tabs mit hoher Anpassbarkeit, mehreren Themes, Hintergründen und Layouts.',
        'lang.label': 'Sprache',
        'lang.auto': 'Browser folgen',
        'theme.label': 'Darstellung',
        'theme.auto': 'Automatisch',
        'theme.light': 'Hell',
        'theme.dark': 'Dunkel',
        'hero.badge': 'Kompatibel mit Chrome / Edge / Firefox',
        'hero.compat': 'Browser wie 360, QQ, Sogou und Liebao können direkt aus dem Edge Add-ons Store installieren — voll kompatibel.',
        'hero.title': 'Youran Tab',
        'hero.desc':
            'Eine Open-Source-Erweiterung für neue Tabs mit hoher Anpassbarkeit.<br />8 Themes, 10 Sprachen und mehrere Hintergründe für deine Startseite.',
        'themes.title': '8 Themes, frei wechselbar',
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
        'themes.glass.title': 'Glas',
        'themes.glass.desc': 'Milchglas-Pillen-Karten in horizontaler Liste. Einstellbare Spaltenanzahl für ein sauberes, modernes Aussehen.',
        'themes.bubble.title': 'Blase',
        'themes.bubble.desc': 'Schwebende runde Blasen. Unterstützt feste und zufällige Anordnung mit einstellbarer Größe.',
        'themes.pixel.title': 'Pixel',
        'themes.pixel.desc': 'Retro-Pixelstil mit Eingabeaufforderungs-Suchleiste und Menülisten-Interaktion.',
        'themes.sticky.title': 'Notiz',
        'themes.sticky.desc': 'Haftnotiz-Pinnwand mit Stecknadel-Deko, buntem Papier und Wasserfall-Layout.',
        'features.title': 'Starke Funktionen, leichtgewichtig',
        'features.subtitle': 'Komplett Open Source. Alle Daten bleiben lokal. Keine Konten, kein Tracking.',
        'features.search.title': 'Schnellsuche',
        'features.search.desc': '10 gängige Suchmaschinen und 10 KI-Frage-Dienste sind integriert: Aktivieren Sie, was Sie brauchen, legen Sie einen Standard fest und wechseln Sie vor dem Suchfeld vorübergehend, ohne die Sucheinstellungen des Browsers zu ändern. Beim Tippen werden auch Ihre gespeicherten Seiten gefunden.',
        'features.folders.title': 'Ordner zum Ablegen',
        'features.folders.desc': 'Legen Sie ähnliche Seiten in Ordnern ab, dargestellt als Raster oder Stapel von Symbolen. Speichern Sie ganze Tab-Gruppen und öffnen Sie einen Ordner mit einem Klick wieder als Gruppe.',
        'features.clip.title': 'Webseiten mit einem Klick hinzufügen',
        'features.clip.desc': 'Wählen Sie auf einer beliebigen Webseite per Rechtsklick "Zu Youran Tab hinzufügen" und legen Sie sie direkt in der Hauptliste oder in einem bestimmten Ordner ab.',
        'features.background.title': 'Mehrere Hintergründe',
        'features.background.desc': 'Einfarbige, Verlaufs-, Bild-, dynamische und zufällige Hintergründe, getrennt für den hellen und den dunklen Modus konfigurierbar. Im Zufallsmodus gibt es bei jedem Öffnen einen neuen Hintergrund.',
        'features.dark.title': 'Dunkelmodus',
        'features.dark.desc': 'Folgt dem System oder manuell hell / dunkel umschalten.',
        'features.languages.title': '10 Sprachen',
        'features.languages.desc':
            'Chinesisch, Englisch, Japanisch, Koreanisch, Französisch, Deutsch, Spanisch, Russisch, Italienisch. Automatische Spracherkennung.',
        'features.icons.title': 'Gestochen scharfe Symbole',
        'features.icons.desc': 'Youran Tab wählt automatisch das schärfste Symbol aus mehreren Quellen. Sie können eine Quelle auch manuell festlegen, eigene Symbole hochladen und für den dunklen Modus ein separates Symbol einstellen.',
        'features.organize.title': 'Ordnen per Drag-and-drop',
        'features.organize.desc': 'Im Bearbeitungsmodus sortieren Sie per Ziehen und legen Seiten durch Ablegen auf einem Ordner ab. Versehentlich gelöschte Seiten oder Ordner lassen sich sofort wiederherstellen.',
        'features.sync.title': 'Import & Export',
        'features.sync.desc': 'Seiten und Einstellungen lassen sich einzeln oder gemeinsam als JSON exportieren und auf einem neuen Gerät mit einem Klick wiederherstellen.',
        'foldersSpotlight.title': 'Zu viele Tabs? Ab in den Ordner und bei Bedarf mit einem Klick öffnen',
        'foldersSpotlight.desc':
            'Speichern Sie die Seiten, die Sie gerade nutzen, als Ordner und schließen Sie sie gesammelt, wenn Sie sie vorerst nicht brauchen. So werden Tab-Leiste und Arbeitsspeicher entlastet. Wenn Sie die Seiten wieder brauchen, klicken Sie mit der rechten Maustaste auf den Ordner und wählen "Alle in einer Tab-Gruppe öffnen": Die Seiten bilden wieder eine Tab-Gruppe mit dem Namen des Ordners, und Ihr Arbeitsstand ist genau wie zuvor.',
        'foldersSpotlight.step1.title': 'Gruppe speichern',
        'foldersSpotlight.step1.desc': 'Wählen Sie beim Erstellen eines Ordners direkt die aktuelle Tab-Gruppe aus, oder klicken Sie auf einer beliebigen Webseite mit der rechten Maustaste und fügen Sie sie einem Ordner hinzu.',
        'foldersSpotlight.step2.title': 'Unbesorgt schließen',
        'foldersSpotlight.step2.desc': 'Schließen Sie die ganze Tab-Gruppe im Browser: Sie belegt weder Platz in der Tab-Leiste noch Arbeitsspeicher.',
        'foldersSpotlight.step3.title': 'Mit einem Klick wiederherstellen',
        'foldersSpotlight.step3.desc': 'Klicken Sie mit der rechten Maustaste auf den Ordner und öffnen Sie alle Seiten in einer Tab-Gruppe: Die Gruppe trägt automatisch den Namen des Ordners.',
        'foldersSpotlight.sceneTitle': 'Ideal für diese Fälle',
        'foldersSpotlight.sceneDesc':
            'Projekt-Backends, Aktionsseiten, Dokumentationen, kurzfristige Recherchen … Solche Seiten braucht man oft nur ein paar Tage. Ein Lesezeichen lohnt sich nicht, aber aufbewahren möchte man sie trotzdem eine Weile. Ein Ordner passt dafür am besten.',
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
        'nav.name': 'Youran Tab',
        'nav.home': 'Startseite',
        'nav.support': 'Unterstützen',
        'nav.privacy': 'Datenschutz',
        'nav.guide': 'Benutzerhandbuch',
        'nav.changelog': 'Änderungsprotokoll',
        'support.title': 'Youran Tab unterstützen',
        'support.subtitle': 'Wenn dieses Projekt hilfreich für Sie ist, können Sie es auf eine der folgenden Arten unterstützen. Ihre Unterstützung fließt in die weitere Entwicklung, Pflege und Verbesserung des Nutzungserlebnisses.',
        'support.note': 'Sie können Ihrer Unterstützung gern Ihr GitHub Profil oder einen anderen Social Link beilegen. Ich erwähne Sie dann in der Danksagung im Repository und auf der offiziellen Website.',
        'support.buymeacoffee.title': 'Buy Me a Coffee',
        'support.buymeacoffee.desc': 'Unterstützen Sie das Projekt über Buy Me a Coffee und helfen Sie dabei, es weiter zu verbessern.',
        'support.paypal.desc': 'Schnelle Unterstützung per PayPal, ideal für internationale und regionale Zahlungen.',
        'support.wechat.title': 'WeChat Unterstützung',
        'support.wechat.desc': 'Öffnen Sie WeChat und scannen Sie den Code. Vielen Dank für Ihre Unterstützung und Ermutigung.',
        'support.alipay.title': 'Alipay',
        'support.alipay.desc': 'Scannen Sie mit Alipay und unterstützen Sie die weitere Entwicklung des Projekts.',
        'support.openLink': 'Jetzt unterstützen',
        'privacy.title': 'Datenschutzrichtlinie',
        'privacy.updated': 'Zuletzt aktualisiert: 18. November 2026',
        'privacy.intro.title': 'Übersicht',
        'privacy.intro.desc': 'Youran Tab (im Folgenden als „diese Erweiterung" bezeichnet) ist eine Open-Source-Browsererweiterung für neue Tabs. Wir legen großen Wert auf Ihre Privatsphäre. Diese Erweiterung sammelt, speichert oder überträgt keine persönlichen Benutzerdaten.',
        'privacy.collect.title': 'Datenerfassung',
        'privacy.collect.desc': 'Diese Erweiterung sammelt keine persönlichen Informationen oder Nutzungsdaten. Alle Konfigurationsdaten, einschließlich Seitenlisten, Theme-Einstellungen und Hintergrundeinstellungen, werden im lokalen Speicher des Browsers gespeichert und niemals an externe Server gesendet. Bei der Verwendung von "Aus dem aktuellen Tab hinzufügen" liest die Erweiterung ausschließlich lokal die Titel, URLs und Gruppennamen der im aktuellen Browserfenster geöffneten Tabs und Tab-Gruppen, um die Auswahlliste anzuzeigen. Bei der Verwendung von "Zu Youran Tab hinzufügen" im Kontextmenü der Webseite liest die Erweiterung nur Titel und URL der Webseite, auf die Sie mit der rechten Maustaste geklickt haben, und speichert sie als Seite.',
        'privacy.storage.title': 'Lokaler Speicher',
        'privacy.storage.desc': 'Diese Erweiterung verwendet den Erweiterungsspeicher des Browsers (storage.local), um Ihre Seiten und persönlichen Einstellungen zu speichern. Das Hintergrundskript liest daraus die Seitenliste, um zu prüfen, ob eine Webseite bereits hinzugefügt wurde, und um das Ordnermenü zu erstellen; außerdem übergibt es darüber Webseiten, die über das Kontextmenü hinzugefügt wurden, an den neuen Tab. Beim Update von einer Version vor 0.5.0 werden die bisher in localStorage gespeicherten Daten automatisch übernommen, und eine Sicherungskopie bleibt lokal erhalten. Diese Daten werden vollständig auf Ihrem Gerät gespeichert. Sie können Ihre Daten jederzeit über die Exportfunktion sichern oder durch Deinstallieren der Erweiterung alle Daten löschen.',
        'privacy.network.title': 'Netzwerkanfragen',
        'privacy.network.desc': 'Diese Erweiterung ruft ausschließlich zum Abrufen von Website-Symbolen öffentliche Symboldienste (Google, Favicon Extractor, icon.horse) und die Symboldateien der Websites selbst ab; die Anfragen enthalten nur die Domain der Website. Wenn Sie eine Suche oder KI-Frage absenden, wird die Anfrage direkt an den ausgewählten Drittanbieterdienst gesendet und die Ergebnisseite geöffnet. Die Erweiterung und ihr Entwickler erfassen oder speichern die Anfrage nicht und übertragen weder Ihre Seitenliste noch Einstellungen, Hintergründe oder andere lokale Konfigurationsdaten.',
        'privacy.thirdparty.title': 'Drittanbieterdienste',
        'privacy.thirdparty.desc': 'Diese Erweiterung integriert keine Analyse-, Werbe- oder Tracking-Dienste von Drittanbietern.',
        'privacy.permissions.title': 'Berechtigungen',
        'privacy.permissions.desc': 'Diese Erweiterung fordert nur die für den Betrieb notwendigen Berechtigungen an: <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code> und <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code> dienen dazu, Titel, URLs und Gruppennamen der Tabs im aktuellen Fenster zu lesen und Ordner in einer Tab-Gruppe zu öffnen; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code> dient dazu, "Zu Youran Tab hinzufügen" im Kontextmenü von Webseiten anzubieten; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code> und <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code> dienen nur dazu, nach Ihrem Klick auf dieses Menü auf der aktuellen Webseite einen Hinweis zum Hinzufügen anzuzeigen, ohne Seiteninhalte zu lesen; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code> dient dazu, Ihre Seiten und Einstellungen zu speichern und hinzuzufügende Webseiten innerhalb der Erweiterung zu übergeben; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code> (nur Chrome und Edge) hebt die Größenbegrenzung des Erweiterungsspeichers auf, damit auch viele hochgeladene eigene Symbole gespeichert werden können; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code> dient dazu, die Standardsuchmaschine des Browsers aufzurufen; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> dient dazu, im Browser integrierte Website-Symbole zu lesen. Diese Erweiterung liest weder Seiteninhalte noch Formulardaten, persönliche Identitätsinformationen, Kontoinformationen, Passwörter oder Zahlungsdaten und greift weder auf Ihren Browserverlauf noch auf Ihre Lesezeichen zu.',
        'privacy.changes.title': 'Richtlinienänderungen',
        'privacy.changes.desc': 'Wenn es Änderungen an dieser Datenschutzrichtlinie gibt, werden wir sie auf dieser Seite aktualisieren. Da diese Erweiterung keine Daten erfasst, werden keine wesentlichen Änderungen an dieser Richtlinie erwartet.',
        'privacy.opensource.title': 'Open-Source-Transparenz',
        'privacy.opensource.desc': 'Diese Erweiterung ist vollständig Open Source, der Quellcode wird auf <a href="https://github.com/dufu1991/youran-tab" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub</a> gehostet. Jeder ist eingeladen, den Code zu überprüfen, um unsere Datenschutzverpflichtungen zu verifizieren.',
        'privacy.contact.title': 'Kontakt',
        'privacy.contact.desc': 'Wenn Sie Fragen oder Bedenken zum Datenschutz haben, kontaktieren Sie uns bitte über <a href="https://github.com/dufu1991/youran-tab/issues" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub Issues</a>.',
        'guide.title': 'Benutzerhandbuch',
        'guide.install.title': 'Installation',
        'guide.install.desc': 'Suchen Sie im Chrome Web Store, im Edge-Add-ons-Store oder in den Firefox-Add-ons nach "Youran Tab" und installieren Sie es. Nach der Installation öffnen Sie einen neuen Tab, um es zu verwenden. Chinesische Browser wie 360, QQ und Sogou können es über den Edge-Add-ons-Store installieren. Bei der ersten Nutzung sind 4 Seiten vorbelegt (Google, YouTube, ChatGPT und Baidu), und der Zufallshintergrund ist standardmäßig aktiv.',
        'guide.addsite.title': 'Seite hinzufügen',
        'guide.addsite.desc': 'Es gibt 3 Möglichkeiten:<br />1. <strong>Manuell hinzufügen</strong>: Aktivieren Sie in den Einstellungen den "Bearbeitungsmodus" und klicken Sie auf "+ Seite hinzufügen", oder klicken Sie mit der rechten Maustaste auf eine leere Stelle und wählen Sie "Seite hinzufügen". Geben Sie Name und URL ein; das Symbol wird automatisch geladen.<br />2. <strong>Aus dem aktuellen Tab hinzufügen</strong>: Wählen Sie im Hinzufügen-Dialog direkt einen geöffneten Tab aus, siehe unten.<br />3. <strong>Per Rechtsklick auf einer Webseite</strong>: Speichern Sie Seiten beim Surfen nebenbei, siehe unten.',
        'guide.theme.title': 'Theme-Übersicht',
        'guide.theme.desc': 'Im Einstellungsbereich können Sie aus 8 Themes wählen: Klassisch, Bento, Terminal, Minimal, Glas, Blase, Pixel oder Notiz. Jedes Theme hat eigene Konfigurationsoptionen. Ein Theme Wechsel führt nicht zum Verlust der Einstellungen anderer Themes, und Ordner funktionieren in allen visuellen Themes.',
        'guide.classic.title': 'Klassisches Theme',
        'guide.classic.desc': 'Standard-Symbolraster-Layout mit Milchglas-Kartenhintergrund beim Hover. Konfigurierbare Optionen: Containerbreite (400-1400px), Spaltenanzahl (3-8), Eckenradius, Kartendeckkraft, Milchglas-Unschärfe und Symbolgröße. Die Spaltenanzahl wird automatisch an die Anzahl der Websites angepasst, um leere Spalten zu vermeiden.',
        'guide.bento.title': 'Bento-Theme',
        'guide.bento.desc': 'Zwei Layout-Modi verfügbar:<br />1. <strong>Dynamisches Layout</strong> (Standard): Die Kartengröße wird durch die Klickanzahl mit einem Treemap-Algorithmus bestimmt. Häufiger angeklickte Sites nehmen mehr Fläche ein, neue Sites haben ebenfalls eine Anfangsfläche. Ordnerkarten summieren die Klicks der enthaltenen Sites, sodass häufig genutzte Ordner ebenfalls automatisch größer werden. Klickzahlen werden beim Seitenladen erfasst, sodass ein Klick keine sofortige Neuanordnung verursacht.<br />2. <strong>Festes Raster</strong>: Alle Karten sind gleich groß und werden in der konfigurierten Spaltenanzahl angeordnet.<br />Konfigurierbare Optionen: Containerbreite, Abstand (4-32px), Eckenradius, Kartendeckkraft, Milchglas-Unschärfe, Symbolgröße, Layout-Modus-Umschaltung und Spaltenanzahl im festen Modus.',
        'guide.folders.title': 'Ordner',
        'guide.folders.desc': 'Ordner dienen zum Ablegen ähnlicher Seiten. Wechseln Sie im Hinzufügen-Dialog zu "Ordner", um einen zu erstellen. Sie können vorhandene Seiten oder aktuelle Tabs auswählen, die hinzugefügt werden sollen, und die Reihenfolge per Ziehen anpassen.<br />Es gibt 4 Ordnersymbole: <strong>Raster</strong> (Standard, zeigt die Symbole der ersten Seiten; bei mehr als 4 zeigt das vierte Feld die Anzahl der übrigen), <strong>Stapel</strong> (zeigt die Symbole der ersten 3 Seiten übereinander), <strong>Eigenes Bild</strong> und <strong>SVG einfügen</strong>. Außerdem lassen sich die Hintergrundfarbe des Symbols, die Anzeige des Hintergrunds, die Rundung der Ecken und der Symbolanteil einstellen.<br />Ein Klick auf einen Ordner öffnet in der Nähe seiner Position ein schwebendes Fenster; mit einem Klick auf eine Seite darin öffnen Sie sie. Ziehen Sie im Fenster, um die Reihenfolge zu ändern, oder aus dem Fenster heraus, um eine Seite aus dem Ordner zu entfernen.<br /><strong>Als Gruppe öffnen</strong>: Klicken Sie mit der rechten Maustaste auf einen Ordner und wählen Sie "Alle Tabs öffnen" oder "Alle in einer Tab-Gruppe öffnen". Letzteres legt die Seiten des Ordners in eine Tab-Gruppe mit dem Namen des Ordners. Seiten, die Sie vorerst nicht brauchen, speichern Sie zuerst als Ordner und schließen dann die ganze Gruppe im Browser, um Tab-Leiste und Arbeitsspeicher zu entlasten. Wenn Sie sie wieder brauchen, öffnen Sie sie mit einem Klick als Gruppe, und Ihr Arbeitsstand ist wie zuvor.<br />Beim Löschen eines Ordners können Sie wählen, ob nur der Ordner gelöscht wird und seine Seiten in die Hauptliste zurückkehren, oder ob der Ordner samt seinen Seiten gelöscht wird.',
        'guide.organize.title': 'Bearbeiten und Ordnen',
        'guide.organize.desc': 'Nachdem Sie in den Einstellungen den "Bearbeitungsmodus" aktiviert haben, klicken Sie auf eine Seite oder einen Ordner, um sie zu bearbeiten oder zu löschen. Durch Ziehen ändern Sie die Reihenfolge, und durch Ablegen in der Mitte eines Ordners legen Sie eine Seite darin ab. Klicken Sie anschließend auf "Fertig", um den Modus zu verlassen. Nach dem Löschen einer Seite oder eines Ordners erscheint ein "Rückgängig"-Hinweis, mit dem Sie versehentlich Gelöschtes sofort wiederherstellen können. Wenn mehrere neue Tabs gleichzeitig geöffnet sind, werden Änderungen in einem Tab automatisch mit den anderen synchronisiert.',
        'guide.tabs.title': 'Aus aktuellen Tabs hinzufügen',
        'guide.tabs.desc': 'Beim Hinzufügen einer Seite oder Erstellen eines Ordners listet der Dialog die im aktuellen Browserfenster geöffneten Tabs auf, nach Tab-Gruppen geordnet. Sie können einen einzelnen Tab auswählen, um Titel und URL automatisch einzutragen, oder mehrere Tabs auswählen und gesammelt hinzufügen. Beim Erstellen eines Ordners können Sie auch eine ganze Tab-Gruppe auswählen; der Ordnername wird automatisch ergänzt. Bei mehr als <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">12</code> Tabs erscheint ein Suchfeld, das nach Titel, URL oder Gruppenname filtert.',
        'guide.webadd.title': 'Per Rechtsklick auf einer Webseite hinzufügen',
        'guide.webadd.desc': 'Klicken Sie auf einer leeren Stelle einer beliebigen Webseite mit der rechten Maustaste und wählen Sie "Zu Youran Tab hinzufügen", um die aktuelle Seite zu speichern; der Seitentitel wird als Name der Seite verwendet. Wenn bereits Ordner existieren, wird das Menü zu "Hauptliste" und den einzelnen Ordnern erweitert, sodass Sie die Seite direkt in einem bestimmten Ordner ablegen können. Danach erscheint kurz ein Hinweis oben rechts auf der Webseite; bereits gespeicherte Seiten zeigen "Bereits in Youran Tab" und werden nicht doppelt hinzugefügt. Die neue Seite erscheint beim nächsten Öffnen oder wenn Sie zum neuen Tab zurückwechseln. Auf eingeschränkten Seiten wie den Browser-Stores kann der Hinweis nicht angezeigt werden, die Seite wird aber dennoch hinzugefügt.',
        'guide.contextmenu.title': 'Kontextmenü',
        'guide.contextmenu.desc': 'Rechtsklick im neuen Tab (außer beim Terminal-Theme):<br />1. <strong>Rechtsklick auf eine Seite</strong>: in einem neuen Tab öffnen, bearbeiten, in einen Ordner verschieben oder aus dem Ordner entfernen, löschen.<br />2. <strong>Rechtsklick auf einen Ordner</strong>: alle Tabs öffnen, alle in einer Tab-Gruppe öffnen (erfordert Unterstützung für Tab-Gruppen im Browser), Ordner bearbeiten, löschen.<br />3. <strong>Rechtsklick auf eine leere Stelle</strong>: Seite hinzufügen, Hintergrund wechseln. Ist der Hintergrundmodus Zufällig, wird sofort ein neuer zufälliger Hintergrund gewählt; andernfalls wird zufällig einer der gespeicherten einfarbigen, Verlaufs-, Bild- und dynamischen Hintergründe ausgewählt und beibehalten.',
        'guide.icons.title': 'Symbole der Seiten',
        'guide.icons.desc': 'Das Symbol steht standardmäßig auf "Auto": Youran Tab fragt gleichzeitig die Seite selbst, das im Browser integrierte Symbol, Google, Favicon Extractor, icon.horse und weitere Quellen ab, überspringt Platzhalterbilder, wählt das schärfste aus und speichert es lokal; ist keines verfügbar, wird ein Symbol mit dem Anfangsbuchstaben erzeugt. Beim Bearbeiten einer Seite können Sie auch Google, Extractor oder icon.horse als Quelle festlegen, ein eigenes Symbol hochladen und die Eckenrundung anpassen. Im dunklen Modus lässt sich ein separater Satz von Symbolen festlegen, passend für Linien-Symbole, die auf dunklem Hintergrund schlecht zu erkennen sind. Symbole werden langfristig lokal zwischengespeichert und nach dem Bearbeiten einer Seite oder einem Quellenwechsel automatisch neu geladen.',
        'guide.terminalDetail.title': 'Terminal-Theme',
        'guide.terminalDetail.desc': 'Vollständige Befehlszeilenoberfläche mit kompletter Tastaturbedienung. Verfügbare Befehle:<br /><br /><dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5"><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">h</code></dt><dd>Hilfe anzeigen</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">ls</code></dt><dd>Alle Seiten auflisten; Seiten in Ordnern erscheinen als "Ordner / Seite"</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">&lt;Nummer&gt; / Name / URL</code></dt><dd>Seite nach Nummer, Name oder URL öffnen</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">add &lt;URL&gt; &lt;Name&gt;</code></dt><dd>Neue Seite hinzufügen</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">edit &lt;Nummer&gt; &lt;URL&gt; &lt;Name&gt;</code></dt><dd>Seite bearbeiten</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">rm &lt;Nummer&gt;</code></dt><dd>Seite löschen</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s &lt;Stichwort&gt;</code></dt><dd>Über die Standardoption suchen oder fragen</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code></dt><dd>Theme wechseln</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code></dt><dd>Anzeigemodus wechseln</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code></dt><dd>Sprache wechseln</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code></dt><dd>Farbschema festlegen</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code></dt><dd>Cursorstil festlegen</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code></dt><dd>Eingabeaufforderung festlegen</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">width &lt;Pixel|full&gt;</code></dt><dd>Terminalbreite festlegen</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">set</code></dt><dd>Einstellungsfenster öffnen</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code></dt><dd>Daten exportieren</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code></dt><dd>Daten importieren</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">clear</code></dt><dd>Bildschirm leeren</dd></dl><br />9 Farbschemata (Grün, Bernstein, Blau, Cyan, Lila, Rosa, Rot, Orange, Mono) und 4 Cursorstile (Strich, Breit, Block, Unterstrich). Wenn <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code> und <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code> ohne Argument eingegeben werden, wählen Sie mit den Pfeiltasten, bestätigen mit Enter und brechen mit Esc ab.<br /><br /><strong>Hinweis: </strong>Aufgrund von Browser-Einschränkungen liegt der Fokus beim Öffnen eines neuen Tabs standardmäßig in der Adressleiste. Klicken Sie an eine beliebige Stelle der Seite, um Befehle einzugeben.',
        'guide.minimal.title': 'Minimal-Theme',
        'guide.minimal.desc': 'Reiner Textlistenstil ohne Symbole oder Karten, es werden nur Site-Namen-Links angezeigt. Dieses Theme hat keine eigenen Konfigurationsoptionen.',
        'guide.glass.title': 'Glas-Theme',
        'guide.glass.desc': 'Mattglas-Pillenkarten in einem horizontalen Listenlayout. Konfigurierbare Optionen: Spaltenanzahl (1-4). Die Suchleiste ist in die Hauptoberfläche integriert und Seitentitel werden immer angezeigt. Funktioniert hervorragend mit Bild- oder Verlaufshintergründen.',
        'guide.bubble.title': 'Blasen-Theme',
        'guide.bubble.desc': 'Schwebender Kreisblasen-Effekt, ohne Seitentitel. Zwei Layout-Modi verfügbar:<br />1. <strong>Feste Anordnung</strong> (Standard): Blasen werden der Reihe nach mit gleichmäßigem Abstand angeordnet.<br />2. <strong>Zufällige Verteilung</strong>: Blasen werden zufällig auf der Leinwand verteilt, mit Kollisionserkennung um Überlappungen zu vermeiden.<br />Konfigurierbare Optionen: Layout-Modus umschalten, Blasengröße (48-120px). Die Suchleiste wird als erweiterbare Suchblase dargestellt.',
        'guide.pixel.title': 'Pixel-Theme',
        'guide.pixel.desc': 'Retro-Pixelstil mit Menülisteninteraktion. Seiten werden in Listenform angezeigt, Seitentitel sind immer sichtbar. Die Suchleiste verwendet einen Eingabeaufforderungsstil. Beim Überfahren gibt es einen Scanlinien-Animationseffekt. Dieses Theme hat keine eigenen Konfigurationsoptionen.',
        'guide.sticky.title': 'Notiz-Theme',
        'guide.sticky.desc': 'Haftnotizen-Pinnwand: Die Notizen bestehen aus farbigem Papier mit Reißzwecken, sind zufällig geneigt und im Kaskadenlayout angeordnet. Ohne eingestellten Hintergrund zeigt der helle Modus eine Korktafel und der dunkle Modus eine dunkle Holztafel; wie bei den anderen Themes lässt sich auch ein Hintergrund festlegen. Das Suchfeld ist als Notiz eingebettet, mit handgezeichnet gestricheltem Eingabefeld. Konfigurierbar: Seitentitel ein- oder ausblenden.',
        'guide.search.title': 'Suche',
        'guide.search.desc': 'Das Suchfeld integriert 10 Suchmaschinen wie Google, Bing und Baidu sowie 10 KI-Frage-Dienste wie ChatGPT, Claude und DeepSeek. Aktivieren Sie sie in den Einstellungen, legen Sie per Stern einen Standard fest und wählen Sie, ob standardmäßig gesucht oder die KI gefragt wird. Ein Klick auf das Symbol vor dem Suchfeld wechselt vorübergehend, nur für die aktuelle Seite, ohne die Sucheinstellungen des Browsers zu ändern. Eine KI-Frage öffnet die entsprechende Website; es empfiehlt sich, sich zuvor beim Dienst anzumelden. Beim Tippen werden passende gespeicherte Seiten (auch aus Ordnern) nach Name, Domain oder Ordnername aufgelistet; mit den Pfeiltasten auswählen, mit Enter öffnen und mit Strg / Cmd + Enter in einem neuen Tab öffnen. Im Terminal-Theme suchen Sie bzw. fragen mit dem Befehl <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s</code> plus Stichwort über die Standardoption.',
        'guide.background.title': 'Hintergrundeinstellungen',
        'guide.background.desc': 'Außer Terminal und Minimal unterstützen alle Themes Hintergrundeinstellungen, mit 6 Modi:<br />1. <strong>Keiner</strong>: verwendet die Standard-Hintergrundfarbe des neuen Browser-Tabs. Das Notiz-Theme zeigt ohne Hintergrund eine Korktafel.<br />2. <strong>Einfarbig</strong>: je 18 vorgegebene Farben für den hellen und den dunklen Modus oder eine eigene Farbe.<br />3. <strong>Verlauf</strong>: je 18 vorgegebene Verläufe für den hellen und den dunklen Modus; mit "Zufälliger Verlauf" erzeugen Sie weitere.<br />4. <strong>Bild</strong>: von Ihrem Gerät hochgeladen, höchstens 18, nur lokal gespeichert.<br />5. <strong>Dynamisch</strong>: je 18 vorgegebene dynamische Hintergründe für den hellen und den dunklen Modus.<br />6. <strong>Zufällig</strong> (Standard für neue Nutzer): wechselt zufällig zwischen den ausgewählten Typen (einfarbig, Verlauf, Bild, dynamisch), bei jedem Öffnen eines neuen Tabs oder Klick auf "Hintergrund wechseln" wird neu gewählt. Als Zufallsquelle können Sie "Neu erzeugen" wählen, wodurch jedes Mal ein ganz neuer Hintergrund erzeugt wird, oder "Aus Vorlagen", wodurch nur aus den vorhandenen Vorlagen und hochgeladenen Bildern gewählt wird.<br />Vorgaben für einfarbige, Verlaufs- und dynamische Hintergründe, die Ihnen nicht gefallen, können Sie löschen; beim Hinzufügen werden neue erzeugt, und mit "18 Varianten neu erzeugen" geht es auch in einem Schritt. Die Hintergrundkonfigurationen für den hellen und den dunklen Modus sind voneinander unabhängig.',
        'guide.darkmode.title': 'Dunkelmodus',
        'guide.darkmode.desc': 'Unterstützt 3 Modi: automatische Systemerkennung, manuell hell und manuell dunkel. Im Dunkelmodus können Sie separate Icons für Sites konfigurieren.',
        'guide.importexport.title': 'Import & Export',
        'guide.importexport.desc': 'In den Einstellungen können Sie Daten exportieren und dabei "Nur Seiten", "Nur Einstellungen" oder "Seiten + Einstellungen" wählen; der Dateiname enthält automatisch die Version der Erweiterung. Die Seitendaten umfassen die Ordnerstruktur, Ordnersymbole und -stile sowie die enthaltenen Seiten. Beim Import werden die Seiten mit den vorhandenen Daten zusammengeführt und Duplikate übersprungen; die Einstellungen überschreiben alle aktuellen Einstellungen, danach wird die Seite automatisch neu geladen. Dateien aus einer neueren Version erfordern zuerst ein Update der Erweiterung. Im Terminal-Theme führen die Befehle <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code> und <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code> dasselbe aus.',
        'guide.browser.title': 'Berechtigungen',
        'guide.browser.desc': 'Wofür die einzelnen Browser-Berechtigungen verwendet werden:<br />1. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code>: beim Hinzufügen einer Seite oder Erstellen eines Ordners Titel, URL und Gruppenname der Tabs im aktuellen Fenster lesen sowie Ordner in einer Tab-Gruppe öffnen.<br />2. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code>: "Zu Youran Tab hinzufügen" im Kontextmenü von Webseiten anbieten.<br />3. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code>: nach dem Hinzufügen einer Webseite oben rechts auf der aktuellen Seite einen Hinweis anzeigen.<br />4. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code>: Ihre Seiten und Einstellungen speichern sowie hinzuzufügende Webseiten zwischen Hintergrund und neuem Tab übergeben.<br />5. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code> (nur Chrome und Edge): die Größenbegrenzung des Erweiterungsspeichers aufheben, damit auch viele hochgeladene eigene Symbole gespeichert werden können.<br />6. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code>: bei Bedarf die Standardsuchmaschine des Browsers aufrufen.<br />7. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> (nur Chrome und Edge): das im Browser integrierte Website-Symbol als eine der Symbolquellen lesen.<br />8. Zugriff auf Symboldienste (Google, gstatic, Favicon Extractor, icon.horse): Website-Symbole abrufen und zwischenspeichern.',
        'guide.align.title': 'Ausrichtung',
        'guide.align.desc': 'Der Inhalt unterstützt 3 vertikale Ausrichtungsoptionen: oben, zentriert und unten. Jedes Theme speichert seine Ausrichtungseinstellung unabhängig.',
        'guide.reset.title': 'Einstellungen zurücksetzen und Cache leeren',
        'guide.reset.desc': '"Einstellungen zurücksetzen" stellt alle Einstellungen auf die Standardwerte zurück; hinzugefügte Seitendaten und Klickzähler bleiben erhalten, nur die Darstellungs- und Funktionskonfiguration wird zurückgesetzt. "Symbol-Cache leeren" löscht alle zwischengespeicherten Website-Symbole, die beim nächsten Öffnen neu heruntergeladen werden.',
        'changelog.title': 'Änderungsprotokoll',
        'changelog.storeDelayHint': 'Die Store-Version kann sich wegen der Prüfung im Browser-Store verzögern.',
        'changelog.v1.feat1': '8 Themes: Klassisch, Bento, Terminal, Minimal, Glas, Blase, Pixel, Notiz',
        'changelog.v1.feat2': 'Integrierte Suchleiste',
        'changelog.v1.feat3': 'Mehrere Hintergrundmodi: Einfarbig, Verlauf, Bild, dynamisch, Zufall',
        'changelog.v1.feat4': 'Dunkelmodus mit Systemerkennung oder manuellem Wechsel',
        'changelog.v1.feat5': 'Unterstützung für 10 Sprachen',
        'changelog.v1.feat6': 'Import und Export der Site-Konfiguration',
        'changelog.v1.feat7': '3 Online-Iconquellen mit benutzerdefiniertem Upload',
    },
    'it': {
        'site.title': 'Youran Tab - Nuova scheda personalizzabile',
        'site.description':
            "Youran Tab è un'estensione di nuova scheda open source e altamente personalizzabile, con più temi, sfondi e layout.",
        'lang.label': 'Lingua',
        'lang.auto': 'Segui il browser',
        'theme.label': 'Tema',
        'theme.auto': 'Automatico',
        'theme.light': 'Chiaro',
        'theme.dark': 'Scuro',
        'hero.badge': 'Compatibile con Chrome / Edge / Firefox',
        'hero.compat': 'I browser 360, QQ, Sogou e Liebao possono installare direttamente dallo store Edge — pienamente compatibili.',
        'hero.title': 'Youran Tab',
        'hero.desc':
            "Un'estensione di nuova scheda open source e altamente personalizzabile.<br />8 temi, 10 lingue e vari sfondi per creare la tua pagina iniziale.",
        'themes.title': '8 temi, cambia quando vuoi',
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
        'themes.glass.title': 'Vetro',
        'themes.glass.desc': 'Schede a pastiglia in vetro smerigliato in lista orizzontale. Numero di colonne regolabile per un aspetto pulito e moderno.',
        'themes.bubble.title': 'Bolla',
        'themes.bubble.desc': 'Bolle circolari fluttuanti. Supporta disposizione fissa e sparsa casuale con dimensioni regolabili.',
        'themes.pixel.title': 'Pixel',
        'themes.pixel.desc': 'Stile pixel retrò con barra di ricerca tipo prompt e interazione con menu a lista.',
        'themes.sticky.title': 'Nota',
        'themes.sticky.desc': 'Bacheca di post-it con decorazioni a spillo, fogli colorati e layout a cascata.',
        'features.title': 'Funzioni potenti, esecuzione leggera',
        'features.subtitle': 'Completamente open source. Tutti i dati restano in locale. Nessun account, nessun tracciamento.',
        'features.search.title': 'Ricerca rapida',
        'features.search.desc': '10 motori di ricerca diffusi e 10 servizi di domande IA integrati: attiva quelli che ti servono, imposta un predefinito e cambia temporaneamente dalla barra di ricerca, senza toccare le impostazioni di ricerca del browser. Digitando trovi anche i tuoi siti salvati.',
        'features.folders.title': 'Organizzazione in cartelle',
        'features.folders.desc': 'Raccogli i siti simili in cartelle mostrate come griglia o pila di icone, salva interi gruppi di schede e riapri un\'intera cartella come gruppo con un clic.',
        'features.clip.title': 'Aggiunta dal web con un clic',
        'features.clip.desc': 'Su qualsiasi pagina web, fai clic con il tasto destro e scegli "Aggiungi a Youran Tab" per inserirla direttamente nell\'elenco principale o in una cartella specifica.',
        'features.background.title': 'Sfondi multipli',
        'features.background.desc': 'Sfondi in tinta unita, sfumati, immagini, dinamici e casuali, configurabili separatamente per modalità chiara e scura. In modalità casuale ogni apertura mostra uno sfondo nuovo.',
        'features.dark.title': 'Modalità scura',
        'features.dark.desc': 'Segue il sistema o passa manualmente tra chiaro / scuro.',
        'features.languages.title': '10 lingue',
        'features.languages.desc':
            'Cinese, inglese, giapponese, coreano, francese, tedesco, spagnolo, russo, italiano. Rilevamento automatico della lingua di sistema.',
        'features.icons.title': 'Icone nitide',
        'features.icons.desc': 'Youran Tab sceglie automaticamente l\'icona più nitida tra più fonti. Puoi anche indicare una fonte manualmente, caricare un\'icona personalizzata e impostare un\'icona separata per la modalità scura.',
        'features.organize.title': 'Riordina trascinando',
        'features.organize.desc': 'In modalità modifica trascina per riordinare e rilascia su una cartella per classificare. Un sito o una cartella eliminati per errore possono essere ripristinati subito.',
        'features.sync.title': 'Importa ed esporta',
        'features.sync.desc': 'Siti e impostazioni si possono esportare in JSON separatamente o insieme e ripristinare con un clic su un altro dispositivo.',
        'foldersSpotlight.title': 'Troppe schede? Mettile in una cartella e riaprile con un clic',
        'foldersSpotlight.desc':
            'Salva in una cartella un insieme di pagine che stai usando e chiudile tutte insieme quando non ti servono, liberando la barra delle schede e la memoria del computer. Quando ti servono di nuovo, fai clic con il tasto destro sulla cartella e scegli "Apri tutto in un gruppo di schede": le pagine ricreano un gruppo di schede con il nome della cartella e il tuo spazio di lavoro torna com\'era.',
        'foldersSpotlight.step1.title': 'Salva il gruppo',
        'foldersSpotlight.step1.desc': 'Quando crei una cartella, seleziona direttamente il gruppo di schede attuale, oppure fai clic con il tasto destro su una qualsiasi pagina per aggiungerla a una cartella.',
        'foldersSpotlight.step2.title': 'Chiudi senza pensieri',
        'foldersSpotlight.step2.desc': 'Chiudi l\'intero gruppo di schede nel browser: non occupa più né la barra delle schede né la memoria.',
        'foldersSpotlight.step3.title': 'Ripristina con un clic',
        'foldersSpotlight.step3.desc': 'Fai clic con il tasto destro sulla cartella e apri tutto in un gruppo di schede: il gruppo prende automaticamente il nome della cartella.',
        'foldersSpotlight.sceneTitle': 'Ideale in questi casi',
        'foldersSpotlight.sceneDesc':
            'Backend di progetto, pagine di eventi, documentazione, ricerche temporanee... Queste pagine spesso servono solo per qualche giorno: non meritano un segnalibro, ma vanno comunque conservate per un po\'. Una cartella è la soluzione più adatta.',
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
        'nav.name': 'Youran Tab',
        'nav.home': 'Home',
        'nav.support': 'Sostieni',
        'nav.privacy': 'Privacy',
        'nav.guide': 'Guida',
        'nav.changelog': 'Registro modifiche',
        'support.title': 'Sostieni Youran Tab',
        'support.subtitle': 'Se questo progetto ti è utile, puoi sostenerlo in uno dei modi qui sotto. Il tuo supporto aiuta a portare avanti sviluppo, manutenzione e miglioramento dell’esperienza.',
        'support.note': 'Puoi includere il tuo profilo GitHub o un altro link social nel messaggio di supporto. Ti ringrazierò nella lista dei sostenitori nel repository e sul sito ufficiale.',
        'support.buymeacoffee.title': 'Buy Me a Coffee',
        'support.buymeacoffee.desc': 'Sostieni il progetto tramite Buy Me a Coffee e aiutami a continuare a migliorarlo.',
        'support.paypal.desc': 'Supporto rapido con PayPal, ideale per pagamenti internazionali o tra aree diverse.',
        'support.wechat.title': 'Supporto WeChat',
        'support.wechat.desc': 'Apri WeChat e scansiona il codice. Grazie per il tuo supporto e il tuo incoraggiamento.',
        'support.alipay.title': 'Alipay',
        'support.alipay.desc': 'Usa Alipay per scansionare il codice e sostenere l’evoluzione continua del progetto.',
        'support.openLink': 'Sostieni ora',
        'privacy.title': 'Informativa sulla privacy',
        'privacy.updated': 'Ultimo aggiornamento: 18 novembre 2026',
        'privacy.intro.title': 'Panoramica',
        'privacy.intro.desc': "Youran Tab (di seguito denominata \"questa estensione\") è un'estensione open source per nuove schede del browser. Attribuiamo grande importanza alla vostra privacy. Questa estensione non raccoglie, memorizza o trasmette alcun dato personale degli utenti.",
        'privacy.collect.title': 'Raccolta dati',
        'privacy.collect.desc': 'Questa estensione non raccoglie alcuna informazione personale né dato di utilizzo. Tutti i dati di configurazione, inclusi elenchi di siti, impostazioni del tema e dello sfondo, sono salvati nell\'archiviazione locale del browser e non vengono mai inviati a server esterni. Quando si usa "Aggiungi dalla scheda attuale", l\'estensione legge solo in locale i titoli, gli URL e i nomi dei gruppi delle schede e dei gruppi di schede aperti nella finestra attuale del browser, per mostrare l\'elenco di selezione. Quando si usa "Aggiungi a Youran Tab" nel menu contestuale della pagina web, l\'estensione legge solo il titolo e l\'URL della pagina su cui hai fatto clic con il tasto destro e li salva come sito.',
        'privacy.storage.title': 'Archiviazione locale',
        'privacy.storage.desc': 'Questa estensione usa l\'archiviazione per estensioni del browser (storage.local) per salvare i tuoi siti e le impostazioni personalizzate. Lo script in background legge da l\u00EC l\'elenco dei siti per verificare se una pagina \u00E8 gi\u00E0 stata aggiunta e per creare il menu delle cartelle, e lo usa per passare alla nuova scheda le pagine aggiunte dal menu contestuale. Aggiornando da una versione precedente alla 0.5.0, i dati salvati in precedenza in localStorage vengono migrati automaticamente e ne resta una copia di backup in locale. Questi dati sono archiviati interamente sul tuo dispositivo. Puoi eseguire il backup dei dati in qualsiasi momento con la funzione di esportazione, oppure eliminare tutti i dati disinstallando l\'estensione.',
        'privacy.network.title': 'Richieste di rete',
        'privacy.network.desc': 'Questa estensione contatta i servizi pubblici di icone (Google, Favicon Extractor, icon.horse) e i file di icone dei siti stessi solo per recuperare le icone dei siti; le richieste contengono solo il dominio del sito. Quando invii una ricerca o una domanda a un\'IA, la richiesta viene inviata direttamente al servizio di terze parti selezionato per aprire la pagina dei risultati. L\'estensione e il suo sviluppatore non raccolgono né memorizzano la richiesta e non trasmettono il tuo elenco di siti, le impostazioni, gli sfondi o altri dati di configurazione locali.',
        'privacy.thirdparty.title': 'Servizi di terze parti',
        'privacy.thirdparty.desc': 'Questa estensione non integra alcun servizio di analisi, pubblicità o tracciamento di terze parti.',
        'privacy.permissions.title': 'Autorizzazioni',
        'privacy.permissions.desc': 'Questa estensione richiede solo i permessi necessari al suo funzionamento: <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code> e <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code> servono a leggere titoli, URL e nomi dei gruppi delle schede della finestra attuale e ad aprire le cartelle in un gruppo di schede; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code> serve a offrire "Aggiungi a Youran Tab" nel menu contestuale delle pagine web; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code> e <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code> servono solo a mostrare un avviso di aggiunta sulla pagina attuale dopo che hai fatto clic su quel menu, senza leggere il contenuto della pagina; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code> serve a salvare i tuoi siti e le impostazioni e a passare le pagine da aggiungere all\'interno dell\'estensione; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code> (solo Chrome ed Edge) rimuove il limite di dimensione dell\'archiviazione dell\'estensione, cos\u00EC da poter salvare anche molte icone personalizzate caricate; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code> serve a richiamare il motore di ricerca predefinito del browser; <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> serve a leggere le icone dei siti integrate nel browser. Questa estensione non legge il testo delle pagine, i contenuti dei moduli, le informazioni di identità personale, le informazioni sull\'account, le password o i dati di pagamento e non accede alla cronologia di navigazione né ai segnalibri.',
        'privacy.changes.title': 'Modifiche alla politica',
        'privacy.changes.desc': 'In caso di modifiche a questa informativa sulla privacy, le aggiorneremo su questa pagina. Poiché questa estensione non raccoglie alcun dato, non si prevedono modifiche significative a questa politica.',
        'privacy.opensource.title': 'Trasparenza open source',
        'privacy.opensource.desc': 'Questa estensione è completamente open source, con il codice sorgente ospitato su <a href="https://github.com/dufu1991/youran-tab" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub</a>. Chiunque può esaminare il codice per verificare i nostri impegni sulla privacy.',
        'privacy.contact.title': 'Contatti',
        'privacy.contact.desc': 'Per qualsiasi domanda o dubbio relativo alla privacy, contattateci tramite <a href="https://github.com/dufu1991/youran-tab/issues" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">GitHub Issues</a>.',
        'guide.title': 'Guida',
        'guide.install.title': 'Installazione',
        'guide.install.desc': 'Cerca "Youran Tab" nel Chrome Web Store, nello store delle estensioni di Edge o nei componenti aggiuntivi di Firefox e installalo. Dopo l\'installazione, apri una nuova scheda per iniziare a usarlo. I browser cinesi come 360, QQ e Sogou possono installarlo dallo store delle estensioni di Edge. Al primo utilizzo sono preimpostati 4 siti (Google, YouTube, ChatGPT e Baidu) e lo sfondo casuale è attivo per impostazione predefinita.',
        'guide.addsite.title': 'Aggiungere un sito',
        'guide.addsite.desc': 'Ci sono 3 modi:<br />1. <strong>Aggiunta manuale</strong>: attiva la "Modalità modifica" nelle impostazioni e fai clic su "+ Aggiungi sito", oppure fai clic con il tasto destro su uno spazio vuoto e scegli "Aggiungi sito". Inserisci nome e URL; l\'icona viene recuperata automaticamente.<br />2. <strong>Dalla scheda attuale</strong>: seleziona direttamente una scheda già aperta nella finestra di aggiunta, vedi sotto.<br />3. <strong>Clic destro su una pagina web</strong>: salva le pagine mentre navighi, vedi sotto.',
        'guide.theme.title': 'Panoramica dei temi',
        'guide.theme.desc': 'Nel pannello delle impostazioni potete scegliere tra 8 temi: Classico, Bento, Terminale, Minimal, Vetro, Bolla, Pixel o Nota. Ogni tema ha opzioni di configurazione indipendenti. Cambiare tema non comporta la perdita delle impostazioni degli altri temi, e le cartelle funzionano in tutti i temi visivi.',
        'guide.classic.title': 'Tema Classico',
        'guide.classic.desc': 'Layout a griglia di icone standard con sfondo a vetro smerigliato al passaggio del mouse. Opzioni configurabili: larghezza del contenitore (400-1400px), colonne (3-8), raggio degli angoli, opacità della scheda, sfocatura del vetro smerigliato e dimensione delle icone. Il numero di colonne si riduce automaticamente in base al numero di siti per evitare colonne vuote.',
        'guide.bento.title': 'Tema Bento',
        'guide.bento.desc': 'Due modalità di layout disponibili:<br />1. <strong>Layout dinamico</strong> (predefinito): la dimensione delle schede è determinata dal numero di clic tramite un algoritmo Treemap. I siti con più clic occupano aree maggiori, e i nuovi siti hanno anche un\'area iniziale. Le schede cartella sommano i clic dei siti interni, quindi anche le cartelle usate più spesso si ingrandiscono automaticamente. I conteggi dei clic vengono catturati al caricamento della pagina, quindi un clic non causa una riorganizzazione immediata.<br />2. <strong>Griglia fissa</strong>: tutte le schede hanno le stesse dimensioni e sono disposte nel numero di colonne configurato.<br />Opzioni configurabili: larghezza del contenitore, spaziatura (4-32px), raggio degli angoli, opacità della scheda, sfocatura del vetro smerigliato, dimensione delle icone, commutazione della modalità di layout e numero di colonne in modalità fissa.',
        'guide.folders.title': 'Cartelle',
        'guide.folders.desc': 'Le cartelle servono a raccogliere siti simili. Nella finestra di aggiunta passa a "Cartella" per crearne una: puoi selezionare siti esistenti o schede attuali da aggiungere e trascinarli per riordinarli.<br />L\'icona della cartella ha 4 varianti: <strong>Griglia</strong> (predefinita, mostra le icone dei primi siti; oltre 4, la quarta casella mostra il numero rimanente), <strong>Impilata</strong> (sovrappone le icone dei primi 3 siti), <strong>Immagine personalizzata</strong> e <strong>Incolla SVG</strong>. Puoi anche impostare il colore di sfondo dell\'icona, se mostrare lo sfondo, gli angoli arrotondati e la proporzione dell\'icona.<br />Facendo clic su una cartella si apre un pannello flottante vicino alla sua posizione; fai clic su un sito al suo interno per aprirlo. Nel pannello trascina per riordinare, oppure trascina fuori dal pannello per togliere un sito dalla cartella.<br /><strong>Apri come gruppo</strong>: fai clic con il tasto destro su una cartella e scegli "Apri tutte le schede" oppure "Apri tutto in un gruppo di schede". Quest\'ultima inserisce i siti della cartella in un gruppo di schede con il nome della cartella. Per un insieme di pagine che non ti servono subito, salvalo prima come cartella e poi chiudi l\'intero gruppo nel browser per liberare la barra delle schede e la memoria; la volta successiva riaprilo come gruppo con un clic e il tuo spazio di lavoro torna com\'era.<br />Quando elimini una cartella puoi scegliere di eliminare solo la cartella, riportando i siti al suo interno nell\'elenco principale, oppure di eliminarla insieme ai siti che contiene.',
        'guide.organize.title': 'Modifica e organizzazione',
        'guide.organize.desc': 'Dopo aver attivato la "Modalità modifica" nelle impostazioni, fai clic su un sito o una cartella per modificarli o eliminarli, trascina per riordinare e rilascia al centro di una cartella per inserirvi l\'elemento. Al termine fai clic su "Fatto" per uscire. Dopo l\'eliminazione di un sito o di una cartella compare un avviso "Annulla" con cui ripristinare subito ciò che hai eliminato per errore. Quando sono aperte più nuove schede, le modifiche fatte in una si sincronizzano automaticamente con le altre.',
        'guide.tabs.title': 'Aggiungi dalle schede correnti',
        'guide.tabs.desc': 'Quando aggiungi un sito o crei una cartella, la finestra elenca le schede aperte nella finestra attuale del browser, raggruppate per gruppo di schede. Puoi selezionare una sola scheda per compilare automaticamente titolo e URL, oppure selezionarne più di una per aggiungerle in blocco. Quando crei una cartella puoi anche selezionare un intero gruppo di schede, e il nome della cartella viene completato automaticamente. Se le schede sono più di <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">12</code>, compare una casella di ricerca che filtra per titolo, URL o nome del gruppo.',
        'guide.webadd.title': 'Aggiungere con il clic destro su una pagina web',
        'guide.webadd.desc': 'Fai clic con il tasto destro su uno spazio vuoto di qualsiasi pagina web e scegli "Aggiungi a Youran Tab" per salvare la pagina attuale; il titolo della pagina diventa il nome del sito. Se hai già creato delle cartelle, il menu si espande in "Elenco principale" e nelle singole cartelle, così puoi inserire la pagina direttamente in una cartella specifica. Dopo l\'aggiunta, in alto a destra nella pagina compare brevemente un avviso; una pagina già salvata mostra "Già presente in Youran Tab" e non viene aggiunta due volte. Il nuovo sito compare alla prossima apertura o quando torni alla nuova scheda. Nelle pagine con restrizioni, come gli store dei browser, l\'avviso non può essere mostrato, ma il sito viene comunque aggiunto.',
        'guide.contextmenu.title': 'Menu contestuale',
        'guide.contextmenu.desc': 'Clic destro nella nuova scheda (tranne con il tema Terminale):<br />1. <strong>Clic destro su un sito</strong>: apri in una nuova scheda, modifica, sposta in una cartella o togli dalla cartella, elimina.<br />2. <strong>Clic destro su una cartella</strong>: apri tutte le schede, apri tutto in un gruppo di schede (richiede il supporto dei gruppi di schede nel browser), modifica la cartella, elimina.<br />3. <strong>Clic destro su uno spazio vuoto</strong>: aggiungi sito, cambia sfondo. Se la modalità sfondo è casuale, viene applicato subito un nuovo sfondo casuale; altrimenti ne viene scelto uno a caso tra gli sfondi salvati in tinta unita, sfumati, immagini e dinamici e viene mantenuto.',
        'guide.icons.title': 'Icone dei siti',
        'guide.icons.desc': 'L\'icona è impostata per impostazione predefinita su "Auto": Youran Tab interroga contemporaneamente il sito stesso, l\'icona integrata del browser, Google, Favicon Extractor, icon.horse e altre fonti, salta le immagini segnaposto, sceglie la più nitida e la salva in locale; se nessuna è disponibile, genera un\'icona con l\'iniziale. Quando modifichi un sito puoi anche indicare manualmente Google, Extractor o icon.horse come fonte, caricare un\'icona personalizzata e regolare l\'arrotondamento degli angoli. In modalità scura puoi impostare un set di icone separato, adatto alle icone a tratto poco leggibili su sfondo scuro. Le icone vengono conservate a lungo nella cache locale e vengono recuperate di nuovo automaticamente dopo la modifica di un sito o il cambio di fonte.',
        'guide.terminalDetail.title': 'Tema Terminale',
        'guide.terminalDetail.desc': 'Interfaccia a riga di comando completa, utilizzabile interamente da tastiera. Comandi disponibili:<br /><br /><dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5"><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">h</code></dt><dd>Mostra la guida</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">ls</code></dt><dd>Elenca tutti i siti; quelli nelle cartelle compaiono come "cartella / sito"</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">&lt;numero&gt; / nome / url</code></dt><dd>Apri un sito per numero, nome o URL</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">add &lt;url&gt; &lt;nome&gt;</code></dt><dd>Aggiungi un nuovo sito</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">edit &lt;numero&gt; &lt;url&gt; &lt;nome&gt;</code></dt><dd>Modifica un sito</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">rm &lt;numero&gt;</code></dt><dd>Elimina un sito</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s &lt;parola chiave&gt;</code></dt><dd>Cerca o fai una domanda con l\'opzione predefinita</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code></dt><dd>Cambia tema</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code></dt><dd>Cambia modalità di visualizzazione</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code></dt><dd>Cambia lingua</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code></dt><dd>Imposta la combinazione di colori</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code></dt><dd>Imposta lo stile del cursore</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code></dt><dd>Imposta il prompt dei comandi</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">width &lt;pixel|full&gt;</code></dt><dd>Imposta la larghezza del terminale</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">set</code></dt><dd>Apri il pannello delle impostazioni</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code></dt><dd>Esporta i dati</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code></dt><dd>Importa i dati</dd><dt><code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">clear</code></dt><dd>Pulisci lo schermo</dd></dl><br />9 combinazioni di colori (Verde, Ambra, Blu, Ciano, Viola, Rosa, Rosso, Arancione, Mono) e 4 stili di cursore (Barra, Larga, Blocco, Sottolineato). Quando <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">theme</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">mode</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">lang</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">color</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">cursor</code> e <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">prompt</code> vengono digitati senza argomenti, usa le frecce per scegliere, Invio per confermare ed Esc per annullare.<br /><br /><strong>Suggerimento: </strong>a causa dei limiti del browser, all\'apertura di una nuova scheda il focus è per impostazione predefinita sulla barra degli indirizzi. Fai clic in un punto qualsiasi della pagina per iniziare a digitare i comandi.',
        'guide.minimal.title': 'Tema Minimal',
        'guide.minimal.desc': 'Stile a lista di solo testo senza icone o schede, mostrando solo i link con i nomi dei siti. Questo tema non ha opzioni di configurazione dedicate.',
        'guide.glass.title': 'Tema Vetro',
        'guide.glass.desc': 'Schede a pillola in vetro smerigliato in un layout a lista orizzontale. Opzioni configurabili: numero di colonne (1-4). La barra di ricerca è integrata nell\'interfaccia principale e i titoli dei siti sono sempre visibili. Funziona benissimo con sfondi immagine o sfumatura.',
        'guide.bubble.title': 'Tema Bolla',
        'guide.bubble.desc': 'Effetto bolle circolari fluttuanti, senza titoli dei siti. Due modalità di layout disponibili:<br />1. <strong>Layout fisso</strong> (predefinito): le bolle sono disposte in ordine con spaziatura uniforme.<br />2. <strong>Dispersione casuale</strong>: le bolle sono sparse casualmente sulla tela con rilevamento delle collisioni per evitare sovrapposizioni.<br />Opzioni configurabili: cambio modalità layout, dimensione bolle (48-120px). La barra di ricerca si presenta come una bolla di ricerca espandibile.',
        'guide.pixel.title': 'Tema Pixel',
        'guide.pixel.desc': 'Stile pixel retrò con interazione a lista di menu. I siti sono visualizzati in formato lista con i titoli sempre visibili. La barra di ricerca usa uno stile prompt di comando. Effetto di animazione con linee di scansione al passaggio del mouse. Questo tema non ha opzioni di configurazione dedicate.',
        'guide.sticky.title': 'Tema Nota',
        'guide.sticky.desc': 'Stile bacheca di note adesive: le note sono di carta colorata con puntine, inclinate in modo casuale e disposte a cascata. Senza uno sfondo impostato, la modalità chiara mostra una bacheca di sughero e quella scura una bacheca di legno scuro; come per gli altri temi puoi anche impostare uno sfondo. La barra di ricerca è integrata come nota, con un campo di inserimento a tratteggio disegnato a mano. Opzione configurabile: mostrare o nascondere i titoli dei siti.',
        'guide.search.title': 'Ricerca',
        'guide.search.desc': 'La barra di ricerca integra 10 motori come Google, Bing e Baidu e 10 servizi di domande IA come ChatGPT, Claude e DeepSeek. Attivali nelle impostazioni, imposta un predefinito con la stella e scegli se per impostazione predefinita usare la ricerca o le domande IA. Fai clic sull\'icona davanti alla barra per cambiare temporaneamente, solo per la pagina attuale, senza modificare le impostazioni di ricerca del browser. Una domanda IA apre il sito corrispondente; è consigliabile accedere prima all\'account del servizio. Mentre scrivi compaiono i siti salvati corrispondenti (anche quelli nelle cartelle), cercati per nome, dominio o nome della cartella; usa le frecce per selezionare, Invio per aprire e Ctrl / Cmd + Invio per aprire in una nuova scheda. Nel tema Terminale usa il comando <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">s</code> seguito da parole chiave per cercare o fare una domanda con l\'opzione predefinita.',
        'guide.background.title': 'Impostazioni sfondo',
        'guide.background.desc': 'Tutti i temi tranne Terminale e Minimal supportano le impostazioni dello sfondo, con 6 modalità:<br />1. <strong>Nessuno</strong>: usa il colore di sfondo predefinito della nuova scheda del browser. Il tema Nota mostra una bacheca di sughero quando non c\'è uno sfondo.<br />2. <strong>Tinta unita</strong>: 18 colori preimpostati per ciascuna modalità, chiara e scura, oppure un colore personalizzato.<br />3. <strong>Sfumatura</strong>: 18 sfumature preimpostate per ciascuna modalità, chiara e scura; fai clic su "Gradiente casuale" per generarne altre.<br />4. <strong>Immagine</strong>: caricate dal tuo dispositivo, fino a 18, salvate solo in locale.<br />5. <strong>Dinamico</strong>: 18 sfondi dinamici preimpostati per ciascuna modalità, chiara e scura.<br />6. <strong>Casuale</strong> (predefinito per i nuovi utenti): alterna a caso tra i tipi selezionati (tinta unita, sfumatura, immagine, dinamico), con una nuova scelta a ogni apertura di una nuova scheda o clic su "Cambia sfondo". Come origine casuale puoi scegliere "Genera nuovo", che crea ogni volta uno sfondo completamente nuovo, oppure "Dai preset", che sceglie solo tra i preset esistenti e le immagini caricate.<br />Se i preset in tinta unita, sfumati e dinamici non ti piacciono, puoi eliminarli; aggiungendone, ne vengono generati di nuovi, e puoi anche fare clic su "Rigenera 18 varianti". Le configurazioni di sfondo delle modalità chiara e scura sono indipendenti.',
        'guide.darkmode.title': 'Modalità scura',
        'guide.darkmode.desc': 'Supporta 3 modalità: seguimento automatico del sistema, chiaro manuale e scuro manuale. In modalità scura, potete configurare icone indipendenti per i siti.',
        'guide.importexport.title': 'Importa ed esporta',
        'guide.importexport.desc': 'Nelle impostazioni puoi esportare i dati scegliendo "Solo siti", "Solo impostazioni" o "Siti + Impostazioni"; il nome del file include automaticamente la versione dell\'estensione. I dati dei siti comprendono la struttura delle cartelle, le icone e gli stili delle cartelle e i siti al loro interno. In importazione i siti vengono uniti ai dati esistenti saltando i duplicati; le impostazioni sovrascrivono tutte le impostazioni attuali e la pagina si aggiorna automaticamente. Un file proveniente da una versione più recente richiede prima l\'aggiornamento dell\'estensione. Nel tema Terminale i comandi <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">export [all|sites|settings]</code> e <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">import</code> permettono di fare la stessa cosa.',
        'guide.browser.title': 'Descrizione dei permessi',
        'guide.browser.desc': 'A cosa serve ciascun permesso del browser:<br />1. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabs</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">tabGroups</code>: leggere titolo, URL e nome del gruppo delle schede della finestra attuale quando aggiungi un sito o crei una cartella, e aprire una cartella in un gruppo di schede.<br />2. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">contextMenus</code>: offrire "Aggiungi a Youran Tab" nel menu contestuale delle pagine web.<br />3. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">activeTab</code>, <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">scripting</code>: dopo l\'aggiunta di una pagina, mostrare un avviso in alto a destra nella pagina attuale.<br />4. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">storage</code>: salvare i tuoi siti e le impostazioni e passare le pagine da aggiungere tra lo sfondo e la nuova scheda.<br />5. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">unlimitedStorage</code> (solo Chrome ed Edge): rimuovere il limite di dimensione dell\'archiviazione dell\'estensione, cos\u00EC da poter salvare anche molte icone personalizzate caricate.<br />6. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">search</code>: richiamare all\'occorrenza il motore di ricerca predefinito del browser.<br />7. <code class="px-1.5 py-0.5 rounded bg-neutral-800 text-green-400 text-sm">favicon</code> (solo Chrome ed Edge): leggere l\'icona del sito integrata nel browser come una delle fonti di icone.<br />8. Accesso ai servizi di icone (Google, gstatic, Favicon Extractor, icon.horse): recuperare e memorizzare nella cache le icone dei siti.',
        'guide.align.title': 'Allineamento',
        'guide.align.desc': 'Il contenuto supporta 3 opzioni di allineamento verticale: alto, centro e basso. Ogni tema salva la propria impostazione di allineamento in modo indipendente.',
        'guide.reset.title': 'Ripristino delle impostazioni e pulizia della cache',
        'guide.reset.desc': '"Ripristina impostazioni" riporta tutte le impostazioni ai valori predefiniti; i dati dei siti già aggiunti e i contatori dei clic vengono conservati, vengono ripristinate solo le configurazioni di aspetto e funzionalità. "Svuota cache icone" elimina tutte le icone dei siti memorizzate nella cache, che verranno scaricate di nuovo alla prossima apertura.',
        'changelog.title': 'Registro modifiche',
        'changelog.storeDelayHint': 'La versione sullo store potrebbe subire ritardi a causa della revisione dello store del browser.',
        'changelog.v1.feat1': '8 temi: Classico, Bento, Terminale, Minimal, Vetro, Bolla, Pixel, Nota',
        'changelog.v1.feat2': 'Barra di ricerca integrata',
        'changelog.v1.feat3': 'Diverse modalità di sfondo: pieno, sfumatura, immagine, dinamico, casuale',
        'changelog.v1.feat4': 'Modalità scura con seguimento del sistema o cambio manuale',
        'changelog.v1.feat5': 'Supporto per 10 lingue',
        'changelog.v1.feat6': 'Importazione ed esportazione della configurazione dei siti',
        'changelog.v1.feat7': '3 fonti di icone online con supporto per caricamento personalizzato',
    },
};

const getMessage = (locale, key) => {
    const dict = messages[locale] || messages[fallbackLocale] || {};
    return dict[key] ?? messages[fallbackLocale]?.[key];
};

const themeSettings = ['auto', 'light', 'dark'];
const storageKeyTheme = 'doc_theme';
const themeIconIds = {
    auto: 'icon-monitor',
    light: 'icon-sun',
    dark: 'icon-moon',
};
const systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

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
let currentLocale = applyLocaleSetting(initialStored);

const themePicker = document.getElementById('theme-picker');
const themeToggle = document.getElementById('theme-toggle');
const themeToggleIcon = document.getElementById('theme-toggle-icon');
const themeToggleLabel = document.getElementById('theme-toggle-label');
const themeMenu = document.getElementById('theme-menu');

const getStoredThemeSetting = () => {
    const stored = localStorage.getItem(storageKeyTheme);
    if (themeSettings.includes(stored)) return stored;
    localStorage.removeItem(storageKeyTheme);
    return 'auto';
};

const setStoredThemeSetting = setting => {
    if (setting === 'auto') {
        localStorage.removeItem(storageKeyTheme);
        return;
    }
    localStorage.setItem(storageKeyTheme, setting);
};

const resolveTheme = setting => {
    if (setting === 'auto') return systemThemeMedia.matches ? 'dark' : 'light';
    return setting;
};

const createThemeIcon = setting => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    svg.setAttribute('class', 'h-4 w-4 shrink-0');
    svg.setAttribute('aria-hidden', 'true');
    use.setAttribute('href', `#${themeIconIds[setting]}`);
    svg.appendChild(use);
    return svg;
};

let currentThemeSetting = getStoredThemeSetting();

const setThemeMenuVisible = visible => {
    if (!themeMenu || !themeToggle) return;
    themeMenu.classList.toggle('hidden', !visible);
    themeToggle.setAttribute('aria-expanded', String(visible));
};

const updateThemeControls = () => {
    const currentLabel = getMessage(currentLocale, `theme.${currentThemeSetting}`);
    if (themeToggleIcon) {
        themeToggleIcon.setAttribute('href', `#${themeIconIds[currentThemeSetting]}`);
    }
    if (themeToggleLabel) {
        themeToggleLabel.textContent = currentLabel;
    }
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', getMessage(currentLocale, 'theme.label'));
        themeToggle.title = currentLabel;
    }
    if (!themeMenu) return;

    themeMenu.innerHTML = '';
    themeSettings.forEach(setting => {
        const isActive = setting === currentThemeSetting;
        const button = document.createElement('button');
        const label = document.createElement('span');
        const check = document.createElement('span');

        button.type = 'button';
        button.dataset.themeSetting = setting;
        button.setAttribute('role', 'menuitemradio');
        button.setAttribute('aria-checked', String(isActive));
        button.className =
            'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-300 hover:bg-white/10 hover:text-white';
        if (isActive) {
            button.className += ' bg-white/10 text-white';
        }

        label.className = 'flex-1';
        label.textContent = getMessage(currentLocale, `theme.${setting}`);
        check.className = 'text-xs';
        check.setAttribute('aria-hidden', 'true');
        check.textContent = isActive ? '✓' : '';
        button.append(createThemeIcon(setting), label, check);
        themeMenu.appendChild(button);
    });
};

const applyThemeSetting = setting => {
    currentThemeSetting = themeSettings.includes(setting) ? setting : 'auto';
    const theme = resolveTheme(currentThemeSetting);
    const root = document.documentElement;
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    root.dataset.theme = theme;
    root.dataset.themeSetting = currentThemeSetting;
    root.style.colorScheme = theme;
    if (themeColorMeta) {
        themeColorMeta.content = theme === 'dark' ? '#0a0a0a' : '#fafafa';
    }
    updateThemeControls();
};

applyThemeSetting(currentThemeSetting);

if (themeToggle && themeMenu) {
    themeToggle.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const shouldOpen = themeMenu.classList.contains('hidden');
        setMenuVisible(false);
        setThemeMenuVisible(shouldOpen);
    });

    themeMenu.addEventListener('click', event => {
        const button = event.target.closest('button[data-theme-setting]');
        if (!button) return;
        setStoredThemeSetting(button.dataset.themeSetting);
        applyThemeSetting(button.dataset.themeSetting);
        setThemeMenuVisible(false);
    });

    document.addEventListener('click', event => {
        if (!themePicker?.contains(event.target)) {
            setThemeMenuVisible(false);
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            setThemeMenuVisible(false);
        }
    });
}

systemThemeMedia.addEventListener('change', () => {
    if (currentThemeSetting === 'auto') {
        applyThemeSetting('auto');
    }
});

if (langToggle && langMenu) {
    langToggle.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const shouldOpen = langMenu.classList.contains('hidden');
        setThemeMenuVisible(false);
        setMenuVisible(shouldOpen);
    });

    langMenu.addEventListener('click', event => {
        const button = event.target.closest('button[data-lang]');
        if (!button) return;
        const detected = detectLocale();
        const nextLocale = normalizeLocale(button.dataset.lang) || detected;
        const stored = nextLocale === detected ? null : nextLocale;
        setStoredLocale(stored);
        currentLocale = applyLocaleSetting(stored);
        updateThemeControls();
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

// 页面路由
const pages = ['home', 'privacy', 'guide', 'changelog'];
const navLinks = document.querySelectorAll('nav a[data-page]');
const navMenuBtn = document.getElementById('nav-menu-btn');
const navMobileMenu = document.getElementById('nav-mobile-menu');
const supportModal = document.getElementById('support-modal');
const supportModalPanel = document.getElementById('support-modal-panel');
const supportModalClose = document.getElementById('support-modal-close');
const supportOpenButtons = document.querySelectorAll('[data-support-open]');
const supportParamValue = new URLSearchParams(location.search).get('support');

const setSupportVisible = visible => {
    if (!supportModal) return;
    supportModal.classList.toggle('hidden', !visible);
    document.body.classList.toggle('overflow-hidden', visible);
};

const shouldOpenSupportOnLoad =
    supportParamValue !== null &&
    supportParamValue !== '0' &&
    supportParamValue.toLowerCase() !== 'false';

const clearSupportParam = () => {
    const url = new URL(location.href);
    url.searchParams.delete('support');
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    history.replaceState(null, '', nextUrl);
};

const showPage = pageId => {
    pages.forEach(id => {
        const el = document.getElementById(`page-${id}`);
        if (el) el.classList.toggle('hidden', id !== pageId);
    });
    navLinks.forEach(link => {
        const isActive = link.dataset.page === pageId;
        link.classList.toggle('text-white', isActive);
        link.classList.toggle('text-neutral-400', !isActive);
    });
    window.scrollTo(0, 0);
};

const handleHash = () => {
    const hash = location.hash.replace('#', '') || 'home';
    const pageId = pages.includes(hash) ? hash : 'home';
    showPage(pageId);
};

navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const pageId = link.dataset.page;
        history.pushState(null, '', `#${pageId === 'home' ? '' : pageId}`);
        showPage(pageId);
        if (navMobileMenu) navMobileMenu.classList.add('hidden');
    });
});

if (navMenuBtn && navMobileMenu) {
    navMenuBtn.addEventListener('click', () => {
        navMobileMenu.classList.toggle('hidden');
    });
}

supportOpenButtons.forEach(button => {
    button.addEventListener('click', event => {
        event.preventDefault();
        setSupportVisible(true);
        if (navMobileMenu) navMobileMenu.classList.add('hidden');
    });
});

supportModalClose?.addEventListener('click', () => {
    setSupportVisible(false);
});

supportModal?.addEventListener('click', event => {
    if (supportModalPanel?.contains(event.target)) return;
    setSupportVisible(false);
});

if (shouldOpenSupportOnLoad) {
    setSupportVisible(true);
    clearSupportParam();
}

window.addEventListener('hashchange', handleHash);
handleHash();

// 渲染 Changelog
const changelogContainer = document.getElementById('changelog-content');
if (changelogContainer) {
    const renderedChangelog = changelogMd.replaceAll('__APP_VERSION__', appVersion);
    changelogContainer.innerHTML = marked(renderedChangelog);
}

// 首屏主题轮播：当前标签的进度条动画走完后切到下一个主题，悬停时暂停
const heroCarousel = document.getElementById('hero-carousel');
const heroShowcase = document.getElementById('hero-showcase');
const heroSlides = [...document.querySelectorAll('[data-hero-slide]')];
const heroTabs = [...document.querySelectorAll('[data-hero-tab]')];
const heroDescs = [...document.querySelectorAll('[data-hero-desc]')];
let heroIndex = 0;

const showHeroSlide = index => {
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, i) => slide.classList.toggle('is-active', i === heroIndex));
    heroDescs.forEach((desc, i) => desc.classList.toggle('is-active', i === heroIndex));
    heroTabs.forEach((tab, i) => tab.setAttribute('aria-selected', String(i === heroIndex)));
};

heroTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => showHeroSlide(i));
    tab.addEventListener('animationend', () => showHeroSlide(i + 1));
});
heroCarousel?.addEventListener('mouseenter', () => heroCarousel.classList.add('is-paused'));
heroCarousel?.addEventListener('mouseleave', () => heroCarousel.classList.remove('is-paused'));

// Lightbox 图片预览
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
heroShowcase?.addEventListener('click', e => {
    if (!e.target.closest('img')) return;
    lightboxImg.src = heroSlides[heroIndex].src;
    lightbox.classList.remove('hidden');
});
lightbox?.addEventListener('click', () => lightbox.classList.add('hidden'));

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        setSupportVisible(false);
    }
});
