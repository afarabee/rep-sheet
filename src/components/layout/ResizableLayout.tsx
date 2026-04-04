import type { ReactNode } from 'react'
import { Group, Panel } from 'react-resizable-panels'
import ResizeHandle from './ResizeHandle'

interface ResizableLayoutProps {
  id: string
  isMobile: boolean
  leftPanel: ReactNode
  rightPanel: ReactNode
  leftDefault?: number
  leftMin?: number
  rightMin?: number
}

/**
 * Two-panel layout with draggable resize handle on desktop.
 * On mobile, renders both panels as siblings (pages handle show/hide via cn()).
 */
export default function ResizableLayout({
  id,
  isMobile,
  leftPanel,
  rightPanel,
  leftDefault = 25,
  leftMin = 15,
  rightMin = 30,
}: ResizableLayoutProps) {
  if (isMobile) {
    return (
      <>
        {leftPanel}
        {rightPanel}
      </>
    )
  }

  return (
    <Group orientation="horizontal" id={id}>
      <Panel defaultSize={leftDefault} minSize={leftMin} id={`${id}-left`}>
        {leftPanel}
      </Panel>
      <ResizeHandle />
      <Panel defaultSize={100 - leftDefault} minSize={rightMin} id={`${id}-right`}>
        {rightPanel}
      </Panel>
    </Group>
  )
}
