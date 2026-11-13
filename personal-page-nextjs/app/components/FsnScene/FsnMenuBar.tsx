'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { findNode, fsTree } from '../../content/fsTree'
import { useFsn } from './FsnStore'
import styles from './FsnMenuBar.module.css'

type MenuItem = {
  id: string
  label: string
  onSelect: () => void
  disabled?: boolean
  checked?: boolean // defined => rendered as a checkbox-style item
}

type Menu = {
  id: string
  label: string
  items: MenuItem[]
}

function focusTrigger(menuId: string) {
  document.querySelector<HTMLElement>(`[data-testid="fsn-menu-${menuId}"]`)?.focus()
}

function enabledItemElements(menuId: string): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      `#fsn-menu-list-${menuId} [role^="menuitem"]:not(:disabled)`,
    ),
  )
}

const MENU_ORDER = ['session', 'show', 'display', 'directory', 'file'] as const

export default function FsnMenuBar({ children }: { children?: ReactNode }) {
  const {
    currentPath,
    selectedPath,
    openFilePath,
    navigateTo,
    goUp,
    openFile,
    closeFile,
    birdsEye,
    setBirdsEye,
    terminalMinimized,
    setTerminalMinimized,
  } = useFsn()
  const [openState, setOpenState] = useState<{
    id: string
    focus: 'first' | 'last' | null
  } | null>(null)
  const openMenuId = openState?.id ?? null
  const [aboutOpen, setAboutOpen] = useState(false)
  const aboutRef = useRef<HTMLDivElement>(null)

  const selectedNode = findNode(selectedPath)
  const selectedIsFile = selectedNode?.type === 'file'
  const topLevelDirs = (fsTree.children ?? []).filter((child) => child.type === 'dir')

  const menus: Menu[] = [
    {
      id: 'session',
      label: 'Session',
      items: [
        {
          id: 'reset',
          label: 'Reset view',
          onSelect: () => {
            navigateTo('/')
            setBirdsEye(false)
          },
        },
      ],
    },
    {
      id: 'show',
      label: 'Show',
      items: [
        {
          id: 'terminal',
          label: 'Terminal',
          checked: !terminalMinimized,
          onSelect: () => setTerminalMinimized(!terminalMinimized),
        },
      ],
    },
    {
      id: 'display',
      label: 'Display',
      items: [
        {
          id: 'birdseye',
          label: "Bird's-eye",
          checked: birdsEye,
          onSelect: () => setBirdsEye(!birdsEye),
        },
      ],
    },
    {
      id: 'directory',
      label: 'Directory',
      items: [
        { id: 'up', label: 'Up', disabled: currentPath === '/', onSelect: goUp },
        { id: 'root', label: 'Root', onSelect: () => navigateTo('/') },
        ...topLevelDirs.map((dir) => ({
          id: `dir-${dir.name}`,
          label: dir.name,
          onSelect: () => navigateTo(dir.path),
        })),
      ],
    },
    {
      id: 'file',
      label: 'File',
      items: [
        {
          id: 'open',
          label: 'Open',
          disabled: !selectedIsFile,
          onSelect: () => openFile(selectedPath),
        },
        { id: 'close', label: 'Close', disabled: !openFilePath, onSelect: closeFile },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [{ id: 'about', label: 'About fsn', onSelect: () => setAboutOpen(true) }],
    },
  ]

  const closeMenu = useCallback((restoreFocusTo?: string) => {
    setOpenState(null)
    if (restoreFocusTo) focusTrigger(restoreFocusTo)
  }, [])

  const openMenu = (menuId: string, focus: 'first' | 'last' | null) => {
    setOpenState({ id: menuId, focus })
  }

  // Move focus into a menu that was just opened from the keyboard
  useEffect(() => {
    if (!openState?.focus) return
    const items = enabledItemElements(openState.id)
    const target = openState.focus === 'last' ? items[items.length - 1] : items[0]
    target?.focus()
  }, [openState])

  // Close on outside pointer; Esc closes the menu/dialog before anything else sees it
  // (capture phase on document runs ahead of the window-level Esc = go-up handler).
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || event.target.closest('[data-fsn-menu]')) return
      setOpenState(null)
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (aboutOpen) {
        event.stopPropagation()
        setAboutOpen(false)
        focusTrigger('help')
      } else if (openMenuId) {
        event.stopPropagation()
        closeMenu(openMenuId)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [aboutOpen, openMenuId, closeMenu])

  // Tab / Shift+Tab loop inside the About dialog
  const onAboutKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return
    const focusable = Array.from(
      aboutRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])') ?? [],
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || !aboutRef.current?.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (active === last || !aboutRef.current?.contains(active))) {
      event.preventDefault()
      first.focus()
    }
  }

  const closeAbout = () => {
    setAboutOpen(false)
    focusTrigger('help')
  }

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>, menuId: string) => {
    const order = menus.map((menu) => menu.id)
    const index = order.indexOf(menuId)
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      openMenu(menuId, 'first')
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      openMenu(menuId, 'last')
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const step = event.key === 'ArrowRight' ? 1 : -1
      const next = order[(index + step + order.length) % order.length]
      event.preventDefault()
      focusTrigger(next)
      if (openMenuId) openMenu(next, null)
    }
  }

  const onItemKeyDown = (event: KeyboardEvent<HTMLButtonElement>, menu: Menu) => {
    const itemElements = enabledItemElements(menu.id)
    const index = itemElements.indexOf(event.currentTarget)
    const focusAt = (target: number) => {
      event.preventDefault()
      itemElements[(target + itemElements.length) % itemElements.length]?.focus()
    }
    if (event.key === 'ArrowDown') focusAt(index + 1)
    else if (event.key === 'ArrowUp') focusAt(index - 1)
    else if (event.key === 'Home') focusAt(0)
    else if (event.key === 'End') focusAt(itemElements.length - 1)
    else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const order = menus.map((candidate) => candidate.id)
      const step = event.key === 'ArrowRight' ? 1 : -1
      const next = order[(order.indexOf(menu.id) + step + order.length) % order.length]
      event.preventDefault()
      focusTrigger(next)
      openMenu(next, 'first')
    } else if (event.key === 'Tab') {
      setOpenState(null)
    }
  }

  const renderMenu = (menu: Menu) => {
    const isOpen = openMenuId === menu.id
    return (
      <div key={menu.id} className={styles.menu} data-fsn-menu>
        <button
          type="button"
          className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
          data-testid={`fsn-menu-${menu.id}`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls={isOpen ? `fsn-menu-list-${menu.id}` : undefined}
          onClick={() => (isOpen ? closeMenu() : openMenu(menu.id, null))}
          onMouseEnter={() => {
            if (openMenuId && openMenuId !== menu.id) openMenu(menu.id, null)
          }}
          onKeyDown={(event) => onTriggerKeyDown(event, menu.id)}
        >
          {menu.label}
        </button>
        {isOpen && (
          <div
            className={styles.list}
            id={`fsn-menu-list-${menu.id}`}
            role="menu"
            aria-label={menu.label}
            data-testid={`fsn-menu-list-${menu.id}`}
          >
            {menu.items.map((item) => (
              <button
                key={item.id}
                type="button"
                role={item.checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
                aria-checked={item.checked}
                disabled={item.disabled}
                tabIndex={-1}
                className={styles.item}
                data-testid={`fsn-menu-item-${menu.id}-${item.id}`}
                onKeyDown={(event) => onItemKeyDown(event, menu)}
                onClick={() => {
                  closeMenu(menu.id === 'help' ? undefined : menu.id)
                  item.onSelect()
                }}
              >
                <span className={styles.check} aria-hidden="true">
                  {item.checked ? '✓' : ''}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const mainMenus = MENU_ORDER.map((id) => menus.find((menu) => menu.id === id)).filter(
    (menu): menu is Menu => Boolean(menu),
  )
  const helpMenu = menus.find((menu) => menu.id === 'help')

  return (
    <>
      <div className={styles.group} role="menubar" aria-label="fsn menus">
        {mainMenus.map(renderMenu)}
      </div>
      {children}
      {openMenuId &&
        createPortal(
          // Transparent catcher: the click that dismisses a menu must not reach the scene
          <div
            className={styles.catcher}
            data-testid="fsn-menu-catcher"
            onPointerDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              closeMenu()
            }}
          />,
          document.body,
        )}
      <div className={`${styles.group} ${styles.help}`}>{helpMenu && renderMenu(helpMenu)}</div>
      {aboutOpen &&
        createPortal(
          <div
            className={styles.aboutBackdrop}
            data-testid="fsn-about-backdrop"
            onClick={(event) => {
              if (event.target === event.currentTarget) closeAbout()
            }}
          >
          <div
            ref={aboutRef}
            className={styles.about}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fsn-about-title"
            data-testid="fsn-about"
            onKeyDown={onAboutKeyDown}
          >
            <div className={styles.aboutTitle} id="fsn-about-title">
              About fsn
            </div>
            <p className={styles.aboutText}>
              Fsn: a 3D File System Navigator &mdash; recreation of SGI&apos;s fsn as seen in
              Jurassic Park (1993)
            </p>
            <button
              type="button"
              autoFocus
              className={styles.aboutClose}
              data-testid="fsn-about-close"
              onClick={closeAbout}
            >
              Close
            </button>
          </div>
          </div>,
          document.body,
        )}
    </>
  )
}
