import { create } from "zustand"
import type { Conversation } from "@/lib/types/conversation"
import { getPinnedConversations } from "@/services/conversation.service"

interface ConversationState {
  conversations: Conversation[]
  loading: boolean
  error?: string
  fetchPinned: () => Promise<void>
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  loading: false,

  fetchPinned: async () => {
    set({ loading: true, error: undefined })
    try {
      const data = await getPinnedConversations()
      set({ conversations: data, loading: false })
    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  },
}))
