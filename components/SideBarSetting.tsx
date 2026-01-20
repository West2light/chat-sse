import { Dropdown, Segmented, Tooltip } from "antd"
import {
  SettingOutlined,
  DesktopOutlined,
  SunOutlined,
  MoonOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons"
import { useState } from "react"

type ThemeMode = "system" | "light" | "dark"

interface SidebarSettingsProps {
  collapsed?: boolean
}

export function SidebarSettings({ collapsed = false }: SidebarSettingsProps) {
  const [theme, setTheme] = useState<ThemeMode>("system")

  const handleThemeChange = (value: ThemeMode) => {
    setTheme(value)

    const root = document.documentElement
    if (value === "dark") root.classList.add("dark")
    else root.classList.remove("dark")
  }

  const triggerButton = collapsed ? (
    <Tooltip title="Cài đặt" placement="right">
      <button
        className="
          p-2 rounded-md
          text-sidebar-foreground
          hover:bg-sidebar-accent
          transition-colors
        "
      >
        <SettingOutlined />
      </button>
    </Tooltip>
  ) : (
    <button
      className="
        w-full flex items-center gap-2
        px-3 py-2 rounded-md
        text-sidebar-foreground
        hover:bg-sidebar-accent
        transition-colors
      "
    >
      <SettingOutlined />
      <span className="text-sm">Settings</span>
    </button>
  )

  return (
    <div className={collapsed ? "flex justify-center" : "p-2"}>
      <Dropdown
        trigger={["click"]}
        placement="topLeft"
        popupRender={() => (
          <div
            className="
              w-64 rounded-xl
              bg-popover text-popover-foreground
              border border-border
              shadow-lg
              p-3
              space-y-3
            "
          >
            {/* Theme row */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Theme</span>

              {/* Segmented wrapped in its own surface */}
              <div
                className="
                  rounded-lg
                  bg-muted
                  p-1
                "
              >
                <Segmented
                  size="small"
                  value={theme}
                  onChange={handleThemeChange}
                  options={[
                    { value: "system", icon: <DesktopOutlined /> },
                    { value: "light", icon: <SunOutlined /> },
                    { value: "dark", icon: <MoonOutlined /> },
                  ]}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* About */}
            <button
              className="
                w-full flex items-center gap-2
                px-2 py-2 rounded-md
                text-sm
                hover:bg-muted
                transition-colors
              "
            >
              <InfoCircleOutlined />
              About
            </button>
          </div>
        )}
      >
        {triggerButton}
      </Dropdown>
    </div>
  )
}
