import type { FsNode } from '../../content/fsTree'

export type LayoutEntry = {
  position: [number, number, number]
  width: number
  depth: number
  height: number
  kind: 'dir' | 'file'
  parentPath: string
}

export type Layout = Map<string, LayoutEntry>

// 'tidy' is fsnav's tidy tree: every directory's children sit in ONE row behind it.
// 'grid' wraps 3+ child directories into a ceil(sqrt(n)) column grid. Landscape screens use
// tidy (a wide row), portrait screens use grid (a tall block).
export type LayoutMode = 'tidy' | 'grid'
// Set to 'tidy' or 'grid' to force one mode regardless of orientation (for testing)
export const LAYOUT_MODE_OVERRIDE: LayoutMode | null = null

export function layoutModeFor(portrait: boolean): LayoutMode {
  return LAYOUT_MODE_OVERRIDE ?? (portrait ? 'grid' : 'tidy')
}

export const FILE_BLOCK_SIZE = 2.0 // square base of a file block
export const FILE_NAME_DEPTH = 1.8 // depth of the gap in front of a block that holds its name
// slot depth per file: the block at the back, its name in the gap in front (blocks sit close
// together; the directory view's steep camera keeps the back row's names in sight)
export const FILE_CELL_DEPTH = FILE_BLOCK_SIZE + FILE_NAME_DEPTH
// cells are square, so a 2x2 slab is square like fsn's
export const FILE_CELL_WIDTH = FILE_CELL_DEPTH
export const PEDESTAL_PADDING = 1.2
export const PEDESTAL_MIN_SIZE = 6
export const PEDESTAL_EMPTY_HEIGHT = 0.15 // a directory with no files of its own is a thin slab
export const PEDESTAL_HEIGHT_MIN = 0.8 // a slab holding files is a thick box that grows with them (fsn)
export const PEDESTAL_HEIGHT_MAX = 2.5
export const PEDESTAL_HEIGHT_BASE = 0.5
export const PEDESTAL_HEIGHT_SCALE = 0.1 // multiplied by sqrt(total size of the directory's own files)
export const DIR_GAP = 2.6 // x gap between sibling subtrees
export const LEVEL_GAP = 8 // gap between a pedestal's back edge and the directories behind it (fits their names)
export const GRID_LEVEL_GAP = 12 // the same in the portrait grid: the front row hides more of the row behind
export const FILE_HEIGHT_MIN = 0.5
export const FILE_HEIGHT_MAX = 4
export const FILE_HEIGHT_SCALE = 0.04 // fsn: height = k * size^0.8
export const FILE_HEIGHT_POWER = 0.8

