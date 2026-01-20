export interface UIMessage {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp?: number
}
