"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import { MessageBubble } from "@/components/MessageBubble"
import { ChatInput } from "@/components/ChatInput"
import { X, MessageCircle } from "lucide-react"
import type { UIMessage } from "@/lib/types/chat-ui"

interface FloatingBubbleChatProps {
  isOpen: boolean
  onToggle: (open: boolean) => void
  messages?: UIMessage[]
  onSendMessage: (text: string) => void
  botIconUrl?: string
  botTitle?: string
}

export function FloatingBubbleChat({ 
  isOpen, 
  onToggle, 
  messages, 
  onSendMessage,
  botIconUrl,
  botTitle = "DTPOS AI"
}: FloatingBubbleChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])



  return (
    <>
      {!isOpen && (
        <button
          onClick={() => onToggle(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center z-40"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[32rem] bg-background rounded-2xl shadow-2xl border border-border flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="border-b border-border px-4 py-3 flex items-center justify-between bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-foreground/20 flex items-center justify-center">
                {botIconUrl ? (
                  <Image
                    src={botIconUrl}
                    alt={botTitle}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold">AI</span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{botTitle}</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <button
              onClick={() => onToggle(false)}
              className="p-1 hover:bg-primary-foreground/20 rounded-md transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {!messages || messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-foreground/60 text-sm text-center">Start a conversation</p>
              </div>
            ) : (
              <>
              {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} botIconUrl={botIconUrl} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border px-3 py-3">
            <ChatInput onSendMessage={onSendMessage} />
          </div>
        </div>
      )}
    </>
  )
}
