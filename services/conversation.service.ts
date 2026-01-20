import { apiClient } from "@/lib/axios/client"
import { handleAxiosError } from "@/lib/axios/error"
import type { Conversation } from "@/lib/types/conversation"

export async function getPinnedConversations() {
  try {
    const res = await apiClient.get<{
      data: Conversation[]
    }>("/conversations", {
      params: {
        pinned: true,
        limit: 100,
      },
    })
    return res.data.data
  } catch (error) {
    throw handleAxiosError(error)
  }
}
