# 📋 BÁO CÁO PHÂN TÍCH PROJECT DTPOS AI CHAT
# Duong Quang Dong
## 📑 Mục lục
1. [Tổng quan Project](#1-tổng-quan-project)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Xử lý tách biệt tin nhắn User và Bot](#3-xử-lý-tách-biệt-tin-nhắn-user-và-bot)
4. [Proxy là gì và tại sao cần Proxy](#4-proxy-là-gì-và-tại-sao-cần-proxy)
5. [Xử lý link ảnh từ Backend](#5-xử-lý-link-ảnh-từ-backend)
6. [Quy trình xử lý API](#6-quy-trình-xử-lý-api)
7. [Luồng dữ liệu chi tiết](#7-luồng-dữ-liệu-chi-tiết)

---

## 1. Tổng quan Project

### 1.1 Mô tả
DTPOS AI Chat là ứng dụng chat bubble tích hợp AI, được xây dựng trên nền tảng:
- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS + Ant Design
- **Backend**: Dify AI API (ai-api.dtp-dev.site)
- **State Management**: Zustand với persist middleware

### 1.2 Cấu trúc thư mục chính
```
fe/
├── app/
│   ├── api/proxy/[...path]/    # Next.js API Proxy
│   └── page.tsx                 # Trang chính
├── components/
│   ├── FloatingBubbleChat.tsx   # Chat bubble component
│   ├── MessageBubble.tsx        # Hiển thị từng tin nhắn
│   ├── ChatInput.tsx            # Input gửi tin nhắn
│   └── SideBar.tsx              # Sidebar conversation list
├── stores/
│   ├── chat.store.ts            # State quản lý chat
│   ├── auth.store.ts            # State xác thực
│   └── site.store.ts            # State cấu hình site
└── services/
    ├── message.service.ts       # API service cho messages
    ├── conversation.service.ts  # API service cho conversations
    └── site.service.ts          # API service cho site config
```

---

## 2. Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  Components │───▶│   Stores    │───▶│     Services        │  │
│  │  (UI Layer) │    │  (Zustand)  │    │  (API Calls)        │  │
│  └─────────────┘    └─────────────┘    └──────────┬──────────┘  │
│                                                    │             │
│  ┌─────────────────────────────────────────────────▼──────────┐  │
│  │              Next.js API Proxy (/api/proxy/*)              │  │
│  │         - Inject Auth Headers (x-app-code, x-app-passport) │  │
│  │         - Handle CORS                                       │  │
│  │         - Support SSE Streaming                            │  │
│  └─────────────────────────────────────────────────┬──────────┘  │
└────────────────────────────────────────────────────┼─────────────┘
                                                     │
                                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Dify AI API)                         │
│                  https://ai-api.dtp-dev.site/api                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Endpoints:                                               │   │
│  │  - /site              → Thông tin site, icon_url          │   │
│  │  - /login/status      → Trạng thái đăng nhập              │   │
│  │  - /conversations     → Danh sách cuộc hội thoại          │   │
│  │  - /messages          → Tin nhắn trong conversation       │   │
│  │  - /chat-messages     → Gửi tin nhắn (SSE streaming)      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Xử lý tách biệt tin nhắn User và Bot

### 3.1 Ở Backend (BE)

Backend trả về tin nhắn với cấu trúc **kết hợp cả query (user) và answer (bot)** trong cùng một object:

```json
// Response từ GET /api/messages?conversation_id=xxx
{
  "data": [
    {
      "id": "6038bcae-fcea-41a8-b721-ed44da9354a5",
      "conversation_id": "58242be7-2b40-4e49-a953-7115f6626190",
      "query": "tét",                    // ← Tin nhắn USER
      "answer": "Xin lỗi, hiện tại...",  // ← Tin nhắn BOT
      "created_at": 1768209938,
      "status": "normal"
    }
  ]
}
```

**Đặc điểm BE:**
- Mỗi "message" chứa **cả câu hỏi (query) và câu trả lời (answer)**
- `query`: Nội dung người dùng gửi
- `answer`: Phản hồi từ AI bot
- `created_at`: Unix timestamp (giây)

### 3.2 Ở Frontend (FE)

Frontend cần **tách** mỗi API message thành **2 UI messages** riêng biệt:

```typescript
// Trong chat.store.ts - selectConversation()
const apiMessages = await getMessages(id)

const uiMessages: UIMessage[] = apiMessages.flatMap((m: ApiMessage) => [
  {
    id: `${m.id}-user`,           // ID riêng cho message user
    text: m.query,                // Lấy query làm text
    sender: "user" as const,      // Đánh dấu là user
    timestamp: m.created_at,
  },
  {
    id: `${m.id}-bot`,            // ID riêng cho message bot
    text: m.answer,               // Lấy answer làm text
    sender: "bot" as const,       // Đánh dấu là bot
    timestamp: m.created_at,
  },
])
```

### 3.3 Type Definitions

```typescript
// lib/types/chat.ts - Type từ API
interface ApiMessage {
  id: string
  conversation_id: string
  query: string              // User message
  answer: string             // Bot message
  created_at: number
  // ... other fields
}

// lib/types/chat-ui.ts - Type cho UI
interface UIMessage {
  id: string
  text: string
  sender: "user" | "bot"     // Phân biệt qua field này
  timestamp: number | Date
}
```

### 3.4 Hiển thị trong Component

```tsx
// MessageBubble.tsx
export function MessageBubble({ message, botIconUrl }: MessageBubbleProps) {
  const isUser = message.sender === "user"  // Phân biệt user/bot
  
  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Bot Avatar - chỉ hiển thị nếu là bot */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full">
          <img src={botIconUrl} alt="Bot" />
        </div>
      )}
      
      {/* Message Bubble - style khác nhau cho user/bot */}
      <div className={`rounded-2xl ${
        isUser
          ? "bg-primary text-primary-foreground rounded-br-none"
          : "bg-secondary text-secondary-foreground rounded-bl-none"
      }`}>
        {message.text}
      </div>
      
      {/* User Avatar - chỉ hiển thị nếu là user */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary">U</div>
      )}
    </div>
  )
}
```

### 3.5 Streaming Real-time (SSE)

Khi gửi tin nhắn mới, FE tạo **2 messages ngay lập tức**:

```typescript
// chat.store.ts - send()
const userMessage: UIMessage = {
  id: `user-${Date.now()}`,
  text: text,                    // Text user vừa nhập
  sender: "user",
  timestamp: Math.floor(Date.now() / 1000),
}

const botMessage: UIMessage = {
  id: `bot-${Date.now()}`,
  text: "",                      // Empty → hiển thị typing indicator
  sender: "bot",
  timestamp: Math.floor(Date.now() / 1000),
}

// Thêm cả 2 vào state
set({ messages: [...currentMessages, userMessage, botMessage] })

// Stream SSE cập nhật botMessage.text dần dần
await sendMessageStream(text, conversationId, (streamedText) => {
  set((state) => ({
    messages: state.messages.map((m) =>
      m.id === botMessage.id ? { ...m, text: streamedText } : m
    ),
  }))
})
```

---

## 4. Proxy là gì và tại sao cần Proxy

### 4.1 Proxy là gì?

**Proxy** (hay Proxy Server) là một server trung gian đứng giữa client (FE) và server đích (BE). Thay vì FE gọi trực tiếp đến BE, FE gọi đến Proxy, và Proxy sẽ chuyển tiếp request đến BE.

```
┌──────────┐        ┌──────────────────┐        ┌─────────────────┐
│  Browser │───────▶│  Next.js Proxy   │───────▶│  Dify AI API    │
│  (FE)    │◀───────│  /api/proxy/*    │◀───────│  Backend        │
└──────────┘        └──────────────────┘        └─────────────────┘
     │                      │
     │  localhost:3000      │  ai-api.dtp-dev.site
     │                      │
     └──────────────────────┘
        Same Origin ✅
```

### 4.2 Tại sao cần Proxy?

#### Vấn đề 1: CORS (Cross-Origin Resource Sharing)

**Không có Proxy:**
```
Browser (localhost:3000) ──▶ ai-api.dtp-dev.site
                              │
                              ▼
                    ❌ CORS Error!
                    "Access-Control-Allow-Origin" header missing
```

Browser chặn request từ `localhost:3000` đến `ai-api.dtp-dev.site` vì:
- Khác **origin** (protocol + domain + port)
- BE không set header `Access-Control-Allow-Origin`

**Có Proxy:**
```
Browser (localhost:3000) ──▶ localhost:3000/api/proxy ──▶ ai-api.dtp-dev.site
        Same Origin ✅              Server-to-Server ✅
                                    (Không bị CORS)
```

- Browser gọi đến cùng origin (`localhost:3000`) → **Không bị CORS**
- Proxy server gọi đến BE → **Server-to-server không bị CORS**

#### Vấn đề 2: Bảo mật Auth Headers

Backend yêu cầu headers xác thực:
- `x-app-code`: Mã ứng dụng
- `x-app-passport`: JWT token

**Nếu không có Proxy:**
- Phải lưu credentials ở client-side (browser)
- Credentials bị exposed trong Network tab DevTools
- Dễ bị đánh cắp

**Với Proxy:**
- Credentials lưu ở server-side (`.env` file)
- Proxy tự động inject headers trước khi gọi BE
- Client không biết và không thể thấy credentials

```typescript
// app/api/proxy/[...path]/route.ts
const headers: HeadersInit = {
  "Content-Type": contentType,
  "x-app-code": process.env.NEXT_PUBLIC_APP_CODE!,        // Server-side only
  "x-app-passport": process.env.NEXT_PUBLIC_APP_PASSPORT!, // Server-side only
}
```

#### Vấn đề 3: SSE Streaming Support

Backend trả về SSE (Server-Sent Events) cho chat streaming. Proxy cần xử lý đặc biệt:

```typescript
// Detect SSE response
if (contentType?.includes("text/event-stream")) {
  // Stream response directly without buffering
  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}
```

### 4.3 Cách Proxy hoạt động

```typescript
// app/api/proxy/[...path]/route.ts

export async function GET(request: NextRequest, context: Context) {
  // 1. Lấy path từ URL
  const pathArray = await context.params
  const path = pathArray.path.join("/")  // "site", "conversations", etc.
  
  // 2. Lấy query params
  const searchParams = request.nextUrl.searchParams.toString()
  
  // 3. Tạo URL đến BE
  const targetUrl = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ""}`
  // → https://ai-api.dtp-dev.site/api/site
  
  // 4. Gọi BE với auth headers
  const response = await fetch(targetUrl, {
    method: "GET",
    headers: {
      "x-app-code": process.env.NEXT_PUBLIC_APP_CODE!,
      "x-app-passport": process.env.NEXT_PUBLIC_APP_PASSPORT!,
    },
  })
  
  // 5. Trả response về client
  return Response.json(await response.json())
}
```

### 4.4 URL Mapping

| Frontend gọi | Proxy chuyển đến |
|--------------|------------------|
| `/api/proxy/site` | `https://ai-api.dtp-dev.site/api/site` |
| `/api/proxy/conversations?limit=100` | `https://ai-api.dtp-dev.site/api/conversations?limit=100` |
| `/api/proxy/messages?conversation_id=xxx` | `https://ai-api.dtp-dev.site/api/messages?conversation_id=xxx` |
| `/api/proxy/chat-messages` (POST) | `https://ai-api.dtp-dev.site/api/chat-messages` |

---

## 5. Xử lý link ảnh từ Backend

### 5.1 Response từ BE

API `/api/site` trả về thông tin icon:

```json
{
  "site": {
    "title": "DTPOS AI",
    "icon_type": "image",
    "icon": "eb61b7fd-0bd0-48d7-b1dd-245171249a4f",
    "icon_url": "https://dify-api.dtp-dev.site//files/eb61b7fd-0bd0-48d7-b1dd-245171249a4f/file-preview?timestamp=1768211335&nonce=f457890b08227fc5824c4c9ddb0dd541&sign=dChR5XkCCbsxk7wjwpX3d3CljxUB68zz0TqkcLimRFU%3D",
    "icon_background": "#FFEAD5"
  }
}
```

**Lưu ý về `icon_url`:**
- URL có chứa signature (`sign=...`) và timestamp
- URL có thể hết hạn
- URL từ domain khác (`dify-api.dtp-dev.site`)

### 5.2 Lưu trữ trong Store

```typescript
// stores/site.store.ts
interface SiteState {
  iconUrl?: string
  title?: string
  description?: string
  fetchSiteConfig: () => Promise<void>
}

export const useSiteStore = create<SiteState>((set) => ({
  iconUrl: undefined,
  title: undefined,
  description: undefined,

  fetchSiteConfig: async () => {
    const data = await getSiteConfig()
    set({
      iconUrl: data.site?.icon_url,      // Lấy icon_url từ response
      title: data.site?.title,
      description: data.site?.description,
    })
  },
}))
```

### 5.3 Sử dụng trong Components

```tsx
// page.tsx - Fetch và truyền xuống components
const { iconUrl, title, fetchSiteConfig } = useSiteStore()

useEffect(() => {
  fetchSiteConfig()
}, [])

return (
  <>
    <Sidebar botIconUrl={iconUrl} botTitle={title} />
    <FloatingBubbleChat botIconUrl={iconUrl} botTitle={title} />
  </>
)
```

### 5.4 Hiển thị ảnh với Fallback

```tsx
// MessageBubble.tsx
<div className="w-8 h-8 rounded-full overflow-hidden bg-secondary">
  {botIconUrl ? (
    <img
      src={botIconUrl}
      alt="Bot"
      className="w-full h-full object-cover"
      onError={(e) => {
        // Fallback nếu ảnh lỗi
        e.currentTarget.style.display = 'none'
        e.currentTarget.nextElementSibling?.classList.remove('hidden')
      }}
    />
  ) : null}
  {/* Fallback text */}
  <div className={`... ${botIconUrl ? 'hidden' : ''}`}>
    AI
  </div>
