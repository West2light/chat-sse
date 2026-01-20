export interface Conversation {
  id: string
  title: string
}
export interface ApiMessage {
  id: string
  conversation_id: string
  query: string
  answer: string
  created_at: number
}