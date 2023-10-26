import React from 'react'
import { Panel, PanelGroup } from 'react-resizable-panels'
import { VerticalResizeHandle } from '@/features/ide-react/components/resize/vertical-resize-handle'
import { FileTree } from '@/features/ide-react/components/file-tree'
import { FileTreeSelectHandler } from '@/features/ide-react/types/file-tree'

type EditorSidebarProps = {
  shouldPersistLayout: boolean
  onFileTreeInit: () => void
  onFileTreeSelect: FileTreeSelectHandler
}

export default function EditorSidebar({
  shouldPersistLayout,
  onFileTreeInit,
  onFileTreeSelect,
}: EditorSidebarProps) {
  return (
    <aside className="ide-react-placeholder-editor-sidebar">
      <PanelGroup
        autoSaveId={
          shouldPersistLayout ? 'ide-react-editor-sidebar-layout' : undefined
        }
        direction="vertical"
      >
        <Panel defaultSize={75} className="ide-react-file-tree-panel">
          <FileTree onInit={onFileTreeInit} onSelect={onFileTreeSelect} />
        </Panel>
        <VerticalResizeHandle />
        <Panel defaultSize={25}>File outline placeholder</Panel>
      </PanelGroup>
    </aside>
  )
}