</div>
```

### 5.5 Cấu hình Next.js cho Remote Images

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ai-api.dtp-dev.site',
      },
      {
        protocol: 'https',
        hostname: 'dify-api.dtp-dev.site',
      },
    ],
  },
}
```

---

## 6. Quy trình xử lý API

### 6.1 Khởi tạo ứng dụng

```
┌─────────────────────────────────────────────────────────────────┐
│                    App Initialization Flow                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. page.tsx mounts                                              │
│         │                                                        │
│         ▼                                                        │
│  2. Call login() ──────────▶ GET /api/proxy/login/status         │
│         │                           │                            │
│         │                           ▼                            │
│         │                    { logged_in: true }                 │
│         ▼                                                        │
│  3. Call fetchSiteConfig() ▶ GET /api/proxy/site                 │
│         │                           │                            │
│         │                           ▼                            │
│         │                    { site: { icon_url, title } }       │
│         ▼                                                        │
│  4. Call fetchConversations() ▶ GET /api/proxy/conversations     │
│         │                           │                            │
│         │                           ▼                            │
│         │                    { data: [...conversations] }        │
│         ▼                                                        │
│  5. Render UI with data                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Chọn Conversation

```
User clicks conversation
        │
        ▼
selectConversation(id)
        │
        ▼
