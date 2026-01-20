import { create } from "zustand"
import { persist } from "zustand/middleware"
import { getPinnedConversations } from "@/services/conversation.service"
import { getMessages, sendMessageStream } from "@/services/message.service"

import type { Conversation } from "@/lib/types/conversation"
import type { ApiMessage } from "@/lib/types/chat"
import type { UIMessage } from "@/lib/types/chat-ui"

interface LocalConversation extends Conversation {
  messages: UIMessage[]
}

interface ChatState {
  conversations: Conversation[]
  localConversations: LocalConversation[]
  apiMessages: ApiMessage[]
  messages: UIMessage[]

  activeConversationId?: string
  loading: boolean

  fetchConversations: () => Promise<void>
  selectConversation: (id: string) => Promise<void>
  send: (text: string) => Promise<void>
  createNewChat: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      localConversations: [],
      apiMessages: [],
      messages: [],
      loading: false,

      fetchConversations: async () => {
        try {
          const data = await getPinnedConversations()
          set({ conversations: data })
        } catch (error) {
          console.error("Failed to fetch conversations:", error)
        }
      },

      selectConversation: async (id: string) => {
        const { localConversations } = get()
        
        // Check if it's a local conversation first
        const localConv = localConversations.find(c => c.id === id)
        if (localConv) {
          set({
            activeConversationId: id,
            messages: localConv.messages,
            loading: false,
          })
          return
        }
        
        // Otherwise fetch from API
        set({ activeConversationId: id, loading: true })

        try {
          const apiMessages = await getMessages(id)

          const uiMessages: UIMessage[] = apiMessages.flatMap((m: ApiMessage) => [
            {
              id: `${m.id}-user`,
              text: m.query,
              sender: "user" as const,
              timestamp: m.created_at,
            },
            {
              id: `${m.id}-bot`,
              text: m.answer,
              sender: "bot" as const,
              timestamp: m.created_at,
            },
          ])

          set({
            apiMessages,
            messages: uiMessages,
            loading: false,
          })
        } catch (error) {
          console.error("Failed to fetch messages:", error)
          set({ loading: false })
        }
      },

      createNewChat: () => {
        const { activeConversationId, messages, localConversations } = get()
        
        // Save current conversation if it has messages
        if (activeConversationId && messages.length > 0) {
          const existingIndex = localConversations.findIndex(c => c.id === activeConversationId)
          
          if (existingIndex >= 0) {
            // Update existing local conversation
            const updated = [...localConversations]
            updated[existingIndex] = {
              ...updated[existingIndex],
              messages,
            }
            set({ localConversations: updated })
          }
        }
        
        // Create new empty conversation
        set({
          activeConversationId: undefined,
          messages: [],
          apiMessages: [],
        })
      },

      send: async (text: string) => {
        const { activeConversationId, localConversations, messages: currentMessages } = get()
        const botMessageId = `bot-${Date.now()}`
        const userMessageId = `user-${Date.now()}`
        const isNewConversation = !activeConversationId
        
        // Create user and bot placeholder messages
        const userMessage: UIMessage = {
          id: userMessageId,
          text,
          sender: "user" as const,
          timestamp: Math.floor(Date.now() / 1000),
        }
        
        const botMessage: UIMessage = {
          id: botMessageId,
          text: "",
          sender: "bot" as const,
          timestamp: Math.floor(Date.now() / 1000),
        }
        
        const newMessages = [...currentMessages, userMessage, botMessage]
        
        set({
          messages: newMessages,
          loading: true,
        })

        // Stream message with SSE
        const result = await sendMessageStream(
          text,
          activeConversationId,
          (streamedText, isComplete) => {
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === botMessageId
                  ? { ...m, text: streamedText }
                  : m
              ),
              loading: !isComplete,
            }))
          },
          (err) => {
            console.error("Stream error:", err)
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === botMessageId
                  ? { ...m, text: "Đã xảy ra lỗi. Vui lòng thử lại." }
                  : m
              ),
              loading: false,
            }))
          }
        )
        
        // Update conversation ID and save to local conversations
        if (result?.conversation_id) {
          const conversationId = result.conversation_id
          const { messages: finalMessages } = get()
          
          // Generate title from first user message (truncate if too long)
          const title = text.length > 30 ? text.substring(0, 30) + "..." : text
          
          // Check if this conversation exists in local
          const existingIndex = localConversations.findIndex(c => c.id === conversationId)
          
          if (existingIndex >= 0) {
            // Update existing
            const updated = [...localConversations]
            updated[existingIndex] = {
              ...updated[existingIndex],
              messages: finalMessages,
            }
            set({ 
              activeConversationId: conversationId,
              localConversations: updated,
            })
          } else {
            // Create new local conversation
            const newConversation: LocalConversation = {
              id: conversationId,
              title,
              created_at: Math.floor(Date.now() / 1000),
              messages: finalMessages,
            }
            set({ 
              activeConversationId: conversationId,
              localConversations: [newConversation, ...localConversations],
            })
          }
        }
        
        set({ loading: false })
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ 
        localConversations: state.localConversations,
      }),
    }
  )
)
