// 设置面板里反复出现的样式组合；明暗通过 <html> 上的 dark 类切换，统一使用 dark: 变体

export const sectionTitleClass = 'text-xs uppercase tracking-wider mb-1 text-neutral-400'

export const subTitleClass = 'text-xs mb-1 text-neutral-500 dark:text-neutral-400'

export const hintClass = 'text-xs leading-4 whitespace-normal text-neutral-500 dark:text-neutral-400'

export const dividerClass = 'border-neutral-200 dark:border-neutral-600'

export const segmentedButtonClass = (active) => `settings-segmented-button transition-all ${active
  ? 'bg-neutral-800 text-white dark:bg-white dark:text-black'
  : 'settings-segmented-button-inactive'}`

// 可勾选的列表行：未启用时文字变淡
export const optionRowClass = (enabled) => `rounded-md text-xs transition-all bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700/60 dark:hover:bg-neutral-700 ${enabled
  ? 'text-neutral-700 dark:text-neutral-200'
  : 'text-neutral-400 dark:text-neutral-500'}`

export const selectedRingClass = (selected) => (selected
  ? 'ring-2 ring-offset-1 ring-neutral-800 ring-offset-white dark:ring-white dark:ring-offset-neutral-800'
  : '')

export const dashedAddClass = 'aspect-video rounded border-2 border-dashed flex items-center justify-center text-sm border-neutral-300 text-neutral-400 hover:border-neutral-500 dark:border-neutral-600 dark:text-neutral-500 dark:hover:border-neutral-400'

export const secondaryButtonClass = 'w-full py-1.5 rounded text-xs transition-all whitespace-normal bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-200'

export const ghostButtonClass = 'flex-1 py-1.5 rounded text-xs transition-all text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200'

// 预设缩略图右上角的删除按钮：悬停或键盘聚焦时显示
export const removeBadgeClass = 'absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-3xs leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity'
