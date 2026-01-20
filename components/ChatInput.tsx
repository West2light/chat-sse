"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "antd"
import { Send } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (text: string) => void
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input)
      setInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Talk to DTPOS AI"
        className="flex-1 h-10 px-4 rounded-lg bg-input text-foreground placeholder:text-foreground/60 border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
      />
      <Button
        onClick={handleSend}
        disabled={!input.trim()}
        className="h-10 w-10 !p-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  )
}
