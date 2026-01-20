"use client"

import { useState } from "react"
import { Button, Tooltip } from "antd"
import { Plus, PanelLeftClose, PanelLeft, MessageSquare } from "lucide-react"
import type { Conversation } from "@/lib/types/chat"
import { SidebarSettings } from "./SideBarSetting"

interface SidebarProps {
  conversations: Conversation[]
  activeConversationId: string
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  botIconUrl?: string
  botTitle?: string
}

export function Sidebar({ conversations, activeConversationId, onSelectConversation, onNewChat, botIconUrl, botTitle = "DTPOS AI" }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  if (collapsed) {
    return (
      <div className="w-16 h-screen bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-4">
        {/* Collapsed logo */}
        <div className="w-8 h-8 rounded overflow-hidden bg-primary flex items-center justify-center">
          {botIconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={botIconUrl} alt={botTitle} className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary-foreground font-bold text-sm">DTP</span>
          )}
        </div>
        <Tooltip title="Mở sidebar" placement="right">
          <Button
            type="text"
            icon={<PanelLeft className="w-5 h-5" />}
            onClick={() => setCollapsed(false)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          />
        </Tooltip>
        <Tooltip title="Chat mới" placement="right">
          <Button
            type="primary"
            icon={<Plus className="w-5 h-5" />}
            onClick={onNewChat}
            className="bg-primary"
          />
        </Tooltip>
        <div className="flex-1 overflow-y-auto w-full flex flex-col items-center gap-1 py-2">
          {conversations.slice(0, 10).map((conversation) => (
            <Tooltip key={conversation.id} title={conversation.title} placement="right">
              <Button
                type="text"
                icon={<MessageSquare className="w-4 h-4" />}
                onClick={() => onSelectConversation(conversation.id)}
                className={`${
                  activeConversationId === conversation.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              />
            </Tooltip>
          ))}
        </div>
        <SidebarSettings collapsed />
      </div>
    )
  }

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded overflow-hidden bg-primary flex items-center justify-center">
              {botIconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={botIconUrl} alt={botTitle} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary-foreground font-bold text-sm">DTP</span>
              )}
            </div>
            <span className="font-semibold text-sidebar-foreground">{botTitle}</span>
          </div>
          <Tooltip title="Thu gọn sidebar">
            <Button
              type="text"
              icon={<PanelLeftClose className="w-5 h-5" />}
              onClick={() => setCollapsed(true)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            />
          </Tooltip>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          type="primary"
          onClick={onNewChat}
          icon={<Plus className="w-4 h-4" />}
          className="w-full flex items-center justify-center gap-2 bg-primary"
        >
          Start New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase mb-3">Conversations</h3>
          <div className="space-y-1">
            {conversations.length === 0 ? (
              <p className="text-xs text-sidebar-foreground/50 text-center py-4">Chưa có cuộc trò chuyện</p>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors truncate ${
                    activeConversationId === conversation.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                  title={conversation.title}
                >
                  {conversation.title}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer with Theme Toggle */}
      <SidebarSettings />
    </div>
  )
}
