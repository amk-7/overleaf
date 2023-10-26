import { useConnectionContext } from '@/features/ide-react/context/connection-context'
import useEventListener from '@/shared/hooks/use-event-listener'
import { useCallback, useEffect, useState } from 'react'
import { Alerts } from '@/features/ide-react/components/alerts/alerts'
import { useLayoutContext } from '@/shared/context/layout-context'
import PlaceholderChat from '@/features/ide-react/components/layout/placeholder/placeholder-chat'
import PlaceholderHistory from '@/features/ide-react/components/layout/placeholder/placeholder-history'
import MainLayout from '@/features/ide-react/components/layout/main-layout'
import { EditorAndSidebar } from '@/features/ide-react/components/editor-and-sidebar'
import Header from '@/features/ide-react/components/header'
import EditorLeftMenu from '@/features/editor-left-menu/components/editor-left-menu'
import { useLayoutEventTracking } from '@/features/ide-react/hooks/use-layout-event-tracking'

// This is filled with placeholder content while the real content is migrated
// away from Angular
export default function IdePage() {
  useLayoutEventTracking()

  const [leftColumnDefaultSize, setLeftColumnDefaultSize] = useState(20)
  const { registerUserActivity } = useConnectionContext()

  // Inform the connection manager when the user is active
  const listener = useCallback(
    () => registerUserActivity(),
    [registerUserActivity]
  )

  useEventListener('cursor:editor:update', listener)

  useEffect(() => {
    document.body.addEventListener('click', listener)
    return () => document.body.removeEventListener('click', listener)
  }, [listener])

  const { chatIsOpen, setChatIsOpen, view, setView } = useLayoutContext()
  const historyIsOpen = view === 'history'
  const setHistoryIsOpen = useCallback(
    (historyIsOpen: boolean) => {
      setView(historyIsOpen ? 'history' : 'editor')
    },
    [setView]
  )

  const headerContent = (
    <Header
      chatIsOpen={chatIsOpen}
      setChatIsOpen={setChatIsOpen}
      historyIsOpen={historyIsOpen}
      setHistoryIsOpen={setHistoryIsOpen}
    />
  )
  const chatContent = <PlaceholderChat />

  const mainContent = historyIsOpen ? (
    <PlaceholderHistory
      shouldPersistLayout
      leftColumnDefaultSize={leftColumnDefaultSize}
      setLeftColumnDefaultSize={setLeftColumnDefaultSize}
    />
  ) : (
    <EditorAndSidebar
      leftColumnDefaultSize={leftColumnDefaultSize}
      setLeftColumnDefaultSize={setLeftColumnDefaultSize}
      shouldPersistLayout
    />
  )

  return (
    <>
      <Alerts />
      <EditorLeftMenu />
      <MainLayout
        headerContent={headerContent}
        chatContent={chatContent}
        mainContent={mainContent}
        chatIsOpen={chatIsOpen}
        shouldPersistLayout
      />
    </>
  )
}
