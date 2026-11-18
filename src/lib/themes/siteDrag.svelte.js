import { get } from 'svelte/store'
import { sites } from '../stores.js'
import { isFolderItem, moveSiteToFolder } from '../folders.js'
import { isInFolderDropZone } from './dropZone.js'

// 编辑模式下的拖拽，各主题共用：
// - 拖到其他卡片上：调整主列表顺序
// - 把网站拖到文件夹卡片中间：放进这个文件夹
export const createSiteDrag = () => {
  let index = $state(-1)
  let overIndex = $state(-1)
  let intoFolder = $state(false)

  const reset = () => {
    index = -1
    overIndex = -1
    intoFolder = false
  }

  // 只有网站能放进文件夹，文件夹不能嵌套
  const canDropInto = (targetIndex) => {
    const list = get(sites)
    return targetIndex !== index && isFolderItem(list[targetIndex]) && !isFolderItem(list[index])
  }

  return {
    get index() {
      return index
    },
    get overIndex() {
      return overIndex
    },
    // 当前位置是排序的放置目标，用于高亮
    isTarget: (i) => overIndex === i && index !== i && !intoFolder,
    // 当前位置是要放进的文件夹
    isInto: (i) => overIndex === i && intoFolder,
    start: (event, i) => {
      index = i
      event.dataTransfer.effectAllowed = 'move'
    },
    over: (event, i) => {
      if (index < 0) return
      event.preventDefault()
      overIndex = i
      intoFolder = canDropInto(i) && isInFolderDropZone(event.currentTarget.getBoundingClientRect(), event.clientX, event.clientY)
    },
    drop: (event, i) => {
      event.preventDefault()
      const list = get(sites)
      if (intoFolder && canDropInto(i)) {
        sites.setAll(moveSiteToFolder(list, list[index].id, list[i].id))
      } else if (index >= 0 && index !== i) {
        sites.reorder(index, i)
      }
      reset()
    },
    end: reset,
  }
}
