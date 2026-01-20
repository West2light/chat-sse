"use client"

import { useRef, useEffect, useState } from "react"
import { MessageBubble } from "@/components/MessageBubble"
import { ChatInput } from "@/components/ChatInput"
import type { Conversation } from "@/lib/types"

interface ChatAreaProps {
  conversation?: Conversation
  onSendMessage: (text: string) => void
}

export function ChatArea({ conversation, onSendMessage }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({})

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-foreground/60">Select a conversation to start</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
            DTP
          </div>
          <div>
            <h2 className="text-foreground font-semibold">DTPOS AI</h2>
            <p className="text-xs text-foreground/60">Online</p>
          </div>
        </div>
        <button className="text-foreground/60 hover:text-foreground transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.5 1.5H9.5V9.5H1.5V10.5H9.5V18.5H10.5V10.5H18.5V9.5H10.5V1.5Z"
            />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-foreground/60">Start a new conversation</p>
          </div>
        ) : (
          <>
            {conversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border px-6 py-4">
        <ChatInput onSendMessage={onSendMessage} />
      </div>
    </div>
  )
}