GET /api/proxy/messages?conversation_id={id}&limit=20
        │
        ▼
┌───────────────────────────────────────────────┐
│ Response:                                      │
│ {                                              │
│   "data": [                                    │
│     { "query": "Hello", "answer": "Hi!" },     │
│     { "query": "Test", "answer": "Response" }  │
│   ]                                            │
│ }                                              │
└───────────────────────────────────────────────┘
        │
        ▼
Transform to UIMessages:
[
  { sender: "user", text: "Hello" },
  { sender: "bot", text: "Hi!" },
  { sender: "user", text: "Test" },
  { sender: "bot", text: "Response" }
]
        │
        ▼
Update state → Re-render UI
```

### 6.3 Gửi tin nhắn mới (SSE Streaming)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Send Message Flow (SSE)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User types "Xin chào" → Click Send                              │
│         │                                                        │
│         ▼                                                        │
│  1. Add user message to state immediately                        │
│     messages: [..., { sender: "user", text: "Xin chào" }]       │
│         │                                                        │
│         ▼                                                        │
│  2. Add empty bot message (typing indicator)                     │
│     messages: [..., { sender: "bot", text: "" }]                │
│         │                                                        │
│         ▼                                                        │
│  3. POST /api/proxy/chat-messages                                │
│     Body: {                                                      │
│       "query": "Xin chào",                                       │
│       "conversation_id": "xxx",                                  │
│       "response_mode": "streaming"                               │
│     }                                                            │
│         │                                                        │
│         ▼                                                        │
│  4. Server returns SSE stream:                                   │
│     data: {"event": "message", "answer": "Xin"}                 │
│     data: {"event": "message", "answer": "Xin chào"}            │
│     data: {"event": "message", "answer": "Xin chào bạn"}        │
│     data: {"event": "message_end", "conversation_id": "xxx"}    │
│         │                                                        │
│         ▼                                                        │
│  5. Update bot message progressively:                            │
│     text: "" → "Xin" → "Xin chào" → "Xin chào bạn"             │
│         │                                                        │
│         ▼                                                        │
│  6. On "message_end":                                            │
│     - Save to localConversations                                 │
│     - Update conversation_id if new chat                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 SSE Parsing Detail

```typescript
// services/message.service.ts
export async function sendMessageStream(
  query: string,
  conversationId?: string,
  onMessage?: (text: string, isComplete: boolean) => void,
  onError?: (error: Error) => void
) {
  const response = await fetch("/api/proxy/chat-messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      conversation_id: conversationId || "",
      response_mode: "streaming",
    }),
  })

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let fullText = ""
  let resultConversationId = conversationId

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split("\n")

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = JSON.parse(line.slice(6))
        
        if (data.event === "message") {
          fullText = data.answer  // Cập nhật text
          onMessage?.(fullText, false)
        }
        
        if (data.event === "message_end") {
          resultConversationId = data.conversation_id
          onMessage?.(fullText, true)  // Hoàn thành
        }
      }
    }
  }

  return { conversation_id: resultConversationId }
}
```

---

## 7. Luồng dữ liệu chi tiết

### 7.1 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐                                                       │
│   │   Backend    │                                                       │
│   │   (Dify AI)  │                                                       │
│   └──────┬───────┘                                                       │
│          │                                                               │
│          │ API Response (JSON/SSE)                                       │
│          ▼                                                               │
│   ┌──────────────┐         ┌──────────────┐                             │
│   │    Proxy     │────────▶│   Services   │                             │
│   │  (route.ts)  │         │  (.service)  │                             │
│   └──────────────┘         └──────┬───────┘                             │
│                                   │                                      │
│                                   │ Transformed Data                     │
│                                   ▼                                      │
│                            ┌──────────────┐                             │
│                            │    Stores    │                             │
│                            │   (Zustand)  │                             │
│                            └──────┬───────┘                             │
│                                   │                                      │
│                                   │ State                                │
│                                   ▼                                      │
│   ┌──────────────┐         ┌──────────────┐         ┌──────────────┐   │
│   │   SideBar    │◀────────│   page.tsx   │────────▶│ BubbleChat   │   │
│   │              │         │              │         │              │   │
│   └──────────────┘         └──────────────┘         └──────┬───────┘   │
│                                                            │            │
│                                   ┌────────────────────────┼────────┐   │
│                                   │                        │        │   │
│                                   ▼                        ▼        │   │
│                            ┌──────────────┐         ┌────────────┐ │   │
│                            │ MessageBubble│         │ ChatInput  │ │   │
│                            │              │         │            │ │   │
│                            └──────────────┘         └────────────┘ │   │
│                                                                    │   │
└────────────────────────────────────────────────────────────────────┘   │
                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 State Structure

```typescript
// Zustand Stores