function levelGap(mode: LayoutMode): number {
  return mode === 'grid' ? GRID_LEVEL_GAP : LEVEL_GAP
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function fileHeight(size: number): number {
  return clamp(FILE_HEIGHT_SCALE * Math.pow(Math.max(size, 1), FILE_HEIGHT_POWER), FILE_HEIGHT_MIN, FILE_HEIGHT_MAX)
}

export function pedestalHeight(ownFilesSize: number, fileCount: number): number {
  if (fileCount === 0) return PEDESTAL_EMPTY_HEIGHT
  return clamp(
    PEDESTAL_HEIGHT_BASE + PEDESTAL_HEIGHT_SCALE * Math.sqrt(Math.max(ownFilesSize, 0)),
    PEDESTAL_HEIGHT_MIN,
    PEDESTAL_HEIGHT_MAX,
  )
}

type Size = { width: number; depth: number }

function fileGrid(count: number): { columns: number; rows: number } {
  const columns = Math.max(1, Math.ceil(Math.sqrt(count)))
  return { columns, rows: Math.max(1, Math.ceil(count / columns)) }
}

function childFiles(node: FsNode): FsNode[] {
  return (node.children ?? []).filter((child) => child.type === 'file')
}

function childDirs(node: FsNode): FsNode[] {
  return (node.children ?? []).filter((child) => child.type === 'dir')
}

// Every directory slab that holds files is at least a 2x2 file grid, so slabs with one row of
// files are the same size as their two-row siblings; larger directories still grow.
const STANDARD_SLAB_FILES = 4

function pedestalSize(node: FsNode): Size {
  const fileCount = childFiles(node).length
  const { columns, rows } = fileGrid(fileCount > 0 ? Math.max(fileCount, STANDARD_SLAB_FILES) : 0)
  return {
    width: Math.max(PEDESTAL_MIN_SIZE, columns * FILE_CELL_WIDTH + PEDESTAL_PADDING),
    depth: Math.max(PEDESTAL_MIN_SIZE, rows * FILE_CELL_DEPTH + PEDESTAL_PADDING),
  }
}

// tidy: always one row. grid: 1-2 child directories sit in one row, 3 or more form a
// ceil(sqrt(n)) column grid.
function gridColumns(count: number, mode: LayoutMode): number {
  if (mode === 'tidy') return Math.max(1, count)
  return count >= 3 ? Math.ceil(Math.sqrt(count)) : Math.max(1, count)
}

// Footprint of a directory together with everything laid out behind it
function measure(node: FsNode, mode: LayoutMode): Size {
  const size = pedestalSize(node)
  const dirs = childDirs(node)
  if (dirs.length === 0) return size
  const columns = gridColumns(dirs.length, mode)
  const rows = Math.ceil(dirs.length / columns)
  const sizes = dirs.map((dir) => measure(dir, mode))
  let blockWidth = DIR_GAP * (columns - 1)
  for (let column = 0; column < columns; column++) {
    blockWidth += Math.max(...sizes.filter((_, index) => index % columns === column).map((entry) => entry.width))
  }
  let blockDepth = levelGap(mode) * (rows - 1)
  for (let row = 0; row < rows; row++) {
    blockDepth += Math.max(...sizes.slice(row * columns, (row + 1) * columns).map((entry) => entry.depth))
  }
  return { width: Math.max(size.width, blockWidth), depth: size.depth + levelGap(mode) + blockDepth }
}

export function computeLayout(root: FsNode, mode: LayoutMode = layoutModeFor(false)): Layout {
  const layout: Layout = new Map()

  function place(node: FsNode, centerX: number, centerZ: number, parent: string) {
    const size = pedestalSize(node)
    const ownFiles = childFiles(node)
    const baseHeight = pedestalHeight(
      ownFiles.reduce((total, file) => total + file.size, 0),
      ownFiles.length,
    )
    layout.set(node.path, {
      position: [centerX, baseHeight / 2, centerZ],
      width: size.width,
      depth: size.depth,
      height: baseHeight,
      kind: 'dir',
      parentPath: parent,
    })

    const files = childFiles(node)
    const { columns: fileColumns, rows: fileRows } = fileGrid(files.length)
    files.forEach((file, index) => {
      const height = fileHeight(file.size)
      const column = index % fileColumns
      const row = Math.floor(index / fileColumns)
      const offsetX = (column - (fileColumns - 1) / 2) * FILE_CELL_WIDTH
      // the block hugs the back of its cell; its name lies in the gap in front
      const cellZ = (row - (fileRows - 1) / 2) * FILE_CELL_DEPTH
      const offsetZ = cellZ - (FILE_CELL_DEPTH - FILE_BLOCK_SIZE) / 2
      layout.set(file.path, {
        position: [centerX + offsetX, baseHeight + height / 2, centerZ + offsetZ],
        width: FILE_BLOCK_SIZE,
        depth: FILE_BLOCK_SIZE,
        height,
        kind: 'file',
        parentPath: node.path,
      })
    })

    const dirs = childDirs(node)
    if (dirs.length === 0) return
    const columns = gridColumns(dirs.length, mode)
    const rows = Math.ceil(dirs.length / columns)
    const sizes = dirs.map((dir) => measure(dir, mode))
    const columnWidths: number[] = []
    for (let column = 0; column < columns; column++) {
      columnWidths.push(
        Math.max(...sizes.filter((_, index) => index % columns === column).map((entry) => entry.width)),
      )
    }
    const blockWidth = columnWidths.reduce((total, width) => total + width, 0) + DIR_GAP * (columns - 1)
    const columnCenters: number[] = []
    let cursor = centerX - blockWidth / 2
    for (const width of columnWidths) {
      columnCenters.push(cursor + width / 2)
      cursor += width + DIR_GAP
    }

    let rowFront = centerZ - size.depth / 2 - levelGap(mode)
    for (let row = 0; row < rows; row++) {
      const rowSizes = sizes.slice(row * columns, (row + 1) * columns)
      const rowDepth = Math.max(...rowSizes.map((entry) => entry.depth))
      rowSizes.forEach((_, offset) => {
        const dir = dirs[row * columns + offset]
        const childDepth = pedestalSize(dir).depth
        place(dir, columnCenters[offset], rowFront - childDepth / 2, node.path)
      })
      rowFront -= rowDepth + levelGap(mode)
    }
  }

  place(root, 0, 0, '')
  return layout
}
