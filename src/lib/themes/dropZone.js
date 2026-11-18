// 拖到文件夹卡片上时，落在中间区域表示「放进文件夹」，落在边缘仍表示「排到它前后」，
// 这样既能放进文件夹，也能把网站排在文件夹旁边
export const FOLDER_DROP_INSET = 0.22

export const isInFolderDropZone = (rect, x, y, inset = FOLDER_DROP_INSET) => {
  const insetX = rect.width * inset
  const insetY = rect.height * inset
  return x >= rect.left + insetX
    && x <= rect.right - insetX
    && y >= rect.top + insetY
    && y <= rect.bottom - insetY
}