// chat.store.ts
{
  conversations: Conversation[],      // Từ API /conversations
  localConversations: LocalConversation[], // Lưu local (persist)
  messages: UIMessage[],              // Tin nhắn hiện tại
  activeConversationId?: string,
  loading: boolean,
}

// site.store.ts
{
  iconUrl?: string,    // Từ API /site → site.icon_url
  title?: string,      // Từ API /site → site.title
  description?: string,
}

// auth.store.ts
{
  isLoggedIn: boolean,      // Từ API /login/status
  isAppLoggedIn: boolean,
  loading: boolean,
}
```

### 7.3 Component Props Flow

```
page.tsx
│
├── useChatStore() → { messages, conversations, send, ... }
├── useSiteStore() → { iconUrl, title }
│
└── Render:
    │
    ├── <Sidebar
    │     conversations={allConversations}
    │     botIconUrl={iconUrl}
    │     botTitle={title}
    │     onNewChat={handleNewChat}
    │     onSelectConversation={handleSelectConversation}
    │   />
    │
    └── <FloatingBubbleChat
          messages={messages}
          botIconUrl={iconUrl}
          botTitle={title}
          onSendMessage={handleSendMessage}
        />
        │
        └── <MessageBubble
              message={message}
              botIconUrl={botIconUrl}
            />
```

---

## 📝 Tổng kết

| Vấn đề | Giải pháp |
|--------|-----------|
| **Tách User/Bot messages** | FE transform 1 API message → 2 UI messages dựa vào `query`/`answer` |
| **CORS** | Next.js API Proxy làm trung gian |
| **Auth Headers** | Proxy inject `x-app-code`, `x-app-passport` từ env |
| **SSE Streaming** | Proxy forward stream, FE parse từng chunk |
| **Bot Avatar** | Lấy `icon_url` từ `/site` API, fallback "AI" nếu lỗi |
| **Real-time typing** | Empty bot message text → 3-dot animation |

---

*Báo cáo được tạo ngày: 20/01/2026*

