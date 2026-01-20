"use client"

import { useEffect, useRef, useState } from "react"
import { Sidebar } from "@/components/SideBar"
import { FloatingBubbleChat } from "@/components/FloatingBubbleChat"
import { useChatStore } from "@/stores/chat.store"
import { useAuthStore } from "@/stores/auth.store"
import { useSiteStore } from "@/stores/site.store"

export default function Home() {
  const {
    conversations,
    localConversations,
    messages,
    fetchConversations,
    selectConversation,
    send,
    activeConversationId,
    createNewChat,
  } = useChatStore()

  const { login, loading: authLoading } = useAuthStore()
  const { iconUrl, title, fetchSiteConfig } = useSiteStore()
  const initialized = useRef(false)
  const [isChatOpen, setIsChatOpen] = useState(true)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const init = async () => {
      // Step 1: Initialize session by calling /site first
      try {
        console.log('Initializing session...')
        await login() // This calls /site to establish session
        console.log('Session initialized successfully')
      } catch (err) {
        console.error('Failed to initialize session:', err)
      }

      // Step 2: Fetch site config for icon and title
      try {
        console.log('Fetching site config...')
        await fetchSiteConfig()
        console.log('Site config fetched successfully')
      } catch (err) {
        console.error('Failed to fetch site config:', err)
      }

      // Step 3: Fetch conversations after session is established
      try {
        console.log('Fetching conversations...')
        await fetchConversations()
        console.log('Conversations fetched successfully')
      } catch (err) {
        console.error('Failed to fetch conversations:', err)
      }
    }
    init()
  }, [])

  const handleNewChat = () => {
    createNewChat()
    setIsChatOpen(true) // Open bubble chat when creating new chat
  }

  const handleSelectConversation = async (id: string) => {
    await selectConversation(id)
    setIsChatOpen(true) // Open bubble chat when selecting conversation
  }

  const handleSendMessage = async (text: string) => {
    await send(text)
  }

  // Combine API conversations with local conversations
  const allConversations = [
    ...localConversations.map(c => ({
      id: c.id,
      title: c.title,
      created_at: c.created_at,
    })),
    ...conversations.filter(c => !localConversations.some(lc => lc.id === c.id)),
  ]

  // Show loading only briefly
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-2 text-sm text-gray-600">Đang xác thực...</p>
        </div>
      </div>
    )
  }

  // Show chat even if auth fails temporarily
  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        conversations={allConversations}
        activeConversationId={activeConversationId ?? ""}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        botIconUrl={iconUrl}
        botTitle={title || "DTPOS AI"}
      />

      <FloatingBubbleChat
        isOpen={isChatOpen}
        onToggle={setIsChatOpen}
        messages={messages}
        onSendMessage={handleSendMessage}
        botIconUrl={iconUrl}
        botTitle={title || "DTPOS AI"}
      />
    </div>
  )
}
