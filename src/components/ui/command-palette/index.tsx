'use client'

import { useCommandPalette } from '@/hooks/use-command-palette'
import { CommandPaletteTrigger } from './command-palette-trigger'
import { CommandPaletteDialog } from './command-palette-dialog'
import type { CommandPaletteProps } from './types'

export function CommandPalette({ className }: CommandPaletteProps): React.ReactElement {
  const {
    activeSelectedIndex,
    clearQuery,
    closePalette,
    commandCount,
    executeCommand,
    groupedCommands,
    inputRef,
    isOpen,
    isSearching,
    listRef,
    openPalette,
    query,
    setQuery,
    setSelectedIndex,
  } = useCommandPalette()

  return (
    <>
      <CommandPaletteTrigger className={className} onOpen={openPalette} />

      {isOpen && (
        <CommandPaletteDialog
          commandCount={commandCount}
          groupedCommands={groupedCommands}
          inputRef={inputRef}
          isSearching={isSearching}
          listRef={listRef}
          onChangeQuery={setQuery}
          onClearQuery={clearQuery}
          onClose={closePalette}
          onHoverIndex={setSelectedIndex}
          onSelectCommand={executeCommand}
          query={query}
          selectedIndex={activeSelectedIndex}
        />
      )}
    </>
  )
}
