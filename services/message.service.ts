import { apiClient } from "@/lib/axios/client"
import { handleAxiosError } from "@/lib/axios/error"

export async function getMessages(conversationId: string) {
  try {
    const res = await apiClient.get("/messages", {
      params: {
        conversation_id: conversationId,
        limit: 20,
        last_id: "",
      },
    })
    return res.data.data
  } catch (err) {
    throw handleAxiosError(err)
  }
}

// Non-streaming version (fallback)
export async function sendMessage(query: string, conversationId?: string) {
  try {
    const res = await apiClient.post("/chat-messages", {
      query,
      conversation_id: conversationId,
      response_mode: "blocking",
      inputs: {},
    })
    return res.data
  } catch (err) {
    throw handleAxiosError(err)
  }
}

// SSE Streaming version
export async function sendMessageStream(
  query: string,
  conversationId: string | undefined,
  onChunk: (text: string, isComplete: boolean) => void,
  onError?: (err: unknown) => void
): Promise<{ conversation_id: string; message_id: string } | null> {
  const API_URL = process.env.NEXT_PUBLIC_AI_API_URL || ''
  const APP_CODE = process.env.NEXT_PUBLIC_APP_CODE || ''
  const APP_PASSPORT = process.env.NEXT_PUBLIC_APP_PASSPORT || ''
  
  // Use proxy in development
  const baseUrl = typeof window !== 'undefined' && process.env.NODE_ENV === 'development'
    ? '/api/proxy'
    : API_URL

  const url = `${baseUrl}/chat-messages`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'x-app-code': APP_CODE,
        'x-app-passport': APP_PASSPORT,
      },
      body: JSON.stringify({
        query,
        conversation_id: conversationId || '',
        response_mode: 'streaming',
        inputs: {},
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('No response body')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let fullAnswer = ''
    let resultConversationId = conversationId || ''
    let messageId = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '' || data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            
            if (parsed.event === 'message') {
              fullAnswer += parsed.answer || ''
              onChunk(fullAnswer, false)
            } else if (parsed.event === 'message_end') {
              resultConversationId = parsed.conversation_id || resultConversationId
              messageId = parsed.message_id || messageId
              onChunk(fullAnswer, true)
            } else if (parsed.answer) {
              // Direct answer chunk
              fullAnswer += parsed.answer
              onChunk(fullAnswer, false)
            }
            
            // Capture conversation_id from any event
            if (parsed.conversation_id) {
              resultConversationId = parsed.conversation_id
            }
            if (parsed.message_id) {
              messageId = parsed.message_id
            }
          } catch (e) {
            // Ignore parse errors for malformed chunks
          }
        }
      }
    }

    return { conversation_id: resultConversationId, message_id: messageId }
  } catch (err) {
    onError?.(err)
    return null
  }
}
