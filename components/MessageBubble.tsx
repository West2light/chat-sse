import type { UIMessage } from "@/lib/types/chat-ui"

interface MessageBubbleProps {
  message: UIMessage
  botIconUrl?: string
}

export function MessageBubble({ message, botIconUrl }: MessageBubbleProps) {
  const isUser = message.sender === "user"
  const isTyping = !isUser && message.text === ""

  // Handle timestamp - can be number (unix) or Date or undefined
  const formatTime = (timestamp?: number | Date) => {
    if (!timestamp) return ""
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : timestamp
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Bot Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-secondary">
          {botIconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={botIconUrl}
              alt="Bot"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center text-xs font-bold text-secondary-foreground ${botIconUrl ? 'hidden' : ''}`}>
            AI
          </div>
        </div>
      )}
      
      <div
        className={`max-w-sm lg:max-w-md px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-secondary text-secondary-foreground rounded-bl-none"
        }`}
      >
        {isTyping ? (
          <div className="flex items-center gap-1 py-1">
            <span className="w-2 h-2 bg-secondary-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-secondary-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-secondary-foreground/60 rounded-full animate-bounce"></span>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
            {message.timestamp && (
              <p className={`text-xs mt-1 ${isUser ? "text-primary-foreground/70" : "text-secondary-foreground/70"}`}>
                {formatTime(message.timestamp)}
              </p>
            )}
          </>
        )}
      </div>
      
      {/* User Avatar placeholder */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
          U
        </div>
      )}
    </div>
  )
}
