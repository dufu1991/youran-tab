import { describe, expect, test } from 'bun:test'
import { isInFolderDropZone } from './dropZone.js'

const rect = { left: 100, top: 100, right: 200, bottom: 200, width: 100, height: 100 }

describe('isInFolderDropZone', () => {
  test('中间区域算作放进文件夹', () => {
    expect(isInFolderDropZone(rect, 150, 150)).toBe(true)
    expect(isInFolderDropZone(rect, 125, 175)).toBe(true)
  })

  test('边缘区域仍按排序处理', () => {
    expect(isInFolderDropZone(rect, 105, 150)).toBe(false)
    expect(isInFolderDropZone(rect, 150, 195)).toBe(false)
    expect(isInFolderDropZone(rect, 90, 150)).toBe(false)
  })
})
